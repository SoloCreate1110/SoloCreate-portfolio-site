export function hash(seed) { let n=2166136261; for(const c of seed) n=Math.imul(n ^ c.charCodeAt(0),16777619); return n>>>0; }
export function random(state) { let t=(state.rng+=0x6D2B79F5)>>>0; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); state.rngIndex++; return ((t^(t>>>14))>>>0)/4294967296; }
export function shuffle(state,items) { const a=[...items]; for(let i=a.length-1;i>0;i--) {const j=Math.floor(random(state)*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
