const STORE_KEY="narongOlProjects";
const $=id=>document.getElementById(id);
function load(){try{const d=JSON.parse(localStorage.getItem(STORE_KEY));return Array.isArray(d)?d:[]}catch{return []}}
function save(data){localStorage.setItem(STORE_KEY,JSON.stringify(data));render()}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open("narongOlMedia",1);r.onupgradeneeded=()=>r.result.createObjectStore("media");r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function putMedia(id,file){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction("media","readwrite");tx.objectStore("media").put(file,id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
async function getMedia(id){if(!id)return null;const db=await openDB();return new Promise((resolve,reject)=>{const r=db.transaction("media").objectStore("media").get(id);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}
async function removeMedia(id){if(!id)return;try{const db=await openDB();db.transaction("media","readwrite").objectStore("media").delete(id)}catch{}}
let previewUrl=null;
function selectedSoftware(){return [...document.querySelectorAll("#softwareOptions input:checked")].map(x=>x.value)}
function setSoftware(values=[]){document.querySelectorAll("#softwareOptions input").forEach(x=>x.checked=values.includes(x.value))}
async function showPreview(){const box=$("livePreview");if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null}const file=$("mediaFile").files[0],thumb=$("thumbnailFile").files[0];let url="",kind=$("type").value;if(file){url=URL.createObjectURL(file);kind=file.type.startsWith("video/")?"video":"image"}else if(thumb){url=URL.createObjectURL(thumb);kind="image"}else{url=$("src").value.trim()}
box.replaceChildren();if(!url){const p=document.createElement("div");p.className="preview-empty";p.textContent="No media selected. Add a file or media path to preview it.";box.append(p);return}
if(file||thumb)previewUrl=url;let el;if(kind==="video"){el=document.createElement("video");el.controls=true;el.playsInline=true;el.preload="metadata"}else{el=document.createElement("img");el.alt="Project preview"}el.src=url;box.append(el)}
function reset(){ $("projectForm").reset();$("projectId").value="";setSoftware([]);$("formTitle").textContent="Add a project";$("saveBtn").innerHTML='Save project <span>↗</span>';showPreview()}
async function render(){const list=$("adminList"),data=load();list.replaceChildren();if(!data.length){const p=document.createElement("p");p.className="empty";p.textContent="No projects yet. Add your first project above.";list.append(p);return}
for(const p of data){const item=document.createElement("div");item.className="admin-item";const info=document.createElement("div"),strong=document.createElement("strong"),small=document.createElement("small");strong.textContent=p.title;small.textContent=[p.category,p.type,p.src||"Uploaded media",...(p.software||[])].join(" · ");info.append(strong,small);const actions=document.createElement("div");actions.className="admin-actions";const edit=document.createElement("button");edit.textContent="Edit";edit.addEventListener("click",()=>editProject(p.id));const del=document.createElement("button");del.className="delete";del.textContent="Delete";del.addEventListener("click",()=>deleteProject(p.id));actions.append(edit,del);item.append(info,actions);list.append(item)}}
async function editProject(id){const p=load().find(x=>x.id===id);if(!p)return;$("projectId").value=p.id;$("title").value=p.title||"";$("category").value=p.category||"design";$("type").value=p.type||"image";$("description").value=p.description||"";$("src").value=p.src||"";setSoftware(p.software||[]);$("mediaFile").value="";$("thumbnailFile").value="";$("formTitle").textContent="Edit project";$("saveBtn").textContent="Update project";await showPreview();window.scrollTo({top:0,behavior:"smooth"})}
async function deleteProject(id){if(!confirm("Delete this project?"))return;const p=load().find(x=>x.id===id);if(p){await removeMedia(p.mediaId);await removeMedia(p.thumbId)}save(load().filter(x=>x.id!==id))}
$("mediaFile").addEventListener("change",showPreview);$("thumbnailFile").addEventListener("change",showPreview);$("type").addEventListener("change",showPreview);$("src").addEventListener("input",showPreview);$("previewBtn").addEventListener("click",showPreview);
$("projectForm").addEventListener("submit",async e=>{e.preventDefault();const data=load(),oldId=$("projectId").value?Number($("projectId").value):null,old=data.find(x=>x.id===oldId)||{},id=oldId||Date.now();const mediaFile=$("mediaFile").files[0],thumbFile=$("thumbnailFile").files[0];let mediaId=old.mediaId||"",thumbId=old.thumbId||"";try{if(mediaFile){mediaId="media_"+id+"_"+Date.now();await putMedia(mediaId,mediaFile);if(old.mediaId)await removeMedia(old.mediaId)}if(thumbFile){thumbId="thumb_"+id+"_"+Date.now();await putMedia(thumbId,thumbFile);if(old.thumbId)await removeMedia(old.thumbId)}}catch(err){alert("Could not save the uploaded media in this browser. Try a smaller file or use a relative media path.");return}
const p={id,title:$("title").value.trim(),category:$("category").value,type:mediaFile?(mediaFile.type.startsWith("video/")?"video":"image"):$("type").value,description:$("description").value.trim(),software:selectedSoftware(),src:$("src").value.trim(),mediaId,thumbId,mark:old.mark||"N.O."};const i=data.findIndex(x=>x.id===id);if(i>=0)data[i]=p;else data.push(p);save(data);reset();alert("Project saved in this browser. Uploaded media is stored locally in this browser only.")});
$("resetBtn").addEventListener("click",reset);
$("exportBtn").addEventListener("click",()=>{
  const portable = load().map(({mediaId,thumbId,...p})=>p);
  const blob=new Blob([JSON.stringify(portable,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="projects.json";a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  alert("បាន Export projects.json។ សូមដាក់ឯកសារនេះក្នុង GitHub repository ជាមួយ images/videos។ ចំណាំ៖ រូបភាព/វីដេអូដែល Upload ក្នុង Admin ត្រូវ Upload ទៅ GitHub ដាច់ដោយឡែក ហើយកំណត់ Media path ជា relative path ដូច images/photo.jpg ឬ videos/clip.mp4។");
});
render();showPreview();
