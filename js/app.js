// Load feeds
async function loadFeeds() {
  const container = document.getElementById('feeds-list');
  if (!container) return;

  try {
    const res = await fetch('data/feeds.json');
    const feeds = await res.json();

    feeds.forEach(f => {
      const card = document.createElement('article');
      card.className = 'card';

      card.innerHTML = `
        ${f.image_url ? `<img class="thumb" src="${f.image_url}" alt="${f.title}">` : ""}
        <h2><a href="${f.url}" target="_blank">${f.title}</a></h2>
        <p>${f.summary || ""}</p>
        <small>${f.source} · ${new Date(f.published).toLocaleDateString()}</small>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading feeds:', err);
  }
}
loadFeeds();

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

// Load featured narratives on home
async function loadFeaturedNarratives() {
  const container = document.getElementById('featured-narratives');
  if (!container) return;

  try {
    const res = await fetch('data/narratives.json');
    const narratives = await res.json();

    // Take first 3 as featured
    narratives.slice(0, 3).forEach(n => {
      const card = document.createElement('article');
      card.className = 'card';

      card.innerHTML = `
        ${n.image_url ? `<img class="thumb" src="${n.image_url}" alt="${n.title}">` : ""}
        <h3>${n.title}</h3>
        <p>${n.summary}</p>
        <small>${n.category}</small>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading featured narratives:', err);
  }
}
loadFeaturedNarratives();
