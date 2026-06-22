document.addEventListener("DOMContentLoaded", () => {
  const headLinks = [
    ["manifest", "manifest.json"],
    ["icon", "logo.png"],
    ["apple-touch-icon", "logo.png"]
  ];
  headLinks.forEach(([rel, href]) => {
    if (!document.head.querySelector(`link[rel="${rel}"]`)) {
      const link = document.createElement("link");
      link.rel = rel;
      link.href = href;
      document.head.append(link);
    }
  });
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js").catch(() => {});

  document.querySelectorAll(".logo, .navbar, .app-navbar, .site-brand").forEach(element => element.remove());

  const brand = document.createElement("header");
  brand.className = "site-brand";
  brand.innerHTML = `
    <button type="button" aria-label="На головну">
      <img src="logo.png" alt="United Ukraine">
    </button>
  `;
  brand.querySelector("button").addEventListener("click", () => location.href = "index.html");
  document.body.prepend(brand);

  if (document.body.dataset.noNav === "true") return;

  const items = [
    ["index.html", "🏠", "Додому"],
    ["trade.html", "📊", "Торгівля"],
    ["assets.html", "💼", "Активи"],
    ["learning.html", "🎓", "Навчання"],
    ["info.html", "ℹ️", "Інфо"]
  ];
  const current = location.pathname.split("/").pop() || "index.html";
  const nav = document.createElement("nav");
  nav.className = "app-navbar";
  nav.setAttribute("aria-label", "Основна навігація");
  nav.innerHTML = items.map(([href, icon, label]) => `
    <a class="app-nav-item${current === href ? " active" : ""}" href="${href}">
      <span class="app-nav-icon">${icon}</span>
      <span>${label}</span>
    </a>
  `).join("");
  document.body.append(nav);
});
