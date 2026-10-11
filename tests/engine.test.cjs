const assert=require('node:assert/strict'),K=require('../public/engine.js');
const empty=(rule='standard')=>({...K.initial(rule),b:Array(64).fill(0),seen:{}});
let s=K.initial();assert.equal(s.b.filter(x=>x===1).length,12);assert.equal(K.moves(s).length,7);
// Men cannot capture backward; kings can.
for(let who of [1,2]){s=empty();s.turn=who;s.b[26]=who;s.b[who===1?35:19]=3-who;assert.equal(K.steps(s.b,26,true).length,0);assert(K.steps(s.b,26,false).every(m=>who===1?m.to<26:m.to>26));s.b[26]=who+2;assert(K.steps(s.b,26,true).length>0);}
// e3 red captures d4 to c5; b4 black cannot capture back to d6.
s=empty();s.b[44]=1;s.b[35]=2;s.b[33]=2;let after=K.apply(s,K.moves(s)[0]);assert.equal(after.b[26],1);assert.equal(after.turn,2);assert(!K.moves(after).some(m=>m.path[0]===33&&m.hits.includes(26)));
s=empty();s.b[42]=1;s.b[35]=2;s.b[21]=2;let ms=K.moves(s);assert(ms.every(m=>m.hits.length===2));assert.equal(K.apply(s,ms[0]).turn,2);
// Crowning stops capture even when the newly crowned king has another capture.
for(let who of [1,2]){s=empty();s.turn=who;let flip=i=>who===1?i:63-i;s.b[flip(17)]=who;s.b[flip(10)]=3-who;s.b[flip(12)]=3-who;ms=K.moves(s);assert(ms.every(m=>m.path.length===2));after=K.apply(s,ms[0]);assert.equal(after.b[flip(3)],who+2);assert.equal(after.b[flip(12)],3-who);assert.equal(after.turn,3-who);assert(K.steps(after.b,flip(3),true).length>0);}
// Screenshot: h6 captures g7 to f8, but d6 survives until black has a turn.
s=empty();s.b[23]=1;s.b[14]=2;s.b[19]=2;s.b[7]=2;ms=K.moves(s);assert.deepEqual(ms[0].path,[23,5]);after=K.apply(s,ms[0]);assert.equal(after.b[5],3);assert.equal(after.b[19],2);assert.equal(after.turn,2);
s=empty();s.b[42]=3;s.b[28]=2;assert(K.moves(s).some(m=>m.path[1]===7));assert(K.moves(s).every(m=>m.hits.length));
s=empty();s.b[1]=1;s.b[62]=2;assert.equal(K.outcome(s),2);s.rule='suicide';assert.equal(K.outcome(s),1);
s=K.initial();s.quiet=80;assert.equal(K.outcome(s),0);s=K.initial();s.seen[s.b.join('')+'1']=3;assert.equal(K.outcome(s),0);
for(let level of ['easy','medium','difficult','advanced']){s=K.initial();let m=K.choose(s,level);assert(K.moves(s).some(x=>JSON.stringify(x)===JSON.stringify(m)));}
for(let n=0;n<8;n++){s=K.initial(n%2?'suicide':'standard');for(let i=0;i<200&&K.outcome(s)===null;i++){ms=K.moves(s);let m=ms[Math.floor(Math.random()*ms.length)],before=s.b.filter(Boolean).length;s=K.apply(s,m);assert.equal(s.b.filter(Boolean).length,before-m.hits.length);assert(s.b.every((p,i)=>!p||((i>>3)+i%8)%2===1));}}
console.log('Engine tests passed: setup, forward-only men, crowning ends turn, screenshot regressions, chains, promotion, flying kings, blockade, draws, AI levels, random games.');
