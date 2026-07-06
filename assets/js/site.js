const currentPath = window.location.pathname.replace(/\/$/, "");

document.querySelectorAll("[data-nav-link]").forEach((link) => {
  const href = new URL(link.getAttribute("href"), window.location.href);
  const hrefPath = href.pathname.replace(/\/$/, "");
  if (hrefPath === currentPath || (hrefPath.endsWith("/call-history-site") && currentPath.endsWith("/call-history-site"))) {
    link.setAttribute("aria-current", "page");
  }
});

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

