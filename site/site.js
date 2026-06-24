(function () {
  const LANGUAGES = [
    ["en", "English"], ["uk", "Українська"], ["ru", "Русский"], ["kk", "Қазақша"],
    ["pl", "Polski"], ["ro", "Română"], ["de", "Deutsch"], ["fr", "Français"],
    ["pt", "Português"], ["es", "Español"], ["it", "Italiano"]
  ];
  const GOOGLE_CODES = { en: "en", uk: "uk", ru: "ru", kk: "kk", pl: "pl", ro: "ro", de: "de", fr: "fr", pt: "pt", es: "es", it: "it" };
  const CURRENCY = /(\$\s?[\d,.]+|[\d,.]+\s?\$|USD|USDT|TRC20|BTC|ETH|BNB|SOL|XRP|ADA|DOGE|UEC)/gi;
  const CACHE_PREFIX = "uec_site_translation_";
  const SPLIT = "[[UEC_SITE_SPLIT]]";
  const select = document.getElementById("languageSelect");
  const overlay = document.getElementById("translateScreen");
  let trackedNodes = [];

  function currentLang() {
    const saved = localStorage.getItem("site_language") || localStorage.getItem("app_language") || "en";
    return GOOGLE_CODES[saved] ? saved : "en";
  }

  function setLanguage(lang) {
    localStorage.setItem("site_language", lang);
    localStorage.setItem("app_language", lang);
    document.documentElement.lang = lang;
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
      const key = `__UEC_${values.length}__`;
      values.push(match);
      return key;
    });
    return { safe, values };
  }

  function restore(text, values) {
    return values.reduce((result, value, index) => result.replaceAll(`__UEC_${index}__`, value), text);
  }

  function shouldTranslate(value) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    if (text.length < 2) return false;
    if (/^[\d\s.,:+/%$€£¥#xX-]+$/.test(text)) return false;
    if (/^(USD|USDT|TRC20|BTC|ETH|BNB|SOL|XRP|ADA|DOGE|UEC)$/i.test(text)) return false;
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
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) throw new Error("translation failed");
    const data = await response.json();
    const translated = (data?.[0] || []).map(part => part?.[0] || "").join("");
    const parts = translated.split(SPLIT).map(part => part.trim());
    return items.map((original, index) => restore(parts[index] || original, protectedItems[index].values));
  }

  async function applyLanguage(lang) {
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
      const originals = [...new Set(nodes.map(item => item.original))];
      const missing = originals.filter(text => !store[text]);
      for (let i = 0; i < missing.length; i += 24) {
        const chunk = missing.slice(i, i + 24);
        const translated = await translateBatch(chunk, lang);
        chunk.forEach((text, index) => { store[text] = translated[index] || text; });
      }
      saveCache(lang, store);
      nodes.forEach(({ node, original }) => {
        if (store[original]) node.nodeValue = store[original];
      });
    } catch {
      alert("Translation is temporarily unavailable. Please try again.");
    } finally {
      overlay.classList.remove("visible");
    }
  }

  function init() {
    select.innerHTML = LANGUAGES.map(([code, label]) => `<option value="${code}">${label}</option>`).join("");
    select.addEventListener("change", () => applyLanguage(select.value));
    collectTrackedNodes();
    applyLanguage(currentLang());
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  }

  document.addEventListener("DOMContentLoaded", init);
})();
