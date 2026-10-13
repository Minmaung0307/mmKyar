'use strict';
(function(){
 let nativeActive=false;
 const bar=document.createElement('div');bar.className='focus-toolbar';bar.hidden=true;
 function action(text,id){let b=document.createElement('button');b.textContent=text;b.setAttribute('aria-label',document.getElementById(id)?.textContent||text);b.title=document.getElementById(id)?.textContent||text;b.onclick=()=>document.getElementById(id)?.click();bar.append(b);}
 let exit=document.createElement('button');exit.textContent='⛶ ထွက်မယ်';bar.append(exit);
 if(document.getElementById('lesson-board')){action('💡','lesson-hint');action('▶','lesson-step');action('↻','lesson-flip');}else action('↻ Flip','flip');
 document.body.append(bar);
 function setFocus(on){document.body.classList.toggle('board-focus',on);bar.hidden=!on;document.querySelectorAll('[data-fullscreen]').forEach(b=>b.textContent=on?'⛶ ထွက်မယ်':'⛶ Full screen');}
 async function leave(){setFocus(false);if(document.fullscreenElement){try{await document.exitFullscreen();}catch{}}nativeActive=false;}
 async function toggle(){if(document.body.classList.contains('board-focus')){await leave();return;}setFocus(true);try{if(document.documentElement.requestFullscreen){await document.documentElement.requestFullscreen();nativeActive=!!document.fullscreenElement;}}catch{/* Keep the screen-filling layout when the browser refuses native fullscreen. */}}
 exit.onclick=leave;document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement){nativeActive=true;setFocus(true);}else if(nativeActive){nativeActive=false;setFocus(false);}});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('board-focus')&&!document.fullscreenElement)leave();});
 document.querySelectorAll('[data-fullscreen]').forEach(b=>b.onclick=toggle);window.KyarView={toggle};
})();
