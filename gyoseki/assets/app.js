
"use strict";
var CHO = 1e6; // 1兆円 = 1,000,000 百万円
function css(v){ return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
function fmtMoney(v){
  if(v==null) return {n:"—",u:""};
  var a=Math.abs(v);
  if(a>=CHO) return {n:(v/CHO).toFixed(2), u:"兆円"};
  if(a>=100) return {n:(v/100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,","), u:"億円"};
  return {n:Math.round(v).toLocaleString(), u:"百万円"};
}
function money(v){ var o=fmtMoney(v); return v==null? "—" : o.n+o.u; }
function pct(v,d){ return v==null? "—" : (v*100).toFixed(d==null?1:d)+"%"; }
function signPct(v){ return v==null? "—" : (v>0?"+":"")+(v*100).toFixed(1)+"%"; }
function yoy(a,b){ return (a==null||b==null||b===0)? null : a/b-1; }
function numf(v,d){ return v==null? "—" : v.toFixed(d==null?2:d); }

function niceTicks(lo,hi,n){
  var span=(hi-lo)||1, raw=span/(n||4), mag=Math.pow(10,Math.floor(Math.log10(raw))), r=raw/mag;
  var step=(r<1.5?1:r<3?2:r<7?5:10)*mag, t=[];
  for(var v=Math.floor(lo/step)*step; v<=hi+step*0.5; v+=step) t.push(+v.toFixed(10));
  return t;
}

function Chart(host, cfg){
  var wrap=document.createElement("div"); wrap.className="plot";
  var tip=document.createElement("div"); tip.className="tip";
  host.appendChild(wrap); wrap.appendChild(tip);
  var rows=cfg.rows;
  function draw(){
    var W=wrap.clientWidth||460; if(W<40) return;
    var narrow=W<380, H=cfg.height||(narrow?188:210);
    var mL=narrow?40:50, mR=10, mT=10, mB=narrow?28:26;
    var n=rows.length; if(!n) return;
    var iw=Math.max(40,W-mL-mR), ih=Math.max(40,H-mT-mB);
    var keys=cfg.series.map(function(s){return s.key;}), vals=[];
    rows.forEach(function(r){ keys.forEach(function(k){ if(r[k]!=null) vals.push(r[k]); }); });
    if(!vals.length){ wrap.innerHTML='<div class="empty">データなし</div>'; return; }
    var dmax=Math.max.apply(null,vals), dmin=Math.min.apply(null,vals);
    var lo = cfg.zero===false ? dmin-(dmax-dmin||Math.abs(dmax)||1)*0.2 : Math.min(0,dmin);
    var hi = dmax + (dmax-lo)*0.08;
    if(hi===lo){ hi=lo+1; }
    var ticks=niceTicks(lo,hi,narrow?3:4);
    lo=Math.min(lo,ticks[0]); hi=Math.max(hi,ticks[ticks.length-1]);
    function Y(v){ return mT+ih-(v-lo)/(hi-lo)*ih; }
    var band=iw/n; function Xc(i){ return mL+band*(i+0.5); }
    var g=[], zeroY=Y(Math.min(Math.max(0,lo),hi));

    if(cfg.highlightLast){
      var hs=Math.max(0,n-cfg.highlightLast);
      g.push('<rect x="'+(mL+band*hs).toFixed(1)+'" y="'+mT+'" width="'+(band*(n-hs)).toFixed(1)+'" height="'+ih+'" fill="'+css("--band")+'"/>');
    }
    ticks.forEach(function(t){
      var y=Y(t).toFixed(1);
      g.push('<line x1="'+mL+'" x2="'+(mL+iw)+'" y1="'+y+'" y2="'+y+'" stroke="'+(t===0?css("--rule-s"):css("--grid"))+'" stroke-width="1"/>');
      g.push('<text x="'+(mL-7)+'" y="'+y+'" text-anchor="end" dominant-baseline="middle" font-size="'+(narrow?9:10)+'" font-family="ui-monospace,monospace" fill="'+css("--ink-3")+'">'+cfg.ytick(t)+'</text>');
    });
    var every=Math.max(1,Math.ceil(n/(narrow?5:10)));
    rows.forEach(function(r,i){
      if(i%every!==0 && i!==n-1) return;
      g.push('<text x="'+Xc(i).toFixed(1)+'" y="'+(mT+ih+14)+'" text-anchor="middle" font-size="'+(narrow?9:10)+'" font-family="ui-monospace,monospace" fill="'+css("--ink-3")+'">'+cfg.xtick(r)+'</text>');
    });

    if(cfg.type==="bar"){
      var nb=cfg.series.length, pad=Math.min(9,band*0.16), slot=(band-pad*2)/nb;
      cfg.series.forEach(function(s,si){
        var col=css(s.color);
        rows.forEach(function(r,i){
          var v=r[s.key]; if(v==null) return;
          var y0=Y(Math.max(0,v)), y1=Y(Math.min(0,v));
          var x=mL+band*i+pad+slot*si+(nb>1?1:0), w=Math.max(1.5,slot-(nb>1?2:0));
          g.push('<rect x="'+x.toFixed(1)+'" y="'+y0.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+Math.max(1.5,Math.abs(y1-y0)).toFixed(1)+'" rx="'+Math.min(4,w/2).toFixed(1)+'" fill="'+col+'"/>');
        });
      });
    } else {
      cfg.series.forEach(function(s){
        var col=css(s.color), seg=[], parts=[];
        rows.forEach(function(r,i){
          if(r[s.key]==null){ if(seg.length){parts.push(seg); seg=[];} return; }
          seg.push([Xc(i),Y(r[s.key]),r]);
        });
        if(seg.length) parts.push(seg);
        parts.forEach(function(p){
          if(p.length===1){ g.push('<circle cx="'+p[0][0].toFixed(1)+'" cy="'+p[0][1].toFixed(1)+'" r="3.2" fill="'+col+'"/>'); return; }
          g.push('<path d="'+p.map(function(q,i){return (i?"L":"M")+q[0].toFixed(1)+" "+q[1].toFixed(1);}).join(" ")+'" fill="none" stroke="'+col+'" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>');
        });
        var flat=[]; parts.forEach(function(p){flat=flat.concat(p);});
        if(flat.length){ var e=flat[flat.length-1];
          g.push('<circle cx="'+e[0].toFixed(1)+'" cy="'+e[1].toFixed(1)+'" r="4" fill="'+col+'" stroke="'+css("--surface")+'" stroke-width="2"/>'); }
        if(s.hollowWhen){ flat.forEach(function(q){ if(!s.hollowWhen(q[2])) return;
          g.push('<circle cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="3.4" fill="'+css("--surface")+'" stroke="'+col+'" stroke-width="2"/>'); }); }
      });
    }
    g.push('<line id="xh" x1="0" x2="0" y1="'+mT+'" y2="'+(mT+ih)+'" stroke="'+css("--rule-s")+'" stroke-width="1" opacity="0"/>');
    g.push('<line x1="'+mL+'" x2="'+(mL+iw)+'" y1="'+zeroY.toFixed(1)+'" y2="'+zeroY.toFixed(1)+'" stroke="'+css("--rule-s")+'" stroke-width="1"/>');

    wrap.querySelectorAll("svg").forEach(function(s){s.remove();});
    wrap.insertAdjacentHTML("afterbegin",
      '<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+cfg.aria+'">'+g.join("")+'</svg>');

    var el=wrap.querySelector("svg"), xh=el.querySelector("#xh");
    function move(ev){
      var rect=el.getBoundingClientRect();
      var x=(ev.touches?ev.touches[0].clientX:ev.clientX)-rect.left;
      var i=Math.max(0,Math.min(n-1,Math.floor((x-mL)/band))), r=rows[i];
      xh.setAttribute("x1",Xc(i).toFixed(1)); xh.setAttribute("x2",Xc(i).toFixed(1)); xh.setAttribute("opacity","0.8");
      tip.innerHTML='<h4>'+cfg.tipTitle(r)+'</h4>'+cfg.series.map(function(s){
        return '<div class="row"><i><span class="sw'+(cfg.type==="bar"?"":" ln")+'" style="background:'+css(s.color)+'"></span>'+s.name+'</i><b>'+cfg.tipVal(r[s.key],r,s)+'</b></div>';
      }).join("");
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
  return {redraw:draw, setRows:function(r){rows=r; draw();}};
}

function tableHTML(rows, cols){
  return '<div class="tblwrap"><table><thead><tr>'+cols.map(function(c){return '<th>'+c.h+'</th>';}).join("")
    +'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+cols.map(function(c){
      var v=c.f(r); return '<td'+(v==="—"?' class="na"':'')+'>'+v+'</td>';}).join("")+'</tr>';}).join("")
    +'</tbody></table></div>';
}

function panel(host, o){
  host.innerHTML='<div class="p-head"><div class="p-title">'+o.title+'</div>'
    +'<div class="p-tools"><span class="p-unit">'+o.unit+'</span>'
    +(o.cols?'<button type="button" class="tbtn" aria-pressed="false">表</button>':'')+'</div></div>'
    +(o.sub?'<div class="p-sub">'+o.sub+'</div>':'')
    +(o.series.length>1?'<div class="legend">'+o.series.map(function(s){
        return '<span><span class="sw'+(o.chart.type==="bar"?"":" ln")+'" style="background:var('+s.color+')"></span>'+s.name+'</span>';}).join("")+'</div>':'');
  if(!o.chart.rows.length){
    host.insertAdjacentHTML("beforeend",'<div class="empty">'+(o.emptyText||"データなし")+'</div>');
    return null;
  }
  var ph=document.createElement("div"); host.appendChild(ph);
  var ch=Chart(ph,Object.assign({},o.chart,{series:o.series}));
  if(o.cols){
    var th=document.createElement("div"); th.hidden=true; host.appendChild(th);
    th.innerHTML=tableHTML(o.chart.rows.slice().reverse(),o.cols);
    var b=host.querySelector(".tbtn");
    b.addEventListener("click",function(){
      var on=b.getAttribute("aria-pressed")==="true";
      b.setAttribute("aria-pressed",String(!on));
      ph.hidden=!on; th.hidden=on; if(on) ch.redraw();
    });
  }
  return ch;
}

function spark(vals,color){
  var w=160,h=24,p=3, ok=vals.filter(function(v){return v!=null;});
  if(ok.length<2) return "";
  var mn=Math.min.apply(null,ok), mx=Math.max.apply(null,ok), sp=(mx-mn)||Math.abs(mx)||1;
  var lo=Math.min(mn,0)===0&&mn>=0?mn:mn;
  var pts=[];
  for(var i=0;i<vals.length;i++){
    if(vals[i]==null) continue;
    pts.push([p+i*(w-2*p)/(vals.length-1), h-p-(vals[i]-lo)/sp*(h-2*p)]);
  }
  if(pts.length<2) return "";
  var d=pts.map(function(q,i){return (i?"L":"M")+q[0].toFixed(1)+" "+q[1].toFixed(1);}).join(" ");
  var e=pts[pts.length-1];
  return '<svg class="spark" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" aria-hidden="true">'
    +'<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>'
    +'<circle cx="'+e[0].toFixed(1)+'" cy="'+e[1].toFixed(1)+'" r="2.5" fill="'+color+'"/></svg>';
}

var ICO={good:"▲",warn:"▼",bad:"▼",flat:"●",none:"—"};

/* 判定：直近通期を業種中央値と比べる。▲＝良い側 ●＝並み ▼＝注意 */
function levelOf(C){
  var A=C.annual||[], P=C.peer||{}, n=A.length, last=A[n-1]||{}, first=A[0]||{}, q=C.quote||{}, r={};
  var cagr=null;
  if(n>=2 && first.rev>0 && last.rev>0) cagr=Math.pow(last.rev/first.rev,1/(n-1))-1;
  if(cagr==null) r.g={st:"none",lab:"データなし"};
  else {
    var opDown=(last.op!=null && first.op!=null && last.op<first.op);
    var g=cagr<0?"bad":(cagr>=0.05?(opDown?"warn":"good"):"flat");
    r.g={st:g,lab:{bad:"減収",warn:"増収減益",good:"増収増益",flat:"横ばい"}[g]};
  }
  if(last.opm==null) r.p={st:"none",lab:"データなし"};
  else {
    var m=P.opm, p;
    if(last.opm<0) p="bad";
    else if(m!=null) p=last.opm>=m*1.2?"good":(last.opm<m*0.6?"warn":"flat");
    else p=last.opm>=0.10?"good":(last.opm<0.03?"warn":"flat");
    r.p={st:p,lab:{bad:"赤字",good:"高い",warn:"低い",flat:"並み"}[p]};
  }
  if(last.eq==null) r.f={st:"none",lab:"データなし"};
  else {
    var me=P.eq, f;
    if(last.eq<0.10 && (me==null || last.eq<me*0.8)) f="bad";
    else if(last.eq<0.20) f=(me!=null && last.eq>=me)?"flat":"warn";
    else f=(last.eq>=0.50 || (me!=null && last.eq>=me*1.3))?"good":"flat";
    r.f={st:f,lab:{bad:"薄い",warn:"やや薄い",good:"厚い",flat:"標準"}[f]};
  }
  if(last.roe==null) r.e={st:"none",lab:"データなし"};
  else {
    var e=last.roe<0?"bad":(last.roe>=0.10?"good":(last.roe<0.05?"warn":"flat"));
    r.e={st:e,lab:{bad:"赤字",good:"高い",warn:"低い",flat:"標準"}[e]};
  }
  if(q.per==null && q.pbr==null) r.v={st:"none",lab:"データなし"};
  else {
    var cheap=0, rich=0;
    if(q.per!=null && P.per!=null){ if(q.per<P.per) cheap++; else rich++; }
    if(q.pbr!=null && P.pbr!=null){ if(q.pbr<P.pbr) cheap++; else rich++; }
    var v=(P.per==null&&P.pbr==null)?"flat":(cheap>=2?"good":(rich>=2?"warn":"flat"));
    r.v={st:v,lab:{good:"割安",warn:"割高",flat:"並み"}[v]};
  }
  return r;
}

function renderCompany(C){
  var A=C.annual||[], P=C.peer||{}, q=C.quote||{};
  var last=A[A.length-1]||{}, prev=A[A.length-2]||{};
  var el=function(id){return document.getElementById(id);};

  el("slip").innerHTML=[
    ["市場",C.market||"—"],["業種",C.sector||"—"],
    ["株価",q.price!=null?q.price.toLocaleString()+"円":"—"],
    ["時価総額",money(q.mcap)],["決算期",last.fy||"—"]
  ].map(function(x){return "<div>"+x[0]+" <b>"+x[1]+"</b></div>";}).join("");

  /* ---- 上段：判定カード5枚 ---- */
  var L=levelOf(C);
  var vs=function(v){return v==null?"":" ・ 業種 "+pct(v);};
  function card(name,lv,val,unit,sub,sp){
    return '<div class="card st-'+lv.st+'"><div class="c-top"><span class="c-name">'+name+'</span>'
      +'<span class="c-chip"><span aria-hidden="true">'+ICO[lv.st]+'</span>'+lv.lab+'</span></div>'
      +'<div class="c-val">'+val+'<small>'+(unit||"")+'</small></div>'
      +'<div class="c-sub">'+sub+'</div>'+(sp||"")+'</div>';
  }
  function pv(x){ return x==null? ["—",""] : [(x*100).toFixed(1),"%"]; }
  var mr=fmtMoney(last.rev), po=pv(last.opm), pe=pv(last.eq), pr=pv(last.roe);
  var col=function(v){return css(v);};
  el("cards").innerHTML=[
    card("成長性",L.g,mr.n,mr.u,"売上高 ・ 前期比 "+signPct(yoy(last.rev,prev.rev)),
         spark(A.map(function(r){return r.rev;}),col("--s1"))),
    card("収益性",L.p,po[0],po[1],"営業利益率"+vs(P.opm),
         spark(A.map(function(r){return r.opm;}),col("--s3"))),
    card("財務安全性",L.f,pe[0],pe[1],"自己資本比率"+vs(P.eq),
         spark(A.map(function(r){return r.eq;}),col("--s1"))),
    card("資本効率",L.e,pr[0],pr[1],"ROE"+vs(P.roe),
         spark(A.map(function(r){return r.roe;}),col("--s4"))),
    card("割安度",L.v,q.per==null?"—":q.per.toFixed(1),q.per==null?"":"倍",
         "PER ・ PBR "+numf(q.pbr,2)+"倍"+(P.per!=null?"<br>業種 "+numf(P.per,1)+"倍 / "+numf(P.pbr,2)+"倍":""),"")
  ].join("");

  /* ---- チャート4枚：データの無い系列は出さない ---- */
  function S(list){ return list.filter(function(s){ return A.some(function(r){return r[s.key]!=null;}); }); }
  var choTick=function(t){ var a=Math.abs(t); return a>=CHO?(t/CHO).toFixed(a%CHO===0?0:1)+"兆":(t/100).toFixed(0); };
  var pctTick=function(t){ return (t*100).toFixed(0)+"%"; };
  var tipM=function(v){ return money(v); };
  var tipP=function(v,r,s){ return v==null?"—":pct(v)+(s.key==="gpm"&&r.gpRef?"（参考）":""); };
  var aTitle=function(r){ return r.fy+"（"+r.fyEnd+"）"; };
  var aTick=function(r){ return r.fy.replace("期",""); };
  var base={rows:A,tipTitle:aTitle,xtick:aTick};
  function ch(o){ return Object.assign({},base,o); }

  panel(el("p-rev"),{title:"売上高",unit:"兆円 / 億円",
    series:[{key:"rev",name:"売上高",color:"--s1"}],
    chart:ch({type:"bar",ytick:choTick,tipVal:tipM,aria:"通期の売上高"})});
  panel(el("p-profit"),{title:"利益",unit:"兆円 / 億円",
    series:S([{key:"gp",name:"売上総利益",color:"--s2"},{key:"op",name:"営業利益",color:"--s3"},
              {key:"ni",name:"当期純利益",color:"--s4"}]),
    chart:ch({type:"bar",ytick:choTick,tipVal:tipM,aria:"通期の利益"})});
  panel(el("p-margin"),{title:"利益率",unit:"%",
    series:S([{key:"gpm",name:"粗利率",color:"--s2",hollowWhen:function(r){return !!r.gpRef;}},
              {key:"opm",name:"営業利益率",color:"--s3"},{key:"nim",name:"純利益率",color:"--s4"}]),
    chart:ch({type:"line",ytick:pctTick,tipVal:tipP,aria:"通期の利益率"})});
  panel(el("p-cf"),{title:"キャッシュフロー",unit:"兆円 / 億円",
    series:S([{key:"ocf",name:"営業CF",color:"--s3"},{key:"freecf",name:"フリーCF",color:"--s1"}]),
    chart:ch({type:"bar",ytick:choTick,tipVal:tipM,aria:"通期のキャッシュフロー"})});

  /* ---- 折りたたみの詳細表：全期が空の列は出さない ---- */
  var cols=[
    {h:"決算期",f:function(r){return r.fy;}},
    {h:"売上高",k:"rev",f:function(r){return money(r.rev);}},
    {h:"売上総利益",k:"gp",f:function(r){return money(r.gp);}},
    {h:"営業利益",k:"op",f:function(r){return money(r.op);}},
    {h:"当期純利益",k:"ni",f:function(r){return money(r.ni);}},
    {h:"粗利率",k:"gpm",f:function(r){return r.gpm==null?"—":pct(r.gpm)+(r.gpRef?"（参考）":"");}},
    {h:"営業利益率",k:"opm",f:function(r){return pct(r.opm);}},
    {h:"ROE",k:"roe",f:function(r){return pct(r.roe);}},
    {h:"自己資本比率",k:"eq",f:function(r){return pct(r.eq);}},
    {h:"営業CF",k:"ocf",f:function(r){return money(r.ocf);}},
    {h:"EPS",k:"eps",f:function(r){return r.eps==null?"—":numf(r.eps)+"円";}},
    {h:"配当",k:"dps",f:function(r){return r.dps==null?"—":numf(r.dps)+"円";}}
  ].filter(function(c){ return !c.k || A.some(function(r){return r[c.k]!=null;}); });
  el("t-annual").innerHTML=tableHTML(A.slice().reverse(),cols);
}

/* ---------------- index page ---------------- */
function renderIndex(ROWS){
  var q=document.getElementById("q"), sec=document.getElementById("sec"), mk=document.getElementById("mk");
  var list=document.getElementById("list"), count=document.getElementById("count");
  var sortKey="mcap", sortAsc=false;
  var COLS=[
    {k:"name",h:"銘柄",f:function(r){return '<a href="'+r.code+'.html">'+r.name+'</a> <span style="color:var(--ink-3);font-size:11px">'+r.code+'</span>';},t:"s"},
    {k:"sector",h:"業種",f:function(r){return r.sector||"—";},t:"s"},
    {k:"rank",h:"判定",f:function(r){
      var L={sp:"収益性",sf:"財務",sv:"割安度"},
          T={good:"良好",flat:"標準",warn:"注意",bad:"警戒",none:"データなし"};
      return '<span class="chip">'+["sp","sf","sv"].map(function(k){
        var st=r[k]||"none";
        return '<i style="background:var('+(st==="good"?"--ok":st==="warn"?"--wn":st==="bad"?"--bad":st==="flat"?"--ink-3":"--rule-s")
          +')" title="'+L[k]+"："+T[st]+'"></i>';
      }).join("")+'</span>';}},
    {k:"mcap",h:"時価総額",f:function(r){return money(r.mcap);}},
    {k:"opm",h:"営業利益率",f:function(r){return pct(r.opm);}},
    {k:"eq",h:"自己資本比率",f:function(r){return pct(r.eq);}},
    {k:"roe",h:"ROE",f:function(r){return pct(r.roe);}},
    {k:"per",h:"PER",f:function(r){return numf(r.per,1);}},
    {k:"pbr",h:"PBR",f:function(r){return numf(r.pbr,2);}},
    {k:"yld",h:"利回り",f:function(r){return pct(r.yld,2);}}
  ];
  function uniq(k){ var s={}; ROWS.forEach(function(r){ if(r[k]) s[r[k]]=1; }); return Object.keys(s).sort(); }
  uniq("sector").forEach(function(v){ sec.insertAdjacentHTML("beforeend",'<option>'+v+'</option>'); });
  uniq("market").forEach(function(v){ mk.insertAdjacentHTML("beforeend",'<option>'+v+'</option>'); });

  function render(){
    var term=(q.value||"").trim().toLowerCase(), s=sec.value, m=mk.value;
    var out=ROWS.filter(function(r){
      if(s && r.sector!==s) return false;
      if(m && r.market!==m) return false;
      if(!term) return true;
      return r.code.toLowerCase().indexOf(term)>=0 || (r.name||"").toLowerCase().indexOf(term)>=0;
    });
    var col=COLS.filter(function(c){return c.k===sortKey;})[0]||COLS[3];
    out.sort(function(a,b){
      var x=a[sortKey], y=b[sortKey];
      if(sortKey==="rank"){
        var W={good:3,flat:2,warn:1,bad:0,none:-1};
        var sc=function(r){return ["sp","sf","sv"].reduce(function(t,k){return t+(W[r[k]||"none"]);},0);};
        x=sc(a); y=sc(b); return sortAsc? x-y : y-x;
      }
      if(col.t==="s"){ x=x||""; y=y||""; return sortAsc? (x<y?-1:x>y?1:0) : (x>y?-1:x<y?1:0); }
      if(x==null) return 1; if(y==null) return -1;
      return sortAsc? x-y : y-x;
    });
    count.textContent=out.length.toLocaleString()+" / "+ROWS.length.toLocaleString()+" 銘柄";
    var show=out.slice(0,600);
    list.innerHTML='<div class="tblwrap"><table><thead><tr>'+COLS.map(function(c){
        return '<th'+(c.k===sortKey?' aria-sort="'+(sortAsc?"ascending":"descending")+'"':'')+' data-k="'+c.k+'">'+c.h+'</th>';
      }).join("")+'</tr></thead><tbody>'+show.map(function(r){
        return '<tr>'+COLS.map(function(c){ var v=c.f(r); return '<td'+(v==="—"?' class="na"':'')+'>'+v+'</td>'; }).join("")+'</tr>';
      }).join("")+'</tbody></table></div>'
      +(out.length>show.length?'<div class="p-sub" style="padding:8px 10px">先頭 '+show.length+' 件を表示（絞り込むと全件表示されます）</div>':'');
    list.querySelectorAll("th").forEach(function(th){
      th.addEventListener("click",function(){
        var k=th.dataset.k;
        if(k===sortKey) sortAsc=!sortAsc; else { sortKey=k; sortAsc=(COLS.filter(function(c){return c.k===k;})[0]||{}).t==="s"; }
        render();
      });
    });
  }
  [q,sec,mk].forEach(function(e){ e.addEventListener("input",render); });
  render();
}
