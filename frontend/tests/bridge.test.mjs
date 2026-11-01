import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {acceptance,applyCommand,initialState,validateCommands,missionState,campaignStart} from '../src/games/bridge.ts';
const python='../backend/.venv/Scripts/python.exe';
function execute(code,state){const script=`import json\nns={'_pv_initial_json':${JSON.stringify(JSON.stringify(state))}}\nexec(${JSON.stringify(readFileSync('public/game-api.py','utf8'))},ns)\nns['input']=lambda prompt='': 'right'\nexec(${JSON.stringify(code)},ns)\nprint(json.dumps({'commands':ns['_pv_commands'],'state':ns['_pv_state']}))`;const result=spawnSync(python,['-c',script],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout.trim().split(/\r?\n/).at(-1));}
function replay(code,start){const result=execute(code,start);const commands=validateCommands(result.commands);const actual=commands.reduce(applyCommand,start);assert.deepEqual(actual,result.state);return actual}
let state=replay(acceptance[0].code,initialState());assert.equal(state.moves,5);assert.equal(state.coins,5);
state=replay(acceptance[1].code,state);assert.equal(state.doorOpen,true);
const locked=replay(acceptance[1].code,initialState());assert.equal(locked.doorOpen,false);
assert.equal(replay('open_door()',initialState()).doorOpen,false);
state=replay(acceptance[2].code,initialState());assert.equal(state.speed,5);assert.equal(state.enemyHealth,50);assert.equal(state.attacks,1);
state=replay(acceptance[3].code,initialState());assert.equal(state.moves,3);assert.equal(state.position,3);
assert.throws(()=>validateCommands([{op:'eval',value:'alert(1)'}]));
assert.throws(()=>validateCommands([{op:'speed',value:Infinity}]));
assert.throws(()=>validateCommands(Array(301).fill({op:'jump'})));
console.log('Bridge acceptance: loops, guarded door, functions/arguments, while loop and command rejection passed.');

const solutions = [
 'print("Hello, Python!")',
 '# clue\nprint("moonlight")',
 'steps = 5\nfor i in range(steps):\n    move_forward()\n    collect_coin()',
 'power_text = "5"\npower = int(power_text)\nset_speed(power)\nattack()',
 'direction = input("Direction: ")\nif direction == "right":\n    move_right()'
];
for(let i=0;i<5;i++){
 const mission=acceptance[i+4];
 const start={...initialState(),magicMessage:mission.magic||''};
 assert.equal(mission.check(replay(solutions[i],start)),true,mission.title);
 assert.equal(mission.check(replay(mission.code,start)),false,'Starter should require solving: '+mission.title);
}
console.log('Days 1–5: working solutions pass and unsolved starters fail.');

for(let stage=0;stage<3;stage++){
 const start=missionState(campaignStart+stage);
 const solution=stage===0?'move_forward()\ncollect_coin()\nmove_forward()\njump()\ncollect_coin()\nmove_forward()\nuse_key()\nfor i in range(4):\n    move_forward()':'move_forward()\nmove_forward()\njump()\nmove_forward()\nuse_key()\nmove_forward()\nset_speed(5)\nfor i in range('+ (stage===1?2:3) +'):\n    attack()\nfor i in range(3):\n    move_forward()';
 const result=replay(solution,start);
 assert.equal(acceptance[campaignStart+stage].check(result),true,'Campaign '+stage);
 assert.equal(result.health,100);
}
const hurt=replay('move_forward()\nmove_forward()\nmove_forward()',missionState(campaignStart));
assert.equal(hurt.health,75);assert.equal(hurt.position,2);assert.equal(hurt.checkpoint,2);
const defeated=replay('move_forward()\nmove_forward()\nfor i in range(4):\n    move_forward()\njump()',missionState(campaignStart));
assert.equal(defeated.health,0);assert.equal(defeated.position,2);
const blocked=replay('move_forward()\nmove_forward()\njump()\nmove_forward()\nmove_forward()\nmove_forward()',missionState(campaignStart+1));
assert.equal(blocked.health,75);assert.equal(blocked.position,5);
console.log('Three playable quests pass; spikes, checkpoint recovery, death and enemy blocking verified.');
