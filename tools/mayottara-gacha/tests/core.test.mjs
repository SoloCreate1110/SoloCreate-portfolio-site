import assert from 'node:assert/strict';
import { randomIndex, pickItem } from '../src/utils/random.ts';
import { loadStorage, saveGacha, drawGacha, setDrawMode, getGacha, restoreStorage, clearHistories } from '../src/services/storage.ts';
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
console.log(`${tests} tests passed`);
