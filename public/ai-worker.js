importScripts('engine.js?v=7');
onmessage=e=>postMessage({token:e.data.token,move:Kyar.choose(e.data.state,e.data.level)});
