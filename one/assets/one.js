
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
  /* 売買サイン [足, +1買い／−1売り, 種類, 名前]（チャート一覧の個別チャートと同じ10種類。日足の終値で判定） */
  const mk=(ev,kd,bn,sn,ok)=>ev.forEach(([i,s])=>{if(i>=st&&(!ok||ok(i,s)))marks.push([i-st,s,kd,s>0?bn:sn]);});
  const only=d=>(i,s)=>s===d;
  mk(cross(sma(Cl,5),ma25),'ma5','GC 5×25','DC 5×25');
  mk(cross(ma25,ma75),'ma','ゴールデンクロス(25×75)','デッドクロス(25×75)');
  mk(cross(macd,msig),'macd','MACD上抜け','MACD下抜け');
  mk(cross(rsi,30),'rsi','RSI 30上抜け','',only(1));mk(cross(rsi,70),'rsi','','RSI 70下抜け',only(-1));
  const rci=nul(),RW=9,den=RW*RW*RW-RW;for(let i=RW-1;i<n;i++){const w=[];for(let j=0;j<RW;j++)w.push({t:j+1,c:Cl[i-j]});
    [...w].sort((a,b)=>b.c-a.c).forEach((o,k)=>o.p=k+1);let d=0;w.forEach(o=>d+=(o.t-o.p)**2);rci[i]=(1-6*d/den)*100;}
  mk(cross(rci,-80),'rci','RCI −80上抜け','',only(1));mk(cross(rci,80),'rci','','RCI +80下抜け',only(-1));
  mk(cross(Cl,bbl),'bb','−2σを上抜け','',only(1));mk(cross(Cl,bbu),'bb','','+2σを下抜け',only(-1));
  const sK=nul();for(let i=13;i<n;i++){let hh=-Infinity,ll=Infinity;for(let j=i-13;j<=i;j++){hh=Math.max(hh,H[j]);ll=Math.min(ll,L[j]);}sK[i]=hh===ll?50:(Cl[i]-ll)/(hh-ll)*100;}
  const sD=nul();for(let i=15;i<n;i++)if(sK[i-2]!=null)sD[i]=(sK[i]+sK[i-1]+sK[i-2])/3;
  mk(cross(sK,sD),'stoch','ストキャス上抜け','ストキャス下抜け',(i,s)=>s>0?sD[i]<=30:sD[i]>=70);
  const sar=nul(),sup=nul();if(n>2){let up=Cl[1]>=Cl[0],af=.02,ep=up?Math.max(H[0],H[1]):Math.min(L[0],L[1]),v=up?Math.min(L[0],L[1]):Math.max(H[0],H[1]);sup[1]=up;
    for(let i=2;i<n;i++){v+=af*(ep-v);if(up){v=Math.min(v,L[i-1],L[i-2]);if(L[i]<v){up=false;v=ep;ep=L[i];af=.02;}else if(H[i]>ep){ep=H[i];af=Math.min(af+.02,.2);}}
      else{v=Math.max(v,H[i-1],H[i-2]);if(H[i]>v){up=true;v=ep;ep=H[i];af=.02;}else if(L[i]<ep){ep=L[i];af=Math.min(af+.02,.2);}}sar[i]=v;sup[i]=up;}}
  for(let i=2;i<n;i++)if(i>=st&&sup[i]!==sup[i-1])marks.push([i-st,sup[i]?1:-1,'psar',sup[i]?'SAR上昇転換':'SAR下降転換']);
  mk(cross(tk,kj),'ichi','転換線上抜け','転換線下抜け');
  const rma=(a,k)=>{const o=nul();let e=null,s0=0,c=0;for(let i=0;i<n;i++){const v=a[i];if(v==null)continue;if(e==null){s0+=v;c++;if(c===k){e=s0/k;o[i]=e;}}else{e+=(v-e)/k;o[i]=e;}}return o;};
  const pdm=nul(),mdm=nul(),tr=nul();for(let i=1;i<n;i++){const u=H[i]-H[i-1],d=L[i-1]-L[i];pdm[i]=u>d&&u>0?u:0;mdm[i]=d>u&&d>0?d:0;tr[i]=Math.max(H[i],Cl[i-1])-Math.min(L[i],Cl[i-1]);}
  const str=rma(tr,14),pdi=rma(pdm,14).map((v,i)=>v==null||!str[i]?null:v/str[i]*100),mdi=rma(mdm,14).map((v,i)=>v==null||!str[i]?null:v/str[i]*100);
  mk(cross(pdi,mdi),'dmi','+DI上抜け','−DI上抜け');
  const m=n-st,ext=a=>{const o=[];for(let k=0;k<m+26;k++){const j=st+k-26;o.push(j>=0&&j<n?a[j]:null);}return o;};
  return {d:cut(P.d),o:cut(P.o),h:cut(H),l:cut(L),c:cut(Cl),v:cut(P.v),ma25:cut(ma25),ma75:cut(ma75),ma200:cut(ma200),bbu:cut(bbu),bbl:cut(bbl),
    rsi:cut(rsi),macd:cut(macd),msig:cut(msig),mhist:cut(mhist),tk:cut(tk),kj:cut(kj),ia:ext(sa),ib:ext(sb),marks};}
const I=DATA.info,C=calcChart(DATA.px),E=DATA.extra,F=DATA.fy,R=DATA.srow,M=DATA.smeta||{levels:{t:[50,20,-20,-50],f:[55,20,-20,-55],tr:[50,20,-20,-50],os:[70,35,-35,-70]},names:['良好','やや良好','中立','弱い','避ける'],tw:{},fw:{}};
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
const ENDS={t:['避ける','良好'],f:['避ける','良好'],tr:['下降','上昇'],os:['買われすぎ','売られすぎ']};
const CX=130,CY=132,RR=96,SW=22;
const ang=s=>Math.PI*(1-(s+100)/200),pt=(s,r)=>[CX+r*Math.cos(ang(s)),CY-r*Math.sin(ang(s))];
function arc(a,b,r){const [x1,y1]=pt(a,r),[x2,y2]=pt(b,r);return `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 0 1 ${x2.toFixed(2)},${y2.toFixed(2)}`;}
function gauge(svg,s,k){const ends=ENDS[k];
  const [sb,b,se,ss]=M.levels[k],cuts=[-100,ss,se,b,sb,100],zc=['--z0','--z1','--z2','--z3','--z4'];let h='';
  for(let i=0;i<5;i++){const a=cuts[i]+(i?1.1:0),e=cuts[i+1]-(i<4?1.1:0);h+=`<path d="${arc(a,e,RR)}" stroke="var(${zc[i]})" stroke-width="${SW}" fill="none"/>`;}
  const on=s!=null,deg=on?Math.max(-100,Math.min(100,s))*0.9:0;
  h+=`<g class="needle"${on?'':' opacity=".25"'}><path d="M${CX-5},${CY} L${CX},${CY-RR+6} L${CX+5},${CY} Z" fill="var(--fg)"/></g>
      <circle cx="${CX}" cy="${CY}" r="9" fill="var(--fg)"/><circle cx="${CX}" cy="${CY}" r="3.5" fill="var(--card)"/>`;
  const prev=+(svg.dataset.deg||0);svg.innerHTML=h;svg.setAttribute('viewBox','16 18 228 128');
  const nd=svg.querySelector('.needle');svg.dataset.deg=deg;const set=a=>nd.setAttribute('transform',`rotate(${a.toFixed(2)} ${CX} ${CY})`);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){set(deg);return;}
  const ease=t=>{const c=1.4;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2);},t0=performance.now();set(prev);
  const step=now=>{const t=Math.min(1,(now-t0)/800);set(prev+(deg-prev)*ease(t));if(t<1)requestAnimationFrame(step);};requestAnimationFrame(step);}
function overall(r){const d=(s,k)=>{const i=lvl(s,k);return i<0?null:i<=1?1:i>=3?-1:0;};const t=d(r.ts,'t'),f=d(r.fs,'f');
  if(t==null&&f==null)return ['評価なし',-1];if(f==null)return t>0?['やや良好',1]:t<0?['注意',3]:['中立',2];
  const a=(t||0)+f;if(a===2)return ['買い候補',0];if(a===1)return ['やや良好',1];if(a===-2)return ['避ける',4];if(a===-1)return ['注意',3];
  return t!==0?['様子見',2]:['中立',2];}
function verdictText(r){const t=lvl(r.ts,'t'),f=lvl(r.fs,'f'),tb=t===0||t===1,ts=t===3||t===4,fb=f===0||f===1,fsell=f===3||f===4;
  if(f<0)return ['ファンダ評価なし','決算データが足りないため、テクニカルだけで判断してください。'];
  if(tb&&fb)return ['両方とも良好','割安さも値動き（高値圏・落ち着いた値動き）も良好な組み合わせです。'];
  if(fb&&ts)return ['割安だが値動きは弱い','割安度は良好。ただし過去の検証では、テクニカル下位の銘柄はその後も市場に負けやすい傾向がありました。'];
  if(fsell&&tb)return ['値動きは良いが割高','値動きは良好ですが、割安さの裏付けが薄い組み合わせです。'];
  if(fsell&&ts)return ['両方とも弱い（避ける候補）','割安さ・値動きとも弱い組み合わせです。過去の検証で最も差が出たのはこちら側です。'];
  if(fb)return ['割安・値動きは普通','ファンダは良好側、テクニカルは中立です。'];
  if(tb)return ['値動きは良好・割安さは普通','テクニカルは良好側、ファンダは中立です。'];
  if(fsell)return ['割高・中身が弱い','ファンダが弱い側、テクニカルは中立です。'];
  if(ts)return ['値動きが弱い','テクニカルが弱い側（安値圏・荒い値動きなど）、ファンダは中立です。'];
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
const TNAME={hi52:['52週高値への近さ','高値圏'],lv:['値動きの小ささ','低ボラ'],ma:['移動平均','トレンド'],macd:['MACD','トレンド'],ichi:['一目均衡表','トレンド'],rsi:['RSI(14)','逆張り'],bb:['ボリンジャー','逆張り'],vol:['出来高','勢い']};
const FNAME={val:['割安度','PER・PBR'],prof:['収益性','ROE'],grow:['成長性','増収率'],safe:['安全性','自己資本'],fs:['Fスコア','財務改善'],cash:['キャッシュ','FCF']};
const TKEYS=(M.tw&&Object.keys(M.tw).length)?Object.keys(M.tw):['ma','macd','ichi','rsi','bb','vol'],FKEYS=(M.fw&&Object.keys(M.fw).length)?Object.keys(M.fw):['val','prof','grow','safe','fs','cash'];
function trObj(a){if(!a)return null;const [dev25,dev75,dev200,up25,hist,rise,cloud,tk,rsi,pb,upr,surge,near,hi,vol]=a;return {hi52:{near,hi},lv:{vol},ma:{dev25,dev75,dev200,up25},macd:{hist,rise},ichi:{cloud,tk},rsi:{rsi},bb:{pb},vol:{upr,surge}};}
function frObj(a){if(!a)return null;const [per,pbr,vg,base,roe,pg,opm,gr,cagr,gg,eq,sg,fs,fcfy,dy,fin,evm]=a;return {val:{per,pbr,evm,g:vg,base},prof:{roe,g:pg,opm},grow:{gr,cagr,g:gg},safe:{eq,g:sg},fs:{fs},cash:{fcfy,dy,fin}};}
function tDesc(k,x){if(!x)return '';switch(k){
  case 'hi52':return `終値は52週高値の ${fmt(x.near,1)}%（97%以上で+1、67%以下で−1）`;
  case 'lv':return `60日の値動き 年率${fmt(x.vol,1)}%（15%以下で+1、55%以上で−1）`;
  case 'ma':return `25日線乖離 ${pct(x.dev25)}・75日線 ${pct(x.dev75)}・200日線 ${pct(x.dev200)}・25日線は${x.up25==null?'―':x.up25?'上向き':'下向き'}`;
  case 'macd':return `ヒストグラム ${x.hist==null?'―':(x.hist>0?'プラス':'マイナス')}（株価比 ${pct(x.hist)}）・${x.rise==null?'―':x.rise?'拡大／改善中':'縮小／悪化中'}`;
  case 'ichi':return `株価は雲の${x.cloud==null?'―':x.cloud>0?'上':x.cloud<0?'下':'中'}・転換線${x.tk==null?'―':x.tk>0?'＞':x.tk<0?'＜':'＝'}基準線`;
  case 'rsi':return `RSI ${fmt(x.rsi,1)}（30以下で売られすぎ＝買い、70以上で買われすぎ＝売り）`;
  case 'bb':return `%B ${fmt(x.pb)}%（0%＝−2σ、100%＝+2σ）`;
  case 'vol':return `上昇日の出来高比率 ${fmt(x.upr)}%・5日/25日出来高 ${fmt(x.surge,2)}倍`;}}
function fDesc(k,x){if(!x)return '';const g=v=>v==null?'':`（評価${v}）`;switch(k){
  case 'val':return `PER ${fmt(x.per,1)}倍・PBR ${fmt(x.pbr,2)}倍${x.evm!=null?'・EV/EBITDA '+fmt(x.evm,1)+'倍':''}${g(x.g)}`;
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
  </svg><div class="lb"><span>${n-1}日前</span><span>青帯＝やや良好以上・赤帯＝弱い以下</span><span>最新</span></div>`;
  const svg=elm.querySelector('svg');svg.addEventListener('pointermove',e=>{const bb=svg.getBoundingClientRect(),i=Math.max(0,Math.min(n-1,Math.round((e.clientX-bb.left)/bb.width*(n-1))));
    tip(e,`<b>${n-1-i?(n-1-i)+'営業日前':'最新日'}</b><br>株価 ${f0(hp[i])}円<br>スコア ${sgn(hs[i])}（${hs[i]==null?'―':NAMES[lvl(hs[i],'t')]}）`);});
  svg.addEventListener('pointerleave',untip);}
function drawGauges(){if(!R)return;gauge($('qT'),R.ts,'t');gauge($('qTT'),R.tt,'tr');gauge($('qTO'),R.to,'os');gauge($('qF'),R.fs,'f');}
function drawSignals(){
  const r=R;if(!r){$('big').innerHTML='<div class="ds">この銘柄は売買シグナルが算出されていません（株価の期間が短い、または signals.html が未作成）。</div>';return;}
  const [lab,li]=overall(r),[head,desc]=verdictText(r);
  const col=li<0||li===2?'var(--fg2)':li<2?'var(--z4)':'var(--z0)',bg=li===0?'var(--z4)':li===4?'var(--z0)':'transparent',fg=li===0||li===4?'#fff':li===1?'var(--z4t)':li===3?'var(--z0t)':'var(--fg2)';
  $('big').innerHTML=`<span class="lab" style="border-color:${col};background:${bg};color:${fg}">${lab}</span><div><div class="hd">${head}</div><div class="ds">${desc}</div></div>`;
  const q=(id,k,t,cap,s,pill)=>`<div class="q"><svg id="${id}" role="img"></svg><div class="qt"><h4>${t}</h4><div class="cap">${cap}</div><div class="ro"><b>${sgn(s)}</b>${pill}</div><div class="qe"><span>${ENDS[k][0]}</span><span>${ENDS[k][1]}</span></div></div></div>`;
  $('quad').innerHTML=q('qT','t','テクニカル','総合',r.ts,pillHTML(r.ts,'t'))+q('qTT','tr','トレンド系','移動平均・MACD・一目',r.tt,pillHTML(r.tt,'tr',TRN))
    +q('qTO','os','オシレーター系','RSI・ボリンジャー',r.to,pillHTML(r.to,'os',OSN))+q('qF','f','ファンダメンタル',r.fp?r.fp.slice(0,7).replace('-','年')+'月期':'決算',r.fs,pillHTML(r.fs,'f'));
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
/* ================= テクニカル指標（トレンド系はチャートに重ね、オシレーター系はチャートの下に並べる） =================
   マーケットスピードIIのテクニカル一覧を参考に、日足の4本値と出来高だけで計算できるものを選べるようにした。
   計算は表示期間より前（WARMUP分）も含めた生データで行い、表示範囲だけを描く。
   選んだ指標・細目・期間はこの端末のブラウザに保存（保存できない環境では毎回初期設定） */
const PX=DATA.px,PN=PX.c.length,PST=Math.max(0,PN-PX.show);   // C の添字 i ＝ 生データの添字 i+PST
const IPAL=['#E8A33D','#2F8FB5','#8E5BA6','#D9628B','#4E9F3D','#B07A3B','#5B6FD6','#9A9890'];
const TA=(()=>{const n=PN,H=PX.h,L=PX.l,Cl=PX.c,O=PX.o,nul=()=>new Array(n).fill(null);
  const sma=(a,k)=>{const o=nul();let s=0,c=0;for(let i=0;i<n;i++){const v=a[i];if(v==null){s=0;c=0;continue;}s+=v;c++;if(c>k){s-=a[i-k];c=k;}if(c===k)o[i]=s/k;}return o;};
  const ema=(a,k)=>{const o=nul(),w=2/(k+1);let e=null,c=0,s=0;for(let i=0;i<n;i++){const v=a[i];if(v==null)continue;
    if(e==null){s+=v;c++;if(c===k){e=s/k;o[i]=e;}continue;}e=v*w+e*(1-w);o[i]=e;}return o;};
  const rma=(a,k)=>{const o=nul();let e=null,c=0,s=0;for(let i=0;i<n;i++){const v=a[i];if(v==null)continue;
    if(e==null){s+=v;c++;if(c===k){e=s/k;o[i]=e;}continue;}e=(e*(k-1)+v)/k;o[i]=e;}return o;};
  const wma=(a,k)=>{const o=nul(),dn=k*(k+1)/2;for(let i=k-1;i<n;i++){let s=0,ok=true;for(let j=0;j<k;j++){const v=a[i-j];if(v==null){ok=false;break;}s+=v*(k-j);}if(ok)o[i]=s/dn;}return o;};
  const sd=(a,k,samp)=>{const o=nul(),m=sma(a,k);for(let i=k-1;i<n;i++){if(m[i]==null)continue;let q=0;for(let j=i-k+1;j<=i;j++)q+=(a[j]-m[i])**2;o[i]=Math.sqrt(q/(samp?k-1:k));}return o;};
  const hh=(a,k,off=0)=>{const o=nul();for(let i=k-1+off;i<n;i++){let m=-Infinity;for(let j=i-off-k+1;j<=i-off;j++)if(a[j]>m)m=a[j];o[i]=m;}return o;};
  const ll=(a,k,off=0)=>{const o=nul();for(let i=k-1+off;i<n;i++){let m=Infinity;for(let j=i-off-k+1;j<=i-off;j++)if(a[j]<m)m=a[j];o[i]=m;}return o;};
  const sum=(a,k)=>{const o=nul();let s=0;for(let i=0;i<n;i++){s+=a[i]||0;if(i>=k)s-=a[i-k]||0;if(i>=k-1)o[i]=s;}return o;};
  const map=(f)=>{const o=nul();for(let i=0;i<n;i++){const v=f(i);o[i]=v==null||!isFinite(v)?null:v;}return o;};
  const tr=map(i=>i?Math.max(H[i]-L[i],Math.abs(H[i]-Cl[i-1]),Math.abs(L[i]-Cl[i-1])):H[i]-L[i]);
  return {n,H,L,Cl,O,V:PX.v,nul,sma,ema,rma,wma,sd,hh,ll,sum,map,tr};})();
const P0=v=>Math.max(1,Math.round(v));
/* 細目 it: [キー, 表示名, 初期表示, 色, 期間パラメータ（細目ごとに期間を持つとき）]  パラメータ p: [キー, 表示名, 初期値, 最小, 最大, 刻み] */
const IND={
 /* ---------- トレンド系（チャートに重ねる） ---------- */
 sma:{g:'tr',name:'単純移動平均線',d:'指定期間の終値の平均。5・25・75・125・175日（マーケットスピードの初期値）',
  p:[['n1','1本目',5,2,300],['n2','2本目',25,2,300],['n3','3本目',75,2,300],['n4','4本目',125,2,300],['n5','5本目',175,2,300]],
  it:[['l1','',1,IPAL[3],'n1'],['l2','',1,'--ma25','n2'],['l3','',1,'--ma75','n3'],['l4','',0,IPAL[4],'n4'],['l5','',0,'--ma200','n5']],
  f:p=>({lines:[1,2,3,4,5].map(k=>({k:'l'+k,name:'SMA'+p['n'+k],a:TA.sma(TA.Cl,P0(p['n'+k]))}))})},
 ema:{g:'tr',name:'指数移動平均線',d:'直近の価格に重みを置いた移動平均。転換を早めにとらえる',
  p:[['n1','1本目',5,2,300],['n2','2本目',25,2,300],['n3','3本目',75,2,300],['n4','4本目',120,2,300],['n5','5本目',150,2,300]],
  it:[['l1','',1,IPAL[3],'n1'],['l2','',1,'--ma25','n2'],['l3','',1,'--ma75','n3'],['l4','',0,IPAL[4],'n4'],['l5','',0,'--ma200','n5']],
  f:p=>({lines:[1,2,3,4,5].map(k=>({k:'l'+k,name:'EMA'+p['n'+k],a:TA.ema(TA.Cl,P0(p['n'+k])),dash:'5 2'}))})},
 wma:{g:'tr',name:'加重移動平均線',d:'新しい日ほど大きな係数を掛けた移動平均',
  p:[['n1','1本目',5,2,300],['n2','2本目',25,2,300],['n3','3本目',75,2,300],['n4','4本目',120,2,300],['n5','5本目',150,2,300]],
  it:[['l1','',1,IPAL[3],'n1'],['l2','',1,'--ma25','n2'],['l3','',1,'--ma75','n3'],['l4','',0,IPAL[4],'n4'],['l5','',0,'--ma200','n5']],
  f:p=>({lines:[1,2,3,4,5].map(k=>({k:'l'+k,name:'WMA'+p['n'+k],a:TA.wma(TA.Cl,P0(p['n'+k])),dash:'2 2'}))})},
 mma:{g:'tr',name:'多重移動平均線',d:'期間の違う移動平均を14本重ねる（2・4・6…28日）。短期群と長期群の束の向き・広がりを見る',
  p:[['s','最短',2,1,50],['st','間隔',2,1,20]],it:[['s','短期群（1〜7本目）',1,'#E8A33D'],['l','長期群（8〜14本目）',1,'#2F8FB5']],
  f:p=>{const L=[];for(let j=0;j<14;j++){const k=P0(p.s+j*p.st),t=j/13;L.push({k:j<7?'s':'l',name:'MA'+k,a:TA.sma(TA.Cl,k),
    col:j<7?`hsl(${32-j*3},80%,${48+j*2}%)`:`hsl(${200+(j-7)*4},55%,${42+(j-7)*2}%)`,w:.8,nolg:j!==0&&j!==7,lgname:j<7?'短期群':'長期群'});}return {lines:L};}},
 ichi:{g:'tr',name:'一目均衡表',d:'転換線・基準線・先行スパン（雲）・遅行スパン。雲は基準線の期間だけ先に描く',
  p:[['t','転換線',9,2,100],['k','基準線',26,2,200],['s','スパン2',52,2,300]],
  it:[['tk','転換線',1,'--tenkan'],['kj','基準線',1,'--kijun'],['cl','雲（先行スパン1・2）',1,'--cloudU'],['ch','遅行スパン',1,'--chikou']],
  f:p=>{const t=P0(p.t),k=P0(p.k),s=P0(p.s),mid=q=>TA.map(i=>i<q-1?null:(Math.max(...TA.H.slice(i-q+1,i+1))+Math.min(...TA.L.slice(i-q+1,i+1)))/2);
   const tk=mid(t),kj=mid(k),sb=mid(s),sa=TA.map(i=>tk[i]!=null&&kj[i]!=null?(tk[i]+kj[i])/2:null);
   return {lines:[{k:'tk',name:'転換線',a:tk,w:1.1},{k:'kj',name:'基準線',a:kj,w:1.2},{k:'cl',name:'先行1',lgname:'雲',a:sa,shift:k,w:.8,col:'--cloudU'},{k:'cl',name:'先行2',a:sb,shift:k,w:.8,col:'--cloudD',nolg:1,tip:1},
     {k:'ch',name:'遅行',a:TA.Cl,shift:-k,w:.9}],fills:[{k:'cl',a:sa,b:sb,shift:k,cu:'--cloudU',cd:'--cloudD',op:.38}]};}},
 bb:{g:'tr',name:'ボリンジャーバンド',d:'移動平均±標準偏差の帯。±2σの中に約95%が収まる',
  p:[['n','期間',25,2,200]],it:[['ma','MA',1,'--acc'],['s1','±1σ',0,IPAL[4]],['s2','±2σ',1,'--acc'],['s3','±3σ',0,IPAL[3]]],
  f:p=>{const n=P0(p.n),m=TA.sma(TA.Cl,n),s=TA.sd(TA.Cl,n),b=k=>[TA.map(i=>m[i]==null?null:m[i]+k*s[i]),TA.map(i=>m[i]==null?null:m[i]-k*s[i])];
   const L=[{k:'ma',name:'MA'+n,a:m,w:.9}],F=[];[1,2,3].forEach(k=>{const[u,d]=b(k);L.push({k:'s'+k,name:'+'+k+'σ',a:u,w:.7,dash:'3 3'},{k:'s'+k,name:'−'+k+'σ',a:d,w:.7,dash:'3 3',nolg:1});F.push({k:'s'+k,a:u,b:d,c:'--band',op:1});});
   return {lines:L,fills:F,fillOne:1};}},
 env:{g:'tr',name:'エンベロープ',d:'移動平均から上下に一定％離したライン。離れすぎると平均へ戻りやすい',
  p:[['n','期間',25,2,200],['r1','乖離幅1(%)',1,.1,30,.1],['r2','乖離幅2(%)',2,.1,30,.1]],it:[['ma','MA',1,'--acc'],['e1','±乖離幅1',1,IPAL[4]],['e2','±乖離幅2',1,IPAL[3]]],
  f:p=>{const m=TA.sma(TA.Cl,P0(p.n)),e=r=>[TA.map(i=>m[i]==null?null:m[i]*(1+r/100)),TA.map(i=>m[i]==null?null:m[i]*(1-r/100))];const[a1,b1]=e(p.r1),[a2,b2]=e(p.r2);
   return {lines:[{k:'ma',name:'MA'+P0(p.n),a:m,w:.9},{k:'e1',name:'±'+p.r1+'%',a:a1,dash:'4 2',w:.8},{k:'e1',name:'',a:b1,dash:'4 2',w:.8,nolg:1},{k:'e2',name:'±'+p.r2+'%',a:a2,dash:'4 2',w:.8},{k:'e2',name:'',a:b2,dash:'4 2',w:.8,nolg:1}]};}},
 sar:{g:'tr',name:'パラボリック',d:'SAR（ストップ＆リバース）。ローソク足がSARを突き抜けたら売買転換',
  p:[['af','加速因数',.02,.005,.2,.005],['mx','上限',.2,.05,1,.01]],it:[['up','上昇（SAR-L）',1,'--z4'],['dn','下降（SAR-H）',1,'--z0']],
  f:p=>{const n=TA.n,H=TA.H,L=TA.L,up=TA.nul(),dn=TA.nul();if(n<3)return {dots:[]};let bull=TA.Cl[1]>=TA.Cl[0],af=p.af,ep=bull?H[1]:L[1],sar=bull?L[0]:H[0];
   for(let i=1;i<n;i++){if(i>1){sar=sar+af*(ep-sar);if(bull)sar=Math.min(sar,L[i-1],L[i-2]);else sar=Math.max(sar,H[i-1],H[i-2]);}
    if(bull&&L[i]<sar){bull=false;sar=ep;ep=L[i];af=p.af;}else if(!bull&&H[i]>sar){bull=true;sar=ep;ep=H[i];af=p.af;}
    else{if(bull&&H[i]>ep){ep=H[i];af=Math.min(p.mx,af+p.af);}if(!bull&&L[i]<ep){ep=L[i];af=Math.min(p.mx,af+p.af);}}
    (bull?up:dn)[i]=sar;}
   return {dots:[{k:'up',name:'SAR-L',a:up},{k:'dn',name:'SAR-H',a:dn}]};}},
 hl:{g:'tr',name:'HLバンド',d:'前の足からさかのぼった期間の高値（Hバンド）・安値（Lバンド）と、その中心線',
  p:[['n','期間',20,2,200]],it:[['h','Hバンド',1,'--z0'],['l','Lバンド',1,'--z4'],['m','ミドル',0,'--mut']],
  f:p=>{const n=P0(p.n),h=TA.hh(TA.H,n,1),l=TA.ll(TA.L,n,1);return {lines:[{k:'h',name:'H'+n,a:h,w:.9},{k:'l',name:'L'+n,a:l,w:.9},{k:'m',name:'ミドル',a:TA.map(i=>h[i]==null?null:(h[i]+l[i])/2),w:.8,dash:'3 3'}]};}},
 vvs:{g:'tr',name:'VVS（ボラティリティ・ストップ）',d:'終値とATRから引く手じまいライン。下降中は価格の上に赤、上昇中は下に青で表示（ATR倍率は独自設定）',
  p:[['n','期間',21,2,100],['m','ATR倍率',3,.5,6,.5]],it:[['up','VVSアップ',1,'--z4'],['dn','VVSダウン',1,'--z0']],
  f:p=>{const n=P0(p.n),atr=TA.rma(TA.tr,n),up=TA.nul(),dn=TA.nul();let bull=true,st=null,ex=null;
   for(let i=0;i<TA.n;i++){if(atr[i]==null)continue;const c=TA.Cl[i],a=atr[i]*p.m;if(st==null){st=c-a;ex=c;bull=true;}
    if(bull){ex=Math.max(ex,c);st=Math.max(st,ex-a);if(c<st){bull=false;ex=c;st=c+a;}}else{ex=Math.min(ex,c);st=Math.min(st,ex+a);if(c>st){bull=true;ex=c;st=c-a;}}
    (bull?up:dn)[i]=st;}return {dots:[{k:'up',name:'VVS↑',a:up},{k:'dn',name:'VVS↓',a:dn}]};}},
 reg:{g:'tr',name:'回帰トレンド',d:'直近の指定期間の終値に最小二乗法で引いた直線（FIT）と、その±1σ・±2σ',
  p:[['n','期間',125,10,750]],it:[['fit','FIT',1,'--acc'],['s1','±1σ',1,IPAL[4]],['s2','±2σ',1,IPAL[3]]],
  f:p=>{const n=Math.min(P0(p.n),TA.n),a0=TA.n-n;let sx=0,sy=0,sxx=0,sxy=0;for(let k=0;k<n;k++){const y=TA.Cl[a0+k];sx+=k;sy+=y;sxx+=k*k;sxy+=k*y;}
   const b=(n*sxy-sx*sy)/(n*sxx-sx*sx||1),a=(sy-b*sx)/n;let q=0;for(let k=0;k<n;k++)q+=(TA.Cl[a0+k]-(a+b*k))**2;const s=Math.sqrt(q/n);
   const ln=o=>TA.map(i=>i<a0?null:a+b*(i-a0)+o*s);
   return {lines:[{k:'fit',name:'FIT',a:ln(0),w:1.1},{k:'s1',name:'±1σ',a:ln(1),dash:'4 3',w:.8},{k:'s1',name:'',a:ln(-1),dash:'4 3',w:.8,nolg:1},{k:'s2',name:'±2σ',a:ln(2),dash:'4 3',w:.8},{k:'s2',name:'',a:ln(-2),dash:'4 3',w:.8,nolg:1}]};}},
 fib:{g:'tr',name:'フィボナッチ（押し・戻し）',d:'表示中の期間の最高値と最安値の幅に、23.6・38.2・50・61.8・76.4%の横線を引く',view:1,
  p:[],it:[['m','38.2・50・61.8%',1,'#C98A00'],['s','23.6・76.4%',1,'#B07A3B'],['e','0・100%',0,'--mut']],
  f:(p,v)=>{let hi=-Infinity,lo=Infinity,ih=0,il=0;for(let i=v.a;i<TA.n;i++){if(TA.H[i]>hi){hi=TA.H[i];ih=i;}if(TA.L[i]<lo){lo=TA.L[i];il=i;}}
   const upT=il<ih,lv=r=>upT?hi-(hi-lo)*r:lo+(hi-lo)*r,mk=(k,r)=>({k,v:lv(r),name:(r*100).toFixed(1).replace('.0','')+'%'});
   return {hl:[mk('e',0),mk('s',.236),mk('m',.382),mk('m',.5),mk('m',.618),mk('s',.764),mk('e',1)],note:upT?'上昇の押し':'下落の戻し'};}},
 piv:{g:'tr',name:'ピボット',d:'最新日の高値・安値・終値から出す翌日の目安線（HBOP・抵抗線・ピボット・支持線・LBOP）',
  p:[],it:[['bo','HBOP・LBOP',0,'--mut'],['r','抵抗線1・2',1,'--z0'],['p','ピボット',1,'--fg2'],['s','支持線1・2',1,'--z4']],
  f:p=>{const i=TA.n-1,H=TA.H[i],L=TA.L[i],c=TA.Cl[i],P=(H+L+c)/3;
   return {hl:[{k:'bo',v:2*P-2*L+H,name:'HBOP'},{k:'r',v:P+(H-L),name:'R2'},{k:'r',v:2*P-L,name:'R1'},{k:'p',v:P,name:'P'},{k:'s',v:2*P-H,name:'S1'},{k:'s',v:P-(H-L),name:'S2'},{k:'bo',v:2*P-2*H+L,name:'LBOP'}],short:1};}},
 pb:{g:'tr',name:'ピークボトム',d:'前後の指定期間で一番高い足をピーク、安い足をボトムとして価格を表示',
  p:[['n','期間',10,2,60]],it:[['pk','ピーク',1,'--z0'],['bt','ボトム',1,'--z4']],
  f:p=>{const n=P0(p.n),M=[];for(let i=n;i<TA.n-1;i++){let isH=true,isL=true;for(let j=Math.max(0,i-n);j<=Math.min(TA.n-1,i+n);j++){if(j===i)continue;if(TA.H[j]>=TA.H[i])isH=false;if(TA.L[j]<=TA.L[i])isL=false;if(!isH&&!isL)break;}
    if(isH)M.push({k:'pk',i,v:TA.H[i],up:1});if(isL)M.push({k:'bt',i,v:TA.L[i],up:0});}return {pts:M};}},
 ha:{g:'tr',name:'平均足',d:'始値・終値を平均でならしたローソク足に置き換える。トレンドの続き・転換が見やすい',
  p:[],it:[['c','平均足で表示',1,'--candleU']],
  f:p=>{const n=TA.n,o=TA.nul(),c=TA.nul(),h=TA.nul(),l=TA.nul();for(let i=0;i<n;i++){c[i]=(TA.O[i]+TA.H[i]+TA.L[i]+TA.Cl[i])/4;o[i]=i?(o[i-1]+c[i-1])/2:(TA.O[i]+TA.Cl[i])/2;
    h[i]=Math.max(TA.H[i],o[i],c[i]);l[i]=Math.min(TA.L[i],o[i],c[i]);}return {candles:{k:'c',o,h,l,c}};}},

 /* ---------- オシレーター系（チャートの下に表示） ---------- */
 vol:{g:'os',name:'出来高',d:'売買が成立した株数。棒は陽線・陰線の色。移動平均を重ねられる',
  p:[['m1','移動平均1',5,2,200],['m2','移動平均2',25,2,200]],it:[['bar','出来高',1,'--mut'],['a1','',0,IPAL[3],'m1'],['a2','',1,'--ma25','m2']],
  f:p=>({vbars:{k:'bar',a:TA.V},lines:[{k:'a1',name:'MA'+P0(p.m1),a:TA.sma(TA.V,P0(p.m1))},{k:'a2',name:'MA'+P0(p.m2),a:TA.sma(TA.V,P0(p.m2))}],lo0:1,fm:'vol'})},
 dev:{g:'os',name:'移動平均乖離率',d:'終値が移動平均から何％離れているか。買われすぎ・売られすぎの目安',
  p:[['n1','1本目',5,2,300],['n2','2本目',25,2,300],['n3','3本目',75,2,300]],it:[['l1','',0,IPAL[3],'n1'],['l2','',1,'--ma25','n2'],['l3','',0,'--ma75','n3']],
  f:p=>({lines:[1,2,3].map(k=>{const m=TA.sma(TA.Cl,P0(p['n'+k]));return {k:'l'+k,name:P0(p['n'+k])+'日',a:TA.map(i=>m[i]==null?null:(TA.Cl[i]/m[i]-1)*100)};}),refs:[0],unit:'%'})},
 rsi:{g:'os',name:'RSI',d:'値上がり幅の割合（0〜100%）。70%以上で買われすぎ、30%以下で売られすぎ',
  p:[['n1','期間1',14,2,100],['n2','期間2',9,2,100]],it:[['r1','',1,'#1F7A8C','n1'],['r2','',0,IPAL[3],'n2']],
  f:p=>{const R=k=>{const g=TA.map(i=>i?Math.max(TA.Cl[i]-TA.Cl[i-1],0):null),l=TA.map(i=>i?Math.max(TA.Cl[i-1]-TA.Cl[i],0):null),ag=TA.rma(g,k),al=TA.rma(l,k);
    return TA.map(i=>ag[i]==null?null:al[i]?100-100/(1+ag[i]/al[i]):100);};
   return {lines:[{k:'r1',name:'RSI'+P0(p.n1),a:R(P0(p.n1)),w:1.1},{k:'r2',name:'RSI'+P0(p.n2),a:R(P0(p.n2))}],lo:0,hi:100,band:[30,70],refs:[30,70]};}},
 sto:{g:'os',name:'ストキャスティクス',d:'期間の値幅のどこに終値があるか（%K）とその平均（%D）。70%以上で高値圏、30%以下で安値圏',
  p:[['k','%K',14,2,100],['d','%D',3,1,50]],it:[['K','%K',1,'--acc'],['D','%D',1,'--ma25']],
  f:p=>{const k=P0(p.k),d=P0(p.d),h=TA.hh(TA.H,k),l=TA.ll(TA.L,k),K=TA.map(i=>h[i]==null||h[i]===l[i]?null:(TA.Cl[i]-l[i])/(h[i]-l[i])*100),
   a=TA.sum(TA.map(i=>h[i]==null?null:TA.Cl[i]-l[i]),d),b=TA.sum(TA.map(i=>h[i]==null?null:h[i]-l[i]),d),D=TA.map(i=>i<k+d-2||!b[i]?null:a[i]/b[i]*100);
   return {lines:[{k:'K',name:'%K',a:K},{k:'D',name:'%D',a:D}],lo:0,hi:100,band:[30,70],refs:[30,70]};}},
 ssto:{g:'os',name:'スローストキャスティクス',d:'ストキャスティクスの%Dと、それをさらに平均した%SD。動きがなめらか',
  p:[['k','%K',14,2,100],['d','%D',3,1,50],['sd','%SD',3,1,50]],it:[['D','%D',1,'--acc'],['SD','%SD',1,'--ma25']],
  f:p=>{const k=P0(p.k),d=P0(p.d),h=TA.hh(TA.H,k),l=TA.ll(TA.L,k),a=TA.sum(TA.map(i=>h[i]==null?null:TA.Cl[i]-l[i]),d),b=TA.sum(TA.map(i=>h[i]==null?null:h[i]-l[i]),d),
   D=TA.map(i=>i<k+d-2||!b[i]?null:a[i]/b[i]*100);return {lines:[{k:'D',name:'%D',a:D},{k:'SD',name:'%SD',a:TA.sma(D,P0(p.sd))}],lo:0,hi:100,band:[30,70],refs:[30,70]};}},
 macd:{g:'os',name:'MACD',d:'短期と長期の指数移動平均の差（MACD）と、その平均（シグナル）。0ラインやシグナルとの交差で売買',
  p:[['f','短期',12,2,100],['s','長期',26,2,200],['g','シグナル',9,2,100]],it:[['m','MACD',1,'--acc'],['sg','シグナル',1,'--ma25'],['h','ヒストグラム',1,'--mut']],
  f:p=>{const a=TA.ema(TA.Cl,P0(p.f)),b=TA.ema(TA.Cl,P0(p.s)),m=TA.map(i=>a[i]==null||b[i]==null?null:a[i]-b[i]),sg=TA.ema(m,P0(p.g)),h=TA.map(i=>m[i]==null||sg[i]==null?null:m[i]-sg[i]);
   return {lines:[{k:'m',name:'MACD',a:m,w:1.1},{k:'sg',name:'シグナル',a:sg}],hist:{k:'h',a:h},refs:[0]};}},
 rci:{g:'os',name:'RCI',d:'日付と終値の順位の相関（−100〜+100%）。+80%以上で高値圏、−80%以下で安値圏',
  p:[['n1','1本目',9,3,100],['n2','2本目',26,3,100]],it:[['r1','',1,'--acc','n1'],['r2','',1,'--ma25','n2']],
  f:p=>{const R=k=>TA.map(i=>{if(i<k-1)return null;const w=TA.Cl.slice(i-k+1,i+1),ord=w.map((v,j)=>[v,j]).sort((x,y)=>y[0]-x[0]);const rk=new Array(k);
    for(let a=0;a<k;){let b=a;while(b+1<k&&ord[b+1][0]===ord[a][0])b++;const r=(a+b)/2+1;for(let c=a;c<=b;c++)rk[ord[c][1]]=r;a=b+1;}
    let d=0;for(let j=0;j<k;j++){const dr=k-j;d+=(dr-rk[j])**2;}return (1-6*d/(k*(k*k-1)))*100;});
   return {lines:[{k:'r1',name:'RCI'+P0(p.n1),a:R(P0(p.n1))},{k:'r2',name:'RCI'+P0(p.n2),a:R(P0(p.n2))}],lo:-100,hi:100,band:[-80,80],refs:[-80,0,80]};}},
 dmi:{g:'os',name:'DMI・ADX',d:'+DI（上昇の強さ）・−DI（下落の強さ）・ADX（トレンドの強さ）。ADX上昇中に+DIが−DIを上抜けで買い',
  p:[['n','期間',14,2,100]],it:[['pd','+DI',1,'--z4'],['md','−DI',1,'--z0'],['adx','ADX',1,'--fg2']],
  f:p=>{const n=P0(p.n),pdm=TA.map(i=>{if(!i)return null;const u=TA.H[i]-TA.H[i-1],d=TA.L[i-1]-TA.L[i];return u>d&&u>0?u:0;}),mdm=TA.map(i=>{if(!i)return null;const u=TA.H[i]-TA.H[i-1],d=TA.L[i-1]-TA.L[i];return d>u&&d>0?d:0;});
   const t=TA.rma(TA.map(i=>i?TA.tr[i]:null),n),a=TA.rma(pdm,n),b=TA.rma(mdm,n),pd=TA.map(i=>t[i]?a[i]/t[i]*100:null),md=TA.map(i=>t[i]?b[i]/t[i]*100:null),
   dx=TA.map(i=>pd[i]==null||pd[i]+md[i]===0?null:Math.abs(pd[i]-md[i])/(pd[i]+md[i])*100);return {lines:[{k:'pd',name:'+DI',a:pd},{k:'md',name:'−DI',a:md},{k:'adx',name:'ADX',a:TA.rma(dx,n),w:1.2}],lo:0};}},
 ab:{g:'os',name:'強弱レシオ（A・Bレシオ）',d:'Aレシオ＝始値からの上げ下げ、Bレシオ＝前日終値からの上げ下げの強さ。100が中立',
  p:[['n','期間',26,2,100]],it:[['a','Aレシオ',1,'--acc'],['b','Bレシオ',1,'--ma25']],
  f:p=>{const n=P0(p.n),hu=TA.sum(TA.map(i=>TA.H[i]-TA.O[i]),n),od=TA.sum(TA.map(i=>TA.O[i]-TA.L[i]),n),
   bu=TA.sum(TA.map(i=>i?Math.max(0,TA.H[i]-TA.Cl[i-1]):0),n),bd=TA.sum(TA.map(i=>i?Math.max(0,TA.Cl[i-1]-TA.L[i]):0),n);
   return {lines:[{k:'a',name:'A',a:TA.map(i=>od[i]?hu[i]/od[i]*100:null)},{k:'b',name:'B',a:TA.map(i=>i>=n&&bd[i]?bu[i]/bd[i]*100:null)}],refs:[100],unit:'%'};}},
 mom:{g:'os',name:'モメンタム',d:'今日の終値−指定期間前の終値。0ラインとの交差がトレンド転換の先行サイン',
  p:[['n','期間',10,1,200]],it:[['m','モメンタム',1,'--acc']],f:p=>{const n=P0(p.n);return {lines:[{k:'m',name:'MOM'+n,a:TA.map(i=>i<n?null:TA.Cl[i]-TA.Cl[i-n])}],refs:[0]};}},
 roc:{g:'os',name:'ROC',d:'今日の終値÷指定期間前の終値×100。100より上なら上昇の勢い',
  p:[['n','期間',25,1,200]],it:[['r','ROC',1,'--acc']],f:p=>{const n=P0(p.n);return {lines:[{k:'r',name:'ROC'+n,a:TA.map(i=>i<n?null:TA.Cl[i]/TA.Cl[i-n]*100)}],refs:[100]};}},
 psy:{g:'os',name:'サイコロジカルライン',d:'期間中に値上がりした日の割合。75%以上は過熱、25%以下は底入れの目安',
  p:[['n','期間',12,2,100]],it:[['p','サイコロジカル',1,'--acc']],
  f:p=>{const n=P0(p.n),u=TA.sum(TA.map(i=>i&&TA.Cl[i]>TA.Cl[i-1]?1:0),n);return {lines:[{k:'p',name:'PSY'+n,a:TA.map(i=>i<n?null:u[i]/n*100)}],lo:0,hi:100,band:[25,75],refs:[25,50,75]};}},
 atr:{g:'os',name:'ATR',d:'真の値幅（TR）の平均。値動きの大きさ（損切り幅の目安など）',
  p:[['n','期間',14,2,100]],it:[['a','ATR',1,'--acc']],f:p=>({lines:[{k:'a',name:'ATR'+P0(p.n),a:TA.rma(TA.tr,P0(p.n))}],lo0:1})},
 cci:{g:'os',name:'CCI',d:'平均価格からの離れ具合。+100%超で買われすぎ、−100%割れで売られすぎ',
  p:[['n','期間',20,2,100]],it:[['c','CCI',1,'--acc']],
  f:p=>{const n=P0(p.n),tp=TA.map(i=>(TA.H[i]+TA.L[i]+TA.Cl[i])/3),m=TA.sma(tp,n);
   return {lines:[{k:'c',name:'CCI'+n,a:TA.map(i=>{if(m[i]==null)return null;let d=0;for(let j=i-n+1;j<=i;j++)d+=Math.abs(tp[j]-m[i]);d/=n;return d?(tp[i]-m[i])/(.015*d):0;})}],band:[-100,100],refs:[-100,0,100]};}},
 wr:{g:'os',name:'ウィリアムズ%R',d:'期間の高値・安値のどこに終値があるか（0〜−100%）。0に近いほど買われすぎ',
  p:[['n','期間',14,2,100]],it:[['w','%R',1,'--acc']],
  f:p=>{const n=P0(p.n),h=TA.hh(TA.H,n),l=TA.ll(TA.L,n);return {lines:[{k:'w',name:'%R'+n,a:TA.map(i=>h[i]==null||h[i]===l[i]?null:(h[i]-TA.Cl[i])/(h[i]-l[i])*-100)}],lo:-100,hi:0,band:[-80,-20],refs:[-80,-20]};}},
 aroon:{g:'os',name:'アルーン（Aroon）',d:'最高値・最安値をつけてからの日数をもとにトレンドの始まりと強さを見る。アップが上ならトレンド上向き',
  p:[['n','期間',14,2,100]],it:[['u','アップ',1,'--z4'],['d','ダウン',1,'--z0']],
  f:p=>{const[U,D]=aroonUD(P0(p.n));return {lines:[{k:'u',name:'Up',a:U},{k:'d',name:'Down',a:D}],lo:0,hi:100,refs:[30,50,70]};}},
 aroono:{g:'os',name:'Aroon-Oscillator',d:'アルーンのアップ−ダウン（−100〜+100）。0より上なら上昇トレンド',
  p:[['n','期間',14,2,100]],it:[['o','オシレーター',1,'--acc']],
  f:p=>{const[U,D]=aroonUD(P0(p.n));return {lines:[{k:'o',name:'Osc',a:TA.map(i=>U[i]==null?null:U[i]-D[i])}],lo:-100,hi:100,refs:[-50,0,50]};}},
 dpo:{g:'os',name:'DPO',d:'終値−（期間×0.5＋1）日前の移動平均。短い周期の山・谷をとらえる',
  p:[['n','期間',20,2,200]],it:[['d','DPO',1,'--acc']],f:p=>{const n=P0(p.n),m=TA.sma(TA.Cl,n),sh=Math.floor(n/2)+1;return {lines:[{k:'d',name:'DPO'+n,a:TA.map(i=>i<sh||m[i-sh]==null?null:TA.Cl[i]-m[i-sh])}],refs:[0]};}},
 uos:{g:'os',name:'UOS（究極のオシレーター）',d:'短期・中期・長期の買い圧力を合成（0〜100%）。30%以下のダイバージェンスで買い、70%以上で売り',
  p:[['a','短期',7,2,50],['b','中期',14,2,100],['c','長期',28,2,200]],it:[['u','UOS',1,'--acc']],
  f:p=>{const bp=TA.map(i=>i?TA.Cl[i]-Math.min(TA.L[i],TA.Cl[i-1]):null),tr=TA.map(i=>i?Math.max(TA.H[i],TA.Cl[i-1])-Math.min(TA.L[i],TA.Cl[i-1]):null),
   av=k=>{const b=TA.sum(bp,k),t=TA.sum(tr,k);return TA.map(i=>i<k||!t[i]?null:b[i]/t[i]);},A=av(P0(p.a)),B=av(P0(p.b)),Cc=av(P0(p.c));
   return {lines:[{k:'u',name:'UOS',a:TA.map(i=>A[i]==null||B[i]==null||Cc[i]==null?null:100*(4*A[i]+2*B[i]+Cc[i])/7)}],lo:0,hi:100,band:[30,70],refs:[30,70]};}},
 volr:{g:'os',name:'ボラティリティレシオ',d:'今日の真の値幅÷直近N期間の値幅。0.5以上でブレイクアウトの可能性',
  p:[['n','期間',14,2,100]],it:[['v','VR',1,'--acc']],
  f:p=>{const n=P0(p.n);return {lines:[{k:'v',name:'VR'+n,a:TA.map(i=>{if(i<n)return null;let h=TA.Cl[i-n],l=TA.Cl[i-n];for(let j=i-n+1;j<=i;j++){h=Math.max(h,TA.H[j]);l=Math.min(l,TA.L[j]);}return h>l?TA.tr[i]/(h-l):null;})}],lo:0,refs:[.5],fm:'r2'};}},
 sd:{g:'os',name:'標準偏差',d:'終値のばらつき。トレンドが出ると大きくなりやすい。標準偏差（母集団）と標本標準偏差',
  p:[['n1','標準偏差',26,2,200],['n2','標本標準偏差',20,2,200]],it:[['p','',1,'--acc','n1'],['s','',0,'--ma25','n2']],
  f:p=>({lines:[{k:'p',name:'σ'+P0(p.n1),a:TA.sd(TA.Cl,P0(p.n1))},{k:'s',name:'s'+P0(p.n2),a:TA.sd(TA.Cl,P0(p.n2),1)}],lo0:1})},
 vr1:{g:'os',name:'ボリュームレシオ1',d:'値上がり日と値下がり日の出来高の比。450%以上で高値圏、70%以下で安値圏',
  p:[['n','期間',25,2,100]],it:[['v','VR1',1,'--acc']],
  f:p=>{const n=P0(p.n),[u,d,s]=vrs(n);return {lines:[{k:'v',name:'VR1',a:TA.map(i=>i<n||!(d[i]+s[i]/2)?null:(u[i]+s[i]/2)/(d[i]+s[i]/2)*100)}],lo:0,band:[70,450],refs:[70,100,450],unit:'%'};}},
 vr2:{g:'os',name:'ボリュームレシオ2',d:'値上がり日の出来高の割合（0〜100%）。80%以上で高値圏、20%以下で安値圏',
  p:[['n','期間',25,2,100]],it:[['v','VR2',1,'--acc']],
  f:p=>{const n=P0(p.n),[u,d,s]=vrs(n);return {lines:[{k:'v',name:'VR2',a:TA.map(i=>i<n||!(u[i]+d[i]+s[i])?null:(u[i]+s[i]/2)/(u[i]+d[i]+s[i])*100)}],lo:0,hi:100,band:[20,80],refs:[20,50,80]};}},
 bbpb:{g:'os',name:'ボリンジャー %b',d:'バンドのどこに終値があるか。100%で上限、0%で下限（±σの幅を選べる）',
  p:[['n','期間',25,2,200]],it:[['s1','1σ',0,IPAL[4]],['s2','2σ',1,'--acc'],['s3','3σ',0,IPAL[3]]],
  f:p=>{const n=P0(p.n),m=TA.sma(TA.Cl,n),s=TA.sd(TA.Cl,n);return {lines:[1,2,3].map(k=>({k:'s'+k,name:'%b('+k+'σ)',a:TA.map(i=>m[i]==null||!s[i]?null:(TA.Cl[i]-(m[i]-k*s[i]))/(2*k*s[i])*100)})),band:[0,100],refs:[0,50,100],unit:'%'};}},
 bbw:{g:'os',name:'ボリンジャー バンド幅',d:'バンドの幅÷移動平均。細くなった後（スクイーズ）は大きく動きやすい',
  p:[['n','期間',25,2,200]],it:[['s1','1σ',0,IPAL[4]],['s2','2σ',1,'--acc'],['s3','3σ',0,IPAL[3]]],
  f:p=>{const n=P0(p.n),m=TA.sma(TA.Cl,n),s=TA.sd(TA.Cl,n);return {lines:[1,2,3].map(k=>({k:'s'+k,name:'幅('+k+'σ)',a:TA.map(i=>m[i]==null?null:2*k*s[i]/m[i]*100)})),lo0:1,unit:'%'};}},
 rate:{g:'os',name:'騰落率',d:'表示している期間の左端の終値からの上昇・下落率',view:1,
  p:[],it:[['r','騰落率',1,'--acc']],f:(p,v)=>{const b=TA.Cl[v.a];return {lines:[{k:'r',name:'騰落率',a:TA.map(i=>i<v.a?null:(TA.Cl[i]/b-1)*100)}],refs:[0],unit:'%'};}},
};
function aroonUD(n){const U=TA.nul(),D=TA.nul();for(let i=n;i<TA.n;i++){let ih=i,il=i;for(let j=i-n;j<=i;j++){if(TA.H[j]>=TA.H[ih])ih=j;if(TA.L[j]<=TA.L[il])il=j;}U[i]=(n-(i-ih))/n*100;D[i]=(n-(i-il))/n*100;}return [U,D];}
function vrs(n){return [TA.sum(TA.map(i=>i&&TA.Cl[i]>TA.Cl[i-1]?TA.V[i]:0),n),TA.sum(TA.map(i=>i&&TA.Cl[i]<TA.Cl[i-1]?TA.V[i]:0),n),TA.sum(TA.map(i=>i&&TA.Cl[i]===TA.Cl[i-1]?TA.V[i]:0),n)];}
const IKEYS={tr:Object.keys(IND).filter(k=>IND[k].g==='tr'),os:Object.keys(IND).filter(k=>IND[k].g==='os')};
const IDEF={on:{ichi:1,vol:1,rsi:1,macd:1},os:['vol','rsi','macd'],tab:'tr',it:{},p:{}};
const IKEY='one-ind-v1';
let S=(()=>{let s=null;try{s=JSON.parse(localStorage.getItem(IKEY)||'null');}catch(e){}if(!s||typeof s!=='object')s=JSON.parse(JSON.stringify(IDEF));
  ['on','it','p'].forEach(k=>{if(!s[k]||typeof s[k]!=='object')s[k]={};});if(!Array.isArray(s.os))s.os=[];if(!s.tab)s.tab='tr';
  s.os=s.os.filter(k=>IND[k]&&IND[k].g==='os');Object.keys(s.on).forEach(k=>{if(s.on[k]&&IND[k]&&IND[k].g==='os'&&!s.os.includes(k))s.os.push(k);});return s;})();
const isave=()=>{try{localStorage.setItem(IKEY,JSON.stringify(S));}catch(e){}};
const ipar=(k)=>{const o={};IND[k].p.forEach(([pk,,d])=>{const v=S.p[k]&&S.p[k][pk];o[pk]=typeof v==='number'&&isFinite(v)?v:d;});return o;};
const iitem=(k,ik)=>{const v=S.it[k]&&S.it[k][ik];if(typeof v==='boolean')return v;const it=IND[k].it.find(x=>x[0]===ik);return !!(it&&it[2]);};
const icol=(k,ik,col)=>{const c=col||(IND[k].it.find(x=>x[0]===ik)||[])[3]||'--acc';return c.startsWith('--')?css(c):c;};
const ICACHE={};
function indCalc(k,v){const p=ipar(k),key=k+JSON.stringify(p)+(IND[k].view?'@'+v.a:'');if(!ICACHE[key])ICACHE[key]=IND[k].f(p,v);return ICACHE[key];}
const ilabel=(k)=>{const D=IND[k],p=ipar(k);const ps=D.p.filter(x=>!D.it.some(t=>t[4]===x[0])).map(x=>+p[x[0]].toFixed(3));return D.name+(ps.length?'('+ps.join(',')+')':'');};

/* ---------- 指標の選択パネル ---------- */
function buildIndUI(){
  const det=$('ch-det');if(!det)return;
  ['cb-ichi','cb-ma','cb-200','cb-bb','cb-osc'].forEach(id=>{const e=$(id);if(e&&e.closest('label'))e.closest('label').hidden=true;});   // 旧ページの固定チェックボックスは隠す
  let box=$('indsel');if(!box){box=document.createElement('div');box.id='indsel';det.insertBefore(box,det.firstChild);}
  const cnt=g=>IKEYS[g].filter(k=>S.on[k]).length;
  const tabs=[['tr','トレンド系','チャートに重ねる'],['os','オシレーター系','チャートの下に表示']];
  const row=k=>{const D=IND[k],p=ipar(k),own=new Set(D.it.map(t=>t[4]).filter(Boolean));
    const items=D.it.map(([ik,lab,,col,pk])=>{const c=(col||'--acc').startsWith('--')?'var('+col+')':col,chk=iitem(k,ik)?'checked':'';
      const per=pk?`<input type="number" class="ip" data-k="${k}" data-p="${pk}" value="${p[pk]}" min="${D.p.find(x=>x[0]===pk)[3]}" max="${D.p.find(x=>x[0]===pk)[4]}" step="1" aria-label="${esc(D.p.find(x=>x[0]===pk)[1])}の期間">日`:'';
      return `<label class="ii"><input type="checkbox" data-k="${k}" data-i="${ik}" ${chk}><i style="background:${c}"></i>${lab?esc(lab):''}${per}</label>`;}).join('');
    const pars=D.p.filter(x=>!own.has(x[0])).map(([pk,lab,,mn,mx,stp])=>`<label class="ipl">${esc(lab)}<input type="number" class="ip" data-k="${k}" data-p="${pk}" value="${p[pk]}" min="${mn}" max="${mx}" step="${stp||1}"></label>`).join('');
    const extra=k==='sd'?'<small class="ih">左：標準偏差／右：標本標準偏差</small>':'';
    return `<div class="irow" data-k="${k}"><div class="in"><b>${esc(D.name)}</b><button class="ix" data-off="${k}" title="表示をやめる" aria-label="${esc(D.name)}をやめる">×</button></div>
      <div class="iis">${items}${pars?`<span class="ips">${pars}</span>`:''}${extra}</div><div class="id">${esc(D.d)}</div></div>`;};
  const g=S.tab;
  const list=IKEYS[g].map(k=>`<button class="ic${S.on[k]?' on':''}" data-k="${k}" aria-pressed="${!!S.on[k]}" title="${esc(IND[k].d)}">${esc(IND[k].name)}</button>`).join('');
  const act=(g==='os'?S.os.filter(k=>S.on[k]):IKEYS.tr.filter(k=>S.on[k])).map(row).join('');
  box.innerHTML=`<div class="itabs" role="tablist">${tabs.map(([t,a,b])=>`<button role="tab" class="it${g===t?' on':''}" data-t="${t}" aria-selected="${g===t}">${a}<small>${b}</small><span class="cn">${cnt(t)||''}</span></button>`).join('')}
    <button class="tbtn ireset" title="選んだ指標を初期設定（一目均衡表・出来高・RSI・MACD）に戻す">初期設定に戻す</button></div>
    <div class="ichips">${list}</div>${act?`<div class="irows">${act}</div>`:`<div class="iempty">${g==='tr'?'上から選ぶとチャートに重ねて表示します':'上から選ぶとチャートの下に並べて表示します（選んだ順に上から）'}</div>`}`;
  box.querySelectorAll('.it').forEach(b=>b.onclick=()=>{S.tab=b.dataset.t;isave();buildIndUI();});
  box.querySelectorAll('.ic').forEach(b=>b.onclick=()=>{const k=b.dataset.k;indToggle(k,!S.on[k]);});
  box.querySelectorAll('.ix').forEach(b=>b.onclick=()=>indToggle(b.dataset.off,false));
  box.querySelector('.ireset').onclick=()=>{S=JSON.parse(JSON.stringify(Object.assign({},IDEF,{tab:S.tab})));isave();buildIndUI();draw();};
  box.querySelectorAll('input[type=checkbox][data-i]').forEach(c=>c.onchange=()=>{const k=c.dataset.k;(S.it[k]=S.it[k]||{})[c.dataset.i]=c.checked;isave();draw();});
  box.querySelectorAll('input.ip').forEach(c=>c.onchange=()=>{const k=c.dataset.k,pk=c.dataset.p,d=IND[k].p.find(x=>x[0]===pk);let v=parseFloat(c.value);
    if(!isFinite(v))v=d[2];v=Math.min(d[4],Math.max(d[3],v));if(!d[5]||d[5]>=1)v=Math.round(v);c.value=v;(S.p[k]=S.p[k]||{})[pk]=v;isave();draw();});
}
function indToggle(k,on){S.on[k]=on;if(IND[k].g==='os'){S.os=S.os.filter(x=>x!==k);if(on)S.os.push(k);}isave();buildIndUI();draw();}

let N=126,DET=false;
/* ---------- 売買サインの設定 ---------- */
const SGBUY='#E03131',SGSELL='#1971C2';   // ローソク足の赤・緑と見分けやすい色（チャート一覧の個別チャートと同じ）
const SGKEY='kabuChartInd',SGKD='oneSigKinds';
const SGLIST=[['ma5','移動平均クロス(5×25)'],['ma','移動平均クロス(25×75)',1],['macd','MACDクロス'],['rsi','RSI 30／70',1],['rci','RCI ±80'],
  ['bb','ボリンジャー±2σ',1],['stoch','ストキャスティクス'],['psar','パラボリック転換'],['ichi','一目 転換線×基準線'],['dmi','DMIクロス']];
const SGDEF=SGLIST.filter(x=>x[2]).map(x=>x[0]);
let SGST='label',SGVL=false,SGKIND=new Set(SGDEF);
try{const o=JSON.parse(localStorage.getItem(SGKEY)||'null');if(o&&typeof o==='object'){if(o.st==='tri'||o.st==='label')SGST=o.st;SGVL=!!o.vl;}}catch(e){}
try{const k=JSON.parse(localStorage.getItem(SGKD)||'null');if(Array.isArray(k))SGKIND=new Set(k);}catch(e){}
function sgSave(){try{let o=null;try{o=JSON.parse(localStorage.getItem(SGKEY)||'null');}catch(e){}
  if(!o||typeof o!=='object')o={};o.st=SGST;o.vl=SGVL;localStorage.setItem(SGKEY,JSON.stringify(o));localStorage.setItem(SGKD,JSON.stringify([...SGKIND]));}catch(e){}}
function sgUI(){const b=$('sgopt');if(!b)return;
  const ks=$('sgkinds');if(ks&&!ks.childElementCount)ks.innerHTML=SGLIST.map(([k,n])=>`<label><input type="checkbox" data-sk="${k}">${n}</label>`).join('');
  b.querySelectorAll('[data-sk]').forEach(x=>x.checked=SGKIND.has(x.dataset.sk));
  document.querySelectorAll('#sgstyle button').forEach(x=>x.classList.toggle('on',x.dataset.st===SGST));$('sgvl').checked=SGVL;
  const op=($('cb-mk')&&!$('cb-mk').checked)?.45:1;b.style.opacity=op;if($('sgopt2'))$('sgopt2').style.opacity=op;}

function draw(){
  const box=$('chart');box.innerHTML='';
  const W=box.clientWidth,narrow=W<560,G=css('--grid'),MU=css('--mut'),UP=css('--candleU'),DN=css('--candleD');
  const cb=(id,d)=>{const e=$(id);return e?e.checked:d;};
  const show={mk:cb('cb-mk',true),lv:cb('cb-lv',true),vp:cb('cb-vp',true)};
  const len=C.c.length,st=Math.max(0,len-N),idx=[];for(let i=st;i<len;i++)idx.push(i);
  const view={a:st+PST};
  /* 選ばれている指標（細目のチェックが1つもないものは描かない） */
  const vis=(k,o)=>o&&iitem(k,o.k);
  const TRS=IKEYS.tr.filter(k=>S.on[k]).map(k=>({k,r:indCalc(k,view)}));
  const OSS=S.os.filter(k=>S.on[k]&&IND[k]).map(k=>({k,r:indCalc(k,view)})).filter(o=>IND[o.k].it.some(t=>iitem(o.k,t[0])));
  const HA=TRS.find(o=>o.k==='ha'&&vis('ha',o.r.candles));
  const CO=HA?HA.r.candles:null;   // 平均足：生データの添字で引く
  const cO=i=>CO?CO.o[i+PST]:C.o[i],cH=i=>CO?CO.h[i+PST]:C.h[i],cL=i=>CO?CO.l[i+PST]:C.l[i],cC=i=>CO?CO.c[i+PST]:C.c[i];
  let fut=0;TRS.forEach(o=>{(o.r.lines||[]).concat(o.r.fills||[]).forEach(l=>{if(vis(o.k,l)&&l.shift>0)fut=Math.max(fut,l.shift);});});
  /* 高さ：価格・オシレーターの枚数で配分 */
  const nO=OSS.length,wide=innerWidth>1100,three=innerWidth>=1280,jkH=three?$('jkcard').offsetHeight+10:0;
  const gap=6,PR=narrow?44:50,PL=2,AX=18;
  let pH,oH;
  if(wide){const minP=three?240:330,oh0=three?72:88;
    const avail=Math.max(minP+nO*(oh0+gap)+AX,innerHeight-(box.getBoundingClientRect().top+scrollY)-(three?23:50)-jkH);
    oH=nO?Math.max(oh0,Math.min(120,Math.round((avail-AX)*.15))):0;pH=avail-AX-nO*(oH+gap);
    if(pH<minP){oH=Math.max(56,Math.floor((avail-AX-minP)/Math.max(1,nO))-gap);pH=avail-AX-nO*(oH+gap);}}
  else{pH=narrow?(nO>2?240:280):(nO>2?320:380);oH=narrow?64:76;}
  const H=pH+nO*(oH+gap)+AX;
  const s=el('svg',{viewBox:`0 0 ${W} ${H}`,height:H},box);
  const cw=(W-PL-PR)/(idx.length+fut),X=i=>PL+(i-st+.5)*cw,ext=[];for(let i=st;i<len+fut;i++)ext.push(i);
  let top=0;
  function pane(h,lo,hi,label,fm){const y0=top,sc=v=>y0+3+(h-6)*(1-(v-lo)/(hi-lo));
    el('rect',{x:PL,y:y0,width:W-PL-PR,height:h,fill:'none',stroke:G},s);
    niceTicks(lo,hi,h>200?6:h>90?3:2).forEach(v=>{el('line',{x1:PL,x2:W-PR,y1:sc(v),y2:sc(v),stroke:G,'stroke-width':.8},s);
      const t=el('text',{x:W-PR+4,y:sc(v)+3,'font-size':9.5,fill:MU},s);t.textContent=fm?fm(v):f0(v);});
    top+=h+gap;return sc;}
  /* 生データの配列 a を、ずらし shift（＋は先へ）で C の添字 i に対応させて読む */
  const rv=(a,sh)=>i=>{const j=i+PST-(sh||0);return j>=0&&j<PN?a[j]:null;};
  function line(get,rng,sc,col,w,dash){let d='',pen=false;rng.forEach(i=>{const v=get(i);if(v==null){pen=false;return;}d+=(pen?'L':'M')+X(i).toFixed(1)+','+sc(v).toFixed(1);pen=true;});
    if(d)el('path',{d,fill:'none',stroke:col,'stroke-width':w||1,'stroke-dasharray':dash||'','stroke-linejoin':'round'},s);}
  /* 価格の表示範囲 */
  let lo=Infinity,hi=-Infinity;const inc=v=>{if(v!=null&&isFinite(v)){lo=Math.min(lo,v);hi=Math.max(hi,v);}};
  idx.forEach(i=>{inc(cL(i));inc(cH(i));});
  const plo=lo,phi=hi,span=(phi-plo)||phi*.1||1,inR=v=>v>=plo-span*.6&&v<=phi+span*.6;   // 遠すぎる線で値動きがつぶれないよう、範囲は値幅の±60%まで
  TRS.forEach(({k,r})=>{(r.lines||[]).forEach(l=>{if(!vis(k,l))return;const g=rv(l.a,l.shift);(l.shift>0?ext:idx).forEach(i=>{const v=g(i);if(v!=null&&inR(v))inc(v);});});
    (r.dots||[]).forEach(l=>{if(!vis(k,l))return;idx.forEach(i=>{const v=l.a[i+PST];if(v!=null&&inR(v))inc(v);});});
    (r.hl||[]).forEach(l=>{if(vis(k,l)&&inR(l.v))inc(l.v);});});
  /* 売買サイン：表示中の足ごとに {b:[名前],s:[名前]} */
  const SG={};let sgN=[0,0],sgLast=-1;
  if(show.mk)C.marks.forEach(([i,sd,kd,nm])=>{if(i<st||!SGKIND.has(kd))return;const e=SG[i]||(SG[i]={b:[],s:[]});(sd>0?e.b:e.s).push(nm);sgN[sd>0?0:1]++;sgLast=Math.max(sgLast,i);});
  const hasSG=sgLast>=0;
  let pad=(hi-lo)*.04;if(hasSG)pad+=(hi-lo)*(SGST==='label'?30:22)/Math.max(120,pH);lo-=pad;hi+=pad;
  const py=pane(pH,lo,hi,'',null);
  const clip='cp'+Math.random().toString(36).slice(2,7),defs=el('defs',{},s),cpth=el('clipPath',{id:clip},defs);el('rect',{x:PL,y:0,width:W-PL-PR,height:pH},cpth);
  const g0=el('g',{'clip-path':`url(#${clip})`},s);
  const lineP=(get,rng,col,w,dash)=>{let d='',pen=false;rng.forEach(i=>{const v=get(i);if(v==null){pen=false;return;}d+=(pen?'L':'M')+X(i).toFixed(1)+','+py(v).toFixed(1);pen=true;});
    if(d)el('path',{d,fill:'none',stroke:col,'stroke-width':w||1,'stroke-dasharray':dash||'','stroke-linejoin':'round'},g0);};
  if(fut){el('line',{x1:X(len)-cw/2,x2:X(len)-cw/2,y1:0,y2:pH,stroke:css('--axis'),'stroke-dasharray':'2 3'},s);
    if(!narrow){const t=el('text',{x:X(len)+2,y:pH-4,'font-size':9,fill:MU},s);t.textContent='→'+fut+'日先';}}
  /* 塗り（雲・バンド） */
  TRS.forEach(({k,r})=>{let fl=(r.fills||[]).filter(f=>vis(k,f));if(r.fillOne&&fl.length)fl=[fl[fl.length-1]];
    fl.forEach(f=>{const A=rv(f.a,f.shift),B=rv(f.b,f.shift),rng=f.shift>0?ext:idx;
      if(f.cu){for(let q=0;q<rng.length-1;q++){const i=rng[q],j=i+1,a0=A(i),b0=B(i),a1=A(j),b1=B(j);if([a0,b0,a1,b1].some(v=>v==null))continue;
        el('path',{d:`M${X(i)},${py(a0)}L${X(j)},${py(a1)}L${X(j)},${py(b1)}L${X(i)},${py(b0)}Z`,fill:a0>=b0?css(f.cu):css(f.cd),opacity:f.op,stroke:'none'},g0);}}
      else{let a='',b='';rng.forEach(i=>{const v=A(i);if(v!=null)a+=(a?'L':'M')+X(i)+','+py(v);});for(let q=rng.length-1;q>=0;q--){const v=B(rng[q]);if(v!=null)b+='L'+X(rng[q])+','+py(v);}
        if(a&&b)el('path',{d:a+b+'Z',fill:css(f.c),opacity:f.op,stroke:'none'},g0);}});});
  VP=show.vp&&idx.length>=3?volProfile(idx,Math.min(...idx.map(i=>C.l[i])),Math.max(...idx.map(i=>C.h[i])),40):null;
  if(VP){const x1=W-PR,mw=(W-PL-PR)*(narrow?.26:.22);
    for(let k=0;k<VP.nb;k++){const v=VP.vol[k];if(v<=0)continue;const yt=py(VP.lo+(k+1)*VP.w),yb=py(VP.lo+k*VP.w),len=v/VP.max*mw;
      el('rect',{x:x1-len,y:yt+.5,width:len,height:Math.max(1,yb-yt-1),fill:k===VP.poc?VPCOL.poc:(k>=VP.vaLo&&k<=VP.vaHi?VPCOL.va:VPCOL.out)},g0);}
    const yp=py(VP.pocP);el('line',{x1:PL,x2:W-PR,y1:yp,y2:yp,stroke:VPCOL.line,'stroke-width':1,'stroke-dasharray':'6 3',opacity:.85},s);
    const tx='POC '+f0(VP.pocP),tw=tx.length*5.9+8;
    el('rect',{x:W-PR-tw-3,y:yp-14,width:tw,height:12,rx:3,fill:css('--card'),opacity:.9},s);
    const t=el('text',{x:W-PR-tw+1,y:yp-5,'font-size':9.5,fill:VPCOL.line,'font-weight':700},s);t.textContent=tx;}
  $('lg-vp').innerHTML=VP?'<span><i style="background:'+VPCOL.line+'"></i>'+(narrow?'':'価格帯別出来高 ')+'POC '+f0(VP.pocP)+'</span><span><i class="sq" style="background:rgba(100,116,139,.6)"></i>'+(narrow?'70%帯 ':'出来高70%の帯 ')+f0(VP.valP)+'〜'+f0(VP.vahP)+'</span>':'';
  /* ローソク足（平均足を選んだときは置き換え） */
  const bw=Math.max(1,cw*.55);
  idx.forEach(i=>{const o=cO(i),c=cC(i),u=c>=o,col=u?UP:DN,x=X(i);
    el('line',{x1:x,x2:x,y1:py(cH(i)),y2:py(cL(i)),stroke:col,'stroke-width':.8},g0);
    const y1=py(Math.max(o,c)),y2=py(Math.min(o,c));
    el('rect',{x:x-bw/2,y:y1,width:bw,height:Math.max(.8,y2-y1),fill:col},g0);});
  /* トレンド系の線・点・横線 */
  const LG=[],TIP=[],HLL=[];
  TRS.forEach(({k,r})=>{
    (r.lines||[]).forEach(l=>{if(!vis(k,l))return;const col=icol(k,l.k,l.col),get=rv(l.a,l.shift);lineP(get,l.shift>0?ext:idx,col,l.w||1.1,l.dash);
      if(!l.nolg)LG.push([col,l.lgname||l.name,l.dash]);if(l.name&&(!l.nolg||l.tip))TIP.push([l.name,get,col]);});
    (r.dots||[]).forEach(l=>{if(!vis(k,l))return;const col=icol(k,l.k);idx.forEach(i=>{const v=l.a[i+PST];if(v==null)return;el('circle',{cx:X(i),cy:py(v),r:Math.max(1.1,Math.min(2.2,cw*.28)),fill:col},g0);});
      LG.push([col,l.name,'dot']);TIP.push([l.name,i=>l.a[i+PST],col]);});
    (r.pts||[]).forEach(m=>{if(!iitem(k,m.k))return;const i=m.i-PST;if(i<st||i>=len)return;const col=icol(k,m.k),x=X(i),y=py(m.v)+(m.up?-4:4);
      el('path',{d:m.up?`M${x},${y} l-3.5,-5 h7Z`:`M${x},${y} l-3.5,5 h7Z`,fill:col},g0);
      const t=el('text',{x,y:m.up?y-7:y+14,'font-size':9,'text-anchor':'middle',fill:col,'font-weight':600},g0);t.textContent=f0(m.v);});
    if(r.pts&&IND[k].it.some(t=>iitem(k,t[0])))LG.push([icol(k,'pk'),'ピーク／ボトム','tri']);
    if(r.hl){const hs=r.hl.filter(l=>vis(k,l)&&l.v>lo&&l.v<hi),x0=r.short?X(Math.max(st,len-Math.max(8,Math.round(idx.length*.25)))):PL;
      hs.forEach(l=>{const col=icol(k,l.k),y=py(l.v);el('line',{x1:x0,x2:W-PR,y1:y,y2:y,stroke:col,'stroke-width':.9,'stroke-dasharray':l.name==='50%'||l.name==='P'?'':'5 3',opacity:.9},s);
        HLL.push([y,l.name+' '+f0(l.v),col,r.short?1:0]);});
      if(hs.length)LG.push([icol(k,hs[0].k),IND[k].name.replace(/（.*）/,'')+(r.note?'（'+r.note+'）':''),'5 3']);}
  });
  [0,1].forEach(sh=>{const labs=HLL.filter(x=>x[3]===sh).sort((a,b)=>a[0]-b[0]);for(let q=1;q<labs.length;q++)if(labs[q][0]-labs[q-1][0]<11)labs[q][0]=labs[q-1][0]+11;
    const xr=W-PR-(VP?(W-PL-PR)*(narrow?.26:.22)+4:4)-(sh?0:(HLL.some(x=>x[3])?62:0));
    labs.forEach(([y,t,c])=>{const w=t.length*5.6+6;el('rect',{x:xr-w,y:y-6,width:w,height:11,rx:2,fill:css('--card'),opacity:.85},s);const e=el('text',{x:xr-3,y:y+3,'font-size':9,fill:c,'text-anchor':'end'},s);e.textContent=t;});});
  if(show.lv&&R&&R.lv){const lv=R.lv,Z4=css('--z4'),Z0=css('--z0');
    const L=lv.mode==='wait'?[[lv.trig,'転換',MU,'5 3'],[lv.t1,'戻り売り',Z0,'5 3'],[lv.trail,'手じまい',Z0,'']]:[[lv.t2,'利確2',Z4,'5 3'],[lv.t1,'利確1',Z4,'5 3'],[lv.stop,'損切り',Z0,''],[lv.trail,'手じまい',Z0,'2 3']];
    if(lv.in){const a=py(Math.min(hi,lv.in[1])),b=py(Math.max(lo,lv.in[0]));if(b>a)el('rect',{x:PL,y:a,width:W-PL-PR,height:Math.max(2,b-a),fill:css('--z3'),opacity:.3},s);}
    const labs=[];L.forEach(([v,n,c,d])=>{if(v==null||v<lo||v>hi)return;el('line',{x1:PL,x2:W-PR,y1:py(v),y2:py(v),stroke:c,'stroke-dasharray':d,'stroke-width':1},s);labs.push([py(v),n+' '+f0(v),c]);});
    labs.sort((a,b)=>a[0]-b[0]);for(let k=1;k<labs.length;k++)if(labs[k][0]-labs[k-1][0]<12)labs[k][0]=labs[k-1][0]+12;
    labs.forEach(([y,t,c])=>{const w=t.length*5.9+8;el('rect',{x:PL+4,y:y-6.5,width:w,height:12,rx:3,fill:css('--card'),opacity:.92,stroke:c,'stroke-width':.6},s);
      const e=el('text',{x:PL+8,y:y+3,'font-size':9.5,fill:c},s);e.textContent=t;});}
  const lc=C.c[len-1],ly=py(lc);el('rect',{x:W-PR+1,y:ly-7.5,width:PR-2,height:15,rx:3,fill:lc>=C.c[len-2]?UP:DN},s);
  const lt=el('text',{x:W-PR+4,y:ly+3.5,'font-size':10,fill:'#fff','font-weight':700},s);lt.textContent=f0(lc);
  if(hasSG){ /* 買いは安値の下、売りは高値の上。ローソク足と見分けやすい色・形で描く */
    const BG=css('--card'),halo={stroke:BG,'stroke-width':2,'paint-order':'stroke'},g0=el('g',{'clip-path':`url(#${clip})`},s);   // IN・利確・損切りの線より手前に描く
    if(SGVL)Object.keys(SG).forEach(k=>{const i=+k,x=X(i);el('line',{x1:x,x2:x,y1:0,y2:pH,stroke:SG[k].b.length?SGBUY:SGSELL,'stroke-width':1.2,'stroke-dasharray':'4 3',opacity:.45},g0);});
    if(SGST==='tri'){const sz=Math.max(9,Math.min(15,cw*.9)),hw=sz*.6,gp=4;
      const tri=(x,y0,up,col)=>el('path',Object.assign({d:up?`M${x},${y0} l${hw},${sz} h${-2*hw}Z`:`M${x},${y0} l${hw},${-sz} h${-2*hw}Z`,fill:col},halo),g0);
      Object.keys(SG).forEach(k=>{const i=+k,e=SG[k];e.b.forEach((_,j)=>tri(X(i),py(C.l[i])+gp+j*(sz+3),true,SGBUY));e.s.forEach((_,j)=>tri(X(i),py(C.h[i])-gp-j*(sz+3),false,SGSELL));});}
    else{const h=narrow?15:16,tp=5,gp=3,fs=narrow?10.5:11,many=cw<16;
      const badge=(x,yt,up,col,txt)=>{const w=Math.max(h,txt.length>1?h+7:h),yb=up?yt+tp:yt-tp-h,xc=Math.min(W-PR-w/2-1,Math.max(PL+w/2+1,x));
        el('path',Object.assign({d:up?`M${x},${yt} l${tp},${tp+.5} h${-2*tp}Z`:`M${x},${yt} l${tp},${-tp-.5} h${-2*tp}Z`,fill:col},halo),g0);
        el('rect',Object.assign({x:xc-w/2,y:yb,width:w,height:h,rx:4,fill:col},halo),g0);
        const t=el('text',{x:xc,y:yb+h/2+fs*.36,'font-size':fs,'font-weight':700,'text-anchor':'middle',fill:'#fff'},g0);t.textContent=txt;};
      Object.keys(SG).forEach(k=>{const i=+k,e=SG[k];
        if(e.b.length)badge(X(i),Math.min(pH-tp-h-1,py(C.l[i])+gp),true,SGBUY,'買'+(e.b.length>1&&!many?e.b.length:''));
        if(e.s.length)badge(X(i),Math.max(tp+h+1,py(C.h[i])-gp),false,SGSELL,'売'+(e.s.length>1&&!many?e.s.length:''));});}}
  /* 凡例（チャート上部） */
  const lgb=$('lg-ind')||$('lg-ichi');
  if(lgb){lgb.style.visibility='visible';const seen=new Set();
    lgb.innerHTML=LG.filter(([c,n])=>{const q=c+n;if(seen.has(q))return false;seen.add(q);return true;}).map(([c,n,d])=>`<span><i style="background:${c}${d==='dot'?';width:6px;height:6px;border-radius:50%':d==='tri'?';width:7px;height:7px;clip-path:polygon(50% 0,100% 100%,0 100%)':''}"></i>${esc(n)}</span>`).join('')+(HA?'<span>平均足</span>':'')+
      (hasSG?`<span><span class="sgb" style="background:${SGBUY}">買</span>${sgN[0]} <span class="sgb" style="background:${SGSELL}">売</span>${sgN[1]}`+
        (narrow?'':`　直近 ${C.d[sgLast].slice(5).replace('-','/')} `+SG[sgLast].b.map(n=>`<b style="color:${SGBUY}">▲</b>${esc(n)}`).concat(SG[sgLast].s.map(n=>`<b style="color:${SGSELL}">▼</b>${esc(n)}`)).join(' '))+'</span>':'');}
  /* オシレーター系（選んだ順に下へ） */
  const VF=v=>{const a=Math.abs(v);return a>=1e8?f1(v/1e8,a>=1e9?0:1)+'億':a>=1e4?f0(v/1e4)+'万':f0(v);};
  const OT=[];
  OSS.forEach(({k,r})=>{const D=IND[k],L=(r.lines||[]).filter(l=>vis(k,l)),hs=r.hist&&vis(k,r.hist)?r.hist:null,vb=r.vbars&&vis(k,r.vbars)?r.vbars:null;
    let a=Infinity,b=-Infinity;const sx=v=>{if(v!=null&&isFinite(v)){a=Math.min(a,v);b=Math.max(b,v);}};
    idx.forEach(i=>{L.forEach(l=>sx(l.a[i+PST]));if(hs)sx(hs.a[i+PST]);if(vb)sx(vb.a[i+PST]);});
    if(r.lo0||vb)a=Math.min(a,0);if(r.lo!=null)a=Math.min(a,r.lo);if(r.hi!=null)b=Math.max(b,r.hi);
    if(r.lo!=null&&r.hi!=null){a=r.lo;b=r.hi;}
    (r.refs||[]).forEach(v=>{if(r.lo==null||r.hi==null){if(v>=a-(b-a)*.5&&v<=b+(b-a)*.5){a=Math.min(a,v);b=Math.max(b,v);}}});
    if(!isFinite(a)||!isFinite(b)){a=0;b=1;}if(a===b){a-=1;b+=1;}
    const fixed=r.lo!=null&&r.hi!=null,pd=fixed?0:(b-a)*.08;const lo2=(r.lo0||vb)&&a>=0?0:a-pd,hi2=b+pd;
    const fm=r.fm==='vol'?VF:r.fm==='r2'?(v=>f1(v,2)):(v=>Math.abs(hi2-lo2)<5?f1(v,Math.abs(hi2-lo2)<.5?2:1):f0(v));
    const y=pane(oH,lo2,hi2,'',fm);
    if(r.band){const[u,v]=r.band,ya=y(Math.min(hi2,Math.max(u,v))),yb=y(Math.max(lo2,Math.min(u,v)));if(yb>ya)el('rect',{x:PL,y:ya,width:W-PL-PR,height:yb-ya,fill:css('--band')},s);}
    (r.refs||[]).forEach(v=>{if(v>lo2&&v<hi2)el('line',{x1:PL,x2:W-PR,y1:y(v),y2:y(v),stroke:MU,'stroke-dasharray':'3 3','stroke-width':.7},s);});
    if(vb)idx.forEach(i=>{const v=vb.a[i+PST];if(!v)return;el('rect',{x:X(i)-bw/2,y:y(v),width:bw,height:Math.max(0,y(0)-y(v)),fill:cC(i)>=cO(i)?UP:DN,opacity:.45},s);});
    if(hs)idx.forEach(i=>{const v=hs.a[i+PST];if(v==null)return;el('rect',{x:X(i)-bw/2,y:Math.min(y(v),y(0)),width:bw,height:Math.abs(y(v)-y(0)),fill:v>=0?UP:DN,opacity:.45},s);});
    L.forEach(l=>line(i=>l.a[i+PST],idx,y,icol(k,l.k,l.col),l.w||1.1,l.dash));
    /* 欄の左上に名前と最新値 */
    const y0=y(hi2)-3,lab=el('text',{x:PL+5,y:y0+12,'font-size':9.5,fill:MU,'font-weight':600},s);
    const tsp=(t,c,w)=>{const e=el('tspan',{fill:c},lab);if(w)e.setAttribute('font-weight',w);e.textContent=t;};
    tsp(ilabel(k)+' ',MU);const fv=v=>v==null?'―':r.fm==='vol'?VF(v):r.fm==='r2'?f1(v,2):f1(v,Math.abs(v)<10?2:1)+(r.unit||'');
    if(vb)tsp(VF(vb.a[PN-1])+' ',MU);
    L.forEach(l=>tsp(l.name+' '+fv(l.a[PN-1])+' ',icol(k,l.k,l.col),700));
    const bgw=Math.min(W-PL-PR-10,lab.getComputedTextLength?lab.getComputedTextLength()+8:0);
    if(bgw>0){const bg=el('rect',{x:PL+2,y:y0+3,width:bgw,height:12,rx:2,fill:css('--card'),opacity:.8},s);s.insertBefore(bg,lab);}
    OT.push({k,L,vb,hs,fv});});
  const ty=top+1;let lastM='';const step=N<=126?1:N<=250?2:6;
  idx.forEach(i=>{const m=C.d[i].slice(0,7);if(m===lastM)return;lastM=m;const mm=+m.slice(5);if((mm-1)%step)return;if(X(i)<14||X(i)>W-PR-10)return;
    const t=el('text',{x:X(i),y:ty+10,'font-size':9.5,fill:MU,'text-anchor':'middle'},s);t.textContent=mm===1?m.slice(0,4):mm+'月';if(mm===1)t.setAttribute('font-weight',600);
    el('line',{x1:X(i),x2:X(i),y1:0,y2:top-gap,stroke:G,'stroke-width':.6},s);});
  const vl=el('line',{y1:0,y2:top-gap,stroke:MU,'stroke-width':.6,'stroke-dasharray':'2 2',visibility:'hidden'},s);
  const hit=el('rect',{x:PL,y:0,width:W-PL-PR,height:top,fill:'transparent'},s);
  const mv=ev=>{const r=s.getBoundingClientRect(),P=ev.touches?ev.touches[0]:ev,i=Math.min(len-1,Math.max(st,st+Math.floor((P.clientX-r.left-PL)/cw)));
    vl.setAttribute('x1',X(i));vl.setAttribute('x2',X(i));vl.setAttribute('visibility','visible');const pv=C.c[i-1],ch=pv?(C.c[i]-pv)/pv*100:0;
    const tv=TIP.slice(0,8).map(([n,g,c])=>{const v=g(i);return v==null?'':`<span style="color:${c}">●</span>${esc(n)} ${f0(v)}`;}).filter(Boolean);
    const ov=OT.map(o=>{const parts=(o.vb?['出来高 '+VF(o.vb.a[i+PST])]:[]).concat(o.L.map(l=>l.name+' '+o.fv(l.a[i+PST])));if(o.hs&&o.hs.a[i+PST]!=null)parts.push('ヒスト '+o.fv(o.hs.a[i+PST]));
      return '<small>'+esc(IND[o.k].name.replace(/（.*）/,''))+'</small> '+parts.join('・');});
    tip(ev,'<b>'+C.d[i]+'</b><br>始 '+f0(C.o[i])+'　高 '+f0(C.h[i])+'<br>安 '+f0(C.l[i])+'　終 <b style="color:'+(ch>=0?UP:DN)+'">'+f0(C.c[i])+'</b> ('+(ch>=0?'+':'')+f1(ch,2)+'%)'+
      (HA?'<br>平均足 始 '+f0(cO(i))+'・終 '+f0(cC(i)):'')+(tv.length?'<br>'+tv.join('<br>'):'')+(ov.length?'<br>'+ov.join('<br>'):'')+
      (SG[i]?(SG[i].b.length?`<br><b style="color:${SGBUY}">▲ 買い</b> `+SG[i].b.map(esc).join('、'):'')+(SG[i].s.length?`<br><b style="color:${SGSELL}">▼ 売り</b> `+SG[i].s.map(esc).join('、'):''):'')+vpRow(P.clientY-r.top));};
  function vpRow(y){if(!VP||y<0||y>pH)return '';const p=hi-(y-3)/(pH-6)*(hi-lo),k=Math.floor((p-VP.lo)/VP.w);if(k<0||k>=VP.nb)return '';
    const a=VP.lo+k*VP.w,v=VP.vol[k];return '<br>価格帯 '+f0(a)+'〜'+f0(a+VP.w)+'：'+f0(v/1e4)+'万（'+f1(v/VP.tot*100)+'%'+(k===VP.poc?'・POC':'')+'）';}
  const out=()=>{untip();vl.setAttribute('visibility','hidden');};
  hit.addEventListener('pointermove',mv);hit.addEventListener('touchmove',mv,{passive:true});hit.addEventListener('pointerleave',out);hit.addEventListener('touchend',out);}

/* ================= 起動 ================= */
document.querySelectorAll('#rng button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#rng button').forEach(x=>x.classList.remove('on'));b.classList.add('on');N=+b.dataset.n;draw();});
['cb-mk','cb-lv','cb-vp'].forEach(id=>{const e=$(id);if(e)e.onchange=()=>{sgUI();draw();};});
(()=>{const b=$('sgopt');if(!b)return;sgUI();
  b.addEventListener('change',e=>{const x=e.target;if(!x.dataset||!x.dataset.sk)return;if(x.checked)SGKIND.add(x.dataset.sk);else SGKIND.delete(x.dataset.sk);sgSave();draw();});
  document.querySelectorAll('#sgstyle button').forEach(x=>x.onclick=()=>{SGST=x.dataset.st;sgSave();sgUI();draw();});
  $('sgdef').onclick=()=>{SGKIND=new Set(SGDEF);SGST='label';SGVL=false;sgSave();sgUI();draw();};
  $('sgnone').onclick=()=>{SGKIND=new Set();sgSave();sgUI();draw();};
  $('sgvl').onchange=e=>{SGVL=e.target.checked;sgSave();draw();};})();
buildIndUI();
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
toggle($('ch-tgl'),$('ch-det'),'one-chdet',['指標を選ぶ','閉じる'],(v,init)=>{DET=v;if(!init)draw();});
toggle($('sig-tgl'),$('sigdet'),'one-sigdet',['内訳・推移','閉じる'],(v,init)=>{if(!init){draw();drawFund();}});
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
