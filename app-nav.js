const APP_LANGUAGES = [
  ["uk", "Українська"],
  ["ru", "Русский"],
  ["kk", "Қазақша"],
  ["pl", "Polski"],
  ["ro", "Română"],
  ["en", "English"],
  ["de", "Deutsch"],
  ["fr", "Français"],
  ["pt", "Português"],
  ["es", "Español"],
  ["it", "Italiano"]
];

const I18N = {
  uk: {
    navHome: "Додому", navTrade: "Торгівля", navAssets: "Активи", navLearning: "Навчання", navInfo: "Інфо",
    install: "Встановити додаток на головний екран", home: "Додому", trade: "Торгівля", assets: "Активи",
    learning: "Навчання криптовалютам", info: "Про проєкт", deposit: "Поповнення", withdraw: "Виведення коштів",
    profile: "Дані користувача", logout: "Вийти", balance: "Баланс", wallet: "Гаманець", userData: "Дані користувача",
    addFunds: "Поповнити", withdrawShort: "Вивести", mainBalance: "Основний баланс", operationHistory: "Історія операцій і винагород",
    pool: "Загальний пул", dailyChange: "Добова зміна", readLesson: "Прочитайте короткий урок і дайте правильну відповідь. Кожен тест можна пройти один раз.",
    reward10: "Винагорода становить 10 доларів", check: "Перевірити", mainTrade: "Основна торгівля",
    tradeButton: "Торгувати", locked: "Заблоковано", availableAll: "Доступна всім користувачам",
    project: "United Ukraine", market: "Ринок", copy: "Скопійовано", back: "Назад"
  },
  ru: {
    navHome: "Домой", navTrade: "Торговля", navAssets: "Активы", navLearning: "Обучение", navInfo: "Инфо",
    install: "Установить приложение на главный экран", home: "Домой", trade: "Торговля", assets: "Активы",
    learning: "Обучение криптовалютам", info: "О проекте", deposit: "Пополнение", withdraw: "Вывод средств",
    profile: "Данные пользователя", logout: "Выйти", balance: "Баланс", wallet: "Кошелек", userData: "Данные пользователя",
    addFunds: "Пополнить", withdrawShort: "Вывести", mainBalance: "Основной баланс", operationHistory: "История операций и наград",
    pool: "Общий пул", dailyChange: "Суточное изменение", readLesson: "Прочитайте короткий урок и дайте правильный ответ. Каждый тест можно пройти один раз.",
    reward10: "Вознаграждение составляет 10 долларов", check: "Проверить", mainTrade: "Основная торговля",
    tradeButton: "Торговать", locked: "Заблокировано", availableAll: "Доступно всем пользователям",
    project: "United Ukraine", market: "Рынок", copy: "Скопировано", back: "Назад"
  },
  kk: {
    navHome: "Басты бет", navTrade: "Сауда", navAssets: "Активтер", navLearning: "Оқу", navInfo: "Ақпарат",
    install: "Қолданбаны басты экранға орнату", home: "Басты бет", trade: "Сауда", assets: "Активтер",
    learning: "Криптовалюта бойынша оқу", info: "Жоба туралы", deposit: "Толықтыру", withdraw: "Шығару",
    profile: "Пайдаланушы деректері", logout: "Шығу", balance: "Баланс", wallet: "Әмиян", userData: "Пайдаланушы деректері",
    addFunds: "Толықтыру", withdrawShort: "Шығару", mainBalance: "Негізгі баланс", operationHistory: "Операциялар мен сыйақылар тарихы",
    pool: "Жалпы пул", dailyChange: "Күндік өзгеріс", readLesson: "Қысқа сабақты оқып, дұрыс жауап беріңіз. Әр тестті бір рет өтуге болады.",
    reward10: "Сыйақы 10 доллар", check: "Тексеру", mainTrade: "Негізгі сауда",
    tradeButton: "Саудалау", locked: "Бұғатталған", availableAll: "Барлық пайдаланушыларға қолжетімді",
    project: "United Ukraine", market: "Нарық", copy: "Көшірілді", back: "Артқа"
  },
  pl: {
    navHome: "Start", navTrade: "Handel", navAssets: "Aktywa", navLearning: "Nauka", navInfo: "Info",
    install: "Zainstaluj aplikację na ekranie głównym", home: "Start", trade: "Handel", assets: "Aktywa",
    learning: "Nauka kryptowalut", info: "O projekcie", deposit: "Wpłata", withdraw: "Wypłata",
    profile: "Dane użytkownika", logout: "Wyloguj", balance: "Saldo", wallet: "Portfel", userData: "Dane użytkownika",
    addFunds: "Wpłać", withdrawShort: "Wypłać", mainBalance: "Saldo główne", operationHistory: "Historia operacji i nagród",
    pool: "Pula ogólna", dailyChange: "Zmiana dzienna", readLesson: "Przeczytaj krótki materiał i wybierz poprawną odpowiedź. Każdy test można ukończyć raz.",
    reward10: "Nagroda wynosi 10 dolarów", check: "Sprawdź", mainTrade: "Handel główny",
    tradeButton: "Handluj", locked: "Zablokowane", availableAll: "Dostępne dla wszystkich użytkowników",
    project: "United Ukraine", market: "Rynek", copy: "Skopiowano", back: "Wstecz"
  },
  ro: {
    navHome: "Acasă", navTrade: "Tranzacții", navAssets: "Active", navLearning: "Învățare", navInfo: "Info",
    install: "Instalează aplicația pe ecranul principal", home: "Acasă", trade: "Tranzacții", assets: "Active",
    learning: "Învățare despre criptomonede", info: "Despre proiect", deposit: "Depunere", withdraw: "Retragere",
    profile: "Date utilizator", logout: "Ieșire", balance: "Sold", wallet: "Portofel", userData: "Date utilizator",
    addFunds: "Depune", withdrawShort: "Retrage", mainBalance: "Sold principal", operationHistory: "Istoricul operațiunilor și recompenselor",
    pool: "Fond total", dailyChange: "Schimbare zilnică", readLesson: "Citește lecția scurtă și alege răspunsul corect. Fiecare test poate fi făcut o singură dată.",
    reward10: "Recompensa este de 10 dolari", check: "Verifică", mainTrade: "Tranzacție principală",
    tradeButton: "Tranzacționează", locked: "Blocat", availableAll: "Disponibil tuturor utilizatorilor",
    project: "United Ukraine", market: "Piață", copy: "Copiat", back: "Înapoi"
  },
  en: {
    navHome: "Home", navTrade: "Trade", navAssets: "Assets", navLearning: "Learning", navInfo: "Info",
    install: "Install the app on the home screen", home: "Home", trade: "Trading", assets: "Assets",
    learning: "Cryptocurrency Learning", info: "About the project", deposit: "Deposit", withdraw: "Withdraw",
    profile: "User data", logout: "Log out", balance: "Balance", wallet: "Wallet", userData: "User data",
    addFunds: "Deposit", withdrawShort: "Withdraw", mainBalance: "Main balance", operationHistory: "Operations and rewards history",
    pool: "Total pool", dailyChange: "Daily change", readLesson: "Read the short lesson and choose the correct answer. Each test can be completed once.",
    reward10: "The reward is 10 dollars", check: "Check", mainTrade: "Main trading",
    tradeButton: "Trade", locked: "Locked", availableAll: "Available to all users",
    project: "United Ukraine", market: "Market", copy: "Copied", back: "Back"
  },
  de: {
    navHome: "Start", navTrade: "Handel", navAssets: "Aktiva", navLearning: "Lernen", navInfo: "Info",
    install: "App zum Startbildschirm hinzufügen", home: "Start", trade: "Handel", assets: "Aktiva",
    learning: "Kryptowährungen lernen", info: "Über das Projekt", deposit: "Einzahlung", withdraw: "Auszahlung",
    profile: "Benutzerdaten", logout: "Abmelden", balance: "Saldo", wallet: "Wallet", userData: "Benutzerdaten",
    addFunds: "Einzahlen", withdrawShort: "Auszahlen", mainBalance: "Hauptsaldo", operationHistory: "Verlauf von Vorgängen und Belohnungen",
    pool: "Gesamtpool", dailyChange: "Tagesänderung", readLesson: "Lesen Sie die kurze Lektion und wählen Sie die richtige Antwort. Jeder Test kann einmal abgeschlossen werden.",
    reward10: "Die Belohnung beträgt 10 Dollar", check: "Prüfen", mainTrade: "Haupthandel",
    tradeButton: "Handeln", locked: "Gesperrt", availableAll: "Für alle Benutzer verfügbar",
    project: "United Ukraine", market: "Markt", copy: "Kopiert", back: "Zurück"
  },
  fr: {
    navHome: "Accueil", navTrade: "Trading", navAssets: "Actifs", navLearning: "Formation", navInfo: "Infos",
    install: "Installer l'application sur l'écran d'accueil", home: "Accueil", trade: "Trading", assets: "Actifs",
    learning: "Formation crypto", info: "À propos du projet", deposit: "Dépôt", withdraw: "Retrait",
    profile: "Données utilisateur", logout: "Déconnexion", balance: "Solde", wallet: "Portefeuille", userData: "Données utilisateur",
    addFunds: "Déposer", withdrawShort: "Retirer", mainBalance: "Solde principal", operationHistory: "Historique des opérations et récompenses",
    pool: "Pool total", dailyChange: "Variation quotidienne", readLesson: "Lisez la courte leçon et choisissez la bonne réponse. Chaque test ne peut être terminé qu'une fois.",
    reward10: "La récompense est de 10 dollars", check: "Vérifier", mainTrade: "Trading principal",
    tradeButton: "Trader", locked: "Verrouillé", availableAll: "Disponible pour tous les utilisateurs",
    project: "United Ukraine", market: "Marché", copy: "Copié", back: "Retour"
  },
  pt: {
    navHome: "Início", navTrade: "Negociação", navAssets: "Ativos", navLearning: "Aprendizado", navInfo: "Info",
    install: "Instalar o app na tela inicial", home: "Início", trade: "Negociação", assets: "Ativos",
    learning: "Aprendizado sobre criptomoedas", info: "Sobre o projeto", deposit: "Depósito", withdraw: "Retirada",
    profile: "Dados do usuário", logout: "Sair", balance: "Saldo", wallet: "Carteira", userData: "Dados do usuário",
    addFunds: "Depositar", withdrawShort: "Retirar", mainBalance: "Saldo principal", operationHistory: "Histórico de operações e recompensas",
    pool: "Pool total", dailyChange: "Mudança diária", readLesson: "Leia a lição curta e escolha a resposta correta. Cada teste pode ser concluído uma vez.",
    reward10: "A recompensa é de 10 dólares", check: "Verificar", mainTrade: "Negociação principal",
    tradeButton: "Negociar", locked: "Bloqueado", availableAll: "Disponível para todos os usuários",
    project: "United Ukraine", market: "Mercado", copy: "Copiado", back: "Voltar"
  },
  es: {
    navHome: "Inicio", navTrade: "Trading", navAssets: "Activos", navLearning: "Aprendizaje", navInfo: "Info",
    install: "Instalar la app en la pantalla principal", home: "Inicio", trade: "Trading", assets: "Activos",
    learning: "Aprendizaje de criptomonedas", info: "Sobre el proyecto", deposit: "Depósito", withdraw: "Retiro",
    profile: "Datos del usuario", logout: "Salir", balance: "Saldo", wallet: "Billetera", userData: "Datos del usuario",
    addFunds: "Depositar", withdrawShort: "Retirar", mainBalance: "Saldo principal", operationHistory: "Historial de operaciones y recompensas",
    pool: "Pool total", dailyChange: "Cambio diario", readLesson: "Lee la lección corta y elige la respuesta correcta. Cada prueba se puede completar una vez.",
    reward10: "La recompensa es de 10 dólares", check: "Comprobar", mainTrade: "Trading principal",
    tradeButton: "Operar", locked: "Bloqueado", availableAll: "Disponible para todos los usuarios",
    project: "United Ukraine", market: "Mercado", copy: "Copiado", back: "Atrás"
  },
  it: {
    navHome: "Home", navTrade: "Trading", navAssets: "Asset", navLearning: "Formazione", navInfo: "Info",
    install: "Installa l'app sulla schermata principale", home: "Home", trade: "Trading", assets: "Asset",
    learning: "Formazione sulle criptovalute", info: "Informazioni sul progetto", deposit: "Deposito", withdraw: "Prelievo",
    profile: "Dati utente", logout: "Esci", balance: "Saldo", wallet: "Wallet", userData: "Dati utente",
    addFunds: "Deposita", withdrawShort: "Preleva", mainBalance: "Saldo principale", operationHistory: "Storico operazioni e ricompense",
    pool: "Pool totale", dailyChange: "Variazione giornaliera", readLesson: "Leggi la breve lezione e scegli la risposta corretta. Ogni test può essere completato una sola volta.",
    reward10: "La ricompensa è di 10 dollari", check: "Controlla", mainTrade: "Trading principale",
    tradeButton: "Fai trading", locked: "Bloccato", availableAll: "Disponibile per tutti gli utenti",
    project: "United Ukraine", market: "Mercato", copy: "Copiato", back: "Indietro"
  }
};

const TEXT_KEYS = {
  "Додому": "home",
  "Торгівля": "trade",
  "Торгівля криптовалютами": "trade",
  "Активи": "assets",
  "Навчання": "navLearning",
  "Навчання криптовалютам": "learning",
  "Інфо": "navInfo",
  "Про проєкт": "info",
  "Поповнення": "deposit",
  "Виведення коштів": "withdraw",
  "Дані користувача": "userData",
  "Поповнити": "addFunds",
  "Вивести": "withdrawShort",
  "Вийти": "logout",
  "Основний баланс": "mainBalance",
  "Історія операцій і винагород": "operationHistory",
  "Загальний пул": "pool",
  "Добова зміна": "dailyChange",
  "Винагорода становить 10 доларів": "reward10",
  "Перевірити": "check",
  "Основна торгівля": "mainTrade",
  "Ринок": "market",
  "Торгувати": "tradeButton",
  "Заблоковано": "locked",
  "Доступна всім користувачам": "availableAll",
  "Назад": "back"
};

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

function currentLang() {
  const saved = localStorage.getItem("app_language") || "uk";
  return I18N[saved] ? saved : "uk";
}

function tr(key) {
  return (I18N[currentLang()] && I18N[currentLang()][key]) || I18N.uk[key] || key;
}

function applyTranslations(root = document.body) {
  const lang = currentLang();
  document.documentElement.lang = lang;
  if (lang === "uk") return;

  root.querySelectorAll("[data-i18n]").forEach(element => {
    element.textContent = tr(element.dataset.i18n);
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
    element.setAttribute("placeholder", tr(element.dataset.i18nPlaceholder));
  });

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (["SCRIPT", "STYLE", "TEXTAREA", "OPTION"].includes(node.parentElement?.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const text = node.nodeValue.trim();
    const key = TEXT_KEYS[text];
    if (key) node.nodeValue = node.nodeValue.replace(text, tr(key));
  });
}

function renderLanguageSelector() {
  const select = document.createElement("select");
  select.className = "language-select";
  select.setAttribute("aria-label", "Language");
  select.innerHTML = APP_LANGUAGES.map(([code, label]) => `<option value="${code}">${label}</option>`).join("");
  select.value = currentLang();
  select.addEventListener("change", () => {
    localStorage.setItem("app_language", select.value);
    setTranslateCookie(select.value);
    location.reload();
  });
  return select;
}

function setTranslateCookie(lang) {
  const value = lang === "uk" ? "/uk/uk" : `/uk/${GOOGLE_LANG_CODES[lang] || "uk"}`;
  document.cookie = `googtrans=${value};path=/;max-age=31536000;SameSite=Lax`;
  const host = location.hostname.split(".").slice(-2).join(".");
  if (host && host.includes(".")) {
    document.cookie = `googtrans=${value};path=/;domain=.${host};max-age=31536000;SameSite=Lax`;
  }
}

function loadFullPageTranslator() {
  const lang = currentLang();
  setTranslateCookie(lang);
  if (lang === "uk") return;
  if (document.getElementById("google_translate_element")) return;

  const holder = document.createElement("div");
  holder.id = "google_translate_element";
  holder.style.cssText = "position:absolute;left:-9999px;top:-9999px;height:0;overflow:hidden;";
  document.body.append(holder);

  window.googleTranslateElementInit = () => {
    new google.translate.TranslateElement({
      pageLanguage: "uk",
      includedLanguages: APP_LANGUAGES.map(([code]) => GOOGLE_LANG_CODES[code]).filter(Boolean).join(","),
      autoDisplay: false
    }, "google_translate_element");
  };

  const script = document.createElement("script");
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.head.append(script);
}

function renderInstallButton() {
  const current = location.pathname.split("/").pop() || "index.html";
  if (current !== "index.html") return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "install-app-btn";
  button.textContent = tr("install");
  button.addEventListener("click", async () => {
    if (!window.deferredInstallPrompt) return;
    window.deferredInstallPrompt.prompt();
    await window.deferredInstallPrompt.userChoice.catch(() => {});
    window.deferredInstallPrompt = null;
    button.classList.remove("visible");
  });
  const show = () => button.classList.add("visible");
  if (window.deferredInstallPrompt) show();
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    window.deferredInstallPrompt = event;
    show();
  });
  document.body.insertBefore(button, document.body.firstElementChild?.nextSibling || null);
}

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
    <button type="button" aria-label="${tr("home")}">
      <img src="logo.png" alt="United Ukraine">
    </button>
  `;
  brand.querySelector("button").addEventListener("click", () => location.href = "index.html");
  brand.append(renderLanguageSelector());
  document.body.prepend(brand);
  renderInstallButton();

  if (document.body.dataset.noNav !== "true") {
    const items = [
      ["index.html", "🏠", "navHome"],
      ["trade.html", "📊", "navTrade"],
      ["assets.html", "💼", "navAssets"],
      ["learning.html", "🎓", "navLearning"],
      ["info.html", "ℹ️", "navInfo"]
    ];
    const current = location.pathname.split("/").pop() || "index.html";
    const nav = document.createElement("nav");
    nav.className = "app-navbar";
    nav.setAttribute("aria-label", "Основна навігація");
    nav.innerHTML = items.map(([href, icon, key]) => `
      <a class="app-nav-item${current === href ? " active" : ""}" href="${href}">
        <span class="app-nav-icon">${icon}</span>
        <span>${tr(key)}</span>
      </a>
    `).join("");
    document.body.append(nav);
  }

  applyTranslations();
  loadFullPageTranslator();
});

window.appTranslate = { tr, applyTranslations, currentLang };
