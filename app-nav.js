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
    navHome: "Додому", navTrade: "Торгівля", navAssets: "Активи", navRewards: "Винагороди", navLearning: "Навчання", navInfo: "Інфо",
    install: "Встановити додаток на головний екран", installTitle: "Встановлення додатку", installClose: "Зрозуміло", installIos: "На iPhone натисніть Поділитися, потім На початковий екран.", installAndroid: "На Android натисніть Встановити або Додати на головний екран у меню браузера.", home: "Додому", trade: "Торгівля", assets: "Активи",
    learning: "Навчання криптовалютам", info: "Про проєкт", deposit: "Поповнення", withdraw: "Виведення коштів",
    profile: "Дані користувача", logout: "Вийти", balance: "Баланс", wallet: "Гаманець", userData: "Дані користувача",
    addFunds: "Поповнити", withdrawShort: "Вивести", mainBalance: "Основний баланс", operationHistory: "Історія операцій і винагород",
    pool: "Загальний пул", dailyChange: "Добова зміна", perDay: "за добу", readLesson: "Прочитайте короткий урок і дайте правильну відповідь. Кожен тест можна пройти один раз.",
    reward10: "Винагорода становить $10", check: "Перевірити", mainTrade: "Основна торгівля",
    tradeButton: "Торгувати", locked: "Заблоковано", availableAll: "Доступна всім користувачам",
    project: "United Europe Crypto", market: "Ринок", copy: "Скопійовано", back: "Назад"
  },
  ru: {
    navHome: "Домой", navTrade: "Торговля", navAssets: "Активы", navRewards: "Награды", navLearning: "Обучение", navInfo: "Инфо",
    install: "Установить приложение на главный экран", installTitle: "Установка приложения", installClose: "Понятно", installIos: "На iPhone нажмите Поделиться, затем На экран Домой.", installAndroid: "На Android нажмите Установить или Добавить на главный экран в меню браузера.", home: "Домой", trade: "Торговля", assets: "Активы",
    learning: "Обучение криптовалютам", info: "О проекте", deposit: "Пополнение", withdraw: "Вывод средств",
    profile: "Данные пользователя", logout: "Выйти", balance: "Баланс", wallet: "Кошелек", userData: "Данные пользователя",
    addFunds: "Пополнить", withdrawShort: "Вывести", mainBalance: "Основной баланс", operationHistory: "История операций и наград",
    pool: "Общий пул", dailyChange: "Суточное изменение", perDay: "за сутки", readLesson: "Прочитайте короткий урок и дайте правильный ответ. Каждый тест можно пройти один раз.",
    reward10: "Вознаграждение составляет $10", check: "Проверить", mainTrade: "Основная торговля",
    tradeButton: "Торговать", locked: "Заблокировано", availableAll: "Доступно всем пользователям",
    project: "United Europe Crypto", market: "Рынок", copy: "Скопировано", back: "Назад"
  },
  kk: {
    navHome: "Басты бет", navTrade: "Сауда", navAssets: "Активтер", navRewards: "Сыйақылар", navLearning: "Оқу", navInfo: "Ақпарат",
    install: "Қолданбаны басты экранға орнату", installTitle: "Қолданбаны орнату", installClose: "Түсінікті", installIos: "iPhone-да Бөлісу түймесін, содан кейін Басты экранға қосу түймесін басыңыз.", installAndroid: "Android-та браузер мәзірінен Орнату немесе Басты экранға қосу түймесін басыңыз.", home: "Басты бет", trade: "Сауда", assets: "Активтер",
    learning: "Криптовалюта бойынша оқу", info: "Жоба туралы", deposit: "Толықтыру", withdraw: "Шығару",
    profile: "Пайдаланушы деректері", logout: "Шығу", balance: "Баланс", wallet: "Әмиян", userData: "Пайдаланушы деректері",
    addFunds: "Толықтыру", withdrawShort: "Шығару", mainBalance: "Негізгі баланс", operationHistory: "Операциялар мен сыйақылар тарихы",
    pool: "Жалпы пул", dailyChange: "Күндік өзгеріс", perDay: "тәулігіне", readLesson: "Қысқа сабақты оқып, дұрыс жауап беріңіз. Әр тестті бір рет өтуге болады.",
    reward10: "Сыйақы $10", check: "Тексеру", mainTrade: "Негізгі сауда",
    tradeButton: "Саудалау", locked: "Бұғатталған", availableAll: "Барлық пайдаланушыларға қолжетімді",
    project: "United Europe Crypto", market: "Нарық", copy: "Көшірілді", back: "Артқа"
  },
  pl: {
    navHome: "Start", navTrade: "Handel", navAssets: "Aktywa", navRewards: "Nagrody", navLearning: "Nauka", navInfo: "Info",
    install: "Zainstaluj aplikację na ekranie głównym", installTitle: "Instalacja aplikacji", installClose: "Rozumiem", installIos: "Na iPhonie kliknij Udostępnij, a potem Do ekranu początkowego.", installAndroid: "Na Androidzie kliknij Zainstaluj lub Dodaj do ekranu głównego w menu przeglądarki.", home: "Start", trade: "Handel", assets: "Aktywa",
    learning: "Nauka kryptowalut", info: "O projekcie", deposit: "Wpłata", withdraw: "Wypłata",
    profile: "Dane użytkownika", logout: "Wyloguj", balance: "Saldo", wallet: "Portfel", userData: "Dane użytkownika",
    addFunds: "Wpłać", withdrawShort: "Wypłać", mainBalance: "Saldo główne", operationHistory: "Historia operacji i nagród",
    pool: "Pula ogólna", dailyChange: "Zmiana dzienna", perDay: "dziennie", readLesson: "Przeczytaj krótki materiał i wybierz poprawną odpowiedź. Każdy test można ukończyć raz.",
    reward10: "Nagroda wynosi $10", check: "Sprawdź", mainTrade: "Handel główny",
    tradeButton: "Handluj", locked: "Zablokowane", availableAll: "Dostępne dla wszystkich użytkowników",
    project: "United Europe Crypto", market: "Rynek", copy: "Skopiowano", back: "Wstecz"
  },
  ro: {
    navHome: "Acasă", navTrade: "Tranzacții", navAssets: "Active", navRewards: "Recompense", navLearning: "Învățare", navInfo: "Info",
    install: "Instalează aplicația pe ecranul principal", installTitle: "Instalarea aplicației", installClose: "Am înțeles", installIos: "Pe iPhone apăsați Partajare, apoi Adăugați la ecranul principal.", installAndroid: "Pe Android apăsați Instalare sau Adăugați la ecranul principal din meniul browserului.", home: "Acasă", trade: "Tranzacții", assets: "Active",
    learning: "Învățare despre criptomonede", info: "Despre proiect", deposit: "Depunere", withdraw: "Retragere",
    profile: "Date utilizator", logout: "Ieșire", balance: "Sold", wallet: "Portofel", userData: "Date utilizator",
    addFunds: "Depune", withdrawShort: "Retrage", mainBalance: "Sold principal", operationHistory: "Istoricul operațiunilor și recompenselor",
    pool: "Fond total", dailyChange: "Schimbare zilnică", perDay: "pe zi", readLesson: "Citește lecția scurtă și alege răspunsul corect. Fiecare test poate fi făcut o singură dată.",
    reward10: "Recompensa este de $10", check: "Verifică", mainTrade: "Tranzacție principală",
    tradeButton: "Tranzacționează", locked: "Blocat", availableAll: "Disponibil tuturor utilizatorilor",
    project: "United Europe Crypto", market: "Piață", copy: "Copiat", back: "Înapoi"
  },
  en: {
    navHome: "Home", navTrade: "Trade", navAssets: "Assets", navRewards: "Rewards", navLearning: "Learning", navInfo: "Info",
    install: "Install the app on the home screen", installTitle: "Install the app", installClose: "Got it", installIos: "On iPhone, tap Share, then Add to Home Screen.", installAndroid: "On Android, tap Install or Add to Home screen in the browser menu.", home: "Home", trade: "Trading", assets: "Assets",
    learning: "Cryptocurrency Learning", info: "About the project", deposit: "Deposit", withdraw: "Withdraw",
    profile: "User data", logout: "Log out", balance: "Balance", wallet: "Wallet", userData: "User data",
    addFunds: "Deposit", withdrawShort: "Withdraw", mainBalance: "Main balance", operationHistory: "Operations and rewards history",
    pool: "Total pool", dailyChange: "Daily change", perDay: "per day", readLesson: "Read the short lesson and choose the correct answer. Each test can be completed once.",
    reward10: "The reward is $10", check: "Check", mainTrade: "Main trading",
    tradeButton: "Trade", locked: "Locked", availableAll: "Available to all users",
    project: "United Europe Crypto", market: "Market", copy: "Copied", back: "Back"
  },
  de: {
    navHome: "Start", navTrade: "Handel", navAssets: "Aktiva", navRewards: "Prämien", navLearning: "Lernen", navInfo: "Info",
    install: "App zum Startbildschirm hinzufügen", installTitle: "App installieren", installClose: "Verstanden", installIos: "Tippen Sie auf dem iPhone auf Teilen und dann auf Zum Home-Bildschirm.", installAndroid: "Tippen Sie auf Android im Browsermenü auf Installieren oder Zum Startbildschirm hinzufügen.", home: "Start", trade: "Handel", assets: "Aktiva",
    learning: "Kryptowährungen lernen", info: "Über das Projekt", deposit: "Einzahlung", withdraw: "Auszahlung",
    profile: "Benutzerdaten", logout: "Abmelden", balance: "Saldo", wallet: "Wallet", userData: "Benutzerdaten",
    addFunds: "Einzahlen", withdrawShort: "Auszahlen", mainBalance: "Hauptsaldo", operationHistory: "Verlauf von Vorgängen und Belohnungen",
    pool: "Gesamtpool", dailyChange: "Tagesänderung", perDay: "pro Tag", readLesson: "Lesen Sie die kurze Lektion und wählen Sie die richtige Antwort. Jeder Test kann einmal abgeschlossen werden.",
    reward10: "Die Belohnung beträgt $10", check: "Prüfen", mainTrade: "Haupthandel",
    tradeButton: "Handeln", locked: "Gesperrt", availableAll: "Für alle Benutzer verfügbar",
    project: "United Europe Crypto", market: "Markt", copy: "Kopiert", back: "Zurück"
  },
  fr: {
    navHome: "Accueil", navTrade: "Trading", navAssets: "Actifs", navRewards: "Récompenses", navLearning: "Formation", navInfo: "Infos",
    install: "Installer l'application sur l'écran d'accueil", installTitle: "Installer l'application", installClose: "Compris", installIos: "Sur iPhone, touchez Partager, puis Sur l'écran d'accueil.", installAndroid: "Sur Android, touchez Installer ou Ajouter à l'écran d'accueil dans le menu du navigateur.", home: "Accueil", trade: "Trading", assets: "Actifs",
    learning: "Formation crypto", info: "À propos du projet", deposit: "Dépôt", withdraw: "Retrait",
    profile: "Données utilisateur", logout: "Déconnexion", balance: "Solde", wallet: "Portefeuille", userData: "Données utilisateur",
    addFunds: "Déposer", withdrawShort: "Retirer", mainBalance: "Solde principal", operationHistory: "Historique des opérations et récompenses",
    pool: "Pool total", dailyChange: "Variation quotidienne", perDay: "par jour", readLesson: "Lisez la courte leçon et choisissez la bonne réponse. Chaque test ne peut être terminé qu'une fois.",
    reward10: "La récompense est de $10", check: "Vérifier", mainTrade: "Trading principal",
    tradeButton: "Trader", locked: "Verrouillé", availableAll: "Disponible pour tous les utilisateurs",
    project: "United Europe Crypto", market: "Marché", copy: "Copié", back: "Retour"
  },
  pt: {
    navHome: "Início", navTrade: "Negociação", navAssets: "Ativos", navRewards: "Recompensas", navLearning: "Aprendizado", navInfo: "Info",
    install: "Instalar o app na tela inicial", installTitle: "Instalar o app", installClose: "Entendi", installIos: "No iPhone, toque em Compartilhar e depois Adicionar à Tela de Início.", installAndroid: "No Android, toque em Instalar ou Adicionar à tela inicial no menu do navegador.", home: "Início", trade: "Negociação", assets: "Ativos",
    learning: "Aprendizado sobre criptomoedas", info: "Sobre o projeto", deposit: "Depósito", withdraw: "Retirada",
    profile: "Dados do usuário", logout: "Sair", balance: "Saldo", wallet: "Carteira", userData: "Dados do usuário",
    addFunds: "Depositar", withdrawShort: "Retirar", mainBalance: "Saldo principal", operationHistory: "Histórico de operações e recompensas",
    pool: "Pool total", dailyChange: "Mudança diária", perDay: "por dia", readLesson: "Leia a lição curta e escolha a resposta correta. Cada teste pode ser concluído uma vez.",
    reward10: "A recompensa é de $10", check: "Verificar", mainTrade: "Negociação principal",
    tradeButton: "Negociar", locked: "Bloqueado", availableAll: "Disponível para todos os usuários",
    project: "United Europe Crypto", market: "Mercado", copy: "Copiado", back: "Voltar"
  },
  es: {
    navHome: "Inicio", navTrade: "Trading", navAssets: "Activos", navRewards: "Recompensas", navLearning: "Aprendizaje", navInfo: "Info",
    install: "Instalar la app en la pantalla principal", installTitle: "Instalar la app", installClose: "Entendido", installIos: "En iPhone, toca Compartir y luego Añadir a pantalla de inicio.", installAndroid: "En Android, toca Instalar o Añadir a pantalla de inicio en el menú del navegador.", home: "Inicio", trade: "Trading", assets: "Activos",
    learning: "Aprendizaje de criptomonedas", info: "Sobre el proyecto", deposit: "Depósito", withdraw: "Retiro",
    profile: "Datos del usuario", logout: "Salir", balance: "Saldo", wallet: "Billetera", userData: "Datos del usuario",
    addFunds: "Depositar", withdrawShort: "Retirar", mainBalance: "Saldo principal", operationHistory: "Historial de operaciones y recompensas",
    pool: "Pool total", dailyChange: "Cambio diario", perDay: "por día", readLesson: "Lee la lección corta y elige la respuesta correcta. Cada prueba se puede completar una vez.",
    reward10: "La recompensa es de $10", check: "Comprobar", mainTrade: "Trading principal",
    tradeButton: "Operar", locked: "Bloqueado", availableAll: "Disponible para todos los usuarios",
    project: "United Europe Crypto", market: "Mercado", copy: "Copiado", back: "Atrás"
  },
  it: {
    navHome: "Home", navTrade: "Trading", navAssets: "Asset", navRewards: "Ricompense", navLearning: "Formazione", navInfo: "Info",
    install: "Installa l'app sulla schermata principale", installTitle: "Installa l'app", installClose: "Capito", installIos: "Su iPhone tocca Condividi, poi Aggiungi alla schermata Home.", installAndroid: "Su Android tocca Installa o Aggiungi alla schermata Home nel menu del browser.", home: "Home", trade: "Trading", assets: "Asset",
    learning: "Formazione sulle criptovalute", info: "Informazioni sul progetto", deposit: "Deposito", withdraw: "Prelievo",
    profile: "Dati utente", logout: "Esci", balance: "Saldo", wallet: "Wallet", userData: "Dati utente",
    addFunds: "Deposita", withdrawShort: "Preleva", mainBalance: "Saldo principale", operationHistory: "Storico operazioni e ricompense",
    pool: "Pool totale", dailyChange: "Variazione giornaliera", perDay: "al giorno", readLesson: "Leggi la breve lezione e scegli la risposta corretta. Ogni test può essere completato una sola volta.",
    reward10: "La ricompensa è di $10", check: "Controlla", mainTrade: "Trading principale",
    tradeButton: "Fai trading", locked: "Bloccato", availableAll: "Disponibile per tutti gli utenti",
    project: "United Europe Crypto", market: "Mercato", copy: "Copiato", back: "Indietro"
  }
};

const TEXT_KEYS = {
  "Додому": "home",
  "Торгівля": "trade",
  "Торгівля криптовалютами": "trade",
  "Активи": "assets",
  "Винагороди": "navRewards",
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
  "Винагорода становить $10": "reward10",
  "Перевірити": "check",
  "Основна торгівля": "mainTrade",
  "Ринок": "market",
  "Торгувати": "tradeButton",
  "Заблоковано": "locked",
  "Доступна всім користувачам": "availableAll",
  "Назад": "back"
};

const CURRENCY_PATTERN = /(\$\s?[\d,.]+|[\d,.]+\s?\$|(?:\d+\s*)?(?:долар|долара|доларів|долари|дол\.|USD|USDT|TRC20)\b)/giu;

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
  const saved = localStorage.getItem("app_language") || "en";
  return I18N[saved] ? saved : "en";
}

function tr(key) {
  return (I18N[currentLang()] && I18N[currentLang()][key]) || I18N.uk[key] || key;
}

function googleTargetLang() {
  return GOOGLE_LANG_CODES[currentLang()] || "uk";
}

function applyTranslations(root = document.body) {
  const lang = currentLang();
  document.documentElement.lang = lang;
  protectCurrencyText(root);

  root.querySelectorAll("[data-i18n]").forEach(element => {
    element.textContent = tr(element.dataset.i18n);
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
    element.setAttribute("placeholder", tr(element.dataset.i18nPlaceholder));
  });

  if (lang === "uk") return;

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
    showLanguageLoading();
    localStorage.setItem("app_language", select.value);
    sessionStorage.setItem("language_switching", "1");
    setTranslateCookie(select.value);
    setTimeout(() => location.reload(), 80);
  });
  return select;
}

function showLanguageLoading() {
  document.documentElement.classList.add("app-language-pending");
  let overlay = document.querySelector(".language-loading");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "language-loading";
    overlay.innerHTML = `<div><img src="logo.png" alt="United Europe Crypto"><span>Translating...</span></div>`;
    document.body.append(overlay);
  }
  overlay.classList.add("visible");
}

function hideLanguageLoading() {
  document.documentElement.classList.remove("app-language-pending");
  sessionStorage.removeItem("language_switching");
  document.querySelector(".language-loading")?.classList.remove("visible");
}

function showAppLoading(message = "United Europe Crypto") {
  let overlay = document.querySelector(".language-loading");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "language-loading";
    overlay.innerHTML = `<div><img src="logo.png" alt="United Europe Crypto"><span></span></div>`;
    document.body.append(overlay);
  }
  overlay.querySelector("span").textContent = message;
  overlay.classList.add("visible");
}

function waitForGoogleTranslation() {
  const startedAt = Date.now();
  const timer = setInterval(() => {
    const translated = document.documentElement.className.includes("translated-") || document.body.className.includes("translated-");
    if (translated || Date.now() - startedAt > 5200) {
      clearInterval(timer);
      hideLanguageLoading();
    }
  }, 180);
}

function triggerGoogleTranslate() {
  if (currentLang() === "uk") return true;
  const combo = document.querySelector(".goog-te-combo");
  if (!combo) return false;
  const target = googleTargetLang();
  if (combo.value !== target) combo.value = target;
  combo.dispatchEvent(new Event("change"));
  return true;
}

let translationRefreshTimer = null;
let translationRefreshPauseUntil = 0;
let machineTranslationReady = true;
let machineTranslationRunning = false;
let machineTranslationFallbackUsed = false;
const TRANSLATION_SPLIT = "[[UEC_SPLIT_42]]";
const TRANSLATION_CACHE_PREFIX = "uec_translation_cache_";

function shouldTranslateText(text) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (value.length < 2) return false;
  if (/^[\d\s.,:+/%$€£¥#xX-]+$/.test(value)) return false;
  if (/^(USD|USDT|TRC20|BTC|ETH|BNB|SOL|XRP|ADA|DOGE)$/i.test(value)) return false;
  return /[А-Яа-яІіЇїЄєҐґ]/.test(value);
}

function translationCache(lang) {
  try {
    return JSON.parse(localStorage.getItem(TRANSLATION_CACHE_PREFIX + lang) || "{}");
  } catch {
    return {};
  }
}

function saveTranslationCache(lang, cache) {
  try {
    const entries = Object.entries(cache).slice(-900);
    localStorage.setItem(TRANSLATION_CACHE_PREFIX + lang, JSON.stringify(Object.fromEntries(entries)));
  } catch {}
}

function translatableTextNodes(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !shouldTranslateText(node.nodeValue)) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (["SCRIPT", "STYLE", "TEXTAREA", "OPTION", "SELECT"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest(".notranslate,[translate='no'],#google_translate_element,.goog-te-banner-frame,.language-select")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

function translatableAttributes(root = document.body) {
  const elements = [...root.querySelectorAll("[placeholder], [title], [aria-label], img[alt]")];
  const attrs = [];
  for (const element of elements) {
    if (element.closest(".notranslate,[translate='no'],#google_translate_element,.language-select")) continue;
    for (const name of ["placeholder", "title", "aria-label", "alt"]) {
      const value = element.getAttribute(name);
      if (shouldTranslateText(value)) attrs.push({ element, name, value });
    }
  }
  return attrs;
}

async function translateBatch(texts, lang) {
  if (!texts.length) return [];
  const joined = texts.join(`\n${TRANSLATION_SPLIT}\n`);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=uk&tl=${encodeURIComponent(googleTargetLang())}&dt=t&q=${encodeURIComponent(joined)}`;
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) throw new Error("translation failed");
  const data = await response.json();
  const translated = (data?.[0] || []).map(part => part?.[0] || "").join("");
  const parts = translated.split(TRANSLATION_SPLIT).map(part => part.trim());
  return texts.map((text, index) => parts[index] || text);
}

async function machineTranslatePage(root = document.body) {
  const lang = currentLang();
  if (lang === "uk" || machineTranslationRunning) return true;
  machineTranslationRunning = true;
  try {
    protectCurrencyText(root);
    const cache = translationCache(lang);
    const textNodes = translatableTextNodes(root).map(node => {
      if (!node.__uecOriginalText || shouldTranslateText(node.nodeValue)) node.__uecOriginalText = node.__uecOriginalText || node.nodeValue;
      return { node, original: node.__uecOriginalText };
    }).filter(item => shouldTranslateText(item.original));
    const attrs = translatableAttributes(root).map(item => {
      const key = `data-uec-original-${item.name.replace(/[^a-z]/g, "-")}`;
      const original = item.element.getAttribute(key) || item.value;
      item.element.setAttribute(key, original);
      return { ...item, original };
    }).filter(item => shouldTranslateText(item.original));

    const originals = [...new Set([...textNodes.map(item => item.original), ...attrs.map(item => item.original)])];
    const missing = originals.filter(text => !cache[text]);
    for (let index = 0; index < missing.length; index += 28) {
      const chunk = [];
      let length = 0;
      for (const text of missing.slice(index, index + 28)) {
        if (length + text.length > 2600 && chunk.length) break;
        chunk.push(text);
        length += text.length + TRANSLATION_SPLIT.length + 2;
      }
      const translated = await translateBatch(chunk, lang);
      chunk.forEach((text, chunkIndex) => { cache[text] = translated[chunkIndex] || text; });
      index += Math.max(0, chunk.length - 28);
    }
    saveTranslationCache(lang, cache);

    for (const { node, original } of textNodes) {
      if (cache[original] && node.nodeValue !== cache[original]) node.nodeValue = cache[original];
    }
    for (const { element, name, original } of attrs) {
      if (cache[original] && element.getAttribute(name) !== cache[original]) element.setAttribute(name, cache[original]);
    }
    applyTranslations(root);
    protectCurrencyText(root);
    machineTranslationReady = true;
    return true;
  } catch {
    machineTranslationReady = false;
    if (!machineTranslationFallbackUsed) {
      machineTranslationFallbackUsed = true;
      loadGoogleTranslatorFallback();
    }
    return false;
  } finally {
    machineTranslationRunning = false;
    hideLanguageLoading();
  }
}

function scheduleFullPageTranslation(delay = 700) {
  if (currentLang() === "uk") return;
  if (Date.now() < translationRefreshPauseUntil) return;
  clearTimeout(translationRefreshTimer);
  translationRefreshTimer = setTimeout(() => {
    translationRefreshPauseUntil = Date.now() + 2400;
    protectCurrencyText(document.body);
    machineTranslatePage(document.body).then(success => {
      if (success) return;
      if (!triggerGoogleTranslate()) {
        setTimeout(triggerGoogleTranslate, 900);
      }
    });
    if (!machineTranslationReady && !triggerGoogleTranslate()) {
      setTimeout(triggerGoogleTranslate, 900);
    }
  }, delay);
}

function protectCurrencyText(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !CURRENCY_PATTERN.test(node.nodeValue)) {
        CURRENCY_PATTERN.lastIndex = 0;
        return NodeFilter.FILTER_REJECT;
      }
      CURRENCY_PATTERN.lastIndex = 0;
      if (["SCRIPT", "STYLE", "TEXTAREA", "OPTION"].includes(node.parentElement?.tagName)) return NodeFilter.FILTER_REJECT;
      if (node.parentElement?.closest(".notranslate,[translate='no']")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    const text = node.nodeValue;
    CURRENCY_PATTERN.lastIndex = 0;
    let match;
    while ((match = CURRENCY_PATTERN.exec(text))) {
      if (match.index > lastIndex) fragment.append(document.createTextNode(text.slice(lastIndex, match.index)));
      const span = document.createElement("span");
      span.className = "notranslate";
      span.setAttribute("translate", "no");
      span.textContent = match[0];
      fragment.append(span);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) fragment.append(document.createTextNode(text.slice(lastIndex)));
    node.parentNode.replaceChild(fragment, node);
  });
}

function setTranslateCookie(lang) {
  const value = lang === "uk" ? "/uk/uk" : `/uk/${GOOGLE_LANG_CODES[lang] || "uk"}`;
  document.cookie = `googtrans=${value};path=/;max-age=31536000;SameSite=Lax`;
  const host = location.hostname.split(".").slice(-2).join(".");
  if (host && host.includes(".")) {
    document.cookie = `googtrans=${value};path=/;domain=.${host};max-age=31536000;SameSite=Lax`;
  }
}

function loadGoogleTranslatorFallback() {
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
    [250, 1200, 2600, 4600].forEach(delay => setTimeout(triggerGoogleTranslate, delay));
    waitForGoogleTranslation();
  };

  const script = document.createElement("script");
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  script.onerror = hideLanguageLoading;
  document.head.append(script);
}

function loadFullPageTranslator() {
  const lang = currentLang();
  setTranslateCookie(lang);
  if (lang === "uk") return;
  showLanguageLoading();
  machineTranslatePage(document.body).then(success => {
    if (!success) loadGoogleTranslatorFallback();
  });
  [400, 1400, 3200, 6200].forEach(delay => setTimeout(() => machineTranslatePage(document.body), delay));
}

function observeCurrencyChanges() {
  let pending = false;
  const observer = new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      protectCurrencyText(document.body);
      scheduleFullPageTranslation();
    });
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

function renderInstallButton() {
  const current = location.pathname.split("/").pop() || "index.html";
  if (current !== "index.html") return;
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (isStandalone) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "install-app-btn";
  button.textContent = tr("install");
  button.addEventListener("click", installApp);
  const show = () => button.classList.add("visible");
  show();
  if (window.deferredInstallPrompt) show();
  window.addEventListener("pwa-install-ready", show);
  document.body.insertBefore(button, document.body.firstElementChild?.nextSibling || null);
}

async function installApp() {
  const waitForInstallPrompt = (timeout = 2500) => new Promise(resolve => {
    if (window.deferredInstallPrompt) return resolve(true);
    const timer = setTimeout(() => {
      window.removeEventListener("pwa-install-ready", ready);
      resolve(Boolean(window.deferredInstallPrompt));
    }, timeout);
    function ready() {
      clearTimeout(timer);
      resolve(true);
    }
    window.addEventListener("pwa-install-ready", ready, { once: true });
  });
  if (window.deferredInstallPrompt) {
    const promptEvent = window.deferredInstallPrompt;
    window.deferredInstallPrompt = null;
    promptEvent.prompt();
    const choice = await promptEvent.userChoice.catch(() => null);
    if (choice?.outcome === "accepted") {
      document.querySelector(".install-app-btn")?.classList.remove("visible");
    }
    return;
  }
  if ("serviceWorker" in navigator) {
    await navigator.serviceWorker.ready.catch(() => {});
  }
  await waitForInstallPrompt();
  if (window.deferredInstallPrompt) return installApp();
  showInstallInstructions();
}

function showInstallInstructions() {
  document.querySelector(".install-modal")?.remove();
  const ua = navigator.userAgent || "";
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const message = isIos ? tr("installIos") : tr("installAndroid");
  const modal = document.createElement("div");
  modal.className = "install-modal visible";
  modal.innerHTML = `
    <div class="install-card">
      <h2>${tr("installTitle")}</h2>
      <p>${message}</p>
      <button type="button">${tr("installClose")}</button>
    </div>
  `;
  modal.addEventListener("click", event => {
    if (event.target === modal || event.target.tagName === "BUTTON") modal.remove();
  });
  document.body.append(modal);
}

document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("language_switching") === "1") showLanguageLoading();
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
  [
    ["theme-color", "#0b0f1a"],
    ["mobile-web-app-capable", "yes"],
    ["apple-mobile-web-app-capable", "yes"],
    ["apple-mobile-web-app-status-bar-style", "black-translucent"],
    ["apple-mobile-web-app-title", "United Europe Crypto"]
  ].forEach(([name, content]) => {
    if (!document.head.querySelector(`meta[name="${name}"]`)) {
      const meta = document.createElement("meta");
      meta.name = name;
      meta.content = content;
      document.head.append(meta);
    }
  });
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js").catch(() => {});

  document.querySelectorAll(".logo, .navbar, .app-navbar, .site-brand").forEach(element => element.remove());

  const brand = document.createElement("header");
  brand.className = "site-brand";
  brand.innerHTML = `
    <button type="button" aria-label="${tr("home")}">
      <img src="logo.png" alt="United Europe Crypto">
    </button>
  `;
  brand.querySelector("button").addEventListener("click", () => location.href = "index.html");
  brand.append(renderLanguageSelector());
  document.body.prepend(brand);
  renderInstallButton();
  document.addEventListener("click", event => {
    const link = event.target.closest("a[href]");
    if (!link || link.target || link.href.startsWith("javascript:") || link.origin !== location.origin) return;
    if (link.pathname === location.pathname && link.search === location.search) return;
    showAppLoading("United Europe Crypto");
  });
  window.addEventListener("beforeunload", () => showAppLoading("United Europe Crypto"));

  if (document.body.dataset.noNav !== "true") {
    const items = [
      ["index.html", "🏠", "navHome"],
      ["trade.html", "📊", "navTrade"],
      ["assets.html", "💼", "navAssets"],
      ["rewards.html", "🏆", "navRewards"],
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
  observeCurrencyChanges();
  loadFullPageTranslator();
  scheduleFullPageTranslation(1400);
  setTimeout(() => window.appTranslate?.translatePage(), 3200);
  window.dispatchEvent(new CustomEvent("app-language-ready"));
  if (currentLang() === "uk") hideLanguageLoading();
  if (currentLang() !== "uk") setTimeout(hideLanguageLoading, 5600);
});

window.appTranslate = {
  tr,
  applyTranslations,
  currentLang,
  protectCurrencyText,
  translatePage() {
    applyTranslations(document.body);
    scheduleFullPageTranslation(100);
  }
};
