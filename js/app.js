/* ===== Helpers ===== */
const FALLBACK_IMG = 'assets/og-image.png';

async function loadJSON(path){
  const r = await fetch(path, { cache: 'no-store' });
  if(!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
}

function imgOf(obj){
  return obj.thumb_url || obj.image_url || FALLBACK_IMG;
}

/* ===== Narrative News: Feeds page + Homepage teasers ===== */

function feedCardHTML(item){
  const img = imgOf(item);
  return `
    <article class="card" style="margin:1rem 0;">
      <img class="thumb" src="${img}" alt="" loading="lazy" referrerpolicy="no-referrer"
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
  const img = imgOf(item);
  return `
    <a href="${item.url}" target="_blank" rel="noopener" class="teaser-card">
      <img class="teaser-thumb" src="${img}" alt="" loading="lazy" referrerpolicy="no-referrer"
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
    // Full cards with uniform thumb on feeds page
    feedsHolder.innerHTML = data.slice(0, 60).map(feedCardHTML).join('');
  }
  if (homeHolder){
    // Compact teasers on homepage
    homeHolder.innerHTML = data.slice(0, 9).map(teaserHTML).join('');
  }
}

/* ===== Narratives: Full page + Featured on home ===== */

async function initNarrativesPage(){
  const container = document.getElementById('narratives-list');
  if(!container) return;

  let data = [];
  try { data = await loadJSON('data/narratives.json'); }
  catch(e){ container.innerHTML = `<p class="badge">No narratives found.</p>`; return; }

  container.innerHTML = data.map(n => `
    <article class="card" style="margin:1rem 0;">
      <img class="thumb" src="${imgOf(n)}" alt="" loading="lazy" referrerpolicy="no-referrer"
           onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
      <div style="padding:1rem">
        <h3 class="narr-title">${n.title}</h3>
        <div class="meta"><span class="badge">${n.category || 'General'}</span></div>
        ${n.summary ? `<p class="narr-desc">${n.summary}</p>` : ``}
      </div>
    </article>
  `).join('');
}

async function initFeaturedNarratives(){
  const container = document.getElementById('featured-narratives');
  const shuffleBtn = document.getElementById('shuffle-narratives');
  if(!container) return;

  let data = [];
  try { data = await loadJSON('data/narratives.json'); }
  catch(e){ console.error('narratives.json', e); return; }

  const renderRandom = () => {
    container.classList.remove('show'); // fade out
    setTimeout(() => {
      container.innerHTML = '';
      const shuffled = data.slice().sort(() => 0.5 - Math.random());
      shuffled.slice(0,3).forEach(n => {
        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = `
          <img class="thumb" src="${imgOf(n)}" alt="" loading="lazy" referrerpolicy="no-referrer"
               onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
          <div style="padding:1rem">
            <h3 class="narr-title" style="margin:.3rem 0">${n.title}</h3>
            ${n.summary ? `<p class="narr-desc">${n.summary}</p>` : ``}
            <div class="meta"><span class="badge">${n.category || 'General'}</span></div>
          </div>
        `;
        container.appendChild(card);
      });
      container.classList.add('show'); // fade in
    }, 400);
  };

  // first render
  renderRandom();

  if (shuffleBtn){
    shuffleBtn.addEventListener('click', renderRandom);
  }
}

/* ===== Boot ===== */
document.addEventListener('DOMContentLoaded', () => {
  initFeeds();               // homepage teasers + feeds page cards
  initNarrativesPage();      // narratives page
  initFeaturedNarratives();  // homepage featured narratives
});
