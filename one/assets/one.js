
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
  if(!F.length){$('jcards').hidden=$('fgrid').hidden=$('fmeta').hidden=true;$('f-hint').textContent='';
    if(!$('fnone'))$('fundcard').insertAdjacentHTML('beforeend','<p id="fnone" style="color:var(--mut);font-size:12px;margin:8px 0">決算データがまだありません（新規上場などで未取得）。</p>');return;}
  drawJudge();
  let h=140;if(innerWidth>1100){const top=$('fgrid').getBoundingClientRect().top+scrollY,metaH=$('fmeta').offsetHeight+30;
    h=Math.max(110,Math.min(260,Math.floor((innerHeight-top-metaH-34)/2)-26));}
  fchart('fp-rev','売上高',[{n:'売上高',c:'--f1',v:F.map(x=>x.sales)}],{h});
  fchart('fp-prof','利益',[{n:'営業利益',c:'--f2',v:F.map(x=>x.op)},{n:'純利益',c:'--f3',v:F.map(x=>x.ni)}],{h});
  fchart('fp-mgn','利益率',[{n:'営業利益率',c:'--f2',v:F.map(x=>x.opm)},{n:'純利益率',c:'--f3',v:F.map(x=>x.sales&&x.ni!=null?x.ni/x.sales*100:null)}],{h,line:1,pct:1});
  fchart('fp-cf','キャッシュフロー',[{n:'営業CF',c:'--f2',v:F.map(x=>x.ocf)},{n:'フリーCF',c:'--f1',v:F.map(x=>x.fcf)}],{h});}

/* ================= チャート ================= */
let N=126,DET=false;
function draw(){
  const box=$('chart');box.innerHTML='';
  const W=box.clientWidth,narrow=W<560,G=css('--grid'),MU=css('--mut'),UP=css('--candleU'),DN=css('--candleD');
  const show={ichi:!DET||$('cb-ichi').checked,ma:DET&&$('cb-ma').checked,m200:DET&&$('cb-200').checked,bb:DET&&$('cb-bb').checked,
              mk:DET&&$('cb-mk').checked,lv:DET&&$('cb-lv').checked,osc:DET&&$('cb-osc').checked};
  $('lg-ichi').style.visibility=show.ichi?'visible':'hidden';
  const wide=innerWidth>1100,avail=wide?Math.max(show.osc?560:420,innerHeight-(box.getBoundingClientRect().top+scrollY)-50):0;
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
      (show.ichi?'<br>転換 '+f0(C.tk[i])+'・基準 '+f0(C.kj[i]):'')+(show.ma?'<br>25日 '+f0(C.ma25[i])+'・75日 '+f0(C.ma75[i]):'')+(show.osc?'<br>RSI '+f1(C.rsi[i]):'')+'<br>出来高 '+f0(C.v[i]/1e4)+'万');};
  const out=()=>{untip();vl.setAttribute('visibility','hidden');};
  hit.addEventListener('pointermove',mv);hit.addEventListener('touchmove',mv,{passive:true});hit.addEventListener('pointerleave',out);hit.addEventListener('touchend',out);}

/* ================= 起動 ================= */
document.querySelectorAll('#rng button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#rng button').forEach(x=>x.classList.remove('on'));b.classList.add('on');N=+b.dataset.n;draw();});
['cb-ichi','cb-ma','cb-bb','cb-mk','cb-lv','cb-200','cb-osc'].forEach(id=>$(id).onchange=draw);
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
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{draw();drawFund();},120);});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',redraw);
