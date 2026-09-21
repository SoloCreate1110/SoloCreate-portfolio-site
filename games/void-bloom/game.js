'use strict';
(() => {
const dom=new Map(),$=id=>{if(!dom.has(id))dom.set(id,document.getElementById(id));return dom.get(id);}, canvas=$('game'), ctx=canvas.getContext('2d'), W=480,H=720;
const MAX_HP=100,MAX_WEAPONS=3;
const FLIGHT_TOP=H*.7,FLIGHT_BOTTOM=H-48;
const ENEMY_SHOTS={orange:{color:'#ff9a3c',core:'#4c240b'},red:{color:'#ff3c55',core:'#4c0a19'},purple:{color:'#be60ff',core:'#310c4c'},white:{color:'#ffffff',core:'#ffffff'}};
const canCancel=b=>(b.kind||'orange')==='orange';
let rerolls=1,banishes=1,banishMode=false,banned=new Set();
const supports=[{name:'スーツ修復',desc:'HPを25回復する。',icon:'＋'},{name:'緊急バリア',desc:'4秒間、橙弾と接触を防ぐ（赤・紫は不可）',icon:'◇'},{name:'弾幕消去',desc:'橙弾を消去＋スコア1,500（赤・紫は残る）',icon:'✳'},{name:'予備補給',desc:'HPを10回復＋スコア500',icon:'⊕'}];
const skills=[
{name:'マグネット',icon:'∩',desc:'経験値の吸引範囲が一回り広がる'},
{name:'強化装甲',icon:'▣',desc:'最大HP＋20 · HPも20回復'},
{name:'出力強化',icon:'✦',desc:'全武器の攻撃力＋10%'},
{name:'高速装填',icon:'»',desc:'全武器の連射速度＋10%'},
{name:'スラスター',icon:'➤',desc:'移動速度＋8%'},
{name:'衝撃吸収',icon:'◇',desc:'橙弾・接触のダメージ−8%'},
{name:'学習コア',icon:'✧',desc:'獲得経験値＋10%'}];
let skillLevels=skills.map(()=>0);
const maxHp=()=>MAX_HP+skillLevels[1]*20;
const magnetRadius=()=>32+skillLevels[0]*22;
function upgradePool(){
 const pool=levels.map((l,i)=>i).filter(i=>levels[i]<5&&(levels[i]>0||levels.filter(Boolean).length<MAX_WEAPONS));
 skills.forEach((_,i)=>{if(skillLevels[i]<5)pool.push(6+i);});
 for(let i=pool.length-1;i>=0;i--)if(banned.has(pool[i]))pool.splice(i,1);
 // Consumables are fallback choices once fewer than three permanent upgrades remain.
 for(let i=0;pool.length<3&&i<supports.length;i++)if(!banned.has(-1-i))pool.push(-1-i);
 return pool;
}
const weapons=[
{name:'パルスキャノン',en:'PULSE CANNON',icon:'⋮',color:'#76f5c5',evo:'ノヴァ・テンペスト',desc:'連射速度と弾数が増加。',evoDesc:'5連装の貫通弾幕で、艦隊を一掃する。'},
{name:'拡散ショット',en:'SCATTER SHOT',icon:'⋔',color:'#ffc47c',evo:'ソーラー・ブロッサム',desc:'扇状に広がる弾丸を発射。',evoDesc:'13方向の灼熱弾。敵を貫き、空を染める。'},
{name:'プラズマレーザー',en:'PLASMA LASER',icon:'ϟ',color:'#8ecfff',evo:'ヘブンズ・ピラー',desc:'敵を貫通する高出力ビーム。',evoDesc:'3本の極太レーザーで戦場を焼き払う。'},
{name:'追尾ミサイル',en:'HOMING MISSILE',icon:'⌁',color:'#ff94bd',evo:'セラフィム・スウォーム',desc:'敵を追いかける爆発ミサイル。',evoDesc:'8発の追尾弾が連続爆発を巻き起こす。'},
{name:'チェインライトニング',en:'CHAIN LIGHTNING',icon:'↯',color:'#c4a2ff',evo:'ゼウス・ジャッジメント',desc:'近くの敵へ連鎖する雷撃。',evoDesc:'全域に届く連鎖雷撃。逃げ場はない。'},
{name:'オービタル',en:'ORBITAL DRONE',icon:'◈',color:'#f1e890',evo:'エクリプス・リング',desc:'随伴する衛星が自動援護射撃。',evoDesc:'6機の衛星が回転弾幕と橙色の敵弾を防ぐフィールドを展開。'}];
// Combat and upgrade previews read the same weapon values.
function weaponStats(i,l){
  const evolved=l===5;
  if(l<1||l>5)return null;
  switch(i){
    case 0:return {count:evolved?5:l>=3?3:l>=2?2:1,interval:evolved?.12:.32-l*.035,damage:evolved?5:1.5+l*.5,pierce:evolved};
    case 1:return {count:evolved?13:3+l,interval:evolved?.45:.95-l*.09,damage:evolved?5:2+l*.5,pierce:evolved};
    case 2:return {count:evolved?3:1,interval:evolved?.75:1.9-l*.15,damage:evolved?35:10+l*5,width:evolved?40:8+l*4,pierce:true};
    case 3:return {count:evolved?8:l+1,interval:evolved?.65:1.6-l*.1,damage:evolved?4:1+l*.5,pierce:false};
    case 4:return {count:evolved?18:l+2,interval:evolved?.75:2.2-l*.16,damage:evolved?25:5+l*3,pierce:false};
    case 5:return {count:evolved?6:Math.min(4,l+1),interval:evolved?.17:.5-l*.04,damage:evolved?6:2+l,pierce:evolved};
    default:return null;
  }
}
const statNumber=n=>Number(n.toFixed(3)).toString();
function upgradeDetails(i,current){
  const next=weaponStats(i,current+1),before=weaponStats(i,current);
  if(!next)return [];
  const labels=[['弾数','発'],['弾数','発'],['ビーム','本'],['ミサイル','発'],['最大連鎖','体'],['衛星','機']];
  const [countLabel,countUnit]=labels[i],rows=[];
  const add=(label,key,unit='')=>{
    if(!before){rows.push({label,value:statNumber(next[key])+unit});return;}
    if(Math.abs(next[key]-before[key])<.00001)return;
    const delta=next[key]-before[key];
    rows.push({label:label+' '+(delta>0?'＋':'−')+statNumber(Math.abs(delta))+unit,value:statNumber(before[key])+unit+' → '+statNumber(next[key])+unit});
  };
  add(countLabel,'count',countUnit);
  add(i===4?'1体へのダメージ':'1発のダメージ','damage');
  add('発射間隔','interval','秒');
  if(i===2)add('ビーム幅','width','px');
  if(next.pierce&&!before?.pierce)rows.push({label:'貫通攻撃',value:before?'新たに追加':'敵を貫通'});
  if(i===5&&current===4)rows.push({label:'橙弾ガード追加',value:'0.45秒ごとに1発防ぐ'});
  return rows;
}
function upgradeSummary(i,current){
  const next=weaponStats(i,current+1),before=weaponStats(i,current);
  if(!next)return '';
  if(!before)return ['前方へ連射する弾を追加','扇状に広がる4発の弾を追加','敵を貫通するビームを追加','敵を追うミサイル2発を追加','敵3体に連鎖する雷撃を追加','援護射撃する衛星2機を追加'][i];
  if(current===4)return ['5連装の高速貫通弾に進化','13方向に広がる貫通弾に進化','極太レーザー3本に進化','追尾ミサイル8発に進化','最大18体に連鎖する雷撃に進化','衛星6機＋貫通弾＋橙弾ガード'][i];
  const delta=next.count-before.count;
  const change=delta>0?['弾数','弾数','ビーム','ミサイル','連鎖する敵','衛星'][i]+'＋'+delta+['発','発','本','発','体','機'][i]:i===2?'ビームが太くなる':'1発の威力アップ';
  return change+' · '+(delta>0?'威力・連射速度アップ':'連射速度アップ');
}

let state='title',ship={x:240,y:630,hp:MAX_HP,inv:0,hearts:1},wave=1,score=0,xp=0,level=1,need=6,time=0,waveTime=0,spawnClock=0,spawned=0,levels=[1,0,0,0,0,0],cd=[0,0,0,0,0,0],enemies=[],bullets=[],hostile=[],hazards=[],particles=[],gems=[],effects=[],keys={},shieldCd=0,barrier=0,sound=false,audio=null,best=0,shake=0,flash=0,kills=0,choices=[],pointer=null,transition=0,toastTimer=0,visualTime=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
try{best=Number(localStorage.getItem('void-bloom-best'))||0;}catch{}
const rand=(a,b)=>a+Math.random()*(b-a),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const stars=Array.from({length:100},()=>({x:rand(0,W),y:rand(0,H),z:rand(.2,1),s:rand(.5,1.6)}));
function tone(freq=440,dur=.1,type='sine',vol=.04,slide=0){if(!sound||!audio)return;const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,freq+slide),audio.currentTime+dur);g.gain.setValueAtTime(vol,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+dur);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+dur);}
function unlockAudio(){if(!audio){const Audio=window.AudioContext||window.webkitAudioContext;if(Audio)audio=new Audio();}audio?.resume().catch(()=>{});}
function toast(text,color='#76f5c5'){const el=$('toast');el.textContent=text;el.style.color=color;el.classList.add('show');toastTimer=2.4;}
function burst(x,y,c,count=16,force=1){for(let i=0;i<count;i++){const a=rand(0,Math.PI*2),v=rand(25,160)*force;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.2,.8),max:.8,c,s:rand(1,4)});}if(particles.length>650)particles.splice(0,particles.length-650);}
function ring(x,y,c,r=70){effects.push({type:'ring',x,y,c,r,life:.45,max:.45});}
// HUD writes occur only when the displayed value changes.
const hudValues=new Map();
function hud(id,property,value){const key=id+':'+property;if(hudValues.get(key)===value)return;hudValues.set(key,value);const el=$(id);if(property==='width')el.style.width=value;else if(property.startsWith('class:'))el.classList.toggle(property.slice(6),value);else if(property.startsWith('aria-'))el.setAttribute(property,value);else el[property]=value;}
function ui(){
 hud('revive','textContent',ship.hearts?'♥ 1':'♡ 0');hud('revive','class:spent',!ship.hearts);hud('revive','aria-label',ship.hearts?'復活ハート：残り1回':'復活ハート：残り0回');
 hud('wave','innerHTML',String(wave).padStart(2,'0')+' <em>/ 12</em>');hud('score','textContent',String(score).padStart(6,'0'));
 hud('health','textContent',Math.ceil(ship.hp)+' / '+maxHp());hud('hpFill','width',(ship.hp/maxHp()*100)+'%');hud('hpFill','class:low',ship.hp<=30);
 hud('focus','class:active',!!keys.Space);hud('focus','aria-pressed',!!keys.Space);hud('level','textContent','LV. '+String(level).padStart(2,'0'));
 hud('xp','width',Math.min(100,xp/need*100)+'%');hud('xpText','textContent',Math.floor(xp)+' / '+need+' XP');hud('best','textContent',String(best).padStart(6,'0'));
}
function ownedSkills(){return skills.map((k,i)=>skillLevels[i]?`<span>${k.icon} ${k.name} <b>L${skillLevels[i]}</b></span>`:'').join('');}
function ownedWeapons(){return weapons.map((w,i)=>levels[i]?`<div class="weapon" style="--c:${w.color}"><span class="weapon-icon">${w.icon}</span><div class="weapon-info"><b>${levels[i]===5?w.evo:w.name}</b><small>${levels[i]===5?'EVOLUTION':w.en}</small><div class="pips">${[1,2,3,4,5].map(n=>`<i class="${levels[i]>=n?'on':''}"></i>`).join('')}</div></div><span class="weapon-level">${levels[i]===5?'✦':'L'+levels[i]}</span></div>`:'').join('');}
function arsenal(){const owned=ownedSkills();$('skills').innerHTML=owned;$('skillsPanel').hidden=!owned;$('weaponCount').textContent=String(levels.filter(Boolean).length).padStart(2,'0')+' / 03';$('arsenal').innerHTML=ownedWeapons();}
function pauseLoadout(){return '<div class="pause-loadout"><h3>所持武器</h3>'+ownedWeapons()+'<h3>所持スキル</h3><div class="pause-skills">'+(ownedSkills()||'<span class="empty-skills">まだ取得していません</span>')+'</div></div>';}
function title(){state='title';$('overlay').className='overlay title-screen';$('overlay').innerHTML='<span class="badge">EARTH DEFENSE</span><h2 class="game-title">ローグ<br><span>インベーダー</span></h2><p class="title-story">地球を背に、最後の防衛線へ。</p><p class="title-controls"><span class="desktop-control">WASD / 矢印キーで移動 · Spaceで低速</span><span class="mobile-control">ドラッグで移動 · 低速ボタン長押し</span><br>攻撃はオート</p><button class="start" id="start">出撃する　↗</button>';$('start').onclick=start;}
function start(){enemyGrid.clear();orangeGrid.clear();orangeShots.length=0;unlockAudio();rerolls=1;banishes=1;banishMode=false;banned=new Set();skillLevels=skills.map(()=>0);state='playing';ship={x:240,y:630,hp:MAX_HP,inv:2,hearts:1};wave=1;score=0;xp=0;level=1;need=6;time=0;waveTime=0;spawnClock=0;spawned=0;levels=[1,0,0,0,0,0];cd=[0,0,0,0,0,0];enemies=[];bullets=[];hostile=[];hazards=[];gems=[];effects=[];particles=[];kills=0;transition=0;keys={};pointer=null;shieldCd=0;barrier=0;shake=0;flash=0;$('overlay').innerHTML='';$('overlay').className='overlay';$('pause').textContent='Ⅱ';$('bossHud').hidden=true;ui();arsenal();toast('WAVE 01 — FIRST CONTACT');}
function pause(){if(state==='playing'){state='paused';keys={};pointer=null;$('pause').textContent='▶';$('overlay').className='overlay pause-screen';$('overlay').innerHTML='<h2>PAUSED</h2>'+pauseLoadout()+'<button class="start" id="resume">戦闘に戻る</button>';$('resume').onclick=pause;}else if(state==='paused'){state='playing';$('overlay').innerHTML='';$('pause').textContent='Ⅱ';}}
function finish(win){state=win?'won':'lost';pointer=null;keys={};best=Math.max(best,score);try{localStorage.setItem('void-bloom-best',best);}catch{}ui();$('overlay').className='overlay';$('overlay').innerHTML=`<span class="badge">${win?'MISSION COMPLETE':'SIGNAL LOST'}</span><h2>${win?'VOID<br><span>CLEARED</span>':'GAME<br><span>OVER</span>'}</h2><p>${win?'侵略者のコアを撃破。地球の明日を守り抜いた。':'進化の可能性は、まだ尽きない。'}</p><div class="result-stats"><div><b>${score.toLocaleString()}</b><small>SCORE</small></div><div><b>${wave}</b><small>WAVE</small></div><div><b>${kills}</b><small>KILLS</small></div></div><button class="start" id="retry">もう一度、出撃する　↗</button>`;$('retry').onclick=start;tone(win?660:180,.7,'triangle',.1,win?400:-120);}
function levelUp(){if(state!=='playing'||xp<need)return;xp-=need;level++;need=Math.round(10+level*3);state='upgrade';toastTimer=0;$('toast').classList.remove('show');keys={};pointer=null;banishMode=false;choices=rollChoices();renderUpgrades();tone(880,.25,'sine',.08,400);ui();}
function rollChoices(previous=[]){
  const pool=upgradePool(),fresh=pool.filter(i=>!previous.includes(i)),old=pool.filter(i=>previous.includes(i)),result=[];
  while(result.length<3&&(fresh.length||old.length)){const source=fresh.length?fresh:old;result.push(source.splice(Math.floor(Math.random()*source.length),1)[0]);}
  return result;
}
function rerollChoices(){if(state!=='upgrade'||rerolls<=0||!upgradePool().some(i=>!choices.includes(i)))return;rerolls--;banishMode=false;choices=rollChoices(choices);renderUpgrades();}
function toggleBanish(){if(state!=='upgrade'||banishes<=0)return;banishMode=!banishMode;renderUpgrades();}
function banishChoice(n){
 if(state!=='upgrade'||banishes<=0||!Number.isInteger(n)||n<0||n>=choices.length)return;
 const removed=choices[n];banned.add(removed);banishes--;banishMode=false;
 const pool=upgradePool().filter(i=>!choices.includes(i));
 if(pool.length)choices[n]=pool[Math.floor(Math.random()*pool.length)];else choices.splice(n,1);
 renderUpgrades();
}
function renderUpgrades(){$('overlay').className='overlay upgrades'+(banishMode?' banishing':'');$('overlay').innerHTML=`<span class="badge">LEVEL ${String(level).padStart(2,'0')} REACHED</span><h2>CHOOSE YOUR POWER</h2><p>${banishMode?'削除する候補を選択（このプレイ中は出現しません）':'強化を選択 · 1 / 2 / 3 キーでも選択'}</p><div class="upgrade-actions"><button id="reroll" ${rerolls<=0||!upgradePool().some(i=>!choices.includes(i))?'disabled':''}>↻ リロール ${rerolls}/1</button><button id="banish" ${banishes<=0?'disabled':''}>${banishMode?'削除をキャンセル':'⊘ 候補から削除 '+banishes+'/1'}</button></div><div class="upgrade-options">`+choices.map((i,n)=>{if(i>=6){const k=i-6,skill=skills[k];return `<button class="choice" data-choice="${n}" style="--c:#8ecfff"><span class="weapon-icon">${skill.icon}</span><div><span class="tag">${n+1} / SKILL LV.${skillLevels[k]} → ${skillLevels[k]+1}</span><b>${skill.name}</b><small>${skill.desc}</small></div></button>`;}if(i<0){const support=supports[-i-1];return `<button class="choice" data-choice="${n}" style="--c:#76f5c5"><span class="weapon-icon">${support.icon}</span><div><span class="tag">${n+1} / SUPPORT</span><b>${support.name}</b><small>${support.desc}</small></div></button>`};const w=weapons[i],evo=levels[i]===4;return `<button class="choice ${evo?'evolved':''}" data-choice="${n}" style="--c:${w.color}"><span class="weapon-icon">${w.icon}</span><div><span class="tag">${n+1} / ${evo?'✦ EVOLUTION':levels[i]?'LV.'+levels[i]+' → LV.'+(levels[i]+1):'NEW WEAPON'}</span><b>${evo?w.evo:w.name}</b><small>${upgradeSummary(i,levels[i])}</small></div></button>`;}).join('')+'</div>';document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.choice)));$('reroll').onclick=rerollChoices;$('banish').onclick=toggleBanish;}
function choose(n){if(state!=='upgrade'||!Number.isInteger(n)||n<0||n>=choices.length)return;if(banishMode){banishChoice(n);return;}const i=choices[n];if(i>=6){const k=i-6;if(!skills[k]||skillLevels[k]>=5)return;skillLevels[k]++;if(k===1)ship.hp=Math.min(maxHp(),ship.hp+20);if(k===0)ring(ship.x,ship.y,'#ffe65b',magnetRadius());}else if(i<0){if(i===-1)ship.hp=Math.min(maxHp(),ship.hp+25);if(i===-2)barrier=4;if(i===-3){score+=1500;clearOrange();}if(i===-4){ship.hp=Math.min(maxHp(),ship.hp+10);score+=500;}}else{if(!levels[i]&&levels.filter(Boolean).length>=MAX_WEAPONS)return;levels[i]++;cd[i]=0;if(levels[i]===5){flash=.7;shake=reduced?0:12;ring(ship.x,ship.y,weapons[i].color,550);burst(ship.x,ship.y,weapons[i].color,80,2);clearOrange();toast('EVOLUTION — '+weapons[i].evo,weapons[i].color);tone(330,.7,'sawtooth',.06,1000);}}state='playing';ship.inv=Math.max(ship.inv,1.5);$('overlay').innerHTML='';$('overlay').className='overlay';arsenal();ui();levelUp();}
function enemy(x,y,type=0,boss=false){const hp=boss? (wave===12?6800:wave===4?1200:1500+wave*160):Math.round(4+wave*1.4+wave*wave*.18)+(type===2?5+wave:0);return {x,y,type,boss,hp,max:hp,bossWave:boss?wave:0,r:boss?47:16,v:rand(15,24)+wave*2,t:rand(0,6.28),fire:rand(2.5,5),hit:0,salvos:0};}
function wavePacing(){return {rows:wave===1?5:wave<=3?4:3+Math.floor(wave/3),count:wave===1?4:wave<=3?5:5+Math.min(2,Math.floor(wave/4)),interval:wave===1?3.6:wave===2?3.5:wave===3?3.2:2.6};}
function spawn(){if(wave%4===0){if(!spawned){enemies.push(enemy(240,-70,3,true));spawned=1;hud('bossName','textContent',BOSS_NAMES[wave]);toast('WARNING — '+BOSS_NAMES[wave],'#ff94bd');$('bossHud').hidden=false;}return;}const {rows,count}=wavePacing();if(spawned>=rows)return;for(let i=0;i<count;i++){
  if(wave>=5&&spawned===1&&i===Math.floor(count/2))enemies.push(specialEnemy('warper'));
  else if(wave>=6&&spawned===2&&i===Math.floor(count/2))enemies.push(specialEnemy('sniper'));
  else if((wave>=3&&spawned===2&&i===count-1)||(wave>=5&&spawned===0&&i===0))enemies.push(specialEnemy('sentry',spawned===0?'left':wave%2?'right':'top'));
  else if(wave>=9&&spawned===rows-1&&i===1)enemies.push(specialEnemy('warper'));
  else{
    // Deterministic early mixes prevent unlucky opening volleys.
    const purpleCaster=wave>=5&&spawned===1&&i===count-2;
    const shooter=purpleCaster|| (wave===1?false:wave===2?spawned<3&&i===count-1:wave===3?spawned<3&&(i===1||(i===3&&spawned<2)):(i+spawned)%3!==0);
    const type=purpleCaster?2:!shooter||wave<=2?0:Math.floor(rand(0,Math.min(3,1+wave/3)));
    const x=wave===1?100+i*(280/(count-1))+(spawned%2?12:-12):65+i*(350/(count-1));
    const e=enemy(x,-35-spawned%2*14,type);e.canShoot=shooter;e.runner=!shooter;e.purpleCaster=purpleCaster;
    if(wave<=3)e.hp=e.max=wave===1?3:wave===2?5:7+(type===2?2:0);
    if(e.runner)e.v=(wave<=3?34:40)+wave*2;
    if(shooter&&wave<=3)e.fire=5+i*.7;
    enemies.push(e);
  }
}spawned++;}
// Special enemies keep their attacks tied to their living source.
function specialEnemy(role,entry='top'){
  const tx=role==='warper'?clamp(ship.x+rand(-110,110),65,W-65):rand(65,W-65);
  const ty=role==='sniper'?rand(115,205):rand(170,330);
  const e=enemy(entry==='left'?-35:entry==='right'?W+35:tx,entry==='top'?-40:ty,role==='warper'?2:1);
  Object.assign(e,{role,tx,ty,phase:role==='warper'?'warp':'approach',phaseTime:.65,fire:1,age:0,salvos:0});
  e.hp=e.max=Math.round(e.max*(role==='warper'?2.1:role==='sniper'?1.8:1.5));
  if(role==='warper'){
    e.x=tx;e.y=ty;
    effects.push({type:'portal',x:tx,y:ty,c:'#c59aff',life:.8,max:.8});
    burst(tx,ty,'#c59aff',20,.5);
    if(wave===2)toast('ワープ反応 — 予告範囲から退避','#ff94bd');
  }
  return e;
}
function beginHazard(e){
  if(hazards.filter(h=>h.owner.hp>0).length>=2){e.fire=.5;return;}
  if(e.role==='warper'){
    const r=48+Math.min(12,wave);
    hazards.push({type:'bomb',owner:e,x:clamp(ship.x,r+10,W-r-10),y:clamp(ship.y,FLIGHT_TOP+r,FLIGHT_BOTTOM-r),r,remaining:2.8,total:2.8,phase:'warning',hit:false,damage:24+wave});
  }else{
    const endY=H+25,endX=e.x+(ship.x-e.x)/Math.max(1,ship.y-e.y)*(endY-e.y);
    hazards.push({type:'lance',owner:e,x:e.x,y:e.y,tx:endX,ty:endY,width:14+Math.min(8,wave),remaining:2.2,total:2.2,phase:'warning',hit:false,damage:20+wave});
  }
  e.phase='charging';tone(600,.12,'sine',.035,150);
}
function updateSpecial(e,dt){
  e.age+=dt;
  if(e.phase==='warp'){
    e.phaseTime-=dt;if(e.phaseTime<=0){e.phase='ready';e.fire=.65;}
    return;
  }
  if(e.phase==='approach'){
    const dx=e.tx-e.x,dy=e.ty-e.y,d=Math.hypot(dx,dy),step=160*dt;
    if(d<=step){e.x=e.tx;e.y=e.ty;e.phase='ready';e.fire=.8;}
    else{e.x+=dx/d*step;e.y+=dy/d*step;}
    return;
  }
  if(e.phase!=='ready'||e.fire>0)return;
  if(e.role!=='sentry'){beginHazard(e);return;}
  const aim=Math.atan2(ship.y-e.y,ship.x-e.x),count=wave>=6?5:3;e.salvos++;
  for(let j=0;j<count;j++){
    const angle=aim+(j-(count-1)/2)*.17;
    hostile.push({x:e.x,y:e.y+15,vx:Math.cos(angle)*(115+wave*5),vy:Math.sin(angle)*(115+wave*5),r:5,dmg:11+wave,kind:j===0?'orange':'red'});
  }
  e.fire=Math.max(.9,2.1-wave*.07);
}
function updateHazards(dt){
  for(const h of hazards){
    if(h.owner.hp<=0){
      if(h.phase==='warning')effects.push({type:'cancel',x:h.type==='bomb'?h.x:h.owner.x,y:h.type==='bomb'?h.y:h.owner.y+35,c:'#76f5c5',life:.65,max:.65});
      h.dead=true;continue;
    }
    h.remaining-=dt;
    if(h.phase==='warning'&&h.remaining<=0){
      h.phase='active';h.remaining=h.type==='whiteZone'?.8:h.type==='bomb'?.45:.38;
      tone(h.type==='bomb'?85:260,.25,'sawtooth',.055,h.type==='bomb'?-50:500);
      if(h.type==='bomb'){ring(h.x,h.y,'#ff637f',h.r);burst(h.x,h.y,'#ff637f',32,1.2);}
      shake=Math.max(shake,reduced?0:5);
    }
    if(h.phase==='active'){
      const inside=h.type==='whiteZone'?(h.shape==='circle'?Math.hypot(ship.x-h.x,ship.y-h.y)<h.r+8:ship.x+8>h.x&&ship.x-8<h.x+h.width&&ship.y+8>h.y&&ship.y-8<h.y+h.height):h.type==='bomb'?Math.hypot(ship.x-h.x,ship.y-h.y)<h.r+8:segmentDistance(ship.x,ship.y,h.x,h.y,h.tx,h.ty)<h.width/2+8;
      if(inside&&!h.hit){hurt(h.damage,h.type==='whiteZone'?'white':h.type==='bomb'?'red':h.kind||'purple');h.hit=true;}
      if(h.remaining<=0){h.dead=true;if(h.type==='whiteZone'){h.owner.whiteCharge=0;h.owner.fire=h.owner.bossWave===8?.6:Math.max(h.owner.fire,1);}else{h.owner.phase='ready';h.owner.fire=h.owner.bossWave===8?.6:h.type==='bomb'?3.2:3;}}
    }
  }
  compact(hazards,h=>!h.dead);
}
function bullet(x,y,vx,vy,dmg,c,r=3,pierce=false,homing=false){bullets.push({x,y,vx,vy,dmg,c,r,pierce,homing,life:3.5,hit:new Set()});}

// All cancellation paths share this rule; red and purple shots are never erased.
function clearOrange(){for(const b of hostile)if(canCancel(b))b.dead=true;compact(hostile,b=>!canCancel(b));}
// Reuse array storage instead of allocating seven new arrays every frame.
function compact(list,keep){let write=0;for(let read=0;read<list.length;read++){const item=list[read];if(keep(item))list[write++]=item;}list.length=write;return list;}
// Conservative broad phase. Exact collision rules and original processing order stay intact.
class CollisionGrid{
 constructor(){this.buckets=Array.from({length:520},()=>[]);this.items=[];this.seen=[];this.epoch=0;this.result=[];}
 clear(){for(const b of this.buckets)b.length=0;this.items=[];this.seen.length=0;this.result.length=0;this.epoch=0;}
 bounds(x1,y1,x2,y2){this.x1=clamp(Math.floor((x1+400)/64),0,19);this.x2=clamp(Math.floor((x2+400)/64),0,19);this.y1=clamp(Math.floor((y1+400)/64),0,25);this.y2=clamp(Math.floor((y2+400)/64),0,25);}
 rebuild(items,swept){this.items=items;for(const b of this.buckets)b.length=0;for(let i=0;i<items.length;i++){const e=items[i];if(e.dead||e.hp<=0)continue;const px=swept?e.px:e.x,py=swept?e.py:e.y,r=e.r;this.bounds(Math.min(px,e.x)-r,Math.min(py,e.y)-r-(swept?0:8),Math.max(px,e.x)+r,Math.max(py,e.y)+r+(swept?0:8));for(let y=this.y1;y<=this.y2;y++)for(let x=this.x1;x<=this.x2;x++)this.buckets[y*20+x].push(i);}}
 query(x1,y1,x2,y2){this.bounds(x1,y1,x2,y2);const out=this.result;out.length=0;const epoch=++this.epoch;for(let y=this.y1;y<=this.y2;y++)for(let x=this.x1;x<=this.x2;x++)for(const i of this.buckets[y*20+x])if(this.seen[i]!==epoch){this.seen[i]=epoch;out.push(i);}out.sort((a,b)=>a-b);return out;}
}
const enemyGrid=new CollisionGrid(),orangeGrid=new CollisionGrid(),orangeShots=[];
function segmentDistanceSquared(x,y,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,t=clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1),0,1),px=x-ax-dx*t,py=y-ay-dy*t;return px*px+py*py;}
function segmentDistance(x,y,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,t=clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(x-ax-dx*t,y-ay-dy*t);}
function cancelOrangeAlong(ax,ay,bx,by,r=0){for(const b of hostile)if(!b.dead&&canCancel(b)&&segmentDistanceSquared(b.x,b.y,ax,ay,bx,by)<=(b.r+r)**2){b.dead=true;burst(b.x,b.y,ENEMY_SHOTS.orange.color,4,.4);}}
function cancelOrangeNear(x,y,r){cancelOrangeAlong(x,y,x,y,r);}
function target(x,y){let near=null,d=Infinity;for(const e of enemies){if(e.hp<=0||e.y<0)continue;const dd=(e.x-x)**2+(e.y-y)**2;if(dd<d){near=e;d=dd;}}return near;}
function damage(e,dmg,c){if(e.hp<=0)return;e.hp-=dmg;e.hit=.075;if(e.hp<=0){kills++;score+=e.boss?5000:100+wave*15;burst(e.x,e.y,c,e.boss?90:15,e.boss?2:1);ring(e.x,e.y,c,e.boss?220:30);shake=Math.max(shake,reduced?0:e.boss?14:2);tone(e.boss?80:rand(120,220),e.boss?.6:.09,'triangle',e.boss?.12:.025,-60);const count=e.boss?20:1;for(let j=0;j<count;j++)gems.push({x:e.x+rand(-15,15),y:e.y+rand(-15,15),v:e.boss?3:2});if(e.boss){clearOrange();$('bossHud').hidden=true;ship.hp=Math.min(maxHp(),ship.hp+10);}}}
function shoot(dt){for(let i=0;i<6;i++)cd[i]-=dt;for(let i=0;i<6;i++){const l=levels[i];if(!l||cd[i]>0)continue;const w=weapons[i],ev=l===5,c=w.color,stats={...weaponStats(i,l)};stats.damage*=1+skillLevels[2]*.1;stats.interval/=1+skillLevels[3]*.1;cd[i]=stats.interval;
if(i===0){const n=stats.count;for(let j=0;j<n;j++)bullet(ship.x+(j-(n-1)/2)*10,ship.y-20,(j-(n-1)/2)*(ev?40:13),-570,stats.damage,c,ev?4:3,stats.pierce);tone(530,.04,'square',.009,150);}
if(i===1){const n=stats.count;for(let j=0;j<n;j++){const a=-Math.PI/2+(j-(n-1)/2)*(ev?.11:.14);bullet(ship.x,ship.y-16,Math.cos(a)*440,Math.sin(a)*440,stats.damage,c,ev?4:3,stats.pierce);}}
if(i===2){const xs=stats.count===3?[ship.x-70,ship.x,ship.x+70]:[ship.x];for(const x of xs){const width=stats.width;effects.push({type:'beam',x,y:ship.y-20,w:width,c,life:.3,max:.3});cancelOrangeAlong(x,0,x,ship.y-20,width/2);for(const e of enemies)if(Math.abs(e.x-x)<width/2+e.r&&e.y<ship.y)damage(e,stats.damage,c);}tone(180,.2,'sawtooth',.025,600);}
if(i===3){for(let n=0;n<stats.count;n++)bullet(ship.x+(n-(l/2))*12,ship.y-10,rand(-180,180),-220,stats.damage,c,5,false,true);}
if(i===4){let from={x:ship.x,y:ship.y-20};const hit=new Set();for(let n=0;n<stats.count;n++){let e=null,nearest=Infinity;for(const candidate of enemies){if(candidate.hp<=0||candidate.y<=0||hit.has(candidate))continue;const distance=(candidate.x-from.x)**2+(candidate.y-from.y)**2;if(distance<nearest){nearest=distance;e=candidate;}}if(!e)break;hit.add(e);effects.push({type:'lightning',x:from.x,y:from.y,tx:e.x,ty:e.y,c,life:.22,max:.22});cancelOrangeAlong(from.x,from.y,e.x,e.y,5);damage(e,stats.damage,c);from=e;}}
if(i===5){for(let n=0;n<stats.count;n++){const a=time*1.7+n*Math.PI*2/stats.count;const x=ship.x+Math.cos(a)*44,y=ship.y+Math.sin(a)*25;bullet(x,y,Math.cos(a)*60,-500,stats.damage,c,3,stats.pierce);}}}}
// Each guardian has its own silhouette, movement and attack cycle.
const BOSS_NAMES={4:'DREADNOUGHT',8:'IRON CATHEDRAL',12:'SERAPH · VOID HEART'};
function bossShot(e,x,y,angle,speed,kind='red'){
  hostile.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:kind==='purple'?6:5,dmg:18+wave,kind});
}
function bossTelegraph(e,type,x,y,tx,ty){
  const h={type,owner:e,x,y,remaining:type==='bomb'?2.4:2.2,total:type==='bomb'?2.4:2.2,phase:'warning',hit:false,damage:type==='bomb'?30:34,kind:'red'};
  if(type==='bomb')h.r=48;else Object.assign(h,{tx,ty,width:22});
  hazards.push(h);
}
function updateBoss(e,dt){
  e.bossWave??=wave;
  const stage=e.bossWave;
  e.y=Math.min(stage===8?155:stage===12?190:135,e.y+dt*65);
  const phase=stage===12&&e.hp<=e.max*.5?2:1;
  if(phase===2&&e.form!==2){e.form=2;ring(e.x,e.y,'#f09fff',120);toast('SERAPH — 第二形態 · 六翼開放','#e2b3ff');e.fire=Math.max(e.fire,1.5);}
  if(stage===4)e.x=240+Math.sin(e.t*.65)*145;
  else if(stage===8)e.x=240+Math.sin(e.t*.32)*55;
  else e.x=240+Math.sin(e.t*(phase===2?.8:.48))*(phase===2?100:70);
  updateBossWhite(e,dt);
  const busy=hazards.some(h=>h.owner===e&&!h.dead);
  // Sparse covering fire during the readable part of a telegraph; pause near impact.
  if(stage===8&&busy){
    e.coverFire=(e.coverFire??.8)-dt;
    const warning=hazards.some(h=>h.owner===e&&!h.dead&&h.phase==='warning'&&h.remaining>.7);
    if(warning&&e.coverFire<=0){for(const side of [-1,1]){const x=e.x+side*78,y=e.y+30;bossShot(e,x,y,Math.atan2(ship.y-y,ship.x-x),145,'red');}e.coverFire=1.25;}
  }else e.coverFire=.8;
  e.attackLabel=busy?(e.whiteHazard&&!e.whiteHazard.dead?'DANGER · 退避':stage===8?'SIEGE · 爆撃予告':'PRISM · レーザー予告'):stage===8?'TWIN BATTERY':stage===12?(phase===2?'SERAPH · 六翼':'SERAPH · 四翼'):'DREADNOUGHT';
  if(e.fire<=0&&e.y>90&&!busy){
    e.salvos++;
    if(stage===4){
      for(let j=0;j<7;j++)bossShot(e,e.x,e.y+30,Math.PI/2+(j-3)*.16+Math.sin(e.t)*.2,166,e.salvos%8===0&&Math.abs(j-3)<=1?'purple':j%5===2?'orange':'red');
      e.fire=1.4;
    }else if(stage===8){
      // Alternating turrets aim at a fixed snapshot; the next attack leaves a broad corridor.
      if(e.salvos%4===0){
        const cx=clamp(ship.x,85,395);
        bossTelegraph(e,'bomb',clamp(cx-82,60,420),610);
        bossTelegraph(e,'bomb',clamp(cx+82,60,420),650);
        toast('IRON CATHEDRAL — 挟撃爆撃','#ffac78');
      }else if(e.salvos%2===0){
        const gap=Math.floor(e.salvos/4)%2===0?150:330;
        for(let x=38;x<=442;x+=36)if(Math.abs(x-gap)>48)bossShot(e,x,e.y+48,Math.PI/2,175,'red');
      }else{
        for(const side of [-1,1]){const x=e.x+side*78,aim=Math.atan2(ship.y-e.y,ship.x-x);for(let j=-2;j<=2;j++)bossShot(e,x,e.y+30,aim+j*.105,190,j===-2?'orange':'red');}
      }
      // Rare three-shot purple salvo marks this cycle's heavy artillery.
      if(e.salvos%8===0)for(let j=-1;j<=1;j++)bossShot(e,e.x,e.y+35,Math.PI/2+j*.27,150,'purple');
      e.fire=1.05;
    }else{
      if(e.salvos%4===0){
        const target=clamp(ship.x,85,395);
        for(const side of [-1,1])bossTelegraph(e,'laser',e.x+side*58,e.y+20,clamp(target+side*70,25,455),745);
        toast('SERAPH — プリズム照射','#eea2ff');
      }else{
        // A rotating broken halo: broad angular gaps stay visible between petals.
        const count=phase===2?22:18,spin=e.salvos*.31;
        for(let j=0;j<count;j++){const a=j/count*Math.PI*2+spin;if(Math.abs(Math.atan2(Math.sin(a-Math.PI/2),Math.cos(a-Math.PI/2)))<.22)continue;bossShot(e,e.x+Math.cos(a)*45,e.y+Math.sin(a)*45,a,phase===2?185:155,j%7===0?'orange':'red');}
        if(phase===2)for(let j=-1;j<=1;j++)bossShot(e,e.x,e.y+30,Math.atan2(ship.y-e.y,ship.x-e.x)+j*.17,205,'red');
      }
      if(e.salvos%8===0)for(let j=-1;j<=1;j++)bossShot(e,e.x,e.y+35,Math.PI/2+j*.32,155,'purple');
      e.fire=phase===2?1.05:1.35;
    }
  }
  hud('bossLife','width',Math.max(0,e.hp/e.max*100)+'%');
  hud('bossName','textContent',BOSS_NAMES[stage]);
}
function drawUniqueBoss(e){
  const stage=e.bossWave??wave,c=e.hit>0?'#fff':stage===8?'#ffaf75':'#d5a0ff';
  ctx.save();ctx.shadowBlur=0;ctx.lineWidth=2;ctx.strokeStyle=c;
  if(stage===8){
    // Broad armored hull, separated shoulder batteries and a shielded central reactor.
    ctx.fillStyle='#262737';ctx.beginPath();ctx.moveTo(-102,-13);ctx.lineTo(-74,-38);ctx.lineTo(-35,-26);ctx.lineTo(-22,-45);ctx.lineTo(22,-45);ctx.lineTo(35,-26);ctx.lineTo(74,-38);ctx.lineTo(102,-13);ctx.lineTo(88,31);ctx.lineTo(32,24);ctx.lineTo(20,45);ctx.lineTo(-20,45);ctx.lineTo(-32,24);ctx.lineTo(-88,31);ctx.closePath();ctx.fill();ctx.stroke();
    for(const side of [-1,1]){ctx.fillStyle='#111a2a';ctx.fillRect(side*78-14,-18,28,66);ctx.strokeRect(side*78-14,-18,28,66);glow(c,10);ctx.fillRect(side*78-8,34,16,6);ctx.shadowBlur=0;ctx.strokeStyle='#738095';for(let i=0;i<3;i++)ctx.strokeRect(side*49-11,-14+i*11,22,6);}
    ctx.fillStyle='#11151e';ctx.strokeStyle=c;ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(25,0);ctx.lineTo(0,30);ctx.lineTo(-25,0);ctx.closePath();ctx.fill();ctx.stroke();glow('#ffc888',15);ctx.fillRect(-6,-12,12,29);
  }else{
    // Detached rotating wings open from four to six below half health.
    const wings=e.hp<=e.max*.5?6:4;ctx.rotate(e.t*(wings===6?.32:-.2));
    for(let i=0;i<wings;i++){ctx.save();ctx.rotate(i*Math.PI*2/wings);ctx.fillStyle='#231934';ctx.strokeStyle=c;ctx.beginPath();ctx.moveTo(31,0);ctx.lineTo(65,-18);ctx.lineTo(86,0);ctx.lineTo(58,12);ctx.closePath();ctx.fill();ctx.stroke();glow(c,10);ctx.fillRect(56,-2,20,3);ctx.restore();}
    ctx.strokeStyle='#a978d388';ctx.beginPath();ctx.arc(0,0,47,0,Math.PI*2);ctx.stroke();ctx.rotate(-e.t*(wings===6?.32:-.2));ctx.fillStyle='#140e23';ctx.strokeStyle=c;ctx.beginPath();ctx.moveTo(0,-32);ctx.lineTo(23,0);ctx.lineTo(0,32);ctx.lineTo(-23,0);ctx.closePath();ctx.fill();ctx.stroke();glow(wings===6?'#ff8aaa':'#e1b9ff',22);ctx.beginPath();ctx.ellipse(0,0,11,19,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#371645';ctx.fillRect(-3,-12,6,24);
  }
  ctx.restore();ctx.shadowBlur=0;ctx.fillStyle=c;ctx.font='8px monospace';ctx.textAlign='center';if(stage===8)ctx.fillText(e.attackLabel||BOSS_NAMES[stage],0,65);
}

// Rare white attacks use large fixed telegraphs: siege blast or orbital laser.
function updateBossWhite(e,dt){
  if(wave<8||e.y<90||hazards.some(h=>h.owner===e&&h.type!=='whiteZone'&&!h.dead))return;
  if(e.whiteHazard&&!e.whiteHazard.dead){e.whiteCharge=e.whiteHazard.phase==='warning'?e.whiteHazard.remaining:0;return;}
  e.whiteCharge=0;e.whiteClock=(e.whiteClock??12)-dt;
  if(e.whiteClock>0)return;
  const width=wave===12?200:170;
  const h={type:'whiteZone',owner:e,x:clamp(ship.x-width/2,18,W-width-18),y:180,width,height:H-180,remaining:3,total:3,phase:'warning',hit:false,damage:MAX_HP};
  if(wave===8)Object.assign(h,{shape:'circle',x:clamp(ship.x,100,W-100),y:clamp(ship.y,FLIGHT_TOP+55,H-85),r:82});
  hazards.push(h);e.whiteHazard=h;e.whiteCharge=3;e.whiteClock=20;
  toast('DANGER — 白い範囲から退避','#ffffff');tone(420,.25,'sine',.06,-100);
}
function hurt(amount=12+wave,kind='orange'){if(ship.inv>0||(barrier>0&&kind==='orange')||state!=='playing')return;ship.hp=kind==='white'?0:Math.max(0,ship.hp-amount*(kind==='orange'?1-skillLevels[5]*.08:1));ship.inv=1.1;shake=reduced?0:12;flash=.2;burst(ship.x,ship.y,'#ff698e',25);tone(110,.3,'sawtooth',.06,-70);if(ship.hp<=0&&ship.hearts>0){ship.hearts--;ship.hp=maxHp();ship.inv=3;ring(ship.x,ship.y,'#ff86ad',140);burst(ship.x,ship.y,'#ff86ad',40);toast('REVIVE — HP FULL · 3秒間無敵','#ffb5cd');tone(660,.5,'sine',.08,300);}ui();if(ship.hp<=0)finish(false);}
function update(dt){visualTime+=dt;for(const s of stars){s.y+=(state==='playing'?28:9)*s.z*dt;if(s.y>H){s.y=0;s.x=rand(0,W);}}if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('toast').classList.remove('show');}if(state!=='playing')return;time+=dt;waveTime+=dt;ship.inv-=dt;barrier=Math.max(0,barrier-dt);shieldCd=Math.max(0,shieldCd-dt);const movementSpeed=300*(1+skillLevels[4]*.08)*(keys.Space?.5:1);shake=Math.max(0,shake-dt*30);flash=Math.max(0,flash-dt);let dx=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0),dy=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0);if(dx||dy){const norm=Math.hypot(dx,dy);ship.x+=dx/norm*movementSpeed*dt;ship.y+=dy/norm*movementSpeed*dt;}if(pointer){const px=pointer.x-ship.x,py=pointer.y-ship.y,distance=Math.hypot(px,py),step=Math.min(distance,movementSpeed*dt);ship.x+=px/(distance||1)*step;ship.y+=py/(distance||1)*step;}ship.x=clamp(ship.x,22,W-22);ship.y=clamp(ship.y,FLIGHT_TOP,FLIGHT_BOTTOM);
spawnClock-=dt;if(spawnClock<=0){spawn();spawnClock=wavePacing().interval;}shoot(dt);
for(const e of enemies){if(e.hp<=0)continue;e.t+=dt;e.hit-=dt;e.fire-=dt;if(e.role){updateSpecial(e,dt);continue;}if(e.boss){updateBoss(e,dt);}else{e.y+=e.v*dt;e.x+=Math.cos(e.t*1.4)*dt*(e.type===1?24:9);if(e.canShoot!==false&&e.fire<=0&&e.y>80&&e.y<510&&time>7){const aim=Math.atan2(ship.y-e.y,ship.x-e.x);const count=e.type===2&&wave>=3?3:1;e.salvos++;for(let j=0;j<count;j++){const a=aim+(j-(count-1)/2)*.18;hostile.push({x:e.x,y:e.y+15,vx:Math.cos(a)*(105+wave*5),vy:Math.sin(a)*(105+wave*5),r:5,dmg:10+wave+e.type*2,kind:e.purpleCaster&&e.salvos%3===0&&j===Math.floor(count/2)?'purple':wave<=2||e.salvos%4===0?'orange':'red'});}e.fire=wave<=3?rand(5,6.5):rand(2.5,4.5)/(1+wave*.055);}if(e.y>H-10){e.hp=0;if(!e.runner)hurt(15+wave);}}if(Math.hypot(e.x-ship.x,e.y-ship.y)<e.r+13){hurt(22+wave);if(!e.boss)damage(e,999,'#ff698e');}}
for(const b of hostile){b.px=b.x;b.py=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;}
orangeShots.length=0;for(const h of hostile)if(!h.dead&&canCancel(h))orangeShots.push(h);
const gridEnemies=bullets.length*enemies.length>1024,gridOrange=bullets.length*orangeShots.length>1024;
if(gridEnemies)enemyGrid.rebuild(enemies,false);if(gridOrange)orangeGrid.rebuild(orangeShots,true);
for(const b of bullets){const px=b.x,py=b.y;b.life-=dt;if(b.homing){const e=target(b.x,b.y);if(e){const angle=Math.atan2(e.y-b.y,e.x-b.x);b.vx+=(Math.cos(angle)*390-b.vx)*dt*5;b.vy+=(Math.sin(angle)*390-b.vy)*dt*5;}if(Math.random()<.5)particles.push({x:b.x,y:b.y,vx:0,vy:30,life:.2,max:.2,c:b.c,s:2});}b.x+=b.vx*dt;b.y+=b.vy*dt;const orangeCandidates=gridOrange?orangeGrid.query(Math.min(px,b.x)-b.r,Math.min(py,b.y)-b.r,Math.max(px,b.x)+b.r,Math.max(py,b.y)+b.r):orangeShots;for(let hi=0;hi<orangeCandidates.length;hi++){const h=gridOrange?orangeShots[orangeCandidates[hi]]:orangeCandidates[hi];if(h.dead)continue;if(segmentDistanceSquared(0,0,px-h.px,py-h.py,b.x-h.x,b.y-h.y)<=(b.r+h.r)**2){h.dead=true;burst(h.x,h.y,ENEMY_SHOTS.orange.color,5,.5);if(b.homing){ring(h.x,h.y,b.c,55);cancelOrangeNear(h.x,h.y,55);}if(!b.pierce){b.life=0;break;}}}if(b.life<=0)continue;const enemyCandidates=gridEnemies?enemyGrid.query(b.x-b.r,b.y-b.r,b.x+b.r,b.y+b.r):enemies;for(let ei=0;ei<enemyCandidates.length;ei++){const e=gridEnemies?enemies[enemyCandidates[ei]]:enemyCandidates[ei];if(e.hp<=0||b.hit.has(e))continue;if(Math.abs(e.y-b.y)<e.r+b.r+8&&Math.abs(e.x-b.x)<e.r+b.r){b.hit.add(e);damage(e,b.dmg,b.c);if(b.homing){ring(b.x,b.y,b.c,55);cancelOrangeNear(b.x,b.y,55);for(const o of enemies)if(o!==e&&Math.hypot(o.x-b.x,o.y-b.y)<70)damage(o,b.dmg*.6,b.c);}if(!b.pierce){b.life=0;break;}}}}
compact(bullets,b=>b.life>0&&b.y>-40&&b.y<H+50&&b.x>-80&&b.x<W+80);for(const effect of effects){if(effect.type==='beam')cancelOrangeAlong(effect.x,0,effect.x,effect.y,effect.w/2);else if(effect.type==='lightning')cancelOrangeAlong(effect.x,effect.y,effect.tx,effect.ty,5);}
for(const b of hostile){if(b.dead)continue;if(canCancel(b)&&levels[5]===5&&shieldCd<=0&&Math.hypot(b.x-ship.x,b.y-ship.y)<42){b.dead=true;shieldCd=.45;burst(b.x,ship.y,'#f1e890',4);}else if(Math.hypot(b.x-ship.x,b.y-ship.y)<b.r+8){if(canCancel(b))b.dead=true;hurt(b.dmg,b.kind);}}compact(hostile,b=>!b.dead&&b.y>-80&&b.y<H+20&&b.x>-30&&b.x<W+30);
updateHazards(dt);
if(state!=='playing')return;
for(const g of gems){const d=Math.hypot(ship.x-g.x,ship.y-g.y);if(d<=magnetRadius())g.attracted=true;if(g.attracted){const step=Math.min(d,520*dt);g.x+=(ship.x-g.x)/(d||1)*step;g.y+=(ship.y-g.y)/(d||1)*step;}else g.y+=65*dt;if(Math.hypot(ship.x-g.x,ship.y-g.y)<20){g.dead=true;xp+=g.v*(1+skillLevels[6]*.1);score+=10;}else if(g.y>H+6)g.dead=true;}compact(gems,g=>!g.dead);
for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.98;p.vy*=.98;}compact(particles,p=>p.life>0);for(const e of effects)e.life-=dt;compact(effects,e=>e.life>0);compact(enemies,e=>e.hp>0);
const done=spawned>=(wave%4===0?1:wavePacing().rows);if(done&&!enemies.length&&!hazards.length){transition+=dt;if(transition>1.5){if(wave===12){finish(true);return;}wave++;waveTime=0;spawned=0;spawnClock=.8;transition=0;clearOrange();ship.hp=Math.min(maxHp(),ship.hp+5);toast('WAVE '+String(wave).padStart(2,'0')+' — '+(wave%4===0?'CORE APPROACH':'DEEPER INTO THE VOID'));}}else transition=0;hud('timer','textContent',Math.floor(time/60).toString().padStart(2,'0')+':'+Math.floor(time%60).toString().padStart(2,'0'));ui();levelUp();}
function glow(c,blur=10){ctx.fillStyle=c;ctx.strokeStyle=c;ctx.shadowColor=c;ctx.shadowBlur=reduced?0:blur;}
const sprites=[['001000100','000101000','001111100','011010110','111111111','101111101','101000101','000101000'],['000111000','001111100','011111110','110101011','111111111','001101100','011000110','110000011'],['001111100','011111110','110101011','111111111','000111000','001010100','010000010','100000001']];
function drawEnemy(e){if(!e.role&&!e.boss&&window.VoidRender){const c=e.hit>0?'#ffffff':e.purpleCaster?'#c998ff':e.type===0?'#90e0c2':e.type===1?'#b2a1f5':'#ffbf82';window.VoidRender.enemy(ctx,e,c,sprites[e.type%3]);return;}ctx.save();ctx.translate(e.x,e.y);const c=e.hit>0?'#ffffff':e.boss?'#ff719c':e.purpleCaster?'#c998ff':e.type===0?'#90e0c2':e.type===1?'#b2a1f5':'#ffbf82';glow(c,e.boss?22:8);if(e.role){drawSpecialBody(e);ctx.restore();return;}if(e.boss&&(e.bossWave??wave)>=8){drawUniqueBoss(e);ctx.restore();return;}if(e.boss){if(e.whiteCharge>0){glow('#ffffff',24);ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,60,0,Math.PI*2);ctx.stroke();}ctx.rotate(Math.sin(e.t)*.1);ctx.beginPath();for(let j=0;j<8;j++){const a=j*Math.PI/4,r=j%2?26:53;const x=Math.cos(a)*r,y=Math.sin(a)*r;j?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.stroke();ctx.fillStyle='#261326';ctx.fill();ctx.rotate(-e.t*.4);ctx.strokeRect(-23,-23,46,46);glow('#ffb7d0',25);ctx.beginPath();ctx.arc(0,0,13+Math.sin(e.t*5)*3,0,7);ctx.fill();}else{if(e.runner)ctx.scale(.85,1.1);const map=sprites[e.type%3];map.forEach((row,y)=>[...row].forEach((bit,x)=>{if(bit==='1')ctx.fillRect((x-4.5)*3,(y-4)*3,2.8,2.8);}));}ctx.restore();}
function drawSpecialBody(e){
  const c=e.hit>0?'#fff':e.role==='warper'?'#c59aff':e.role==='sentry'?'#ffcc83':'#ff849e';
  ctx.save();glow(c,12);ctx.lineWidth=2;
  if(e.phase==='warp'){const scale=.35+.65*(1-e.phaseTime/.65);ctx.scale(scale,scale);ctx.globalAlpha=.45+.55*(1-e.phaseTime/.65);}
  if(e.role==='warper'){
    ctx.save();ctx.rotate(e.t*.6);ctx.strokeRect(-21,-21,42,42);ctx.rotate(Math.PI/4);ctx.strokeRect(-15,-15,30,30);ctx.restore();
    ctx.fillStyle='#20162f';ctx.beginPath();ctx.moveTo(0,-17);ctx.lineTo(17,0);ctx.lineTo(0,17);ctx.lineTo(-17,0);ctx.closePath();ctx.fill();ctx.stroke();
    glow(c,18);ctx.fillRect(-5,-5,10,10);
  }else if(e.role==='sentry'){
    ctx.fillStyle='#30241c';ctx.beginPath();ctx.moveTo(-18,-12);ctx.lineTo(18,-12);ctx.lineTo(23,9);ctx.lineTo(11,20);ctx.lineTo(-11,20);ctx.lineTo(-23,9);ctx.closePath();ctx.fill();ctx.stroke();
    glow(c,8);ctx.fillRect(-15,-4,6,7);ctx.fillRect(9,-4,6,7);ctx.fillRect(-3,4,6,22);
  }else{
    ctx.fillStyle='#2e1427';ctx.beginPath();ctx.moveTo(0,24);ctx.lineTo(-21,-15);ctx.lineTo(0,-7);ctx.lineTo(21,-15);ctx.closePath();ctx.fill();ctx.stroke();glow(c,18);ctx.fillRect(-3,-5,6,19);
  }
  ctx.restore();ctx.shadowBlur=0;ctx.fillStyle='#273040';ctx.fillRect(-21,-32,42,3);ctx.fillStyle=c;ctx.fillRect(-21,-32,42*clamp(e.hp/e.max,0,1),3);
  if(e.phase==='charging'){ctx.fillStyle=c;ctx.textAlign='center';ctx.font='bold 10px monospace';ctx.fillText('CHARGING',0,-40);}
}
function drawHazards(){
  for(const h of hazards){
    if(h.owner.hp<=0)continue;
    ctx.save();const warning=h.phase==='warning',c=h.type==='bomb'||h.kind==='red'?'#ff637f':'#da94ff';
    if(h.type==='whiteZone'&&h.shape==='circle'){
      ctx.shadowBlur=0;ctx.fillStyle=warning?'rgba(255,255,255,.10)':'rgba(255,255,255,.92)';ctx.strokeStyle='#ffffff';ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(h.x,h.y,h.r,0,Math.PI*2);ctx.fill();ctx.stroke();
      if(warning){ctx.setLineDash([8,6]);ctx.beginPath();ctx.arc(h.x,h.y,h.r+6,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.lineWidth=4;ctx.beginPath();ctx.arc(h.x,h.y,h.r-7,-Math.PI/2,-Math.PI/2+Math.PI*2*clamp(h.remaining/h.total,0,1));ctx.stroke();}
      ctx.fillStyle='#080e18';ctx.fillRect(h.x-68,h.y-27,136,60);ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.font='bold 17px monospace';ctx.fillText('DANGER · BLAST',h.x,h.y-7);ctx.font='bold 12px sans-serif';ctx.fillText('HP全損 · '+(warning?Math.max(0,h.remaining).toFixed(1)+'s':'発動中'),h.x,h.y+16);
      ctx.restore();continue;
    }
    if(h.type==='whiteZone'){
      ctx.shadowBlur=0;ctx.fillStyle=warning?'rgba(255,255,255,.10)':'rgba(255,255,255,.86)';ctx.fillRect(h.x,h.y,h.width,h.height);
      ctx.save();ctx.beginPath();ctx.rect(h.x,h.y,h.width,h.height);ctx.clip();ctx.strokeStyle=warning?'#ffffff40':'#ffffff';ctx.lineWidth=warning?2:5;
      for(let y=h.y-h.width;y<H;y+=28){ctx.beginPath();ctx.moveTo(h.x,y);ctx.lineTo(h.x+h.width,y+h.width);ctx.stroke();}ctx.restore();
      glow('#ffffff',warning?8:30);ctx.lineWidth=4;ctx.strokeRect(h.x,h.y,h.width,h.height);
      const cx=h.x+h.width/2,cy=H*.79;ctx.shadowBlur=0;ctx.fillStyle='#0a0e16';ctx.fillRect(cx-76,cy-30,152,90);
      ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.font='900 23px monospace';ctx.fillText('DANGER',cx,cy-5);ctx.font='bold 13px sans-serif';ctx.fillText('立入禁止 · HP全損',cx,cy+17);ctx.font='bold 18px monospace';ctx.fillText(warning?Math.max(0,h.remaining).toFixed(1)+'s':'発動中',cx,cy+43);
      if(warning){ctx.fillStyle='#ffffff';ctx.fillRect(h.x,h.y-8,h.width*clamp(h.remaining/h.total,0,1),4);}
      ctx.restore();continue;
    }
    ctx.shadowBlur=0;ctx.strokeStyle=c;ctx.lineWidth=1.5;
    if(h.type==='bomb'){
      if(warning){
        ctx.fillStyle='rgba(255,74,113,.10)';ctx.beginPath();ctx.arc(h.x,h.y,h.r,0,Math.PI*2);ctx.fill();ctx.setLineDash([7,5]);ctx.stroke();ctx.setLineDash([]);
        ctx.lineWidth=3;ctx.beginPath();ctx.arc(h.x,h.y,h.r+4,-Math.PI/2,-Math.PI/2+Math.PI*2*clamp(h.remaining/h.total,0,1));ctx.stroke();
        ctx.globalAlpha=.45;ctx.setLineDash([3,8]);ctx.beginPath();ctx.moveTo(h.owner.x,h.owner.y+24);ctx.lineTo(h.x,h.y-h.r);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
        ctx.textAlign='center';ctx.font='bold 15px monospace';ctx.fillStyle=c;ctx.fillText('EMERGENCY',h.x,h.y-5);ctx.font='bold 22px monospace';ctx.fillText(Math.max(0,h.remaining).toFixed(1)+'s',h.x,h.y+18);
      }else{
        glow(c,22);ctx.globalAlpha=.5;ctx.beginPath();ctx.arc(h.x,h.y,h.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.9;ctx.lineWidth=5;ctx.stroke();ctx.fillStyle='#ffe8ec';ctx.beginPath();ctx.arc(h.x,h.y,h.r*.38,0,Math.PI*2);ctx.fill();
      }
    }else{
      ctx.beginPath();ctx.moveTo(h.x,h.y+18);ctx.lineTo(h.tx,h.ty);
      if(warning){ctx.setLineDash([9,7]);ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);ctx.textAlign='center';ctx.fillStyle=c;ctx.font='bold 12px monospace';ctx.fillText('LASER '+Math.max(0,h.remaining).toFixed(1)+'s',clamp(h.x,65,W-65),h.y+48);}
      else{glow(c,25);ctx.lineWidth=h.width;ctx.stroke();ctx.strokeStyle='#fff0ff';ctx.lineWidth=h.width*.35;ctx.stroke();}
    }
    ctx.restore();
  }
}
function drawShip(x,y,demo=false){
 if(window.VoidArt){window.VoidArt.tether(ctx,x,y,visualTime);window.VoidArt.heroSprite(ctx,x,y,visualTime,!demo&&ship.inv>0,!demo&&keys.Space,demo?0:pointer?Math.max(-1,Math.min(1,(pointer.x-x)/40)):(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0));return;}
 ctx.save();ctx.translate(x,y);glow('#8edfff',10);ctx.fillRect(-6,-18,12,12);ctx.fillRect(-10,-5,20,18);ctx.fillRect(-9,13,6,14);ctx.fillRect(3,13,6,14);ctx.restore();
}
const arenaGradient=ctx.createRadialGradient(250,270,0,240,300,420);arenaGradient.addColorStop(0,'#112b3040');arenaGradient.addColorStop(1,'#080c1600');
const zoneGradient=ctx.createLinearGradient(0,H*.7,0,H);zoneGradient.addColorStop(0,'#55e6b501');zoneGradient.addColorStop(1,'#55e6b50b');
function draw(){ctx.clearRect(0,0,W,H);ctx.fillStyle='#070c17';ctx.fillRect(0,0,W,H);ctx.fillStyle=arenaGradient;ctx.fillRect(0,0,W,H);ctx.save();if(shake&&!reduced)ctx.translate(rand(-shake,shake),rand(-shake,shake));ctx.shadowBlur=0;for(const s of stars){ctx.globalAlpha=.25+s.z*.6;ctx.fillStyle=s.z>.8?'#a5d9d0':'#657d9f';ctx.fillRect(s.x,s.y,s.s,s.s);}ctx.globalAlpha=1;window.VoidArt?.background(ctx,visualTime);window.VoidArt?.mothership(ctx,visualTime);ctx.strokeStyle='#5ab9e025';ctx.lineWidth=1;ctx.setLineDash([4,7]);ctx.beginPath();ctx.moveTo(0,FLIGHT_TOP);ctx.lineTo(W,FLIGHT_TOP);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=zoneGradient;ctx.fillRect(0,H*.7,W,H*.3);
if(state==='title'){for(let row=0;row<3;row++)for(let n=0;n<7;n++)drawEnemy({x:57+n*61+Math.sin(visualTime)*6,y:92+row*54,type:row,hit:0,t:visualTime});drawShip(240,592,true);}else{for(const g of gems){if(window.VoidRender){window.VoidRender.gem(ctx,g,visualTime);continue;}ctx.save();glow('#ffe65b',6);ctx.beginPath();ctx.moveTo(g.x,g.y-4.5);ctx.lineTo(g.x+3,g.y);ctx.lineTo(g.x,g.y+4.5);ctx.lineTo(g.x-3,g.y);ctx.closePath();ctx.strokeStyle='#302708';ctx.lineWidth=2;ctx.stroke();ctx.fill();ctx.restore();}for(const e of enemies)drawEnemy(e);ctx.shadowBlur=0;for(const b of bullets){if(window.VoidRender){window.VoidRender.bullet(ctx,b);continue;}glow(b.c,10);ctx.lineWidth=b.r*1.4;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*.018,b.y-b.vy*.018);ctx.stroke();ctx.fillStyle='#fff';ctx.fillRect(b.x-1,b.y-3,2,4);}drawShip(ship.x,ship.y);if(levels[5]){const n=weaponStats(5,levels[5]).count;for(let j=0;j<n;j++){const a=time*1.7+j*Math.PI*2/n,x=ship.x+Math.cos(a)*44,y=ship.y+Math.sin(a)*25;glow('#f1e890',12);ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.strokeRect(-5,-5,10,10);ctx.restore();}if(levels[5]===5){ctx.globalAlpha=.25;ctx.beginPath();ctx.ellipse(ship.x,ship.y,48,32,0,0,7);ctx.stroke();ctx.globalAlpha=1;}}}
for(const e of effects){ctx.globalAlpha=Math.max(0,e.life/e.max);glow(e.c,20);if(e.type==='ring'){ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,e.r*(1-e.life/e.max),0,7);ctx.stroke();}else if(e.type==='beam'){ctx.fillStyle=e.c;ctx.fillRect(e.x-e.w/2,0,e.w,e.y);ctx.fillStyle='#eaffff';ctx.fillRect(e.x-e.w*.15,0,e.w*.3,e.y);}else if(e.type==='portal'){ctx.save();ctx.translate(e.x,e.y);ctx.scale(1,.48);ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,15+38*e.life/e.max,0,Math.PI*2);ctx.stroke();ctx.rotate(visualTime*2);ctx.strokeRect(-24,-24,48,48);ctx.restore();}else if(e.type==='cancel'){ctx.textAlign='center';ctx.font='bold 12px monospace';ctx.fillText('CANCELLED',e.x,e.y);}else{ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(e.x,e.y);for(let j=1;j<=8;j++)ctx.lineTo(e.x+(e.tx-e.x)*j/8+(j===8?0:rand(-14,14)),e.y+(e.ty-e.y)*j/8);ctx.stroke();}}ctx.globalAlpha=1;ctx.shadowBlur=0;for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/p.max);if(window.VoidRender){window.VoidRender.particle(ctx,p);continue;}glow(p.c,5);ctx.fillRect(p.x,p.y,p.s,p.s);}ctx.globalAlpha=1;ctx.shadowBlur=0;drawHazards();for(const b of hostile){if(b.dead)continue;if(window.VoidRender){window.VoidRender.hostile(ctx,b,ENEMY_SHOTS[b.kind||'orange'].color);continue;}ctx.save();glow(ENEMY_SHOTS[b.kind||'orange'].color,8);ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();glow(b.kind==='white'?'#ffffff':'#fff4f6',0);ctx.beginPath();ctx.arc(b.x,b.y,1.5,0,Math.PI*2);ctx.fill();ctx.restore();}if(keys.Space&&state==='playing'){ctx.save();ctx.strokeStyle='#ffe65b55';ctx.setLineDash([3,5]);ctx.lineWidth=1;ctx.beginPath();ctx.arc(ship.x,ship.y,magnetRadius(),0,Math.PI*2);ctx.stroke();ctx.restore();ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.beginPath();ctx.arc(ship.x,ship.y,8,0,7);ctx.stroke();ctx.fillStyle='#ffffff';ctx.fillRect(ship.x-2,ship.y-2,4,4);}ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.restore();if(flash&&!reduced){ctx.fillStyle=`rgba(180,255,226,${flash*.25})`;ctx.fillRect(0,0,W,H);}}
$('pause').onclick=pause;$('sound').onclick=()=>{unlockAudio();sound=!sound;$('sound').textContent='SOUND '+(sound?'ON':'OFF');if(sound)tone(660,.15);};
window.addEventListener('keydown',e=>{if((e.code==='Space'&&state==='playing')||(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)&&!['BUTTON','INPUT'].includes(document.activeElement.tagName)))e.preventDefault();if(e.repeat)return;if(e.code==='KeyP'||e.code==='Escape'){pause();return;}if(state==='upgrade'&&/^Digit[123]$/.test(e.code)){choose(Number(e.code.slice(-1))-1);return;}keys[e.code]=true;});window.addEventListener('keyup',e=>{keys[e.code]=false;});window.addEventListener('blur',()=>{keys={};pointer=null;if(state==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause();});
// Relative drag: touching anywhere anchors the current pilot position, never the finger position.
function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
canvas.addEventListener('pointerdown',e=>{if(state!=='playing'||pointer)return;const p=point(e);pointer={id:e.pointerId,x:ship.x,y:ship.y,lastX:p.x,lastY:p.y};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId||state!=='playing')return;const p=point(e);pointer.x=clamp(pointer.x+p.x-pointer.lastX,22,W-22);pointer.y=clamp(pointer.y+p.y-pointer.lastY,FLIGHT_TOP,FLIGHT_BOTTOM);pointer.lastX=p.x;pointer.lastY=p.y;});
for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>{if(pointer?.id===e.pointerId)pointer=null;});
$('focus').addEventListener('pointerdown',e=>{e.preventDefault();keys.Space=true;$('focus').setPointerCapture(e.pointerId);});for(const name of ['pointerup','pointercancel','lostpointercapture'])$('focus').addEventListener(name,()=>{keys.Space=false;});
let previous=performance.now();function frame(now){const dt=Math.min(.033,(now-previous)/1000);previous=now;update(dt);draw();requestAnimationFrame(frame);}ui();arsenal();title();draw();window.VoidArt?.ready.then(()=>draw());requestAnimationFrame(frame);
// Read-only diagnostics share the live game state; no gameplay cheats are exposed.
window.voidBloom={snapshot:()=>({state,wave,score,level,xp,need,kills,hp:ship.hp,time,weapons:[...levels],enemies:enemies.length,bullets:bullets.length,hostile:hostile.length,hazards:hazards.length,ship:{x:ship.x,y:ship.y},auto:true,focus:!!keys.Space,maxHp:maxHp(),skills:[...skillLevels],magnetRadius:magnetRadius(),hearts:ship.hearts,rerolls,banishes,banned:[...banned]})};
})();
