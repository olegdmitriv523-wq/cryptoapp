const APP_LANGUAGES = [
  ["en", "English"],
  ["ru", "Русский"],
  ["uk", "Українська"],
  ["es", "Español"]
];

try {
  if (localStorage.getItem("cryptostar_language_default_v1") !== "1") {
    if (!localStorage.getItem("app_language") || localStorage.getItem("app_language") === "ru") localStorage.setItem("app_language", "en");
    localStorage.setItem("cryptostar_language_default_v1", "1");
  }
} catch {}

if (localStorage.getItem("token")) localStorage.setItem("logged_in", "1");

const I18N = {
  uk: {
    navHome: "Додому", navTrade: "Торгівля", navAssets: "Активи", navRewards: "Винагороди", navLearning: "Навчання", navInfo: "Інфо",
    install: "Встановити додаток на головний екран", installTitle: "Встановлення додатку", installClose: "Зрозуміло", installIos: "На iPhone натисніть Поділитися, потім На початковий екран.", installAndroid: "На Android натисніть Встановити або Додати на головний екран у меню браузера.", home: "Додому", trade: "Торгівля", assets: "Активи",
    learning: "Навчання криптовалютам", info: "Про проєкт", deposit: "Поповнення", withdraw: "Виведення коштів",
    profile: "Дані користувача", logout: "Вийти", balance: "Баланс", wallet: "Гаманець", userData: "Дані користувача",
    addFunds: "Поповнити", withdrawShort: "Вивести", mainBalance: "Основний баланс", operationHistory: "Історія операцій і винагород",
    pool: "Модельний індикатор (не реальні активи)", dailyChange: "Добова зміна", perDay: "за добу", readLesson: "Прочитайте короткий урок і дайте правильну відповідь. Кожен тест можна пройти один раз.",
    reward10: "Винагорода становить $2.50", check: "Перевірити", mainTrade: "Основна торгівля",
    tradeButton: "Торгувати", locked: "Заблоковано", availableAll: "Доступна всім користувачам",
    project: "CryptoStar", market: "Ринок", copy: "Скопійовано", back: "Назад",
    walletPending: "Запит на створення персонального гаманця вже відправлено. Дочекайтеся, поки адміністратор укаже адресу.",
    walletMissing: "Персональний гаманець ще не створено. Відправте запит адміністратору.",
    requestWallet: "Запросити гаманець", waitingAdmin: "Очікує адміністратора", sending: "Відправляємо...",
    requestSent: "Запит відправлено адміністратору", requestAlreadySent: "Запит уже відправлено адміністратору",
    walletSaved: "Гаманець збережено", savedWallet: "Збережений гаманець", withdrawSaved: "Вивести на збережений гаманець",
    depositTelegramWarning: "Заявку на поповнення збережено, але сповіщення в Telegram не доставлено.",
    depositSent: "Заявку на поповнення відправлено адміністратору. Баланс зміниться після підтвердження.",
    support: "Підтримка", languageLabel: "Мова"
  },
  ru: {
    navHome: "Домой", navTrade: "Торговля", navAssets: "Активы", navRewards: "Награды", navLearning: "Обучение", navInfo: "Инфо",
    install: "Установить приложение на главный экран", installTitle: "Установка приложения", installClose: "Понятно", installIos: "На iPhone нажмите Поделиться, затем На экран Домой.", installAndroid: "На Android нажмите Установить или Добавить на главный экран в меню браузера.", home: "Домой", trade: "Торговля", assets: "Активы",
    learning: "Обучение криптовалютам", info: "О проекте", deposit: "Пополнение", withdraw: "Вывод средств",
    profile: "Данные пользователя", logout: "Выйти", balance: "Баланс", wallet: "Кошелек", userData: "Данные пользователя",
    addFunds: "Пополнить", withdrawShort: "Вывести", mainBalance: "Основной баланс", operationHistory: "История операций и наград",
    pool: "Модельный индикатор (не реальные активы)", dailyChange: "Суточное изменение", perDay: "за сутки", readLesson: "Прочитайте короткий урок и дайте правильный ответ. Каждый тест можно пройти один раз.",
    reward10: "Вознаграждение составляет $2.50", check: "Проверить", mainTrade: "Основная торговля",
    tradeButton: "Торговать", locked: "Заблокировано", availableAll: "Доступно всем пользователям",
    project: "CryptoStar", market: "Рынок", copy: "Скопировано", back: "Назад",
    walletPending: "Запрос на создание персонального кошелька уже отправлен. Дождитесь, пока администратор укажет адрес.",
    walletMissing: "Персональный кошелек еще не создан. Отправьте запрос администратору.",
    requestWallet: "Запросить кошелек", waitingAdmin: "Ожидает администратора", sending: "Отправляем...",
    requestSent: "Запрос отправлен администратору", requestAlreadySent: "Запрос уже отправлен администратору",
    walletSaved: "Кошелек сохранен", savedWallet: "Сохраненный кошелек", withdrawSaved: "Вывести на сохраненный кошелек",
    depositTelegramWarning: "Заявка на пополнение сохранена, но уведомление в Telegram не доставлено.",
    depositSent: "Заявка на пополнение отправлена администратору. Баланс изменится после подтверждения.",
    support: "Поддержка", languageLabel: "Язык"
  },
  en: {
    navHome: "Home", navTrade: "Trade", navAssets: "Assets", navRewards: "Rewards", navLearning: "Learning", navInfo: "Info",
    install: "Install the app on the home screen", installTitle: "Install the app", installClose: "Got it", installIos: "On iPhone, tap Share, then Add to Home Screen.", installAndroid: "On Android, tap Install or Add to Home screen in the browser menu.", home: "Home", trade: "Trading", assets: "Assets",
    learning: "Cryptocurrency Learning", info: "About the project", deposit: "Deposit", withdraw: "Withdraw",
    profile: "User data", logout: "Log out", balance: "Balance", wallet: "Wallet", userData: "User data",
    addFunds: "Deposit", withdrawShort: "Withdraw", mainBalance: "Main balance", operationHistory: "Operations and rewards history",
    pool: "Total pool", dailyChange: "Daily change", perDay: "per day", readLesson: "Read the short lesson and choose the correct answer. Each test can be completed once.",
    reward10: "The reward is $2.50", check: "Check", mainTrade: "Main trading",
    tradeButton: "Trade", locked: "Locked", availableAll: "Available to all users",
    project: "CryptoStar", market: "Market", copy: "Copied", back: "Back",
    walletPending: "The personal wallet request has already been sent. Wait for the administrator to add the address.",
    walletMissing: "The personal wallet has not been created yet. Send a request to the administrator.",
    requestWallet: "Request wallet", waitingAdmin: "Waiting for administrator", sending: "Sending...",
    requestSent: "The request was sent to the administrator", requestAlreadySent: "The request has already been sent to the administrator",
    walletSaved: "Wallet saved", savedWallet: "Saved wallet", withdrawSaved: "Withdraw to saved wallet",
    depositTelegramWarning: "Your deposit request was saved, but the Telegram notification was not delivered.",
    depositSent: "Your deposit request was sent to the administrator. The balance will change after approval.",
    support: "Support", languageLabel: "Language"
  },
  es: {
    navHome: "Inicio", navTrade: "Trading", navAssets: "Activos", navRewards: "Recompensas", navLearning: "Aprendizaje", navInfo: "Info",
    install: "Instalar la app en la pantalla principal", installTitle: "Instalar la app", installClose: "Entendido", installIos: "En iPhone, toca Compartir y luego Añadir a pantalla de inicio.", installAndroid: "En Android, toca Instalar o Añadir a pantalla de inicio en el menú del navegador.", home: "Inicio", trade: "Trading", assets: "Activos",
    learning: "Aprendizaje de criptomonedas", info: "Sobre el proyecto", deposit: "Depósito", withdraw: "Retiro",
    profile: "Datos del usuario", logout: "Salir", balance: "Saldo", wallet: "Billetera", userData: "Datos del usuario",
    addFunds: "Depositar", withdrawShort: "Retirar", mainBalance: "Saldo principal", operationHistory: "Historial de operaciones y recompensas",
    pool: "Pool total", dailyChange: "Cambio diario", perDay: "por día", readLesson: "Lee la lección corta y elige la respuesta correcta. Cada prueba se puede completar una vez.",
    reward10: "La recompensa es de $2.50", check: "Comprobar", mainTrade: "Trading principal",
    tradeButton: "Operar", locked: "Bloqueado", availableAll: "Disponible para todos los usuarios",
    project: "CryptoStar", market: "Mercado", copy: "Copiado", back: "Atrás",
    walletPending: "La solicitud de billetera personal ya fue enviada. Espera a que el administrador añada la dirección.",
    walletMissing: "La billetera personal aún no fue creada. Envía una solicitud al administrador.",
    requestWallet: "Solicitar billetera", waitingAdmin: "Esperando al administrador", sending: "Enviando...",
    requestSent: "La solicitud fue enviada al administrador", requestAlreadySent: "La solicitud ya fue enviada al administrador",
    walletSaved: "Billetera guardada", savedWallet: "Billetera guardada", withdrawSaved: "Retirar a la billetera guardada",
    depositTelegramWarning: "La solicitud de depósito se guardó, pero no se entregó la notificación de Telegram.",
    depositSent: "La solicitud de depósito fue enviada al administrador. El saldo cambiará después de la aprobación.",
    support: "Soporte", languageLabel: "Idioma"
  },
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
  "Винагорода становить 2.5 долара": "reward10",
  "Винагорода становить $2.50": "reward10",
  "Перевірити": "check",
  "Основна торгівля": "mainTrade",
  "Ринок": "market",
  "Торгувати": "tradeButton",
  "Заблоковано": "locked",
  "Доступна всім користувачам": "availableAll",
  "Назад": "back",
  "Запит на створення персонального гаманця вже відправлено. Дочекайтеся, поки адміністратор впише адресу.": "walletPending",
  "Персональний гаманець ще не створено. Відправте запит адміністратору.": "walletMissing",
  "Запросити гаманець": "requestWallet",
  "Очікує адміністратора": "waitingAdmin",
  "Відправляємо...": "sending",
  "Запит відправлено адміністратору": "requestSent",
  "Запит уже відправлено адміністратору": "requestAlreadySent",
  "Гаманець збережено": "walletSaved",
  "Збережений гаманець": "savedWallet",
  "Вивести на збережений гаманець": "withdrawSaved",
  "Підтримка": "support"
};

const CURRENCY_PATTERN = /(\$\s?[\d,.]+|[\d,.]+\s?\$|(?:\d+\s*)?(?:долар|долара|доларів|долари|дол\.|USD|USDT|TRC20)\b)/giu;

const GOOGLE_LANG_CODES = {
  uk: "uk",
  ru: "ru",
  en: "en",
  es: "es"
};

function currentLang() {
  const saved = localStorage.getItem("app_language") || "en";
  return I18N[saved] ? saved : "en";
}

const PAGE_TITLES = {
  "index.html": { uk: "CryptoStar", ru: "CryptoStar", en: "CryptoStar", es: "CryptoStar" },
  "deposit.html": { uk: "Поповнення", ru: "Пополнение", en: "Deposit", es: "Depósito" },
  "withdraw.html": { uk: "Виведення коштів", ru: "Вывод средств", en: "Withdraw funds", es: "Retiro de fondos" },
  "assets.html": { uk: "Активи", ru: "Активы", en: "Assets", es: "Activos" },
  "trade.html": { uk: "Торгівля", ru: "Торговля", en: "Trading", es: "Trading" },
  "learning.html": { uk: "Навчання криптовалютам", ru: "Обучение криптовалютам", en: "Crypto learning", es: "Aprendizaje de criptomonedas" },
  "rewards.html": { uk: "Винагороди", ru: "Награды", en: "Rewards", es: "Recompensas" },
  "profile.html": { uk: "Дані користувача", ru: "Данные пользователя", en: "User data", es: "Datos del usuario" },
  "info.html": { uk: "Про проєкт", ru: "О проекте", en: "About the project", es: "Sobre el proyecto" },
  "terms.html": { uk: "Умови користування", ru: "Условия использования", en: "Terms of use", es: "Condiciones de uso" },
  "login.html": { uk: "Вхід", ru: "Вход", en: "Login", es: "Iniciar sesión" },
  "register.html": { uk: "Реєстрація", ru: "Регистрация", en: "Registration", es: "Registro" },
  "admin.html": { uk: "Адмінпанель", ru: "Панель администратора", en: "Admin panel", es: "Panel de administración" }
};

function translateDocumentTitle() {
  const file = location.pathname.split("/").pop() || "index.html";
  const title = PAGE_TITLES[file]?.[currentLang()];
  if (title) document.title = `CryptoStar | ${title}`;
}

function tr(key) {
  const lang = currentLang();
  return (I18N[lang] && I18N[lang][key]) || (lang === "en" ? I18N.en[key] : I18N.ru[key]) || I18N.en[key] || key;
}

function googleTargetLang() {
  return GOOGLE_LANG_CODES[currentLang()] || "uk";
}

function applyTranslations(root = document.body) {
  const lang = currentLang();
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  translateDocumentTitle();
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
  select.setAttribute("aria-label", tr("languageLabel"));
  select.innerHTML = APP_LANGUAGES.map(([code, label]) => `<option value="${code}">${label}</option>`).join("");
  select.value = currentLang();
  select.addEventListener("change", () => {
    showLanguageLoading();
    localStorage.setItem("app_language", select.value);
    sessionStorage.setItem("language_switching", "1");
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
    overlay.innerHTML = `<div><img src="logo.png" alt="CryptoStar"><span>Loading...</span></div>`;
    document.body.append(overlay);
  }
  overlay.classList.add("visible");
}

function hideLanguageLoading() {
  document.documentElement.classList.remove("app-language-pending");
  sessionStorage.removeItem("language_switching");
  document.querySelector(".language-loading")?.classList.remove("visible");
}

function showAppLoading(message = "CryptoStar") {
  let overlay = document.querySelector(".language-loading");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "language-loading";
    overlay.innerHTML = `<div><img src="logo.png" alt="CryptoStar"><span></span></div>`;
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
const TRANSLATION_SPLIT = "[[CRYPTOSTAR_SPLIT_42]]";
const TRANSLATION_CACHE_PREFIX = "cryptostar_translation_cache_";

function shouldTranslateText(text) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (value.length < 2) return false;
  if (/^[\d\s.,:+/%$€£¥#xX-]+$/.test(value)) return false;
  if (/^(USD|USDT|TRC20|BTC|ETH|BNB|SOL|XRP|ADA|DOGE)$/i.test(value)) return false;
  CURRENCY_PATTERN.lastIndex = 0;
  const hasCurrency = CURRENCY_PATTERN.test(value);
  CURRENCY_PATTERN.lastIndex = 0;
  if (hasCurrency) return false;
  return /[А-Яа-яЁёІіЇїЄєҐґ]/.test(value);
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
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(googleTargetLang())}&dt=t&q=${encodeURIComponent(joined)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetch(url, { cache: "force-cache", signal: controller.signal });
    if (!response.ok) throw new Error("translation failed");
    const data = await response.json();
    const translated = (data?.[0] || []).map(part => part?.[0] || "").join("");
    const parts = translated.split(TRANSLATION_SPLIT).map(part => part.trim());
    return texts.map((text, index) => parts[index] || text);
  } finally {
    clearTimeout(timeout);
  }
}

async function machineTranslatePage(root = document.body) {
  const lang = currentLang();
  if (lang === "uk" || machineTranslationRunning) return true;
  machineTranslationRunning = true;
  try {
    protectCurrencyText(root);
    const cache = translationCache(lang);
    const textNodes = translatableTextNodes(root).map(node => {
      if (!node.__cryptostarOriginalText || shouldTranslateText(node.nodeValue)) node.__cryptostarOriginalText = node.__cryptostarOriginalText || node.nodeValue;
      return { node, original: node.__cryptostarOriginalText };
    }).filter(item => shouldTranslateText(item.original));
    const attrs = translatableAttributes(root).map(item => {
      const key = `data-cryptostar-original-${item.name.replace(/[^a-z]/g, "-")}`;
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
  if (currentLang() === "uk") return false;
  clearTimeout(translationRefreshTimer);
  translationRefreshTimer = setTimeout(() => {
    machineTranslatePage(document.body);
  }, Math.min(Math.max(Number(delay) || 0, 0), 250));
  return true;
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
  hideLanguageLoading();
}

function observeCurrencyChanges() {
  if (currentLang() === "uk" || window.__cryptostarTranslationObserver) return false;
  let timer = null;
  let paused = false;
  const observer = new MutationObserver(mutations => {
    if (paused || machineTranslationRunning) return;
    if (!mutations.some(mutation => mutation.addedNodes.length)) return;
    clearTimeout(timer);
    timer = setTimeout(async () => {
      paused = true;
      try { await machineTranslatePage(document.body); } finally {
        setTimeout(() => { paused = false; }, 120);
      }
    }, 100);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.__cryptostarTranslationObserver = observer;
  return true;
}

function installTranslatedAlerts() {
  if (window.__cryptostarTranslatedAlerts) return;
  const nativeAlert = window.alert.bind(window);
  window.alert = message => {
    const text = String(message ?? "");
    if (currentLang() === "uk" || !shouldTranslateText(text)) return nativeAlert(message);
    const lang = currentLang();
    const store = translationCache(lang);
    if (store[text]) return nativeAlert(store[text]);
    translateBatch([text], lang).then(([translated]) => {
      store[text] = translated || text;
      saveTranslationCache(lang, store);
      nativeAlert(store[text]);
    }).catch(() => nativeAlert(message));
  };
  window.__cryptostarTranslatedAlerts = true;
}

function renderInstallButton() {
  const current = location.pathname.split("/").pop() || "index.html";
  if (current !== "index.html") return;
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (isStandalone) return;
  const env = installEnvironment();
  const button = document.createElement("button");
  button.type = "button";
  button.className = "install-app-btn";
  button.textContent = env.isIos && !env.isSafari ? "Відкрити через Safari" : tr("install");
  button.addEventListener("click", installApp);
  const show = () => button.classList.add("visible");
  show();
  if (window.deferredInstallPrompt) show();
  window.addEventListener("pwa-install-ready", show);
  document.body.insertBefore(button, document.body.firstElementChild?.nextSibling || null);
  if (env.isIos && !env.isSafari) {
    setTimeout(() => showInstallInstructions(), 350);
  }
}

function installEnvironment() {
  const ua = navigator.userAgent || "";
  const isIos = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = isIos && /safari/i.test(ua) && !/(crios|fxios|edgios|opr|instagram|fbav|fban|telegram|line|micromessenger)/i.test(ua);
  const isInAppBrowser = /(telegram|instagram|fbav|fban|line|micromessenger|twitter|tiktok)/i.test(ua) || Boolean(window.TelegramWebviewProxy || window.Telegram);
  return { isIos, isSafari, isInAppBrowser };
}

function appStartUrl() {
  return location.origin + "/loading.html";
}

function tryOpenSafari(url) {
  try {
    const opened = window.open(url, "_blank", "noopener");
    if (opened) return true;
  } catch {}
  return false;
}

async function installApp() {
  const env = installEnvironment();
  if (env.isIos && !env.isSafari) {
    showInstallInstructions({ autoOpen: true });
    return;
  }
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (isStandalone) {
    document.querySelector(".install-app-btn")?.classList.remove("visible");
    return;
  }
  if ("serviceWorker" in navigator) {
    await navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
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

function showInstallInstructions(options = {}) {
  document.querySelector(".install-modal")?.remove();
  const { isIos, isSafari, isInAppBrowser } = installEnvironment();
  const currentUrl = appStartUrl();
  const iosTitle = "Встановити ярлик на iPhone";
  const title = isIos ? iosTitle : tr("installTitle");
  const message = isIos
    ? (isSafari
      ? "На iPhone Apple не дозволяє сайту встановити ярлик автоматично. Це займає кілька секунд у Safari:"
      : "Ви відкрили сайт не в Safari. На iPhone ярлик можна додати тільки через Safari:")
    : tr("installAndroid");
  const steps = isIos
    ? (isSafari
      ? [
        "Переконайтеся, що сторінка відкрита саме в Safari.",
        "У нижній панелі Safari натисніть кнопку «Поділитися» - це квадрат зі стрілкою вгору.",
        "У меню, яке відкриється, прокрутіть список нижче і натисніть «На початковий екран» або «Add to Home Screen».",
        "На екрані з назвою CryptoStar натисніть «Додати» у правому верхньому куті.",
        "Поверніться на головний екран iPhone: там з'явиться ярлик додатку."
      ]
      : [
        "Натисніть велику кнопку «Відкрити в Safari» нижче.",
        "Якщо iPhone залишив сторінку в Telegram або іншому вікні, натисніть «Скопіювати адресу», відкрийте Safari вручну і вставте адресу в рядок пошуку зверху.",
        "Коли сторінка відкриється в Safari, натисніть внизу кнопку «Поділитися» - квадрат зі стрілкою вгору.",
        "Прокрутіть меню нижче і натисніть «На початковий екран» або «Add to Home Screen».",
        "Натисніть «Додати» у правому верхньому куті. Ярлик з'явиться на головному екрані iPhone."
      ]
    )
    : [];
  const modal = document.createElement("div");
  modal.className = "install-modal visible";
  modal.innerHTML = `
    <div class="install-card">
      <h2>${supportEscape(title)}</h2>
      <p>${supportEscape(message)}</p>
      ${isIos ? `
        <ol class="install-steps">
          ${steps.map(step => `<li>${supportEscape(step)}</li>`).join("")}
        </ol>
        ${isInAppBrowser ? `<p class="install-note">У Telegram також можна натиснути три крапки у верхньому правому куті та вибрати «Відкрити в Safari». Після цього виконайте кроки з кнопкою «Поділитися».</p>` : ""}
        ${!isSafari ? `<a class="open-safari-btn" href="${supportEscape(currentUrl)}" target="_blank" rel="noopener">Відкрити в Safari</a>` : ""}
        <div class="install-url">${supportEscape(currentUrl)}</div>
        <button class="copy-install-url" type="button">Скопіювати адресу</button>
      ` : ""}
      <button type="button">${tr("installClose")}</button>
    </div>
  `;
  modal.addEventListener("click", event => {
    if (event.target?.classList?.contains("copy-install-url")) {
      navigator.clipboard?.writeText(currentUrl).then(() => {
        event.target.textContent = "Адресу скопійовано";
      }).catch(() => {
        event.target.textContent = currentUrl;
      });
      return;
    }
    if (event.target?.classList?.contains("open-safari-btn")) {
      tryOpenSafari(currentUrl);
      return;
    }
    if (event.target === modal || (event.target.tagName === "BUTTON" && !event.target.classList.contains("copy-install-url"))) modal.remove();
  });
  document.body.append(modal);
  if (options.autoOpen && isIos && !isSafari) tryOpenSafari(currentUrl);
}

const supportApiUrl = ["localhost", "127.0.0.1"].includes(location.hostname) ? location.origin : "https://cryptoapp-eqc5.onrender.com";

function supportEscape(value) {
  return String(value ?? "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
}

function supportRoleLabel(role) {
  if (role === "user") return "Ви";
  if (role === "support") return "Підтримка";
  return "AI оператор";
}

function renderSupportMessages(messages = []) {
  const box = document.querySelector(".support-messages");
  if (!box) return;
  box.innerHTML = messages.length ? messages.map(item => `
    <div class="support-msg ${supportEscape(item.role || "bot")}">
      <b>${supportEscape(supportRoleLabel(item.role))}</b><br>
      ${supportEscape(item.text)}
      <small>${item.created_at ? new Date(item.created_at).toLocaleString() : ""}</small>
    </div>
  `).join("") : `<div class="support-msg bot"><b>AI оператор</b><br>Напишіть питання про додаток, поповнення, вивід, навчання або сателітів.</div>`;
  box.scrollTop = box.scrollHeight;
  window.appTranslate?.translatePage();
}

async function loadSupportHistory() {
  const token = localStorage.getItem("token");
  if (!token && localStorage.getItem("logged_in") !== "1") return;
  try {
    const response = await fetch(supportApiUrl + "/support/history", { credentials: "include", headers: token ? { Authorization: token } : {} });
    const data = await response.json();
    if (data.success) renderSupportMessages(data.messages || []);
  } catch {}
}

async function sendSupportMessage() {
  const input = document.querySelector(".support-input");
  const text = input?.value.trim();
  const token = localStorage.getItem("token");
  if (!text || (!token && localStorage.getItem("logged_in") !== "1")) return;
  input.value = "";
  renderSupportMessages([{ role: "user", text, created_at: new Date().toISOString() }, { role: "bot", text: "Пишу відповідь...", created_at: new Date().toISOString() }]);
  try {
    const response = await fetch(supportApiUrl + "/support/chat", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: token } : {}) },
      body: JSON.stringify({ message: text })
    });
    const data = await response.json();
    if (!data.success) throw new Error("support");
    await loadSupportHistory();
  } catch {
    renderSupportMessages([{ role: "bot", text: "Підтримка тимчасово недоступна. Спробуйте ще раз трохи пізніше.", created_at: new Date().toISOString() }]);
  }
}

function openSupportWidget() {
  let modal = document.querySelector(".support-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "support-modal";
    modal.innerHTML = `
      <div class="support-card">
        <div class="support-head">
          <div><b>AI оператор</b><span>Якщо питання складне, його побачить підтримка.</span></div>
          <button type="button" class="support-close">x</button>
        </div>
        <div class="support-messages"></div>
        <div class="support-form">
          <textarea class="support-input" placeholder="Напишіть питання..."></textarea>
          <button type="button" class="support-send">Надіслати</button>
        </div>
      </div>
    `;
    modal.addEventListener("click", event => {
      if (event.target === modal || event.target.classList.contains("support-close")) modal.classList.remove("visible");
    });
    modal.querySelector(".support-send").addEventListener("click", sendSupportMessage);
    modal.querySelector(".support-input").addEventListener("keydown", event => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendSupportMessage();
      }
    });
    document.body.append(modal);
  }
  modal.classList.add("visible");
  loadSupportHistory();
}

function renderSupportButton() {
  if (document.body.dataset.noNav === "true" || (localStorage.getItem("logged_in") !== "1" && !localStorage.getItem("token"))) return;
  if (document.querySelector(".support-fab")) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "support-fab";
  button.textContent = tr("support");
  button.addEventListener("click", openSupportWidget);
  document.body.append(button);
  document.addEventListener("focusin", event => {
    if (event.target.matches("input, textarea, select, button")) button.classList.add("is-hidden");
  });
  document.addEventListener("focusout", event => {
    if (event.target.matches("input, textarea, select")) setTimeout(() => {
      if (!document.activeElement?.matches("input, textarea, select")) button.classList.remove("is-hidden");
    }, 120);
  });
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
    ["apple-mobile-web-app-title", "CryptoStar"]
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
      <img src="logo.png" alt="CryptoStar">
    </button>
  `;
  brand.querySelector("button").addEventListener("click", () => location.href = "index.html");
  brand.append(renderLanguageSelector());
  document.body.prepend(brand);
  renderInstallButton();
  renderSupportButton();
  document.addEventListener("click", event => {
    const link = event.target.closest("a[href]");
    if (!link || link.target || link.href.startsWith("javascript:") || link.origin !== location.origin) return;
    if (link.pathname === location.pathname && link.search === location.search) return;
    showAppLoading("CryptoStar");
  });
  window.addEventListener("beforeunload", () => showAppLoading("CryptoStar"));

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
  installTranslatedAlerts();
  scheduleFullPageTranslation(1400);
  setTimeout(() => window.appTranslate?.translatePage(), 3200);
  window.dispatchEvent(new CustomEvent("app-language-ready"));
  hideLanguageLoading();
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
