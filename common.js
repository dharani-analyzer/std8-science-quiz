"use strict";
/* Shared helpers for the student and teacher pages. */
const $ = s => document.querySelector(s);
const L = "ABCD";
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
const ls={
  get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}},
  del(k){try{localStorage.removeItem(k);}catch(e){}}
};
let busyN=0;
function busy(on){busyN+=on?1:-1;let b=document.getElementById("busy");if(busyN>0&&!b)document.body.insertAdjacentHTML("beforeend",'<div class="busy" id="busy"></div>');if(busyN<=0){busyN=0;if(b)b.remove();}}
let clockOffset=0;
const now=()=>Date.now()+clockOffset;
async function api(action,data,quiet){
  if(!window.API_URL)throw Object.assign(new Error("The quiz is not connected to its Google Sheet yet."),{server:true});
  if(!quiet)busy(true);
  try{
    let r;
    try{r=await fetch(window.API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(Object.assign({action},data||{}))});}
    catch(e){throw Object.assign(new Error("Couldn't connect. Please check your internet connection and try again."),{offline:true});}
    let j;try{j=await r.json();}catch(e){throw new Error("The server sent an unexpected reply. Please try again.");}
    if(j.now)clockOffset=j.now-Date.now();
    if(!j.ok)throw Object.assign(new Error(j.error||"Something went wrong."),{server:true});
    return j;
  }finally{if(!quiet)busy(false);}
}
const fmtD=t=>t?new Date(t).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"numeric",minute:"2-digit"}):"";
const fmtDay=t=>t?new Date(t).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):"";
const pc=(c,n)=>n?Math.round(c/n*100):0;
function pctClass(p){return p>=80?"ok":p>=50?"warn":"bad";}
function closeModal(){const m=document.getElementById("modal");if(m)m.remove();}
function modal(html,cls){closeModal();document.body.insertAdjacentHTML("beforeend",`<div class="modal-bg" id="modal"><div class="modal ${cls||""}">${html}</div></div>`);}
let dlgOk=null;
function ask(msg,okLabel,onOk,danger){
  dlgOk=onOk;
  modal(`<div style="font-size:17px;font-weight:600;margin-bottom:16px">${esc(msg)}</div>
  <div class="row"><button class="btn ${danger?"danger":""}" id="dlgOk" onclick="const f=dlgOk;closeModal();if(f)f();">${esc(okLabel||"OK")}</button>
  <button class="btn ghost" onclick="closeModal()">Cancel</button></div>`);
  setTimeout(()=>{const b=document.getElementById("dlgOk");if(b)b.focus();},0);
}
function notify(msg){modal(`<div style="font-size:17px;font-weight:600;margin-bottom:16px">${esc(msg)}</div><div class="row"><button class="btn" onclick="closeModal()">OK</button></div>`);}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
