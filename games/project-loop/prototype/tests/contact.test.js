import test from 'node:test';
import assert from 'node:assert/strict';
import {newRun,reduce} from '../src/engine.js';
import {FIELD_SCENARIOS,fieldActionRisk} from '../src/field.js';
import {validateRun,updateMeta,emptyMeta} from '../src/save.js';
const act=(s,id)=>reduce(s,{type:'FIELD_ACTION',id});
const sequence=(s,ids)=>ids.reduce(act,s);
function begin(seed='CONTACT'){let s=newRun(seed,'silent','A07');s=reduce(s,{type:'SELECT_ROUTE',id:s.routes[0].id});return reduce(s,{type:'DISMISS_INTRO'});}
function isolate(s=begin()){return sequence(s,['move-lock','hold','signal','move-bunk','normal','close']);}
const finish=s=>reduce(act(s,'leave'),{type:'CONTINUE'});
test('free observation, configuration and journal work never advance danger or grant repeat score',()=>{
 let s=begin();const oxygen=s.oxygen;
 for(let i=0;i<40;i++)s=sequence(s,['listen-lock','listen-bunk','measure','play','stop','normal']);
 assert.equal(s.oxygen,oxygen);assert.equal(s.field.pressure,0);assert.equal(s.hull,12);
 assert.equal(finish(s).score,1);
});
test('an isolated specimen can return safely without learning its name',()=>{
 let s=sequence(isolate(),['recover','watch-container']);s=finish(s);
 assert.equal(s.ending,'return');assert.equal(s.mysteryOutcome.id,'specimen');assert.equal(s.hull,12);assert.equal(s.oxygen,4);assert.equal(s.field.breaches,0);
});
test('cooling allows a name and safe return; all rewards require a declared hull sacrifice',()=>{
 let s=sequence(isolate(),['call','cool','long','call']);
 assert.equal(s.field.values.contact,'named');assert.equal(s.field.values.trace,'lock');assert.equal(s.oxygen,3);assert.equal(s.hull,12);
 const named=finish(s);assert.equal(named.mysteryOutcome.id,'named-contained');assert.equal(named.ending,'return');assert.equal(named.oxygen,1);
 const all=finish(sequence(s,['supply','recover']));assert.equal(all.ending,'return');assert.equal(all.mysteryOutcome.id,'named-specimen');assert.equal(all.hull,9);assert.equal(all.oxygen,1);
 const overreach=finish(act(s,'recover'));assert.equal(overreach.ending,'loss');assert.match(overreach.lossReason,/浮上/);
});
test('a forecasted breach moves the breathing back into the ship and can be investigated',()=>{
 let s=sequence(isolate(),['call','long']);const risk=fieldActionRisk(s.field,FIELD_SCENARIOS.A07,'call');
 assert.equal(risk.breach,true);assert.equal(risk.oxygen,3);assert.equal(risk.hull,4);
 s=act(s,'call');assert.equal(s.hull,8);assert.equal(s.oxygen,4);assert.equal(s.field.pressure,2);assert.equal(s.field.values.trace,'bunk');
 s=sequence(s,['listen-bunk','measure']);assert.match(s.field.last.text,/寝台の下/);
 assert.equal(finish(s).ending,'return');
});
test('repeated contact/cooling is finite, and spent emergency supplies cannot be reused',()=>{
 let s=isolate();s=sequence(s,['call','cool']);s=act(s,'supply');const before=s;
 assert.equal(act(s,'supply'),before);
 while(s.phase==='investigation')s=act(s,'call');assert.equal(s.ending,'loss');
 s=isolate();while(s.phase==='investigation'){s=act(s,'call');if(s.phase==='investigation')s=act(s,'cool');}
 assert.equal(s.ending,'loss');
});
test('zero pressure cooling and full-tank supply are rejected without resource changes',()=>{
 let s=begin();assert.equal(act(s,'supply'),s);s=act(s,'close');assert.equal(act(s,'cool'),s);
});
test('return can use exactly the reserve, but too little reserve fails honestly',()=>{
 let s=begin();s.oxygen=2;assert.equal(finish(s).ending,'return');assert.equal(finish(s).oxygen,0);
 s.oxygen=1;assert.equal(finish(s).ending,'loss');
});
test('save/reload preserves pressure, cooling cost and one-use supply, and rejects corruption',()=>{
 const s=sequence(isolate(),['call','cool','supply']);const restored=validateRun(JSON.parse(JSON.stringify(s)));
 assert.deepEqual(restored,s);assert.equal(act(restored,'supply'),restored);
 for(const pressure of [-1,4,1.5]){const invalid=structuredClone(s);invalid.field.pressure=pressure;assert.throws(()=>validateRun(invalid));}
 const old=structuredClone(s);delete old.field.pressure;delete old.field.breaches;delete old.field.values.reserveUsed;
 const migrated=validateRun(old);assert.equal(migrated.field.pressure,0);assert.equal(migrated.field.values.reserveUsed,false);
});
test('stale confirmation cannot apply twice, and restarting from the same seed is clean',()=>{
 let s=isolate();const a={type:'FIELD_ACTION',id:'call',revision:s.revision};s=reduce(s,a);assert.equal(reduce(s,a),s);
 const fresh=begin(s.seed);assert.equal(fresh.oxygen,9);assert.equal(fresh.field.pressure,0);assert.equal(fresh.field.values.reserveUsed,false);
});
test('loss does not count as a return and report persistence cannot duplicate a return',()=>{
 const s=finish(sequence(isolate(),['call','cool','long','call','recover']));
 const m=updateMeta(emptyMeta(),s);assert.equal(m.returns,0);assert.deepEqual(updateMeta(m,s),m);
 const back=finish(isolate());const once=updateMeta(emptyMeta(),back);assert.equal(once.returns,1);assert.deepEqual(updateMeta(once,back),once);
});

test('attempting recovery at the rupture threshold loses the contained response before sealing',()=>{let s=sequence(isolate(),['call','call']);assert.equal(s.field.pressure,3);s=act(s,'recover');assert.equal(s.field.values.container,'empty');assert.equal(s.field.values.trace,'bunk');assert.equal(s.hull,8);assert.match(s.field.last.text,/乾いて/);});
