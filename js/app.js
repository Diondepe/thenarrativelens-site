/* ===== Helpers ===== */
const FALLBACK_IMG = 'assets/og-image.png';

async function loadJSON(path){
  const r = await fetch(path, { cache: 'no-store' });
  if(!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
}

function pickImg(x){
  return x.thumb_url || x.image_url || FALLBACK_IMG;
}

/* ===== Image upscaling tamer =====
   If an image's natural width is smaller than its slot, don't stretch it.
   We add .no-upscale which uses object-fit:contain and width:auto.
*/
function tameUpscaling(scope=document){
  const imgs = scope.querySelectorAll('.card .thumb');
  imgs.forEach(img=>{
    // ensure we run after load (or immediately if cached)
    const apply = () => {
      try{
        const slot = img.parentElement?.clientWidth || 0;
        const nw = img.naturalWidth || 0;
        if (nw && slot && nw < slot){
          img.classList.add('no-upscale');
        }
      }catch(e){}
    };
    if (img.complete) apply(); else img.addEventListener('load', apply, {once:true});
  });
}

/* ===== Feeds rendering ===== */

function feedCardHTML(item){
  const img = pickImg(item);
  return `
    <article class="card" style="margin:1rem 0;">
      <div class="thumb-wrap">
        <img class="thumb"
             src="${img}"
             alt=""
             loading="lazy"
             referrerpolicy="no-referrer"
             onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
      </div>
      <div style="padding:1rem">
        <h3 style="margin:.2rem 0 0">${item.title}</h3>
        <div class="meta">
          <span class="badge">${item.source}</span>
          <span>${new Date(item.published).toLocaleDateString()}</span>
        </div>
        ${item.summary ? `<p>${item.summary}</p>` : ``}
        <p style="margin:.75rem 0 0">
          <a class="btn" href="${item.url}" target="_blank" rel="noopener">Read source</a>
        </p>
      </div>
    </article>
  `;
}

async function initFeeds(){
  const feedsHolder = document.getElementById('feeds-list');
  if(!feedsHolder) return;

  let data = [];
  try { data = await loadJSON('data/feeds.json'); }
  catch(e){ console.error('feeds.json', e); return; }

  feedsHolder.innerHTML = data.slice(0, 60).map(feedCardHTML).join('');
  tameUpscaling(feedsHolder);
}

/* Boot */
document.addEventListener('DOMContentLoaded', () => {
  initFeeds();
});
