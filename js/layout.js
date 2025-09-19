async function loadPartials() {
  // Load header
  const headerRes = await fetch("partials/header.html");
  const headerHtml = await headerRes.text();
  document.getElementById("site-header").innerHTML = headerHtml;

  // Load footer
  const footerRes = await fetch("partials/footer.html");
  const footerHtml = await footerRes.text();
  document.getElementById("site-footer").innerHTML = footerHtml;

  // Highlight active nav item
  const page = document.body.getAttribute("data-page");
  if (page) {
    const activeLink = document.querySelector(`nav a[data-page="${page}"]`);
    if (activeLink) {
      activeLink.setAttribute("aria-current", "page");
    }
  }
}

// Run on page load
document.addEventListener("DOMContentLoaded", loadPartials);
