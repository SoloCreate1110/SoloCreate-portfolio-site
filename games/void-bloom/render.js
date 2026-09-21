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
 function gem(ctx,g){blit(ctx,stamp('xp',32,32,c=>{glow(c,'#ffe65b',6);c.beginPath();c.moveTo(0,-6);c.lineTo(4,0);c.lineTo(0,6);c.lineTo(-4,0);c.closePath();c.strokeStyle='#302708';c.lineWidth=2;c.stroke();c.fill();c.shadowBlur=0;c.fillStyle='#fff6b0';c.beginPath();c.moveTo(0,-4);c.lineTo(0,3);c.lineTo(-2.5,0);c.closePath();c.fill();c.fillStyle='#ffe65b';c.fillRect(5,-7,1,5);c.fillRect(3,-5,5,1);}),g.x,g.y);}
 function bullet(ctx,b){const length=Math.max(1,Math.round(Math.hypot(b.vx,b.vy)*.018));let sprite=b._renderSprite;if(!sprite||b.homing&&b._renderLength!==length){sprite=stamp('bullet:'+b.c+':'+b.r+':'+length,48,64,c=>{glow(c,b.c,10);c.lineWidth=b.r*1.4;c.beginPath();c.moveTo(0,0);c.lineTo(0,length);c.stroke();c.fillStyle='#fff';c.fillRect(-1,-3,2,4);});b._renderSprite=sprite;b._renderLength=length;}ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vx,-b.vy));blit(ctx,sprite,0,0);ctx.restore();}
 return {enemy,hostile,particle,gem,bullet,stats:()=>({cachedStamps:cache.size})};
})();
