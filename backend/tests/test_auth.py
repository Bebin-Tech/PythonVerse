import os
import tempfile
os.environ['JWT_SECRET'] = 'test-secret-only-' * 4
os.environ['DATABASE_URL'] = 'sqlite:///' + tempfile.mktemp(suffix='.db')
from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)
def test_auth_lifecycle():
    data = {'username':'explorer','password':'strong-password-123'}
    response = client.post('/api/auth/register', json=data)
    assert response.status_code == 201
    token = response.json()['access_token']
    profile = client.get('/api/me', headers={'Authorization':'Bearer '+token})
    assert profile.status_code == 200
    assert profile.json()['xp'] == 0
    assert client.post('/api/auth/register', json=data).status_code == 409
    assert client.post('/api/auth/login', json=data).status_code == 200
    assert client.post('/api/auth/login', json={**data,'password':'wrong-password'}).status_code == 401
    assert client.get('/api/me').status_code in (401,403)
    assert client.get('/api/me',headers={'Authorization':'Bearer invalid'}).status_code == 401

def test_validation():
    assert client.post('/api/auth/register',json={'username':'x','password':'short'}).status_code == 422

def test_learning_progress():
    credentials={'username':'learner','password':'learning-password-123'}
    token=client.post('/api/auth/register',json=credentials).json()['access_token']
    headers={'Authorization':'Bearer '+token}
    lessons=client.get('/api/lessons').json()
    assert len(lessons)==30
    assert all(l['en'] and l['ta'] and 'answer' not in l for l in lessons)
    assert client.post('/api/lessons/1/assess',json={'answer':1},headers=headers).json()['passed'] is False
    assert client.get('/api/progress',headers=headers).json()['completed']==[]
    for _ in range(2):
        assert client.post('/api/lessons/1/assess',json={'answer':0},headers=headers).json()['passed']
    assert client.get('/api/progress',headers=headers).json()['completed']==[1]
    assert client.post('/api/lessons/99/assess',json={'answer':0},headers=headers).status_code==404
    assert client.post('/api/lessons/1/assess',json={'answer':0}).status_code in (401,403)


def test_curriculum_examples_and_dashboard():
    import contextlib, io
    from app.curriculum import LESSONS
    assert [l['day'] for l in LESSONS] == list(range(1,31))
    for lesson in LESSONS:
        output=io.StringIO()
        with tempfile.TemporaryDirectory() as folder:
            previous=os.getcwd()
            try:
                os.chdir(folder)
                with contextlib.redirect_stdout(output):
                    namespace={}
                    exec(compile(lesson['example'],'<trusted-curriculum>','exec'),namespace)
                    exec(lesson['checks'],namespace)
            finally: os.chdir(previous)
        assert output.getvalue().strip()==lesson['expected'], lesson['title']
        assert len(lesson['options'])==3 and lesson['objectives'] and lesson['ta']
    token=client.post('/api/auth/register',json={'username':'dashboard_user','password':'a-strong-password'}).json()['access_token']
    headers={'Authorization':'Bearer '+token}
    before=client.get('/api/dashboard',headers=headers).json()
    assert before['xp']==0 and before['next_day']==1 and before['streak']==0
    for _ in range(2): client.post('/api/lessons/1/assess',headers=headers,json={'answer':0})
    after=client.get('/api/dashboard',headers=headers).json()
    assert after['xp']==20 and after['completed']==[1] and after['next_day']==2
    assert after['streak']==1 and sum(d['checks'] for d in after['weekly'])==1

def test_game_persistence_and_isolation():
    headers=[]
    for name in ['game_one','game_two']:
        token=client.post('/api/auth/register',json={'username':name,'password':'strong-game-password'}).json()['access_token']
        headers.append({'Authorization':'Bearer '+token})
    for count in [5,2,5]:
        assert client.post('/api/game-progress',json={'day':6,'crystals':count},headers=headers[0]).status_code==200
    assert client.get('/api/game-progress',headers=headers[0]).json()==[{'day':6,'crystals':5}]
    assert client.get('/api/game-progress',headers=headers[1]).json()==[]
    assert client.post('/api/game-progress',json={'day':31,'crystals':5},headers=headers[0]).status_code==422
    assert client.get('/api/dashboard',headers=headers[0]).json()['xp']==0
