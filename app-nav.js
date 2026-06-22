document.addEventListener("DOMContentLoaded", () => {
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
