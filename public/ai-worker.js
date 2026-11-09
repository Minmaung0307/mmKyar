importScripts('engine.js?v=10');
onmessage=e=>postMessage({token:e.data.token,move:Kyar.choose(e.data.state,e.data.level)});
