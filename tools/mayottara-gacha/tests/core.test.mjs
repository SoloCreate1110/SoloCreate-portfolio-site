import assert from 'node:assert/strict';
import { DrawPresentation } from '../src/utils/drawPresentation.ts';
import { randomIndex, pickItem } from '../src/utils/random.ts';
import { loadStorage, saveGacha, drawGacha, setDrawMode, getGacha, restoreStorage, clearHistories, deleteGacha } from '../src/services/storage.ts';
let data = new Map(); let fail = false;
globalThis.localStorage = { getItem: k => data.get(k) ?? null, setItem: (k,v) => { if(fail) throw Error('quota'); data.set(k,v); } };
let tests = 0;
function test(name, fn) { fn(); tests++; console.log('PASS', name); }
test('uniform mapping and rejection boundary', () => {
 for (const n of [2,3,4,7,100]) { let counts = Array(n).fill(0); for(let i=0;i<n*100;i++) counts[randomIndex(n,()=>i)]++; assert.ok(counts.every(c=>c===100)); }
 let values=[4294967295, 5]; assert.equal(randomIndex(3,()=>values.shift()),2);
 assert.throws(()=>randomIndex(0));
});
test('random mode allows genuine repeat results', () => { const items=[{id:'a'},{id:'b'},{id:'c'},{id:'d'}]; for(let i=0;i<5;i++) assert.equal(pickItem(items,'random',[],()=>0).item.id,'a'); });
test('cycle covers every candidate once over 100 rounds',()=>{ const items=Array.from({length:4},(_,i)=>({id:String(i)})); let remaining=[]; for(let r=0;r<100;r++){const seen=new Set(); for(let i=0;i<4;i++){let result=pickItem(items,'cycle',remaining); remaining=result.remaining;seen.add(result.item.id);}assert.equal(seen.size,4);assert.equal(remaining.length,0);} });
test('existing v1 data loads and item ids survive editing',()=>{const storage=loadStorage();const g=storage.gachas[0];const saved=saveGacha({id:g.id,title:g.title,itemNames:g.items.map(i=>i.name)});assert.deepEqual(saved.items,g.items);});
test('duplicate names and invalid input rejected',()=>{assert.throws(()=>saveGacha({title:'test',itemNames:['Ａ','A']}));assert.throws(()=>saveGacha({title:'test',itemNames:['a']}));});
test('cycle progress persists and history is capped at 100',()=>{const g=saveGacha({title:'test',itemNames:['A','B','C','D']});setDrawMode(g.id,'cycle');const names=new Set();for(let i=0;i<4;i++)names.add(drawGacha(g.id).resultName);assert.equal(names.size,4);for(let i=0;i<106;i++)drawGacha(g.id);assert.equal(getGacha(g.id).histories.length,100);clearHistories(g.id);assert.equal(getGacha(g.id).histories.length,0);});
test('failed write does not commit a draw to cache',()=>{const g=loadStorage().gachas[0];const before=JSON.stringify(g);fail=true;assert.throws(()=>drawGacha(g.id));fail=false;assert.equal(JSON.stringify(getGacha(g.id)),before);});
test('backup validates before replacing data and round trips',()=>{const backup=JSON.parse(JSON.stringify(loadStorage()));restoreStorage(backup,false);assert.throws(()=>restoreStorage({gachas:[{}],settings:{}},true));restoreStorage(backup,true);assert.deepEqual(loadStorage(),backup);});
test('optional motion setting accepts old backups and rejects invalid settings',()=>{
 const original=structuredClone(loadStorage()); const old=structuredClone(original); delete old.settings.reducedMotion;
 restoreStorage(old,true); assert.equal(loadStorage().settings.reducedMotion,undefined);
 const updated=structuredClone(old); updated.settings.reducedMotion=true; restoreStorage(updated,true); assert.equal(loadStorage().settings.reducedMotion,true);
 const invalid=structuredClone(updated);invalid.settings.reducedMotion='yes';assert.throws(()=>restoreStorage(invalid,true));assert.deepEqual(loadStorage(),updated);restoreStorage(original,true);
});
test('undo snapshot restores deleted gacha, histories, ids and cycle progress',()=>{
 const original=structuredClone(loadStorage()); const g=saveGacha({title:'undo',itemNames:['one','two','three']});setDrawMode(g.id,'cycle');drawGacha(g.id);
 const before=structuredClone(loadStorage()); clearHistories(g.id);assert.equal(getGacha(g.id).histories.length,0);restoreStorage(before,true);assert.deepEqual(loadStorage(),before);
 deleteGacha(g.id);assert.equal(getGacha(g.id),undefined);restoreStorage(before,true);assert.deepEqual(loadStorage(),before);restoreStorage(original,true);
});
test('saving a copy isolates its ids and history from the original',()=>{
 const original=structuredClone(loadStorage());const g=original.gachas[0];const copy=saveGacha({title:g.title+' copy',itemNames:g.items.map(x=>x.name)});assert.notEqual(copy.id,g.id);assert.equal(copy.histories.length,0);assert.ok(copy.items.every(i=>!g.items.some(x=>x.id===i.id)));assert.deepEqual(getGacha(g.id),g);restoreStorage(original,true);
});
test('empty collection is valid and can create a new gacha',()=>{
 const original=structuredClone(loadStorage());restoreStorage({gachas:[],settings:original.settings},true);assert.equal(loadStorage().gachas.length,0);saveGacha({title:'first',itemNames:['a','b']});assert.equal(loadStorage().gachas.length,1);restoreStorage(original,true);
});
test('deleting an arbitrary gacha preserves other gachas and settings',()=>{
 const original=structuredClone(loadStorage());const selected=original.gachas.at(-1);deleteGacha(selected.id);
 assert.deepEqual(loadStorage().gachas,original.gachas.filter(g=>g.id!==selected.id));assert.deepEqual(loadStorage().settings,original.settings);
 assert.deepEqual(JSON.parse(data.get('mayottara-gacha:v1')),loadStorage());restoreStorage(original,true);
});
test('failed deletion leaves data intact and last-gacha deletion can be undone',()=>{
 const original=structuredClone(loadStorage());fail=true;assert.throws(()=>deleteGacha(original.gachas[0].id));fail=false;assert.deepEqual(loadStorage(),original);
 const only={...original,gachas:[original.gachas[0]]};restoreStorage(only,true);deleteGacha(only.gachas[0].id);assert.equal(loadStorage().gachas.length,0);
 assert.equal(JSON.parse(data.get('mayottara-gacha:v1')).gachas.length,0);restoreStorage(only,true);assert.deepEqual(loadStorage(),only);restoreStorage(original,true);
});
function animationFixture() {
 let time=0,nextId=0,completions=0;const timers=new Map(),phases=[];
 const animation=new DrawPresentation(phase=>phases.push(phase),(fn,delay)=>{ const id=++nextId;timers.set(id,{fn,at:time+delay});return id; },id=>timers.delete(id));
 const advance=ms=>{const target=time+ms;while(true){const entry=[...timers].filter(([,v])=>v.at<=target).sort((a,b)=>a[1].at-b[1].at)[0];if(!entry)break;time=entry[1].at;timers.delete(entry[0]);entry[1].fn();}time=target;};
 return {animation,phases,advance,start:reduced=>animation.start(reduced,()=>completions++),count:()=>completions};
}
test('every draw closes before shaking and revealing including second and third draws',()=>{
 const f=animationFixture();for(let n=0;n<3;n++){f.phases.length=0;f.start(false);assert.deepEqual(f.phases,['closed','closing']);f.advance(219);assert.equal(f.phases.at(-1),'closing');f.advance(1);assert.equal(f.phases.at(-1),'drawing');f.advance(680);assert.deepEqual(f.phases,['closed','closing','drawing','revealed']);assert.equal(f.count(),n+1);}
});
test('skip and repeated finish reveal exactly once with no late animation',()=>{
 const f=animationFixture();f.start(false);f.animation.finish();f.animation.finish();f.advance(2000);assert.equal(f.count(),1);assert.deepEqual(f.phases,['closed','closing','revealed']);
});
test('navigation cancels presentation and reduced motion has no drawing delay',()=>{
 const f=animationFixture();f.start(false);f.advance(220);f.animation.cancel();f.advance(2000);assert.equal(f.count(),0);assert.equal(f.phases.at(-1),'closed');f.phases.length=0;f.start(true);f.advance(0);assert.equal(f.count(),1);assert.deepEqual(f.phases,['closed','closing','revealed']);
});
console.log(`${tests} total tests passed`);
