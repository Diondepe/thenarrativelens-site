(function(){
  async function inject(id, url, after){
    const host = document.getElementById(id);
    if(!host) return;
    const res = await fetch(url, { cache: 'no-store' });
    host.innerHTML = await res.text();
    if (after) after();
  }

  function setActive(){
    const key = (document.body.dataset.page || '').toLowerCase();
    const link = document.querySelector(`#site-nav [data-key="${key}"]`);
    if (link) link.setAttribute('aria-current','page');
  }

  inject('site-header','partials/header.html', setActive);
  inject('site-footer','partials/footer.html');
})();
