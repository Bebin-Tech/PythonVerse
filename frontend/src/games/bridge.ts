export type GameState={position:number;moves:number;coins:number;remaining:number[];doorOpen:boolean;speed:number;enemyHealth:number;attacks:number;health:number;key:boolean;defending:boolean;message:string;magicMessage:string;hazards:number[];enemyPosition:number|null;keyPosition:number|null;checkpoint:number;checkpointPosition:number|null;doorPosition:number|null;campaign:boolean};
export type Command={op:string;value?:unknown};
export const initialState=():GameState=>({position:0,moves:0,coins:0,remaining:[1,2,3,4,5],doorOpen:false,speed:1,enemyHealth:100,attacks:0,health:100,key:false,defending:false,message:'Your Python controls this world.',magicMessage:'',hazards:[],enemyPosition:null,keyPosition:null,checkpoint:0,checkpointPosition:null,doorPosition:null,campaign:false});
export function validateCommands(raw:unknown):Command[]{
 if(!Array.isArray(raw)||raw.length>300)throw Error('Invalid command queue');
 const allowed=['move','jump','collect','door','key','attack','defend','wait','speed','message'];
 return raw.map(c=>{if(!c||typeof c!=='object'||!allowed.includes(c.op)||Object.keys(c).some(k=>k!=='op'&&k!=='value'))throw Error('Unknown game command');if(c.op==='move'&&c.value!==1&&c.value!==-1)throw Error('Invalid movement');if(c.op==='speed'&&(typeof c.value!=='number'||!Number.isFinite(c.value)||c.value<1||c.value>10))throw Error('Invalid speed');if(c.op==='message'&&(typeof c.value!=='string'||c.value.length>500))throw Error('Invalid message');return {...c}});
}
export function applyCommand(previous:GameState,command:Command):GameState{
 const c=validateCommands([command])[0],s={...previous,remaining:[...previous.remaining]};
 function advance(jumping:boolean){
  if(s.health<=0)return;
  const target=Math.max(0,Math.min(8,s.position+(jumping?1:c.value as number)));s.moves++;
  if(s.doorPosition===target&&!s.doorOpen){s.message='Door locked. Find the key and use_key().';return}
  if(s.enemyPosition===target&&s.enemyHealth>0){s.health=Math.max(0,s.health-(s.defending?5:25));s.defending=false;s.message='Enemy blocks the path. Attack from the adjacent tile.';return}
  if(s.hazards.includes(target)&&!jumping){s.health=Math.max(0,s.health-25);s.position=s.checkpoint;s.message='Spikes! Returned to checkpoint. Use jump() before the hazard.';return}
  s.position=target;
  if(s.keyPosition===target){s.key=true;s.keyPosition=null;s.message='Key collected. Call use_key() to unlock the door.'}
  if(s.checkpointPosition===target){s.checkpoint=target;s.message='Checkpoint activated.'}
 }
 switch(c.op){
 case 'move':advance(false);break;
 case 'jump':advance(true);break;
 case 'collect':if(s.remaining.includes(s.position)){s.remaining=s.remaining.filter(p=>p!==s.position);s.coins++}break;
 case 'door':if(s.coins>=5)s.doorOpen=true;break;
 case 'key':if(s.key){s.key=false;s.doorOpen=true}break;
 case 'speed':s.speed=c.value as number;break;
 case 'attack':if(s.health>0&&(s.enemyPosition===null||Math.abs(s.position-s.enemyPosition)<=1)){s.enemyHealth=Math.max(0,s.enemyHealth-s.speed*10);s.attacks++}else s.message='Move next to the enemy before attacking.';break;
 case 'defend':s.defending=true;break;
 case 'message':s.message=c.value as string;if(s.magicMessage&&s.message===s.magicMessage)s.doorOpen=true;break;
 }

 return s;
}
export const acceptance:Array<{title:string;code:string;check:(s:GameState)=>boolean;en?:string;ta?:string;hint?:string;magic?:string}> = [
 {title:'1 · Loop collector',code:'for i in range(5):\n    move_forward()\n    collect_coin()',check:(s:GameState)=>s.moves===5&&s.coins===5},
 {title:'2 · Conditional door',code:'if get_coins() >= 5:\n    open_door()',check:(s:GameState)=>s.coins>=5&&s.doorOpen},
 {title:'3 · Special ability',code:'def special_attack(power):\n    set_speed(power)\n    attack()\n\nspecial_attack(5)',check:(s:GameState)=>s.speed===5&&s.attacks===1&&s.enemyHealth===50},
 {title:'4 · While runner',code:'count = 0\nwhile count < 3:\n    move_forward()\n    count += 1',check:(s:GameState)=>s.moves===3&&s.position===3}
];

acceptance.push(
 {title:'Day 1 · Magic print',magic:'Hello, Python!',code:'# Activate the door by printing Hello, Python!\nprint("Hello")',en:'print displays text on the world sign. The guardian opens this magic door only for Hello, Python!. Text must be inside quotes.',ta:'print உரையை உலகப் பலகையில் காட்டும். Hello, Python! என்ற செய்தி இந்த மந்திரக் கதவைத் திறக்கும். உரை மேற்கோளுக்குள் இருக்க வேண்டும்.',hint:'Replace the greeting inside the quotes. Keep the punctuation.',check:s=>s.doorOpen&&s.message==='Hello, Python!'},
 {title:'Day 2 · Hidden clue',magic:'moonlight',code:'# The clue is moonlight. Comments begin with #.\n# Repair the message below to reveal the door.\nprint("clue")',en:'Python ignores comments beginning with #. Read the hidden clue in the comment, then send it to the game using print.',ta:'# தொடங்கும் குறிப்புகளை Python இயக்காது. குறிப்பில் உள்ள துப்பைப் படித்து print மூலம் விளையாட்டுக்கு அனுப்பவும்.',hint:'Comments are for people; print sends the actual message.',check:s=>s.doorOpen&&s.message==='moonlight'},
 {title:'Day 3 · Coin variable',code:'steps = 1\nfor i in range(steps):\n    move_forward()\n    collect_coin()',en:'Variables store values used by later instructions. Set steps so your hero collects all five coins. Changing one value changes the action count.',ta:'Variable மதிப்பைச் சேமிக்கும். steps மதிப்பை மாற்றி ஐந்து நாணயங்களையும் சேகரிக்கவும். ஒரே மதிப்பு செயல்களின் எண்ணிக்கையை மாற்றும்.',hint:'There are five coin positions. The loop repeats steps times.',check:s=>s.coins===5&&s.moves===5},
 {title:'Day 4 · Typed power',code:'power_text = "1"\npower = int(power_text)\nset_speed(power)\nattack()',en:'Text and numbers have different types. Convert the power text with int, then supply numeric power to set_speed. Deal exactly 50 damage.',ta:'உரையும் எண்ணும் வேறு வகைகள். int மூலம் உரையை எண்ணாக்கி set_speed-க்கு கொடுக்கவும். சரியாக 50 சேதம் செய்யவும்.',hint:'Each speed point causes 10 attack damage. Set the text to the required numeric value.',check:s=>s.speed===5&&s.enemyHealth===50&&s.attacks===1},
 {title:'Day 5 · Player input',code:'direction = input("Direction: ")\n# Use the supplied direction to choose a movement.\nif direction == "left":\n    move_left()',en:'input returns text supplied in the Input field. Add the right branch so a right decision moves your hero one step forward.',ta:'Input பெட்டியில் கொடுத்த உரையை input தரும். right என்ற முடிவுக்கு ஒரு படி முன்னே செல்லும் கிளையைச் சேர்க்கவும்.',hint:'Use elif direction == "right": followed by an indented move_right().',check:s=>s.position===1&&s.moves===1}
);

export const campaignStart=acceptance.length;
for(const [i,title] of ['Crystal Crossing','Guardian Gate','Python Boss'].entries()){
 acceptance.push({title:'Quest '+(i+1)+' · '+title,code:'# Reach tile 8 alive. The spikes are at tile 3.\n# Start with two moves, then jump over the spikes.\nmove_forward()\nmove_forward()\n# Continue your adventure here.\n',en:'Reach the exit at tile 8. Spikes at tile 3 cost 25 health unless you jump from tile 2. Tile 2 is a checkpoint. Pick up the key at tile 4 and use_key(). '+(i?'Defeat the enemy at tile 6 from tile 5: set_speed(5), then attack until defeated.':'Collect the two coins along your path.'),ta:'8-ஆம் கட்டத்தை உயிருடன் அடையவும். 3-ஆம் கட்டத்தில் முட்கள் உள்ளன; 2-இல் இருந்து jump() செய்யவும். 4-இல் சாவியை எடுத்து use_key() செய்யவும். எதிரி இருந்தால் அருகில் நின்று attack() செய்யவும்.',hint:'Read the numbered tiles. Use a for loop for repeated movement or attacks. You can send another program from your current position.',check:s=>s.position===8&&s.health>0&&s.doorOpen&&(i===0?s.coins===2:s.enemyHealth===0)});
}
export function missionState(index:number):GameState{
 const s={...initialState(),magicMessage:acceptance[index].magic||''};
 if(index>=campaignStart){const stage=index-campaignStart;s.campaign=true;s.hazards=[3];s.remaining=stage===0?[1,3]:[];s.keyPosition=4;s.checkpointPosition=2;s.doorPosition=7;s.enemyPosition=stage===0?null:6;s.enemyHealth=stage===0?0:stage===1?100:150;s.message='Reach tile 8. Jump from tile 2, key at tile 4, door at tile 7.';}
 return s;
}
