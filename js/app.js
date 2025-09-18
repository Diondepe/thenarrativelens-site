const $ = (s, r=document) => r.querySelector(s);

const HOME_LIMIT = 6;     // how many items to show on the homepage
const FEEDS_LIMIT = 50;   // how many items to show on feeds.html
const FALLBACK_IMG = 'assets/og-image.png'; // simple local fallback

async function loadJSON(path){
  const r = await fetch(path, { cache: 'no-store' });
  if (!r.ok) throw new Error(`Failed to fetch ${path}: ${r.status}`);
  return r.json();
}

function imgFor(item){
  // Prefer a small thumbnail if available, else full image; if none, null
  return item.thumb_url || item.image_url || null;
}

function itemCardHTML(item){
  const img = imgFor(item);
  return `
    <article class="card" style="margin:1rem 0;padding:1rem">
      <h3 style="margin:.2rem 0 0">${item.title}</h3>
      <div class="meta"><span class="badge">${item.source}</span><span>${new Date(item.published).toLocaleString()}</span></div>
      ${
        img
          ? `<img src="${img}" alt="" referrerpolicy="no-referrer"
                 style="width:100%;height:auto;border-radius:10px;margin:.5rem 0;display:block">`
          : ''
      }
      <p>${item.summary ?? ''}</p>
      <a class="btn" href="${item.url}" target="_blank" rel="noopener">Read source</a>
    </article>
  `;
}

function itemTeaserHTML(item){
  const img = (item.thumb_url || item.image_url || 'assets/og-image.png');
  return `
    <a href="${item.url}" target="_blank" rel="noopener" class="teaser-card">
      <img class="teaser-thumb"
           src="${img}"
           alt=""
           loading="lazy"
           referrerpolicy="no-referrer"
           onerror="this.onerror=null;this.src='assets/og-image.png'">
      <div class="teaser-body">
        <div class="meta" style="font-size:.75rem;margin-bottom:.25rem">
          <span class="badge">${item.source}</span>
          <span>${new Date(item.published).toLocaleDateString()}</span>
        </div>
        <h3>${item.title}</h3>
        ${item.summary ? `<p>${item.summary}</p>` : ''}
      </div>
    </a>
  `;
}


async function render(){
  let data;
  try {
    data = await loadJSON('data/feeds.json'); // IMPORTANT: relative path
  } catch (e) {
    console.error('Failed to load data/feeds.json', e);
    return;
  }

  // Feeds page
  const feedsHolder = $('#feeds-list');
  if (feedsHolder){
    feedsHolder.innerHTML = data.slice(0, FEEDS_LIMIT).map(itemCardHTML).join('');
  }

  // Homepage teasers
  const homeHolder = $('#home-feeds');
  if (homeHolder){
    homeHolder.innerHTML = data.slice(0, HOME_LIMIT).map(itemTeaserHTML).join('');
  }
}

document.addEventListener('DOMContentLoaded', render);
// Load narratives
async function loadNarratives() {
  const container = document.getElementById('narratives-list');
  if (!container) return;

  try {
    const res = await fetch('data/narratives.json');
    const narratives = await res.json();

    narratives.forEach(n => {
      const card = document.createElement('article');
      card.className = 'card';

      card.innerHTML = `
        ${n.image_url ? `<img class="thumb" src="${n.image_url}" alt="${n.title}">` : ""}
        <h2>${n.title}</h2>
        <p>${n.summary}</p>
        <small>${n.category} · ${new Date(n.published).toLocaleDateString()}</small>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading narratives:', err);
  }
}
loadNarratives();
