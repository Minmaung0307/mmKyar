const assert=require('node:assert/strict'),K=require('../public/engine.js');
// b4 is defended by the red king on a5. A careless h6 move exposes a forced loss.
const s={b:[0,0,0,1,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,4,0,0,3,0,2,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],turn:2,rule:'standard',ply:0,quiet:0,seen:{}};
const risk=m=>{const n=K.apply(s,m);return Math.max(0,...K.moves(n).map(x=>x.hits.reduce((v,i)=>v+(n.b[i]>2?3:1),0)));};
assert(risk(K.moves(s)[0])>=2);
for(let level of Object.keys(K.levels)){let m=K.choose(s,level,{time:1000,depth:K.levels[level].depth});assert.equal(risk(m),0,level+' must avoid giving away a forced capture');console.log(level,K.choose.lastStats);}
// Promotion retains the rule correction in tactical search as well.
const promotion={...K.initial(),b:Array(64).fill(0),seen:{}};promotion.b[23]=1;promotion.b[14]=2;promotion.b[19]=2;promotion.b[7]=2;
let m=K.choose(promotion,'advanced',{time:200});assert.deepEqual(m.path,[23,5]);assert.equal(K.apply(promotion,m).turn,2);
assert(K.levels.easy.depth<K.levels.medium.depth&&K.levels.medium.depth<K.levels.difficult.depth&&K.levels.difficult.depth<K.levels.advanced.depth);
console.log('AI tactics passed: all levels avoid a forced material loss; promotion stops turn; progressively larger search limits.');
