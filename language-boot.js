(function () {
  const SUPPORTED_LANGUAGES = {
    uk: "uk",
    ru: "ru",
    en: "en",
    es: "es"
  };

  function savedLanguage() {
    try {
      if (localStorage.getItem("cryptostar_language_default_v1") !== "1") {
        if (!localStorage.getItem("app_language") || localStorage.getItem("app_language") === "ru") localStorage.setItem("app_language", "en");
        localStorage.setItem("cryptostar_language_default_v1", "1");
      }
      const lang = localStorage.getItem("app_language") || "en";
      return SUPPORTED_LANGUAGES[lang] ? lang : "en";
    } catch {
    return "en";
    }
  }

  const lang = savedLanguage();
  document.documentElement.lang = lang;

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    window.deferredInstallPrompt = event;
    window.dispatchEvent(new CustomEvent("pwa-install-ready"));
  });
})();
