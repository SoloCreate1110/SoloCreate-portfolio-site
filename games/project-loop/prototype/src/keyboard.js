// Safari can skip buttons in its native Tab sequence unless an OS preference is enabled.
// Keep the game's order deterministic without changing any browser/OS preferences.
export function installKeyboardNavigation(root,dialog) {
 document.addEventListener('keydown',event=>{
  if(event.key==='Enter'&&event.target.matches?.('input[type="radio"]')){event.preventDefault();event.target.click();return;}
  if(event.key!=='Tab'||event.altKey||event.ctrlKey||event.metaKey)return;
  const scope=dialog.open?dialog:root;
  if(document.activeElement!==document.body&&!scope.contains(document.activeElement))return;
  const controls=[...scope.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),summary,[tabindex="0"]')].filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
  const current=document.activeElement,index=controls.indexOf(current);let next;
  if(index>=0)next=controls[index+(event.shiftKey?-1:1)];
  else if(scope.contains(current))next=event.shiftKey?[...controls].reverse().find(el=>current.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_PRECEDING):controls.find(el=>current.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING);
  else next=event.shiftKey?controls.at(-1):controls[0];
  if(!next&&dialog.open)next=event.shiftKey?controls.at(-1):controls[0];
  if(next){event.preventDefault();next.focus();}
 });
}
