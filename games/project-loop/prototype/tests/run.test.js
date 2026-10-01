import test from 'node:test';import assert from 'node:assert/strict';
import {newRun,reduce,anomaly,active,commandPreview,eventOptions,ascentOptions,normalize,disease,resonance,powerCap} from '../src/engine.js';
import {readRun,validateRun,KEYS,emptyMeta,updateMeta} from '../src/save.js';
import {ANOMALIES,RELICS,EVENTS,SCENES,MYSTERIES,SCENARIO_DESIGNS} from '../src/data.js';
const act=(s,type,args={})=>reduce(s,{type,...args});
function configure(s){for(let i=0;i<6;i++)s=act(s,'POWER',{module:i,amount:0});
 const best=[...s.crew].filter(active).sort((a,b)=>b.hp-a.hp||a.fatigue-b.fatigue);
 s=act(s,'ASSIGN',{module:1,crew:best[0].id});if(best[1])s=act(s,'ASSIGN',{module:2,crew:best[1].id});
 for(const [i,n] of [[1,2],[2,2],[4,1],[5,1]])s=act(s,'POWER',{module:i,amount:n});return s;}
export function play(seed,core='recover') {let s=newRun(seed);let count=0;while(s.phase!=='result'&&count++<300){
 switch(s.phase){
 case 'route':s=act(s,'SELECT_ROUTE',{id:s.routes[0].id});break;
 case 'event': {const options=eventOptions(s);const best=options.find(o=>o.id===3)||options.find(o=>!Object.keys(o.effects||{}).length)||options[0];s=act(s,'EVENT',{choice:best.id});break;}
 case 'investigation':for(let i=0;i<2;i++)s=act(s,'INVESTIGATE',{site:i,crew:s.crew.filter(active)[i%s.crew.filter(active).length].id,tool:true});s=act(s,'TO_HYPOTHESIS');break;
 case 'deduction':{const m=MYSTERIES[anomaly(s).id];s=act(s,'DEDUCE',{trigger:anomaly(s).correct,nature:m.nature.correct,response:m.response.correct});break;}
 case 'verification':{const scenarioId=anomaly(s).id,experiments=MYSTERIES[scenarioId].experiments,needed=scenarioId==='F01'&&core==='connect'?2:1;if(s.experimentsDone.length<needed){const exp=experiments[s.experimentsDone.length],prediction=SCENARIO_DESIGNS[scenarioId]?.predictions?.[exp.id]?.correct;s=act(s,'EXPERIMENT',{id:exp.id,target:s.crew.find(active).id,prediction});}else s=act(s,'TO_CRISIS');break;}
 case 'crisis':{const outcomes=MYSTERIES[anomaly(s).id].outcomes;const id=anomaly(s).id==='F01'?core:outcomes.find(o=>o.id==='solve')?.id||outcomes.find(o=>(o.required||0)<=s.insight)?.id;s=act(s,'OUTCOME',{id});break;}
 case 'aftermath':s=act(s,'CONTINUE');break;
 case 'hypothesis':s=act(s,'HYPOTHESIS',{value:anomaly(s).correct});break;
 case 'preparation':s=configure(s);s=act(s,'READY');break;
 case 'encounter':{let candidates=['observe','compare'].map(id=>commandPreview(s,id)).filter(p=>p.available);const alternate=candidates.find(p=>p.id!==s.encounter.previous);const p=anomaly(s).id==='A03'?alternate||candidates[0]:candidates[0];s=act(s,'COMMAND',{id:p?.id||'defend'});break;}
 case 'reward':{const r=(s.oxygen<7&&s.rewards.find(r=>r.id==='oxygen'))||(s.hull<8&&s.rewards.find(r=>r.id==='repair'))||s.rewards.find(r=>r.id==='heal')||s.rewards[0];const c=[...s.crew].sort((a,b)=>b.fatigue-a.fatigue)[0];s=act(s,'REWARD',{id:r.id,target:c.id,treatment:c.fatigue?'fatigue':'hp',replace:s.relics[0]});break;}
 case 'decision':s=act(s,'DESCEND');break;
 case 'safe':{const c=[...s.crew].sort((a,b)=>b.fatigue-a.fatigue)[0];s=act(s,'SAFE',{id:c.fatigue?'fatigue':'repair',target:c.id});break;}
 case 'core':s=act(s,'CORE',{id:core});break;
 case 'ascent':s=act(s,'ASCENT_CHOICE',{id:s.ascentStep===0?(s.relics.length?'discard':'hull'):s.ascentStep===1?'contamination':'timeHull',target:s.relics[0]});break;
 default:throw new Error(s.phase);
 }
 validateRun(s);
 }assert.ok(count<300);return s;}
for(const seed of ['KURO-1','KURO-2','KURO-3','KURO-4','KURO-5'])test(`新規シード ${seed} で最終異常から帰還`,()=>{const s=play(seed);assert.equal(s.ending,'return',s.history.slice(-10).map(h=>h.summary).join('\n'));assert.equal(s.flags.core,'recover');assert.equal(s.completed,6);assert.equal(s.bestDepth,4);assert.equal(s.ascentStep,2);});
for(const [core,ending] of [['destroy','empty'],['connect','loop']])test(`記録核 ${core} の結末`,()=>{assert.equal(play('KURO-1',core).ending,ending);});
test('同じシードと選択で全ランが再現される',()=>assert.deepEqual(play('KURO-3'),play('KURO-3')));
test('3種の喪失条件',()=>{for(const type of ['hull','oxygen','crew']){let s=newRun('loss');if(type==='crew')s.crew.forEach(c=>c.hp=0);else s[type]=0;s=act(s,'SELECT_ROUTE',{id:s.routes[0].id});assert.equal(s.ending,'loss');}});
test('6ターンで強制撤退、報酬なし',()=>{let s=newRun('retreat');s=act(s,'SELECT_ROUTE',{id:s.routes[0].id});s.phase='preparation';s=act(s,'READY');for(let i=0;i<6;i++)s=act(s,'COMMAND',{id:'defend'});assert.equal(s.phase,'decision');assert.equal(s.resolution,'retreat');assert.equal(s.rewards.length,0);});
test('保存・再開、破損・未知IDの保存を拒否',()=>{const s=play('KURO-1');const storage={getItem:()=>JSON.stringify(s)};assert.deepEqual(readRun(storage),s);assert.throws(()=>readRun({getItem:()=>'{oops'}));s.node.anomaly='missing';assert.throws(()=>readRun(storage),/保存データ/);});
test('数値境界、病気2個まで、遺物の隣接と共鳴',()=>{const s=newRun('bounds');s.hull=99;s.oxygen=-5;s.contamination=20;s.crew[0].fatigue=8;normalize(s);assert.equal(s.hull,12);assert.equal(s.oxygen,0);assert.equal(s.contamination,8);assert.equal(s.crew[0].fatigue,4);disease(s,s.crew[1],'echo');disease(s,s.crew[1],'dark');disease(s,s.crew[1],'memory');assert.equal(s.crew[1].diseases.length,2);assert.equal(s.crew[1].hp,2);s.modules[0].relic='window';assert.equal(powerCap(s,1),1);assert.equal(powerCap(s,3),1);assert.equal(powerCap(s,4),2);s.modules[0].relic='bell';s.modules[1].relic='coral';assert.ok(resonance(s,'音響'));});
test('コンテンツ量とシードによる全種到達可能性',()=>{assert.equal(ANOMALIES.length,10);assert.equal(EVENTS.length,6);assert.equal(RELICS.length,9);const events=new Set(),anomalies=new Set();for(let i=0;i<160;i++){let s=newRun('coverage-'+i);for(const completed of [0,2,4]){s.completed=completed;s.safeUsed=true;s.phase='decision';s=act(s,'DESCEND');for(const r of s.routes){anomalies.add(r.anomaly);if(r.event!==null)events.add(r.event);}}}assert.equal(anomalies.size,9);assert.equal(events.size,6);});
test('下降するたびに遭遇済みシナリオを候補から除外する',()=>{let s=newRun('no-repeat');const seen=new Set();for(let completed=0;completed<6;completed++){const candidates=s.routes.map(r=>r.anomaly);assert.equal(new Set(candidates).size,candidates.length,'同じ航路候補内で重複しない');assert.ok(candidates.every(id=>!seen.has(id)),'遭遇済みシナリオを再提示しない');const chosen=s.routes[0];seen.add(chosen.anomaly);s.route.push({...chosen,depth:s.depth});s.completed=completed+1;s.safeUsed=true;s.phase='decision';if(completed<5)s=act(s,'DESCEND');}assert.equal(seen.size,6);});
test('新規5シナリオに導入・展開・両結末・画像がある',()=>{for(const id of ['A05','A06','A07','A08','A09']){const a=ANOMALIES.find(a=>a.id===id);assert.ok(a?.intro);assert.equal(a.hypotheses.length,3);assert.equal(a.clues.length,3);for(const key of ['discovery','encounter','resolved','retreat'])assert.ok(a.story?.[key],`${id}.${key}`);assert.ok(SCENES.anomalies[id]?.src);}});
test('全異常に3軸推理・固有実証・複数結末がある',()=>{for(const a of ANOMALIES){const m=MYSTERIES[a.id];assert.ok(m?.truth);assert.equal(m.nature.options.length,3);assert.equal(m.response.options.length,3);assert.equal(m.experiments.length,3);assert.ok(m.outcomes.length>=4);}});
test('図鑑・帰還数・結末は結果保存の再実行で増殖しない',()=>{const s=play('KURO-2'),m=updateMeta(emptyMeta(),s);assert.deepEqual(updateMeta(m,s),m);assert.equal(m.returns,1);assert.ok(Object.keys(m.discoveries).length>=3);});
