(function(){
"use strict";if(!document.documentElement.classList.contains("bewegt"))return;
var handy=window.matchMedia("(max-width:760px)");
var alle=function(w,s){return Array.prototype.slice.call(w.querySelectorAll(s))},teil=function(a,b,p){var t=Math.max(0,Math.min(1,(p-a)/(b-a)));return t*t*(3-2*t)},str=function(a,b,p){return Math.max(0,Math.min(1,(p-a)/(b-a)))};
var K={
 gang:function(el){var li=alle(el,".g-reihe li"),n=li.length,im=li.map(function(l){return l.querySelector("img")}),tx=li.map(function(l){return l.querySelector("p")});
  return function(p){if(handy.matches){li.forEach(function(l,i){l.style.opacity="";im[i].style.transform="";tx[i].style.opacity=""});return}
   var x=str(.03,.97,p)*n;li.forEach(function(l,i){var ein=i===0?1:teil(i-.12,i+.12,x);l.style.opacity=ein.toFixed(3);l.style.visibility=ein>0?"visible":"hidden";
    var lok=Math.max(0,Math.min(1,(x-i+.2)/1.4));im[i].style.transform="scale("+(1.07-.07*lok).toFixed(4)+")";
    tx[i].style.opacity=((i===0?1:teil(i+.06,i+.3,x))*(i===n-1?1:1-teil(i+.72,i+.9,x))).toFixed(3)})}},
 tag:function(el){var t=el.querySelector(".tag"),li=el.querySelector(".tag-linie"),b=el.querySelector(".l-b"),a_=el.querySelector(".tag-w.a"),b_=el.querySelector(".tag-w.b");return function(p){var q=teil(.1,.9,p),x=(1-q)*100;t.style.clipPath="inset(0 "+(100-x).toFixed(2)+"% 0 0)";li.style.transform="translate3d("+(x/100*b.clientWidth).toFixed(1)+"px,0,0)";li.style.opacity=q>0&&q<1?1:0;a_.style.opacity=1-teil(.45,.7,p);b_.style.opacity=teil(.3,.55,p)}},
 raeume:function(el){var r=el.querySelector(".l-reihe"),b=el.querySelector(".l-b"),w=0,m=function(){w=r.scrollWidth-b.clientWidth};m();window.addEventListener("resize",m);window.addEventListener("load",m);return function(p){if(handy.matches){r.style.transform="";return}r.style.transform="translate3d("+(-w*str(.05,.95,p)).toFixed(1)+"px,0,0)"}}
};
var liste=alle(document,".l-k[data-l]").filter(function(el){return K[el.dataset.l]}).map(function(el){return{el:el,b:el.querySelector(".l-b"),fn:K[el.dataset.l](el),stand:0,ziel:0}}),laeuft=false,held=document.querySelector(".l-held-b img");
var schritt=function(){laeuft=false;liste.forEach(function(k){if(k.stand===k.ziel)return;k.stand+=(k.ziel-k.stand)*.15;if(Math.abs(k.ziel-k.stand)<.0004)k.stand=k.ziel;else laeuft=true;k.fn(k.stand)});if(laeuft)requestAnimationFrame(schritt)};
var messen=function(){liste.forEach(function(k){var r=k.el.getBoundingClientRect(),o=parseFloat(getComputedStyle(k.b).top)||0,d=r.height-k.b.offsetHeight;k.ziel=d>4?Math.max(0,Math.min(1,(o-r.top)/d)):0});if(held){var y=window.scrollY;if(y<window.innerHeight*1.2)held.style.transform="scale("+(1.08-Math.min(.08,y/9000)).toFixed(4)+") translate3d(0,"+(y*.06).toFixed(1)+"px,0)"}if(!laeuft){laeuft=true;requestAnimationFrame(schritt)}};
liste.forEach(function(k){k.fn(0)});window.addEventListener("scroll",messen,{passive:true});window.addEventListener("resize",function(){liste.forEach(function(k){k.fn(k.stand)});messen()});messen();
var io=new IntersectionObserver(function(e){e.forEach(function(x){if(!x.isIntersecting)return;x.target.classList.add("sichtbar");io.unobserve(x.target)})},{rootMargin:"0px 0px -8% 0px"});alle(document,".ins").forEach(function(x){io.observe(x)});
var ioz=new IntersectionObserver(function(e){e.forEach(function(x){if(!x.isIntersecting)return;ioz.unobserve(x.target);var b=x.target,z=+b.dataset.z,f=b.dataset.f,t0=performance.now(),d=1400,k=z%1?2:0,fmt=function(v){return f.replace("{}",v.toLocaleString("de-DE",{minimumFractionDigits:k,maximumFractionDigits:k}))};(function l(t){var p=Math.min(1,(t-t0)/d);p=1-Math.pow(1-p,3);b.textContent=fmt(z*p);if(p<1)requestAnimationFrame(l)})(t0)})},{threshold:.6});alle(document,"[data-z]").forEach(function(x){ioz.observe(x)});
})();
