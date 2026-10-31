export type GameState={position:number;moves:number;coins:number;remaining:number[];doorOpen:boolean;speed:number;enemyHealth:number;attacks:number;health:number;key:boolean;defending:boolean;message:string;magicMessage:string};
export type Command={op:string;value?:unknown};
export const initialState=():GameState=>({position:0,moves:0,coins:0,remaining:[1,2,3,4,5],doorOpen:false,speed:1,enemyHealth:100,attacks:0,health:100,key:false,defending:false,message:'Your Python controls this world.',magicMessage:''});
export function validateCommands(raw:unknown):Command[]{
 if(!Array.isArray(raw)||raw.length>300)throw Error('Invalid command queue');
 const allowed=['move','jump','collect','door','key','attack','defend','wait','speed','message'];
 return raw.map(c=>{if(!c||typeof c!=='object'||!allowed.includes(c.op)||Object.keys(c).some(k=>k!=='op'&&k!=='value'))throw Error('Unknown game command');if(c.op==='move'&&c.value!==1&&c.value!==-1)throw Error('Invalid movement');if(c.op==='speed'&&(typeof c.value!=='number'||!Number.isFinite(c.value)||c.value<1||c.value>10))throw Error('Invalid speed');if(c.op==='message'&&(typeof c.value!=='string'||c.value.length>500))throw Error('Invalid message');return {...c}});
}
export function applyCommand(previous:GameState,command:Command):GameState{
 const c=validateCommands([command])[0],s={...previous,remaining:[...previous.remaining]};
 switch(c.op){case 'move':s.position=Math.max(0,Math.min(8,s.position+(c.value as number)));s.moves++;break;case 'collect':if(s.remaining.includes(s.position)){s.remaining=s.remaining.filter(p=>p!==s.position);s.coins++}break;case 'door':if(s.coins>=5)s.doorOpen=true;break;case 'key':if(s.key){s.key=false;s.doorOpen=true}break;case 'speed':s.speed=c.value as number;break;case 'attack':s.enemyHealth=Math.max(0,s.enemyHealth-s.speed*10);s.attacks++;break;case 'defend':s.defending=true;break;case 'message':s.message=c.value as string;if(s.magicMessage&&s.message===s.magicMessage)s.doorOpen=true;break;}
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
