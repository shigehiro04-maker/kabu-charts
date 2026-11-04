/* 監視銘柄（トップ画面と株式分析ダッシュボードで共通）
   ・「監視に追加」した時点の IN・利確1・利確2・損切り（下落トレンドの銘柄は転換ライン）を固定して、この端末に保存
   ・サイトを開いたとき、追加日の翌営業日以降の日足で、その値段に来たかを判定して表示
   ・極端な急騰・急落の日（高値・安値が前日終値から ATR(14) の3倍を超えて動いた日）の到達は「急変で通過」として数えない
     その水準は株価が追加時の側へ戻ったら再び見張る
   ・追加時点で既に水準の向こう側（例: 株価がINゾーンの中）なら、いったん外へ出てから来たときに到達とする
   make_one_screen.py が dashboards/one/assets/watch.js にコピーします（元: watch_common.js） */
(function(){
const KEY='kabuMonitor',EXT=3;
const LABEL={in:'IN',t1:'利確1',t2:'利確2',stop:'損切り',trig:'転換ライン'};
const KIND={in:'IN',t1:'OUT',t2:'OUT',stop:'OUT',trig:'IN'};
function list(){try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}}
function save(a){try{localStorage.setItem(KEY,JSON.stringify(a));return true;}catch(e){return false;}}
const has=c=>list().some(x=>x.code===c);
function remove(c){save(list().filter(x=>x.code!==c));}
/* lv: シグナルの目安 {mode,in:[lo,hi],t1,t2,stop,trig,atr}。px: 追加時点の株価、asof: その目安の基準日 */
function add(code,name,lv,px,asof){
  const L=[],mk=(k,dir,o)=>L.push(Object.assign({k,dir},o));
  if(lv.mode==='wait'){if(lv.trig!=null)mk('trig','up',{p:lv.trig});}
  else{if(lv.in)mk('in','zone',{lo:lv.in[0],hi:lv.in[1]});if(lv.t1!=null)mk('t1','up',{p:lv.t1});if(lv.t2!=null)mk('t2','up',{p:lv.t2});if(lv.stop!=null)mk('stop','down',{p:lv.stop});}
  if(!L.length)return false;
  const a=list().filter(x=>x.code!==code);
  a.push({code,name,mode:lv.mode,px,asof,added:new Date().toISOString().slice(0,10),atr:lv.atr,levels:L,ack:{}});
  return save(a);}
const beyond=(l,v)=>l.dir==='zone'?(v>=l.lo&&v<=l.hi):l.dir==='up'?v>=l.p:v<=l.p;
const touch=(l,h,lo)=>l.dir==='zone'?(lo<=l.hi&&h>=l.lo):l.dir==='up'?h>=l.p:lo<=l.p;
const away=(l,h,lo)=>l.dir==='zone'?(lo>l.hi||h<l.lo):l.dir==='up'?h<l.p:lo>l.p;
/* P: 日足 {d,h,l,c}（株式分析ダッシュボードの DATA.px）→ 各水準の状態 */
function evaluate(w,P){
  const n=P.c.length,atr=new Array(n).fill(null);let e=null;
  for(let i=1;i<n;i++){const tr=Math.max(P.h[i]-P.l[i],Math.abs(P.h[i]-P.c[i-1]),Math.abs(P.l[i]-P.c[i-1]));
    e=e==null?tr:e+(tr-e)/14;if(i>=14)atr[i]=e;}
  const S=w.levels.map(l=>Object.assign({},l,{label:LABEL[l.k],kind:KIND[l.k],state:w.px!=null&&beyond(l,w.px)?'wait':'armed',start:null}));
  S.forEach(s=>{if(s.state==='wait')s.start='wait';});
  const ex=[];
  for(let i=1;i<n;i++){if(P.d[i]<=w.asof)continue;
    const h=P.h[i],lo=P.l[i],pc=P.c[i-1],a=atr[i-1]||w.atr;
    const big=a&&Math.max(h-pc,pc-lo)>EXT*a;if(big)ex.push({d:P.d[i],chg:(P.c[i]/pc-1)*100});
    for(const s of S){
      if(s.state==='hit')continue;
      if(s.state==='wait'||s.state==='skipped'){if(away(s,h,lo))s.state='armed';continue;}
      if(!touch(s,h,lo))continue;
      if(big){s.state='skipped';s.date=P.d[i];s.close=P.c[i];}
      else{s.state='hit';s.date=P.d[i];s.close=P.c[i];}}}
  return {levels:S,last:{d:P.d[n-1],c:P.c[n-1]},extreme:ex,days:P.d.filter(d=>d>w.asof).length};}
const isNew=(w,s)=>s.state==='hit'&&(w.ack||{})[s.k]!==s.date;
function ack(code,levels){const a=list(),w=a.find(x=>x.code===code);if(!w)return;w.ack=w.ack||{};
  levels.forEach(s=>{if(s.state==='hit')w.ack[s.k]=s.date;});save(a);}
/* 株式分析ダッシュボードのページ（one/コード.html）から日足を取り出す */
const cache={};
function loadPx(code,base){if(!cache[code])cache[code]=fetch(base+encodeURIComponent(code)+'.html',{cache:'no-cache'}).then(r=>r.ok?r.text():Promise.reject(r.status)).then(t=>{
  const i=t.indexOf('const DATA=');const j=t.indexOf(';</script>',i);return JSON.parse(t.slice(i+11,j)).px;});return cache[code];}
window.KW={list,save,has,add,remove,evaluate,isNew,ack,loadPx,LABEL};
})();
