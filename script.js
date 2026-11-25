const STORE_KEY="narongOlProjects";
const defaults=[
{id:1,title:"Ganzberg Snow Campaign",category:"design",type:"image",src:"",mediaId:"",thumbId:"",description:"Billboard · Advertising Design",software:["Photoshop","Illustrator"],mark:"CHASE THE VIBE"},
{id:2,title:"Creative Poster Design",category:"design",type:"image",src:"",mediaId:"",thumbId:"",description:"Graphic Design",software:["Photoshop"],mark:"DESIGN"},
{id:3,title:"Commercial Video Editing",category:"video",type:"video",src:"",mediaId:"",thumbId:"",description:"Promotional Video",software:["Premiere Pro","After Effects"],mark:"VIDEO"},
{id:4,title:"Motion Graphics",category:"video",type:"video",src:"",mediaId:"",thumbId:"",description:"Animation",software:["After Effects"],mark:"MOTION"},
{id:5,title:"Social Media Content",category:"content",type:"image",src:"",mediaId:"",thumbId:"",description:"Digital Campaign",software:["Photoshop","CapCut"],mark:"CONTENT"},
{id:6,title:"Product Photography",category:"photo",type:"image",src:"",mediaId:"",thumbId:"",description:"Photography",software:["Lightroom"],mark:"PHOTO"}];
let publishedProjects = null;
function getProjects(){try{const v=JSON.parse(localStorage.getItem(STORE_KEY));return Array.isArray(v)?v:defaults}catch{return defaults}}
async function loadPublishedProjects(){
  try {
    const response = await fetch("./projects.json", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) publishedProjects = data;
    }
  } catch (error) {
    console.warn("Could not load projects.json; using local fallback.", error);
  }
}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open("narongOlMedia",1);req.onupgradeneeded=()=>req.result.createObjectStore("media");req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function getMedia(id){if(!id)return null;try{const db=await openDB();return await new Promise((resolve,reject)=>{const r=db.transaction("media").objectStore("media").get(id);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}catch{return null}}
async function saveMedia(id,file){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction("media","readwrite");tx.objectStore("media").put(file,id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
async function deleteMedia(id){if(!id)return;try{const db=await openDB();db.transaction("media","readwrite").objectStore("media").delete(id)}catch{}}
let currentFilter="all",lightboxUrl=null;
const lightbox=document.createElement("div");lightbox.className="media-lightbox";lightbox.id="mediaLightbox";lightbox.setAttribute("aria-hidden","true");lightbox.innerHTML='<button class="lightbox-close" type="button" aria-label="Close preview">&times;</button><div class="lightbox-content"></div><p class="lightbox-caption"></p>';document.body.appendChild(lightbox);
const lbContent=lightbox.querySelector(".lightbox-content"),lbCaption=lightbox.querySelector(".lightbox-caption");
function closeLightbox(){const v=lbContent.querySelector("video");if(v)v.pause();lightbox.classList.remove("active");lightbox.setAttribute("aria-hidden","true");lbContent.replaceChildren();lbCaption.textContent="";document.body.classList.remove("lightbox-open");if(lightboxUrl){URL.revokeObjectURL(lightboxUrl);lightboxUrl=null}}
async function openLightbox(p){closeLightbox();let src=p.src||"";if(p.mediaId && !src){const blob=await getMedia(p.mediaId);if(blob){lightboxUrl=URL.createObjectURL(blob);src=lightboxUrl}}if(!src)return;lbCaption.textContent=p.title||"";let el;if(p.type==="video"){el=document.createElement("video");el.controls=true;el.autoplay=true;el.playsInline=true;el.preload="metadata"}else{el=document.createElement("img");el.alt=p.title||"Portfolio project"}el.src=src;lbContent.appendChild(el);lightbox.classList.add("active");lightbox.setAttribute("aria-hidden","false");document.body.classList.add("lightbox-open");if(p.type==="video")el.play().catch(()=>{})}
lightbox.querySelector(".lightbox-close").addEventListener("click",closeLightbox);lightbox.addEventListener("click",e=>{if(e.target===lightbox)closeLightbox()});document.addEventListener("keydown",e=>{if(e.key==="Escape"&&lightbox.classList.contains("active"))closeLightbox()});
async function resolveSrc(p,thumb=false){const id=thumb?p.thumbId:p.mediaId;if(id && !p.src){const blob=await getMedia(id);if(blob)return URL.createObjectURL(blob)}return p.src||""}
async function renderProjects(filter="all"){currentFilter=filter;const grid=document.getElementById("projectGrid");if(!grid)return;const items=(publishedProjects || getProjects()).filter(p=>filter==="all"||p.category===filter);grid.innerHTML="";if(!items.length){grid.innerHTML='<p class="muted">No projects in this category yet.</p>';return}
for(const p of items){const card=document.createElement("article");card.className="project-card";const btn=document.createElement("button");btn.type="button";btn.className="project-preview";btn.setAttribute("aria-label","Preview "+(p.title||"project"));const useThumb=!!p.thumbId;const src=await resolveSrc(p,useThumb);if(src){if(p.type==="video"&&!useThumb){const video=document.createElement("video");video.className="project-media";video.src=src;video.muted=true;video.playsInline=true;video.preload="metadata";btn.appendChild(video);const play=document.createElement("span");play.className="media-play-icon";play.textContent="▶";btn.appendChild(play)}else{const img=document.createElement("img");img.className="project-media";img.src=src;img.alt=p.title||"Portfolio project";img.loading="lazy";btn.appendChild(img);if(p.type==="video"){const play=document.createElement("span");play.className="media-play-icon";play.textContent="▶";btn.appendChild(play)}}const hint=document.createElement("span");hint.className="preview-hint";hint.textContent=p.type==="video"?"PLAY VIDEO ↗":"VIEW IMAGE ↗";btn.appendChild(hint)}else{const placeholder=document.createElement("div");placeholder.className="placeholder-art";placeholder.textContent=p.mark||"N.O.";btn.appendChild(placeholder)}
btn.addEventListener("click",()=>openLightbox(p));const info=document.createElement("div");info.className="project-info";const details=document.createElement("div");const title=document.createElement("h3");title.textContent=p.title||"Untitled project";const desc=document.createElement("p");desc.textContent=[p.description||"",...(p.software||[])].filter(Boolean).join(" · ");details.append(title,desc);const arrow=document.createElement("span");arrow.textContent="↗";info.append(details,arrow);card.append(btn,info);grid.append(card)}}
document.querySelectorAll("#filters button").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("#filters button").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderProjects(b.dataset.filter)}));
const year=document.getElementById("year");if(year)year.textContent=new Date().getFullYear();const menuToggle=document.getElementById("menuToggle"),navLinks=document.getElementById("navLinks");menuToggle?.addEventListener("click",()=>navLinks?.classList.toggle("open"));document.querySelectorAll("#navLinks a").forEach(a=>a.addEventListener("click",()=>navLinks?.classList.remove("open")));loadPublishedProjects().then(()=>renderProjects());
