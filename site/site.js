(function () {
  const LANGUAGES = [
    ["en", "English"], ["ru", "Русский"], ["uk", "Українська"], ["es", "Español"]
  ];
  const GOOGLE_CODES = { en: "en", uk: "uk", ru: "ru", es: "es" };
  const PAGE_TITLES = {
    en: "CryptoStar | Public Website",
    ru: "CryptoStar | Публичный сайт",
    uk: "CryptoStar | Публічний сайт",
    es: "CryptoStar | Sitio público"
  };
  const CURRENCY = /(\$\s?[\d,.]+|[\d,.]+\s?\$|USD|USDT|TRC20|BTC|ETH|BNB|SOL|XRP|ADA|DOGE)/gi;
  const CACHE_PREFIX = "cryptostar_site_translation_";
  const SPLIT = "[[CRYPTOSTAR_SITE_SPLIT]]";
  const select = document.getElementById("languageSelect");
  const overlay = document.getElementById("translateScreen");
  let trackedNodes = [];
  let translationRun = 0;

  function currentLang() {
    if (localStorage.getItem("cryptostar_language_default_v1") !== "1") {
      if (!localStorage.getItem("site_language") || localStorage.getItem("site_language") === "ru") localStorage.setItem("site_language", "en");
      if (!localStorage.getItem("app_language") || localStorage.getItem("app_language") === "ru") localStorage.setItem("app_language", "en");
      localStorage.setItem("cryptostar_language_default_v1", "1");
    }
    const saved = localStorage.getItem("site_language") || localStorage.getItem("app_language") || "en";
    return GOOGLE_CODES[saved] ? saved : "en";
  }

  function setLanguage(lang) {
    localStorage.setItem("site_language", lang);
    localStorage.setItem("app_language", lang);
    document.documentElement.lang = lang;
    document.title = PAGE_TITLES[lang] || PAGE_TITLES.en;
    select.setAttribute("aria-label", ({ en: "Language", ru: "Язык", uk: "Мова", es: "Idioma" })[lang] || "Language");
  }

  function cache(lang) {
    try { return JSON.parse(localStorage.getItem(CACHE_PREFIX + lang) || "{}"); } catch { return {}; }
  }

  function saveCache(lang, data) {
    try { localStorage.setItem(CACHE_PREFIX + lang, JSON.stringify(Object.fromEntries(Object.entries(data).slice(-900)))); } catch {}
  }

  function protect(text) {
    const values = [];
    const safe = text.replace(CURRENCY, match => {
      const key = `__CRYPTOSTAR_${values.length}__`;
      values.push(match);
      return key;
    });
    return { safe, values };
  }

  function restore(text, values) {
    return values.reduce((result, value, index) => result.replaceAll(`__CRYPTOSTAR_${index}__`, value), text);
  }

  function shouldTranslate(value) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    if (text.length < 2) return false;
    if (/^[\d\s.,:+/%$€£¥#xX-]+$/.test(text)) return false;
    if (/^(USD|USDT|TRC20|BTC|ETH|BNB|SOL|XRP|ADA|DOGE)$/i.test(text)) return false;
    return /[A-Za-z]/.test(text);
  }

  function textNodes() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!shouldTranslate(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || ["SCRIPT", "STYLE", "SELECT", "OPTION"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (parent.closest(".notranslate,[translate='no'],.translate-screen")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  }

  function translatableAttributes() {
    const items = [];
    document.querySelectorAll("[placeholder], [title], [aria-label], img[alt]").forEach(element => {
      if (element.closest(".notranslate,[translate='no'],.translate-screen")) return;
      ["placeholder", "title", "aria-label", "alt"].forEach(name => {
        const value = element.getAttribute(name);
        const key = `data-cryptostar-site-original-${name}`;
        const original = element.getAttribute(key) || value;
        if (original) element.setAttribute(key, original);
        if (shouldTranslate(original)) items.push({ element, name, original });
      });
    });
    return items;
  }

  function collectTrackedNodes() {
    const known = new Set(trackedNodes.map(item => item.node));
    for (const node of textNodes()) {
      if (!known.has(node)) trackedNodes.push({ node, original: node.nodeValue });
    }
    return trackedNodes.filter(item => item.node.isConnected && shouldTranslate(item.original));
  }

  async function translateBatch(items, lang) {
    const protectedItems = items.map(protect);
    const joined = protectedItems.map(item => item.safe).join(`\n${SPLIT}\n`);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(GOOGLE_CODES[lang])}&dt=t&q=${encodeURIComponent(joined)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);
    try {
      const response = await fetch(url, { cache: "force-cache", signal: controller.signal });
      if (!response.ok) throw new Error("translation failed");
      const data = await response.json();
      const translated = (data?.[0] || []).map(part => part?.[0] || "").join("");
      const parts = translated.split(SPLIT).map(part => part.trim());
      return items.map((original, index) => restore(parts[index] || original, protectedItems[index].values));
    } finally {
      clearTimeout(timeout);
    }
  }

  async function applyLanguage(lang) {
    const run = ++translationRun;
    setLanguage(lang);
    select.value = lang;
    if (lang === "en") {
      collectTrackedNodes().forEach(({ node, original }) => { node.nodeValue = original; });
      return;
    }
    overlay.classList.add("visible");
    try {
      const store = cache(lang);
      const nodes = collectTrackedNodes();
      const attributes = translatableAttributes();
      const originals = [...new Set([...nodes.map(item => item.original), ...attributes.map(item => item.original)])];
      const missing = originals.filter(text => !store[text]);
      for (let i = 0; i < missing.length; i += 24) {
        const chunk = missing.slice(i, i + 24);
        const translated = await translateBatch(chunk, lang);
      if (run !== translationRun) return;
        chunk.forEach((text, index) => { store[text] = translated[index] || text; });
      }
      saveCache(lang, store);
      nodes.forEach(({ node, original }) => {
        if (run !== translationRun) return;
        if (store[original]) node.nodeValue = store[original];
      });
      attributes.forEach(({ element, name, original }) => {
        if (run !== translationRun) return;
        if (store[original]) element.setAttribute(name, store[original]);
      });
    } catch {
      // The default page is already English, so a failed optional translation must not block the page.
    } finally {
      if (run === translationRun) overlay.classList.remove("visible");
    }
  }

  function init() {
    select.innerHTML = LANGUAGES.map(([code, label]) => `<option value="${code}">${label}</option>`).join("");
    select.addEventListener("change", () => applyLanguage(select.value));
    collectTrackedNodes();
    applyLanguage(currentLang());
    const observer = new MutationObserver(() => {
      if (currentLang() !== "en") applyLanguage(currentLang());
    });
    observer.observe(document.body, { childList: true, subtree: true });
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  }

  document.addEventListener("DOMContentLoaded", init);
})();
