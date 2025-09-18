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

/* ===== Narrative News: Feeds page + Homepage teasers ===== */

function feedCardHTML(item){
  const img = pickImg(item);
  return `
    <article class="card" style="margin:1rem 0;">
      <img class="thumb"
           src="${img}"
           alt=""
           loading="lazy"
           referrerpolicy="no-referrer"
           onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
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

function teaserHTML(item){
  const img = pickImg(item);
  return `
    <a href="${item.url}" target="_blank" rel="noopener" class="teaser-card">
      <img class="teaser-thumb"
           src="${img}" alt="" loading="lazy" referrerpolicy="no-referrer"
           onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
      <div class="teaser-body">
        <div class="meta" style="font-size:.75rem;margin-bottom:.25rem">
          <span class="badge">${item.source}</span>
          <span>${new Date(item.published).toLocaleDateString()}</span>
        </div>
        <h3>${item.title}</h3>
        ${item.summary ? `<p>${item.summary}</p>` : ``}
      </div>
    </a>
  `;
}

async function initFeeds(){
  const feedsHolder = document.getElementById('feeds-list');
  const homeHolder  = document.getElementById('home-feeds');
  if(!feedsHolder && !homeHolder) return;

  let data = [];
  try { data = await loadJSON('data/feeds.json'); }
  catch(e){ console.error('feeds.json', e); return; }

  if (feedsHolder){
    feedsHolder.innerHTML = data.slice(0, 60).map(feedCardHTML).join('');
  }
  if (homeHolder){
    homeHolder.innerHTML = data.slice(0, 9).map(teaserHTML).join('');
  }
}

/* ===== Narratives pages (optional for home/narratives) ===== */

async function initNarrativesPage(){
  const container = document.getElementById('narratives-list');
  if(!container) return;

  let data = [];
  try { data = await loadJSON('data/narratives.json'); }
  catch(e){ container.innerHTML = `<p class="badge">No narratives found.</p>`; return; }

  container.innerHTML = data.map(n => `
    <article class="card" style="margin:1rem 0;">
      <img class="thumb" src="${pickImg(n)}" alt="" loading="lazy" referrerpolicy="no-referrer"
           onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
      <div style="padding:1rem">
        <h3 style="margin:.3rem 0">${n.title}</h3>
        <div class="meta"><span class="badge">${n.category || 'General'}</span></div>
        ${n.summary ? `<p>${n.summary}</p>` : ``}
      </div>
    </article>
  `).join('');
}

/* ===== Boot ===== */
document.addEventListener('DOMContentLoaded', () => {
  initFeeds();
  initNarrativesPage();
});
