(function(root){
'use strict';
const inside=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
const side=p=>p?((p===1||p===3)?1:2):0;
const dirs=[[-1,-1],[-1,1],[1,-1],[1,1]];
function initial(rule='standard'){let b=Array(64).fill(0);for(let r=0;r<8;r++)for(let c=0;c<8;c++)if((r+c)%2)b[r*8+c]=r<3?2:r>4?1:0;return {b,turn:1,rule,ply:0,quiet:0,seen:{[b.join('')+'1']:1}};}
function steps(b,i,capture){let p=b[i],r=i>>3,c=i%8,result=[];if(!p)return result;
 for(let [dr,dc] of dirs){if(p<3){if(dr!==(side(p)===1?-1:1))continue;if(capture){let nr=r+dr,nc=c+dc,lr=r+2*dr,lc=c+2*dc;if(inside(lr,lc)&&!b[lr*8+lc]&&side(b[nr*8+nc])===3-side(p))result.push({to:lr*8+lc,hit:nr*8+nc});}else if(dr===(side(p)===1?-1:1)&&inside(r+dr,c+dc)&&!b[(r+dr)*8+c+dc])result.push({to:(r+dr)*8+c+dc,hit:-1});}
 else {let hit=-1;for(let n=1;n<8;n++){let nr=r+dr*n,nc=c+dc*n;if(!inside(nr,nc))break;let j=nr*8+nc;if(b[j]){if(hit>=0||side(b[j])===side(p))break;hit=j;}else if(capture?hit>=0:hit<0)result.push({to:j,hit});}}
 }return result;}
function land(b,from,s){let out=b.slice(),p=out[from];out[from]=0;if(s.hit>=0)out[s.hit]=0;if(p===1&&s.to<8)p=3;if(p===2&&s.to>=56)p=4;out[s.to]=p;return out;}
function moves(state){let jumps=[],walks=[];function chain(b,i,path,hits,wasMan){if(wasMan&&b[i]>2){jumps.push({path,hits});return;}let next=steps(b,i,true);if(!next.length){jumps.push({path,hits});return;}for(let s of next)chain(land(b,i,s),s.to,[...path,s.to],[...hits,s.hit],b[i]<3);}
 for(let i=0;i<64;i++)if(side(state.b[i])===state.turn){let js=steps(state.b,i,true);if(js.length)for(let s of js)chain(land(state.b,i,s),s.to,[i,s.to],[s.hit],state.b[i]<3);else for(let s of steps(state.b,i,false))walks.push({path:[i,s.to],hits:[]});}if(!jumps.length)return walks;const most=jumps.reduce((n,m)=>Math.max(n,m.hits.length),0);return jumps.filter(m=>m.hits.length===most);}
function apply(state,m){let b=state.b.slice(),original=b[m.path[0]];for(let k=1;k<m.path.length;k++)b=land(b,m.path[k-1],{to:m.path[k],hit:m.hits[k-1]??-1});let turn=3-state.turn,key=b.join('')+turn;return {...state,b,turn,ply:state.ply+1,quiet:m.hits.length||original!==b[m.path.at(-1)]?0:state.quiet+1,seen:{...state.seen,[key]:(state.seen[key]||0)+1}};}
function outcome(s){let counts=[0,0,0];s.b.forEach(p=>counts[side(p)]++);if(!counts[1]||!counts[2]){let empty=!counts[1]?1:2;return s.rule==='suicide'?empty:3-empty;}if(!moves(s).length)return s.rule==='suicide'?s.turn:3-s.turn;if(s.quiet>=80||s.seen[s.b.join('')+s.turn]>=3)return 0;return null;}
// Positive scores favour the side to move. No random moves, including Easy.
function evaluate(s){let counts=[0,0,0],kings=[0,0,0];s.b.forEach(p=>{counts[side(p)]++;if(p>2)kings[side(p)]++;});let total=counts[1]+counts[2],scores=[0,0,0];
 s.b.forEach((p,i)=>{if(!p)return;let who=side(p),r=i>>3,c=i%8,advance=who===1?7-r:r,center=7-Math.abs(3.5-r)-Math.abs(3.5-c);let v=p>2?330:100;
 if(p<3){v+=advance*(total<12?9:4)+advance*advance*1.4; if(advance===6)v+=35;if(advance===0&&total>12)v+=14;for(let dc of [-1,1]){let rr=r+(who===1?1:-1),cc=c+dc;if(inside(rr,cc)&&side(s.b[rr*8+cc])===who)v+=7;}if(c===0||c===7)v+=5;}else v+=center*5;
 v+=center*(p<3?2:3);let mobility=steps(s.b,i,false).length;v+=Math.min(mobility,10)*(p>2?2:4);if(!mobility)v-=12;scores[who]+=v;});
 if(total<9&&kings[s.turn]>kings[3-s.turn])scores[s.turn]+=20;
 let value=scores[s.turn]-scores[3-s.turn];return s.rule==='suicide'?-value:value;}
const levels={easy:{depth:4,time:350},medium:{depth:8,time:1500},difficult:{depth:12,time:4500},advanced:{depth:18,time:12000}};
function choose(s,level,options={}){let legal=moves(s);if(!legal.length)return null;let cfg=levels[level]||levels.medium,deadline=Date.now()+(options.time??cfg.time),limit=options.depth??cfg.depth,nodes=0,completed=0,best=legal[0],tt=new Map(),ordering=new Map(),killers=[],history=new Map();const STOP={};
 const moveKey=m=>m.path.join('.');
 function key(st){return st.b.join('')+st.turn+'/'+st.quiet+'/'+Object.keys(st.seen).sort().map(k=>k+':'+st.seen[k]).join(',');}
 function order(st,ms,d){let pv=ordering.get(st.b.join('')+st.turn);return ms.map(m=>{let k=moveKey(m),piece=st.b[m.path[0]],to=m.path.at(-1),promote=piece<3&&(to<8||to>=56);let score=(k===pv?1000000:0)+m.hits.reduce((n,i)=>n+(st.b[i]>2?330:100),0)*100+(promote?15000:0)+(killers[d]===k?5000:0)+(history.get(st.turn+':'+k)||0);return {m,score};}).sort((a,b)=>b.score-a.score).map(x=>x.m);}
 function search(st,d,alpha,beta,q=0){nodes++;if(Date.now()>=deadline)throw STOP;let ms=moves(st),count1=0,count2=0;for(let p of st.b){if(side(p)===1)count1++;else if(side(p)===2)count2++;}let winner=null;if(!count1||!count2){let empty=!count1?1:2;winner=st.rule==='suicide'?empty:3-empty;}else if(!ms.length)winner=st.rule==='suicide'?st.turn:3-st.turn;
 if(winner!==null)return winner===st.turn?100000+Math.max(d,0):-100000-Math.max(d,0);if(st.quiet>=80||st.seen[st.b.join('')+st.turn]>=3)return 0;
 // Resolve compulsory exchanges before evaluating a position (quiescence).
 if(d<=0&&(!ms[0].hits.length||q>=16))return evaluate(st);
 let originalAlpha=alpha,k=d>0?key(st):null,entry=k?tt.get(k):null;if(entry&&entry.depth>=d){if(entry.flag==='exact')return entry.score;if(entry.flag==='lower')alpha=Math.max(alpha,entry.score);else beta=Math.min(beta,entry.score);if(alpha>=beta)return entry.score;}
 let bestScore=-Infinity,bestMove=ms[0];for(let m of order(st,ms,d)){let child=apply(st,m),score=-search(child,d-1,-beta,-alpha,d<=0?q+1:q);if(score>bestScore){bestScore=score;bestMove=m;}alpha=Math.max(alpha,score);if(alpha>=beta){if(!m.hits.length){let mk=moveKey(m);killers[d]=mk;let hk=st.turn+':'+mk;history.set(hk,Math.min(50000,(history.get(hk)||0)+d*d));}break;}}
 ordering.set(st.b.join('')+st.turn,moveKey(bestMove));if(k){if(tt.size>50000)tt.clear();tt.set(k,{depth:d,score:bestScore,flag:bestScore<=originalAlpha?'upper':bestScore>=beta?'lower':'exact'});}return bestScore;}
 // Only fully completed iterations replace the last reliable decision.
 for(let d=1;d<=limit;d++){let score=-Infinity,candidate=best,alpha=-Infinity;try{let ordered=order(s,legal,d);for(let m of ordered){let v=-search(apply(s,m),d-1,-Infinity,-alpha);if(v>score){score=v;candidate=m;}alpha=Math.max(alpha,v);}best=candidate;completed=d;ordering.set(s.b.join('')+s.turn,moveKey(best));if(Math.abs(score)>90000)break;}catch(e){if(e!==STOP)throw e;break;}}
 choose.lastStats={depth:completed,nodes,level};return best;}
const api={initial,side,steps,moves,apply,outcome,choose,evaluate,levels};if(typeof module!=='undefined')module.exports=api;root.Kyar=api;
})(globalThis);
