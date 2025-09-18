
const $ = (s, r=document) => r.querySelector(s);
async function loadJSON(path){ const r = await fetch(path); return r.json(); }

async function renderFeeds(){
  const holder = document.querySelector('#feeds-list');
  if(!holder) return;
  try {
    const data = await loadJSON('/data/feeds.json');
    holder.innerHTML = data.slice(0,50).map(item => `
      <article class="card" style="margin:1rem 0;padding:1rem">
        <h3 style="margin:.2rem 0 0">${item.title}</h3>
        <div class="meta"><span class="badge">${item.source}</span><span>${new Date(item.published).toLocaleString()}</span></div>
        ${item.image_url ? `<img src="${item.image_url}" alt="" style="width:100%;height:auto;border-radius:10px;margin:.5rem 0">` : ''}
        <p>${item.summary ?? ''}</p>
        <a class="btn" href="${item.url}" target="_blank" rel="noopener">Read source</a>
      </article>
    `).join('');
  } catch (e) {
    holder.innerHTML = '<p class="badge">No feed data yet. The hourly workflow will populate /data/feeds.json.</p>';
  }
}
document.addEventListener('DOMContentLoaded', renderFeeds);
