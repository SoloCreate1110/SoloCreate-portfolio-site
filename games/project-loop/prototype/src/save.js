import { FIELD_SCENARIOS } from './field.js';
import { ANOMALIES, RELICS, DISEASES, TOOLS, EVENTS } from './data.js';
export const KEYS={run:'project-loop.prototype.run.v1',meta:'project-loop.prototype.meta.v1',settings:'project-loop.prototype.settings.v1'};
export const emptyMeta=()=>({version:1,bestDepth:0,bestScore:0,returns:0,discoveries:{},endings:[],runs:[],tutorial:[]});
export function validateRun(s) {
 const fail=()=>{throw new Error('保存データを読み込めません。形式またはデータIDが不正です。元の保存は保持されています。');};
 if(!s||s.version!==1||typeof s.seed!=='string'||!['route','event','investigation','deduction','verification','crisis','aftermath','hypothesis','preparation','encounter','reward','decision','safe','core','ascent','result'].includes(s.phase))fail();
 s.experimentsDone ||= [];s.experimentResults ||= [];s.deduction ??= null;s.mysteryOutcome ??= null;s.insight ??= 0;
 if(!Number.isInteger(s.depth)||s.depth<1||s.depth>4||!Number.isInteger(s.completed)||s.completed<0||s.completed>6||!Number.isFinite(s.rng)||!Number.isInteger(s.rngIndex))fail();
 for(const [k,max] of Object.entries({hull:12,oxygen:10,power:8,contamination:8}))if(!Number.isFinite(s[k])||s[k]<0||s[k]>max)fail();
 if(!Array.isArray(s.crew)||s.crew.length!==3||new Set(s.crew.map(c=>c.id)).size!==3||s.crew.some(c=>!['mio','aoi','ren'].includes(c.id)||!Number.isFinite(c.hp)||c.hp<0||c.hp>3||!Number.isFinite(c.fatigue)||c.fatigue<0||c.fatigue>4||!Array.isArray(c.diseases)||c.diseases.some(d=>!DISEASES[d.id])))fail();
 if(!Array.isArray(s.modules)||s.modules.length!==6||s.modules.some(m=>!Number.isInteger(m.power)||m.power<0||m.power>2||(m.crew&&!s.crew.some(c=>c.id===m.crew))))fail();
 const occupied=s.modules.map(m=>m.crew).filter(Boolean);if(new Set(occupied).size!==occupied.length)fail();
 if(!Array.isArray(s.relics)||s.relics.length>4||s.relics.some(id=>!RELICS.some(r=>r.id===id))||s.modules.some(m=>m.relic&&!s.relics.includes(m.relic)))fail();
 if(s.node&&(!ANOMALIES.some(a=>a.id===s.node.anomaly)||(s.node.event!==null&&!EVENTS[s.node.event])))fail();
 for(const k of ['routes','route','history','clues','sites','records','rewards','experimentsDone','experimentResults'])if(!Array.isArray(s[k]))fail();
 if(s.modules.reduce((n,m)=>n+m.power,0)>s.power||new Set(s.relics).size!==s.relics.length)fail();
 if(s.routes.some(r=>!ANOMALIES.some(a=>a.id===r.anomaly))||s.clues.some(i=>![0,1,2].includes(i))||s.sites.some(i=>![0,1,2].includes(i)))fail();
 if(s.hypothesis!==null&&![0,1,2].includes(s.hypothesis))fail();
 if(s.deduction&&(![0,1,2].includes(s.deduction.trigger)||![0,1,2].includes(s.deduction.nature)||![0,1,2].includes(s.deduction.response)))fail();
 if(!Number.isInteger(s.insight)||s.insight<0||s.insight>3)fail();
 if(s.phase==='result'&&!['return','empty','loop','loss'].includes(s.ending))fail();
 if(s.history.some(h=>typeof h.summary!=='string'||!Array.isArray(h.details))||s.records.some(r=>!ANOMALIES.some(a=>a.id===r.id)||typeof r.law!=='string'))fail();
 if(s.rewards.some(r=>!['relic','score','repair','oxygen','heal','stabilize'].includes(r.kind)||(r.kind==='relic'&&!RELICS.some(v=>v.id===r.relic))))fail();
 if(!s.flags||!TOOLS.some(t=>t.id===s.tool))fail();
 if(s.phase==='encounter'&&(!s.encounter||!s.encounter.progress||!s.encounter.targets||!Array.isArray(s.encounter.stopped)))fail();
 if(s.field){const d=FIELD_SCENARIOS[s.node?.anomaly],f=s.field;if(!d||![1,2].includes(f.version)||!f.values||!Array.isArray(f.records)||typeof f.ended!=='boolean')fail();
  if(f.version===1){f.values={...d.initial,...f.values};f.version=2;f.stage='survey';f.plan={goal:'',evidence:[]};}
  if(!['survey','aftercare'].includes(f.stage)||!f.plan||!Array.isArray(f.plan.evidence)||f.plan.evidence.length>2||f.plan.evidence.some(id=>!f.records.some(r=>r.id===id&&r.measurement))||!(f.plan.goal===''||d.goals.includes(f.plan.goal)))fail();
  for(const c of d.conditions)if(!Object.hasOwn(c.options,f.values[c.key]))fail();
  for(const [key,values] of Object.entries(d.domains||{}))if(f.values[key]!==undefined&&!values.includes(f.values[key]))fail();
  if(f.records.some(r=>!Number.isInteger(r.id)||typeof r.text!=='string'||!d.actions.some(a=>a.id===r.action)||!r.conditions||typeof r.measurement!=='boolean'))fail();
  if(f.last&&(!Number.isInteger(f.last.id)||typeof f.last.text!=='string'))fail();
 }
 return s;
}
export function readRun(storage) {const raw=storage.getItem(KEYS.run);return raw?validateRun(JSON.parse(raw)):null;}
export function readMeta(storage) {try{const m=JSON.parse(storage.getItem(KEYS.meta));return m?.version===1&&m.discoveries&&Array.isArray(m.endings)&&Array.isArray(m.runs)&&Array.isArray(m.tutorial)?m:emptyMeta();}catch{return emptyMeta();}}
export function updateMeta(meta,s) {const m=structuredClone(meta); const signature=s.sessionId||`${s.seed}:${s.history.length}:${s.ending}`;if(m.runs.some(r=>r.signature===signature))return m; m.bestDepth=Math.max(m.bestDepth,s.bestDepth);m.bestScore=Math.max(m.bestScore,s.score);if(s.ending!=='loss')m.returns++;
 for(const r of s.records){const old=m.discoveries[r.id]||{};const endings=[...new Set([...(old.endings||[]),...(r.ending?[r.ending]:[])])];m.discoveries[r.id]={name:r.name,law:r.law,endings};}if(!m.endings.includes(s.ending))m.endings.push(s.ending);m.runs.push({signature,seed:s.seed,ending:s.ending,score:s.score});return m;}
