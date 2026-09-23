'use strict';
// Small pre-rendered stamps preserve glow without repeatedly running canvas blur filters.
window.VoidRender=(()=>{
 const cache=new Map(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function stamp(key,w,h,paint){let sprite=cache.get(key);if(sprite)return sprite;const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d');c.translate(w/2,h/2);paint(c);sprite={canvas,w,h};if(cache.size>=512)cache.delete(cache.keys().next().value);cache.set(key,sprite);return sprite;}
 function glow(c,color,blur){c.fillStyle=color;c.strokeStyle=color;c.shadowColor=color;c.shadowBlur=reduced?0:blur;}
 function blit(ctx,s,x,y){ctx.drawImage(s.canvas,x-s.w/2,y-s.h/2);}
 function enemy(ctx,e,color,map){const sprite=stamp('enemy:'+e.type%3+':'+color,64,64,c=>{glow(c,color,8);map.forEach((row,y)=>{for(let x=0;x<row.length;x++)if(row[x]==='1')c.fillRect((x-4.5)*3,(y-4)*3,2.8,2.8);});});ctx.save();ctx.shadowBlur=0;ctx.translate(e.x,e.y);if(e.runner)ctx.scale(.85,1.1);blit(ctx,sprite,0,0);ctx.restore();}
 function hostile(ctx,b,color){const sprite=b._renderSprite||(b._renderSprite=stamp('hostile:'+color+':'+b.r,40,40,c=>{glow(c,color,8);c.beginPath();c.arc(0,0,b.r,0,Math.PI*2);c.fill();glow(c,b.kind==='white'?'#ffffff':'#fff4f6',0);c.beginPath();c.arc(0,0,1.5,0,Math.PI*2);c.fill();}));blit(ctx,sprite,b.x,b.y);}
 function particle(ctx,p){const size=Math.round(p.s*2)/2;const sprite=p._renderSprite||(p._renderSprite=stamp('particle:'+p.c+':'+size,24,24,c=>{glow(c,p.c,5);c.fillRect(0,0,size,size);}));blit(ctx,sprite,p.x,p.y);}
 function gem(ctx,g,t=0){
  // Eight reusable brightness frames: a glint on the diamond itself, no extra symbol.
  const phase=g._glintPhase??(g._glintPhase=g.x*.07+g.y*.03);
  const frame=reduced?3:Math.round(7*((1+Math.sin(t*4.2+phase))*.5)**6);
  blit(ctx,stamp('xp-blue-small:'+frame,20,20,c=>{
   const n=frame/7,color=`rgb(${Math.round(60+110*n)},${Math.round(160+65*n)},255)`;
   glow(c,color,2+2*n);c.beginPath();c.moveTo(0,-3);c.lineTo(2,0);c.lineTo(0,3);c.lineTo(-2,0);c.closePath();c.strokeStyle='#071c38';c.lineWidth=1;c.stroke();c.fill();
  }),g.x,g.y);
 }
 // Each evolution has its own silhouette. All glow is baked once, never blurred per shot.
 function polygon(c,points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
 function line(c,points,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
 function projectileSprite(skin,color){return stamp('weapon:'+skin+':'+color,80,120,c=>{
  glow(c,color,6);
  if(skin==='astra'||skin==='needle'){
   const rail=skin==='astra',tip=rail?-37:-28,tail=rail?19:12;
   polygon(c,[[0,tip],[-3,-15],[-4,tail],[0,tail+8],[4,tail],[3,-15]],'#d9fff0',color);
   polygon(c,[[-3,6],[-9,21],[-3,17],[3,17],[9,21],[3,6]],'#274743',color);
   line(c,[[0,tip+9],[0,tail+4]],rail?'#7affd0':'#fff1a1',2);
   c.globalAlpha=.4;line(c,[[-2,tail+8],[0,53],[2,tail+8]],color,2);
   if(rail){c.beginPath();c.ellipse(0,24,10,3,0,0,Math.PI*2);c.stroke();c.beginPath();c.ellipse(0,39,6,2,0,0,Math.PI*2);c.stroke();}
  }else if(skin==='blossom'){
   polygon(c,[[0,-19],[-13,4],[-10,14],[0,7],[10,14],[13,4]],'#d78726',color);
   polygon(c,[[0,-15],[-6,4],[0,1],[6,4]],'#fff0ad');
   line(c,[[-10,12],[0,18],[10,12]],'#ffedb0',2);c.globalAlpha=.35;
   polygon(c,[[-7,15],[0,39],[7,15],[0,22]],color);
  }else if(skin==='missile'||skin==='swarm'||skin==='torpedo'){
   const heavy=skin==='torpedo',swarm=skin==='swarm',w=heavy?9:swarm?5:3,h=heavy?24:swarm?15:10;
   polygon(c,[[0,-h-8],[-w,-h+3],[-w,h-4],[-w*.6,h],[w*.6,h],[w,h-4],[w,-h+3]],'#273447','#a9bfd2');
   polygon(c,[[0,-h-7],[-w,-h+4],[w,-h+4]],heavy?'#ffc885':color);
   polygon(c,[[-w,3],[-w-(heavy?10:6),h+3],[-w,h-2],[w,h-2],[w+(heavy?10:6),h+3],[w,3]],'#405267',color);
   c.fillStyle=color;c.fillRect(-w+2,-h+8,Math.max(2,w*2-4),3);c.fillRect(-2,-2,4,10);
   if(heavy){c.fillStyle='#80929f';c.fillRect(-15,-7,5,26);c.fillRect(10,-7,5,26);c.fillStyle='#ffe09d';c.fillRect(-15,-8,5,4);c.fillRect(10,-8,5,4);line(c,[[-7,5],[7,5]],'#0b1325',2);}
   polygon(c,[[-w*.6,h],[0,h+(heavy?26:swarm?23:15)],[w*.6,h]],color);
   polygon(c,[[-2,h],[0,h+12],[2,h]],'#c7f9ff');
   if(heavy)for(const x of [-12,12])polygon(c,[[x-2,19],[x,36],[x+2,19]],'#ff94bd');
   if(swarm){line(c,[[-10,8],[-7,1]],'#fbe2ef',1.5);line(c,[[10,8],[7,1]],'#fbe2ef',1.5);}
  }else if(skin==='eclipse'){
   polygon(c,[[0,-17],[-5,-5],[-10,3],[-4,2],[0,10],[4,2],[10,3],[5,-5]],'#ffed99',color);
   c.globalAlpha=.4;polygon(c,[[-3,8],[0,33],[3,8]],color);
  }else if(skin==='bastion'){
   polygon(c,[[-4,-18],[-7,-9],[-7,9],[7,9],[7,-9],[4,-18]],'#c5bc77',color);
   c.fillStyle='#fff3b4';c.fillRect(-2,-15,4,22);line(c,[[-9,4],[9,4]],color,2);
   c.globalAlpha=.45;polygon(c,[[-5,12],[0,35],[5,12]],color);
  }else if(skin==='nova'){
   polygon(c,[[0,-22],[-6,-7],[-4,10],[0,17],[4,10],[6,-7]],'#254b4b',color);
   polygon(c,[[0,-19],[-2,-3],[0,10],[2,-3]],'#d3ffef');
   line(c,[[-7,1],[-7,8],[0,14],[7,8],[7,1]],color,1.5);
   c.globalAlpha=.35;polygon(c,[[-3,16],[0,44],[3,16]],color);
  }else if(skin==='scatter'){
   polygon(c,[[0,-9],[-4,3],[0,8],[4,3]],'#ffe1a9',color);c.globalAlpha=.4;line(c,[[0,8],[0,22]],color,2);
  }else if(skin==='orbital'){
   polygon(c,[[0,-10],[-3,0],[0,8],[3,0]],'#f5ecad',color);c.globalAlpha=.4;line(c,[[0,8],[0,23]],color,2);
  }else{
   polygon(c,[[0,-10],[-3,-4],[-3,7],[0,11],[3,7],[3,-4]],color);line(c,[[0,-6],[0,6]],'#d8fff1',2);c.globalAlpha=.35;line(c,[[0,11],[0,24]],color,2);
  }
 });}
 function bullet(ctx,b){
  const sprite=b._renderSprite||(b._renderSprite=projectileSprite(b.skin||(b.homing?'missile':'pulse'),b.c));
  ctx.save();ctx.shadowBlur=0;ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vx,-b.vy));blit(ctx,sprite,0,0);ctx.restore();
 }
 function sparkSprite(color,heavy=false){return stamp('impact:'+color+':'+heavy,128,128,c=>{
  glow(c,color,8);
  for(let j=0;j<8;j++){const a=j*Math.PI/4,r=j%2?22:heavy?49:38;c.save();c.rotate(a);polygon(c,[[0,-r],[-3,-8],[0,1],[3,-8]],color);c.restore();}
  polygon(c,[[0,-12],[-10,0],[0,12],[10,0]],'#d8faff');
 });}
 function beam(ctx,e,t){
  const omega=e.skin==='omega',pillar=e.skin==='pillar',ev=omega||pillar;
  const strip=stamp('beam:'+e.skin+':'+e.c,128,32,c=>{
   const g=c.createLinearGradient(-64,0,64,0);g.addColorStop(0,e.c+'00');g.addColorStop(.16,e.c+'32');g.addColorStop(.28,e.c+'aa');g.addColorStop(.44,e.c);g.addColorStop(.5,'#c8f6ff');g.addColorStop(.56,e.c);g.addColorStop(.72,e.c+'aa');g.addColorStop(.84,e.c+'32');g.addColorStop(1,e.c+'00');c.fillStyle=g;c.fillRect(-64,-16,128,32);
  });
  ctx.drawImage(strip.canvas,e.x-e.w*.65,0,e.w*1.3,e.y);
  if(ev){
   ctx.strokeStyle=e.c;ctx.lineWidth=omega?2:1;
   for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(e.x+side*e.w*.44,0);ctx.lineTo(e.x+side*e.w*.44,e.y);ctx.stroke();}
   const travel=reduced?0:t*160;
   ctx.globalAlpha*=.6;
   for(let y=(travel%70);y<e.y-18;y+=70){const width=e.w*(omega?.42:.32);line(ctx,[[e.x-width,y-7],[e.x,y+7],[e.x+width,y-7]],'#c8f6ff',omega?2:1);}
   ctx.globalAlpha/=.6;
   const cap=stamp('beam-cap:'+e.skin,160,80,c=>{glow(c,'#8ecfff',10);c.lineWidth=2;for(const r of omega?[50,65]:[22,34]){c.beginPath();c.ellipse(0,0,r,12,0,0,Math.PI*2);c.stroke();}for(const side of [-1,1])polygon(c,[[side*(omega?50:28),-18],[side*(omega?65:41),0],[side*(omega?50:28),18]],'#163c61','#8ecfff');});
   blit(ctx,cap,e.x,e.y-4);
  }
 }
 function lightning(ctx,e,t){
  const heavy=e.skin==='thor',evolved=heavy||e.skin==='zeus',dx=e.tx-e.x,dy=e.ty-e.y,dist=Math.hypot(dx,dy);
  const frame=reduced?0:Math.floor(t*20)%4;
  ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.atan2(dy,dx));
  // Stable jagged geometry, without consuming gameplay randomness.
  const path=()=>{ctx.beginPath();ctx.moveTo(0,0);for(let j=1;j<=8;j++)ctx.lineTo(dist*j/8,j===8?0:Math.sin(j*13.7+frame*2.1)*(heavy?18:12));};
  path();ctx.strokeStyle=e.c+'35';ctx.lineWidth=heavy?18:evolved?10:5;ctx.stroke();ctx.strokeStyle=e.c;ctx.lineWidth=heavy?5:evolved?3:1.5;ctx.stroke();ctx.strokeStyle='#d7dcff';ctx.lineWidth=heavy?2.2:1;ctx.stroke();
  if(evolved){ctx.strokeStyle=e.c;ctx.lineWidth=1.3;for(let j=1;j<=3;j++){const x=dist*j/4,side=j%2?1:-1;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+8,side*15);ctx.lineTo(x-5,side*22);ctx.lineTo(x+8,side*32);ctx.stroke();}}
  ctx.restore();
  if(evolved){const s=sparkSprite(e.c,heavy);ctx.drawImage(s.canvas,e.tx-(heavy?28:17),e.ty-(heavy?28:17),heavy?56:34,heavy?56:34);}
 }
 function weaponImpact(ctx,e){
  const p=1-e.life/e.max,heavy=e.skin==='torpedo';
  if(e.blast){
   const frame=Math.min(7,Math.floor(p*8));
   const s=stamp('blast:'+e.skin+':'+frame,256,256,c=>{
    const q=frame/7,r=18+q*91;glow(c,e.c,5);c.lineWidth=heavy?3:2;
    c.globalAlpha=.12*(1-q);c.beginPath();c.arc(0,0,r*.84,0,Math.PI*2);c.fill();c.globalAlpha=.9;
    c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke();c.globalAlpha=.55;
    c.beginPath();c.arc(0,0,r*.68,0,Math.PI*2);c.stroke();
    for(let j=0;j<12;j++){const a=j*Math.PI/6+(heavy?.1:0);c.save();c.rotate(a);polygon(c,[[r*.6,-2],[r+8,0],[r*.6,2]],e.c);c.restore();}
    c.globalAlpha=1-q*.8;const core=30*(1-q)+5;polygon(c,[[0,-core],[-core*.7,0],[0,core],[core*.7,0]],'#ffb9d4');
   });
   ctx.drawImage(s.canvas,e.x-e.r*1.16,e.y-e.r*1.16,e.r*2.32,e.r*2.32);
  }else{
   ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.angle||0);const size=e.r*(.5+p);ctx.drawImage(sparkSprite(e.c,e.skin==='astra').canvas,-size/2,-size/2,size,size);ctx.restore();
  }
 }
 function muzzle(ctx,e){const s=sparkSprite(e.c,false),p=e.life/e.max,size=(e.skin==='astra'?50:32)*(.7+.3*p);ctx.drawImage(s.canvas,e.x-size/2,e.y-size/2,size,size);}
 function effect(ctx,e,t=0){
  if(!['beam','lightning','weaponImpact','muzzle','ring'].includes(e.type))return false;
  ctx.save();ctx.shadowBlur=0;
  if(e.type==='beam')beam(ctx,e,t);
  else if(e.type==='lightning')lightning(ctx,e,t);
  else if(e.type==='weaponImpact')weaponImpact(ctx,e);
  else if(e.type==='muzzle')muzzle(ctx,e);
  else{ctx.beginPath();ctx.arc(e.x,e.y,e.r*(1-e.life/e.max),0,Math.PI*2);ctx.strokeStyle=e.c+'22';ctx.lineWidth=6;ctx.stroke();ctx.strokeStyle=e.c;ctx.lineWidth=2;ctx.stroke();}
  ctx.restore();return true;
 }
 function orbital(ctx,x,y,skin,t=0){
  const fortress=skin==='bastion',ev=fortress||skin==='eclipse';
  const s=stamp('drone:'+skin,80,72,c=>{
   glow(c,'#f1e890',6);
   if(fortress){polygon(c,[[-18,-12],[-6,-17],[6,-17],[18,-12],[18,10],[9,16],[-9,16],[-18,10]],'#303746','#ffe6a1');c.fillStyle='#789298';c.fillRect(-14,-7,6,16);c.fillRect(8,-7,6,16);polygon(c,[[0,-13],[-6,-4],[-6,9],[6,9],[6,-4]],'#ece3a0');c.fillStyle='#273c51';c.fillRect(-2,-7,4,12);}
   else if(ev){polygon(c,[[-23,7],[-17,-6],[-8,-3],[0,-15],[8,-3],[17,-6],[23,7],[10,3],[0,11],[-10,3]],'#364650','#f1e890');polygon(c,[[0,-10],[-5,0],[0,6],[5,0]],'#fff2b2');}
   else polygon(c,[[0,-8],[-7,0],[0,8],[7,0]],'#324351','#f1e890');
   c.fillStyle='#d8faff';c.fillRect(-2,-3,4,5);
  });
  ctx.save();ctx.shadowBlur=0;blit(ctx,s,x,y);if(fortress){ctx.strokeStyle='#ffeaa780';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,25,Math.PI*1.1,Math.PI*1.9);ctx.stroke();}ctx.restore();
 }
 function orbitalField(ctx,x,y,skin,t=0){
  const heavy=skin==='bastion';ctx.save();ctx.shadowBlur=0;ctx.strokeStyle=heavy?'#ffe9a775':'#e9e08755';ctx.lineWidth=heavy?2:1;
  ctx.translate(x,y);ctx.scale(1,.67);const turn=reduced?0:t*.5;
  for(let j=0;j<(heavy?3:6);j++){const a=j*Math.PI*2/(heavy?3:6)+turn;ctx.beginPath();ctx.arc(0,0,48,a,a+(heavy?1.25:.62));ctx.stroke();}ctx.restore();
 }
 return {enemy,hostile,particle,gem,bullet,effect,orbital,orbitalField,stats:()=>({cachedStamps:cache.size})};
})();
