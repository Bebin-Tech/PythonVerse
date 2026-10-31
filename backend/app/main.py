import os
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, String, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session
from sqlalchemy.exc import IntegrityError
from pwdlib import PasswordHash
import jwt

SECRET = os.environ.get('JWT_SECRET')
if not SECRET or len(SECRET) < 32:
    raise RuntimeError('Set JWT_SECRET to a random value of at least 32 characters')
engine = create_engine(os.environ.get('DATABASE_URL', 'sqlite:///./pythonverse.db'))
class Base(DeclarativeBase): pass
class User(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default='student')
    xp: Mapped[int] = mapped_column(default=0)
    coins: Mapped[int] = mapped_column(default=0)
Base.metadata.create_all(engine)
app = FastAPI(title='PYTHONVERSE API')
hasher = PasswordHash.recommended()
bearer = HTTPBearer()
class Credentials(BaseModel):
    username: str = Field(min_length=3, max_length=40, pattern=r'^[a-zA-Z0-9_]+$')
    password: str = Field(min_length=10, max_length=128)
def session():
    with Session(engine) as db: yield db
def current(auth: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(session)):
    try:
        payload = jwt.decode(auth.credentials, SECRET, algorithms=['HS256'], options={'require':['exp','sub']})
        user = db.get(User, int(payload['sub']))
        if not user: raise ValueError()
        return user
    except (jwt.PyJWTError, ValueError): raise HTTPException(401, 'Invalid or expired session')
def token(user):
    return {'access_token': jwt.encode({'sub':str(user.id), 'exp':datetime.now(timezone.utc)+timedelta(hours=8)}, SECRET, algorithm='HS256'), 'token_type':'bearer'}
@app.get('/api/health')
def health(): return {'status':'ok'}
@app.post('/api/auth/register', status_code=201)
def register(data: Credentials, db: Session = Depends(session)):
    user = User(username=data.username.lower(), password_hash=hasher.hash(data.password))
    db.add(user)
    try: db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, 'Username already exists')
    db.refresh(user)
    return token(user)
@app.post('/api/auth/login')
def login(data: Credentials, db: Session = Depends(session)):
    user = db.scalar(select(User).where(User.username == data.username.lower()))
    if not user or not hasher.verify(data.password, user.password_hash): raise HTTPException(401, 'Invalid credentials')
    return token(user)
@app.get('/api/me')
def me(user: User = Depends(current), db: Session = Depends(session)):
    checks = len(list(db.scalars(select(Progress).where(Progress.user_id == user.id))))
    xp = checks * 20
    return {'username':user.username,'role':user.role,'xp':xp,'coins':user.coins,'level':1+xp//200}

# Learning content and completion are stored independently of user accounts.
from sqlalchemy import ForeignKey, UniqueConstraint, JSON
from .curriculum import LESSONS
class Lesson(Base):
    __tablename__ = 'lessons'
    id: Mapped[int] = mapped_column(primary_key=True)
    content: Mapped[dict] = mapped_column(JSON)
class Progress(Base):
    __tablename__ = 'lesson_progress'
    __table_args__ = (UniqueConstraint('user_id','lesson_id'),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), index=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey('lessons.id'))
    completed_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
Base.metadata.create_all(engine)
with Session(engine) as db:
    for content in LESSONS:
        existing = db.get(Lesson, content['day'])
        if existing: existing.content = content
        else: db.add(Lesson(id=content['day'],content=content))
    db.commit()
@app.get('/api/lessons')
def lessons(db: Session = Depends(session)):
    return [{k:v for k,v in lesson.content.items() if k != 'answer'} for lesson in db.scalars(select(Lesson).order_by(Lesson.id))]
@app.get('/api/progress')
def progress(user: User = Depends(current), db: Session = Depends(session)):
    return {'completed':[p.lesson_id for p in db.scalars(select(Progress).where(Progress.user_id==user.id))]}
class Assessment(BaseModel):
    answer: int = Field(ge=0,le=2)
@app.post('/api/lessons/{day}/assess')
def assess(day:int, data:Assessment, user:User=Depends(current), db:Session=Depends(session)):
    lesson=db.get(Lesson,day)
    if not lesson: raise HTTPException(404,'Lesson not found')
    if data.answer != lesson.content['answer']: return {'passed':False,'message':'Try again. Revisit the explanation and example.'}
    existing=db.scalar(select(Progress).where(Progress.user_id==user.id,Progress.lesson_id==day))
    if not existing:
        db.add(Progress(user_id=user.id,lesson_id=day))
        try: db.commit()
        except IntegrityError: db.rollback()
    return {'passed':True,'message':'Knowledge check passed. Progress saved.'}

from zoneinfo import ZoneInfo
@app.get('/api/dashboard')
def dashboard(user:User=Depends(current), db:Session=Depends(session)):
    records=list(db.scalars(select(Progress).where(Progress.user_id==user.id).order_by(Progress.completed_at)))
    completed={p.lesson_id for p in records}
    today=datetime.now(ZoneInfo('Asia/Kolkata')).date()
    dates=[]
    for record in records:
        stamp=record.completed_at
        if stamp.tzinfo is None: stamp=stamp.replace(tzinfo=timezone.utc)
        dates.append(stamp.astimezone(ZoneInfo('Asia/Kolkata')).date())
    active=set(dates)
    cursor=today if today in active else today-timedelta(days=1)
    streak=0
    while cursor in active:
        streak+=1
        cursor-=timedelta(days=1)
    next_day=next((i for i in range(1,31) if i not in completed),None)
    xp=len(completed)*20
    badges=[]
    if completed: badges.append('First Knowledge Crystal')
    for end,title in [(5,'Python Beginner'),(10,'Data Explorer'),(15,'Logic Explorer'),(20,'Function Expert'),(25,'Castle Scholar'),(30,'30-Day Scholar')]:
        if all(i in completed for i in range(end-4,end+1)): badges.append(title)
    return {'username':user.username,'xp':xp,'coins':0,'level':1+xp//200,'completed':sorted(completed),'total_lessons':db.query(Lesson).count(),'next_day':next_day,'world':min(6,((next_day or 30)-1)//5+1),'streak':streak,'achievements':badges,'weekly':[{'date':str(today-timedelta(days=i)),'checks':dates.count(today-timedelta(days=i))} for i in range(6,-1,-1)],'history':[{'day':p.lesson_id,'completed_at':p.completed_at.isoformat()} for p in records]}


class GameProgress(Base):
    __tablename__='game_progress'
    __table_args__=(UniqueConstraint('user_id','day'),)
    id:Mapped[int]=mapped_column(primary_key=True)
    user_id:Mapped[int]=mapped_column(ForeignKey('users.id'),index=True)
    day:Mapped[int]=mapped_column()
    crystals:Mapped[int]=mapped_column(default=0)
Base.metadata.create_all(engine)
class GameSave(BaseModel):
    day:int=Field(ge=1,le=30)
    crystals:int=Field(ge=0,le=5)
@app.post('/api/game-progress')
def save_game(data:GameSave,user:User=Depends(current),db:Session=Depends(session)):
    row=db.scalar(select(GameProgress).where(GameProgress.user_id==user.id,GameProgress.day==data.day))
    if row: row.crystals=max(row.crystals,data.crystals)
    else: db.add(GameProgress(user_id=user.id,day=data.day,crystals=data.crystals))
    try: db.commit()
    except IntegrityError: db.rollback()
    return {'saved':True,'ranked':False}
@app.get('/api/game-progress')
def game_progress(user:User=Depends(current),db:Session=Depends(session)):
    return [{'day':p.day,'crystals':p.crystals} for p in db.scalars(select(GameProgress).where(GameProgress.user_id==user.id))]
