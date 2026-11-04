/* 監視銘柄（2026-11-15 作り直し）
   ・タイトルを付けた一覧表（リスト）をいくつでも作り、銘柄を入れて見る。この端末（ブラウザ）に保存
   ・以前の「監視に追加」（IN・利確・損切りの到達判定）と「お気に入り（★）」はやめた。
     それまでに登録していた銘柄は、最初に開いたとき「監視銘柄」「お気に入り」という一覧表に引き継ぐ
   ・監視銘柄ページ（watch.html）と株式分析ダッシュボード（one/）で共通。make_one_screen.py が one/assets/watch.js にコピー（変更前は watch_common.js.pre_lists）
   保存の形: [{id:"l1731…", t:"タイトル", c:["7203","6758",…]}, …] */
(function(){
const KEY='kabuLists',OLD_MON='kabuMonitor',OLD_FAV='kabuWatch';
let mem=null;
/* 2026-11-16 朝に一時入れた初期設定「主要指数」（指数の行）は取り消し。その版で作られた一覧表と指数の行は、次に開いたとき消す */
const IXC=["^N225", "^TOPIX", "348A"],DEFKEY=KEY+'Def';
const get=k=>{try{return localStorage.getItem(k);}catch(e){return null;}};
const arr=k=>{try{const a=JSON.parse(get(k)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}};
const uid=()=>'l'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const clean=a=>a.filter(x=>x&&typeof x.t==='string'&&Array.isArray(x.c)).map(x=>{const o={id:x.id||uid(),t:x.t,c:[...new Set(x.c.map(String))]};if(x.ix)o.ix=String(x.ix);return o;});
/* 初期設定の一覧表＝指数の採用銘柄（2026-11-16）。ix の付いた表は中身を監視銘柄ページが毎回入れ替える（手では足せない）。
   端末ごとに1度だけ先頭に入れる。消したら戻さない（目印 KEY+'Ix'） */
const IXDEF=[['n225','日経225'],['topix','TOPIX'],['y333','読売333']],IXKEY=KEY+'Ix';
function withIx(a){if(get(IXKEY))return a;const have=new Set(a.map(l=>l.ix).filter(Boolean));
  const add=IXDEF.filter(([k])=>!have.has(k)).map(([k,t])=>({id:uid(),t,c:[],ix:k}));
  const b=add.concat(a);mem=b;save(b);try{localStorage.setItem(IXKEY,'1');}catch(e){}return b;}
/* 監視銘柄ページから：最新の採用銘柄で ix の表を入れ替える。idx={キー:{c:[...]}} */
function sync(idx){if(!idx)return;let ch=false;lists().forEach(l=>{const x=l.ix&&idx[l.ix];if(x&&x.c.join()!==l.c.join()){l.c=x.c.slice();ch=true;}});if(ch)save(lists());}
function save(a){mem=a;try{localStorage.setItem(KEY,JSON.stringify(a));return true;}catch(e){return false;}}
function lists(){
  if(mem)return mem;
  const s=get(KEY);
  if(s!==null){try{mem=clean(JSON.parse(s));return withIx(undoDef(mem));}catch(e){}}
  /* 初回：以前の監視銘柄・お気に入りを引き継ぐ */
  const a=[],mon=arr(OLD_MON).map(x=>x&&x.code).filter(Boolean),fav=arr(OLD_FAV).filter(x=>typeof x==='string');
  if(mon.length)a.push({id:uid(),t:'監視銘柄',c:[...new Set(mon)]});
  if(fav.length)a.push({id:uid(),t:'お気に入り',c:[...new Set(fav)]});
  mem=a;return withIx(a);}
function undoDef(a){if(!get(DEFKEY))return a;
  a.forEach(l=>{l.c=l.c.filter(c=>!IXC.includes(c));});
  const b=a.filter(l=>!(l.t==='主要指数'&&!l.c.length));mem=b;save(b);try{localStorage.removeItem(DEFKEY);}catch(e){}return b;}
const find=id=>lists().find(x=>x.id===id);
function create(t){t=(t||'').trim();if(!t)return null;const a=lists(),l={id:uid(),t,c:[]};a.push(l);save(a);return l;}
function rename(id,t){t=(t||'').trim();const l=find(id);if(!l||!t)return false;l.t=t;return save(lists());}
function del(id){return save(lists().filter(x=>x.id!==id));}
function move(id,d){const a=lists(),i=a.findIndex(x=>x.id===id),j=i+d;if(i<0||j<0||j>=a.length)return false;
  [a[i],a[j]]=[a[j],a[i]];return save(a);}
function addCode(id,code){const l=find(id);if(!l||l.ix)return false;if(!l.c.includes(code))l.c.push(code);return save(lists());}
function rmCode(id,code){const l=find(id);if(!l||l.ix)return false;l.c=l.c.filter(x=>x!==code);return save(lists());}
const own=()=>lists().filter(x=>!x.ix);  /* 自分で作った表（指数の表を除く） */
const listsOf=code=>own().filter(x=>x.c.includes(code));
const count=()=>new Set(own().flatMap(x=>x.c)).size;
window.KW={lists,own,sync,save,create,rename,del,move,addCode,rmCode,listsOf,count,seed:a=>{mem=clean(a);}};
})();
