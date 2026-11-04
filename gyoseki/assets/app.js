
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


function panel2(host, o){
  var leg=o.bars.map(function(s){return '<span><span class="sw" style="background:var('+s.color+')"></span>'+s.name+'</span>';})
    .concat(o.lines.map(function(s){return '<span><span class="sw ln" style="background:var('+(s.dot||s.color)+')"></span>'+s.name+(s.axis==="R"?'（右軸）':'')+'</span>';}));
  host.innerHTML='<div class="p-head"><div class="p-title">'+o.title+'</div>'
    +'<div class="p-tools"><span class="p-unit">'+o.unit+'</span>'
    +(o.cols?'<button type="button" class="tbtn" aria-pressed="false">表</button>':'')+'</div></div>'
    +(o.sub?'<div class="p-sub">'+o.sub+'</div>':'')
    +(leg.length?'<div class="legend">'+leg.join("")+'</div>':'');
  if(!o.rows.length || !leg.length){
    host.insertAdjacentHTML("beforeend",'<div class="empty">'+(o.emptyText||"データなし")+'</div>');
    return null;
  }
  var ph=document.createElement("div"); host.appendChild(ph);
  var ch=Combo(ph,o);
  if(o.cols){
    var th=document.createElement("div"); th.hidden=true; host.appendChild(th);
    th.innerHTML=tableHTML(o.rows.slice().reverse(),o.cols);
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
  function decFor(st){ return st>=1?0:(st>=0.1?1:2); }
  function stepOf(tk){ return tk&&tk.length>1?Math.abs(tk[1]-tk[0]):0; }
  /* 目盛りは軸全体で単位をそろえる（兆の軸なら0.5兆、億の軸なら億） */
  var choTick=function(t,tk){ var mx=Math.max.apply(null,(tk||[t]).map(Math.abs)), st=stepOf(tk);
    if(t===0) return "0";
    return mx>=CHO? (t/CHO).toFixed(decFor(st/CHO))+"兆" : (t/100).toFixed(decFor(st/100)); };
  var pctTick=function(t,tk){ return (t*100).toFixed(decFor(stepOf(tk)*100||1))+"%"; };
  var tipM=function(v){ return money(v); };
  var tipP=function(v,r,s){ return v==null?"—":pct(v)+(s.key==="gpm"&&r.gpRef?"（参考）":""); };
  var aTitle=function(r){ return r.fy+"（"+r.fyEnd+"）"; };
  var aTick=function(r){ return r.fy.replace("期",""); };
  var base={rows:A,tipTitle:aTitle,xtick:aTick};
  function ch(o){ return Object.assign({},base,o); }

  var AF=A.concat(C.fc?[C.fc]:[]), Q=C.quarters||[], odpName=C.odpName||"経常利益";
  function has(rows,k){ return rows.some(function(r){return r[k]!=null;}); }
  function F(rows,list){ return list.filter(function(s){ return has(rows,s.key); }); }
  var tipP=function(v){ return v==null?"—":pct(v); };
  var aTitle2=function(r){ return r.fc? r.fy.replace("予","")+"（会社予想・"+(r.disc||"")+"開示）" : aTitle(r); };
  var aTick2=function(r){ return r.fy.replace("期",""); };
  var yenTick=function(t){ return t%1? t.toFixed(1) : String(t); };
  var yen=function(v){ return v==null?"—":(v%1? v.toFixed(2):v.toFixed(0))+"円"; };
  var mcol=function(h,k){ return {h:h,f:function(r){return money(r[k]);}}; };
  var fyCol={h:"決算期",f:function(r){return r.fy;}};

  panel2(el("p-annual"),{title:"通期決算",unit:"億円 / %",
    sub:C.fc?"右端の薄い棒は今期の会社予想":"",
    rows:AF, aria:"通期決算",
    bars:F(AF,[{key:"rev",name:"売上高",color:"--c-rev"},{key:"op",name:"営業利益",color:"--c-op"},
               {key:"odp",name:odpName,color:"--c-odp"},{key:"ni",name:"純利益",color:"--c-ni"}]),
    lines:F(AF,[{key:"opm",name:"営業利益率",color:"--c-line",dot:"--c-op",axis:"R"}]),
    yl:choTick, yr:pctTick, tipL:tipM, tipR:tipP, tipTitle:aTitle2, xtick:aTick2,
    cols:[fyCol,mcol("売上高","rev"),mcol("営業利益","op"),mcol(odpName,"odp"),mcol("純利益","ni"),
          {h:"営業利益率",f:function(r){return pct(r.opm);}}]});

  panel2(el("p-cf"),{title:"キャッシュフロー",unit:"億円",
    rows:A, aria:"通期のキャッシュフロー",
    bars:F(A,[{key:"ocf",name:"営業CF",color:"--c-ocf"},{key:"icf",name:"投資CF",color:"--c-icf"},
              {key:"fcf",name:"財務CF",color:"--c-fin"},{key:"cash",name:"現預金等",color:"--c-cash"}]),
    lines:F(A,[{key:"frcf",name:"フリーCF",color:"--c-free",axis:"L",w:2.5}]),
    yl:choTick, yr:pctTick, tipL:tipM, tipR:tipP, tipTitle:aTitle, xtick:aTick2,
    cols:[fyCol,mcol("営業CF","ocf"),mcol("投資CF","icf"),mcol("財務CF","fcf"),mcol("フリーCF","frcf"),mcol("現預金等","cash")]});

  panel2(el("p-q"),{title:"四半期決算",unit:"億円 / %",
    sub:Q.length?"単独四半期（累計の差分）":"",
    rows:Q, aria:"四半期決算", emptyText:"四半期データなし（J-Quants 決算短信サマリー未取得）",
    bars:F(Q,[{key:"rev",name:"売上高",color:"--c-rev"},{key:"op",name:"営業利益",color:"--c-op"},
              {key:"odp",name:"経常利益",color:"--c-odp"},{key:"ni",name:"純利益",color:"--c-ni"}]),
    lines:F(Q,[{key:"opm",name:"営業利益率",color:"--c-line",dot:"--c-op",axis:"R"}]),
    yl:choTick, yr:pctTick, tipL:tipM, tipR:tipP,
    tipTitle:function(r){ return r.fy+"（〜"+r.perEnd+"）"; }, xtick:function(r){ return r.fy; },
    cols:[{h:"四半期",f:function(r){return r.fy;}},mcol("売上高","rev"),mcol("営業利益","op"),mcol("経常利益","odp"),
          mcol("純利益","ni"),{h:"営業利益率",f:function(r){return pct(r.opm);}}]});

  panel2(el("p-div"),{title:"配当",unit:"円 / %",
    sub:(C.fc&&C.fc.dps!=null)?"右端の薄い棒は今期の会社予想":"",
    rows:(C.fc&&C.fc.dps!=null)?AF:A, aria:"一株配当と配当性向", emptyText:"配当データなし",
    bars:F(A,[{key:"dps",name:"配当金",color:"--c-div"}]),
    lines:F(AF,[{key:"payout",name:"配当性向",color:"--c-pay",axis:"R"}]),
    yl:yenTick, yr:pctTick, tipL:yen, tipR:tipP, tipTitle:aTitle2, xtick:aTick2,
    cols:[fyCol,{h:"配当金",f:function(r){return yen(r.dps);}},{h:"配当性向",f:function(r){return pct(r.payout);}},
          {h:"EPS",f:function(r){return yen(r.eps);}}]});

  var bp=el("p-bs"), BS=C.bs||[];
  bp.innerHTML='<div class="p-head"><div class="p-title">貸借対照表</div><span class="p-unit" style="margin-left:auto">'+(BS.length?(BS[BS.length-1].std==="IFRS"?"IFRS":"日本基準"):"")+'</span></div>';
  if(BS.length) kbBS(bp, BS); else bp.hidden=true;   // データの無い銘柄（米国基準など）は枠ごと出さない

  var HS=C.holders, hp=el("p-holders");
  hp.innerHTML='<div class="p-head"><div class="p-title">株主構成</div><span class="p-unit">発行済株式に対する割合</span></div>'
    +(HS?'<div class="p-sub">有価証券報告書（'+(HS.asof||"").slice(0,7).replace("-","年")+'月末時点・'+(HS.filed||"")+'提出）の大株主上位10名と自己株式</div>':'');
  kbPie(hp, HS);

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
