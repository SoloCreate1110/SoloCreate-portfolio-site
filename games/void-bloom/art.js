'use strict';
// Render the supplied green-screen artwork at runtime; source PNGs stay unchanged.
window.VoidArt=(()=>{
  const art={hero:null,earth:null};
  function loadKeyed(url,edgeOnly){return new Promise(resolve=>{
    const img=new Image();img.onload=()=>{
      try{
        const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
        const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);
        const frame=x.getImageData(0,0,c.width,c.height),p=frame.data,w=c.width,h=c.height;
        const green=i=>p[i*4+1]>100&&p[i*4+1]>p[i*4]*1.45&&p[i*4+1]>p[i*4+2]*1.45;
        const mask=new Uint8Array(w*h);
        if(edgeOnly){
          const queue=new Int32Array(w*h);let head=0,tail=0;
          const add=i=>{if(!mask[i]&&green(i)){mask[i]=1;queue[tail++]=i;}};
          for(let i=0;i<w;i++){add(i);add((h-1)*w+i);}for(let j=0;j<h;j++){add(j*w);add(j*w+w-1);}
          while(head<tail){const i=queue[head++],col=i%w;if(col>0)add(i-1);if(col<w-1)add(i+1);if(i>=w)add(i-w);if(i<w*(h-1))add(i+w);}
        }else for(let i=0;i<w*h;i++)if(green(i))mask[i]=1;
        for(let i=0;i<w*h;i++)if(mask[i])p[i*4+3]=0;
        x.putImageData(frame,0,0);resolve(c);
      }catch(error){console.warn('Artwork unavailable',error);resolve(null);}
    };img.onerror=()=>resolve(null);img.src=url;
  });}
  function portrait(){const c=document.getElementById('heroPortrait');if(!c||!art.hero)return;const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.imageSmoothingEnabled=false;x.drawImage(art.hero,190,40,815,1350,37,0,226,374);}
  art.ready=Promise.all([loadKeyed('assets/hero-source.png',false).then(c=>art.hero=c),loadKeyed('assets/earth-source.png',true).then(c=>art.earth=c)]).then(portrait);
  art.background=(ctx,t)=>{
    ctx.save();ctx.shadowBlur=0;
    const mist=ctx.createRadialGradient(360,220,5,250,340,420);mist.addColorStop(0,'#17395655');mist.addColorStop(.5,'#1d163326');mist.addColorStop(1,'#02070e00');ctx.fillStyle=mist;ctx.fillRect(0,0,480,720);
    // Planet rises past the lower edge, leaving the combat field unobstructed.
    if(art.earth){ctx.globalAlpha=.72;ctx.drawImage(art.earth,70,70,1115,1115,-140,550,760,760);ctx.globalAlpha=1;}
    else{const earth=ctx.createRadialGradient(240,910,200,240,910,355);earth.addColorStop(0,'#10233d');earth.addColorStop(.9,'#175484');earth.addColorStop(1,'#60cfff');ctx.fillStyle=earth;ctx.beginPath();ctx.arc(240,910,355,0,Math.PI*2);ctx.fill();}
    const shade=ctx.createLinearGradient(0,545,0,720);shade.addColorStop(0,'#03091600');shade.addColorStop(.4,'#03091644');shade.addColorStop(1,'#030916b8');ctx.fillStyle=shade;ctx.fillRect(0,530,480,190);
    ctx.strokeStyle='#7edcff40';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(240,935,390,380,Math.PI*.04,Math.PI,Math.PI*2);ctx.stroke();
    ctx.restore();
  };
  art.mothership=(ctx,t)=>{
    ctx.save();ctx.translate(240,690);ctx.shadowBlur=0;
    const aura=ctx.createRadialGradient(0,0,2,0,0,110);aura.addColorStop(0,'#6bceff24');aura.addColorStop(1,'#6bceff00');ctx.fillStyle=aura;ctx.fillRect(-115,-50,230,80);
    ctx.fillStyle='#101e32';ctx.strokeStyle='#6f92ae';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-101,9);ctx.lineTo(-78,-5);ctx.lineTo(-39,-8);ctx.lineTo(-23,-26);ctx.lineTo(23,-26);ctx.lineTo(39,-8);ctx.lineTo(78,-5);ctx.lineTo(101,9);ctx.lineTo(55,24);ctx.lineTo(-55,24);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#2b425d';ctx.fillRect(-58,0,116,12);ctx.fillStyle='#132437';ctx.fillRect(-25,-19,50,40);ctx.strokeStyle='#94bad3';ctx.strokeRect(-25,-19,50,40);
    ctx.fillStyle='#8de7ff';ctx.shadowColor='#56cfff';ctx.shadowBlur=8;ctx.fillRect(-14,-13,28,4);for(const x of [-73,-50,46,69])ctx.fillRect(x,2,5,3);
    ctx.fillStyle='#7df4df';ctx.fillRect(-5,-29,10,6);ctx.shadowBlur=0;ctx.fillStyle='#7192ae';ctx.font='7px monospace';ctx.textAlign='center';ctx.fillText('ARK-01',0,14);
    ctx.restore();
  };
  art.tether=(ctx,x,y,t)=>{
    ctx.save();ctx.shadowBlur=0;ctx.lineCap='round';const bend=Math.sin(t*1.4)*12;
    const path=()=>{ctx.beginPath();ctx.moveTo(240,661);ctx.bezierCurveTo(240+bend,640,x+25+bend,y+55,x,y+10);};
    path();ctx.strokeStyle='#050b13';ctx.lineWidth=6;ctx.stroke();path();ctx.strokeStyle='#7197ad';ctx.lineWidth=3;ctx.stroke();path();ctx.strokeStyle='#86e9ff';ctx.lineWidth=1;ctx.setLineDash([3,10]);ctx.lineDashOffset=-t*12;ctx.stroke();ctx.setLineDash([]);ctx.restore();
  };
  art.heroSprite=(ctx,x,y,t,inv,focus)=>{
    ctx.save();ctx.translate(x,y);if(inv&&Math.floor(t*12)%2)ctx.globalAlpha=.45;
    // The player's visual center and small collision core stay at the same coordinates.
    const tilt=0.025*Math.sin(t*2);ctx.rotate(tilt);ctx.imageSmoothingEnabled=false;
    ctx.shadowBlur=0;if(art.hero)ctx.drawImage(art.hero,190,40,815,1350,-21,-30,42,70);
    else{ctx.fillStyle='#c7dceb';ctx.fillRect(-6,-23,12,12);ctx.fillRect(-11,-10,22,23);ctx.fillRect(-17,-7,5,21);ctx.fillRect(12,-7,5,21);ctx.fillRect(-10,13,7,20);ctx.fillRect(3,13,7,20);ctx.fillStyle='#50dfff';ctx.fillRect(-3,-4,6,8);}
    ctx.globalAlpha=1;ctx.shadowColor='#53dfff';ctx.shadowBlur=8;ctx.fillStyle='#72eaff';ctx.fillRect(-2,-2,4,4);
    if(focus){ctx.shadowBlur=0;ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.stroke();}
    ctx.restore();
  };
  return art;
})();
