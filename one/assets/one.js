
/* ---------- 日足からテクニカル指標を計算（ファイルを小さくするためブラウザ側で計算） */
function calcChart(P){
  const n=P.c.length,H=P.h,L=P.l,Cl=P.c,nul=()=>new Array(n).fill(null);
  const sma=(a,k)=>{const o=nul();let s=0;for(let i=0;i<n;i++){s+=a[i];if(i>=k)s-=a[i-k];if(i>=k-1)o[i]=s/k;}return o;};
  const ema=(a,k)=>{const o=nul(),w=2/(k+1);let e=null;for(let i=0;i<n;i++){const v=a[i];if(v==null)continue;e=e==null?v:v*w+e*(1-w);o[i]=e;}return o;};
  const ma25=sma(Cl,25),ma75=sma(Cl,75),ma200=sma(Cl,200),mid=sma(Cl,20),bbu=nul(),bbl=nul();
  for(let i=19;i<n;i++){let q=0;for(let j=i-19;j<=i;j++)q+=(Cl[j]-mid[i])**2;const sd=Math.sqrt(q/20);bbu[i]=mid[i]+2*sd;bbl[i]=mid[i]-2*sd;}
  const rsi=nul();if(n>14){let g=0,l=0;for(let i=1;i<=14;i++){const d=Cl[i]-Cl[i-1];g+=Math.max(d,0);l+=Math.max(-d,0);}g/=14;l/=14;rsi[14]=l?100-100/(1+g/l):100;
    for(let i=15;i<n;i++){const d=Cl[i]-Cl[i-1];g=(g*13+Math.max(d,0))/14;l=(l*13+Math.max(-d,0))/14;rsi[i]=l?100-100/(1+g/l):100;}}
  const e12=ema(Cl,12),e26=ema(Cl,26),macd=Cl.map((_,i)=>i>=25?e12[i]-e26[i]:null),ms0=ema(macd,9),msig=ms0.map((v,i)=>i>=33?v:null),mhist=macd.map((v,i)=>v!=null&&msig[i]!=null?v-msig[i]:null);
  const midp=k=>{const o=nul();for(let i=k-1;i<n;i++){let hi=-Infinity,lo=Infinity;for(let j=i-k+1;j<=i;j++){if(H[j]>hi)hi=H[j];if(L[j]<lo)lo=L[j];}o[i]=(hi+lo)/2;}return o;};
  const tk=midp(9),kj=midp(26),sb=midp(52),sa=tk.map((v,i)=>v!=null&&kj[i]!=null?(v+kj[i])/2:null);
  const cross=(x,y)=>{const ev=[];for(let i=1;i<n;i++){const a=x[i],b=typeof y==='number'?y:y[i],a0=x[i-1],b0=typeof y==='number'?y:y[i-1];
    if([a,b,a0,b0].some(v=>v==null))continue;if(a0<=b0&&a>b)ev.push([i,1]);else if(a0>=b0&&a<b)ev.push([i,-1]);}return ev;};
  const st=Math.max(0,n-P.show),cut=a=>a.slice(st),marks=[];
  cross(ma25,ma75).forEach(([i,s])=>{if(i>=st)marks.push([i-st,s,s>0?'GC':'DC']);});
  cross(Cl,bbl).forEach(([i,s])=>{if(i>=st&&s>0)marks.push([i-st,1,'BB']);});cross(Cl,bbu).forEach(([i,s])=>{if(i>=st&&s<0)marks.push([i-st,-1,'BB']);});
  cross(rsi,30).forEach(([i,s])=>{if(i>=st&&s>0)marks.push([i-st,1,'RSI']);});cross(rsi,70).forEach(([i,s])=>{if(i>=st&&s<0)marks.push([i-st,-1,'RSI']);});
  const m=n-st,ext=a=>{const o=[];for(let k=0;k<m+26;k++){const j=st+k-26;o.push(j>=0&&j<n?a[j]:null);}return o;};
  return {d:cut(P.d),o:cut(P.o),h:cut(H),l:cut(L),c:cut(Cl),v:cut(P.v),ma25:cut(ma25),ma75:cut(ma75),ma200:cut(ma200),bbu:cut(bbu),bbl:cut(bbl),
    rsi:cut(rsi),macd:cut(macd),msig:cut(msig),mhist:cut(mhist),tk:cut(tk),kj:cut(kj),ia:ext(sa),ib:ext(sb),marks};}
const I=DATA.info,C=calcChart(DATA.px),E=DATA.extra,F=DATA.fy,R=DATA.srow,M=DATA.smeta||{levels:{t:[50,20,-20,-50],f:[55,20,-20,-55],tr:[50,20,-20,-50],os:[70,35,-35,-70]},names:['強い買い','買い','中立','売り','強い売り'],tw:{},fw:{}};
const $=id=>document.getElementById(id);
const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const fmt=(x,d=0)=>x==null?'―':Number(x).toLocaleString('ja-JP',{minimumFractionDigits:d,maximumFractionDigits:d});
const f0=v=>fmt(v,0),f1=(v,d=1)=>fmt(v,d);
const sgn=(x,d=0)=>x==null?'―':(x>0?'+':x<0?'−':'')+fmt(Math.abs(x),d);
const pct=x=>x==null?'―':sgn(x,1)+'%';
const oku=v=>v==null?'―':v>=1e4?f1(v/1e4,1)+'兆':f0(v)+'億';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const NAMES=M.names;
const NS='http://www.w3.org/2000/svg';
function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function niceTicks(lo,hi,n){const r=hi-lo,st=Math.pow(10,Math.floor(Math.log10(r/n)));const s=[1,2,2.5,5,10].map(x=>x*st).find(x=>r/x<=n)||st*10;
  const out=[];for(let v=Math.ceil(lo/s)*s;v<=hi+1e-9;v+=s)out.push(Math.abs(v)<1e-9?0:v);return out;}
function tip(ev,html){const t=$('tip'),P=ev.touches?ev.touches[0]:ev;t.innerHTML=html;t.style.display='block';
  t.style.left=Math.min(innerWidth-t.offsetWidth-8,P.clientX+14)+'px';t.style.top=Math.max(4,P.clientY-t.offsetHeight-10)+'px';}
const untip=()=>{$('tip').style.display='none';};
function toggle(btn,box,key,labels,after){let o=false;try{o=localStorage.getItem(key)==='1';}catch(e){}
  const set=(v,init)=>{o=v;box.hidden=!v;btn.setAttribute('aria-expanded',v);btn.lastChild.textContent=' '+labels[v?1:0];try{localStorage.setItem(key,v?'1':'0');}catch(e){}if(after)after(v,init);};
  btn.onclick=()=>set(!o);set(o,true);}

/* ---------- ヘッダー */
$('h-name').textContent=I.name;$('h-code').textContent=I.code;
$('h-px').textContent=f0(I.price)+'円';
$('h-chg').textContent='前日比 '+(I.chg>0?'▲':I.chg<0?'▼':'')+f0(Math.abs(I.chg))+'（'+f1(Math.abs(I.chgp),2)+'%）';
$('h-chg').style.color=I.chg>=0?'var(--candleU)':'var(--candleD)';
/* 理論株価（理論株価/valuation.py）。株価の下に1行で */
(()=>{const V=DATA.val,el=$('valline');if(!V||V.f==null||!el)return;
 const P=I.price||V.px,u=x=>x==null||!P?null:(x/P-1)*100,sg=x=>x==null?'—':(x>0?'+':'')+x.toFixed(1)+'%',y=x=>x==null?'—':Math.round(x).toLocaleString();
 const up='var(--candleU)',dn='var(--candleD)',col=x=>x==null?'var(--fg2)':x>0?up:x<0?dn:'var(--fg2)';
 const uf=u(V.f),ck=/構造的|現金になっていない|3倍超/.test(V.note||''),jl=ck?'要確認':uf==null?'—':uf>=20?'割安':uf<=-20?'割高':'適正圏',jc=ck?'var(--warn,#b77800)':uf>=20?up:uf<=-20?dn:'var(--mut)';
 const M=['per','pbr','dcf','ddm','h','rim','tk'],NM={per:'PER法',pbr:'PBR法',dcf:'DCF法',ddm:'DDM',h:'はっしゃん式',rim:'RIM',tk:'東洋経済式'};
 const vs=M.map(k=>V[k]).filter(x=>x!=null),ag=vs.filter(x=>x>P).length;
 // 小さな物差し（対数）：手法の幅・株価・理論株価
 let bar='';if(vs.length){const all=vs.concat([P]),lg=Math.log,a=lg(Math.max(Math.min(...all),P/4)*0.9),b=lg(Math.min(Math.max(...all),P*4)*1.1),W=170,X=v=>4+(W-8)*(lg(Math.min(Math.max(v,Math.exp(a)),Math.exp(b)))-a)/(b-a);
  bar=`<svg class="vr" width="${W}" height="18" viewBox="0 0 ${W} 18"><rect x="4" y="7" width="${W-8}" height="4" rx="2" fill="var(--line)"/>${vs.map(v=>`<circle cx="${X(v)}" cy="9" r="2.6" fill="${v>P?up:dn}"/>`).join('')}<path d="M${X(V.f)} 12 l4 6 h-8z" fill="var(--fg)"/><line x1="${X(P)}" x2="${X(P)}" y1="1" y2="17" stroke="var(--fg)" stroke-width="2"/></svg>`;}
 el.innerHTML=`<span class="vk">理論株価</span><span><b>${y(V.f)}円</b> <span style="color:${col(uf)};font-weight:700">${sg(uf)}</span>${(V.adj||V.adju)?` <span class="vk">（自社の過去PBRで${V.adju?'引き上げ':'引き下げ'}・前 ${y(V.f0)}円）</span>`:''}</span>
 <span class="vj" style="color:${jc};border-color:${jc}">${jl}</span>
 <span title="${M.filter(k=>V[k]!=null).map(k=>NM[k]+' '+y(V[k])+'円').join('\n')}"><span class="vk">7手法</span> ${y(V.lo)}〜${y(V.hi)}円 <span class="vd">${M.map(k=>`<i style="background:${V[k]==null?'transparent;border:1px dashed var(--mut)':V[k]>P?up:dn}"></i>`).join('')}</span> ${ag}/${vs.length}</span>
 ${bar}
 <span><span class="vk">需給・心理込み</span> ${y(V.va)}円 <span style="color:${col(u(V.va))}">${sg(u(V.va))}</span></span>
 <span><span class="vk">ばらつき</span> ${V.cv!=null?Math.round(V.cv)+'%':'—'}</span>
 ${V.note?`<span style="color:var(--warn,#b77800)">注意：${V.note}</span>`:''}
 <a href="../valuation.html#stock=${I.code}">詳しく →</a>`;
 el.hidden=false;})();

$('h-meta').textContent=[I.market,I.sector,E.mcap!=null?'時価総額 '+oku(E.mcap)+'円':'',I.date+' 終値'].filter(Boolean).join('・');
$('theme').onclick=()=>{const d=document.documentElement,cur=d.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'),n=cur==='dark'?'light':'dark';
  d.setAttribute('data-theme',n);try{localStorage.setItem('fdb-theme',n);}catch(e){}redraw();};

/* ================= 売買シグナル（signals.html と同じ判定） ================= */
function lvl(s,k){if(s==null)return -1;const [sb,b,se,ss]=M.levels[k];return s>=sb?0:s>=b?1:s>se?2:s>ss?3:4;}
function pillHTML(s,k,names){const i=lvl(s,k);if(i<0)return '<span class="pill" style="border-color:var(--line);color:var(--mut)">評価なし</span>';
  const col=i<=1?'var(--z4t)':i>=3?'var(--z0t)':'var(--fg2)',bg=i===0?'var(--z4)':i===4?'var(--z0)':'transparent',fg=(i===0||i===4)?'#fff':col;
  return `<span class="pill" style="border-color:${i<=1?'var(--z4)':i>=3?'var(--z0)':'var(--axis)'};background:${bg};color:${fg}">${(names||NAMES)[i]}</span>`;}
const OSN=['強く売られすぎ','売られすぎ','中立','買われすぎ','強く買われすぎ'];
const TRN=['強い上昇トレンド','上昇トレンド','横ばい','下降トレンド','強い下降トレンド'];
// メーター両端の言葉（左＝マイナス側、右＝プラス側）
const ENDS={t:['売り','買い'],f:['売り','買い'],tr:['下降','上昇'],os:['買われすぎ','売られすぎ']};
const CX=130,CY=132,RR=96,SW=22;
const ang=s=>Math.PI*(1-(s+100)/200),pt=(s,r)=>[CX+r*Math.cos(ang(s)),CY-r*Math.sin(ang(s))];
function arc(a,b,r){const [x1,y1]=pt(a,r),[x2,y2]=pt(b,r);return `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 0 1 ${x2.toFixed(2)},${y2.toFixed(2)}`;}
function gauge(svg,s,k){const ends=ENDS[k];
  const [sb,b,se,ss]=M.levels[k],cuts=[-100,ss,se,b,sb,100],zc=['--z0','--z1','--z2','--z3','--z4'];let h='';
  for(let i=0;i<5;i++){const a=cuts[i]+(i?1.1:0),e=cuts[i+1]-(i<4?1.1:0);h+=`<path d="${arc(a,e,RR)}" stroke="var(${zc[i]})" stroke-width="${SW}" fill="none"/>`;}
  const on=s!=null,deg=on?Math.max(-100,Math.min(100,s))*0.9:0;
  h+=`<g class="needle"${on?'':' opacity=".25"'}><path d="M${CX-5},${CY} L${CX},${CY-RR+6} L${CX+5},${CY} Z" fill="var(--fg)"/></g>
      <circle cx="${CX}" cy="${CY}" r="9" fill="var(--fg)"/><circle cx="${CX}" cy="${CY}" r="3.5" fill="var(--card)"/>`;
  if(ends)h+=`<text x="${CX-RR-SW/2}" y="${CY+24}" text-anchor="start" font-size="15" font-weight="700" fill="var(--z0t)">${ends[0]}</text>`+
    `<text x="${CX+RR+SW/2}" y="${CY+24}" text-anchor="end" font-size="15" font-weight="700" fill="var(--z4t)">${ends[1]}</text>`;
  const prev=+(svg.dataset.deg||0);svg.innerHTML=h;svg.setAttribute('viewBox',ends?'16 18 228 148':'16 18 228 128');
  const nd=svg.querySelector('.needle');svg.dataset.deg=deg;const set=a=>nd.setAttribute('transform',`rotate(${a.toFixed(2)} ${CX} ${CY})`);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){set(deg);return;}
  const ease=t=>{const c=1.4;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2);},t0=performance.now();set(prev);
  const step=now=>{const t=Math.min(1,(now-t0)/800);set(prev+(deg-prev)*ease(t));if(t<1)requestAnimationFrame(step);};requestAnimationFrame(step);}
function overall(r){const d=(s,k)=>{const i=lvl(s,k);return i<0?null:i<=1?1:i>=3?-1:0;};const t=d(r.ts,'t'),f=d(r.fs,'f');
  if(t==null&&f==null)return ['評価なし',-1];if(f==null)return t>0?['やや買い',1]:t<0?['やや売り',3]:['中立',2];
  const a=(t||0)+f;if(a===2)return ['買い',0];if(a===1)return ['やや買い',1];if(a===-2)return ['売り',4];if(a===-1)return ['やや売り',3];
  return t!==0?['様子見',2]:['中立',2];}
function verdictText(r){const t=lvl(r.ts,'t'),f=lvl(r.fs,'f'),tb=t===0||t===1,ts=t===3||t===4,fb=f===0||f===1,fsell=f===3||f===4;
  if(f<0)return ['ファンダ評価なし','決算データが足りないため、テクニカルだけで判断してください。'];
  if(tb&&fb)return ['両方とも買いシグナル','中身（業績・割安度）も値動きも良好な組み合わせです。'];
  if(fb&&ts)return ['中身は良いが株価は弱い','業績・割安度は良好。下降トレンドが落ち着くのを待つ「押し目待ち」の形です。'];
  if(fsell&&tb)return ['株価は強いが中身は弱い','値動き主導の上昇です。業績の裏付けが薄いので短期目線で。'];
  if(fsell&&ts)return ['両方とも売りシグナル','業績面・値動きとも弱い組み合わせです。'];
  if(fb)return ['中身は良好・株価は様子見','ファンダは買い側、テクニカルは中立です。'];
  if(tb)return ['株価は上向き・中身は普通','テクニカルは買い側、ファンダは中立です。'];
  if(fsell)return ['中身が弱い','ファンダが売り側、テクニカルは中立です。'];
  if(ts)return ['株価が下向き','テクニカルが売り側、ファンダは中立です。'];
  return ['決め手なし','どちらも中立圏です。'];}
function trendOscComment(tt,to){const t=lvl(tt,'tr'),o=lvl(to,'os');if(t<0||o<0)return ['判定できません','データが足りません。'];
  const up=t<=1,dn=t>=3,cheap=o<=1,hot=o>=3;
  if(up&&to>=0)return ['上昇トレンド中の押し目','上昇基調の中で過熱が抜け、RSI・ボリンジャーが中心より下まで調整した形。'];
  if(up&&hot)return ['上昇トレンドだが過熱','勢いはあるものの短期的には買われすぎ。高値づかみに注意。'];
  if(up)return ['上昇トレンド','上向きの流れで、行き過ぎた過熱感はありません。'];
  if(dn&&to<=0)return ['下降トレンド中の戻り','下降基調の中で一時的に戻した形。戻り売りが出やすい局面です。'];
  if(dn&&cheap)return ['下降トレンド中の売られすぎ','反発はあり得ますが、流れは下向き。逆張りは慎重に。'];
  if(dn)return ['下降トレンド','下向きの流れが続いています。'];
  if(cheap)return ['方向感なし・売られすぎ','トレンドははっきりしませんが、短期的には売られすぎ。'];
  if(hot)return ['方向感なし・買われすぎ','トレンドははっきりしませんが、短期的には買われすぎ。'];
  return ['方向感なし','トレンド・過熱感ともに中立圏です。'];}
function dbar(v){if(v==null)return '<div class="dbar"><div class="tr"></div><div class="ax"></div></div>';
  const w=Math.abs(v)*50,left=v>=0?50:50-w,c=v>=0.001?'var(--z4)':v<=-0.001?'var(--z0)':'var(--axis)';
  return `<div class="dbar"><div class="tr"></div><div class="f" style="left:${left}%;width:${Math.max(w,1)}%;background:${c}"></div><div class="ax"></div></div>`;}
const part=(name,sub,v,desc)=>`<div class="part"><div class="pn">${name}<small>${sub}</small></div>${dbar(v)}<div class="pv">${v==null?'―':sgn(v*100)}</div><div class="pd">${desc}</div></div>`;
const TNAME={ma:['移動平均','トレンド'],macd:['MACD','トレンド'],ichi:['一目均衡表','トレンド'],rsi:['RSI(14)','逆張り'],bb:['ボリンジャー','逆張り'],vol:['出来高','勢い']};
const FNAME={val:['割安度','PER・PBR'],prof:['収益性','ROE'],grow:['成長性','増収率'],safe:['安全性','自己資本'],fs:['Fスコア','財務改善'],cash:['キャッシュ','FCF']};
const TKEYS=['ma','macd','ichi','rsi','bb','vol'],FKEYS=['val','prof','grow','safe','fs','cash'];
function trObj(a){if(!a)return null;const [dev25,dev75,dev200,up25,hist,rise,cloud,tk,rsi,pb,upr,surge]=a;return {ma:{dev25,dev75,dev200,up25},macd:{hist,rise},ichi:{cloud,tk},rsi:{rsi},bb:{pb},vol:{upr,surge}};}
function frObj(a){if(!a)return null;const [per,pbr,vg,base,roe,pg,opm,gr,cagr,gg,eq,sg,fs,fcfy,dy,fin]=a;return {val:{per,pbr,g:vg,base},prof:{roe,g:pg,opm},grow:{gr,cagr,g:gg},safe:{eq,g:sg},fs:{fs},cash:{fcfy,dy,fin}};}
function tDesc(k,x){if(!x)return '';switch(k){
  case 'ma':return `25日線乖離 ${pct(x.dev25)}・75日線 ${pct(x.dev75)}・200日線 ${pct(x.dev200)}・25日線は${x.up25==null?'―':x.up25?'上向き':'下向き'}`;
  case 'macd':return `ヒストグラム ${x.hist==null?'―':(x.hist>0?'プラス':'マイナス')}（株価比 ${pct(x.hist)}）・${x.rise==null?'―':x.rise?'拡大／改善中':'縮小／悪化中'}`;
  case 'ichi':return `株価は雲の${x.cloud==null?'―':x.cloud>0?'上':x.cloud<0?'下':'中'}・転換線${x.tk==null?'―':x.tk>0?'＞':x.tk<0?'＜':'＝'}基準線`;
  case 'rsi':return `RSI ${fmt(x.rsi,1)}（30以下で売られすぎ＝買い、70以上で買われすぎ＝売り）`;
  case 'bb':return `%B ${fmt(x.pb)}%（0%＝−2σ、100%＝+2σ）`;
  case 'vol':return `上昇日の出来高比率 ${fmt(x.upr)}%・5日/25日出来高 ${fmt(x.surge,2)}倍`;}}
function fDesc(k,x){if(!x)return '';const g=v=>v==null?'':`（評価${v}）`;switch(k){
  case 'val':return `PER ${fmt(x.per,1)}倍・PBR ${fmt(x.pbr,2)}倍${g(x.g)}`;
  case 'prof':return `ROE ${fmt(x.roe,1)}%・営業利益率 ${fmt(x.opm,1)}%${g(x.g)}`;
  case 'grow':return `増収率 ${pct(x.gr)}・売上高CAGR ${pct(x.cagr)}${g(x.g)}`;
  case 'safe':return `自己資本比率 ${fmt(x.eq,1)}%${g(x.g)}`;
  case 'fs':return x.fs==null?'算出対象外':`${fmt(x.fs)} / 9 点`;
  case 'cash':return x.fin?'金融業のため使いません':`FCF利回り ${fmt(x.fcfy,1)}%・配当利回り ${fmt(x.dy,2)}%`;}}
function spark(elm,r){
  const hp=(r.hp||[]).map(v=>r.hp0+v*r.hpk),hs=r.hs||[],n=hp.length;if(n<2){elm.innerHTML='';return;}
  const W=320,H1=46,G=8,H2=56,H=H1+G+H2,X=i=>i/(n-1)*W,pmin=Math.min(...hp),pmax=Math.max(...hp),PY=v=>H1-2-(v-pmin)/((pmax-pmin)||1)*(H1-4),SY=v=>H1+G+H2/2-v/100*(H2/2);
  const [sb,b,se,ss]=M.levels.t;let p='',s='',pen=false;hp.forEach((v,i)=>p+=(i?'L':'M')+X(i).toFixed(1)+','+PY(v).toFixed(1));
  hs.forEach((v,i)=>{if(v==null){pen=false;return;}s+=(pen?'L':'M')+X(i).toFixed(1)+','+SY(v).toFixed(1);pen=true;});
  elm.innerHTML=`<div class="lb"><span>株価（上）とスコア（下）・${n}営業日</span><span>${f0(pmin)}〜${f0(pmax)}円</span></div>
  <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="height:${H}px">
   <rect x="0" y="${SY(100)}" width="${W}" height="${SY(b)-SY(100)}" fill="var(--z3)" opacity=".18"/><rect x="0" y="${SY(se)}" width="${W}" height="${SY(-100)-SY(se)}" fill="var(--z1)" opacity=".22"/>
   <line x1="0" x2="${W}" y1="${SY(0)}" y2="${SY(0)}" stroke="var(--axis)" vector-effect="non-scaling-stroke"/>
   <path d="${p}" fill="none" stroke="var(--price)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><path d="${s}" fill="none" stroke="var(--acc)" stroke-width="2" vector-effect="non-scaling-stroke"/>
  </svg><div class="lb"><span>${n-1}日前</span><span>青帯＝買い圏・赤帯＝売り圏</span><span>最新</span></div>`;
  const svg=elm.querySelector('svg');svg.addEventListener('pointermove',e=>{const bb=svg.getBoundingClientRect(),i=Math.max(0,Math.min(n-1,Math.round((e.clientX-bb.left)/bb.width*(n-1))));
    tip(e,`<b>${n-1-i?(n-1-i)+'営業日前':'最新日'}</b><br>株価 ${f0(hp[i])}円<br>スコア ${sgn(hs[i])}（${hs[i]==null?'―':NAMES[lvl(hs[i],'t')]}）`);});
  svg.addEventListener('pointerleave',untip);}
function drawGauges(){if(!R)return;gauge($('qT'),R.ts,'t');gauge($('qTT'),R.tt,'tr');gauge($('qTO'),R.to,'os');gauge($('qF'),R.fs,'f');}
function drawSignals(){
  const r=R;if(!r){$('big').innerHTML='<div class="ds">この銘柄は売買シグナルが算出されていません（株価の期間が短い、または signals.html が未作成）。</div>';return;}
  const [lab,li]=overall(r),[head,desc]=verdictText(r);
  const col=li<0||li===2?'var(--fg2)':li<2?'var(--z4)':'var(--z0)',bg=li===0?'var(--z4)':li===4?'var(--z0)':'transparent',fg=li===0||li===4?'#fff':li===1?'var(--z4t)':li===3?'var(--z0t)':'var(--fg2)';
  $('big').innerHTML=`<span class="lab" style="border-color:${col};background:${bg};color:${fg}">${lab}</span><div><div class="hd">${head}</div><div class="ds">${desc}</div></div>`;
  const q=(id,t,cap,s,pill)=>`<div class="q"><h4>${t}</h4><div class="cap">${cap}</div><svg id="${id}" role="img"></svg><div class="ro"><b>${sgn(s)}</b>${pill}</div></div>`;
  $('quad').innerHTML=q('qT','テクニカル','総合',r.ts,pillHTML(r.ts,'t'))+q('qTT','トレンド系','移動平均・MACD・一目',r.tt,pillHTML(r.tt,'tr',TRN))
    +q('qTO','オシレーター系','RSI・ボリンジャー',r.to,pillHTML(r.to,'os',OSN))+q('qF','ファンダメンタル',r.fp?r.fp.slice(0,7).replace('-','年')+'月期':'決算',r.fs,pillHTML(r.fs,'f'));
  drawGauges();
  const [th,td]=trendOscComment(r.tt,r.to);
  const chips=(r.te||[]).map(e=>`<span class="chip">${esc(e)}</span>`).join('')+(r.ff||[]).map(e=>`<span class="chip">⚠ ${esc(e)}</span>`).join('');
  $('notes').innerHTML=`<b>値動き：${th}</b>${td}${chips?`<div class="chips">${chips}</div>`:''}`;
  const lv=r.lv;if(lv){const tag=lv.mode==='now'?['IN可','var(--z4)']:lv.mode==='dip'?['押し目待ち','var(--z4)']:['様子見','var(--fg2)'];
    const wait=lv.mode==='wait',it=(k,v)=>v==null?'':`<span><small>${k}</small><b>${f0(v)}</b></span>`;
    const h=`<span class="bd" style="border-color:${tag[1]};color:${tag[1]}">${tag[0]}</span>`+
      (wait?it('転換',lv.trig)+it('戻り売り',lv.t1)+it('手じまい',lv.trail):(lv.in?`<span><small>IN</small><b>${f0(lv.in[0])}〜${f0(lv.in[1])}</b></span>`:'')+it('利確1',lv.t1)+it('利確2',lv.t2)+it('損切り',lv.stop))+
      (lv.rr!=null&&!wait?`<span><small>RR</small><b>${f1(lv.rr)}</b></span>`:'');
    $('plan').innerHTML=h;$('lvbar').innerHTML=h+`<span class="hint">ATR ${f0(lv.atr)}円・${f1(lv.atrp)}%／保有中の手じまい ${f0(lv.trail)}</span>`;}
  const TR=trObj(r.tr),FR=frObj(r.fr);
  $('partsT').innerHTML=TKEYS.map((k,j)=>part(TNAME[k][0],TNAME[k][1]+(M.tw&&M.tw[k]?'・重み'+Math.round(M.tw[k]*100):''),r.tc?r.tc[j]:null,tDesc(k,TR&&TR[k]))).join('');
  $('partsF').innerHTML=FKEYS.map((k,j)=>part(FNAME[k][0],FNAME[k][1]+(M.fw&&M.fw[k]?'・重み'+Math.round(M.fw[k]*100):''),r.fc?r.fc[j]:null,fDesc(k,FR&&FR[k]))).join('');
  spark($('spk'),r);}

/* ================= ファンダメンタル ================= */
$('f-hint').textContent=I.fdate.slice(0,7).replace('-','/')+'期 ・ 通期 ・ 業種中央値と比較';
$('fmeta').innerHTML=[['配当利回り',f1(E.dy,2)+'%（性向 '+f0(E.payout)+'%）'],['EV/EBITDA',f1(E.ev_ebitda)+'倍'],['PBR',f1(E.pbr,2)+'倍（業種 '+f1(E.sec_pbr,2)+'）'],
  ['Fスコア',(E.fscore??'―')+' / 9'],['業種内順位',String(E.rank).replace('.0','')+'位 / '+E.nsec+'社'],['β',f1(E.beta,2)]].map(([k,v])=>`<span>${k} <b>${v}</b></span>`).join('');
$('biz').textContent=I.biz;
/* 概要の下に公式サイトへのリンク（URLが無い・http(s)以外なら出さない） */
(()=>{const u=(I.url||'').trim(),el=$('bizlink');if(!/^https?:\/\//i.test(u))return;
  const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener noreferrer';
  const b=document.createElement('b');b.textContent='公式サイト ↗';
  const s=document.createElement('span');s.textContent=u.replace(/^https?:\/\//i,'').replace(/\/$/,'');
  a.append(b,s);el.append(a);el.hidden=false;})();
$('gen').textContent='生成 '+DATA.gen+' ・ 本ページは投資判断の参考情報です';
const unitOf=mx=>mx>=1e12?[1e12,'兆']:[1e8,'億'];
function judge(){
  const last=F[F.length-1]||{},first=F[0]||{},J=[];
  let g=['n','横ばい'];if(E.cagr!=null){if(E.cagr>=5)g=(last.op??0)>=(first.op??0)?['g','増収増益']:['n','増収減益'];else if(E.cagr<0)g=['b','減収'];}
  const [su,sn]=unitOf(last.sales||0);
  J.push({t:'成長性',b:g,v:f1((last.sales||0)/su,2),u:sn+'円',s:'売上高 ・ 年率 '+pct(E.cagr),sp:F.map(x=>x.sales),c:'--f1'});
  let r=['n','並み'];if(E.opm!=null&&E.sec_opm){if(E.opm>=E.sec_opm*1.2)r=['g','高い'];else if(E.opm<E.sec_opm*.6)r=['b','低い'];}
  J.push({t:'収益性',b:r,v:f1(E.opm),u:'%',s:'営業利益率 ・ 業種 '+f1(E.sec_opm)+'%',sp:F.map(x=>x.opm),c:'--f2'});
  let sf=['n','標準'];if(E.eqr!=null){if(E.eqr>=50||(E.sec_eqr&&E.eqr>=E.sec_eqr*1.3))sf=['g','厚い'];else if(E.eqr<20)sf=['b','薄め'];}
  J.push({t:'財務安全性',b:sf,v:f1(E.eqr),u:'%',s:'自己資本比率 ・ 業種 '+f1(E.sec_eqr)+'%',sp:F.map(x=>x.eqr),c:'--f1'});
  let ce=['n','標準'];if(E.roe!=null){if(E.roe>=10)ce=['g','高い'];else if(E.roe<5)ce=['b','低い'];}
  J.push({t:'資本効率',b:ce,v:f1(E.roe),u:'%',s:'ROE ・ 業種 '+f1(E.sec_roe)+'%',sp:F.map(x=>x.roe),c:'--f3'});
  let va=['n','並み'];if(E.per!=null&&E.pbr!=null&&E.sec_per&&E.sec_pbr){if(E.per<E.sec_per&&E.pbr<E.sec_pbr)va=['g','割安'];else if(E.per>E.sec_per&&E.pbr>E.sec_pbr)va=['b','割高'];}
  J.push({t:'割安度',b:va,v:f1(E.per),u:'倍',s:'PER ・ 業種 '+f1(E.sec_per)+'倍',sp:F.map(x=>x.per).concat([E.per]),c:'--f3'});
  return J;}
function sparkLine(a,col){const v=a.map((x,i)=>[i,x]).filter(p=>p[1]!=null);if(v.length<2)return '';
  const mn=Math.min(...v.map(p=>p[1])),mx=Math.max(...v.map(p=>p[1])),W=100,H=22,x=i=>3+i*(W-6)/(a.length-1),y=q=>mx===mn?H/2:H-4-(q-mn)/(mx-mn)*(H-8);
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="${v.map((p,k)=>(k?'L':'M')+x(p[0])+','+y(p[1])).join('')}" fill="none" stroke="${col}" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>`;}
function drawJudge(){const Mk={g:'▲',n:'●',b:'▼'};
  $('jcards').innerHTML=judge().map(j=>`<div class="jc" title="${j.s}"><div class="jh"><span>${j.t}</span><span class="jb ${j.b[0]}">${Mk[j.b[0]]} ${j.b[1]}</span></div>
   <div class="jv">${j.v}<small>${j.u}</small></div><div class="js">${j.s}</div>${sparkLine(j.sp,css(j.c))}</div>`).join('');}
function fchart(id,title,series,opt={}){
  const box=$(id);const W=box.clientWidth||260,H=opt.h||140,pl=36,pr=4,pt=16,neg=series.some(s=>s.v.some(v=>v!=null&&v<0)),pb=neg?30:18;
  const lg=series.length>1?'<span class="fl">'+series.map(s=>`<span><i style="background:${css(s.c)}"></i>${s.n}</span>`).join('')+'</span>':'';
  const vals=[];series.forEach(s=>s.v.forEach(v=>{if(v!=null)vals.push(v);}));if(!vals.length){box.innerHTML='';return;}
  const [dv,du]=opt.pct?[1,'%']:unitOf(Math.max(...vals.map(Math.abs),1));
  let lo=Math.min(0,...vals)/dv,hi=Math.max(0,...vals)/dv*(opt.pct?1.15:1);if(hi===lo)hi=lo+1;
  const tk=niceTicks(lo,hi,4);lo=Math.min(lo,tk[0]);hi=Math.max(hi,tk[tk.length-1]);
  const y=v=>pt+(H-pt-pb)*(1-(v-lo)/(hi-lo)),n=F.length,cw=(W-pl-pr)/n;
  let g='';tk.forEach(v=>{g+=`<line x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}" stroke="${css('--grid')}"/><text x="${pl-5}" y="${y(v)+3}" font-size="9.5" text-anchor="end" fill="${css('--mut')}">${opt.pct?f0(v)+'%':(v%1?f1(v):f0(v))+du}</text>`;});
  g+=`<line x1="${pl}" x2="${W-pr}" y1="${y(0)}" y2="${y(0)}" stroke="${css('--axis')}"/>`;
  F.forEach((f,i)=>{g+=`<text x="${pl+cw*(i+.5)}" y="${H-4}" font-size="10" text-anchor="middle" fill="${css('--mut')}">${f.fy.slice(2,4)}/${+f.fy.slice(5)}</text>`;});
  if(opt.line){series.forEach((s,si)=>{const pts=s.v.map((v,i)=>v==null?null:[pl+cw*(i+.5),y(v),v]).filter(Boolean);
      g+=`<path d="${pts.map((p,k)=>(k?'L':'M')+p[0]+','+p[1]).join('')}" fill="none" stroke="${css(s.c)}" stroke-width="2"/>`;
      pts.forEach((p,k)=>{g+=`<circle cx="${p[0]}" cy="${p[1]}" r="${k===pts.length-1?3.2:2.2}" fill="${css(s.c)}"><title>${s.n} ${f1(p[2])}%</title></circle>`;
        g+=`<text x="${p[0]}" y="${si?p[1]+14:p[1]-7}" font-size="9" text-anchor="middle" fill="${css(s.c)}" font-weight="${k===pts.length-1?700:400}">${f1(p[2])}</text>`;});});}
  else{const k=series.length,bw=cw*.66/k;
    F.forEach((f,i)=>series.forEach((s,j)=>{const v=s.v[i];if(v==null)return;const x=pl+cw*(i+.17)+bw*j,v2=v/dv,y1=y(Math.max(0,v2)),y2=y(Math.min(0,v2));
      g+=`<rect x="${x}" y="${y1}" width="${bw-1.5}" height="${Math.max(1,y2-y1)}" rx="2" fill="${css(s.c)}"><title>${s.n} ${f.fy}：${f1(v2,2)}${du}円</title></rect>`;
      g+=`<text x="${x+bw/2-.75}" y="${v2>=0?y1-3:y2+10}" font-size="9" text-anchor="middle" fill="${css('--fg2')}">${f1(v2,1)}</text>`;}));}
  box.innerHTML=`<div class="fh">${title}${lg}<span class="u">${opt.pct?'%':du+'円'}</span></div><svg viewBox="0 0 ${W} ${H}" height="${H}">${g}</svg>`;}
function drawFund(){
  if(!F.length){$('jcards').hidden=$('fgrid').hidden=$('fmeta').hidden=true;$('f-hint').textContent='';$('bscard').hidden=true;
    if(!$('fnone'))$('fundcard').insertAdjacentHTML('beforeend','<p id="fnone" style="color:var(--mut);font-size:12px;margin:8px 0">決算データがまだありません（新規上場などで未取得）。</p>');return;}
  drawJudge();
  drawKb();}

/* 株探風の4枚（通期決算・キャッシュフロー・四半期決算・配当）と株主構成。描画部品は kb_charts.js */
function drawKb(){
  const COLS=innerWidth>=1280?3:innerWidth>1100?2:1,Y=el=>el.getBoundingClientRect().top+scrollY,B=el=>el.getBoundingClientRect().bottom+scrollY;
  let h=210;
  const K=DATA.kb||{},A=K.annual||[],FC=K.fc,Q=K.quarters||[],AF=FC?A.concat([FC]):A,odpName=K.odpName||'経常利益',CHO=1e6;
  const has=(rows,k)=>rows.some(r=>r[k]!=null),Fl=(rows,l)=>l.filter(s=>has(rows,s.key));
  const decFor=st=>st>=1?0:st>=.1?1:2,stepOf=tk=>tk&&tk.length>1?Math.abs(tk[1]-tk[0]):0;
  const choTick=(t,tk)=>{if(t===0)return '0';const mx=Math.max(...(tk||[t]).map(Math.abs)),st=stepOf(tk);
    return mx>=CHO?(t/CHO).toFixed(decFor(st/CHO))+'兆':(t/100).toFixed(decFor(st/100));};
  const pctTick=(t,tk)=>(t*100).toFixed(decFor(stepOf(tk)*100||1))+'%';
  const money=v=>v==null?'―':Math.abs(v)>=CHO?f1(v/CHO,2)+'兆円':Math.abs(v)>=100?f0(v/100)+'億円':f0(v)+'百万円';
  const pc=v=>v==null?'―':f1(v*100)+'%',yen=v=>v==null?'―':f1(v,v%1?2:0)+'円';
  const aTitle=r=>r.fc?r.fy.replace('予','')+'（会社予想）':r.fy+'（'+r.fyEnd+'）',aTick=r=>r.fy.replace('期','');
  const CF=[];
  function pan(id,title,unit,o){
    const box=$(id),lg=o.bars.map(s=>`<span><i style="background:${css(s.color)}"></i>${s.name}</span>`)
      .concat(o.lines.map(s=>`<span><i class="ln" style="background:${css(s.dot||s.color)}"></i>${s.name}${s.axis==='R'?'(右)':''}</span>`)).join('');
    box.innerHTML=`<div class="fh">${title}<span class="u">${unit}</span></div>`+(lg?`<div class="fl">${lg}</div>`:'')+(o.sub?`<div class="fs">${o.sub}</div>`:'');
    if(!o.rows.length||!(o.bars.length+o.lines.length)){box.insertAdjacentHTML('beforeend',`<div class="kbempty">${o.empty||'データなし'}</div>`);return;}
    const ph=document.createElement('div');box.appendChild(ph);const cfg=Object.assign({height:h},o);CF.push(cfg);Combo(ph,cfg);}
  const BS=K.bs||[],bb=$('fp-bs'),bo={height:COLS===1?260:COLS===3?200:250};
  bb.hidden=!BS.length;
  if(BS.length){bb.innerHTML=`<div class="fh">貸借対照表<span class="u">${BS[BS.length-1].std==='IFRS'?'IFRS':'日本基準'}</span></div>`;kbBS(bb,BS,bo);}
  const HS=K.holders,hb=$('fp-holders');
  hb.innerHTML=`<div class="fh">株主構成<span class="u">${HS?'有報 '+(HS.asof||'').slice(0,7).replace('-','/')+'末 ・ 発行済株式比':''}</span></div>`;
  kbPie(hb,HS,{surface:'--card'});
  $('bscard').hidden=!BS.length&&!(HS&&HS.holders&&HS.holders.length);
  /* 列の下端をそろえる（PCのみ）：
     3列 … 右端の列（貸借対照表＋株主構成）の下端をチャートの下端にそろえる
     2列・3列 … ファンダの4枚の下端を、左側（2列ならチャート＋貸借対照表、3列ならチャート）の下端にそろえる */
  const cc=$('chartcard'),bc=$('bscard');
  const jk=$('jkcard'),bottom=COLS===3?Math.max(B(jk),innerHeight-12):0;   // 3列：チャート＋需給の下端（＝画面の下端）
  if(COLS===3&&BS.length){bo.height=Math.max(160,Math.min(460,bo.height+bottom-B(bc)-4));}
  else if(COLS===2&&BS.length){bo.height=Math.max(220,Math.min(380,hb.offsetHeight-(bb.offsetHeight)));}
  const tgt=COLS===3?bottom:COLS===2?(bc.hidden?B(cc):Y(bc)+Math.max(bc.offsetHeight,BS.length?bb.offsetHeight+bo.height+22:0)):0;

  pan('fp-annual','通期決算','億円 / %',{rows:AF,aria:'通期決算',sub:FC?'右端の薄い棒は今期の会社予想':'',
    bars:Fl(AF,[{key:'rev',name:'売上高',color:'--c-rev'},{key:'op',name:'営業利益',color:'--c-op'},{key:'odp',name:odpName,color:'--c-odp'},{key:'ni',name:'純利益',color:'--c-ni'}]),
    lines:Fl(AF,[{key:'opm',name:'営業利益率',color:'--c-line',dot:'--c-op',axis:'R'}]),
    yl:choTick,yr:pctTick,tipL:money,tipR:pc,tipTitle:aTitle,xtick:aTick});
  pan('fp-cf','キャッシュフロー','億円',{rows:A,aria:'キャッシュフロー',
    bars:Fl(A,[{key:'ocf',name:'営業CF',color:'--c-ocf'},{key:'icf',name:'投資CF',color:'--c-icf'},{key:'fcf',name:'財務CF',color:'--c-fin'},{key:'cash',name:'現預金等',color:'--c-cash'}]),
    lines:Fl(A,[{key:'frcf',name:'フリーCF',color:'--c-free',axis:'L'}]),
    yl:choTick,yr:pctTick,tipL:money,tipR:pc,tipTitle:aTitle,xtick:aTick});
  pan('fp-q','四半期決算','億円 / %',{rows:Q,aria:'四半期決算',empty:'四半期データなし',
    bars:Fl(Q,[{key:'rev',name:'売上高',color:'--c-rev'},{key:'op',name:'営業利益',color:'--c-op'},{key:'odp',name:'経常利益',color:'--c-odp'},{key:'ni',name:'純利益',color:'--c-ni'}]),
    lines:Fl(Q,[{key:'opm',name:'営業利益率',color:'--c-line',dot:'--c-op',axis:'R'}]),
    yl:choTick,yr:pctTick,tipL:money,tipR:pc,tipTitle:r=>r.fy+'（〜'+r.perEnd+'）',xtick:r=>r.fy});
  const DR=(FC&&FC.dps!=null)?AF:A;
  pan('fp-div','配当','円 / %',{rows:DR,aria:'配当',empty:'配当データなし',
    bars:Fl(A,[{key:'dps',name:'配当金',color:'--c-div'}]),
    lines:Fl(DR,[{key:'payout',name:'配当性向',color:'--c-pay',axis:'R'}]),
    yl:t=>t%1?t.toFixed(1):String(t),yr:pctTick,tipL:yen,tipR:pc,tipTitle:aTitle,xtick:aTick});
  if(COLS>1){
    const fg=$('fgrid'),ov=id=>$(id).offsetHeight,r1=Math.max(ov('fp-annual'),ov('fp-cf')),r2=Math.max(ov('fp-q'),ov('fp-div'));
    const fc=$('fundcard'),rest=(fc.getBoundingClientRect().bottom+scrollY)-B(fg);   // 4枚より下（メタ情報・余白）
    const hh=Math.floor((tgt-Y(fg)-rest-r1-r2-8-4)/2);
    CF.forEach(c=>{c.height=Math.max(COLS===3?100:150,Math.min(COLS===3?300:250,hh));});}
}


/* ================= チャート ================= */
/* 価格帯別出来高：表示中の日足の出来高を、各日の安値〜高値に均等配分して価格帯ごとに合計（日足からの近似）。
   POC＝最も出来高が多い価格帯、バリューエリア＝POCから広げて出来高の70%が入る範囲 */
const VPCOL={va:'rgba(100,116,139,.30)',out:'rgba(100,116,139,.14)',poc:'rgba(232,163,61,.62)',line:'#E8A33D'};
let VP=null;
function volProfile(rng,lo,hi,nb){if(!(hi>lo))return null;const w=(hi-lo)/nb,vol=new Array(nb).fill(0);let tot=0;
  const ix=p=>Math.min(nb-1,Math.max(0,Math.floor((p-lo)/w)));
  rng.forEach(i=>{const v=C.v[i],h=C.h[i],l=C.l[i];if(!(v>0))return;tot+=v;const k0=ix(l),k1=ix(h),r=h-l;
    for(let k=k0;k<=k1;k++){const sh=(k0===k1||r<=0)?1:(Math.min(h,lo+(k+1)*w)-Math.max(l,lo+k*w))/r;if(sh>0)vol[k]+=v*sh;}});
  if(tot<=0)return null;let poc=0;for(let k=1;k<nb;k++)if(vol[k]>vol[poc])poc=k;
  let a=poc,z=poc,sm=vol[poc];
  while(sm<tot*.7&&(a>0||z<nb-1)){const dn=a>0?vol[a-1]:-1,up=z<nb-1?vol[z+1]:-1;if(up>=dn){z++;sm+=vol[z];}else{a--;sm+=vol[a];}}
  return {lo,w,nb,vol,tot,poc,vaLo:a,vaHi:z,max:vol[poc],pocP:lo+(poc+.5)*w,valP:lo+a*w,vahP:lo+(z+1)*w};}
let N=126,DET=false;
function draw(){
  const box=$('chart');box.innerHTML='';
  const W=box.clientWidth,narrow=W<560,G=css('--grid'),MU=css('--mut'),UP=css('--candleU'),DN=css('--candleD');
  const show={ichi:!DET||$('cb-ichi').checked,ma:DET&&$('cb-ma').checked,m200:DET&&$('cb-200').checked,bb:DET&&$('cb-bb').checked,
              mk:DET&&$('cb-mk').checked,lv:DET&&$('cb-lv').checked,osc:DET&&$('cb-osc').checked,vp:!DET||$('cb-vp').checked};
  $('lg-ichi').style.visibility=show.ichi?'visible':'hidden';
  const wide=innerWidth>1100,three=innerWidth>=1280,jkH=three?$('jkcard').offsetHeight+10:0;
  const avail=wide?Math.max(show.osc?(three?420:560):(three?260:420),innerHeight-(box.getBoundingClientRect().top+scrollY)-(three?23:50)-jkH):0;
  const gap=6,PR=narrow?44:50,PL=2,AX=18;
  const ph=wide?{v:Math.round(avail*(show.osc?.09:.16)),r:show.osc?Math.round(avail*.13):0,m:show.osc?Math.round(avail*.14):0}
               :{p:narrow?(show.osc?240:280):(show.osc?320:380),v:narrow?56:66,r:show.osc?64:0,m:show.osc?70:0};
  const np=show.osc?4:2;if(wide)ph.p=avail-ph.v-ph.r-ph.m-gap*(np-1)-AX;
  const H=ph.p+ph.v+ph.r+ph.m+gap*(np-1)+AX;
  const s=el('svg',{viewBox:`0 0 ${W} ${H}`,height:H},box);
  const len=C.c.length,st=Math.max(0,len-N),idx=[];for(let i=st;i<len;i++)idx.push(i);
  const fut=show.ichi?26:0,cw=(W-PL-PR)/(idx.length+fut),X=i=>PL+(i-st+.5)*cw,ext=[];for(let i=st;i<len+fut;i++)ext.push(i);
  let top=0;
  function pane(h,lo,hi,label,fm){const y0=top,sc=v=>y0+3+(h-6)*(1-(v-lo)/(hi-lo));
    el('rect',{x:PL,y:y0,width:W-PL-PR,height:h,fill:'none',stroke:G},s);
    niceTicks(lo,hi,h>200?6:h>90?3:2).forEach(v=>{el('line',{x1:PL,x2:W-PR,y1:sc(v),y2:sc(v),stroke:G,'stroke-width':.8},s);
      const t=el('text',{x:W-PR+4,y:sc(v)+3,'font-size':9.5,fill:MU},s);t.textContent=fm?fm(v):f0(v);});
    if(label){const t=el('text',{x:PL+5,y:y0+12,'font-size':9.5,fill:MU,'font-weight':600},s);t.textContent=label;}
    top+=h+gap;return sc;}
  function line(get,rng,sc,col,w,dash){let d='';rng.forEach(i=>{const v=get(i);if(v==null)return;d+=(d?'L':'M')+X(i).toFixed(1)+','+sc(v).toFixed(1);});
    if(d)el('path',{d,fill:'none',stroke:col,'stroke-width':w||1,'stroke-dasharray':dash||'','stroke-linejoin':'round'},s);}
  const A=a=>i=>a[i];
  let lo=Infinity,hi=-Infinity;const inc=v=>{if(v!=null){lo=Math.min(lo,v);hi=Math.max(hi,v);}};
  idx.forEach(i=>{inc(C.l[i]);inc(C.h[i]);if(show.bb){inc(C.bbu[i]);inc(C.bbl[i]);}});
  if(show.ichi)ext.forEach(i=>{inc(C.ia[i]);inc(C.ib[i]);});
  const pad=(hi-lo)*.04;lo-=pad;hi+=pad;
  const py=pane(ph.p,lo,hi,'',null);
  if(fut){el('line',{x1:X(len)-cw/2,x2:X(len)-cw/2,y1:0,y2:ph.p,stroke:css('--axis'),'stroke-dasharray':'2 3'},s);
    if(!narrow){const t=el('text',{x:X(len)+2,y:ph.p-4,'font-size':9,fill:MU},s);t.textContent='→雲26日先';}}
  if(show.ichi){for(let k=0;k<ext.length-1;k++){const i=ext[k],j=i+1,a0=C.ia[i],b0=C.ib[i],a1=C.ia[j],b1=C.ib[j];if([a0,b0,a1,b1].some(v=>v==null))continue;
      el('path',{d:`M${X(i)},${py(a0)}L${X(j)},${py(a1)}L${X(j)},${py(b1)}L${X(i)},${py(b0)}Z`,fill:a0>=b0?css('--cloudU'):css('--cloudD'),opacity:.38,stroke:'none'},s);}
    line(A(C.ia),ext,py,css('--cloudU'),.8);line(A(C.ib),ext,py,css('--cloudD'),.8);}
  if(show.bb){let a='',b='';idx.forEach(i=>{if(C.bbu[i]==null)return;a+=(a?'L':'M')+X(i)+','+py(C.bbu[i]);});
    for(let k=idx.length-1;k>=0;k--){const i=idx[k];if(C.bbl[i]==null)continue;b+='L'+X(i)+','+py(C.bbl[i]);}
    if(a)el('path',{d:a+b+'Z',fill:css('--band'),stroke:'none'},s);line(A(C.bbu),idx,py,css('--acc'),.7,'3 3');line(A(C.bbl),idx,py,css('--acc'),.7,'3 3');}
  VP=show.vp&&idx.length>=3?volProfile(idx,Math.min(...idx.map(i=>C.l[i])),Math.max(...idx.map(i=>C.h[i])),40):null;
  if(VP){const x1=W-PR,mw=(W-PL-PR)*(narrow?.26:.22);
    for(let k=0;k<VP.nb;k++){const v=VP.vol[k];if(v<=0)continue;const yt=py(VP.lo+(k+1)*VP.w),yb=py(VP.lo+k*VP.w),len=v/VP.max*mw;
      el('rect',{x:x1-len,y:yt+.5,width:len,height:Math.max(1,yb-yt-1),fill:k===VP.poc?VPCOL.poc:(k>=VP.vaLo&&k<=VP.vaHi?VPCOL.va:VPCOL.out)},s);}
    const yp=py(VP.pocP);el('line',{x1:PL,x2:W-PR,y1:yp,y2:yp,stroke:VPCOL.line,'stroke-width':1,'stroke-dasharray':'6 3',opacity:.85},s);
    const tx='POC '+f0(VP.pocP),tw=tx.length*5.9+8;
    el('rect',{x:W-PR-tw-3,y:yp-14,width:tw,height:12,rx:3,fill:css('--card'),opacity:.9},s);
    const t=el('text',{x:W-PR-tw+1,y:yp-5,'font-size':9.5,fill:VPCOL.line,'font-weight':700},s);t.textContent=tx;}
  $('lg-vp').innerHTML=VP?'<span><i style="background:'+VPCOL.line+'"></i>'+(narrow?'':'価格帯別出来高 ')+'POC '+f0(VP.pocP)+'</span><span><i class="sq" style="background:rgba(100,116,139,.6)"></i>'+(narrow?'70%帯 ':'出来高70%の帯 ')+f0(VP.valP)+'〜'+f0(VP.vahP)+'</span>':'';
  const bw=Math.max(1,cw*.55);
  idx.forEach(i=>{const u=C.c[i]>=C.o[i],col=u?UP:DN,x=X(i);
    el('line',{x1:x,x2:x,y1:py(C.h[i]),y2:py(C.l[i]),stroke:col,'stroke-width':.8},s);
    const y1=py(Math.max(C.o[i],C.c[i])),y2=py(Math.min(C.o[i],C.c[i]));
    el('rect',{x:x-bw/2,y:y1,width:bw,height:Math.max(.8,y2-y1),fill:col},s);});
  if(show.ichi){line(A(C.tk),idx,py,css('--tenkan'),1.1);line(A(C.kj),idx,py,css('--kijun'),1.2);line(i=>i+26<len?C.c[i+26]:null,idx,py,css('--chikou'),.9);}
  if(show.ma){line(A(C.ma25),idx,py,css('--ma25'),1.1);line(A(C.ma75),idx,py,css('--ma75'),1.1);}
  if(show.m200)line(A(C.ma200),idx,py,css('--ma200'),1.1);
  if(show.lv&&R&&R.lv){const lv=R.lv,Z4=css('--z4'),Z0=css('--z0');
    const L=lv.mode==='wait'?[[lv.trig,'転換',MU,'5 3'],[lv.t1,'戻り売り',Z0,'5 3'],[lv.trail,'手じまい',Z0,'']]:[[lv.t2,'利確2',Z4,'5 3'],[lv.t1,'利確1',Z4,'5 3'],[lv.stop,'損切り',Z0,''],[lv.trail,'手じまい',Z0,'2 3']];
    if(lv.in){const a=py(Math.min(hi,lv.in[1])),b=py(Math.max(lo,lv.in[0]));if(b>a)el('rect',{x:PL,y:a,width:W-PL-PR,height:Math.max(2,b-a),fill:css('--z3'),opacity:.3},s);}
    const labs=[];L.forEach(([v,n,c,d])=>{if(v==null||v<lo||v>hi)return;el('line',{x1:PL,x2:W-PR,y1:py(v),y2:py(v),stroke:c,'stroke-dasharray':d,'stroke-width':1},s);labs.push([py(v),n+' '+f0(v),c]);});
    labs.sort((a,b)=>a[0]-b[0]);for(let k=1;k<labs.length;k++)if(labs[k][0]-labs[k-1][0]<12)labs[k][0]=labs[k-1][0]+12;
    labs.forEach(([y,t,c])=>{const w=t.length*5.9+8;el('rect',{x:PL+4,y:y-6.5,width:w,height:12,rx:3,fill:css('--card'),opacity:.92,stroke:c,'stroke-width':.6},s);
      const e=el('text',{x:PL+8,y:y+3,'font-size':9.5,fill:c},s);e.textContent=t;});}
  const lc=C.c[len-1],ly=py(lc);el('rect',{x:W-PR+1,y:ly-7.5,width:PR-2,height:15,rx:3,fill:lc>=C.c[len-2]?UP:DN},s);
  const lt=el('text',{x:W-PR+4,y:ly+3.5,'font-size':10,fill:'#fff','font-weight':700},s);lt.textContent=f0(lc);
  if(show.mk)C.marks.forEach(([i,sd,lab])=>{if(i<st)return;const x=X(i),col=sd>0?css('--z4'):css('--z0'),big=lab==='GC'||lab==='DC',r=big?5:3.5,y=sd>0?py(C.l[i])+5:py(C.h[i])-5;
    el('path',{d:sd>0?`M${x},${y} l${-r},${r*1.5} h${2*r}Z`:`M${x},${y} l${-r},${-r*1.5} h${2*r}Z`,fill:col,opacity:big?1:.55},s);
    if(big){const t=el('text',{x,y:sd>0?y+r*1.5+10:y-r*1.5-3,'font-size':9,'text-anchor':'middle',fill:col,'font-weight':700},s);t.textContent=lab;}});
  let vm=0;idx.forEach(i=>vm=Math.max(vm,C.v[i]));
  const vy=pane(ph.v,0,vm,'出来高',v=>v>=1e8?f1(v/1e8,0)+'億':v>=1e4?f0(v/1e4)+'万':f0(v));
  idx.forEach(i=>{const u=C.c[i]>=C.o[i];el('rect',{x:X(i)-bw/2,y:vy(C.v[i]),width:bw,height:Math.max(0,vy(0)-vy(C.v[i])),fill:u?UP:DN,opacity:.45},s);});
  if(show.osc){const ry=pane(ph.r,0,100,'RSI(14)',v=>v);
    el('rect',{x:PL,y:ry(70),width:W-PL-PR,height:ry(30)-ry(70),fill:css('--band')},s);
    [30,70].forEach(v=>el('line',{x1:PL,x2:W-PR,y1:ry(v),y2:ry(v),stroke:MU,'stroke-dasharray':'3 3','stroke-width':.7},s));line(A(C.rsi),idx,ry,'#1F7A8C',1.1);
    let ml=Infinity,mh=-Infinity;idx.forEach(i=>[C.macd[i],C.msig[i],C.mhist[i]].forEach(v=>{if(v!=null){ml=Math.min(ml,v);mh=Math.max(mh,v);}}));
    const mp=(mh-ml)*.08,my=pane(ph.m,ml-mp,mh+mp,'MACD',v=>f1(v,0));
    idx.forEach(i=>{const v=C.mhist[i];if(v==null)return;el('rect',{x:X(i)-bw/2,y:Math.min(my(v),my(0)),width:bw,height:Math.abs(my(v)-my(0)),fill:v>=0?UP:DN,opacity:.45},s);});
    line(A(C.macd),idx,my,css('--acc'),1.1);line(A(C.msig),idx,my,css('--ma25'),1);}
  const ty=top+1;let lastM='';const step=N<=126?1:N<=250?2:6;
  idx.forEach(i=>{const m=C.d[i].slice(0,7);if(m===lastM)return;lastM=m;const mm=+m.slice(5);if((mm-1)%step)return;if(X(i)<14||X(i)>W-PR-10)return;
    const t=el('text',{x:X(i),y:ty+10,'font-size':9.5,fill:MU,'text-anchor':'middle'},s);t.textContent=mm===1?m.slice(0,4):mm+'月';if(mm===1)t.setAttribute('font-weight',600);
    el('line',{x1:X(i),x2:X(i),y1:0,y2:top-gap,stroke:G,'stroke-width':.6},s);});
  const vl=el('line',{y1:0,y2:top-gap,stroke:MU,'stroke-width':.6,'stroke-dasharray':'2 2',visibility:'hidden'},s);
  const hit=el('rect',{x:PL,y:0,width:W-PL-PR,height:top,fill:'transparent'},s);
  const mv=ev=>{const r=s.getBoundingClientRect(),P=ev.touches?ev.touches[0]:ev,i=Math.min(len-1,Math.max(st,st+Math.floor((P.clientX-r.left-PL)/cw)));
    vl.setAttribute('x1',X(i));vl.setAttribute('x2',X(i));vl.setAttribute('visibility','visible');const pv=C.c[i-1],ch=pv?(C.c[i]-pv)/pv*100:0;
    tip(ev,'<b>'+C.d[i]+'</b><br>始 '+f0(C.o[i])+'　高 '+f0(C.h[i])+'<br>安 '+f0(C.l[i])+'　終 <b style="color:'+(ch>=0?UP:DN)+'">'+f0(C.c[i])+'</b> ('+(ch>=0?'+':'')+f1(ch,2)+'%)'+
      (show.ichi?'<br>転換 '+f0(C.tk[i])+'・基準 '+f0(C.kj[i]):'')+(show.ma?'<br>25日 '+f0(C.ma25[i])+'・75日 '+f0(C.ma75[i]):'')+(show.osc?'<br>RSI '+f1(C.rsi[i]):'')+'<br>出来高 '+f0(C.v[i]/1e4)+'万'+vpRow(P.clientY-r.top));};
  function vpRow(y){if(!VP||y<0||y>ph.p)return '';const p=hi-(y-3)/(ph.p-6)*(hi-lo),k=Math.floor((p-VP.lo)/VP.w);if(k<0||k>=VP.nb)return '';
    const a=VP.lo+k*VP.w,v=VP.vol[k];return '<br>価格帯 '+f0(a)+'〜'+f0(a+VP.w)+'：'+f0(v/1e4)+'万（'+f1(v/VP.tot*100)+'%'+(k===VP.poc?'・POC':'')+'）';}
  const out=()=>{untip();vl.setAttribute('visibility','hidden');};
  hit.addEventListener('pointermove',mv);hit.addEventListener('touchmove',mv,{passive:true});hit.addEventListener('pointerleave',out);hit.addEventListener('touchend',out);}

/* ================= 起動 ================= */
document.querySelectorAll('#rng button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#rng button').forEach(x=>x.classList.remove('on'));b.classList.add('on');N=+b.dataset.n;draw();});
['cb-ichi','cb-ma','cb-bb','cb-mk','cb-lv','cb-200','cb-osc','cb-vp'].forEach(id=>$(id).onchange=draw);
function redraw(){draw();drawFund();drawGauges();}
drawSignals();
/* ================= 監視銘柄（assets/watch.js） ================= */
function drawWatch(){const K=window.KW,btn=$('watchbtn'),box=$('wbox');if(!K)return;
  const lv=R&&R.lv,w=K.list().find(x=>x.code===I.code);
  btn.hidden=!(w||lv);btn.classList.toggle('on',!!w);btn.textContent=w?'★ 監視中':'☆ 監視に追加';
  btn.title=w?'監視をやめる':'今の IN・利確・損切りの目安を記録して、到達したらトップ画面で知らせます';
  if(!w){box.hidden=true;return;}
  const ev=K.evaluate(w,DATA.px),dd=s=>s?s.slice(5).replace('-','/'):'';
  const val=s=>s.dir==='zone'?f0(s.lo)+'〜'+f0(s.hi):f0(s.p);
  const chip=s=>{const n=K.isNew(w,s);
    if(s.state==='hit')return `<span class="wl hit${s.k==='stop'?'OUT':'IN'}">${s.label} <b>${val(s)}</b> ${dd(s.date)}到達${n?'<span class="new">NEW</span>':''}</span>`;
    if(s.state==='skipped')return `<span class="wl skip" title="極端な値動きの日（ATRの3倍超）に通過したため数えていません">${s.label} ${val(s)} 急変で通過 ${dd(s.date)}</span>`;
    return `<span class="wl">${s.label} <b>${val(s)}</b>${s.state==='wait'?' <small>（追加時に到達済み・離れてから再判定）</small>':''}</span>`;};
  const anyNew=ev.levels.some(s=>K.isNew(w,s));
  box.hidden=false;box.innerHTML=`<small>監視中（${dd(w.asof)}時点の目安）</small>`+ev.levels.map(chip).join('')+
    (anyNew?`<button class="tbtn" id="wack">確認済みにする</button>`:'');
  if(anyNew)$('wack').onclick=()=>{K.ack(w.code,ev.levels);drawWatch();};}
$('watchbtn').onclick=()=>{const K=window.KW;if(!K)return;
  if(K.has(I.code)){if(confirm(`${I.name} の監視をやめますか？`))K.remove(I.code);}
  else if(!K.add(I.code,I.name,R.lv,I.price,I.date))alert('この端末に保存できませんでした（プライベートブラウズでは保存できません）');
  drawWatch();};
drawWatch();
toggle($('ch-tgl'),$('ch-det'),'one-chdet',['詳細','閉じる'],(v,init)=>{DET=v;if(!init)draw();});
toggle($('sig-tgl'),$('sigdet'),'one-sigdet',['内訳・推移を見る','閉じる'],(v,init)=>{if(!init){draw();drawFund();}});
draw();drawFund();
/* 需給カードは後で描かれるので、3列表示では描き終わってから高さを合わせ直す */
setTimeout(()=>{if(innerWidth>=1280){draw();drawFund();}},0);
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{draw();drawFund();},120);});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',redraw);

/* ---------- 需給（需給分析の概要。データは fundamentals/jukyu.csv） ---------- */
(function(){const J=DATA.jk,card=$('jkcard');if(!card)return;if(!J){card.hidden=true;return;}
 const SC={min:0,max:100,z:[[35,'bear'],[65,'neu'],[1e9,'bull']]};
 const RT={min:.2,max:50,log:1,z:[[1.5,'bull','売り長・買い戻し余地'],[5,'neu','ふつう'],[8,'warn','買い長め'],[1e9,'bear','買い長・戻り売りが重い']]};
 const pos=(m,v)=>{let p=m.log?(Math.log(Math.max(v,m.min))-Math.log(m.min))/(Math.log(m.max)-Math.log(m.min)):(v-m.min)/(m.max-m.min);return Math.max(0,Math.min(1,p))*100;};
 const zone=(m,v)=>{for(const z of m.z)if(v<z[0])return z;return m.z[m.z.length-1];};
 const track=(m,v)=>{let a=m.min,o='';for(const z of m.z){const b=Math.min(z[0],m.max);if(b<=a)continue;o+=`<i class="b-${z[1]}" style="width:${(pos(m,b)-pos(m,a)).toFixed(1)}%"></i>`;a=b;if(a>=m.max)break;}
  if(v!=null)o+=`<span class="mk" style="left:${pos(m,v).toFixed(1)}%"></span>`;return `<div class="jkt">${o}</div>`;};
 const ax=(m,t)=>`<div class="jkax">${t.map(([v,l])=>`<span style="left:${pos(m,v).toFixed(1)}%">${l}</span>`).join('')}</div>`;
 const sh=v=>{if(v==null)return '―';const a=Math.abs(v);return a>=1e8?(v/1e8).toFixed(2)+'億':a>=1e4?(v/1e4).toFixed(a>=1e6?0:1)+'万':fmt(v);};
 const sg=(v,d=0,u='')=>v==null?'―':`<span style="color:${v>0?'var(--candleU)':v<0?'var(--candleD)':'inherit'}">${v>0?'+':''}${fmt(v,d)}${u}</span>`;
 const JC={'踏み上げ候補':'bull','好需給':'bull','中立':'neu','規制・注意':'warn','需給悪い':'bear','買残重い':'bear','投げ警戒':'bear'};
 const sc=J.score,zs=sc==null?'neu':sc<=35?'bear':sc>=65?'bull':'neu';
 let zr;if(J.ratio!=null)zr=zone(RT,J.ratio);else zr=J.buy>0?[0,'bear','売残なし（買いだけ）']:[0,'neu','信用残なし'];
 const rv=J.ratio!=null?J.ratio:(J.buy>0?RT.max:null);
 $('jk-hint').innerHTML=`<span class="jkbadge jz-${JC[J.judge]||'neu'}">${esc(J.judge||'―')}</span> 信用残 ${esc(J.asof)} 申込分`;
 $('jk-link').href='../jukyu.html#'+I.code;
 $('jkg').innerHTML=`<div class="jz-${zs}"><div class="lbl"><span>需給スコア</span><span class="zt">${zs==='bull'?'良い':zs==='bear'?'悪い':'ふつう'}</span></div>
  <div class="big">${fmt(sc)}<small> / 100</small></div>${track(SC,sc)}${ax(SC,[[0,'0'],[35,'35'],[65,'65'],[100,'100']])}<div class="jkax2"><span>← 悪い</span><span>良い →</span></div></div>
  <div class="jz-${zr[1]}"><div class="lbl"><span>信用倍率 <small style="color:var(--mut)">買残÷売残</small></span><span class="zt">${zr[2]}</span></div>
  <div class="big">${J.ratio!=null?fmt(J.ratio,2):(J.buy>0?'売残0':'―')}<small>${J.ratio!=null?' 倍':''}</small></div>${track(RT,rv)}
  ${ax(RT,[[.2,'0.2'],[1,'1'],[1.5,'1.5'],[5,'5'],[8,'8'],[50,'50倍']])}<div class="jkax2"><span>← 売り長</span><span>買い長 →</span></div></div>`;
 $('jkf').innerHTML=`<span>買残 <b>${sh(J.buy)}株</b>（前日比 ${sg(J.dbuy)}）</span><span>売残 <b>${sh(J.sell)}株</b>（前日比 ${sg(J.dsell)}）</span>`+
  `<span>買残の重さ <b>${J.days!=null?fmt(J.days,1)+'日分':'―'}</b></span><span>買い方の損益 ${sg(J.pl,1,'%')}</span>`+
  (J.short!=null?`<span>大口空売り <b>${fmt(J.short,2)}%</b></span>`:'')+(J.flag?`<span>印 <b>${esc(J.flag)}</b></span>`:'');
})();

/* 東証株分析 共通グラフ部品（業績ダッシュボード dashboards/ と 1画面 dashboards/one/ の両方で使う）
   make_company_dashboards.py と make_one_screen.py が、それぞれの JS の末尾にこのファイルをそのまま連結する。
   前提：ページ側に css(変数名) と niceTicks(lo,hi,n) があること。 */
/* ---------- 複合グラフ：棒（左軸）＋折れ線（左軸 or 右軸）。会社予想の行(fc)は薄く描く ---------- */
function smoothD(p){
  if(p.length<3) return p.map(function(q,i){return (i?"L":"M")+q[0].toFixed(1)+" "+q[1].toFixed(1);}).join(" ");
  var n=p.length,i,dx=[],m=[],t=[];
  for(i=0;i<n-1;i++){ dx[i]=p[i+1][0]-p[i][0]; m[i]=dx[i]?(p[i+1][1]-p[i][1])/dx[i]:0; }
  t[0]=m[0]; t[n-1]=m[n-2];
  for(i=1;i<n-1;i++){ t[i]=(m[i-1]*m[i]<=0)?0:3*(dx[i-1]+dx[i])/((2*dx[i]+dx[i-1])/m[i-1]+(dx[i]+2*dx[i-1])/m[i]); }
  var d="M"+p[0][0].toFixed(1)+" "+p[0][1].toFixed(1);
  for(i=0;i<n-1;i++){ var h=dx[i]/3;
    d+=" C"+(p[i][0]+h).toFixed(1)+" "+(p[i][1]+t[i]*h).toFixed(1)+" "+(p[i+1][0]-h).toFixed(1)+" "
      +(p[i+1][1]-t[i+1]*h).toFixed(1)+" "+p[i+1][0].toFixed(1)+" "+p[i+1][1].toFixed(1); }
  return d;
}

function Combo(host, cfg){
  var wrap=document.createElement("div"); wrap.className="kbplot";
  var tip=document.createElement("div"); tip.className="kbtip";
  host.appendChild(wrap); wrap.appendChild(tip);
  var rows=cfg.rows, bars=cfg.bars||[], lines=cfg.lines||[];
  function draw(){
    var W=wrap.clientWidth||460; if(W<40) return;
    var narrow=W<420, H=cfg.height||(narrow?240:290);
    var hasR=lines.some(function(s){return s.axis==="R";});
    var mL=narrow?40:52, mR=hasR?(narrow?36:44):10, mT=12, mB=26;
    var n=rows.length; if(!n) return;
    var iw=Math.max(40,W-mL-mR), ih=Math.max(40,H-mT-mB);
    var lv=[], rv=[];
    rows.forEach(function(r){
      bars.forEach(function(s){ if(r[s.key]!=null) lv.push(r[s.key]); });
      lines.forEach(function(s){ if(r[s.key]!=null) (s.axis==="R"?rv:lv).push(r[s.key]); });
    });
    if(!lv.length && !rv.length){ wrap.innerHTML='<div class="empty">データなし</div>'; return; }
    var lo=Math.min(0,Math.min.apply(null,lv.length?lv:[0])), hi=Math.max(0,Math.max.apply(null,lv.length?lv:[1]));
    var sp=(hi-lo)||1; hi+= hi>0?sp*0.06:0; lo-= lo<0?sp*0.06:0;
    var lt=niceTicks(lo,hi,narrow?4:5); lo=Math.min(lo,lt[0]); hi=Math.max(hi,lt[lt.length-1]);
    lt=lt.filter(function(t){return t>=lo-1e-9 && t<=hi+1e-9;});
    function Y(v){ return mT+ih-(v-lo)/(hi-lo)*ih; }
    var rlo=0, rhi=1, rt=[];
    if(rv.length){
      var mn=Math.min.apply(null,rv), mx=Math.max.apply(null,rv), rs=(mx-mn)||Math.abs(mx)||0.1;
      rlo=mn-rs*0.25; rhi=mx+rs*0.25; if(mn>=0 && rlo<0) rlo=0;
      rt=niceTicks(rlo,rhi,narrow?4:5); rlo=Math.min(rlo,rt[0]); rhi=Math.max(rhi,rt[rt.length-1]);
      rt=rt.filter(function(t){return t>=rlo-1e-9 && t<=rhi+1e-9;});
    }
    function YR(v){ return mT+ih-(v-rlo)/(rhi-rlo)*ih; }
    var band=iw/n; function Xc(i){ return mL+band*(i+0.5); }
    var g=[], fs=narrow?9:10, mono='font-family="ui-monospace,monospace"';

    rows.forEach(function(r,i){ if(r.fc)
      g.push('<rect x="'+(mL+band*i).toFixed(1)+'" y="'+mT+'" width="'+band.toFixed(1)+'" height="'+ih+'" fill="'+css("--band")+'"/>'); });
    lt.forEach(function(t){
      var y=Y(t).toFixed(1);
      g.push('<line x1="'+mL+'" x2="'+(mL+iw)+'" y1="'+y+'" y2="'+y+'" stroke="'+css("--grid")+'" stroke-width="1"/>');
      g.push('<text x="'+(mL-6)+'" y="'+y+'" text-anchor="end" dominant-baseline="middle" font-size="'+fs+'" '+mono+' fill="'+css("--ink-3")+'">'+cfg.yl(t,lt)+'</text>');
    });
    rt.forEach(function(t){
      g.push('<text x="'+(mL+iw+6)+'" y="'+YR(t).toFixed(1)+'" text-anchor="start" dominant-baseline="middle" font-size="'+fs+'" '+mono+' fill="'+css("--ink-3")+'">'+cfg.yr(t,rt)+'</text>');
    });
    for(var k=1;k<n;k++){ var vx=(mL+band*k).toFixed(1);
      g.push('<line x1="'+vx+'" x2="'+vx+'" y1="'+mT+'" y2="'+(mT+ih)+'" stroke="'+css("--grid")+'" stroke-width="1" opacity=".6"/>'); }
    var every=Math.max(1,Math.ceil(n/(narrow?5:10)));
    rows.forEach(function(r,i){
      if(i%every!==0 && i!==n-1) return;
      g.push('<text x="'+Xc(i).toFixed(1)+'" y="'+(mT+ih+15)+'" text-anchor="middle" font-size="'+fs+'" '+mono+' fill="'+css(r.fc?"--ink-2":"--ink-3")+'">'+cfg.xtick(r)+'</text>');
    });

    var nb=bars.length, gw=band*(nb>2?0.84:0.6), slot=nb?gw/nb:0;
    bars.forEach(function(s,si){
      var col=css(s.color);
      rows.forEach(function(r,i){
        var v=r[s.key]; if(v==null) return;
        var y0=Y(Math.max(0,v)), y1=Y(Math.min(0,v));
        var x=mL+band*i+(band-gw)/2+slot*si+slot*0.07, w=Math.max(1.5,slot*0.86);
        g.push('<rect x="'+x.toFixed(1)+'" y="'+y0.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+Math.max(1,Math.abs(y1-y0)).toFixed(1)+'" fill="'+col+'"'
          +(r.fc?' fill-opacity=".42" stroke="'+col+'" stroke-width="1" stroke-dasharray="3 2"':'')+'/>');
      });
    });
    g.push('<line x1="'+mL+'" x2="'+(mL+iw)+'" y1="'+Y(0).toFixed(1)+'" y2="'+Y(0).toFixed(1)+'" stroke="'+css("--rule-s")+'" stroke-width="1"/>');

    lines.forEach(function(s){
      var col=css(s.color), dot=css(s.dot||s.color), YY=s.axis==="R"?YR:Y, seg=[], parts=[];
      rows.forEach(function(r,i){
        if(r[s.key]==null){ if(seg.length){parts.push(seg); seg=[];} return; }
        seg.push([Xc(i),YY(r[s.key]),r]);
      });
      if(seg.length) parts.push(seg);
      parts.forEach(function(p){
        if(p.length>1) g.push('<path d="'+smoothD(p)+'" fill="none" stroke="'+col+'" stroke-width="'+(s.w||2.5)+'" stroke-linecap="round"/>');
      });
      parts.forEach(function(p){ p.forEach(function(q){
        g.push(q[2].fc
          ? '<circle cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="3.4" fill="'+css("--surface")+'" stroke="'+dot+'" stroke-width="2"/>'
          : '<circle cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="3.4" fill="'+dot+'" stroke="'+css("--surface")+'" stroke-width="1"/>');
      }); });
    });
    g.push('<line id="xh" x1="0" x2="0" y1="'+mT+'" y2="'+(mT+ih)+'" stroke="'+css("--rule-s")+'" stroke-width="1" opacity="0"/>');

    wrap.querySelectorAll("svg").forEach(function(s){s.remove();});
    wrap.insertAdjacentHTML("afterbegin",
      '<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+cfg.aria+'">'+g.join("")+'</svg>');

    var el=wrap.querySelector("svg"), xh=el.querySelector("#xh");
    if(!cfg.zoomed) kbZoomable(el, host, function(body,BH){
      var ph=document.createElement("div"); body.appendChild(ph);
      Combo(ph, Object.assign({}, cfg, {height:BH, zoomed:true}));
    });
    function move(ev){
      var rect=el.getBoundingClientRect();
      var x=(ev.touches?ev.touches[0].clientX:ev.clientX)-rect.left;
      var i=Math.max(0,Math.min(n-1,Math.floor((x-mL)/band))), r=rows[i];
      xh.setAttribute("x1",Xc(i).toFixed(1)); xh.setAttribute("x2",Xc(i).toFixed(1)); xh.setAttribute("opacity","0.8");
      tip.innerHTML='<h4>'+cfg.tipTitle(r)+'</h4>'
        +bars.map(function(s){ return '<div class="row"><i><span class="sw" style="background:'+css(s.color)+'"></span>'+s.name+'</i><b>'+cfg.tipL(r[s.key],r,s)+'</b></div>'; }).join("")
        +lines.map(function(s){ return '<div class="row"><i><span class="sw ln" style="background:'+css(s.dot||s.color)+'"></span>'+s.name+'</i><b>'+(s.axis==="R"?cfg.tipR:cfg.tipL)(r[s.key],r,s)+'</b></div>'; }).join("");
      tip.style.opacity="1";
      tip.style.left=Math.max(2,Math.min(W-tip.offsetWidth-2,Xc(i)-tip.offsetWidth/2))+"px";
      tip.style.top="4px";
    }
    function leave(){ tip.style.opacity="0"; xh.setAttribute("opacity","0"); }
    el.addEventListener("mousemove",move); el.addEventListener("mouseleave",leave);
    el.addEventListener("touchstart",move,{passive:true});
    el.addEventListener("touchmove",move,{passive:true});
    el.addEventListener("touchend",leave);
  }
  new ResizeObserver(draw).observe(wrap);
  return {redraw:draw};
}


/* ---------- 株主構成の円グラフ ----------
   S = {asof, issued, treasury, holders:[[名称, 株式数, 割合(自己株除く)], ...]}（fetch_shareholders.py の出力）
   発行済株式数に対する割合で、上位10名・自己株式・その他（浮動株など）に分ける。 */
function holderSlices(S){
  // 色はこの関数の中に置く（1画面では本ファイルが末尾に連結され、先に呼ばれるため）
  var KB_PIE=["#5a78a6","#a9cbe6","#e5944a","#f4c290","#67a05a","#9ccf86","#b49c45","#e8d47c","#5e9790","#98c0b9"];
  var out=[], iss=S.issued, tr=S.treasury>0?S.treasury:0, used=0;
  var adj=(iss&&tr)?(iss-tr)/iss:1;      // 大株主の「割合」は自己株を除いた株数が分母
  (S.holders||[]).forEach(function(h,i){
    var p=(iss&&h[1]!=null)? h[1]/iss : (h[2]!=null? h[2]*adj : null);
    if(p==null||!(p>0)) return;
    out.push({name:h[0],p:p,shares:h[1],color:KB_PIE[i%KB_PIE.length]}); used+=p;
  });
  if(iss&&tr){ out.push({name:"自己株式",p:tr/iss,shares:tr,color:"#c9625d"}); used+=tr/iss; }
  if(used>1){ out.forEach(function(o){o.p/=used;}); used=1; }
  if(1-used>0.0005) out.push({name:"その他（浮動株など）",p:1-used,color:"#f0a7a1",other:true});
  return out;
}
function kbPie(host, S, opt){
  opt=opt||{};
  var sl=(S&&S.holders&&S.holders.length)?holderSlices(S):[];
  if(!sl.length){ host.insertAdjacentHTML("beforeend",'<div class="kbempty">株主データなし（有価証券報告書が未取得）</div>'); return; }
  var R=100, cx=110, cy=110, a=-Math.PI/2, g=[], sur=css(opt.surface||"--surface")||"#fff";
  function pt(r,t){ return (cx+r*Math.cos(t)).toFixed(2)+" "+(cy+r*Math.sin(t)).toFixed(2); }
  sl.forEach(function(o){ o.name=String(o.name).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); });
  sl.forEach(function(o){
    var b=a+o.p*2*Math.PI, big=(b-a)>Math.PI?1:0, tt=o.name+"："+(o.p*100).toFixed(2)+"%";
    if(o.p>=0.9999) g.push('<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="'+o.color+'"><title>'+tt+'</title></circle>');
    else g.push('<path d="M'+cx+' '+cy+' L'+pt(R,a)+' A'+R+' '+R+' 0 '+big+' 1 '+pt(R,b)+' Z" fill="'+o.color+'" stroke="'+sur+'" stroke-width="1.5"><title>'+tt+'</title></path>');
    if(o.p>=0.045){ var m=(a+b)/2;
      g.push('<text x="'+(cx+R*0.64*Math.cos(m)).toFixed(1)+'" y="'+(cy+R*0.64*Math.sin(m)).toFixed(1)+'" text-anchor="middle" dominant-baseline="middle" font-size="11" font-weight="700" fill="#fff" style="paint-order:stroke" stroke="rgba(0,0,0,.25)" stroke-width="2">'+(o.p*100).toFixed(o.p>=0.1?0:1)+'%</text>'); }
    a=b;
  });
  var fmtSh=function(v){ return v==null?"":(v>=1e8?(v/1e8).toFixed(2)+"億株":v>=1e4?Math.round(v/1e4).toLocaleString()+"万株":Math.round(v).toLocaleString()+"株"); };
  host.insertAdjacentHTML("beforeend",'<div class="kbpie"><svg viewBox="0 0 220 220" role="img" aria-label="株主構成">'+g.join("")+'</svg>'
    +'<ol class="kbleg">'+sl.map(function(o){
      return '<li'+(o.other?' class="oth"':'')+'><i style="background:'+o.color+'"></i><span class="nm" title="'+o.name+'">'+o.name+'</span>'
        +'<span class="sh">'+fmtSh(o.shares)+'</span><span class="pc">'+(o.p*100).toFixed(2)+'%</span></li>';}).join("")+'</ol></div>');
  if(!opt.zoomed){ var pies=host.querySelectorAll(".kbpie svg");
    kbZoomable(pies[pies.length-1], host, function(body){ kbPie(body, S, Object.assign({}, opt, {zoomed:true})); }); }
}

/* ---------- 貸借対照表（資産と負債・純資産の積み上げ棒を期ごとに並べる） ----------
   rows = [{fy, fyEnd, ta, cash, recv, inv, oca, ppe, onca, pay, ocl, ncl, oeq, eq, noCA}]（百万円）
   計上額／構成比はグラフ右上の切り替えで。色は --b-* （現金預金はキャッシュフローの「現預金等」と同じ色） */
function kbBSA(){ return [["onca","その他固定資産","--b-onca"],["ppe","有形固定資産","--b-ppe"],["oca","その他流動資産","--b-oca"],
             ["inv","棚卸資産","--b-inv"],["recv","売上債権","--b-recv"],["cash","現金預金","--b-cash"]]; }
function kbBSL(){ return [["eq","自己資本","--b-eq"],["oeq","非支配株主持分等","--b-oeq"],["ncl","固定負債","--b-ncl"],
             ["ocl","その他流動負債","--b-ocl"],["pay","買入債務","--b-pay"]]; }
function kbMoney(v){ if(v==null) return "—"; var a=Math.abs(v);
  return a>=1e6? (v/1e6).toFixed(2)+"兆円" : a>=100? Math.round(v/100).toLocaleString()+"億円" : Math.round(v).toLocaleString()+"百万円"; }
function kbDec(st){ /* 目盛り間隔に必要な小数桁（0.25 → 2） */
  for(var d=0; d<3; d++){ var x=st*Math.pow(10,d); if(Math.abs(x-Math.round(x))<1e-6) return d; } return 2; }
function kbInk(hex){ var m=/^#?([0-9a-f]{6})$/i.exec(String(hex).trim()); if(!m) return "#1d1d1b";
  var n=parseInt(m[1],16), r=n>>16&255, g=n>>8&255, b=n&255; return (0.299*r+0.587*g+0.114*b)>150?"#1d1d1b":"#ffffff"; }
function kbBS(host, rows, opt){
  opt=opt||{};
  var KB_BS_A=kbBSA(), KB_BS_L=kbBSL();  // 関数内で作る（1画面では本ファイルが末尾に連結されるため）
  if(!rows||!rows.length){ host.insertAdjacentHTML("beforeend",'<div class="kbempty">貸借対照表のデータなし（有価証券報告書が未取得）</div>'); return; }
  var mode=opt.mode||"amt";
  var bar=document.createElement("div"); bar.className="kbseg";
  bar.innerHTML='<button type="button" data-m="amt">計上額</button><button type="button" data-m="pct">構成比</button>';
  var leg=document.createElement("div"); leg.className="kblegend";
  leg.innerHTML=KB_BS_A.slice().reverse().concat(KB_BS_L.slice().reverse())
    .filter(function(s){ return rows.some(function(r){ return r[s[0]]>0; }); })   // 数値の無い区分（銀行の売上債権など）は凡例から外す
    .map(function(s){
    return '<span><i style="background:'+css(s[2])+'"></i>'+s[1]+'</span>';}).join("");
  var wrap=document.createElement("div"); wrap.className="kbplot";
  var tip=document.createElement("div"); tip.className="kbtip";
  var head=host.querySelector(".p-head,.fh");     // 見出しの右端に切り替えを置く
  if(head) head.appendChild(bar); else host.appendChild(bar);
  host.appendChild(leg); host.appendChild(wrap); wrap.appendChild(tip);
  function setMode(m){ mode=m; bar.querySelectorAll("button").forEach(function(b){ b.setAttribute("aria-pressed", String(b.dataset.m===m)); }); draw(); }
  bar.querySelectorAll("button").forEach(function(b){ b.addEventListener("click",function(){ setMode(b.dataset.m); }); });
  function val(r,k){ var v=r[k]; return v==null||v<0?0:v; }
  function draw(){
    var W=wrap.clientWidth||460; if(W<40) return;
    var narrow=W<460, H=opt.height||(narrow?260:330), mL=narrow?40:52, mR=8, mT=18, mB=36;
    var n=rows.length, iw=W-mL-mR, ih=H-mT-mB, band=iw/n;
    var hi=mode==="pct"?1:Math.max.apply(null,rows.map(function(r){return Math.max(r.ta||0,(r.tl||0)+(r.na||0));}))*1.06;
    var tk=niceTicks(0,hi,narrow?4:5); hi=Math.max(hi,tk[tk.length-1]);
    function Y(v){ return mT+ih-v/hi*ih; }
    var st=tk.length>1?tk[1]-tk[0]:1, g=[], fs=narrow?9:10, mono='font-family="ui-monospace,monospace"';
    tk.forEach(function(t){ var y=Y(t).toFixed(1);
      var lab=mode==="pct"? Math.round(t*100)+"%" : (hi>=1e6? (t/1e6).toFixed(kbDec(st/1e6))+(t?"兆":"") : (t/100).toFixed(kbDec(st/100)));
      g.push('<line x1="'+mL+'" x2="'+(mL+iw)+'" y1="'+y+'" y2="'+y+'" stroke="'+css(t===0?"--rule-s":"--grid")+'"/>');
      g.push('<text x="'+(mL-6)+'" y="'+y+'" text-anchor="end" dominant-baseline="middle" font-size="'+fs+'" '+mono+' fill="'+css("--ink-3")+'">'+lab+'</text>'); });
    var bw=Math.min(band*0.4, 92);
    rows.forEach(function(r,i){
      var cx=mL+band*(i+0.5), xs=[cx-bw-1, cx+1];
      [[KB_BS_A, r.ta],[KB_BS_L, (r.tl||0)+(r.na||0)]].forEach(function(side,si){
        var tot=side[1]||0, acc=0, x=xs[si];
        if(!tot) return;
        side[0].forEach(function(s){
          var v=val(r,s[0]); if(!v) return;
          var p=mode==="pct"? v/tot : v, y0=Y(acc), y1=Y(acc+p), col=css(s[2]); acc+=p;
          g.push('<rect x="'+x.toFixed(1)+'" y="'+y1.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(0.5,y0-y1).toFixed(1)+'" fill="'+col+'" stroke="'+css("--surface")+'" stroke-width=".6"/>');
          var nm=(r.noCA&&s[0]==="onca")?"その他資産":(r.noCA&&s[0]==="ncl")?"負債":s[1];
          if(y0-y1>=15 && bw>=40){
            var fz=Math.min(11, bw/Math.max(4,nm.length)*1.05);
            g.push('<text x="'+(x+bw/2).toFixed(1)+'" y="'+((y0+y1)/2).toFixed(1)+'" text-anchor="middle" dominant-baseline="middle" font-size="'+fz.toFixed(1)+'" font-weight="600" fill="'+kbInk(col)+'">'+nm+'</text>');
          }
        });
        if(mode==="amt" && si===0) g.push('<text x="'+cx.toFixed(1)+'" y="'+(Y(acc)-5).toFixed(1)+'" text-anchor="middle" font-size="'+(narrow?8.5:9.5)+'" '+mono+' fill="'+css("--ink-2")+'">'+kbMoney(tot).replace("円","")+'</text>');
        g.push('<text x="'+(x+bw/2).toFixed(1)+'" y="'+(mT+ih+12)+'" text-anchor="middle" font-size="'+(narrow?8.5:9.5)+'" fill="'+css("--ink-3")+'">'+(si?(narrow?"負・純":"負債・純資産"):"資産")+'</text>');
      });
      g.push('<text x="'+cx.toFixed(1)+'" y="'+(mT+ih+28)+'" text-anchor="middle" font-size="'+fs+'" font-weight="700" '+mono+' fill="'+css("--ink-2")+'">'+r.fy+'</text>');
    });
    wrap.querySelectorAll("svg").forEach(function(s){s.remove();});
    wrap.insertAdjacentHTML("afterbegin",'<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="貸借対照表">'+g.join("")+'</svg>');
    var el=wrap.querySelector("svg");
    if(!opt.zoomed) kbZoomable(el, host, function(body,BH){ kbBS(body, rows, {height:BH, mode:mode, zoomed:true}); }, true);
    function move(ev){
      var rect=el.getBoundingClientRect(), x=(ev.touches?ev.touches[0].clientX:ev.clientX)-rect.left;
      var i=Math.max(0,Math.min(n-1,Math.floor((x-mL)/band))), r=rows[i];
      function line(s,tot){ var v=r[s[0]]; if(v==null||(s[0]==="oeq"&&!v)) return "";
        return '<div class="row"><i><span class="sw" style="background:'+css(s[2])+'"></span>'+s[1]+'</i><b>'+kbMoney(v)+(tot?'（'+(v/tot*100).toFixed(1)+'%）':'')+'</b></div>'; }
      tip.innerHTML='<h4>'+r.fy+'（'+r.fyEnd+'）・総資産 '+kbMoney(r.ta)+'</h4>'
        +KB_BS_A.slice().reverse().map(function(s){return line(s,r.ta);}).join("")
        +'<div style="height:5px"></div>'+KB_BS_L.slice().reverse().map(function(s){return line(s,r.ta);}).join("");
      tip.style.opacity="1";
      var cx=mL+band*(i+0.5); tip.style.left=Math.max(2,Math.min(W-tip.offsetWidth-2,cx-tip.offsetWidth/2))+"px"; tip.style.top="4px";
    }
    function leave(){ tip.style.opacity="0"; }
    el.addEventListener("mousemove",move); el.addEventListener("mouseleave",leave);
    el.addEventListener("touchstart",move,{passive:true}); el.addEventListener("touchend",leave);
  }
  new ResizeObserver(draw).observe(wrap);
  setMode(mode);
}

/* ---------- タップ（クリック）で拡大表示 ----------
   各グラフの svg に付ける。拡大画面には元のパネルの見出し・凡例を複製し、同じデータで大きく描き直す。
   閉じる：×ボタン・背景のタップ・Escキー。 */
function kbZoomable(svg, host, render, keepHeadOnly){
  if(!svg) return;
  svg.classList.add("kbzoomable");
  svg.addEventListener("click", function(){
    var panel=host.closest(".panel,.fp")||host;
    kbOpenZoom(function(body,BH){
      body.appendChild(kbHeadClone(panel, keepHeadOnly));
      render(body, BH);
    });
  });
}
function kbHeadClone(panel, headOnly){
  var out=document.createElement("div");
  [].forEach.call(panel.children, function(ch){
    if(ch.hidden || ch.classList.contains("kbplot") || ch.classList.contains("kbpie") || ch.classList.contains("kbempty")
       || (ch.querySelector && ch.querySelector(".kbplot,table"))) return;
    if(headOnly && !ch.matches(".p-head,.fh")) return;            // 貸借対照表は凡例・切り替えを描き直すので見出しだけ
    var c=ch.cloneNode(true);
    c.querySelectorAll("button,.kbseg").forEach(function(b){ b.remove(); });
    out.appendChild(c);
  });
  out.className=panel.className+" kbzhead";   // 元のパネルと同じクラスにして、見出し・凡例の見た目をそろえる
  out.removeAttribute("id");
  return out;
}
function kbOpenZoom(render){
  var ov=document.createElement("div"); ov.className="kbzoom"; ov.setAttribute("role","dialog"); ov.setAttribute("aria-modal","true");
  var box=document.createElement("div"); box.className="kbzbox";
  var cl=document.createElement("button"); cl.type="button"; cl.className="kbzclose"; cl.setAttribute("aria-label","閉じる"); cl.textContent="×";
  var body=document.createElement("div"); body.className="kbzbody";
  box.appendChild(cl); box.appendChild(body); ov.appendChild(box); document.body.appendChild(ov);
  document.documentElement.classList.add("kbz-open");
  var BH=Math.round(Math.max(240, Math.min(innerHeight*0.66, 640)));
  render(body, BH);
  function done(){ ov.remove(); document.documentElement.classList.remove("kbz-open"); removeEventListener("keydown", key); }
  function key(e){ if(e.key==="Escape") done(); }
  ov.addEventListener("click", function(e){ if(e.target===ov) done(); });
  cl.addEventListener("click", done); addEventListener("keydown", key);
  try{ cl.focus({preventScroll:true}); }catch(e){}
}
