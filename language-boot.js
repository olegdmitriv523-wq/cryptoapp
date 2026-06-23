(function () {
  const GOOGLE_LANG_CODES = {
    uk: "uk",
    ru: "ru",
    kk: "kk",
    pl: "pl",
    ro: "ro",
    en: "en",
    de: "de",
    fr: "fr",
    pt: "pt",
    es: "es",
    it: "it"
  };

  function savedLanguage() {
    try {
      const lang = localStorage.getItem("app_language") || "uk";
      return GOOGLE_LANG_CODES[lang] ? lang : "uk";
    } catch {
      return "uk";
    }
  }

  function setTranslateCookie(lang) {
    const value = lang === "uk" ? "/uk/uk" : `/uk/${GOOGLE_LANG_CODES[lang] || "uk"}`;
    document.cookie = `googtrans=${value};path=/;max-age=31536000;SameSite=Lax`;
    const host = location.hostname.split(".").slice(-2).join(".");
    if (host && host.includes(".")) {
      document.cookie = `googtrans=${value};path=/;domain=.${host};max-age=31536000;SameSite=Lax`;
    }
  }

  const lang = savedLanguage();
  const page = location.pathname.split("/").pop() || "index.html";
  document.documentElement.lang = lang;
  setTranslateCookie(lang);
  try {
    if (page !== "loading.html" && (lang !== "uk" || sessionStorage.getItem("language_switching") === "1")) {
      document.documentElement.classList.add("app-language-pending");
    }
  } catch {
    if (page !== "loading.html" && lang !== "uk") document.documentElement.classList.add("app-language-pending");
  }

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    window.deferredInstallPrompt = event;
    window.dispatchEvent(new CustomEvent("pwa-install-ready"));
  });
})();
