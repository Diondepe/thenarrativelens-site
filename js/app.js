const $ = (s, r=document) => r.querySelector(s);

const HOME_LIMIT = 6;     // how many items to show on the homepage
const FEEDS_LIMIT = 50;   // how many items to show on feeds.html

async function loadJSON(path){
  const r = await fetch(path, { cache: 'no-store' });
  if (!r.ok) throw new Error(`Failed to fetch ${path}: ${r.status}`);
  return r.json();
}

function itemCardHTML(item){
  return `
    <article class="card" style="margin:1rem 0;padding:1rem">
      <h3 style="margin:.2rem 0 0">${item.title}</h3>
      <div class="meta"><span class="badge">${item.source}</span><span>${new Date(item.published).toLocaleString()}</span></div>
      ${item.image_url ? `<img src="${item.image_url}" alt="" style="width:100%;height:auto;border-radius:10px;margin:.5rem 0">` : ''}
      <p>${item.summary ?? ''}</p>
      <a class="btn" href="${item.url}" target="_blank" rel="noopener">Read source</a>
    </article>
  `;
}

function itemTeaserHTML(item){
  return `
    <a href="${item.url}" target="_blank" rel="noopener" class="teaser-card">
      ${item.image_url ? `<img class="teaser-thumb" src="${item.image_url}" alt="">` : ''}
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
