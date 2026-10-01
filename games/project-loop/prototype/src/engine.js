import { FIELD_SCENARIOS, createField, performField, fieldActionRisk } from './field.js?v=20261001-contact';
import { LIMITS, MODES, THRESHOLDS, TOOLS, CREW, MODULES, ANOMALIES, RELICS, DISEASES, COMMANDS, EVENTS, MYSTERIES, SCENARIO_DESIGNS } from './data.js';
import { hash, random, shuffle } from './rng.js';
export const active = c => c.hp>0 && c.fatigue<4;
export const capable = c => active(c) && c.fatigue<3;
export const anomaly = s => ANOMALIES.find(a=>a.id===s.node?.anomaly);
export const mystery = s => MYSTERIES[s.node?.anomaly];
export const scenarioDesign = s => SCENARIO_DESIGNS[s.node?.anomaly]||null;
export const correctPredictionCount = s => (s.experimentResults||[]).filter(r=>r.predictionCorrect).length;
export function outcomeAvailable(s,out){
 const rule=scenarioDesign(s)?.outcomeUnlocks?.[out.id];
 if(!rule)return s.insight>=(out.required||0)&&s.experimentsDone.length>=(out.experiments||0);
 return (rule.correctPredictions||0)<=correctPredictionCount(s)&&(rule.experiments||[]).every(id=>s.experimentsDone.includes(id));
}
export const equipped = s => s.modules.map(m=>m.relic).filter(id=>id && !s.encounter?.stopped.includes(id));
export const resonance = (s,tag) => equipped(s).filter(id=>RELICS.find(r=>r.id===id)?.tags.includes(tag)).length>=2;
export const adjacent = i => [0,1,2,3,4,5].filter(j=>Math.abs(Math.floor(i/3)-Math.floor(j/3))+Math.abs(i%3-j%3)===1);
export const powerCap = (s,i) => adjacent(i).some(j=>s.modules[j].relic==='window')?1:2;
export const effectivePower = (s,i) => Math.max(0,s.modules[i].power+(s.modules[i].dream?1:0)-(s.contamination===8?1:0)-(s.encounter?.blocked===i?1:0));
export const crewAt = (s,i) => s.crew.find(c=>c.id===s.modules[i].crew && active(c));
export const hasDisease = (s,c,id) => c?.diseases.some(d=>d.id===id) && !(s.modules.find(m=>m.crew===c.id)?.relic==='box' && c.diseases[0]?.id===id);
export function log(s,summary,category='status',details=[]) { s.history.push({turn:s.encounter?.turn||0,category,summary,details}); }
export function normalize(s) { for(const k of ['hull','oxygen','power','contamination']) s[k]=Math.max(0,Math.min(LIMITS[k],s[k])); for(const c of s.crew) { c.hp=Math.max(0,Math.min(3,c.hp)); c.fatigue=Math.max(0,Math.min(4,c.fatigue)); } }
export function finish(s,ending) { s.phase='result'; s.ending=ending; s.direction='ascending'; s.score=Math.max(0,s.score); log(s,ending==='loss'?'通信途絶。調査記録だけが海面へ送られた。':'海面到達。カイロス7の帰還を確認。'); }
export function checkFailure(s) { normalize(s); if(s.phase!=='result' && (s.hull===0||s.oxygen===0||!s.crew.some(active))) {s.lossReason=s.hull===0?'船体崩壊':s.oxygen===0?'酸素枯渇':'全隊員が行動不能';finish(s,'loss');} }
export function change(s,key,n,reason) { s[key]+=n; log(s,`${reason}：${{hull:'船体',oxygen:'酸素',contamination:'汚染',score:'調査点'}[key]||key}${n>=0?'+':''}${n}`); normalize(s); }
function damage(s,n,reason,defend=false) {const shell=effectivePower(s,5); const armor=s.encounter && !s.encounter.armorUsed && shell>=1?1:0; const reduction=(equipped(s).includes('window')?1:0)+(shell===2?1:armor)+(defend?1:0); if(s.encounter && armor) s.encounter.armorUsed=true; const loss=Math.max(0,n-reduction); change(s,'hull',-loss,`${reason}${reduction?'（装甲軽減）':''}`); if(loss && anomaly(s)?.id==='A02' && s.encounter) {for(const key in s.encounter.targets) s.encounter.targets[key]++;log(s,'白庭が船体の傷を模倣：全目標+1');} }
function heal(s,c,n) { if(!c)return; const penalty=hasDisease(s,c,'salt')&&!c.diseases.find(d=>d.id==='salt').stable?1:0; c.hp+=Math.max(0,n-penalty); normalize(s); log(s,`${c.name}を治療：体力+${Math.max(0,n-penalty)}`); }
export function disease(s,c,id) { if(s.encounter&&effectivePower(s,4)===2&&!s.encounter.medUsed){s.encounter.medUsed=true;log(s,'医務室：異常の悪化を1回無効化');return;} if(!c || c.diseases.some(d=>d.id===id))return; if(c.diseases.length===2){c.diseases.shift();c.hp--;log(s,'異常の重複で体力−1');} c.diseases.push({id,stable:false});log(s,`${c.name}に${DISEASES[id].name}：${DISEASES[id].text}`); }
function addClue(s,index) {
  if (s.clues.includes(index)) return;
  s.clues.push(index);
  const observation = scenarioDesign(s)?.investigations?.[index]?.observation;
  log(s, observation || anomaly(s).clues[index], 'investigation');
}
export function visibleClues(s) {return equipped(s).includes('box')?s.clues.slice(1):s.clues;}
function generateRoutes(s) {
 if(s.focusScenario){
  const target=ANOMALIES.find(a=>a.id===s.focusScenario);
  if(!target)throw new Error('重点調査シナリオが見つかりません。');
  s.depth=1;s.bestDepth=Math.max(s.bestDepth,1);
  s.routes=[{id:`focus-${s.completed}`,anomaly:target.id,kind:'重点調査',event:null,risk:'観測条件を比較する',oxygen:1}];
  s.phase='route';return;
 }
 const depth=Math.floor(s.completed/2)+1; s.depth=Math.min(4,depth); s.bestDepth=Math.max(s.bestDepth,s.depth);
 const pool=s.depth===1?['A01','A04','A06','A07']:s.depth===2?['A02','A01','A05','A07','A09']:['A03','A04','A05','A08','A09'];
 const seen=new Set([...(s.route||[]).map(n=>n.anomaly),...(s.records||[]).map(r=>r.id)]);
 const preferred=pool.filter(id=>!seen.has(id)&&ANOMALIES.some(a=>a.id===id));
 const fallback=ANOMALIES.filter(a=>a.id!=='F01'&&!seen.has(a.id)&&!preferred.includes(a.id)).map(a=>a.id);
 const picks=[...shuffle(s,preferred),...shuffle(s,fallback)];
 const count=s.depth===1?2:3;
 if(picks.length<count)throw new Error('未遭遇の異常が不足しています。');
 s.routes=Array.from({length:count},(_,i)=>({id:`${s.completed}-${i}`,anomaly:picks[i],kind:['調査','遺物','救難'][(i+s.completed)%3],event:EVENTS.length && !(s.completed===0&&i===0) && (i+s.completed)%3===2?Math.floor(random(s)*EVENTS.length):null,risk:i===0?'慎重な接近':'不明な反応',oxygen:1})); s.phase='route';
}
export function newRun(seed='KURO-NAGI',tool='silent',focusScenario=null) {
 if(!TOOLS.some(t=>t.id===tool))throw new Error('存在しない開始道具です。');
 if(focusScenario&&!ANOMALIES.some(a=>a.id===focusScenario))throw new Error('存在しない重点調査シナリオです。');
 const s={version:1,seed:String(seed).slice(0,80),rng:hash(String(seed)),rngIndex:0,phase:'route',depth:1,bestDepth:1,direction:'descending',focusScenario,hull:12,oxygen:10,power:6,contamination:0,crew:CREW.map(c=>({...c,hp:3,fatigue:0,diseases:[]})),modules:MODULES.map((m,i)=>({crew:CREW.find(c=>c.initial===i)?.id||null,power:1,relic:null,dream:false})),relics:[],tool,toolUsed:false,completed:0,safeUsed:false,routes:[],route:[],node:null,clues:[],sites:[],hypothesis:null,links:{},deduction:null,experimentsDone:[],experimentResults:[],mysteryOutcome:null,insight:0,encounter:null,rewards:[],records:[],score:0,history:[],flags:{},ascentStep:0};
 generateRoutes(s);log(s,'出航命令：ミナモの記録核を回収し、海面へ帰還せよ。','route');return s;
}
function arrive(s,node) {
 s.field=s.focusScenario&&FIELD_SCENARIOS[node.anomaly]?createField(FIELD_SCENARIOS[node.anomaly]):null;
 s.node=node;s.investigationResult=null;s.route.push({...node,depth:s.depth});s.clues=[];s.sites=[];s.hypothesis=null;s.links={};s.deduction=null;s.experimentsDone=[];s.experimentResults=[];s.mysteryOutcome=null;s.insight=0;s.encounter=null;s.flags.nodePrimary=null;s.flags.aoiUsed=false;s.flags.renUsed=false;s.flags.introPending=true;
 change(s,'oxygen',-1,'到着時の潜航消費');if(equipped(s).includes('anchor'))change(s,'oxygen',1,'呼吸する錨・下降');
 if(s.depth===1 && equipped(s).includes('lens'))change(s,'contamination',1,'潮目レンズ・明るい海域');
 s.phase='investigation';log(s,`${anomaly(s).name}の反応を検知。`,'route');
 if(node.event!==null && EVENTS[node.event])s.phase='event';
}
export function intent(s) {
 const a=anomaly(s), e=s.encounter; if(!a||!e)return {type:'不明',text:'準備完了後に反応を表示'};
 let type=a.pattern[(e.turn-1)%a.pattern.length];
 if(a.id==='A03') type=e.previous===e.selected?'衝撃':'妨害';
 const known=visibleClues(s).length;
 const sight=equipped(s).includes('rust')||s.crew.some(c=>active(c)&&hasDisease(s,c,'memory'))||effectivePower(s,1)===2||s.flags.core==='connect';
 if(a.id==='A04' && s.modules.every((m,i)=>crewAt(s,i)||effectivePower(s,i)>0))return {type:'停止',text:'◎ 全設備を観測中。窓は複製できない。'};
 if(!known&&!sight&&s.hypothesis!==a.correct)return {type,text:'? 次行動は不明'};
 if(known===1&&!sight&&s.hypothesis!==a.correct)return {type,text:`△ ${type}の兆候。対象・規模は不明`};
 return {type,text:`⚠ ${type}：${{侵入:'担当隊員の体力−1',衝撃:'船体−2',汚染:'汚染+1',妨害:'次ターン、使用設備の有効電力−1',変則:'隊員の疲労+1、異常付与'}[type]||'未来の損傷記録'}`};
}
export function commandPreview(s,id) {
 const c=COMMANDS.find(c=>c.id===id);if(!c)throw new Error('存在しない命令です。');
 const m=c.module===null?null:s.modules[c.module], person=m?crewAt(s,c.module):null;
 let cost=c.cost,value=c.base;
 if(id==='retreat'&&crewAt(s,0)?.id==='mio'&&capable(crewAt(s,0)))cost--;
 if(id==='compare'&&visibleClues(s).length>=2)value++;
 if(c.mode==='observe'&&effectivePower(s,1)>=1)value++;
 if(c.mode==='evade'&&effectivePower(s,0)>=1)value++;
 if(c.mode==='repel'&&effectivePower(s,3)>=1)value++;
 const a=anomaly(s);
 if(a&&s.hypothesis===a.correct&&a.favorable.includes(c.mode))value+=2+(effectivePower(s,2)>=1?1:0);
 if(s.depth===2&&c.tag==='音響')value--;if(s.depth===2&&c.tag==='研究')value++;
 if(id==='silent'&&equipped(s).includes('bell'))value++;
 if(c.tag==='音響'&&resonance(s,'音響'))value++;
 if(c.mode==='observe'&&equipped(s).includes('specimen'))value+=s.depth>1?2:1;
 if(person&&hasDisease(s,person,'dark'))value+=s.depth===1?(person.diseases.find(d=>d.id==='dark').stable?0:-1):c.mode==='observe'?2:0;
 if(id==='stop'&&equipped(s).length)value+=2;
 if(id==='decoy'&&a?.id==='A01')value++;
 if(c.mode==='evade'&&!s.toolUsed&&a?.tags.includes(TOOLS.find(t=>t.id===s.tool).tag))value++;
 let reason='';if(m&&!person)reason='行動可能な隊員の配置が必要';
 else if(m&&effectivePower(s,c.module)+(s.encounter?.boost?1:0)<cost)reason=`この設備に有効電力${cost}が必要`;
 else if(!m&&s.power<cost)reason='電力不足';
 else if(id.startsWith('decoy')&&s.toolUsed)reason='道具を消費済み';
 else if(id==='heal'&&!s.crew.some(c=>c.hp<3))reason='全員の体力が最大';
 return {...c,cost,value:Math.max(0,value),available:!reason,reason};
}
function actAnomaly(s,person,defend=false) {
 const e=s.encounter;const a=anomaly(s);const i=intent(s); e.blocked=null;
 if(i.type==='停止'){log(s,'全設備への観測で、窓の複製を防いだ。','anomaly');return;}
 if(a.id==='A03'&&e.previous&&e.previous!==e.selected){log(s,'命令を変えたため、潜水士の模倣が途切れた。','anomaly');return;}
 log(s,`${a.name}：${i.type}を実行。`,'anomaly');
 if(i.type==='衝撃')damage(s,2,`${a.name}の衝撃`,defend);
 if(i.type==='侵入'){const c=person||s.crew.find(active);if(c){c.hp--;log(s,`${c.name}：侵入で体力−1`);}}
 if(i.type==='汚染')change(s,'contamination',1,`${a.name}の汚染`);
 if(i.type==='妨害'){e.blocked=COMMANDS.find(c=>c.id===e.selected)?.module??1;log(s,`${MODULES[e.blocked].name}：次ターン有効電力−1`);}
 if(i.type==='変則'){const c=person||s.crew.find(active);if(c){c.fatigue++;disease(s,c,a.id==='A02'?'salt':'pressure');log(s,`${c.name}：変則作用で疲労+1`);}}
 if(s.depth>=3&&e.turn%3===0)change(s,'contamination',1,'深層での追加干渉');
}
function startEncounter(s) {
 const a=anomaly(s);s.phase='encounter';s.encounter={turn:1,progress:{observe:0,evade:0,seal:0,repel:0},targets:a.id==='F01'?{observe:8,evade:8,seal:8,repel:8}:{...THRESHOLDS},blocked:null,previous:null,selected:null,used:[],stopped:[],armorUsed:false,medUsed:false,rewound:false};
 if(s.hypothesis!==null&&s.hypothesis!==a.correct){change(s,'contamination',1,'誤った仮説');actAnomaly(s,null);}
 for(const c of s.crew.filter(active)){
  if(hasDisease(s,c,'echo')&&a.tags.includes('音響')){addClue(s,[0,1,2].find(i=>!s.clues.includes(i))??0);if(!c.diseases.find(d=>d.id==='echo').stable){if(effectivePower(s,4)===2&&!s.encounter.medUsed){s.encounter.medUsed=true;log(s,'医務室：反響熱の悪化を1回無効化');}else{c.fatigue++;log(s,`${c.name}：反響熱の副作用で疲労+1`);}}}
  if(hasDisease(s,c,'pressure')&&!c.diseases.find(d=>d.id==='pressure').stable){const from=s.modules.findIndex(m=>m.crew===c.id);if(from>=0&&random(s)<.5){const to=adjacent(from)[0];[s.modules[from].crew,s.modules[to].crew]=[s.modules[to].crew,s.modules[from].crew];s.modules[to].dream=true;log(s,`${c.name}：水圧夢遊で${MODULES[to].name}へ移動、有効電力+1`);}}
 }
 if(a.tags.includes('音響')&&equipped(s).includes('coral'))addClue(s,[0,1,2].find(i=>!s.clues.includes(i))??0);
 if(effectivePower(s,3)===2){s.encounter.boost=true;log(s,'機関室：一時電力1を蓄積（1回、妨害を相殺）');}
}
function rewards(s) {
 const a=anomaly(s);const relicPool=RELICS.filter(r=>!s.relics.includes(r.id));
 const favored=relicPool.filter(r=>a.rewards.includes(r.id));
 const relic=shuffle(s,favored.length?favored:relicPool)[0];
 let options=[{id:'score',name:'調査点+3',kind:'score'}];
 if(relic)options.push({id:`relic:${relic.id}`,name:relic.name,kind:'relic',relic:relic.id});
 if(s.hull<12)options.push({id:'repair',name:'修理：船体+2',kind:'repair'});
 if(s.oxygen<10)options.push({id:'oxygen',name:'補給：酸素+2',kind:'oxygen'});
 if(s.crew.some(c=>c.hp<3||c.fatigue>0))options.push({id:'heal',name:'治療：体力+1 または 疲労−2',kind:'heal'});
 if(s.crew.some(c=>c.diseases.some(d=>!d.stable)))options.push({id:'stabilize',name:'病気を安定化',kind:'stabilize'});
 let count=effectivePower(s,2)===2?4:3;if(equipped(s).includes('rust'))count--;
 s.rewards=shuffle(s,options).slice(0,count);
}
function resolveEncounter(s,mode) {
 const a=anomaly(s);s.resolution=mode;log(s,`遭遇終了：${MODES[mode]||'撤退'}。法則は「${a.hypotheses[a.correct]}」。`,'reward');
 const record={id:a.id,name:a.name,law:a.hypotheses[a.correct],correct:s.hypothesis===a.correct,mode};s.records.push(record);
 if(mode!=='retreat'){
  change(s,'score',(mode==='evade'?1:3)+(record.correct?1:0),'調査成果');
  if(effectivePower(s,4)>=1)heal(s,s.crew.find(c=>c.hp<3),1);
  if(resonance(s,'生体')){heal(s,s.crew.find(c=>c.hp<3),1);change(s,'oxygen',-1,'生体共鳴');}
  if(mode==='evade'){s.crew.find(c=>c.id==='aoi').fatigue++;log(s,'アオイ：回避への抵抗で疲労+1');}
 }
 s.completed+=a.id==='F01'?0:1;
 if(a.id==='F01'&&mode!=='retreat')s.phase='core';else if(mode==='retreat')s.phase='decision';else {rewards(s);s.phase='reward';}
}
function execute(s,id,target) {
 let p=commandPreview(s,id);if(p.module!==null&&s.encounter.boost&&effectivePower(s,p.module)<p.cost&&effectivePower(s,p.module)+1>=p.cost){s.encounter.boost=false;log(s,'機関室の一時電力で妨害を相殺');}if(!p.available){if(s.encounter.boost&&p.reason.includes('有効電力')&&crewAt(s,p.module)&&effectivePower(s,p.module)+1>=p.cost){s.encounter.boost=false;}else throw new Error(p.reason);}
 const e=s.encounter,a=anomaly(s),person=p.module===null?null:crewAt(s,p.module);
 if(!e.rewound&&(equipped(s).includes('clock')||(resonance(s,'時間')&&e.turn===1))){s.undo=structuredClone({...s,undo:null});}
 if(!equipped(s).includes('clock')&&e.turn>1)s.undo=null;
 e.selected=id;log(s,`命令：${p.name} / 電力${p.cost} / ${p.mode?`${MODES[p.mode]}+${p.value}`:p.extra}`,'command');
 if(a.id==='F01'&&e.used.includes(id)){damage(s,2,'ミナモが記録済み命令の未来を再現');checkFailure(s);if(s.phase==='result')return;}
 if(id==='retreat'){damage(s,effectivePower(s,0)===2?1:2,'撤退損害');change(s,'oxygen',-1,'撤退');resolveEncounter(s,'retreat');return;}
 if(id==='heal')heal(s,s.crew.find(c=>c.id===target)||s.crew.find(c=>c.hp<3),s.tool==='culture'&&!s.toolUsed?2:1);
 if(id==='thrust')change(s,'oxygen',-1,'緊急推進');
 if(id==='seal')change(s,'contamination',1,'封鎖手順');
 if(id==='shock')damage(s,1,'外殻放電の反動');
 if(id.startsWith('decoy'))s.toolUsed=true;
 if(id==='stop'&&equipped(s).length){const stopped=equipped(s)[0];e.stopped.push(stopped);log(s,`${RELICS.find(r=>r.id===stopped).name}を一時停止`);}
 if(p.mode)e.progress[p.mode]+=p.value;
 if(person?.id==='ren'&&capable(person)&&[3,4].includes(p.module)&&!s.flags.renUsed){s.flags.renUsed=true;if(p.module===3)change(s,'hull',1,'レン・応急接続');else heal(s,s.crew.find(c=>c.hp<3)||person,1);}
 if(p.mode&&e.progress[p.mode]>=e.targets[p.mode]){checkFailure(s);if(s.phase!=='result')resolveEncounter(s,p.mode);return;}
 actAnomaly(s,person,id==='defend');
 if(e.turn===3){if(equipped(s).includes('bell')){const c=crewAt(s,s.modules.findIndex(m=>m.relic==='bell'));if(c){c.fatigue++;log(s,'鳴らない鐘の副作用：疲労+1');}}
 if(resonance(s,'音響'))change(s,'contamination',1,'音響共鳴');
 if(s.depth===3){[s.modules[0].crew,s.modules[1].crew]=[s.modules[1].crew,s.modules[0].crew];log(s,'逆潮帯：操舵室と観測室の配置が交換された。');}}
 if(e.turn%3===0&&p.mode==='observe'){change(s,'oxygen',-1,'長時間観察');if(person)person.fatigue++;}
 e.used.push(id);e.previous=id;
 if(e.turn===6){damage(s,3,'6ターン経過・強制撤退');change(s,'oxygen',-1,'強制撤退');resolveEncounter(s,'retreat');}else e.turn++;
}
export function returnRisk(s) {return s.hull<=2||s.oxygen<=2||!s.crew.some(c=>active(c)&&c.hp>=2)?'絶望的':s.hull<=4||s.oxygen<=4||s.contamination>=6?'危険':s.hull<=7||s.oxygen<=6||s.contamination>=4?'注意':'安全';}
export function ascentOptions(s) {
 const hard=(s.flags.core==='recover'?1:0)+(s.contamination===8?1:0)+(equipped(s).includes('anchor')?1:0);const soft=s.flags.core==='destroy'?1:0;
 if(s.ascentStep===0)return [
 {id:'discard',name:'遺物を切り離す',text:'選んだ遺物1個を失う',disabled:!s.relics.length},
 {id:'disease',name:'隊員が共鳴を引き受ける',text:`選んだ隊員に反響熱${hard?' / 体力−'+hard:''}`},
 {id:'hull',name:'船体で耐える',text:`船体−${Math.max(1,2+hard-soft)}`}];
 if(s.ascentStep===1)return [
 {id:'record',name:'調査記録を手放す',text:'直近の調査記録1件を失う / 調査点−2',disabled:!s.records.length},
 {id:'oxygen',name:'呼吸を現実につなぐ',text:`酸素−${Math.max(1,2+(s.flags.core==='recover'?1:0)-soft)}`},
 {id:'contamination',name:'記憶を受け入れる',text:`汚染+${2+(s.flags.core==='connect'?1:0)}`}];
 return [{id:'time',name:'時計を現在へ戻す',text:'時間共鳴の代償：酸素−1'},{id:'timeHull',name:'船体を時間の錨にする',text:'時間共鳴の代償：船体−2'}];
}
export function eventOptions(s) {const ev=EVENTS[s.node?.event];if(!ev)return [];let options=ev.choices.map((c,i)=>({...c,id:i}));if(s.crew.some(c=>active(c)&&hasDisease(s,c,'memory')&&!c.diseases.find(d=>d.id==='memory').stable))options=options.filter((_,i)=>i!==1); if(!ev.special || (ev.special.tool&&(s.tool!==ev.special.tool||s.toolUsed))||(ev.special.crew&&!s.crew.some(c=>c.id===ev.special.crew&&active(c))))return options;return [...options,{...ev.special,id:3}];}
function applyEvent(s,choice) {const c=eventOptions(s).find(c=>c.id===choice);if(!c)throw new Error('この選択肢は利用できません。');for(const [key,val] of Object.entries(c.effects||{})){if(['hull','oxygen','contamination','score'].includes(key))change(s,key,val,c.name);if(key==='hp'){s.crew.find(active).hp+=val;log(s,`扉の圧力：担当隊員の体力${val}`);}if(key==='fatigue'){s.crew.forEach(c=>c.fatigue+=val);log(s,`隊員の疲労${val}`);}if(key==='disease')disease(s,s.crew.find(active),val);if(key==='clue')addClue(s,val);if(key==='relic'&&!s.relics.includes(val)){if(s.relics.length<4){s.relics.push(val);log(s,`${RELICS.find(r=>r.id===val).name}を回収`);}else change(s,'score',1,'遺物庫満杯のため記録だけを採取');}}s.phase='investigation';}
function equip(s,i,id) {
 if(id&&!s.relics.includes(id))throw new Error('所持していない遺物です。');
 const old=s.modules[i].relic;if(old===id)return;
 for(const m of s.modules)if(m.relic===id)m.relic=null;s.modules[i].relic=id||null;
 for(let j=0;j<6;j++)s.modules[j].power=Math.min(s.modules[j].power,powerCap(s,j));
 if(id){const ren=s.crew.find(c=>c.id==='ren');ren.fatigue++;log(s,'レン：遺物接続で疲労+1');const c=crewAt(s,i);if(c&&!hasDisease(s,c,'salt')){if(id==='coral')disease(s,c,'echo');if(id==='specimen')disease(s,c,'dark');}}
}
function deductionInsight(s,deduction=s.deduction){const a=anomaly(s),m=mystery(s);if(!a||!m||!deduction)return 0;return Number(deduction.trigger===a.correct)+Number(deduction.nature===m.nature.correct)+Number(deduction.response===m.response.correct);}
function applyMysteryEffects(s,effects={},target){for(const [key,value] of Object.entries(effects)){if(['hull','oxygen','contamination','score'].includes(key))change(s,key,value,'異常への選択');if(key==='fatigue'){const c=s.crew.find(c=>c.id===target&&active(c))||s.crew.find(active);if(c){c.fatigue+=value;log(s,`${c.name}：実証で疲労${value>=0?'+':''}${value}`);}}}}
function grantMysteryRelic(s,id){if(!id||s.relics.includes(id))return;if(s.relics.length>=4){change(s,'score',1,'遺物庫満杯・標本記録');return;}s.relics.push(id);log(s,`${RELICS.find(r=>r.id===id)?.name||id}を回収`,'reward');}
const allowed={FIELD_PLAN:['investigation'],FIELD_ACTION:['investigation'],SELECT_ROUTE:['route'],DISMISS_INTRO:['investigation'],INVESTIGATE:['investigation'],TO_HYPOTHESIS:['investigation'],DEDUCE:['deduction','verification'],EXPERIMENT:['verification'],REVISE:['verification'],TO_CRISIS:['verification'],OUTCOME:['crisis'],CONTINUE:['aftermath'],HYPOTHESIS:['hypothesis'],ASSIGN:['preparation','ascent'],POWER:['preparation','ascent'],EQUIP:['preparation','ascent'],READY:['preparation'],COMMAND:['encounter'],REPOSITION:['encounter'],CLUE:['encounter'],REWIND:['encounter','reward','decision','core'],REWARD:['reward'],DESCEND:['decision'],ASCEND:['decision'],SAFE:['safe'],CORE:['core'],ASCENT_CHOICE:['ascent'],EVENT:['event']};
export function reduce(state,action) {
 if(!allowed[action.type]?.includes(state.phase)||(action.revision!==undefined&&action.revision!==(state.revision||0)))return state;
 if(state.field&&['INVESTIGATE','TO_HYPOTHESIS','DEDUCE','EXPERIMENT','TO_CRISIS','OUTCOME'].includes(action.type))return state;
 const s=structuredClone(state);s.revision=(state.revision||0)+1;const a=action;
 switch(a.type) {
 case 'SELECT_ROUTE': {const node=s.routes.find(n=>n.id===a.id);if(!node)throw new Error('存在しない航路IDです。');arrive(s,node);break;}
 case 'FIELD_PLAN': {
  if(!s.field||s.flags.introPending)return state;
  const d=FIELD_SCENARIOS[s.node.anomaly];
  if(!d.goals.includes(a.goal)||!Array.isArray(a.evidence)||a.evidence.length>2||a.evidence.some(id=>!s.field.records.some(r=>r.id===id&&r.measurement)))return state;
  s.field.plan={goal:a.goal,evidence:[...new Set(a.evidence)]};break;
 }
 case 'FIELD_ACTION': {
  if(!s.field||s.flags.introPending)return state;
  const design=FIELD_SCENARIOS[s.node.anomaly],risk=fieldActionRisk(s.field,design,a.id);
  if(a.id==='cool'&&!(s.field.pressure>0)||a.id==='supply'&&s.oxygen>8)return state;
  const beforeOxygen=s.oxygen;
  const result=performField(s.field,design,a.id);if(!result)return state;
  s.field=result.field;
  for(const [key,cost] of Object.entries(result.cost))if(cost)change(s,key,-cost,a.id==='leave'?'浮上':'現場操作');
  if(s.field.values.casualty)s.crew.find(c=>c.id==='aoi').hp=0;
  log(s,s.field.last.text,'investigation');
  if(result.ending&&beforeOxygen<risk.oxygen){s.lossReason='浮上に必要な酸素が不足';finish(s,'loss');break;}
  if(!result.ending){checkFailure(s);if(s.phase==='result')break;}
  if(result.ending){s.mysteryOutcome=result.ending;s.resolution=result.ending.id;s.completed++;s.score+=new Set(s.field.records.filter(r=>r.measurement).map(r=>r.text)).size;s.records.push({id:s.node.anomaly,name:anomaly(s).name,law:result.ending.text,correct:false,mode:result.ending.id,ending:result.ending.name});s.phase='aftermath';s.flags.fieldReturn=true;if(s.field.values.casualty)s.crew.find(c=>c.id==='aoi').hp=0;return s;}
  break;
 }
 case 'EVENT':applyEvent(s,a.choice);break;
 case 'DISMISS_INTRO':s.flags.introPending=false;break;
 case 'INVESTIGATE': {
  if(![0,1,2].includes(a.site)||s.sites.includes(a.site))return state;
  const c=s.crew.find(c=>c.id===a.crew&&active(c));if(!c)throw new Error('行動可能な担当隊員を選んでください。');s.flags.introPending=false;
  if(s.sites.length===2){if(a.payment==='fatigue'){c.fatigue++;log(s,`${c.name}：追加調査で疲労+1`);}else change(s,'oxygen',-1,'追加調査');}
  if(!s.flags.nodePrimary){s.flags.nodePrimary=c.id;s.flags.primaryStreak=s.flags.lastPrimary===c.id?(s.flags.primaryStreak||1)+1:1;s.flags.lastPrimary=c.id;if(s.flags.primaryStreak%3===0){c.fatigue++;log(s,`${c.name}：3ノード連続担当で疲労+1`);}}
  const design=scenarioDesign(s),siteDesign=design?.investigations?.[a.site];
  const safe=(s.depth===1&&s.sites.length===0)||(a.tool&&!s.toolUsed&&anomaly(s).tags.includes(TOOLS.find(t=>t.id===s.tool).tag))||c.id===['mio','aoi','ren'][a.site];
  s.sites.push(a.site);addClue(s,a.site);
  if(siteDesign?.effects)applyMysteryEffects(s,siteDesign.effects,c.id);
  s.flags.anomalyStage=s.sites.length;
  s.investigationResult={site:a.site,crew:c.name,observation:siteDesign?.observation||anomaly(s).clues[a.site],reaction:siteDesign?.reaction||'',question:siteDesign?.question||'',impact:siteDesign?.risk||(!safe&&a.site===2?'接触損傷：船体−1':'損傷なし'),cost:s.sites.length===3?(a.payment==='fatigue'?'追加調査：疲労+1':'追加調査：酸素−1'):'通常調査：追加コストなし'};
  if(!siteDesign&&!safe&&a.site===2)damage(s,1,'深海調査の接触損傷');else log(s,siteDesign?siteDesign.reaction:'適性または装備により、損傷なく調査を完了。','investigation');break;
 }
 case 'TO_HYPOTHESIS':if(s.sites.length<2)throw new Error('2地点を調査してください。');s.phase=s.focusScenario&&scenarioDesign(s)?'verification':'deduction';break;
 case 'DEDUCE':{
  const m=mystery(s);if(!m)throw new Error('この異常の推理データがありません。');
  if(![0,1,2].includes(a.trigger)||![0,1,2].includes(a.nature)||![0,1,2].includes(a.response))throw new Error('発生条件・正体・対処法をすべて選んでください。');
  s.deduction={trigger:a.trigger,nature:a.nature,response:a.response};s.hypothesis=a.trigger;s.insight=deductionInsight(s);s.phase='verification';log(s,'推理を仮置きし、実証へ移行。','investigation');break;
 }
 case 'EXPERIMENT':{
  const m=mystery(s),exp=m?.experiments.find(e=>e.id===a.id);if(!exp||s.experimentsDone.includes(a.id))return state;
  if(a.deduction){if(![a.deduction.trigger,a.deduction.nature,a.deduction.response].every(v=>[0,1,2].includes(v)))throw new Error('発生条件・正体・対処法をすべて選んでください。');s.deduction={...a.deduction};s.hypothesis=a.deduction.trigger;s.insight=deductionInsight(s);}
  if(!s.deduction)throw new Error('実験の前に仮説を組み立ててください。');
  const prediction=scenarioDesign(s)?.predictions?.[exp.id];
  if(prediction&&(!Number.isInteger(a.prediction)||!prediction.options[a.prediction]))throw new Error('実験結果を予測してから実行してください。');
  const predictionCorrect=prediction?Number(a.prediction)===prediction.correct:null;
  s.experimentsDone.push(a.id);s.experimentResults.push({id:exp.id,name:exp.name,result:exp.result,prediction:prediction?Number(a.prediction):null,predictionText:prediction?.options[a.prediction]||'',predictionCorrect,reaction:prediction&&!predictionCorrect?prediction.wrongReaction:''});applyMysteryEffects(s,exp.effects,a.target);if(prediction&&!predictionCorrect)applyMysteryEffects(s,prediction.wrongEffects,a.target);log(s,`${prediction?(predictionCorrect?'予測一致':'予測不一致'):'実証'}「${exp.name}」：${exp.result}`,'investigation');break;
 }
 case 'REVISE':s.phase='deduction';break;
 case 'TO_CRISIS':{
  if(!s.experimentsDone.length)throw new Error('少なくとも1つ実証してください。');s.insight=deductionInsight(s);
  if(s.insight===0){change(s,'hull',-1,'誤った推理で危機が拡大');change(s,'contamination',1,'異常の侵入');}
  else if(s.insight===1)change(s,'contamination',1,'不完全な推理で危機が拡大');
  s.phase='crisis';log(s,'異常が臨界へ移行。最後の対応を選ぶ。','anomaly');break;
 }
 case 'OUTCOME':{
  const m=mystery(s),out=m?.outcomes.find(o=>o.id===a.id);if(!out)throw new Error('存在しない結末です。');
  if(!outcomeAvailable(s,out))throw new Error('この選択に必要な観測または実証が足りません。');
  applyMysteryEffects(s,out.effects,a.target);grantMysteryRelic(s,out.relic);s.mysteryOutcome={id:out.id,name:out.name,text:out.text,reveal:!!out.reveal,truth:m.truth};s.resolution=out.id;
  const current=anomaly(s);s.records.push({id:current.id,name:current.name,law:m.truth,correct:s.insight===3,mode:out.id,ending:out.name});if(current.id!=='F01')s.completed++;
  if(out.core)s.flags.core=out.core;s.phase='aftermath';log(s,`結末：${out.name}`,'reward');break;
 }
 case 'CONTINUE':if(s.focusScenario){finish(s,'return');}else if(anomaly(s).id==='F01'){s.phase='ascent';s.direction='ascending';s.ascentStep=0;log(s,'浮上開始。残り2つの通過域。','route');}else s.phase='decision';break;
 case 'HYPOTHESIS':if(a.value!==null&&![0,1,2].includes(a.value))throw new Error('仮説が不正です。');s.hypothesis=a.value;s.links=a.links||{};s.phase='preparation';break;
 case 'ASSIGN': {const i=a.module;if(!Number.isInteger(i)||i<0||i>5)throw new Error('設備IDが不正です。');if(a.crew&&!s.crew.some(c=>c.id===a.crew&&active(c)))throw new Error('行動不能な隊員は配置できません。');const old=s.modules[i].crew;const from=s.modules.findIndex(m=>m.crew===a.crew);if(from>=0)s.modules[from].crew=old;s.modules[i].crew=a.crew||null;for(const m of s.modules){const c=s.crew.find(c=>c.id===m.crew);if(c&&!hasDisease(s,c,'salt')){if(m.relic==='coral')disease(s,c,'echo');if(m.relic==='specimen')disease(s,c,'dark');}}log(s,`${MODULES[i].name}の配置を更新`);break;}
 case 'POWER':{if(!s.modules[a.module]||!Number.isInteger(a.amount)||a.amount<0||a.amount>powerCap(s,a.module))throw new Error('設備の電力上限を超えます。');if(s.modules.reduce((n,m,i)=>n+(i===a.module?a.amount:m.power),0)>s.power)throw new Error('配分できる電力は6点です。先に別の設備を減らしてください。');s.modules[a.module].power=a.amount;break;}
 case 'EQUIP':if(!s.modules[a.module])throw new Error('設備IDが不正です。');equip(s,a.module,a.id);break;
 case 'READY':startEncounter(s);break;
 case 'COMMAND':execute(s,a.id,a.target);break;
 case 'REPOSITION':{if(anomaly(s).id!=='F01'||s.encounter.moved)throw new Error('再配置は最終遭遇で1回です。');const c=s.crew.find(c=>c.id===a.crew&&active(c));if(!c||!s.modules[a.module])throw new Error('再配置先が不正です。');const from=s.modules.findIndex(m=>m.crew===c.id);if(from<0)throw new Error('配置中の隊員を選んでください。');[s.modules[from].crew,s.modules[a.module].crew]=[s.modules[a.module].crew,s.modules[from].crew];s.encounter.used=[];s.encounter.moved=true;log(s,'配置を変え、ミナモの未来記録を外した。命令の既視履歴を消去。');break;}
 case 'CLUE':{const c=s.crew.find(c=>c.id==='aoi');if(!capable(c)||s.flags.aoiUsed)throw new Error('分類不能は利用できません。');s.flags.aoiUsed=true;const i=[0,1,2].find(i=>!s.clues.includes(i));if(i!==undefined)addClue(s,i);break;}
 case 'REWIND':{if(!s.undo)throw new Error('巻き戻せる命令はありません。');const old=structuredClone(s.undo);old.revision=s.revision;old.encounter.rewound=true;old.undo=null;if(equipped(old).includes('clock'))change(old,'oxygen',-1,'昨日の時計・巻き戻し');log(old,'時間を巻き戻した。別の命令を選べる。');checkFailure(old);return old;}
 case 'REWARD':{const r=s.rewards.find(r=>r.id===a.id);if(!r)throw new Error('存在しない報酬IDです。');if(r.kind==='relic'){if(s.relics.length===4){if(!s.relics.includes(a.replace))throw new Error('交換する遺物を選んでください。');s.relics=s.relics.filter(id=>id!==a.replace);s.modules.forEach(m=>{if(m.relic===a.replace)m.relic=null;});}s.relics.push(r.relic);}if(r.kind==='repair')change(s,'hull',2,'報酬修理');if(r.kind==='oxygen')change(s,'oxygen',2,'報酬補給');if(r.kind==='score')change(s,'score',3,'報酬記録');if(r.kind==='heal'){const c=s.crew.find(c=>c.id===a.target)||s.crew.find(c=>c.fatigue>0||c.hp<3);if(a.treatment==='hp')heal(s,c,1);else if(c){c.fatigue-=2;log(s,`${c.name}：疲労−2`);}}if(r.kind==='stabilize'){const c=s.crew.find(c=>c.id===a.target)||s.crew.find(c=>c.diseases.some(d=>!d.stable));const d=c?.diseases.find(d=>!d.stable);if(d){d.stable=true;log(s,`${c.name}：${DISEASES[d.id].name}を安定化`);}}log(s,`報酬確定：${r.name}`,'reward');s.phase='decision';s.undo=null;break;}
 case 'DESCEND':if(s.completed===2&&!s.safeUsed)s.phase='safe';else if(s.completed>=6){s.depth=4;s.bestDepth=4;arrive(s,{id:'final',anomaly:'F01',kind:'最終異常',event:null});}else generateRoutes(s);break;
 case 'SAFE':{if(s.safeUsed)return state;if(a.id==='repair')change(s,'hull',2,'安全域・修理');else{const c=s.crew.find(c=>c.id===a.target);if(!c)throw new Error('対象隊員を選んでください。');if(a.id==='hp')heal(s,c,1);else{c.fatigue-=2;log(s,`${c.name}：安全域で疲労−2`);}}s.safeUsed=true;generateRoutes(s);break;}
 case 'ASCEND':s.phase='ascent';s.direction='ascending';s.ascentStep=0;s.undo=null;log(s,'浮上開始。残り2つの通過域。','route');break;
 case 'CORE':if(!['recover','destroy','connect'].includes(a.id))throw new Error('記録核の選択が不正です。');s.flags.core=a.id;if(a.id==='connect')change(s,'contamination',3,'記録核を接続');if(a.id==='destroy')change(s,'score',-2,'記録核を破壊');if(a.id==='recover')change(s,'score',5,'記録核を回収');s.phase='ascent';s.direction='ascending';s.ascentStep=0;s.undo=null;break;
 case 'ASCENT_CHOICE':{const opt=ascentOptions(s).find(o=>o.id===a.id&&!o.disabled);if(!opt)throw new Error('この浮上選択は利用できません。');const hard=(s.flags.core==='recover'?1:0)+(s.contamination===8?1:0)+(equipped(s).includes('anchor')?1:0);const soft=s.flags.core==='destroy'?1:0;
  if(a.id==='discard'){if(!s.relics.includes(a.target))throw new Error('遺物を選んでください。');s.relics=s.relics.filter(id=>id!==a.target);s.modules.forEach(m=>{if(m.relic===a.target)m.relic=null;});}
  if(a.id==='disease'){const c=s.crew.find(c=>c.id===a.target&&active(c));if(!c)throw new Error('行動可能な隊員を選んでください。');disease(s,c,'echo');c.hp-=hard;}
  if(a.id==='hull')change(s,'hull',-Math.max(1,2+hard-soft),'浮上・遺物共鳴');
  if(a.id==='record'){s.records.pop();change(s,'score',-2,'浮上・記録喪失');}
  if(a.id==='oxygen')change(s,'oxygen',-Math.max(1,2+(s.flags.core==='recover'?1:0)-soft),'浮上・記憶混線');
  if(a.id==='contamination')change(s,'contamination',2+(s.flags.core==='connect'?1:0),'浮上・記憶混線');
  if(a.id==='time')change(s,'oxygen',-1,'時間共鳴の代償');if(a.id==='timeHull')change(s,'hull',-2,'時間共鳴の代償');
  log(s,opt.name,'route');s.ascentStep++;checkFailure(s);if(s.phase!=='result'&&s.ascentStep>=(resonance(s,'時間')?3:2))finish(s,s.flags.core==='connect'?'loop':s.flags.core==='destroy'?'empty':'return');break;
 }
 }
 checkFailure(s);return s;
}
