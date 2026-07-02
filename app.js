const StorageManager = {
  KEYS: {
    USER: "cv_tracker_user",
    CV: "cv_tracker_cv",
    JOBS: "jobtrack_jobs",
    INTERVIEWS: "jobtrack_interviews",
    ANALYSES: "cv_tracker_analyses",
    SETTINGS: "cv_tracker_settings"
  },

  get(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Storage error:", error);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Storage error:", error);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Storage error:", error);
      return false;
    }
  }
};

const AppState = {
  currentTab: "jobs",
  language: "en",
  user: null,
  jobs: [],
  interviews: [],
  analyses: [],
  settings: {
    onboardingCompleted: false,
    language: "en"
  },

  load() {
    this.user = StorageManager.get(StorageManager.KEYS.USER);
    this.jobs = (StorageManager.get(StorageManager.KEYS.JOBS) || []).map(normalizeJob);
    this.interviews = (StorageManager.get(StorageManager.KEYS.INTERVIEWS) || []).map(normalizeInterview);
    this.analyses = StorageManager.get(StorageManager.KEYS.ANALYSES) || [];
    this.settings = {
      ...this.settings,
      ...(StorageManager.get(StorageManager.KEYS.SETTINGS) || {})
    };
    this.language = this.settings.language || "en";
  },

  saveAnalyses() {
    saveAnalyses();
  }
};

let onboardingStep = 1;
let editingJobId = null;
let highlightedJobId = null;
let editingInterviewId = null;
let currentInterviewView = "upcoming";
let selectedInterviewDate = "";
let analyzerMode = "job_match";
let analyzerCvText = "";
let analyzerCvFileName = "";
let analyzerInterviewPrefill = null;
let settingsModalReturnFocus = null;
let isAnalyzing = false;
let lastAnalysisTime = 0;
let statusChart = null;
let weeklyChart = null;
let statsChartType = "bar";

const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_CV_TEXT_CHARS = 15000;
const ANALYSIS_COOLDOWN_MS = 5000;

const JobFilters = {
  search: "",
  status: "all",
  priority: "all",
  source: "all"
};

const StatsFilters = {
  period: "all"
};

const STATS_PERIOD_OPTIONS = ["week", "month", "quarter", "all"];
const APP_VERSION = "1.0.0";
const EXPORT_FORMAT = "cv-tracker-export";

const CAREER_OPS_PROFILE = {
  targetCountry: "Germany",
  targetCities: [
    "Mannheim",
    "Frankfurt",
    "Heidelberg",
    "Ludwigshafen",
    "Frankfurt area",
    "nearby cities"
  ],
  background: [
    "ELV / ICT / Facility Management technical professional",
    "Qatar major stadium and city command center project experience",
    "Lusail Stadium, Al Bayt Stadium, and Lusail City Command & Control"
  ],
  strengths: [
    "CCTV",
    "Access Control",
    "BMS",
    "Fire Alarm Systems",
    "AV systems",
    "Turnstiles",
    "OCC / LCCC coordination",
    "Contractor coordination",
    "Facility operations",
    "Issue tracking and documentation",
    "Working under event pressure"
  ],
  targetRoles: [
    "ELV Engineer",
    "Facility Management Engineer",
    "IT Support Engineer",
    "IT Operations Specialist",
    "Technical Project Coordinator",
    "Security Systems Engineer",
    "Gebäudeautomation",
    "Sicherheitstechnik",
    "Junior Bauleiter / Assistant Project Coordinator only if realistic"
  ],
  rules: [
    "Never suggest auto-submitting applications. Only analyze jobs and prepare materials for the user's review.",
    "Penalize jobs requiring fluent German C1.",
    "Flag jobs requiring a German driving license as a risk.",
    "Prioritize jobs where English or German B1/B2 is enough.",
    "Avoid pure software developer jobs.",
    "Prefer practical facility operations, ELV, ICT, security systems, building automation, IT support, and technical coordination roles."
  ]
};

const SPECIALTY_OPTIONS = [
  { ar: "تطوير برمجيات", en: "Software Development" },
  { ar: "تطوير واجهات أمامية", en: "Frontend Development" },
  { ar: "تطوير خلفيات", en: "Backend Development" },
  { ar: "تطوير شامل", en: "Full-Stack Development" },
  { ar: "تطوير تطبيقات الموبايل", en: "Mobile App Development" },
  { ar: "هندسة DevOps", en: "DevOps Engineering" },
  { ar: "الحوسبة السحابية", en: "Cloud Computing" },
  { ar: "الأمن السيبراني", en: "Cybersecurity" },
  { ar: "ضمان الجودة واختبار البرمجيات", en: "Quality Assurance and Software Testing" },
  { ar: "تحليل البيانات", en: "Data Analytics" },
  { ar: "علم البيانات", en: "Data Science" },
  { ar: "هندسة البيانات", en: "Data Engineering" },
  { ar: "ذكاء الأعمال", en: "Business Intelligence" },
  { ar: "الذكاء الاصطناعي وتعلم الآلة", en: "AI and Machine Learning" },
  { ar: "إدارة المنتجات", en: "Product Management" },
  { ar: "إدارة المشاريع", en: "Project Management" },
  { ar: "تصميم UI/UX", en: "UI/UX Design" },
  { ar: "تصميم المنتجات", en: "Product Design" },
  { ar: "التصميم الجرافيكي", en: "Graphic Design" },
  { ar: "كتابة المحتوى والتحرير", en: "Content Writing and Editing" },
  { ar: "التسويق الرقمي", en: "Digital Marketing" },
  { ar: "تحسين محركات البحث SEO", en: "SEO" },
  { ar: "إدارة وسائل التواصل الاجتماعي", en: "Social Media Management" },
  { ar: "المبيعات وتطوير الأعمال", en: "Sales and Business Development" },
  { ar: "نجاح العملاء", en: "Customer Success" },
  { ar: "خدمة العملاء", en: "Customer Service" },
  { ar: "الموارد البشرية", en: "Human Resources" },
  { ar: "التوظيف واستقطاب المواهب", en: "Recruiting and Talent Acquisition" },
  { ar: "الإدارة والمساعدة الإدارية", en: "Administrative Assistance" },
  { ar: "العمليات", en: "Operations" },
  { ar: "إدارة سلسلة الإمداد واللوجستيات", en: "Supply Chain and Logistics" },
  { ar: "المالية والمحاسبة", en: "Finance and Accounting" },
  { ar: "التدقيق", en: "Auditing" },
  { ar: "الخدمات المصرفية", en: "Banking" },
  { ar: "التأمين", en: "Insurance" },
  { ar: "الاستشارات", en: "Consulting" },
  { ar: "القانون والشؤون القانونية", en: "Legal" },
  { ar: "التعليم والتدريب", en: "Education and Training" },
  { ar: "الرعاية الصحية والتمريض", en: "Healthcare and Nursing" },
  { ar: "الصيدلة", en: "Pharmacy" },
  { ar: "الهندسة المدنية", en: "Civil Engineering" },
  { ar: "الهندسة الميكانيكية", en: "Mechanical Engineering" },
  { ar: "الهندسة الكهربائية", en: "Electrical Engineering" },
  { ar: "أنظمة ELV و ICT", en: "ELV and ICT Systems" },
  { ar: "إدارة المرافق", en: "Facility Management" },
  { ar: "أنظمة الأمن والسلامة", en: "Security Systems Engineering" },
  { ar: "أتمتة المباني", en: "Building Automation / Gebäudeautomation" },
  { ar: "الدعم الفني لتقنية المعلومات", en: "IT Support and Operations" },
  { ar: "تنسيق المشاريع الفنية", en: "Technical Project Coordination" },
  { ar: "الهندسة الصناعية", en: "Industrial Engineering" },
  { ar: "العمارة والتصميم الداخلي", en: "Architecture and Interior Design" },
  { ar: "البناء وإدارة المواقع", en: "Construction and Site Management" },
  { ar: "التصنيع والإنتاج", en: "Manufacturing and Production" },
  { ar: "العلوم والبحث العلمي", en: "Science and Research" },
  { ar: "البيئة والاستدامة", en: "Environment and Sustainability" },
  { ar: "الطاقة والنفط والغاز", en: "Energy, Oil and Gas" },
  { ar: "السياحة والضيافة", en: "Tourism and Hospitality" },
  { ar: "المطاعم وخدمات الطعام", en: "Food and Beverage" },
  { ar: "البيع بالتجزئة", en: "Retail" },
  { ar: "العقارات", en: "Real Estate" },
  { ar: "الإعلام والصحافة", en: "Media and Journalism" },
  { ar: "الفنون والترفيه", en: "Arts and Entertainment" },
  { ar: "التصوير وإنتاج الفيديو", en: "Photography and Video Production" },
  { ar: "الترجمة واللغات", en: "Translation and Languages" },
  { ar: "المنظمات غير الربحية", en: "Nonprofit" },
  { ar: "السلامة والصحة المهنية", en: "Health and Safety" },
  { ar: "أخرى", en: "Other" }
];

const COUNTRY_CODES = [
  "AF", "AX", "AL", "DZ", "AS", "AD", "AO", "AI", "AQ", "AG", "AR", "AM", "AW", "AU", "AT", "AZ",
  "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BM", "BT", "BO", "BQ", "BA", "BW", "BV", "BR", "IO", "BN", "BG", "BF", "BI",
  "KH", "CM", "CA", "CV", "KY", "CF", "TD", "CL", "CN", "CX", "CC", "CO", "KM", "CG", "CD", "CK", "CR", "CI", "HR", "CU", "CW", "CY", "CZ",
  "DK", "DJ", "DM", "DO", "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET",
  "FK", "FO", "FJ", "FI", "FR", "GF", "PF", "TF",
  "GA", "GM", "GE", "DE", "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW", "GY",
  "HT", "HM", "VA", "HN", "HK", "HU",
  "IS", "IN", "ID", "IR", "IQ", "IE", "IM", "IL", "IT",
  "JM", "JP", "JE", "JO",
  "KZ", "KE", "KI", "KP", "KR", "KW", "KG",
  "LA", "LV", "LB", "LS", "LR", "LY", "LI", "LT", "LU",
  "MO", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MQ", "MR", "MU", "YT", "MX", "FM", "MD", "MC", "MN", "ME", "MS", "MA", "MZ", "MM",
  "NA", "NR", "NP", "NL", "NC", "NZ", "NI", "NE", "NG", "NU", "NF", "MK", "MP", "NO",
  "OM", "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PH", "PN", "PL", "PT", "PR",
  "QA", "RE", "RO", "RU", "RW",
  "BL", "SH", "KN", "LC", "MF", "PM", "VC", "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SX", "SK", "SI", "SB", "SO", "ZA", "GS", "SS", "ES", "LK", "SD", "SR", "SJ", "SE", "CH", "SY",
  "TW", "TJ", "TZ", "TH", "TL", "TG", "TK", "TO", "TT", "TN", "TR", "TM", "TC", "TV",
  "UG", "UA", "AE", "GB", "US", "UM", "UY", "UZ",
  "VU", "VE", "VN", "VG", "VI",
  "WF", "EH", "YE", "ZM", "ZW"
];

const JOB_STATUS_OPTIONS = [
  "sent",
  "under_review",
  "interview",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
  "ghosted",
  "archived"
];

const SIMPLE_APPLICATION_STATUS_OPTIONS = ["sent", "under_review", "interview", "rejected"];

const JOB_PRIORITY_OPTIONS = ["high", "medium", "low"];

const JOB_SOURCE_OPTIONS = [
  "linkedin",
  "indeed",
  "bayt",
  "glassdoor",
  "company_site",
  "referral",
  "recruiter",
  "whatsapp",
  "other"
];

const JOB_TYPE_OPTIONS = ["full_time", "part_time", "remote", "hybrid", "contract"];

const INTERVIEW_ROUND_TYPE_OPTIONS = ["hr", "technical", "managerial", "cultural_fit", "final", "assessment", "other"];
const INTERVIEW_FORMAT_OPTIONS = ["video", "phone", "in_person", "async_video"];
const INTERVIEW_STATUS_OPTIONS = ["scheduled", "completed", "cancelled", "rescheduled", "no_show"];
const INTERVIEW_RESULT_OPTIONS = ["passed", "failed", "pending", "waiting"];

function uuid() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

function toLocalISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayISO() {
  return toLocalISODate(new Date());
}

function addDaysISO(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toLocalISODate(date);
}

function addDaysToISO(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toLocalISODate(date);
}

function endOfWeekISO() {
  const today = new Date(`${todayISO()}T00:00:00`);
  const day = today.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  today.setDate(today.getDate() + daysUntilSunday);
  return toLocalISODate(today);
}

function formatDate(isoDate) {
  if (!isoDate) return "";

  const locale = AppState.language === "ar" ? "ar" : "en";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(isoDate));
}

function daysBetweenISO(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  return Math.floor((end - start) / 86400000);
}

function t(key) {
  const languagePack = TRANSLATIONS[AppState.language] || TRANSLATIONS.ar;
  return key.split(".").reduce((value, part) => {
    if (value && Object.prototype.hasOwnProperty.call(value, part)) {
      return value[part];
    }
    return null;
  }, languagePack) || key;
}

function formatMessage(key, values = {}) {
  return Object.entries(values).reduce((message, [name, value]) => {
    return message.replaceAll(`{${name}}`, value);
  }, t(key));
}

function getRelativeDateLabel(isoDate) {
  const distance = daysBetweenISO(isoDate, todayISO());

  if (distance === 0) return t("todayDashboard.relativeToday");
  if (distance === 1) return t("todayDashboard.yesterday");
  if (distance > 1) return formatMessage("todayDashboard.daysAgo", { count: distance });

  return formatDate(isoDate);
}

function renderTodayIfActive() {
  if (AppState.currentTab === "today") {
    renderTodayDashboard();
  }
}

function renderStatsIfActive() {
  if (AppState.currentTab === "stats") {
    renderStats();
  }
}

function setLanguage(lang) {
  AppState.language = lang === "en" ? "en" : "ar";
  AppState.settings = {
    ...AppState.settings,
    language: AppState.language
  };

  document.documentElement.lang = AppState.language;
  document.documentElement.dir = AppState.language === "ar" ? "rtl" : "ltr";
  document.body.style.fontFamily = AppState.language === "ar"
    ? "\"Noto Sans Arabic\", \"DM Sans\", sans-serif"
    : "\"DM Sans\", \"Noto Sans Arabic\", sans-serif";

  StorageManager.set(StorageManager.KEYS.SETTINGS, AppState.settings);
  translatePage();
  if (!document.getElementById("onboarding-screen")?.classList.contains("hidden")) {
    showStep(onboardingStep);
  }
  populateSuggestionLists();
  populateJobSelects();
  populateInterviewSelects();
  updateHeader();
  renderEmptyStates();
  renderTodayIfActive();
  renderStatsIfActive();
  renderJobs();
  if (AppState.currentTab === "interviews") renderInterviews();
}

function translatePage() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });

  document.querySelectorAll("[data-language-option]").forEach((button) => {
    button.classList.toggle("active", button.dataset.languageOption === AppState.language);
  });
}

function countryFlag(countryCode) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)));
}

function getCountryName(countryCode, language = AppState.language) {
  if (typeof Intl.DisplayNames !== "function") return countryCode;

  const locale = language === "ar" ? "ar" : "en-US";
  const displayNames = new Intl.DisplayNames([locale], { type: "region" });
  return displayNames.of(countryCode) || countryCode;
}

function getLocalizedCountryOptions() {
  const locale = AppState.language === "ar" ? "ar" : "en-US";
  const collator = new Intl.Collator(locale, {
    sensitivity: "base",
    ignorePunctuation: true,
    numeric: true
  });

  return COUNTRY_CODES
    .map((code) => ({
      code,
      flag: countryFlag(code),
      label: getCountryName(code, AppState.language),
      alternateLabel: getCountryName(code, AppState.language === "ar" ? "en" : "ar")
    }))
    .sort((first, second) => collator.compare(first.label, second.label));
}

function normalizeCountrySearch(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getCountryInputValue(country) {
  return `${country.flag} ${country.label}`;
}

function getFilteredCountryOptions(query = "", limit = 12) {
  const normalizedQuery = normalizeCountrySearch(query);
  const countries = getLocalizedCountryOptions();

  if (!normalizedQuery) return countries.slice(0, limit);

  return countries
    .map((country) => {
      const label = normalizeCountrySearch(country.label);
      const alternateLabel = normalizeCountrySearch(country.alternateLabel);
      const code = normalizeCountrySearch(country.code);
      const searchText = [label, alternateLabel, code].join(" ");
      let rank = 4;

      if (label.startsWith(normalizedQuery)) rank = 0;
      else if (alternateLabel.startsWith(normalizedQuery)) rank = 1;
      else if (code.startsWith(normalizedQuery)) rank = 2;
      else if (searchText.includes(normalizedQuery)) rank = 3;

      return { country, rank };
    })
    .filter((item) => item.rank < 4)
    .sort((first, second) => first.rank - second.rank)
    .map((item) => item.country)
    .slice(0, limit);
}

function ensureCountrySuggestions(input) {
  const field = input.closest(".field") || input.parentElement;
  if (!field) return null;

  let suggestions = field.querySelector(".country-suggestions");
  if (!suggestions) {
    suggestions = document.createElement("div");
    suggestions.className = "country-suggestions hidden";
    suggestions.setAttribute("role", "listbox");
    suggestions.id = `${input.id || "country"}-suggestions`;
    input.setAttribute("aria-controls", suggestions.id);
    field.appendChild(suggestions);
  }

  return suggestions;
}

function renderCountrySuggestions(input) {
  const suggestions = ensureCountrySuggestions(input);
  if (!suggestions) return;

  const options = getFilteredCountryOptions(input.value);
  suggestions.innerHTML = "";

  options.forEach((country) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "country-option";
    button.dataset.countryCode = country.code;
    button.setAttribute("role", "option");
    button.innerHTML = `
      <span class="country-option-flag">${escapeHTML(country.flag)}</span>
      <span class="country-option-main">${escapeHTML(country.label)}</span>
      <span class="country-option-alt">${escapeHTML(country.alternateLabel)} · ${escapeHTML(country.code)}</span>
    `;
    suggestions.appendChild(button);
  });

  suggestions.classList.toggle("hidden", options.length === 0);
}

function hideCountrySuggestions(input) {
  const suggestions = input
    ? input.closest(".field")?.querySelector(".country-suggestions")
    : document.querySelector(".country-suggestions:not(.hidden)");
  if (suggestions) suggestions.classList.add("hidden");
}

function selectCountryOption(input, countryCode) {
  const country = getLocalizedCountryOptions().find((item) => item.code === countryCode);
  if (!country) return;

  input.value = getCountryInputValue(country);
  hideCountrySuggestions(input);
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function bindCountryFieldEvents() {
  if (document.body.dataset.countryEventsBound === "true") return;
  document.body.dataset.countryEventsBound = "true";

  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-country-input]")) {
      renderCountrySuggestions(event.target);
    }
  });

  document.addEventListener("focusin", (event) => {
    if (event.target.matches("[data-country-input]")) {
      renderCountrySuggestions(event.target);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && event.target.matches("[data-country-input]")) {
      hideCountrySuggestions(event.target);
    }
  });

  document.addEventListener("click", (event) => {
    const option = event.target.closest(".country-option");
    if (option) {
      const field = option.closest(".field");
      const input = field?.querySelector("[data-country-input]");
      if (input) selectCountryOption(input, option.dataset.countryCode);
      return;
    }

    if (!event.target.closest(".country-suggestions") && !event.target.matches("[data-country-input]")) {
      document.querySelectorAll(".country-suggestions").forEach((suggestions) => {
        suggestions.classList.add("hidden");
      });
    }
  });
}

function populateSuggestionLists() {
  const specialtyList = document.getElementById("specialty-options");
  const countryList = document.getElementById("country-options");
  const collator = new Intl.Collator(AppState.language === "ar" ? "ar" : "en", { sensitivity: "base" });

  if (specialtyList) {
    specialtyList.innerHTML = "";
    [...SPECIALTY_OPTIONS]
      .sort((first, second) => collator.compare(first[AppState.language], second[AppState.language]))
      .forEach((specialty) => {
        const option = document.createElement("option");
        option.value = specialty[AppState.language];
        option.label = specialty.en;
        specialtyList.appendChild(option);
      });
  }

  if (countryList) {
    countryList.innerHTML = "";
    getLocalizedCountryOptions()
      .forEach((country) => {
        const option = document.createElement("option");
        option.value = `${country.flag} ${country.label}`;
        option.label = `${country.alternateLabel} · ${country.code}`;
        countryList.appendChild(option);
      });
  }
}

function showToast(messageKey) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = t(messageKey);
  container.appendChild(toast);

  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    window.setTimeout(() => toast.remove(), 300);
  }, 2600);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isLibraryAvailable(name) {
  const libraries = {
    Chart: () => Boolean(window.Chart),
    lucide: () => Boolean(window.lucide),
    marked: () => Boolean(window.marked),
    DOMPurify: () => Boolean(window.DOMPurify),
    pdfjsLib: () => Boolean(window.pdfjsLib)
  };

  return Boolean(libraries[name]?.());
}

function safeInitIcons() {
  if (!isLibraryAvailable("lucide")) return;
  window.lucide.createIcons();
}

function safeRenderMarkdown(markdown) {
  const source = String(markdown ?? "");

  if (isLibraryAvailable("marked") && isLibraryAvailable("DOMPurify")) {
    return window.DOMPurify.sanitize(window.marked.parse(source));
  }

  return escapeHTML(source).replace(/\n/g, "<br>");
}

function isSafeUrl(url) {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function initExternalLibraries() {
  safeInitIcons();

  const shouldLogLibraries =
    window.location.protocol === "file:" ||
    ["localhost", "127.0.0.1"].includes(window.location.hostname) ||
    window.location.search.includes("debug=true");

  if (!shouldLogLibraries) return;

  const available = ["Chart", "lucide", "marked", "DOMPurify", "pdfjsLib"]
    .filter((libraryName) => isLibraryAvailable(libraryName));

  console.info("External libraries ready:", available.join(", ") || "none");
}

function normalizeJob(job) {
  return {
    id: job?.id || uuid(),
    jobTitle: job?.jobTitle || "",
    company: job?.company || "",
    location: job?.location || "",
    jobType: job?.jobType || "full_time",
    status: job?.status || "sent",
    priority: job?.priority || "medium",
    source: job?.source || "linkedin",
    salary: job?.salary || "",
    jobUrl: job?.jobUrl || "",
    contactName: job?.contactName || "",
    contactEmail: job?.contactEmail || "",
    notes: job?.notes || "",
    followUpDate: job?.followUpDate || null,
    followUpCount: Number(job?.followUpCount || 0),
    appliedDate: job?.appliedDate || todayISO(),
    activityLog: Array.isArray(job?.activityLog)
      ? job.activityLog.map((item) => ({
        id: item.id || uuid(),
        date: item.date || todayISO(),
        action: item.action || item.type || "updated",
        note: item.note || ""
      }))
      : [],
    isArchived: Boolean(job?.isArchived || job?.status === "archived"),
    createdAt: job?.createdAt || todayISO(),
    updatedAt: job?.updatedAt || todayISO()
  };
}

function normalizeInterview(interview) {
  return {
    id: interview?.id || uuid(),
    jobId: interview?.jobId || "",
    jobTitle: interview?.jobTitle || "",
    company: interview?.company || "",
    round: Number(interview?.round || 1),
    roundType: interview?.roundType || "hr",
    interviewDate: interview?.interviewDate || "",
    interviewTime: interview?.interviewTime || "",
    duration: interview?.duration || "",
    format: interview?.format || "video",
    platform: interview?.platform || "",
    location: interview?.location || "",
    interviewerName: interview?.interviewerName || "",
    interviewerTitle: interview?.interviewerTitle || "",
    status: interview?.status || "scheduled",
    result: interview?.result || "",
    notes: interview?.notes || "",
    postInterviewNotes: interview?.postInterviewNotes || "",
    questionsAsked: interview?.questionsAsked || "",
    preparationNotes: interview?.preparationNotes || "",
    googleMapsUrl: interview?.googleMapsUrl || "",
    meetingUrl: interview?.meetingUrl || "",
    createdAt: interview?.createdAt || todayISO(),
    updatedAt: interview?.updatedAt || todayISO()
  };
}

function saveJobs() {
  StorageManager.set(StorageManager.KEYS.JOBS, AppState.jobs);
}

function saveInterviews() {
  StorageManager.set(StorageManager.KEYS.INTERVIEWS, AppState.interviews);
}

function saveAnalyses() {
  StorageManager.set(StorageManager.KEYS.ANALYSES, AppState.analyses);
}

function getGeminiApiKey() {
  return AppState.settings.geminiApiKey || "";
}

function setGeminiApiKey(key) {
  AppState.settings = {
    ...AppState.settings,
    geminiApiKey: String(key || "").trim()
  };
  StorageManager.set(StorageManager.KEYS.SETTINGS, AppState.settings);
}

function getStoredCv() {
  return StorageManager.get(StorageManager.KEYS.CV);
}

function formatDateForFilename(date = new Date()) {
  return toLocalISODate(date);
}

function buildExportPayload(type = "all") {
  const exportedAt = new Date().toISOString();

  if (type === "all") {
    return {
      app: "AI CV Tracker",
      version: APP_VERSION,
      exportedAt,
      data: {
        user: AppState.user,
        cv: getStoredCv(),
        jobs: AppState.jobs,
        interviews: AppState.interviews,
        analyses: AppState.analyses,
        settings: AppState.settings
      }
    };
  }

  const partialData = {
    jobs: AppState.jobs,
    interviews: AppState.interviews,
    analyses: AppState.analyses,
    settings: AppState.settings
  };

  return {
    app: "AI CV Tracker",
    type,
    exportedAt,
    data: partialData[type] ?? {}
  };
}

function getExportFileName(type = "all") {
  const date = formatDateForFilename();
  const fileNames = {
    all: `ai-cv-tracker-backup-${date}.json`,
    jobs: `jobs-export-${date}.json`,
    interviews: `interviews-export-${date}.json`,
    analyses: `analyses-export-${date}.json`,
    settings: `settings-export-${date}.json`
  };

  return fileNames[type] || fileNames.all;
}

function downloadJSON(fileName, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportData(type = "all") {
  const payload = buildExportPayload(type);
  downloadJSON(getExportFileName(type), payload);
  showSettingsToast("settings.exportCompleted", "success");
}

function validateImportData(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (!raw.data) return null;

  const safeArray = (value) => (Array.isArray(value) ? value : []);
  const makeParsed = (data, sourceType = "all") => {
    const hasKey = (key) => Object.prototype.hasOwnProperty.call(data, key);
    const parsed = {
      sourceType,
      hasJobs: hasKey("jobs"),
      hasInterviews: hasKey("interviews"),
      hasAnalyses: hasKey("analyses"),
      hasSettings: hasKey("settings"),
      hasUser: hasKey("user"),
      hasCv: hasKey("cv"),
      jobs: safeArray(data.jobs),
      interviews: safeArray(data.interviews),
      analyses: safeArray(data.analyses),
      settings: data.settings && typeof data.settings === "object" && !Array.isArray(data.settings) ? data.settings : null,
      user: data.user && typeof data.user === "object" && !Array.isArray(data.user) ? data.user : null,
      cv: data.cv && typeof data.cv === "object" && !Array.isArray(data.cv) ? data.cv : null
    };

    const arraysValid = (!parsed.hasJobs || Array.isArray(data.jobs))
      && (!parsed.hasInterviews || Array.isArray(data.interviews))
      && (!parsed.hasAnalyses || Array.isArray(data.analyses));
    const objectsValid = (!parsed.hasSettings || Boolean(parsed.settings))
      && (!parsed.hasUser || Boolean(parsed.user))
      && (!parsed.hasCv || Boolean(parsed.cv));

    return arraysValid && objectsValid ? parsed : null;
  };

  if (raw.app === "AI CV Tracker" && raw.data && typeof raw.data === "object") {
    if (raw.type) {
      if (["jobs", "interviews", "analyses"].includes(raw.type)) {
        if (!Array.isArray(raw.data)) return null;
        return makeParsed({ [raw.type]: raw.data }, raw.type);
      }
      if (raw.type === "settings") {
        if (!raw.data || typeof raw.data !== "object" || Array.isArray(raw.data)) return null;
        return makeParsed({ settings: raw.data }, raw.type);
      }
      return null;
    }

    return makeParsed(raw.data, "all");
  }

  if (raw.format === EXPORT_FORMAT && raw.data && typeof raw.data === "object") {
    return makeParsed(raw.data, raw.scope || "legacy");
  }

  return null;
}

function validateImportPayload(raw) {
  return validateImportData(raw);
}

function getImportSummary(parsed) {
  return {
    jobs: parsed?.jobs?.length || 0,
    interviews: parsed?.interviews?.length || 0,
    analyses: parsed?.analyses?.length || 0,
    hasUser: Boolean(parsed?.user),
    hasSettings: Boolean(parsed?.settings)
  };
}

function mergeById(existing, incoming) {
  const map = new Map(existing.map((item) => [item.id, item]));
  incoming.forEach((item) => {
    if (item && item.id) map.set(item.id, item);
  });
  return Array.from(map.values());
}

function importData(parsed, mode = "merge") {
  if (!parsed) return false;

  const importedJobs = parsed.jobs.map(normalizeJob);
  const importedInterviews = parsed.interviews.map(normalizeInterview);

  if (mode === "replace") {
    if (parsed.hasJobs) AppState.jobs = importedJobs;
    if (parsed.hasInterviews) AppState.interviews = importedInterviews;
    if (parsed.hasAnalyses) AppState.analyses = parsed.analyses;
  } else {
    if (parsed.hasJobs) AppState.jobs = mergeById(AppState.jobs, importedJobs);
    if (parsed.hasInterviews) AppState.interviews = mergeById(AppState.interviews, importedInterviews);
    if (parsed.hasAnalyses) AppState.analyses = mergeById(AppState.analyses, parsed.analyses);
  }

  if (parsed.settings) {
    AppState.settings = { ...AppState.settings, ...parsed.settings };
    AppState.language = AppState.settings.language || AppState.language;
  }
  if (parsed.user) {
    AppState.user = parsed.user;
    StorageManager.set(StorageManager.KEYS.USER, AppState.user);
  }
  if (parsed.cv) {
    StorageManager.set(StorageManager.KEYS.CV, parsed.cv);
  }

  saveJobs();
  saveInterviews();
  saveAnalyses();
  StorageManager.set(StorageManager.KEYS.SETTINGS, AppState.settings);

  applyPreferences();
  updateHeader();
  populateJobSelects();
  populateInterviewSelects();
  renderTodayIfActive();
  if (AppState.currentTab === "jobs") renderJobs();
  if (AppState.currentTab === "interviews") renderInterviews();
  if (AppState.currentTab === "stats") renderStats();
  if (AppState.currentTab === "analyzer") renderAnalyzerReadiness();
  if (AppState.currentTab === "settings") renderSettingsReadiness();

  return true;
}

function applyImport(parsed, mode = "merge") {
  return importData(parsed, mode);
}

function createBackup() {
  exportData("all");
  saveSettings({ lastBackupAt: new Date().toISOString() });
  showSettingsToast("settings.backupCreated", "success");
  if (AppState.currentTab === "settings") renderSettings();
}

function getSettings() {
  return AppState.settings || {};
}

function saveSettings(partialSettings = {}) {
  AppState.settings = {
    ...AppState.settings,
    ...partialSettings
  };
  StorageManager.set(StorageManager.KEYS.SETTINGS, AppState.settings);
  return AppState.settings;
}

function applyPreferences() {
  const settings = getSettings();
  const theme = ["dark", "light", "system"].includes(settings.theme) ? settings.theme : "dark";

  document.documentElement.dataset.theme = theme;
  document.body.classList.toggle("compact-mode", Boolean(settings.compactMode));

  if (settings.defaultStatsPeriod && STATS_PERIOD_OPTIONS.includes(settings.defaultStatsPeriod)) {
    StatsFilters.period = settings.defaultStatsPeriod;
  }
}

async function readImportFile(file) {
  if (!file) return null;
  const text = await file.text();
  return JSON.parse(text);
}

function getActiveJobs() {
  return AppState.jobs.filter((job) => !["archived", "rejected", "withdrawn"].includes(job.status) && !job.isArchived);
}

function getFollowUpsDueToday() {
  return AppState.jobs.filter((job) => {
    return job.followUpDate
      && job.followUpDate <= todayISO()
      && !job.isArchived
      && !["rejected", "withdrawn"].includes(job.status);
  });
}

function getInterviewsThisWeek() {
  const today = todayISO();
  const weekEnd = endOfWeekISO();

  return AppState.interviews.filter((interview) => {
    return interview.interviewDate
      && interview.interviewDate >= today
      && interview.interviewDate <= weekEnd
      && ["scheduled", "rescheduled"].includes(interview.status);
  });
}

function getOffers() {
  return AppState.jobs.filter((job) => ["offer", "accepted"].includes(job.status) && !job.isArchived);
}

function getTodaySummary() {
  return {
    totalActive: getActiveJobs().length,
    followUpsDue: getFollowUpsDueToday().length,
    interviewsThisWeek: getInterviewsThisWeek().length,
    offers: getOffers().length
  };
}

function getLastActivityDate(job) {
  if (!Array.isArray(job.activityLog) || !job.activityLog.length) return null;
  return job.activityLog
    .map((item) => item.date)
    .filter(Boolean)
    .sort()
    .reverse()[0] || null;
}

function getHighPriorityNeedsAttention() {
  return AppState.jobs.filter((job) => {
    if (job.priority !== "high") return false;
    if (job.isArchived) return false;
    if (["rejected", "withdrawn", "accepted"].includes(job.status)) return false;

    const lastActivityDate = getLastActivityDate(job);
    return !lastActivityDate || daysBetweenISO(lastActivityDate, todayISO()) > 7;
  });
}

function getRecentActivities(limit = 5) {
  return AppState.jobs
    .flatMap((job) => {
      return (job.activityLog || []).map((activity) => ({
        ...activity,
        jobId: job.id,
        jobTitle: job.jobTitle,
        company: job.company
      }));
    })
    .filter((activity) => activity.date)
    .sort((first, second) => second.date.localeCompare(first.date))
    .slice(0, limit);
}

function getMotivationalMessage() {
  const summary = getTodaySummary();

  if (summary.offers > 0) return t("todayDashboard.motivationOffer");
  if (summary.followUpsDue > 0) {
    return formatMessage("todayDashboard.motivationFollowUps", { count: summary.followUpsDue });
  }
  if (!AppState.jobs.length) return t("todayDashboard.motivationNoJobs");

  return t("todayDashboard.motivationQuiet");
}

function toPercent(count, total) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

function getStatsPeriodStart(period = StatsFilters.period) {
  if (period === "week") return addDaysToISO(todayISO(), -6);
  if (period === "month") return addDaysToISO(todayISO(), -29);
  if (period === "quarter") return addDaysToISO(todayISO(), -89);
  return null;
}

function isDateWithinStatsPeriod(isoDate, period = StatsFilters.period) {
  if (!isoDate) return period === "all";
  const startDate = getStatsPeriodStart(period);
  return !startDate || isoDate >= startDate;
}

function getStatsJobs(period = StatsFilters.period) {
  return AppState.jobs.filter((job) => isDateWithinStatsPeriod(job.appliedDate || job.createdAt, period));
}

function getStatsInterviews(period = StatsFilters.period) {
  return AppState.interviews.filter((interview) => isDateWithinStatsPeriod(interview.interviewDate || interview.createdAt, period));
}

function getStatsSummary(jobs = getStatsJobs()) {
  const total = jobs.length;
  const active = jobs.filter((job) => !["archived", "rejected", "withdrawn"].includes(job.status) && !job.isArchived).length;
  const responseStatuses = ["under_review", "interview", "offer", "accepted"];
  const interviewStatuses = ["interview", "offer", "accepted"];
  const offerStatuses = ["offer", "accepted"];
  const rejected = jobs.filter((job) => job.status === "rejected").length;

  const responses = jobs.filter((job) => responseStatuses.includes(job.status)).length;
  const interviews = jobs.filter((job) => interviewStatuses.includes(job.status)).length;
  const offers = jobs.filter((job) => offerStatuses.includes(job.status)).length;

  return {
    totalApplications: total,
    activeApplications: active,
    responseRate: toPercent(responses, total),
    interviewRate: toPercent(interviews, total),
    offerRate: toPercent(offers, total),
    rejectionRate: toPercent(rejected, total)
  };
}

function getStatusDistribution(jobs = getStatsJobs()) {
  return JOB_STATUS_OPTIONS
    .map((status) => ({
      status,
      label: t(`statuses.${status}`),
      count: jobs.filter((job) => job.status === status).length
    }))
    .filter((item) => item.count > 0);
}

function getWeeklyApplicationActivity(jobs = getStatsJobs()) {
  const today = todayISO();
  const days = Array.from({ length: 7 }, (_, index) => addDaysToISO(today, index - 6));

  return days.map((date) => ({
    date,
    label: new Intl.DateTimeFormat(AppState.language === "ar" ? "ar" : "en", {
      weekday: "short",
      day: "numeric"
    }).format(new Date(`${date}T00:00:00`)),
    count: jobs.filter((job) => job.appliedDate === date).length
  }));
}

function getSourceAnalytics(jobs = getStatsJobs()) {
  const total = jobs.length;
  return JOB_SOURCE_OPTIONS
    .map((source) => {
      const count = jobs.filter((job) => job.source === source).length;
      return {
        source,
        label: t(`sources.${source}`),
        count,
        percentage: toPercent(count, total)
      };
    })
    .filter((item) => item.count > 0)
    .sort((first, second) => second.count - first.count);
}

function getSourceStats(jobs = getStatsJobs()) {
  return getSourceAnalytics(jobs);
}

function calculateAvgResponseTime(jobs = getStatsJobs()) {
  const responseStatuses = ["under_review", "interview", "offer", "accepted"];
  const responseTimes = jobs
    .filter((job) => responseStatuses.includes(job.status) && job.appliedDate && job.updatedAt)
    .map((job) => Math.max(0, daysBetweenISO(job.appliedDate, job.updatedAt)));

  if (!responseTimes.length) return null;
  return Math.round(responseTimes.reduce((sum, days) => sum + days, 0) / responseTimes.length);
}

function getApplicationsByWeek(weeks = 4, jobs = getStatsJobs()) {
  const today = todayISO();

  return Array.from({ length: weeks }, (_, index) => {
    const weekEnd = addDaysToISO(today, -(weeks - 1 - index) * 7);
    const weekStart = addDaysToISO(weekEnd, -6);
    const count = jobs.filter((job) => {
      const date = job.appliedDate || job.createdAt;
      return date && date >= weekStart && date <= weekEnd;
    }).length;

    return {
      weekStart,
      weekEnd,
      label: `${new Intl.DateTimeFormat(AppState.language === "ar" ? "ar" : "en", { month: "short", day: "numeric" }).format(new Date(`${weekStart}T00:00:00`))}`,
      count
    };
  });
}

function getInterviewPerformance(interviews = getStatsInterviews()) {
  const passed = interviews.filter((interview) => interview.result === "passed").length;
  const failed = interviews.filter((interview) => interview.result === "failed").length;
  const pending = interviews.filter((interview) => ["", "pending", "waiting"].includes(interview.result)).length;
  const decisiveTotal = passed + failed;
  const roundTypes = INTERVIEW_ROUND_TYPE_OPTIONS
    .map((roundType) => ({
      roundType,
      label: t(`interviewRoundTypes.${roundType}`),
      count: interviews.filter((interview) => interview.roundType === roundType).length
    }))
    .filter((item) => item.count > 0)
    .sort((first, second) => second.count - first.count);

  return {
    total: interviews.length,
    passed,
    failed,
    pending,
    successRate: toPercent(passed, decisiveTotal),
    roundTypes,
    mostCommonRoundType: roundTypes[0] || null
  };
}

function getInterviewSuccessStats(interviews = getStatsInterviews()) {
  const decisive = interviews.filter((interview) => ["passed", "failed"].includes(interview.result));
  const passed = decisive.filter((interview) => interview.result === "passed").length;
  const failed = decisive.filter((interview) => interview.result === "failed").length;

  return {
    total: decisive.length,
    passed,
    failed,
    rate: toPercent(passed, decisive.length)
  };
}

function collectActivityEvents() {
  const jobActivities = AppState.jobs.flatMap((job) => {
    const applicationDate = job.appliedDate || job.createdAt;
    const application = applicationDate
      ? [{
        id: `${job.id}-application`,
        date: applicationDate,
        title: `${job.jobTitle} · ${job.company}`,
        action: t("statsDashboard.timelineApplication")
      }]
      : [];

    const activities = (job.activityLog || []).map((activity) => ({
      id: activity.id,
      date: activity.date,
      title: `${job.jobTitle} · ${job.company}`,
      action: t(`activity.${activity.action}`)
    }));

    return [...application, ...activities];
  });

  const interviewActivities = AppState.interviews.map((interview) => ({
    id: interview.id,
    date: interview.interviewDate || interview.createdAt,
    title: `${interview.jobTitle} · ${interview.company}`,
    action: t("statsDashboard.timelineInterview")
  }));

  return [...jobActivities, ...interviewActivities].filter((item) => item.date);
}

function getMonthlyTimeline(limit = 10) {
  const cutoff = addDaysToISO(todayISO(), -30);
  return collectActivityEvents()
    .filter((item) => item.date && item.date >= cutoff)
    .sort((first, second) => second.date.localeCompare(first.date))
    .slice(0, limit);
}

function getMonthlyActivityHeatmap() {
  const today = todayISO();
  const days = Array.from({ length: 30 }, (_, index) => addDaysToISO(today, index - 29));
  const events = collectActivityEvents();

  return days.map((date) => {
    const count = events.filter((event) => event.date === date).length;
    let level = 0;
    if (count >= 1 && count <= 2) level = 1;
    if (count >= 3 && count <= 5) level = 2;
    if (count >= 6) level = 3;

    return {
      date,
      count,
      level,
      label: `${formatDate(date)} · ${formatMessage("statsDashboard.activityCount", { count })}`
    };
  });
}

function getActivityByDay(days = 30) {
  const today = todayISO();
  const dates = Array.from({ length: days }, (_, index) => addDaysToISO(today, index - (days - 1)));
  const events = collectActivityEvents();

  return dates.map((date) => {
    const count = events.filter((event) => event.date === date).length;
    let level = 0;
    if (count >= 1 && count <= 2) level = 1;
    if (count >= 3 && count <= 5) level = 2;
    if (count >= 6) level = 3;

    return {
      date,
      count,
      level,
      label: `${formatDate(date)} · ${formatMessage("statsDashboard.activityCount", { count })}`
    };
  });
}

function getStatsData(period = StatsFilters.period) {
  const jobs = getStatsJobs(period);
  const interviews = getStatsInterviews(period);
  const summary = getStatsSummary(jobs);

  return {
    total: summary.totalApplications,
    active: summary.activeApplications,
    responseRate: summary.responseRate,
    interviewRate: summary.interviewRate,
    rejectionRate: summary.rejectionRate,
    underReview: jobs.filter((job) => job.status === "under_review").length,
    offerRate: summary.offerRate,
    avgResponseTime: calculateAvgResponseTime(jobs),
    byStatus: getStatusDistribution(jobs),
    bySource: getSourceStats(jobs),
    byWeek: getApplicationsByWeek(4, jobs),
    interviewStats: getInterviewPerformance(interviews),
    activityByDay: getActivityByDay(30),
    achievements: getAchievements()
  };
}

function hasThreeDayActivityStreak() {
  const activeDates = new Set(collectActivityEvents().map((event) => event.date).filter(Boolean));
  return Array.from(activeDates).some((date) => {
    return activeDates.has(addDaysToISO(date, 1)) && activeDates.has(addDaysToISO(date, 2));
  });
}

function getAchievements() {
  return [
    {
      key: "firstStep",
      icon: "🚀",
      color: "cyan",
      unlocked: AppState.jobs.length >= 1,
      progress: Math.min(AppState.jobs.length, 1),
      target: 1
    },
    {
      key: "onARoll",
      icon: "🔥",
      color: "amber",
      unlocked: AppState.jobs.length >= 5,
      progress: Math.min(AppState.jobs.length, 5),
      target: 5
    },
    {
      key: "interviewReady",
      icon: "🎯",
      color: "violet",
      unlocked: AppState.jobs.some((job) => ["interview", "offer", "accepted"].includes(job.status)),
      progress: AppState.jobs.some((job) => ["interview", "offer", "accepted"].includes(job.status)) ? 1 : 0,
      target: 1
    },
    {
      key: "offerReceived",
      icon: "⭐",
      color: "green",
      unlocked: getOffers().length >= 1,
      progress: Math.min(getOffers().length, 1),
      target: 1
    },
    {
      key: "consistentTracker",
      icon: "📅",
      color: "purple",
      unlocked: hasThreeDayActivityStreak(),
      progress: hasThreeDayActivityStreak() ? 3 : 0,
      target: 3
    },
    {
      key: "networkPro",
      icon: "🤝",
      color: "primary",
      unlocked: AppState.jobs.some((job) => ["referral", "recruiter"].includes(job.source)),
      progress: AppState.jobs.some((job) => ["referral", "recruiter"].includes(job.source)) ? 1 : 0,
      target: 1
    }
  ];
}

function createActivity(action, note = "") {
  return {
    id: uuid(),
    date: todayISO(),
    action,
    note
  };
}

function populateSelect(select, options, translationPrefix, includeAll = false) {
  if (!select) return;

  const currentValue = select.value || (includeAll ? "all" : options[0]);
  select.innerHTML = "";

  if (includeAll) {
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = t("common.all");
    select.appendChild(allOption);
  }

  options.forEach((optionValue) => {
    const option = document.createElement("option");
    option.value = optionValue;
    option.textContent = t(`${translationPrefix}.${optionValue}`);
    select.appendChild(option);
  });

  select.value = [...select.options].some((option) => option.value === currentValue)
    ? currentValue
    : includeAll ? "all" : options[0];
}

function populateJobSelects() {
  populateSelect(document.getElementById("job-filter-status"), JOB_STATUS_OPTIONS, "statuses", true);
  populateSelect(document.getElementById("job-filter-priority"), JOB_PRIORITY_OPTIONS, "priority", true);
  populateSelect(document.getElementById("job-filter-source"), JOB_SOURCE_OPTIONS, "sources", true);
  populateSelect(document.getElementById("job-type"), JOB_TYPE_OPTIONS, "jobTypes");
  populateSelect(document.getElementById("job-status"), SIMPLE_APPLICATION_STATUS_OPTIONS, "statuses");
  populateSelect(document.getElementById("job-priority"), JOB_PRIORITY_OPTIONS, "priority");
  populateSelect(document.getElementById("job-source"), JOB_SOURCE_OPTIONS, "sources");
}

function ensureSelectHasValue(select, value, translationGroup) {
  if (!select || !value || [...select.options].some((option) => option.value === value)) return;

  const option = document.createElement("option");
  option.value = value;
  option.textContent = t(`${translationGroup}.${value}`);
  select.appendChild(option);
}

function populateInterviewSelects(selectedJobId = "") {
  const jobSelect = document.getElementById("interview-job-id");
  if (jobSelect) {
    const currentValue = selectedJobId || jobSelect.value;
    jobSelect.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = t("interviews.placeholders.jobSelect");
    jobSelect.appendChild(placeholder);

    const activeJobs = getActiveJobs();
    const selectedJob = AppState.jobs.find((job) => job.id === currentValue);
    const jobsForSelect = selectedJob && !activeJobs.some((job) => job.id === selectedJob.id)
      ? [selectedJob, ...activeJobs]
      : activeJobs;

    jobsForSelect.forEach((job) => {
      const option = document.createElement("option");
      option.value = job.id;
      option.textContent = `${job.jobTitle} · ${job.company}`;
      jobSelect.appendChild(option);
    });

    if ([...jobSelect.options].some((option) => option.value === currentValue)) {
      jobSelect.value = currentValue;
    }
  }

  populateSelect(document.getElementById("interview-round-type"), INTERVIEW_ROUND_TYPE_OPTIONS, "interviewRoundTypes");
  populateSelect(document.getElementById("interview-format"), INTERVIEW_FORMAT_OPTIONS, "interviewFormats");
  populateSelect(document.getElementById("interview-status"), INTERVIEW_STATUS_OPTIONS, "interviewStatuses");
  populateSelect(document.getElementById("interview-result"), INTERVIEW_RESULT_OPTIONS, "interviewResults");
}

function getJobFormData() {
  return {
    jobTitle: document.getElementById("job-title").value.trim(),
    company: document.getElementById("job-company").value.trim(),
    location: document.getElementById("job-location").value.trim(),
    jobType: document.getElementById("job-type").value || "full_time",
    status: document.getElementById("job-status").value || "sent",
    priority: document.getElementById("job-priority").value || "medium",
    source: document.getElementById("job-source").value || "linkedin",
    salary: document.getElementById("job-salary").value.trim(),
    jobUrl: document.getElementById("job-url").value.trim(),
    contactName: document.getElementById("job-contact-name").value.trim(),
    contactEmail: document.getElementById("job-contact-email").value.trim(),
    notes: document.getElementById("job-notes").value.trim(),
    followUpDate: document.getElementById("job-follow-up-date").value || null,
    appliedDate: document.getElementById("job-applied-date").value || todayISO()
  };
}

function setJobFormData(job) {
  document.getElementById("job-id").value = job?.id || "";
  document.getElementById("job-title").value = job?.jobTitle || "";
  document.getElementById("job-company").value = job?.company || "";
  document.getElementById("job-location").value = job?.location || "";
  document.getElementById("job-type").value = job?.jobType || "full_time";
  const statusSelect = document.getElementById("job-status");
  ensureSelectHasValue(statusSelect, job?.status, "statuses");
  statusSelect.value = job?.status || "sent";
  document.getElementById("job-priority").value = job?.priority || "medium";
  document.getElementById("job-source").value = job?.source || "linkedin";
  document.getElementById("job-salary").value = job?.salary || "";
  document.getElementById("job-url").value = job?.jobUrl || "";
  document.getElementById("job-contact-name").value = job?.contactName || "";
  document.getElementById("job-contact-email").value = job?.contactEmail || "";
  document.getElementById("job-notes").value = job?.notes || "";
  document.getElementById("job-follow-up-date").value = job?.followUpDate || "";
  document.getElementById("job-applied-date").value = job?.appliedDate || todayISO();
}

function openAddJobModal() {
  openJobModal(null);
}

function openEditJobModal(jobId) {
  openJobModal(jobId);
}

function openJobModal(jobId = null) {
  const modal = document.getElementById("modal-overlay");
  const title = document.getElementById("job-modal-title");
  const form = document.getElementById("job-form");
  editingJobId = jobId;

  if (form) {
    form.reset();
  }

  populateJobSelects();
  populateInterviewSelects();

  if (jobId) {
    const job = AppState.jobs.find((item) => item.id === jobId);
    if (!job) return;
    title.textContent = t("jobs.modal.editTitle");
    setJobFormData(job);
  } else {
    title.textContent = t("jobs.modal.addTitle");
    setJobFormData({
      jobType: "full_time",
      status: "sent",
      priority: "medium",
      source: "linkedin",
      appliedDate: todayISO()
    });
  }

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.getElementById("job-title").focus();
}

function closeJobModal() {
  const modal = document.getElementById("modal-overlay");
  editingJobId = null;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function saveJob(event) {
  event.preventDefault();

  const formData = getJobFormData();
  if (!formData.jobTitle || !formData.company) {
    showToast("errors.requiredJobFields");
    return;
  }

  if (editingJobId) {
    AppState.jobs = AppState.jobs.map((job) => {
      if (job.id !== editingJobId) return job;
      const statusChanged = job.status !== formData.status;
      const activityLog = [
        createActivity("updated"),
        ...(statusChanged ? [createActivity("status_changed", `${t(`statuses.${job.status}`)} → ${t(`statuses.${formData.status}`)}`)] : []),
        ...job.activityLog
      ];

      return normalizeJob({
        ...job,
        ...formData,
        isArchived: formData.status === "archived",
        updatedAt: todayISO(),
        activityLog
      });
    });
  } else {
    AppState.jobs = [
      normalizeJob({
        id: uuid(),
        ...formData,
        followUpCount: 0,
        activityLog: [createActivity("created")],
        isArchived: formData.status === "archived",
        createdAt: todayISO(),
        updatedAt: todayISO()
      }),
      ...AppState.jobs
    ];
  }

  saveJobs();
  closeJobModal();
  renderTodayIfActive();
  renderJobs();
  showToast("emotional.jobSaved");
}

function updateJob(jobId, updater) {
  AppState.jobs = AppState.jobs.map((job) => {
    if (job.id !== jobId) return job;
    return normalizeJob(updater(job));
  });
  saveJobs();
  renderTodayIfActive();
  renderJobs();
}

function addActivityLog(jobId, action, note = "") {
  AppState.jobs = AppState.jobs.map((job) => {
    if (job.id !== jobId) return job;
    return normalizeJob({
      ...job,
      activityLog: [createActivity(action, note), ...job.activityLog],
      updatedAt: todayISO()
    });
  });
  StorageManager.set(StorageManager.KEYS.JOBS, AppState.jobs);
  renderTodayIfActive();
}

async function archiveJob(jobId) {
  if (!await confirmDangerAction("confirmArchiveJob")) return;

  updateJob(jobId, (job) => ({
    ...job,
    status: "archived",
    isArchived: true,
    updatedAt: todayISO(),
    activityLog: [createActivity("archived"), ...job.activityLog]
  }));
  showToast("emotional.jobArchived");
}

async function deleteJob(jobId) {
  if (!await confirmDangerAction("confirmDeleteJob")) return;

  AppState.jobs = AppState.jobs.filter((job) => job.id !== jobId);
  saveJobs();
  renderTodayIfActive();
  renderJobs();
  showToast("emotional.jobDeleted");
}

function markFollowUpDone(jobId) {
  updateJob(jobId, (job) => ({
    ...job,
    followUpCount: Number(job.followUpCount || 0) + 1,
    followUpDate: addDaysISO(7),
    updatedAt: todayISO(),
    activityLog: [createActivity("follow_up_done", formatDate(addDaysISO(7))), ...job.activityLog]
  }));
  showToast("emotional.followUpDone");
}

function getInterviewFormData() {
  const jobId = document.getElementById("interview-job-id").value;
  const job = AppState.jobs.find((item) => item.id === jobId);

  return {
    jobId,
    jobTitle: job?.jobTitle || "",
    company: job?.company || "",
    round: Number(document.getElementById("interview-round").value || 1),
    roundType: document.getElementById("interview-round-type").value || "hr",
    interviewDate: document.getElementById("interview-date").value,
    interviewTime: document.getElementById("interview-time").value,
    duration: document.getElementById("interview-duration").value.trim(),
    format: document.getElementById("interview-format").value || "video",
    platform: document.getElementById("interview-platform").value.trim(),
    location: document.getElementById("interview-location").value.trim(),
    interviewerName: document.getElementById("interview-interviewer-name").value.trim(),
    interviewerTitle: document.getElementById("interview-interviewer-title").value.trim(),
    status: document.getElementById("interview-status").value || "scheduled",
    result: document.getElementById("interview-result").value || "",
    notes: document.getElementById("interview-notes").value.trim(),
    postInterviewNotes: document.getElementById("interview-post-notes").value.trim(),
    questionsAsked: document.getElementById("interview-questions-asked").value.trim(),
    preparationNotes: document.getElementById("interview-preparation-notes").value.trim(),
    googleMapsUrl: document.getElementById("interview-google-maps-url").value.trim(),
    meetingUrl: document.getElementById("interview-meeting-url").value.trim()
  };
}

function setInterviewFormData(interview) {
  document.getElementById("interview-id").value = interview?.id || "";
  document.getElementById("interview-job-id").value = interview?.jobId || "";
  document.getElementById("interview-round").value = interview?.round || 1;
  document.getElementById("interview-round-type").value = interview?.roundType || "hr";
  document.getElementById("interview-date").value = interview?.interviewDate || "";
  document.getElementById("interview-time").value = interview?.interviewTime || "";
  document.getElementById("interview-duration").value = interview?.duration || "";
  document.getElementById("interview-format").value = interview?.format || "video";
  document.getElementById("interview-platform").value = interview?.platform || "";
  document.getElementById("interview-location").value = interview?.location || "";
  document.getElementById("interview-interviewer-name").value = interview?.interviewerName || "";
  document.getElementById("interview-interviewer-title").value = interview?.interviewerTitle || "";
  document.getElementById("interview-status").value = interview?.status || "scheduled";
  document.getElementById("interview-result").value = interview?.result || "pending";
  document.getElementById("interview-notes").value = interview?.notes || "";
  document.getElementById("interview-post-notes").value = interview?.postInterviewNotes || "";
  document.getElementById("interview-questions-asked").value = interview?.questionsAsked || "";
  document.getElementById("interview-preparation-notes").value = interview?.preparationNotes || "";
  document.getElementById("interview-google-maps-url").value = interview?.googleMapsUrl || "";
  document.getElementById("interview-meeting-url").value = interview?.meetingUrl || "";
}

function updateInterviewFormatFields() {
  const format = document.getElementById("interview-format")?.value || "video";
  const visibility = {
    meeting: ["video", "async_video"].includes(format),
    platform: ["video", "phone", "async_video"].includes(format),
    location: format === "in_person",
    maps: format === "in_person"
  };

  document.querySelectorAll("[data-format-field]").forEach((field) => {
    field.classList.toggle("hidden", !visibility[field.dataset.formatField]);
  });
}

function updateFormatFields() {
  updateInterviewFormatFields();
}

function isPastInterview(interview) {
  return Boolean(interview.interviewDate && interview.interviewDate < todayISO());
}

function calculateCountdown(dateString) {
  const diff = daysBetweenISO(todayISO(), dateString);

  if (diff === 0) return t("interviews.countdown.today");
  if (diff > 0) return formatMessage("interviews.countdown.inDays", { count: diff });

  return formatMessage("interviews.countdown.daysAgo", { count: Math.abs(diff) });
}

function getUpcomingInterviews() {
  return AppState.interviews
    .filter((interview) => interview.interviewDate >= todayISO() && ["scheduled", "rescheduled"].includes(interview.status))
    .sort((first, second) => `${first.interviewDate}T${first.interviewTime || "00:00"}`.localeCompare(`${second.interviewDate}T${second.interviewTime || "00:00"}`));
}

function getPastInterviews() {
  return AppState.interviews
    .filter((interview) => interview.interviewDate && interview.interviewDate < todayISO())
    .sort((first, second) => `${second.interviewDate}T${second.interviewTime || "00:00"}`.localeCompare(`${first.interviewDate}T${first.interviewTime || "00:00"}`));
}

function getUpcomingInterviewsForDashboard() {
  const today = todayISO();
  const nextWeek = addDaysToISO(today, 7);

  return getUpcomingInterviews().filter((interview) => interview.interviewDate <= nextWeek);
}

function openAddInterviewModal() {
  openInterviewModal(null);
}

function openEditInterviewModal(interviewId) {
  openInterviewModal(interviewId);
}

function openInterviewModal(interviewId = null) {
  const modal = document.getElementById("interview-modal-overlay");
  const title = document.getElementById("interview-modal-title");
  const form = document.getElementById("interview-form");
  editingInterviewId = interviewId;

  if (form) form.reset();

  const interview = interviewId
    ? AppState.interviews.find((item) => item.id === interviewId)
    : null;

  populateInterviewSelects(interview?.jobId || "");

  if (interviewId && !interview) return;

  if (interview) {
    title.textContent = t("interviews.modal.editTitle");
    setInterviewFormData(interview);
  } else {
    title.textContent = t("interviews.modal.addTitle");
    setInterviewFormData({
      round: getNextInterviewRound(document.getElementById("interview-job-id")?.value || ""),
      roundType: "hr",
      format: "video",
      status: "scheduled",
      result: "pending",
      interviewDate: todayISO()
    });
  }

  updateInterviewResultSection();
  updateInterviewFormatFields();
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.getElementById("interview-job-id").focus();
}

function closeInterviewModal() {
  const modal = document.getElementById("interview-modal-overlay");
  editingInterviewId = null;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function updateInterviewResultSection() {
  const section = document.getElementById("interview-result-section");
  const date = document.getElementById("interview-date")?.value || "";
  const shouldShow = Boolean(editingInterviewId && date && date < todayISO());
  if (section) section.classList.toggle("hidden", !shouldShow);
}

function getNextInterviewRound(jobId) {
  if (!jobId) return 1;
  const rounds = AppState.interviews
    .filter((interview) => interview.jobId === jobId)
    .map((interview) => Number(interview.round || 0));

  return rounds.length ? Math.max(...rounds) + 1 : 1;
}

function syncInterviewJobFields() {
  const jobId = document.getElementById("interview-job-id")?.value || "";
  if (!editingInterviewId) {
    document.getElementById("interview-round").value = getNextInterviewRound(jobId);
  }
}

function handleInterviewResultChange(interviewId, result) {
  const interview = AppState.interviews.find((item) => item.id === interviewId);
  if (!interview || !["passed", "failed"].includes(result)) return;

  const nextStatus = result === "failed" ? "rejected" : "interview";
  const promptKey = result === "failed"
    ? "interviews.prompts.updateJobRejected"
    : "interviews.prompts.updateJobInterview";

  if (!window.confirm(t(promptKey))) return;

  updateJob(interview.jobId, (job) => ({
    ...job,
    status: nextStatus,
    isArchived: nextStatus === "archived",
    updatedAt: todayISO(),
    activityLog: [
      createActivity("status_changed", `${t("interviews.fields.result")}: ${t(`interviewResults.${result}`)}`),
      ...job.activityLog
    ]
  }));
}

function saveInterview(event) {
  event.preventDefault();

  const formData = getInterviewFormData();
  if (!formData.jobId || !formData.interviewDate) {
    showToast("errors.requiredInterviewFields");
    return;
  }

  if (editingInterviewId) {
    const previousInterview = AppState.interviews.find((interview) => interview.id === editingInterviewId);
    const resultChanged = previousInterview?.result !== formData.result;
    const savedInterviewId = editingInterviewId;

    AppState.interviews = AppState.interviews.map((interview) => {
      if (interview.id !== editingInterviewId) return interview;
      return normalizeInterview({
        ...interview,
        ...formData,
        updatedAt: todayISO()
      });
    });
    addActivityLog(formData.jobId, "interview_updated", `${formData.jobTitle} · ${formatDate(formData.interviewDate)}`);
    if (resultChanged) {
      handleInterviewResultChange(savedInterviewId, formData.result);
    }
  } else {
    const newInterview = normalizeInterview({
      id: uuid(),
      ...formData,
      createdAt: todayISO(),
      updatedAt: todayISO()
    });
    AppState.interviews = [newInterview, ...AppState.interviews];
    updateJob(newInterview.jobId, (job) => ({
      ...job,
      status: job.status === "accepted" ? job.status : "interview",
      updatedAt: todayISO(),
      activityLog: [
        createActivity("interview_scheduled", `${t(`interviewRoundTypes.${newInterview.roundType}`)} · ${formatDate(newInterview.interviewDate)}`),
        ...job.activityLog
      ]
    }));
  }

  saveInterviews();
  closeInterviewModal();
  renderInterviews();
  renderTodayIfActive();
  showToast("emotional.interviewSaved");
}

function deleteInterview(interviewId) {
  const interview = AppState.interviews.find((item) => item.id === interviewId);
  if (!interview) return;
  if (!window.confirm(t("interviews.confirmDelete"))) return;

  AppState.interviews = AppState.interviews.filter((item) => item.id !== interviewId);
  saveInterviews();
  addActivityLog(interview.jobId, "interview_deleted", `${interview.jobTitle} · ${formatDate(interview.interviewDate)}`);
  renderInterviews();
  showToast("emotional.interviewDeleted");
}

function getInterviewGroups() {
  const sorted = [...AppState.interviews].sort((first, second) => {
    const firstDate = `${first.interviewDate || "9999-12-31"}T${first.interviewTime || "00:00"}`;
    const secondDate = `${second.interviewDate || "9999-12-31"}T${second.interviewTime || "00:00"}`;
    return firstDate.localeCompare(secondDate);
  });

  return {
    upcoming: getUpcomingInterviews(),
    past: getPastInterviews(),
    all: sorted
  };
}

function setInterviewView(view) {
  currentInterviewView = ["upcoming", "past", "all"].includes(view) ? view : "upcoming";
  renderInterviews();
}

function getInterviewWeekDays() {
  const today = todayISO();
  return Array.from({ length: 7 }, (_, index) => addDaysToISO(today, index));
}

function formatWeekday(isoDate) {
  const locale = AppState.language === "ar" ? "ar" : "en";
  return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(`${isoDate}T00:00:00`));
}

function getInterviewCountForDate(isoDate) {
  return AppState.interviews.filter((interview) => interview.interviewDate === isoDate).length;
}

function getInterviewCountLabel(count) {
  if (AppState.language === "ar") {
    if (count === 1) return t("interviews.week.countOne");
    if (count === 2) return t("interviews.week.countTwo");
  }

  return formatMessage("interviews.week.countMany", { count });
}

function getSelectedInterviewContext(count) {
  if (!selectedInterviewDate) {
    return t("interviews.week.contextAll");
  }

  if (count === 0) {
    return t("interviews.empty.selectedDayTitle");
  }

  const dateLabel = selectedInterviewDate === todayISO()
    ? t("interviews.week.today")
    : formatDate(selectedInterviewDate);

  return `${dateLabel} · ${getInterviewCountLabel(count)}`;
}

function renderInterviewWeekStrip() {
  const strip = document.getElementById("interview-week-strip");
  if (!strip) return;

  const days = getInterviewWeekDays();
  strip.innerHTML = `
    <div class="interview-week-header">
      <div>
        <p class="eyebrow">${escapeHTML(t("interviews.week.kicker"))}</p>
        <h3>${escapeHTML(t("interviews.week.title"))}</h3>
      </div>
      <button class="btn btn-small btn-secondary${selectedInterviewDate ? "" : " active"}" type="button" data-interview-date-reset>
        ${escapeHTML(t("interviews.week.allUpcoming"))}
      </button>
    </div>
    <div class="interview-week-days">
      ${days.map((day) => {
        const count = getInterviewCountForDate(day);
        const isToday = day === todayISO();
        const isSelected = selectedInterviewDate === day;
        return `
          <button class="interview-week-day${isToday ? " today" : ""}${count ? " has-interview" : ""}${isSelected ? " selected" : ""}" type="button" data-interview-date="${escapeHTML(day)}" aria-pressed="${isSelected}" aria-label="${escapeHTML(`${isToday ? t("interviews.week.today") : formatDate(day)} · ${count ? getInterviewCountLabel(count) : t("interviews.week.noInterviews")}`)}">
            <span>${escapeHTML(isToday ? t("interviews.week.today") : formatWeekday(day))}</span>
            <strong>${escapeHTML(new Date(`${day}T00:00:00`).getDate())}</strong>
            ${count ? `<small>${escapeHTML(getInterviewCountLabel(count))}</small>` : "<i></i>"}
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function getInterviewMapsUrl(interview) {
  if (interview.format !== "in_person") return "";
  if (isSafeUrl(interview.googleMapsUrl)) return interview.googleMapsUrl;
  if (!interview.location) return "";

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(interview.location)}`;
}

function renderInterviewPrimaryActions(interview) {
  const meetingButton = ["video", "async_video"].includes(interview.format) && isSafeUrl(interview.meetingUrl)
    ? `<a class="btn btn-small btn-primary" href="${escapeHTML(interview.meetingUrl)}" target="_blank" rel="noopener noreferrer"><i data-lucide="video"></i>${escapeHTML(t("interviews.joinMeeting"))}</a>`
    : "";
  const mapsUrl = getInterviewMapsUrl(interview);
  const mapsButton = mapsUrl
    ? `<a class="btn btn-small btn-primary" href="${escapeHTML(mapsUrl)}" target="_blank" rel="noopener noreferrer"><i data-lucide="map-pin"></i>${escapeHTML(t("interviews.openMap"))}</a>`
    : "";

  return `
    <div class="interview-primary-actions">
      ${meetingButton}
      ${mapsButton}
      <button class="btn btn-small btn-secondary" type="button" data-interview-action="prepare" data-interview-id="${escapeHTML(interview.id)}"><i data-lucide="sparkles"></i>${escapeHTML(t("interviews.prepare"))}</button>
    </div>
  `;
}

function prepareForInterview(interviewId) {
  const interview = AppState.interviews.find((item) => item.id === interviewId);
  if (!interview) return;
  analyzerMode = "interview_prep";
  analyzerInterviewPrefill = {
    company: interview.company || "",
    position: interview.jobTitle || "",
    interviewType: ["technical"].includes(interview.roundType) ? "technical" : interview.roundType === "managerial" ? "manager" : "hr",
    interviewerName: interview.interviewerName || "",
    interviewerTitle: interview.interviewerTitle || "",
    notes: interview.preparationNotes || interview.notes || ""
  };
  switchTab("analyzer");
}

function renderInterviewEmptyState(titleKey, bodyKey, options = {}) {
  return `
    <div class="interview-empty-inline glass-card">
      <strong>${escapeHTML(t(titleKey))}</strong>
      <span>${escapeHTML(t(bodyKey))}</span>
      ${options.showAction ? `
        <button class="btn btn-primary btn-small" type="button" data-open-interview-modal>
          <span class="btn-plus">+</span>
          ${escapeHTML(t("interviews.addInterview"))}
        </button>
      ` : ""}
    </div>
  `;
}

function renderInterviewCard(interview) {
  const isPast = isPastInterview(interview);
  const isToday = interview.interviewDate === todayISO();
  const countdown = calculateCountdown(interview.interviewDate);
  const details = [
    interview.location ? `${t("interviews.fields.location")}: ${interview.location}` : "",
    interview.platform ? `${t("interviews.fields.platform")}: ${interview.platform}` : "",
    interview.interviewerName ? `${t("interviews.fields.interviewerName")}: ${interview.interviewerName}` : "",
    interview.notes ? interview.notes : ""
  ].filter(Boolean);

  return `
    <article class="interview-card interview-assistant-card glass-card${isPast ? " past-interview" : ""}${isToday ? " today-interview" : ""}">
      <div class="interview-card-top">
        <div>
          <p class="eyebrow">${escapeHTML(t("interviews.round"))} ${escapeHTML(interview.round)} · ${escapeHTML(t(`interviewRoundTypes.${interview.roundType}`))}</p>
          <h3>${escapeHTML(interview.jobTitle)}</h3>
          <p>${escapeHTML(interview.company)}</p>
        </div>
        <div class="interview-date-chip">
          <strong>${escapeHTML(formatDate(interview.interviewDate))}</strong>
          ${interview.interviewTime ? `<span>${escapeHTML(interview.interviewTime)}</span>` : ""}
          <small>${escapeHTML(countdown)}</small>
        </div>
      </div>

      <div class="job-badge-row">
        <span class="badge badge-format-${escapeHTML(interview.format)}">${escapeHTML(t(`interviewFormats.${interview.format}`))}</span>
        <span class="badge badge-interview-status-${escapeHTML(interview.status)}">${escapeHTML(t(`interviewStatuses.${interview.status}`))}</span>
        ${interview.result ? `<span class="badge badge-result-${escapeHTML(interview.result)}">${escapeHTML(t(`interviewResults.${interview.result}`))}</span>` : ""}
      </div>

      ${details.length ? `<div class="interview-detail-list">${details.slice(0, 3).map((detail) => `<span>${escapeHTML(detail)}</span>`).join("")}</div>` : ""}

      <div class="job-actions">
        ${renderInterviewPrimaryActions(interview)}
        <div class="interview-secondary-actions">
          <button class="btn btn-small btn-secondary" type="button" data-interview-action="edit" data-interview-id="${escapeHTML(interview.id)}">${escapeHTML(t("common.edit"))}</button>
          <button class="btn btn-small btn-danger" type="button" data-interview-action="delete" data-interview-id="${escapeHTML(interview.id)}">${escapeHTML(t("common.delete"))}</button>
        </div>
      </div>
    </article>
  `;
}

function renderInterviews(filter) {
  const grid = document.getElementById("interviews-grid");
  const empty = document.getElementById("interviews-empty-state");
  if (!grid || !empty) return;

  if (filter) currentInterviewView = ["upcoming", "past", "all"].includes(filter) ? filter : "upcoming";
  const groups = getInterviewGroups();
  const upcoming = selectedInterviewDate
    ? groups.upcoming.filter((interview) => interview.interviewDate === selectedInterviewDate)
    : groups.upcoming;
  const past = groups.past;
  const hasAnyInterviews = AppState.interviews.length > 0;
  const emptyTitleKey = selectedInterviewDate ? "interviews.empty.selectedDayTitle" : "interviews.empty.upcomingTitle";
  const emptyBodyKey = selectedInterviewDate ? "interviews.empty.selectedDayBody" : "interviews.empty.upcomingBody";
  const zeroEmptyTitleKey = "interviews.empty.zeroTitle";
  const zeroEmptyBodyKey = "interviews.empty.zeroBody";
  const contextLabel = getSelectedInterviewContext(upcoming.length);

  renderInterviewWeekStrip();

  grid.innerHTML = `
    <section class="interview-section">
      <div class="interview-section-header">
        <div>
          <p class="eyebrow">${escapeHTML(t("interviews.views.upcoming"))}</p>
          <h3>${escapeHTML(t("interviews.upcomingTitle"))}</h3>
          <small class="interview-selected-context">${escapeHTML(contextLabel)}</small>
        </div>
        <span>${escapeHTML(upcoming.length)}</span>
      </div>
      ${upcoming.length
        ? `<div class="interview-list">${upcoming.map(renderInterviewCard).join("")}</div>`
        : hasAnyInterviews
          ? renderInterviewEmptyState(emptyTitleKey, emptyBodyKey)
          : renderInterviewEmptyState(zeroEmptyTitleKey, zeroEmptyBodyKey, { showAction: true })}
    </section>

    <details class="interview-past-section glass-card">
      <summary>
        <span>${escapeHTML(t("interviews.pastTitle"))}</span>
        <strong>${escapeHTML(past.length)}</strong>
      </summary>
      ${past.length
        ? `<div class="interview-list interview-past-list">${past.map(renderInterviewCard).join("")}</div>`
        : `<p>${escapeHTML(t("interviews.empty.pastBody"))}</p>`}
    </details>
  `;
  empty.classList.add("hidden");

  safeInitIcons();
}

function isFollowUpDue(job) {
  return Boolean(job.followUpDate && job.followUpDate <= todayISO() && !job.isArchived);
}

const APPLICATION_STATUS_CARDS = [
  { status: "sent", icon: "send" },
  { status: "under_review", icon: "scan-search" },
  { status: "interview", icon: "calendar-check" },
  { status: "rejected", icon: "x-circle" }
];

function getApplicationStatusCounts() {
  return APPLICATION_STATUS_CARDS.reduce((counts, item) => {
    counts[item.status] = AppState.jobs.filter((job) => job.status === item.status && !job.isArchived).length;
    return counts;
  }, {});
}

function renderApplicationsDashboardShell() {
  const grid = document.getElementById("applications-status-grid");
  if (!grid) return;

  const counts = getApplicationStatusCounts();
  const allButton = document.querySelector("[data-application-status='all']");
  const hasStatusFilter = JobFilters.status !== "all";
  if (allButton) {
    allButton.hidden = !hasStatusFilter;
    allButton.setAttribute("aria-pressed", "false");
  }

  grid.innerHTML = APPLICATION_STATUS_CARDS.map((item) => {
    const isActive = JobFilters.status === item.status;
    return `
      <button class="application-status-card ${isActive ? "active" : ""}" type="button" data-application-status="${escapeHTML(item.status)}" aria-pressed="${isActive}">
        <span class="application-status-icon badge-status-${escapeHTML(item.status)}"><i data-lucide="${escapeHTML(item.icon)}"></i></span>
        <span class="application-status-content">
          <strong>${escapeHTML(counts[item.status] || 0)}</strong>
          <span>${escapeHTML(t(`applicationsDashboard.cards.${item.status}.label`))}</span>
          <small>${escapeHTML(t(`applicationsDashboard.cards.${item.status}.hint`))}</small>
        </span>
      </button>
    `;
  }).join("");
}

function setApplicationStatusFilter(status) {
  if (status !== "all" && !APPLICATION_STATUS_CARDS.some((item) => item.status === status)) return;

  if (status === "all") {
    JobFilters.status = "all";
    const statusFilter = document.getElementById("job-filter-status");
    if (statusFilter) statusFilter.value = "all";
    renderJobs();
    return;
  }

  JobFilters.status = status;
  const statusFilter = document.getElementById("job-filter-status");
  if (statusFilter) statusFilter.value = status;
  renderJobs();
}

function getJobInterviews(jobId) {
  return AppState.interviews
    .filter((interview) => interview.jobId === jobId)
    .sort((first, second) => `${first.interviewDate || "9999-12-31"}T${first.interviewTime || "00:00"}`.localeCompare(`${second.interviewDate || "9999-12-31"}T${second.interviewTime || "00:00"}`));
}

function changeJobStatus(jobId, status) {
  if (!JOB_STATUS_OPTIONS.includes(status)) return;

  updateJob(jobId, (job) => {
    if (job.status === status) return job;

    return {
      ...job,
      status,
      isArchived: status === "archived",
      updatedAt: todayISO(),
      activityLog: [
        createActivity("status_changed", `${t(`statuses.${job.status}`)} → ${t(`statuses.${status}`)}`),
        ...job.activityLog
      ]
    };
  });
}

function getFilteredJobs() {
  const search = JobFilters.search.trim().toLowerCase();

  return AppState.jobs.filter((job) => {
    const matchesSearch = !search || [job.jobTitle, job.company, job.location]
      .join(" ")
      .toLowerCase()
      .includes(search);
    const matchesStatus = JobFilters.status === "all" || job.status === JobFilters.status;
    const matchesPriority = JobFilters.priority === "all" || job.priority === JobFilters.priority;
    const matchesSource = JobFilters.source === "all" || job.source === JobFilters.source;

    return matchesSearch && matchesStatus && matchesPriority && matchesSource;
  });
}

function filterJobs() {
  renderJobs();
}

function resetJobFilters() {
  const searchInput = document.getElementById("job-search");
  const statusFilter = document.getElementById("job-filter-status");
  const priorityFilter = document.getElementById("job-filter-priority");
  const sourceFilter = document.getElementById("job-filter-source");

  JobFilters.search = "";
  JobFilters.status = "all";
  JobFilters.priority = "all";
  JobFilters.source = "all";

  if (searchInput) searchInput.value = "";
  if (statusFilter) statusFilter.value = "all";
  if (priorityFilter) priorityFilter.value = "all";
  if (sourceFilter) sourceFilter.value = "all";

  renderJobs();
}

function handleViewJobFromToday(jobId) {
  highlightedJobId = jobId;

  JobFilters.search = "";
  JobFilters.status = "all";
  JobFilters.priority = "all";
  JobFilters.source = "all";

  switchTab("jobs");
  ["job-search", "job-filter-status", "job-filter-priority", "job-filter-source"].forEach((id) => {
    const field = document.getElementById(id);
    if (!field) return;
    field.value = id === "job-search" ? "" : "all";
  });
  renderJobs();

  window.setTimeout(() => {
    const card = [...document.querySelectorAll("[data-job-id]")].find((element) => element.dataset.jobId === jobId);
    if (!card) return;

    card.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      highlightedJobId = null;
      card.classList.remove("job-highlighted");
    }, 2600);
  }, 50);
}

function viewJobFromToday(jobId) {
  handleViewJobFromToday(jobId);
}

function renderTodayMiniJobCard(job, variant = "follow-up") {
  const lastActivityDate = getLastActivityDate(job);
  const dateLabel = variant === "attention"
    ? t("todayDashboard.lastActivity")
    : t("todayDashboard.followUpDate");
  const dateValue = variant === "attention"
    ? lastActivityDate ? formatDate(lastActivityDate) : t("todayDashboard.noActivity")
    : formatDate(job.followUpDate);

  return `
    <article class="today-mini-card glass-card">
      <div class="today-mini-main">
        <div>
          <h3>${escapeHTML(job.jobTitle)}</h3>
          <p>${escapeHTML(job.company)}</p>
        </div>
        <span class="today-mini-date">${escapeHTML(dateLabel)}: ${escapeHTML(dateValue)}</span>
      </div>
      <div class="job-badge-row">
        <span class="badge badge-status badge-status-${escapeHTML(job.status)}">${escapeHTML(t(`statuses.${job.status}`))}</span>
        <span class="badge badge-priority-${escapeHTML(job.priority)}">${escapeHTML(t(`priority.${job.priority}`))}</span>
      </div>
      <div class="today-mini-actions">
        <button class="btn btn-small btn-secondary" type="button" data-today-action="followUp" data-job-id="${escapeHTML(job.id)}">${escapeHTML(t("jobs.followUpDone"))}</button>
        <button class="btn btn-small btn-link" type="button" data-today-action="viewJob" data-job-id="${escapeHTML(job.id)}">${escapeHTML(t("todayDashboard.viewJob"))}</button>
      </div>
    </article>
  `;
}

function renderTodaySection(titleKey, jobs, emptyKey, variant) {
  return `
    <section class="today-section glass-card">
      <div class="today-section-header">
        <h2>${escapeHTML(t(titleKey))}</h2>
        <span>${escapeHTML(jobs.length)}</span>
      </div>
      ${jobs.length
        ? `<div class="today-mini-grid">${jobs.map((job) => renderTodayMiniJobCard(job, variant)).join("")}</div>`
        : `<div class="today-positive-state">${escapeHTML(t(emptyKey))}</div>`}
    </section>
  `;
}

function renderTodayMiniInterviewCard(interview) {
  const linkButton = interview.format === "video" && isSafeUrl(interview.meetingUrl)
    ? `<a class="btn btn-small btn-link" href="${escapeHTML(interview.meetingUrl)}" target="_blank" rel="noopener noreferrer">${escapeHTML(t("interviews.joinMeeting"))}</a>`
    : interview.format === "in_person" && isSafeUrl(interview.googleMapsUrl)
      ? `<a class="btn btn-small btn-link" href="${escapeHTML(interview.googleMapsUrl)}" target="_blank" rel="noopener noreferrer">${escapeHTML(t("interviews.openMap"))}</a>`
      : "";

  return `
    <article class="today-mini-card glass-card${interview.interviewDate === todayISO() ? " today-mini-highlight" : ""}">
      <div class="today-mini-main">
        <div>
          <h3>${escapeHTML(interview.jobTitle)}</h3>
          <p>${escapeHTML(interview.company)}</p>
        </div>
        <span class="today-mini-date">${escapeHTML(formatDate(interview.interviewDate))}${interview.interviewTime ? ` · ${escapeHTML(interview.interviewTime)}` : ""}</span>
      </div>
      <div class="job-badge-row">
        <span class="badge badge-round-type">${escapeHTML(t(`interviewRoundTypes.${interview.roundType}`))}</span>
        <span class="badge badge-interview-status-${escapeHTML(interview.status)}">${escapeHTML(calculateCountdown(interview.interviewDate))}</span>
      </div>
      ${linkButton ? `<div class="today-mini-actions">${linkButton}</div>` : ""}
    </article>
  `;
}

function renderTodayInterviewsSection(interviews) {
  return `
    <section class="today-section glass-card">
      <div class="today-section-header">
        <h2>${escapeHTML(t("todayDashboard.upcomingInterviewsTitle"))}</h2>
        <span>${escapeHTML(interviews.length)}</span>
      </div>
      ${interviews.length
        ? `<div class="today-mini-grid">${interviews.map(renderTodayMiniInterviewCard).join("")}</div>`
        : `<div class="today-positive-state">${escapeHTML(t("todayDashboard.noUpcomingInterviews"))}</div>`}
    </section>
  `;
}

function renderRecentActivities(activities) {
  return `
    <section class="today-section today-activity-section glass-card">
      <div class="today-section-header">
        <h2>${escapeHTML(t("todayDashboard.recentActivityTitle"))}</h2>
        <span>${escapeHTML(activities.length)}</span>
      </div>
      ${activities.length
        ? `<div class="activity-feed">
            ${activities.map((activity) => `
              <article class="activity-feed-item">
                <span class="activity-dot"></span>
                <div>
                  <strong>${escapeHTML(activity.jobTitle)} · ${escapeHTML(activity.company)}</strong>
                  <p>${escapeHTML(t(`activity.${activity.action}`))}</p>
                </div>
                <time>${escapeHTML(getRelativeDateLabel(activity.date))}</time>
              </article>
            `).join("")}
          </div>`
        : `<div class="today-positive-state muted-state">${escapeHTML(t("todayDashboard.noRecentActivity"))}</div>`}
    </section>
  `;
}

function renderTodayDashboard() {
  const panel = document.getElementById("tab-today");
  if (!panel) return;

  const summary = getTodaySummary();
  const followUpsDue = getFollowUpsDueToday();
  const attentionJobs = getHighPriorityNeedsAttention();
  const upcomingInterviews = getUpcomingInterviewsForDashboard();
  const recentActivities = getRecentActivities(5);
  const greetingKey = new Date().getHours() < 12 ? "todayDashboard.goodMorning" : "todayDashboard.goodEvening";
  const summaryCards = [
    { label: t("todayDashboard.totalActiveJobs"), value: summary.totalActive, icon: "▣", color: "primary" },
    { label: t("todayDashboard.followUpsDue"), value: summary.followUpsDue, icon: "!", color: "amber", pulse: summary.followUpsDue > 0 },
    { label: t("todayDashboard.interviewsThisWeek"), value: summary.interviewsThisWeek, icon: "□", color: "violet" },
    { label: t("todayDashboard.offers"), value: summary.offers, icon: "★", color: "green" }
  ];

  panel.innerHTML = `
    <section class="today-dashboard">
      <div class="today-hero glass-card">
        <div>
          <p class="eyebrow">${escapeHTML(t(greetingKey))}</p>
          <h2>${escapeHTML(t("todayDashboard.title"))}</h2>
          <p class="today-date">${escapeHTML(formatDate(todayISO()))}</p>
        </div>
        <div class="today-motivation-banner">
          <span>${escapeHTML(t("todayDashboard.kicker"))}</span>
          <strong>${escapeHTML(getMotivationalMessage())}</strong>
        </div>
      </div>

      <div class="summary-cards-row">
        ${summaryCards.map((card) => `
          <article class="summary-card glass-card summary-${card.color}${card.pulse ? " summary-pulse" : ""}">
            <span class="summary-icon">${escapeHTML(card.icon)}</span>
            <div>
              <strong>${escapeHTML(card.value)}</strong>
              <p>${escapeHTML(card.label)}</p>
            </div>
          </article>
        `).join("")}
      </div>

      <div class="today-sections-grid">
        ${renderTodaySection("todayDashboard.followUpsTitle", followUpsDue, "todayDashboard.noFollowUps", "follow-up")}
        ${renderTodaySection("todayDashboard.attentionTitle", attentionJobs, "todayDashboard.noAttention", "attention")}
        ${renderTodayInterviewsSection(upcomingInterviews)}
        ${renderRecentActivities(recentActivities)}
      </div>
    </section>
  `;

  safeInitIcons();
}

function getCssVariable(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function destroyStatsCharts() {
  if (statusChart) statusChart.destroy();
  if (weeklyChart) weeklyChart.destroy();
  statusChart = null;
  weeklyChart = null;
}

function getStatsChartPalette() {
  return [
    getCssVariable("--cyan"),
    getCssVariable("--amber"),
    getCssVariable("--violet"),
    getCssVariable("--green"),
    getCssVariable("--primary"),
    getCssVariable("--red"),
    getCssVariable("--text-muted"),
    getCssVariable("--purple"),
    getCssVariable("--surface-mid")
  ];
}

function renderKPICards(data) {
  const average = data.avgResponseTime === null
    ? t("statsDashboard.notAvailable")
    : `${data.avgResponseTime} ${t("statsDashboard.days")}`;
  const kpis = [
    { label: t("statsDashboard.totalApplications"), value: data.total, icon: "▣", color: "primary" },
    { label: t("statsDashboard.activeApplications"), value: data.active, icon: "↗", color: "cyan" },
    { label: t("statsDashboard.responseRate"), value: `${data.responseRate}%`, icon: "%", color: "violet" },
    { label: t("statsDashboard.interviewRate"), value: `${data.interviewRate}%`, icon: "◎", color: "amber" },
    { label: t("statsDashboard.offerRate"), value: `${data.offerRate}%`, icon: "★", color: "green" },
    { label: t("statsDashboard.avgResponseTime"), value: average, icon: "⏱", color: "purple" }
  ];

  return `
    <div class="stats-kpi-grid">
      ${kpis.map((card) => `
        <article class="summary-card stats-kpi-card glass-card summary-${card.color}">
          <span class="summary-icon">${escapeHTML(card.icon)}</span>
          <div>
            <strong>${escapeHTML(card.value)}</strong>
            <p>${escapeHTML(card.label)}</p>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderStatusDonut(data) {
  const statusCanvas = document.getElementById("stats-status-chart");
  if (!statusCanvas) return;
  if (!isLibraryAvailable("Chart")) {
    showChartFallback(statusCanvas);
    return;
  }
  if (statusChart) statusChart.destroy();

  const palette = getStatsChartPalette();
  statusChart = new window.Chart(statusCanvas, {
    type: "doughnut",
    data: {
      labels: data.byStatus.map((item) => item.label),
      datasets: [{
        data: data.byStatus.map((item) => item.count),
        backgroundColor: data.byStatus.map((_, index) => palette[index % palette.length]),
        borderColor: "rgba(10, 15, 30, 0.82)",
        borderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "rgba(249, 250, 251, 0.72)",
            boxWidth: 10,
            usePointStyle: true
          }
        }
      }
    }
  });
}

function renderWeeklyBar(data) {
  const weeklyCanvas = document.getElementById("stats-weekly-chart");
  if (!weeklyCanvas) return;
  if (!isLibraryAvailable("Chart")) {
    showChartFallback(weeklyCanvas);
    return;
  }
  if (weeklyChart) weeklyChart.destroy();

  weeklyChart = new window.Chart(weeklyCanvas, {
    type: "bar",
    data: {
      labels: data.byWeek.map((week) => week.label),
      datasets: [{
        label: t("statsDashboard.applicationsThisMonth"),
        data: data.byWeek.map((week) => week.count),
        backgroundColor: "rgba(34, 211, 238, 0.72)",
        borderColor: getCssVariable("--cyan"),
        borderWidth: 1,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: "rgba(249, 250, 251, 0.62)" },
          grid: { color: "rgba(255, 255, 255, 0.06)" }
        },
        y: {
          beginAtZero: true,
          ticks: { color: "rgba(249, 250, 251, 0.62)", precision: 0 },
          grid: { color: "rgba(255, 255, 255, 0.06)" }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function showChartFallback(canvas) {
  const wrapper = canvas.closest(".chart-wrap");
  if (!wrapper) return;

  wrapper.innerHTML = `
    <div class="chart-fallback muted-state">
      <strong>${escapeHTML(t("statsDashboard.noDataYet"))}</strong>
      <p>${escapeHTML(t("foundation.unlockAnalytics"))}</p>
    </div>
  `;
}

function renderSourceAnalytics(data) {
  return `
    <section class="stats-card glass-card">
      <div class="stats-card-header">
        <h3>${escapeHTML(t("statsDashboard.topSources"))}</h3>
        <span>${escapeHTML(data.bySource.length)}</span>
      </div>
      ${data.bySource.length
        ? `<div class="source-analytics-list">
            ${data.bySource.map((source) => `
              <div class="source-row">
                <div>
                  <strong>${escapeHTML(source.label)}</strong>
                  <span>${escapeHTML(source.count)} ${escapeHTML(t("statsDashboard.applications"))}</span>
                </div>
                <div class="source-meter" aria-hidden="true"><span style="width: ${escapeHTML(source.percentage)}%"></span></div>
                <em>${escapeHTML(source.percentage)}%</em>
              </div>
            `).join("")}
          </div>`
        : `<div class="today-positive-state muted-state">${escapeHTML(t("statsDashboard.noDataYet"))}</div>`}
    </section>
  `;
}

function renderInterviewAnalytics(data) {
  const performance = data.interviewStats;

  return `
    <section class="stats-card interview-performance-card glass-card">
      <div class="stats-card-header">
        <h3>${escapeHTML(t("statsDashboard.interviewPerformance"))}</h3>
        <span>${escapeHTML(performance.total)} ${escapeHTML(t("statsDashboard.interviews"))}</span>
      </div>
      <div class="success-rate-ring" style="--success-rate: ${escapeHTML(performance.successRate)}%">
        <strong>${escapeHTML(performance.successRate)}%</strong>
        <span>${escapeHTML(t("statsDashboard.successRate"))}</span>
      </div>
      <div class="interview-performance-grid">
        <span>${escapeHTML(t("statsDashboard.totalInterviews"))}<strong>${escapeHTML(performance.total)}</strong></span>
        <span>${escapeHTML(t("statsDashboard.passed"))}<strong>${escapeHTML(performance.passed)}</strong></span>
        <span>${escapeHTML(t("statsDashboard.failed"))}<strong>${escapeHTML(performance.failed)}</strong></span>
        <span>${escapeHTML(t("statsDashboard.pending"))}<strong>${escapeHTML(performance.pending)}</strong></span>
      </div>
      <div class="round-type-list">
        ${performance.roundTypes.length
          ? performance.roundTypes.map((round) => `
            <span class="round-type-mini-badge">${escapeHTML(round.label)} <strong>${escapeHTML(round.count)}</strong></span>
          `).join("")
          : `<span class="round-type-mini-badge">${escapeHTML(t("statsDashboard.noInterviewRounds"))}</span>`}
      </div>
      <p class="stats-insight-line">
        ${escapeHTML(t("statsDashboard.mostCommonRoundType"))}:
        <strong>${escapeHTML(performance.mostCommonRoundType ? performance.mostCommonRoundType.label : t("statsDashboard.notAvailable"))}</strong>
      </p>
    </section>
  `;
}

function renderActivityHeatmap(data) {
  return `
    <section class="stats-card activity-heatmap-card glass-card">
      <div class="stats-card-header">
        <h3>${escapeHTML(t("statsDashboard.monthlyActivity"))}</h3>
        <span>${escapeHTML(t("statsDashboard.last30Days"))}</span>
      </div>
      <div class="activity-heatmap-grid" aria-label="${escapeHTML(t("statsDashboard.monthlyActivity"))}">
        ${data.activityByDay.map((day) => `
          <span class="heatmap-cell heatmap-level-${escapeHTML(day.level)}" title="${escapeHTML(day.label)}" aria-label="${escapeHTML(day.label)}"></span>
        `).join("")}
      </div>
      <div class="heatmap-legend">
        <span>${escapeHTML(t("statsDashboard.lessActivity"))}</span>
        <i class="heatmap-cell heatmap-level-0"></i>
        <i class="heatmap-cell heatmap-level-1"></i>
        <i class="heatmap-cell heatmap-level-2"></i>
        <i class="heatmap-cell heatmap-level-3"></i>
        <span>${escapeHTML(t("statsDashboard.moreActivity"))}</span>
      </div>
    </section>
  `;
}

function renderAchievements(data) {
  return `
    <section class="stats-card achievements-card glass-card">
      <div class="stats-card-header">
        <h3>${escapeHTML(t("statsDashboard.achievements"))}</h3>
        <span>${escapeHTML(data.achievements.filter((item) => item.unlocked).length)}/${escapeHTML(data.achievements.length)}</span>
      </div>
      <div class="achievement-grid">
        ${data.achievements.map((achievement) => `
          <article class="achievement-badge achievement-${escapeHTML(achievement.color)}${achievement.unlocked ? " unlocked" : ""}">
            <span>${escapeHTML(achievement.icon)}</span>
            <div>
              <strong>${escapeHTML(t(`statsDashboard.achievementsList.${achievement.key}.title`))}</strong>
              <p>${escapeHTML(t(`statsDashboard.achievementsList.${achievement.key}.body`))}</p>
              ${achievement.unlocked ? "" : `<em>${escapeHTML(t(`statsDashboard.achievementsList.${achievement.key}.hint`))}</em>`}
              <small>${escapeHTML(achievement.progress)}${escapeHTML(achievement.suffix || "")}/${escapeHTML(achievement.target)}${escapeHTML(achievement.suffix || "")}</small>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function changePeriod(period) {
  StatsFilters.period = STATS_PERIOD_OPTIONS.includes(period) ? period : "all";
  renderStats();
}

function getSimplifiedStatsKpis(data) {
  return [
    { key: "total", label: t("statsDashboard.totalApplications"), value: data.total, icon: "briefcase", color: "primary" },
    { key: "interviewRate", label: t("statsDashboard.interviewRate"), value: `${data.interviewRate}%`, icon: "users", color: "cyan" },
    { key: "rejectionRate", label: t("statsDashboard.rejectionRate"), value: `${data.rejectionRate}%`, icon: "x-circle", color: "red" },
    { key: "underReview", label: t("statuses.under_review"), value: data.underReview, icon: "scan-search", color: "violet" }
  ];
}

function getSimplifiedStatusData(data) {
  const statusMap = new Map(data.byStatus.map((item) => [item.status, item.count]));
  return SIMPLE_APPLICATION_STATUS_OPTIONS.map((status) => ({
    status,
    label: t(`statuses.${status}`),
    count: statusMap.get(status) || 0
  }));
}

function renderSimplifiedStatsKpis(data) {
  return `
    <div class="stats-simple-kpi-grid">
      ${getSimplifiedStatsKpis(data).map((card) => `
        <article class="stats-simple-kpi glass-card summary-${card.color}">
          <span class="summary-icon"><i data-lucide="${escapeHTML(card.icon)}"></i></span>
          <div>
            <strong>${escapeHTML(card.value)}</strong>
            <p>${escapeHTML(card.label)}</p>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderStatsChartTypeToggle() {
  return `
    <div class="stats-chart-toggle" role="tablist" aria-label="${escapeHTML(t("statsDashboard.chartView"))}">
      ${["bar", "donut"].map((type) => `
        <button class="period-filter-tab${statsChartType === type ? " active" : ""}" type="button" data-stats-chart="${escapeHTML(type)}">
          ${escapeHTML(t(`statsDashboard.chartTypes.${type}`))}
        </button>
      `).join("")}
    </div>
  `;
}

function renderSimplifiedStatsChart(data) {
  const canvas = document.getElementById("stats-simple-chart");
  if (!canvas) return;
  if (statusChart) statusChart.destroy();
  statusChart = null;

  if (!isLibraryAvailable("Chart") || !data.total) {
    showChartFallback(canvas);
    return;
  }

  const statusData = getSimplifiedStatusData(data);
  const colors = ["#38BDF8", "#2563EB", "#8B5CF6", "#EF4444"];
  const isDonut = statsChartType === "donut";

  statusChart = new window.Chart(canvas, {
    type: isDonut ? "doughnut" : "bar",
    data: {
      labels: statusData.map((item) => item.label),
      datasets: [{
        data: statusData.map((item) => item.count),
        backgroundColor: colors.map((color) => isDonut ? color : `${color}CC`),
        borderColor: colors,
        borderWidth: isDonut ? 2 : 1,
        borderRadius: isDonut ? 0 : 10,
        hoverOffset: isDonut ? 8 : 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: isDonut ? "68%" : undefined,
      scales: isDonut ? {} : {
        x: {
          ticks: { color: "rgba(248, 250, 252, 0.72)" },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: { color: "rgba(248, 250, 252, 0.62)", precision: 0 },
          grid: { color: "rgba(96, 165, 250, 0.08)" }
        }
      },
      plugins: {
        legend: {
          display: isDonut,
          position: "bottom",
          labels: {
            color: "rgba(248, 250, 252, 0.72)",
            boxWidth: 10,
            usePointStyle: true
          }
        }
      }
    }
  });
}

function getSimplifiedSourcePerformance(jobs = getStatsJobs()) {
  const groups = [
    { key: "linkedin", label: t("sources.linkedin"), sources: ["linkedin"] },
    { key: "direct", label: t("statsDashboard.sourceGroups.direct"), sources: ["company_site"] },
    { key: "network", label: t("statsDashboard.sourceGroups.network"), sources: ["referral", "recruiter"] },
    { key: "other", label: t("sources.other"), sources: ["indeed", "bayt", "glassdoor", "whatsapp", "other"] }
  ];

  return groups.map((group) => {
    const groupJobs = jobs.filter((job) => group.sources.includes(job.source));
    const interviews = groupJobs.filter((job) => ["interview", "offer", "accepted"].includes(job.status)).length;
    return {
      ...group,
      count: groupJobs.length,
      interviews,
      interviewRate: toPercent(interviews, groupJobs.length)
    };
  }).filter((group) => group.count > 0).sort((first, second) => second.interviewRate - first.interviewRate || second.count - first.count);
}

function renderSimplifiedSourcePerformance(data) {
  const sources = getSimplifiedSourcePerformance(getStatsJobs(StatsFilters.period));
  const best = sources[0] || null;

  return `
    <section class="stats-simple-card stats-source-card glass-card">
      <div class="stats-card-header">
        <h3>${escapeHTML(t("statsDashboard.sourcePerformance"))}</h3>
        <span>${escapeHTML(best ? best.label : t("statsDashboard.noDataShort"))}</span>
      </div>
      ${sources.length
        ? `<div class="source-analytics-list">
            ${sources.map((source) => `
              <div class="source-row">
                <div>
                  <strong>${escapeHTML(source.label)}</strong>
                  <span>${escapeHTML(formatMessage("statsDashboard.sourcePerformanceLine", {
                    applications: source.count,
                    interviews: source.interviews,
                    rate: source.interviewRate
                  }))}</span>
                </div>
                <div class="source-meter" aria-hidden="true"><span style="width: ${escapeHTML(source.interviewRate)}%"></span></div>
                <em>${escapeHTML(source.interviewRate)}%</em>
              </div>
            `).join("")}
          </div>`
        : `<div class="today-positive-state muted-state">${escapeHTML(t("statsDashboard.noSources"))}</div>`}
    </section>
  `;
}

function renderStats() {
  const panel = document.getElementById("tab-stats");
  if (!panel) return;

  const data = getStatsData(StatsFilters.period);

  panel.innerHTML = `
    <section class="stats-dashboard stats-simple-dashboard">
      <div class="stats-hero glass-card">
        <div>
          <p class="eyebrow">${escapeHTML(t("statsDashboard.kicker"))}</p>
          <h2>${escapeHTML(t("statsDashboard.title"))}</h2>
          <p>${escapeHTML(t("statsDashboard.simpleSubtitle"))}</p>
        </div>
        <div class="stats-hero-score">
          <span>${escapeHTML(t(`statsDashboard.periods.${StatsFilters.period}`))}</span>
          <strong>${escapeHTML(data.interviewRate)}%</strong>
        </div>
      </div>

      <div class="stats-filter-bar glass-card">
        <span>${escapeHTML(t("statsDashboard.filterByPeriod"))}</span>
        <div class="period-filter-tabs" role="tablist" aria-label="${escapeHTML(t("statsDashboard.filterByPeriod"))}">
          ${STATS_PERIOD_OPTIONS.map((period) => `
            <button class="period-filter-tab${StatsFilters.period === period ? " active" : ""}" type="button" data-stats-period="${escapeHTML(period)}">${escapeHTML(t(`statsDashboard.periods.${period}`))}</button>
          `).join("")}
        </div>
      </div>

      ${renderSimplifiedStatsKpis(data)}

      <div class="stats-simple-grid">
        <section class="stats-simple-card chart-card glass-card">
          <div class="stats-card-header">
            <h3>${escapeHTML(t("statsDashboard.statusSnapshot"))}</h3>
            <span>${escapeHTML(data.total)}</span>
          </div>
          ${data.total
            ? `${renderStatsChartTypeToggle()}<div class="chart-wrap"><canvas id="stats-simple-chart"></canvas></div>`
            : `<div class="today-positive-state muted-state">${escapeHTML(t("statsDashboard.emptyStats"))}</div>`}
        </section>

        ${renderSimplifiedSourcePerformance(data)}
      </div>
    </section>
  `;

  destroyStatsCharts();
  renderSimplifiedStatsChart(data);
  safeInitIcons();
}

function renderStatsDashboard() {
  renderStats();
}

function renderJobListItem(job) {
  const due = isFollowUpDue(job);
  const interviews = getJobInterviews(job.id);
  const nextInterview = interviews.find((interview) => interview.interviewDate >= todayISO()) || interviews[0];

  return `
    <details class="job-card job-list-item glass-card${due ? " follow-up-due" : ""}${job.isArchived ? " archived-card" : ""}${job.id === highlightedJobId ? " job-highlighted" : ""}" data-job-id="${escapeHTML(job.id)}">
      <summary class="job-list-summary">
        <span class="job-list-main">
          <strong>${escapeHTML(job.company)}</strong>
          <span>${escapeHTML(job.jobTitle)}</span>
        </span>
        <span class="job-list-date">${escapeHTML(formatDate(job.appliedDate))}</span>
        <span class="badge badge-status badge-status-${escapeHTML(job.status)}">${escapeHTML(t(`statuses.${job.status}`))}</span>
        <span class="job-list-chevron"><i data-lucide="chevron-down"></i></span>
      </summary>

      <div class="job-list-details">
        <div class="job-detail-grid">
          <span><strong>${escapeHTML(t("applicationsDashboard.position"))}</strong>${escapeHTML(job.jobTitle)}</span>
          ${job.location ? `<span><strong>${escapeHTML(t("jobs.fields.location"))}</strong>${escapeHTML(job.location)}</span>` : ""}
          <span><strong>${escapeHTML(t("jobs.fields.source"))}</strong>${escapeHTML(t(`sources.${job.source}`))}</span>
          <span><strong>${escapeHTML(t("jobs.appliedDate"))}</strong>${escapeHTML(formatDate(job.appliedDate))}</span>
          ${job.followUpDate ? `<span><strong>${escapeHTML(t("jobs.followUpDate"))}</strong>${escapeHTML(formatDate(job.followUpDate))}</span>` : ""}
          <span><strong>${escapeHTML(t("jobs.followUpCount"))}</strong>${escapeHTML(job.followUpCount)}</span>
        </div>

        <div class="job-status-inline">
          <label for="job-status-${escapeHTML(job.id)}">${escapeHTML(t("applicationsDashboard.changeStatus"))}</label>
          <select id="job-status-${escapeHTML(job.id)}" data-job-status-select data-job-id="${escapeHTML(job.id)}">
            ${[...new Set([...SIMPLE_APPLICATION_STATUS_OPTIONS, job.status])].map((status) => `<option value="${escapeHTML(status)}"${job.status === status ? " selected" : ""}>${escapeHTML(t(`statuses.${status}`))}</option>`).join("")}
          </select>
        </div>

        <div class="job-badge-row">
          <span class="badge badge-priority-${escapeHTML(job.priority)}">${escapeHTML(t(`priority.${job.priority}`))}</span>
          <span class="badge">${escapeHTML(t(`jobTypes.${job.jobType}`))}</span>
          ${due ? `<span class="job-due-label">${escapeHTML(t("jobs.followUpDue"))}</span>` : ""}
        </div>

        ${isSafeUrl(job.jobUrl) ? `<a class="job-detail-link" href="${escapeHTML(job.jobUrl)}" target="_blank" rel="noopener noreferrer">${escapeHTML(t("jobs.openLink"))}</a>` : ""}
        ${job.notes ? `<p class="job-notes">${escapeHTML(job.notes)}</p>` : ""}

        <div class="job-interview-summary">
          <strong>${escapeHTML(t("applicationsDashboard.interviewInfo"))}</strong>
          ${nextInterview ? `
            <span>${escapeHTML(formatDate(nextInterview.interviewDate))}${nextInterview.interviewTime ? ` · ${escapeHTML(nextInterview.interviewTime)}` : ""}</span>
            <span>${escapeHTML(t(`interviewRoundTypes.${nextInterview.roundType}`))} · ${escapeHTML(t(`interviewFormats.${nextInterview.format}`))}</span>
          ` : `<span>${escapeHTML(t("applicationsDashboard.noInterviewInfo"))}</span>`}
        </div>

        <div class="job-actions">
          <button class="btn btn-small btn-secondary" type="button" data-job-action="edit" data-job-id="${escapeHTML(job.id)}">${escapeHTML(t("common.edit"))}</button>
          <button class="btn btn-small btn-secondary" type="button" data-job-action="followUp" data-job-id="${escapeHTML(job.id)}">${escapeHTML(t("jobs.followUpDone"))}</button>
          <button class="btn btn-small btn-secondary" type="button" data-job-action="archive" data-job-id="${escapeHTML(job.id)}">${escapeHTML(t("common.archive"))}</button>
          <button class="btn btn-small btn-danger" type="button" data-job-action="delete" data-job-id="${escapeHTML(job.id)}">${escapeHTML(t("common.delete"))}</button>
        </div>
      </div>
    </details>
  `;
}

function renderJobs() {
  const grid = document.getElementById("jobs-grid");
  const empty = document.getElementById("jobs-empty-state");
  if (!grid || !empty) return;

  renderApplicationsDashboardShell();

  const jobs = getFilteredJobs();
  grid.innerHTML = "";
  empty.classList.toggle("hidden", jobs.length > 0);

  if (!jobs.length) {
    const emptyTitle = empty.querySelector("h2");
    const emptyBody = empty.querySelector("p");
    const emptyAction = empty.querySelector(".empty-state-action");
    const hasAnyJobs = AppState.jobs.length > 0;
    empty.classList.toggle("empty-no-results", hasAnyJobs);
    if (emptyTitle) emptyTitle.textContent = AppState.jobs.length ? t("jobs.noFiltersResult") : t("empty.jobs.title");
    if (emptyBody) emptyBody.textContent = AppState.jobs.length ? t("jobs.noFiltersResultBody") : t("empty.jobs.body");
    if (emptyAction) emptyAction.classList.toggle("hidden", hasAnyJobs);
    safeInitIcons();
    return;
  }

  grid.innerHTML = jobs.map(renderJobListItem).join("");

  safeInitIcons();
}

function initOnboarding() {
  const cvFileInput = document.getElementById("cv-file");

  document.querySelectorAll("[data-next-step]").forEach((button) => {
    button.addEventListener("click", nextStep);
  });

  document.querySelectorAll("[data-prev-step]").forEach((button) => {
    button.addEventListener("click", prevStep);
  });

  document.querySelectorAll("[data-finish-onboarding], [data-skip-onboarding]").forEach((button) => {
    button.addEventListener("click", finishOnboarding);
  });

  if (cvFileInput) {
    cvFileInput.addEventListener("change", handleCvFileChange);
  }

  if (AppState.settings.onboardingCompleted && AppState.user) {
    hideOnboarding();
    showMainApp();
  } else {
    showOnboarding();
  }
}

function showOnboarding() {
  document.getElementById("onboarding-screen").classList.remove("hidden");
  document.getElementById("main-app").classList.add("hidden");
  showStep(onboardingStep);
}

function hideOnboarding() {
  document.getElementById("onboarding-screen").classList.add("hidden");
}

function showStep(step) {
  onboardingStep = Math.min(3, Math.max(1, step));

  document.querySelectorAll(".onboarding-step").forEach((element) => {
    element.classList.toggle("active", Number(element.dataset.step) === onboardingStep);
  });

  document.querySelectorAll(".step-dot").forEach((element) => {
    element.classList.toggle("active", Number(element.dataset.stepDot) === onboardingStep);
  });

  const stepLabel = document.querySelector(".step-label");
  if (stepLabel) {
    stepLabel.textContent = t(`onboarding.stepLabels.${onboardingStep}`);
  }
}

function nextStep() {
  if (onboardingStep === 2 && !saveUserFromOnboarding()) {
    return;
  }

  showStep(onboardingStep + 1);
}

function prevStep() {
  showStep(onboardingStep - 1);
}

function saveUserFromOnboarding() {
  const nameInput = document.getElementById("user-name");
  const specialtyInput = document.getElementById("user-specialty");
  const countryInput = document.getElementById("user-country");
  const name = nameInput.value.trim();
  const specialty = specialtyInput.value.trim();
  const country = countryInput.value.trim();

  if (!name || !specialty || !country) {
    showToast("errors.requiredProfileInfo");
    (nameInput.value.trim() ? specialtyInput.value.trim() ? countryInput : specialtyInput : nameInput).focus();
    return false;
  }

  AppState.user = {
    id: AppState.user?.id || uuid(),
    name,
    specialty,
    country,
    createdAt: AppState.user?.createdAt || todayISO()
  };

  StorageManager.set(StorageManager.KEYS.USER, AppState.user);
  updateHeader();
  return true;
}

function handleCvFileChange(event) {
  const file = event.target.files[0];
  const fileName = document.getElementById("cv-file-name");

  if (!file) {
    fileName.textContent = t("onboarding.step3.uploadHint");
    return;
  }

  if (file.type !== "application/pdf") {
    event.target.value = "";
    fileName.textContent = t("onboarding.step3.uploadHint");
    showToast("errors.invalidPdf");
    return;
  }

  const cvMeta = {
    id: uuid(),
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: todayISO()
  };

  StorageManager.set(StorageManager.KEYS.CV, cvMeta);
  fileName.textContent = file.name;
}

function finishOnboarding() {
  if (!saveUserFromOnboarding()) {
    showStep(2);
    return;
  }

  AppState.settings = {
    ...AppState.settings,
    onboardingCompleted: true,
    language: AppState.language
  };
  StorageManager.set(StorageManager.KEYS.SETTINGS, AppState.settings);

  hideOnboarding();
  showMainApp();
  showToast("emotional.saved");
}

function showMainApp() {
  document.getElementById("main-app").classList.remove("hidden");
  updateHeader();
  renderEmptyStates();
  renderJobs();
  switchTab(AppState.currentTab);
  safeInitIcons();
}

function updateHeader() {
  const userName = document.getElementById("header-user-name");
  const displayName = AppState.user?.name || t("common.guest");
  if (userName) {
    userName.textContent = displayName;
  }

  const applicationsHeroUser = document.getElementById("applications-hero-user");
  if (applicationsHeroUser) {
    applicationsHeroUser.textContent = displayName;
  }
}

function normalizeVisibleTab(tabName) {
  if (["today", "profile"].includes(tabName)) return "jobs";
  return tabName;
}

function switchTab(tabName) {
  const nextTab = normalizeVisibleTab(tabName);
  AppState.currentTab = nextTab;

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === nextTab);
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `tab-${nextTab}`);
  });

  const fab = document.querySelector(".fab-add-job");
  if (fab) fab.classList.add("hidden");

  if (nextTab === "today") {
    renderTodayDashboard();
  }

  if (nextTab === "stats") {
    renderStats();
  }

  if (nextTab === "interviews") {
    renderInterviews();
  }

  if (nextTab === "settings") {
    renderSettings();
  }
}

function renderEmptyStates() {
  renderProfileReadiness();
  renderAnalyzerReadiness();
  renderSettingsReadiness();
  safeInitIcons();
}

function renderProfileReadiness() {
  const panel = document.getElementById("tab-profile");
  if (!panel) return;

  panel.innerHTML = `
    <section class="foundation-panel">
      <div class="foundation-hero glass-card">
        <div class="foundation-icon"><i data-lucide="user"></i></div>
        <div>
          <p class="eyebrow">${escapeHTML(t("foundation.foundationReady"))}</p>
          <h2>${escapeHTML(t("foundation.profileReady"))}</h2>
          <p>${escapeHTML(t("foundation.profileBody"))}</p>
        </div>
      </div>
    </section>
  `;
}

async function extractPdfText(file) {
  if (!isLibraryAvailable("pdfjsLib")) {
    throw new Error("pdfjs_unavailable");
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    fullText += `${pageText}\n`;
  }

  return fullText.trim();
}

function limitCvText(text) {
  const source = String(text || "").trim();
  if (source.length <= MAX_CV_TEXT_CHARS) return source;

  showToast("analyzer.cvTruncated");
  return source.slice(0, MAX_CV_TEXT_CHARS);
}

function buildAnalyzerPrompt(mode, cvText, payload = {}) {
  const lang = AppState.language === "ar" ? "Arabic" : "English";
  const header = `You are an expert career coach and ATS specialist. Respond ONLY in ${lang}. Use clean Markdown with headings, bullet points, and a final summary. Be specific and actionable.`;

  if (mode === "job_match") {
    const jobDescription = payload.jobDescription || "";
    const sections = [
      t("analyzer.matchScore"),
      t("analyzer.strongPoints"),
      t("analyzer.missingKeywords"),
      t("analyzer.weakPoints"),
      t("analyzer.suggestedCvImprovements")
    ].join(", ");

    return `${header}\n\nTask: Compare the CV against the job description. Structure the answer with exactly these section headings: ${sections}. Give a score out of 100 and practical edits.\n\n--- JOB DESCRIPTION ---\n${jobDescription}\n\n--- CV ---\n${cvText}`;
  }

  if (mode === "interview_prep") {
    const interviewInfo = [
      payload.company ? `Company: ${payload.company}` : "",
      payload.position ? `Position: ${payload.position}` : "",
      payload.interviewType ? `Interview Type: ${payload.interviewType}` : "",
      payload.interviewerName ? `Interviewer Name: ${payload.interviewerName}` : "",
      payload.interviewerTitle ? `Interviewer Title: ${payload.interviewerTitle}` : "",
      payload.notes ? `Notes: ${payload.notes}` : ""
    ].filter(Boolean).join("\n");
    const sections = [
      t("analyzer.expectedQuestions"),
      t("analyzer.bestTalkingPoints"),
      t("analyzer.roleCompanyFocus"),
      t("analyzer.weakAreasToPrepare"),
      t("analyzer.shortSelfIntroduction")
    ].join(", ");

    return `${header}\n\nTask: Prepare the candidate for the following interview using their CV. Structure the answer with exactly these section headings: ${sections}. Keep it concrete and interview-ready.\n\n--- INTERVIEW ---\n${interviewInfo}\n\n--- CV ---\n${cvText}`;
  }

  if (mode === "career") {
    return `${header}\n\nTask: Provide a full strategic career analysis based on this CV: current positioning, strengths, gaps, suggested next roles, skills to learn, and a 6-12 month growth plan.\n\n--- CV ---\n${cvText}`;
  }

  return `${header}\n\nTask: Review this CV in detail. Cover: overall impression, strengths, weaknesses, ATS-friendliness, formatting, wording improvements, and a prioritized action list.\n\n--- CV ---\n${cvText}`;
}

async function callGemini(prompt) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error("no_api_key");

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error("invalid_api_key");
    if (response.status === 429) throw new Error("quota_exceeded");
    throw new Error("api_failed");
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("api_failed");
  return text;
}

function getLibraryStatusItems() {
  return [
    {
      key: "Chart",
      name: "Chart.js",
      label: t("foundation.chartReady"),
      use: t("foundation.uses.stats"),
      available: isLibraryAvailable("Chart")
    },
    {
      key: "lucide",
      name: "Lucide",
      label: t("foundation.iconsReady"),
      use: t("foundation.uses.icons"),
      available: isLibraryAvailable("lucide")
    },
    {
      key: "marked",
      name: "Marked.js",
      label: t("foundation.markdownReady"),
      use: t("foundation.uses.aiMarkdown"),
      available: isLibraryAvailable("marked")
    },
    {
      key: "DOMPurify",
      name: "DOMPurify",
      label: t("foundation.sanitizerReady"),
      use: t("foundation.uses.security"),
      available: isLibraryAvailable("DOMPurify")
    },
    {
      key: "pdfjsLib",
      name: "PDF.js",
      label: isLibraryAvailable("pdfjsLib") ? t("foundation.pdfReady") : t("foundation.pdfPending"),
      use: t("foundation.uses.cvReading"),
      available: isLibraryAvailable("pdfjsLib")
    }
  ];
}

function renderLibraryStatus() {
  return `
    <div class="library-status-table" role="table" aria-label="${escapeHTML(t("foundation.libraryStatus"))}">
      <div class="library-status-head" role="row">
        <span role="columnheader">${escapeHTML(t("foundation.library"))}</span>
        <span role="columnheader">${escapeHTML(t("foundation.status"))}</span>
        <span role="columnheader">${escapeHTML(t("foundation.use"))}</span>
      </div>
      ${getLibraryStatusItems().map((item) => `
        <article class="library-status-row ${item.available ? "is-ready" : "is-pending"}" role="row">
          <strong role="cell">${escapeHTML(item.name)}</strong>
          <span class="library-state" role="cell">
            <span class="library-dot" aria-hidden="true"></span>
            ${escapeHTML(item.available ? t("foundation.available") : t("foundation.missing"))}
          </span>
          <p role="cell">${escapeHTML(item.use)}</p>
          <small>${escapeHTML(item.label)}</small>
        </article>
      `).join("")}
    </div>
  `;
}

function renderAnalyzerReadiness() {
  const panel = document.getElementById("tab-analyzer");
  if (!panel) return;

  const apiKeySet = Boolean(getGeminiApiKey());
  const storedCv = getStoredCv();

  if (!analyzerCvText && storedCv?.text) {
    analyzerCvText = storedCv.text;
    analyzerCvFileName = storedCv.name || "";
  }

  const modes = [
    { id: "job_match", icon: "target", title: t("analyzer.modeJobMatch"), desc: t("analyzer.modeJobMatchDesc") },
    { id: "interview_prep", icon: "messages-square", title: t("analyzer.modeInterviewPrep"), desc: t("analyzer.modeInterviewPrepDesc") }
  ];
  const prefill = analyzerInterviewPrefill || {};

  panel.innerHTML = `
    <section class="analyzer-panel analyzer-simple-panel">
      <div class="analyzer-hero glass-card">
        <div class="foundation-icon"><i data-lucide="brain"></i></div>
        <div>
          <p class="eyebrow">${escapeHTML(t("analyzer.kicker"))}</p>
          <h2>${escapeHTML(t("analyzer.simpleTitle"))}</h2>
          <p>${escapeHTML(t("analyzer.simpleSubtitle"))}</p>
        </div>
      </div>

      <section class="analyzer-card analyzer-compact-card glass-card">
        <div class="g-section-header">
          <h3>${escapeHTML(t("analyzer.apiSectionTitle"))}</h3>
          <span class="g-chip ${apiKeySet ? "is-ready" : ""}">${escapeHTML(apiKeySet ? t("analyzer.apiKeySet") : t("analyzer.apiKeyNotSet"))}</span>
        </div>
        <div class="analyzer-api-row">
          <input id="analyzer-api-key" type="password" placeholder="${escapeHTML(t("analyzer.apiPlaceholder"))}" value="${escapeHTML(getGeminiApiKey())}">
          <button class="btn btn-primary" type="button" id="analyzer-save-key">${escapeHTML(t("analyzer.apiSave"))}</button>
        </div>
        <p class="g-muted">${escapeHTML(t("analyzer.apiHint"))} <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">${escapeHTML(t("analyzer.getApiKey"))}</a></p>
      </section>

      <section class="analyzer-card glass-card">
        <div class="g-section-header"><h3>${escapeHTML(t("analyzer.cvSource"))}</h3></div>
        <label class="upload-box" for="analyzer-cv-file">
          <span class="upload-icon">PDF</span>
          <strong>${escapeHTML(t("analyzer.uploadCv"))}</strong>
          <small id="analyzer-cv-name">${escapeHTML(analyzerCvFileName || (storedCv?.name ? `${t("analyzer.usingStoredCv")} · ${storedCv.name}` : t("analyzer.uploadCvToStart")))}</small>
          <input id="analyzer-cv-file" type="file" accept="application/pdf">
        </label>
      </section>

      <section class="analyzer-card glass-card">
        <div class="g-section-header"><h3>${escapeHTML(t("analyzer.modesTitle"))}</h3></div>
        <div class="analyzer-modes-grid">
          ${modes.map((mode) => `
            <button class="analyzer-mode-card${analyzerMode === mode.id ? " active" : ""}" type="button" data-analyzer-mode="${escapeHTML(mode.id)}">
              <span class="analyzer-mode-icon"><i data-lucide="${escapeHTML(mode.icon)}"></i></span>
              <strong>${escapeHTML(mode.title)}</strong>
              <p>${escapeHTML(mode.desc)}</p>
            </button>
          `).join("")}
        </div>

        <div class="analyzer-mode-form${analyzerMode === "job_match" ? "" : " hidden"}" data-analyzer-form="job_match">
          <label class="field">
            <span>${escapeHTML(t("analyzer.jobDescription"))}</span>
            <textarea id="analyzer-job-description" rows="8" placeholder="${escapeHTML(t("analyzer.jobDescriptionPlaceholder"))}"></textarea>
          </label>
          <button class="btn btn-primary analyzer-run-btn" type="button" data-analyzer-run>${escapeHTML(t("analyzer.analyzeJobMatch"))}</button>
        </div>

        <div class="analyzer-mode-form${analyzerMode === "interview_prep" ? "" : " hidden"}" data-analyzer-form="interview_prep">
          <div class="form-grid two-columns">
            <label class="field">
              <span>${escapeHTML(t("analyzer.company"))}</span>
              <input id="analyzer-company" type="text" value="${escapeHTML(prefill.company || "")}">
            </label>
            <label class="field">
              <span>${escapeHTML(t("analyzer.position"))}</span>
              <input id="analyzer-position" type="text" value="${escapeHTML(prefill.position || "")}">
            </label>
            <label class="field">
              <span>${escapeHTML(t("analyzer.interviewType"))}</span>
              <select id="analyzer-interview-type">
                ${["hr", "technical", "manager"].map((type) => `<option value="${escapeHTML(type)}"${(prefill.interviewType || "hr") === type ? " selected" : ""}>${escapeHTML(t(`analyzer.interviewTypes.${type}`))}</option>`).join("")}
              </select>
            </label>
            <label class="field">
              <span>${escapeHTML(t("analyzer.interviewerName"))}</span>
              <input id="analyzer-interviewer-name" type="text" value="${escapeHTML(prefill.interviewerName || "")}">
            </label>
            <label class="field">
              <span>${escapeHTML(t("analyzer.interviewerTitle"))}</span>
              <input id="analyzer-interviewer-title" type="text" value="${escapeHTML(prefill.interviewerTitle || "")}">
            </label>
          </div>
          <label class="field">
            <span>${escapeHTML(t("jobs.fields.notes"))}</span>
            <textarea id="analyzer-interview-notes" rows="4">${escapeHTML(prefill.notes || "")}</textarea>
          </label>
          <button class="btn btn-primary analyzer-run-btn" type="button" data-analyzer-run>${escapeHTML(t("analyzer.prepareForInterview"))}</button>
        </div>
      </section>

      <section class="analyzer-card glass-card hidden" id="analyzer-result-card">
        <div class="g-section-header">
          <h3>${escapeHTML(t("analyzer.resultTitle"))}</h3>
          <button class="btn btn-small btn-secondary" type="button" id="analyzer-copy-result">${escapeHTML(t("analyzer.copyResult"))}</button>
        </div>
        <div class="analyzer-result markdown-body" id="analyzer-result-body"></div>
      </section>

      <section class="analyzer-card analyzer-empty-result glass-card" id="analyzer-empty-result">
        <strong>${escapeHTML(analyzerCvText ? t("analyzer.chooseModeRun") : t("analyzer.uploadCvToStart"))}</strong>
      </section>
    </section>
  `;

  safeInitIcons();
}

function renderSavedAnalysesList() {
  if (!AppState.analyses.length) {
    return `<div class="today-positive-state muted-state">${escapeHTML(t("analyzer.savedEmpty"))}</div>`;
  }

  return `
    <div class="analyzer-saved-grid">
      ${AppState.analyses.slice(0, 5).map((analysis) => `
        <article class="analyzer-saved-item">
          <div>
            <span class="badge">${escapeHTML(t(`analyzer.modeLabels.${analysis.mode}`))}</span>
            <strong>${escapeHTML(analysis.title || t("analyzer.resultTitle"))}</strong>
            <small>${escapeHTML(formatDate(analysis.date))}</small>
          </div>
          <div class="analyzer-saved-actions">
            <button class="btn btn-small btn-secondary" type="button" data-saved-action="view" data-analysis-id="${escapeHTML(analysis.id)}">${escapeHTML(t("common.view"))}</button>
            <button class="btn btn-small btn-danger" type="button" data-saved-action="delete" data-analysis-id="${escapeHTML(analysis.id)}">${escapeHTML(t("analyzer.deleteAnalysis"))}</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function setAnalyzerMode(mode) {
  analyzerMode = ["job_match", "interview_prep"].includes(mode) ? mode : "job_match";
  renderAnalyzerReadiness();
}

function showAnalyzerResult(markdown) {
  const card = document.getElementById("analyzer-result-card");
  const body = document.getElementById("analyzer-result-body");
  const empty = document.getElementById("analyzer-empty-result");
  if (!card || !body) return;
  body.innerHTML = safeRenderMarkdown(markdown);
  card.classList.remove("hidden");
  if (empty) empty.classList.add("hidden");
  card.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function handleAnalyzerCvUpload(event) {
  const file = event.target.files[0];
  const nameLabel = document.getElementById("analyzer-cv-name");
  if (!file) return;

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    showToast("analyzer.errorInvalidPdf");
    event.target.value = "";
    return;
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    showToast("analyzer.errorFileTooLarge");
    event.target.value = "";
    return;
  }

  try {
    if (nameLabel) nameLabel.textContent = t("analyzer.loadingReadingPdf");
    analyzerCvText = limitCvText(await extractPdfText(file));
    analyzerCvFileName = file.name;
    if (!analyzerCvText) {
      showToast("analyzer.noCvText");
      if (nameLabel) nameLabel.textContent = t("analyzer.uploadHint");
      return;
    }
    StorageManager.set(StorageManager.KEYS.CV, {
      name: file.name,
      text: analyzerCvText,
      updatedAt: todayISO()
    });
    if (nameLabel) nameLabel.textContent = file.name;
    const emptyState = document.querySelector("#analyzer-empty-result strong");
    if (emptyState) emptyState.textContent = t("analyzer.chooseModeRun");
  } catch (error) {
    console.error(error);
    showToast("analyzer.errorPdfFailed");
    if (nameLabel) nameLabel.textContent = t("analyzer.uploadHint");
  }
}

function getAnalyzerPayload() {
  if (analyzerMode === "interview_prep") {
    return {
      company: document.getElementById("analyzer-company")?.value.trim() || "",
      position: document.getElementById("analyzer-position")?.value.trim() || "",
      interviewType: document.getElementById("analyzer-interview-type")?.value || "hr",
      interviewerName: document.getElementById("analyzer-interviewer-name")?.value.trim() || "",
      interviewerTitle: document.getElementById("analyzer-interviewer-title")?.value.trim() || "",
      notes: document.getElementById("analyzer-interview-notes")?.value.trim() || ""
    };
  }

  return {
    jobDescription: document.getElementById("analyzer-job-description")?.value.trim() || ""
  };
}

function validateAnalyzerPayload(payload) {
  if (!analyzerCvText) return "analyzer.errorNoCv";
  if (analyzerMode === "job_match" && !payload.jobDescription) return "analyzer.errorNoJobDescription";
  if (analyzerMode === "interview_prep" && (!payload.interviewType || (!payload.company && !payload.position))) {
    return "analyzer.errorNoInterviewInfo";
  }
  return "";
}

function getAnalyzerRunLabel() {
  return analyzerMode === "interview_prep"
    ? t("analyzer.prepareForInterview")
    : t("analyzer.analyzeJobMatch");
}

async function runAnalysis(runButton = null) {
  if (isAnalyzing) return;

  const now = Date.now();
  if (now - lastAnalysisTime < ANALYSIS_COOLDOWN_MS) {
    showToast("analyzer.pleaseWait");
    return;
  }

  if (!getGeminiApiKey()) {
    showToast("analyzer.errorNoApiKey");
    return;
  }
  const payload = getAnalyzerPayload();
  const validationError = validateAnalyzerPayload(payload);
  if (validationError) {
    showToast(validationError);
    return;
  }

  isAnalyzing = true;
  lastAnalysisTime = now;
  if (runButton) {
    runButton.disabled = true;
    runButton.textContent = t("analyzer.loadingThinking");
  }

  try {
    const prompt = buildAnalyzerPrompt(analyzerMode, analyzerCvText, payload);
    const resultText = await callGemini(prompt);

    const analysis = {
      id: uuid(),
      mode: analyzerMode,
      title: analyzerMode === "interview_prep"
        ? [payload.position, payload.company].filter(Boolean).join(" · ") || t("analyzer.modeInterviewPrep")
        : t("analyzer.modeJobMatch"),
      content: resultText,
      date: todayISO(),
      createdAt: todayISO()
    };

    AppState.analyses = [analysis, ...AppState.analyses].slice(0, 20);
    AppState.saveAnalyses();
    showAnalyzerResult(resultText);

    safeInitIcons();
  } catch (error) {
    console.error(error);
    const errorMessages = {
      invalid_api_key: "analyzer.errorInvalidKey",
      quota_exceeded: "analyzer.errorQuotaExceeded",
      no_api_key: "analyzer.errorNoApiKey",
      api_failed: "analyzer.errorApiFailed"
    };
    showToast(errorMessages[error.message] || "analyzer.errorApiFailed");
  } finally {
    isAnalyzing = false;
    if (runButton) {
      runButton.disabled = false;
      runButton.textContent = getAnalyzerRunLabel();
    }
  }
}

function deleteAnalysis(analysisId) {
  AppState.analyses = AppState.analyses.filter((item) => item.id !== analysisId);
  AppState.saveAnalyses();
  const savedList = document.getElementById("analyzer-saved-list");
  if (savedList) savedList.innerHTML = renderSavedAnalysesList();
  safeInitIcons();
}

function viewSavedAnalysis(analysisId) {
  const analysis = AppState.analyses.find((item) => item.id === analysisId);
  if (analysis) showAnalyzerResult(analysis.content);
}

function bindAnalyzerEvents() {
  const panel = document.getElementById("tab-analyzer");
  if (!panel || panel.dataset.analyzerEventsBound === "true") return;
  panel.dataset.analyzerEventsBound = "true";

  panel.addEventListener("click", (event) => {
    const modeButton = event.target.closest("[data-analyzer-mode]");
    if (modeButton) {
      setAnalyzerMode(modeButton.dataset.analyzerMode);
      return;
    }

    const savedButton = event.target.closest("[data-saved-action]");
    if (savedButton) {
      const id = savedButton.dataset.analysisId;
      if (savedButton.dataset.savedAction === "delete") deleteAnalysis(id);
      if (savedButton.dataset.savedAction === "view") viewSavedAnalysis(id);
      return;
    }

    if (event.target.closest("#analyzer-save-key")) {
      const input = document.getElementById("analyzer-api-key");
      if (!input || !input.value.trim()) {
        showToast("analyzer.apiMissing");
        return;
      }
      setGeminiApiKey(input.value);
      showToast("analyzer.apiSaved");
      renderAnalyzerReadiness();
      return;
    }

    const runButton = event.target.closest("[data-analyzer-run]");
    if (runButton) {
      runAnalysis(runButton);
      return;
    }

    if (event.target.closest("#analyzer-copy-result")) {
      const body = document.getElementById("analyzer-result-body");
      if (body && navigator.clipboard) {
        navigator.clipboard.writeText(body.innerText).then(() => showToast("analyzer.copied"));
      }
    }
  });

  panel.addEventListener("change", (event) => {
    if (event.target.id === "analyzer-cv-file") {
      handleAnalyzerCvUpload(event);
    }
  });
}

function renderSettings() {
  const panel = document.getElementById("tab-settings");
  if (!panel) return;

  panel.innerHTML = `
    <section class="settings-container">
      <div class="settings-header glass-card">
        <div class="foundation-icon"><i data-lucide="settings"></i></div>
        <div>
          <p class="eyebrow">${escapeHTML(t("settings.kicker"))}</p>
          <h2>${escapeHTML(t("settings.title"))}</h2>
          <p>${escapeHTML(t("settings.subtitle"))}</p>
        </div>
      </div>

      <div class="settings-grid">
        ${renderProfileSummarySettings()}
        ${renderPreferenceSettings()}
        ${renderGeminiSettings()}
        ${renderExportSettings()}
        ${renderImportSettings()}
        ${renderBackupSettings()}
        ${renderDangerZone()}
        ${renderAppInfoSettings()}
      </div>
      <div id="settings-toast-region" aria-live="polite"></div>
    </section>
  `;

  safeInitIcons();
}

function renderSettingsReadiness() {
  renderSettings();
}

function renderSettingsModal() {
  const content = document.getElementById("settings-modal-content");
  if (!content) return;

  const apiKeySet = Boolean(getGeminiApiKey());
  content.innerHTML = `
    <div class="settings-modal-shell">
      <div class="settings-modal-header">
        <div>
          <p class="eyebrow">${escapeHTML(t("settings.kicker"))}</p>
          <h2 id="settings-modal-title">${escapeHTML(t("settings.modalTitle"))}</h2>
        </div>
        <button class="icon-btn" type="button" data-settings-modal-close aria-label="${escapeHTML(t("settings.closeSettings"))}">×</button>
      </div>

      <section class="settings-modal-section">
        <h3>${escapeHTML(t("settings.language"))}</h3>
        <div class="settings-segment" role="group" aria-label="${escapeHTML(t("settings.language"))}">
          <button class="settings-seg-btn${AppState.language === "ar" ? " active" : ""}" type="button" data-settings-modal-language="ar">عربي</button>
          <button class="settings-seg-btn${AppState.language === "en" ? " active" : ""}" type="button" data-settings-modal-language="en">English</button>
        </div>
      </section>

      <section class="settings-modal-section">
        <div class="g-section-header">
          <h3>${escapeHTML(t("settings.geminiApiSettings"))}</h3>
          <span class="settings-status-badge ${apiKeySet ? "active" : "missing"}">${escapeHTML(apiKeySet ? t("settings.apiActive") : t("settings.apiNotSetShort"))}</span>
        </div>
        <p class="g-muted">${escapeHTML(t("settings.apiLocalBrowser"))}</p>
        <div class="settings-modal-api-row">
          <input class="settings-input" id="settings-modal-api-key" type="password" placeholder="${escapeHTML(t("settings.apiInputPlaceholder"))}" value="${escapeHTML(getGeminiApiKey())}">
          <button class="btn btn-primary" type="button" data-settings-modal-action="save-api">${escapeHTML(t("settings.saveApiKey"))}</button>
          <button class="btn btn-secondary" type="button" data-settings-modal-action="clear-api"${apiKeySet ? "" : " disabled"}>${escapeHTML(t("settings.removeApiKey"))}</button>
        </div>
      </section>

      <section class="settings-modal-section">
        <h3>${escapeHTML(t("settings.data"))}</h3>
        <div class="settings-modal-actions">
          <button class="btn btn-primary" type="button" data-settings-modal-action="export">${escapeHTML(t("settings.exportData"))}</button>
          <button class="btn btn-secondary" type="button" data-settings-modal-action="choose-import">${escapeHTML(t("settings.importData"))}</button>
          <input class="settings-file-input" id="settings-modal-import-file" type="file" accept="application/json,.json">
        </div>
        <div class="import-preview hidden" id="settings-modal-import-preview">
          <h4>${escapeHTML(t("settings.importPreview"))}</h4>
          <div class="import-preview-grid" id="settings-modal-import-summary"></div>
          <div class="settings-actions">
            <button class="btn btn-secondary" type="button" data-settings-modal-action="import-merge">${escapeHTML(t("settings.mergeExisting"))}</button>
            <button class="btn btn-danger" type="button" data-settings-modal-action="import-replace">${escapeHTML(t("settings.replaceExisting"))}</button>
          </div>
        </div>
        <div class="settings-modal-reset">
          <input class="settings-input" id="settings-modal-delete-confirm" type="text" placeholder="${escapeHTML(t("settings.deleteAllConfirm"))}">
          <button class="btn btn-danger" type="button" data-settings-modal-action="reset-data">${escapeHTML(t("settings.resetData"))}</button>
        </div>
      </section>

      <section class="settings-modal-info">
        <span>AI CV Tracker</span>
        <strong>${escapeHTML(t("settings.localBrowserStorage"))}</strong>
      </section>

      <div id="settings-toast-region" aria-live="polite"></div>
    </div>
  `;

  safeInitIcons();
}

function openSettingsModal() {
  const overlay = document.getElementById("settings-modal-overlay");
  if (!overlay) return;

  settingsModalReturnFocus = document.activeElement;
  renderSettingsModal();
  overlay.classList.remove("hidden");
  overlay.setAttribute("aria-hidden", "false");
  document.getElementById("header-settings-button")?.setAttribute("aria-expanded", "true");
  const closeButton = overlay.querySelector("[data-settings-modal-close]");
  closeButton?.focus();
}

function closeSettingsModal() {
  const overlay = document.getElementById("settings-modal-overlay");
  if (!overlay) return;

  overlay.classList.add("hidden");
  overlay.setAttribute("aria-hidden", "true");
  document.getElementById("header-settings-button")?.setAttribute("aria-expanded", "false");
  if (settingsModalReturnFocus && typeof settingsModalReturnFocus.focus === "function") {
    settingsModalReturnFocus.focus();
  }
  settingsModalReturnFocus = null;
}

function trapSettingsModalFocus(event) {
  if (event.key !== "Tab") return;
  const overlay = document.getElementById("settings-modal-overlay");
  if (!overlay || overlay.classList.contains("hidden")) return;

  const focusable = Array.from(overlay.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"))
    .filter((element) => !element.disabled && element.offsetParent !== null);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function showSettingsModalImportPreview(summary) {
  const preview = document.getElementById("settings-modal-import-preview");
  const summaryBox = document.getElementById("settings-modal-import-summary");
  if (!preview || !summaryBox) return;

  summaryBox.innerHTML = `
    <div><span>Applications</span><strong>${escapeHTML(summary.jobs)}</strong></div>
    <div><span>Interviews</span><strong>${escapeHTML(summary.interviews)}</strong></div>
    <div><span>Analyses</span><strong>${escapeHTML(summary.analyses)}</strong></div>
    <div><span>User</span><strong>${escapeHTML(summary.hasUser ? t("settings.present") : t("settings.absent"))}</strong></div>
    <div><span>Settings</span><strong>${escapeHTML(summary.hasSettings ? t("settings.present") : t("settings.absent"))}</strong></div>
  `;
  preview.classList.remove("hidden");
}

async function handleSettingsModalImportFile(file) {
  if (!file) {
    showSettingsToast("settings.invalidBackupFile", "error");
    return;
  }

  try {
    pendingImportRaw = await readImportFile(file);
    pendingImport = validateImportData(pendingImportRaw);
    if (!pendingImport) {
      showSettingsToast("settings.invalidBackupFile", "error");
      return;
    }
    showSettingsModalImportPreview(getImportSummary(pendingImport));
  } catch (error) {
    console.error(error);
    pendingImport = null;
    pendingImportRaw = null;
    showSettingsToast("settings.invalidBackupFile", "error");
  }
}

async function confirmSettingsModalImport(mode) {
  if (!pendingImport) return;
  const confirmKey = mode === "replace" ? "settings.confirmImportReplace" : "settings.confirmImportMerge";
  const confirmed = await confirmDangerAction(confirmKey);
  if (!confirmed) return;

  importData(pendingImport, mode);
  pendingImport = null;
  pendingImportRaw = null;
  showSettingsToast("settings.importCompleted", "success");
  renderSettingsModal();
}

function bindSettingsModalEvents() {
  const overlay = document.getElementById("settings-modal-overlay");
  if (!overlay || overlay.dataset.settingsModalEventsBound === "true") return;
  overlay.dataset.settingsModalEventsBound = "true";

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay || event.target.closest("[data-settings-modal-close]")) {
      closeSettingsModal();
      return;
    }

    const languageButton = event.target.closest("[data-settings-modal-language]");
    if (languageButton) {
      setLanguage(languageButton.dataset.settingsModalLanguage);
      renderSettingsModal();
      return;
    }

    const actionButton = event.target.closest("[data-settings-modal-action]");
    if (!actionButton) return;
    const action = actionButton.dataset.settingsModalAction;

    if (action === "save-api") {
      const input = document.getElementById("settings-modal-api-key");
      setGeminiApiKey(input?.value || "");
      showSettingsToast("analyzer.apiSaved", "success");
      renderSettingsModal();
      return;
    }

    if (action === "clear-api") {
      setGeminiApiKey("");
      showSettingsToast("settings.apiCleared", "success");
      renderSettingsModal();
      return;
    }

    if (action === "export") {
      exportData("all");
      return;
    }

    if (action === "choose-import") {
      document.getElementById("settings-modal-import-file")?.click();
      return;
    }

    if (action === "import-merge") {
      confirmSettingsModalImport("merge");
      return;
    }

    if (action === "import-replace") {
      confirmSettingsModalImport("replace");
      return;
    }

    if (action === "reset-data") {
      deleteAllData();
    }
  });

  overlay.addEventListener("change", (event) => {
    if (event.target.id === "settings-modal-import-file") {
      handleSettingsModalImportFile(event.target.files?.[0]);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (overlay.classList.contains("hidden")) return;
    if (event.key === "Escape") closeSettingsModal();
    trapSettingsModalFocus(event);
  });
}

function settingsCard(title, description, body, extraClass = "") {
  return `
    <section class="settings-card glass-card ${extraClass}">
      <div>
        <h3 class="settings-card-title">${escapeHTML(title)}</h3>
        ${description ? `<p class="settings-card-description">${escapeHTML(description)}</p>` : ""}
      </div>
      ${body}
    </section>
  `;
}

function renderProfileSummarySettings() {
  const storedCv = getStoredCv();
  const hasCv = Boolean(storedCv?.name || storedCv?.text);
  const statusClass = hasCv ? "active" : "missing";

  return settingsCard(t("settings.profileSummary"), "", `
    <div class="settings-profile-grid">
      <div><span class="g-muted">${escapeHTML(t("settings.profileName"))}</span><strong>${escapeHTML(AppState.user?.name || t("common.guest"))}</strong></div>
      <div><span class="g-muted">${escapeHTML(t("settings.profileSpecialty"))}</span><strong>${escapeHTML(AppState.user?.specialty || "-")}</strong></div>
      <div><span class="g-muted">${escapeHTML(t("settings.profileCountry"))}</span><strong>${escapeHTML(AppState.user?.country || "-")}</strong></div>
      <div><span class="g-muted">CV</span><strong><span class="settings-status-badge ${statusClass}">${escapeHTML(hasCv ? t("settings.cvUploaded") : t("settings.cvNotUploaded"))}</span></strong></div>
    </div>
    <div class="settings-actions">
      <button class="btn btn-secondary" type="button" id="settings-edit-profile">${escapeHTML(t("settings.editProfile"))}</button>
      <button class="btn btn-primary" type="button" id="settings-upload-cv">${escapeHTML(t("settings.uploadReplaceCv"))}</button>
      <input class="settings-file-input" id="settings-cv-file" type="file" accept="application/pdf">
    </div>
  `);
}

function renderPreferenceSettings() {
  const settings = getSettings();
  const theme = settings.theme || "dark";
  const defaultPeriod = settings.defaultStatsPeriod || "all";
  const autoSaveOn = settings.autoSave !== false;
  const compactOn = Boolean(settings.compactMode);

  return settingsCard(t("settings.preferences"), "", `
    <div class="settings-row">
      <label class="settings-label" for="settings-language">${escapeHTML(t("settings.language"))}</label>
      <select class="settings-select" id="settings-language">
        <option value="ar"${AppState.language === "ar" ? " selected" : ""}>عربي</option>
        <option value="en"${AppState.language === "en" ? " selected" : ""}>English</option>
      </select>
    </div>
    <div class="settings-row">
      <label class="settings-label" for="settings-theme">${escapeHTML(t("settings.theme"))}</label>
      <select class="settings-select" id="settings-theme">
        ${["dark", "light", "system"].map((value) => `<option value="${value}"${theme === value ? " selected" : ""}>${escapeHTML(t(`settings.${value}`))}</option>`).join("")}
      </select>
    </div>
    <div class="settings-row">
      <label class="settings-label" for="settings-default-period">${escapeHTML(t("settings.defaultStatsPeriod"))}</label>
      <select class="settings-select" id="settings-default-period">
        ${STATS_PERIOD_OPTIONS.map((period) => `<option value="${escapeHTML(period)}"${defaultPeriod === period ? " selected" : ""}>${escapeHTML(t(`statsDashboard.periods.${period}`))}</option>`).join("")}
      </select>
    </div>
    <div class="settings-row">
      <span class="settings-label">${escapeHTML(t("settings.autoSave"))}</span>
      <button class="settings-toggle${autoSaveOn ? " on" : ""}" type="button" id="settings-toggle-autosave" role="switch" aria-checked="${autoSaveOn}"><span></span></button>
    </div>
    <div class="settings-row">
      <span class="settings-label">${escapeHTML(t("settings.compactMode"))}</span>
      <button class="settings-toggle${compactOn ? " on" : ""}" type="button" id="settings-toggle-compact" role="switch" aria-checked="${compactOn}"><span></span></button>
    </div>
  `);
}

function renderGeminiSettings() {
  const apiKeySet = Boolean(getGeminiApiKey());

  return settingsCard(t("settings.geminiApiSettings"), t("settings.apiLocalNote"), `
    <div class="settings-row">
      <span class="settings-label">${escapeHTML(t("settings.apiCurrent"))}</span>
      <span class="settings-status-badge ${apiKeySet ? "active" : "missing"}">${escapeHTML(apiKeySet ? t("settings.apiActive") : t("settings.apiNotSetShort"))}</span>
    </div>
    <label class="settings-field">
      <span class="settings-label">${escapeHTML(t("settings.apiTitle"))}</span>
      <input class="settings-input" id="settings-api-key-input" type="password" placeholder="${escapeHTML(t("settings.apiInputPlaceholder"))}" value="${escapeHTML(getGeminiApiKey())}">
    </label>
    <div class="settings-actions">
      <button class="btn btn-primary" type="button" id="settings-save-api">${escapeHTML(t("settings.apiSaveKey"))}</button>
      <button class="btn btn-secondary" type="button" id="settings-clear-api"${apiKeySet ? "" : " disabled"}>${escapeHTML(t("settings.apiClear"))}</button>
      <a class="btn btn-link" href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">${escapeHTML(t("analyzer.getApiKey"))}</a>
    </div>
  `);
}

function renderExportSettings() {
  return settingsCard(t("settings.dataExport"), t("settings.exportHint"), `
    <div class="export-actions-grid">
      <button class="btn btn-primary" type="button" data-export-scope="all">${escapeHTML(t("settings.exportAllData"))}</button>
      <button class="btn btn-secondary" type="button" data-export-scope="jobs">${escapeHTML(t("settings.exportJobsOnly"))}</button>
      <button class="btn btn-secondary" type="button" data-export-scope="interviews">${escapeHTML(t("settings.exportInterviewsOnly"))}</button>
      <button class="btn btn-secondary" type="button" data-export-scope="analyses">${escapeHTML(t("settings.exportAnalysesOnly"))}</button>
      <button class="btn btn-secondary" type="button" data-export-scope="settings">${escapeHTML(t("settings.exportSettingsOnly"))}</button>
    </div>
  `);
}

function renderImportSettings() {
  return settingsCard(t("settings.dataImport"), t("settings.importHint"), `
    <label class="settings-field">
      <span class="settings-label">${escapeHTML(t("settings.chooseJsonFile"))}</span>
      <input class="settings-file-input-visible" id="settings-import-file" type="file" accept="application/json,.json">
    </label>
    <button class="btn btn-secondary" type="button" id="settings-read-import">${escapeHTML(t("settings.importData"))}</button>
    <div class="import-preview hidden" id="settings-import-preview">
      <h4>${escapeHTML(t("settings.importPreview"))}</h4>
      <div class="import-preview-grid" id="settings-import-summary"></div>
      <div class="settings-actions">
        <button class="btn btn-secondary" type="button" id="settings-import-merge">${escapeHTML(t("settings.mergeExisting"))}</button>
        <button class="btn btn-danger" type="button" id="settings-import-replace">${escapeHTML(t("settings.replaceExisting"))}</button>
      </div>
    </div>
  `);
}

function renderBackupSettings() {
  const lastBackupAt = getSettings().lastBackupAt;

  return settingsCard(t("settings.backupRestore"), "", `
    <div class="backup-meta">
      <span>${escapeHTML(t("settings.lastBackup"))}</span>
      <strong>${escapeHTML(lastBackupAt ? formatDate(lastBackupAt.slice(0, 10)) : t("settings.never"))}</strong>
    </div>
    <div class="settings-actions">
      <button class="btn btn-primary" type="button" id="settings-create-backup">${escapeHTML(t("settings.createBackup"))}</button>
      <button class="btn btn-secondary" type="button" id="settings-restore-backup">${escapeHTML(t("settings.restoreBackup"))}</button>
    </div>
  `, "settings-card-full");
}

function renderDangerZone() {
  return settingsCard(t("settings.dangerTitle"), t("settings.dangerHint"), `
    <div class="danger-zone">
      <div class="danger-action">
        <span>${escapeHTML(t("settings.deleteAnalyses"))}</span>
        <button class="danger-button" type="button" data-danger-action="analyses">${escapeHTML(t("settings.deleteAnalyses"))}</button>
      </div>
      <div class="danger-action">
        <span>${escapeHTML(t("settings.deleteArchived"))}</span>
        <button class="danger-button" type="button" data-danger-action="archived">${escapeHTML(t("settings.deleteArchived"))}</button>
      </div>
      <div class="danger-action">
        <span>${escapeHTML(t("settings.resetSettings"))}</span>
        <button class="danger-button" type="button" data-danger-action="reset">${escapeHTML(t("settings.resetSettings"))}</button>
      </div>
      <div class="danger-action">
        <span>${escapeHTML(t("settings.deleteAll"))}</span>
        <div class="settings-delete-all">
          <input class="settings-input" id="settings-delete-confirm" type="text" placeholder="${escapeHTML(t("settings.deleteAllConfirm"))}">
          <button class="danger-button" type="button" data-danger-action="all">${escapeHTML(t("settings.deleteAll"))}</button>
        </div>
      </div>
    </div>
  `, "settings-card-full danger-zone-card");
}

function getLibraryStatus() {
  return [
    { name: "Chart.js", available: isLibraryAvailable("Chart") },
    { name: "Lucide Icons", available: isLibraryAvailable("lucide") },
    { name: "Marked.js", available: isLibraryAvailable("marked") },
    { name: "DOMPurify", available: isLibraryAvailable("DOMPurify") },
    { name: "PDF.js", available: isLibraryAvailable("pdfjsLib") }
  ];
}

function renderAppInfoSettings() {
  return settingsCard(t("settings.appInfo"), "", `
    <div class="settings-profile-grid">
      <div><span class="g-muted">App name</span><strong>AI CV Tracker</strong></div>
      <div><span class="g-muted">${escapeHTML(t("settings.appVersion"))}</span><strong>${escapeHTML(APP_VERSION)}</strong></div>
      <div><span class="g-muted">${escapeHTML(t("settings.appStorage"))}</span><strong>${escapeHTML(t("settings.localBrowserStorage"))}</strong></div>
      <div><span class="g-muted">${escapeHTML(t("settings.build"))}</span><strong>${escapeHTML(t("settings.staticGithubPages"))}</strong></div>
    </div>
    <h4 class="settings-card-title">${escapeHTML(t("settings.libraryStatusTitle"))}</h4>
    <div class="library-status-list">
      ${getLibraryStatus().map((item) => `
        <div class="library-status-item">
          <span>${escapeHTML(item.name)}</span>
          <strong class="settings-status-badge ${item.available ? "active" : "missing"}">${escapeHTML(item.available ? t("settings.availableStatus") : t("settings.missingStatus"))}</strong>
        </div>
      `).join("")}
    </div>
  `, "settings-card-full");
}

let pendingImport = null;
let pendingImportRaw = null;

function persistSettings() {
  saveSettings();
}

function applyCompactMode() {
  applyPreferences();
}

async function handleSettingsImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    pendingImportRaw = await readImportFile(file);
    pendingImport = validateImportData(pendingImportRaw);
    if (!pendingImport) {
      showSettingsToast("settings.invalidBackupFile", "error");
      return;
    }
    showImportPreview(getImportSummary(pendingImport));
  } catch (error) {
    console.error(error);
    pendingImport = null;
    pendingImportRaw = null;
    showSettingsToast("settings.invalidBackupFile", "error");
  }
}

function showImportPreview(summary) {
  const preview = document.getElementById("settings-import-preview");
  const summaryBox = document.getElementById("settings-import-summary");
  if (!preview || !summaryBox) return;

  summaryBox.innerHTML = `
    <div><span>Applications</span><strong>${escapeHTML(summary.jobs)}</strong></div>
    <div><span>Interviews</span><strong>${escapeHTML(summary.interviews)}</strong></div>
    <div><span>Analyses</span><strong>${escapeHTML(summary.analyses)}</strong></div>
    <div><span>User</span><strong>${escapeHTML(summary.hasUser ? t("settings.present") : t("settings.absent"))}</strong></div>
    <div><span>Settings</span><strong>${escapeHTML(summary.hasSettings ? t("settings.present") : t("settings.absent"))}</strong></div>
  `;
  preview.classList.remove("hidden");
}

async function confirmImport(mode) {
  if (!pendingImport) return;
  const confirmKey = mode === "replace" ? "settings.confirmImportReplace" : "settings.confirmImportMerge";
  const confirmed = await confirmDangerAction(confirmKey);
  if (!confirmed) return;

  importData(pendingImport, mode);
  pendingImport = null;
  pendingImportRaw = null;
  showSettingsToast("settings.importCompleted", "success");
  renderSettings();
}

async function confirmDangerAction(action) {
  const message = action.startsWith("settings.") ? t(action) : t(`settings.${action}`);
  const confirmLabel = action.includes("Import")
    ? t("common.save")
    : action.includes("Archive")
      ? t("common.archive")
      : t("common.delete");

  return new Promise((resolve) => {
    const existing = document.querySelector(".confirm-modal");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = "confirm-modal";
    overlay.innerHTML = `
      <div class="confirm-modal-box glass-card" role="dialog" aria-modal="true">
        <h3>${escapeHTML(t("settings.dangerTitle"))}</h3>
        <p>${escapeHTML(message)}</p>
        <div class="settings-actions">
          <button class="btn btn-secondary" type="button" data-confirm-value="no">${escapeHTML(t("common.cancel"))}</button>
          <button class="btn btn-danger" type="button" data-confirm-value="yes">${escapeHTML(confirmLabel)}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (event) => {
      const button = event.target.closest("[data-confirm-value]");
      if (!button && event.target !== overlay) return;
      const value = button?.dataset.confirmValue === "yes";
      overlay.remove();
      resolve(value);
    });
  });
}

async function deleteAnalysesOnly() {
  if (!await confirmDangerAction("confirmDeleteAnalyses")) return;
  AppState.analyses = [];
  saveAnalyses();
  showSettingsToast("settings.analysesDeleted", "success");
  renderSettings();
}

async function deleteArchivedJobsOnly() {
  if (!await confirmDangerAction("confirmDeleteArchived")) return;
  AppState.jobs = AppState.jobs.filter((job) => !job.isArchived && job.status !== "archived");
  saveJobs();
  renderJobs();
  renderTodayIfActive();
  showSettingsToast("settings.archivedJobsDeleted", "success");
  renderSettings();
}

function deleteArchivedJobs() {
  deleteArchivedJobsOnly();
}

async function resetSettings() {
  if (!await confirmDangerAction("confirmResetSettings")) return;
  const language = AppState.language;
  AppState.settings = {
    onboardingCompleted: true,
    language,
    theme: "dark",
    defaultStatsPeriod: "all",
    autoSave: true,
    compactMode: false
  };
  StatsFilters.period = "all";
  persistSettings();
  applyPreferences();
  showSettingsToast("settings.settingsReset", "success");
  renderSettings();
}

function resetSettingsOnly() {
  resetSettings();
}

async function deleteAllData() {
  const input = document.getElementById("settings-modal-delete-confirm") || document.getElementById("settings-delete-confirm");
  if (!input || input.value.trim() !== "DELETE") {
    showSettingsToast("settings.deleteAllNeedsText", "error");
    return;
  }
  if (!await confirmDangerAction("confirmDeleteAll")) return;

  Object.values(StorageManager.KEYS).forEach((key) => StorageManager.remove(key));
  showSettingsToast("settings.allDataDeleted", "success");

  AppState.user = null;
  AppState.jobs = [];
  AppState.interviews = [];
  AppState.analyses = [];
  AppState.settings = {
    onboardingCompleted: false,
    language: AppState.language,
    theme: "dark",
    defaultStatsPeriod: "all",
    autoSave: true,
    compactMode: false
  };
  AppState.currentTab = "jobs";
  JobFilters.search = "";
  JobFilters.status = "all";
  JobFilters.priority = "all";
  JobFilters.source = "all";
  currentInterviewView = "upcoming";
  StatsFilters.period = "all";
  analyzerMode = "job_match";
  analyzerCvText = "";
  analyzerCvFileName = "";
  analyzerInterviewPrefill = null;
  pendingImport = null;
  pendingImportRaw = null;

  applyPreferences();
  closeSettingsModal();
  document.getElementById("main-app")?.classList.add("hidden");
  onboardingStep = 1;
  populateSuggestionLists();
  showOnboarding();
}

async function handleSettingsCvUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    showSettingsToast("analyzer.errorInvalidPdf", "error");
    event.target.value = "";
    return;
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    showSettingsToast("analyzer.errorFileTooLarge", "error");
    event.target.value = "";
    return;
  }

  try {
    let cvText = "";
    if (isLibraryAvailable("pdfjsLib")) {
      cvText = limitCvText(await extractPdfText(file));
    }
    StorageManager.set(StorageManager.KEYS.CV, {
      name: file.name,
      text: cvText,
      updatedAt: todayISO()
    });
    analyzerCvText = cvText;
    analyzerCvFileName = file.name;
    showSettingsToast("settings.cvSaved", "success");
    renderSettings();
  } catch (error) {
    console.error(error);
    showSettingsToast("analyzer.errorPdfFailed", "error");
  }
}

function showSettingsToast(message, type = "success") {
  const region =
    document.querySelector("#settings-modal-overlay:not(.hidden) #settings-toast-region") ||
    document.getElementById("settings-toast-region");
  if (!region) {
    showToast(message);
    return;
  }

  const toast = document.createElement("div");
  toast.className = `settings-toast ${type}`;
  toast.textContent = t(message);
  region.appendChild(toast);

  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    window.setTimeout(() => toast.remove(), 260);
  }, 2400);
}

function bindSettingsEvents() {
  const panel = document.getElementById("tab-settings");
  if (!panel || panel.dataset.settingsEventsBound === "true") return;
  panel.dataset.settingsEventsBound = "true";

  panel.addEventListener("click", (event) => {
    const exportBtn = event.target.closest("[data-export-scope]");
    if (exportBtn) {
      exportData(exportBtn.dataset.exportScope);
      return;
    }

    if (event.target.closest("#settings-edit-profile")) {
      switchTab("profile");
      return;
    }

    if (event.target.closest("#settings-upload-cv") || event.target.closest("#settings-restore-backup")) {
      const targetId = event.target.closest("#settings-restore-backup") ? "settings-import-file" : "settings-cv-file";
      document.getElementById(targetId)?.click();
      return;
    }

    if (event.target.closest("#settings-save-api")) {
      const input = document.getElementById("settings-api-key-input");
      setGeminiApiKey(input?.value || "");
      showSettingsToast("analyzer.apiSaved", "success");
      renderSettings();
      return;
    }

    if (event.target.closest("#settings-toggle-compact")) {
      AppState.settings.compactMode = !AppState.settings.compactMode;
      persistSettings();
      applyCompactMode();
      renderSettings();
      return;
    }

    if (event.target.closest("#settings-toggle-autosave")) {
      const currentAutoSave = AppState.settings.autoSave !== false;
      AppState.settings.autoSave = !currentAutoSave;
      persistSettings();
      renderSettings();
      return;
    }

    if (event.target.closest("#settings-clear-api")) {
      setGeminiApiKey("");
      showSettingsToast("settings.apiCleared", "success");
      renderSettings();
      return;
    }

    if (event.target.closest("#settings-create-backup")) {
      createBackup();
      return;
    }

    if (event.target.closest("#settings-read-import")) {
      const input = document.getElementById("settings-import-file");
      if (!input?.files?.[0]) {
        showSettingsToast("settings.invalidBackupFile", "error");
        return;
      }
      handleSettingsImportFile({ target: input });
      return;
    }

    if (event.target.closest("#settings-import-merge")) {
      confirmImport("merge");
      return;
    }
    if (event.target.closest("#settings-import-replace")) {
      confirmImport("replace");
      return;
    }
    const dangerButton = event.target.closest("[data-danger-action]");
    if (dangerButton) {
      const action = dangerButton.dataset.dangerAction;
      if (action === "analyses") deleteAnalysesOnly();
      if (action === "archived") deleteArchivedJobsOnly();
      if (action === "reset") resetSettings();
      if (action === "all") deleteAllData();
      return;
    }
    if (event.target.closest("#settings-delete-analyses")) {
      deleteAnalysesOnly();
      return;
    }
    if (event.target.closest("#settings-delete-archived")) {
      deleteArchivedJobs();
      return;
    }
    if (event.target.closest("#settings-reset-settings")) {
      resetSettingsOnly();
      return;
    }
    if (event.target.closest("#settings-delete-all")) {
      deleteAllData();
    }
  });

  panel.addEventListener("change", (event) => {
    if (event.target.id === "settings-language") {
      setLanguage(event.target.value);
      renderSettings();
      return;
    }
    if (event.target.id === "settings-theme") {
      saveSettings({ theme: event.target.value });
      applyPreferences();
      renderSettings();
      return;
    }
    if (event.target.id === "settings-default-period") {
      saveSettings({ defaultStatsPeriod: event.target.value });
      StatsFilters.period = STATS_PERIOD_OPTIONS.includes(event.target.value) ? event.target.value : "all";
      return;
    }
    if (event.target.id === "settings-import-file") {
      handleSettingsImportFile(event);
      return;
    }
    if (event.target.id === "settings-cv-file") {
      handleSettingsCvUpload(event);
    }
  });
}

function bindTodayEvents() {
  const todayPanel = document.getElementById("tab-today");
  if (!todayPanel) return;

  todayPanel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-today-action]");
    if (!button) return;

    const jobId = button.dataset.jobId;
    const action = button.dataset.todayAction;

    if (action === "followUp") markFollowUpDone(jobId);
    if (action === "viewJob") viewJobFromToday(jobId);
  });
}

function bindJobsEvents() {
  document.querySelectorAll("[data-open-job-modal]").forEach((button) => {
    button.addEventListener("click", openAddJobModal);
  });

  const jobForm = document.getElementById("job-form");
  const closeButton = document.getElementById("close-job-modal");
  const cancelButton = document.getElementById("cancel-job-modal");
  const modalOverlay = document.getElementById("modal-overlay");
  const jobsGrid = document.getElementById("jobs-grid");
  const searchInput = document.getElementById("job-search");
  const statusFilter = document.getElementById("job-filter-status");
  const priorityFilter = document.getElementById("job-filter-priority");
  const sourceFilter = document.getElementById("job-filter-source");
  const resetFilters = document.getElementById("reset-job-filters");
  const jobsWorkspace = document.querySelector(".jobs-workspace");

  if (jobForm) {
    jobForm.addEventListener("submit", saveJob);
  }

  [closeButton, cancelButton].forEach((button) => {
    if (button) button.addEventListener("click", closeJobModal);
  });

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (event) => {
      if (event.target === modalOverlay) closeJobModal();
    });
  }

  if (jobsGrid) {
    jobsGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-job-action]");
      if (!button) return;

      const jobId = button.dataset.jobId;
      const action = button.dataset.jobAction;

      if (action === "edit") openEditJobModal(jobId);
      if (action === "followUp") markFollowUpDone(jobId);
      if (action === "archive") archiveJob(jobId);
      if (action === "delete") deleteJob(jobId);
    });
  }

  if (jobsWorkspace) {
    jobsWorkspace.addEventListener("click", (event) => {
      const statusCard = event.target.closest("[data-application-status]");
      if (!statusCard) return;
      setApplicationStatusFilter(statusCard.dataset.applicationStatus);
    });

    jobsWorkspace.addEventListener("change", (event) => {
      const statusSelect = event.target.closest("[data-job-status-select]");
      if (!statusSelect) return;
      changeJobStatus(statusSelect.dataset.jobId, statusSelect.value);
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      JobFilters.search = searchInput.value;
      filterJobs();
    });
  }

  [
    [statusFilter, "status"],
    [priorityFilter, "priority"],
    [sourceFilter, "source"]
  ].forEach(([select, key]) => {
    if (!select) return;
    select.addEventListener("change", () => {
      JobFilters[key] = select.value;
      filterJobs();
    });
  });

  if (resetFilters) {
    resetFilters.addEventListener("click", resetJobFilters);
  }
}

function bindInterviewsEvents() {
  document.querySelectorAll("[data-open-interview-modal]").forEach((button) => {
    button.addEventListener("click", openAddInterviewModal);
  });

  const interviewForm = document.getElementById("interview-form");
  const closeButton = document.getElementById("close-interview-modal");
  const cancelButton = document.getElementById("cancel-interview-modal");
  const modalOverlay = document.getElementById("interview-modal-overlay");
  const formatSelect = document.getElementById("interview-format");
  const jobSelect = document.getElementById("interview-job-id");
  const dateInput = document.getElementById("interview-date");
  const interviewsGrid = document.getElementById("interviews-grid");
  const interviewWeekStrip = document.getElementById("interview-week-strip");

  if (interviewForm) {
    interviewForm.addEventListener("submit", saveInterview);
  }

  [closeButton, cancelButton].forEach((button) => {
    if (button) button.addEventListener("click", closeInterviewModal);
  });

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (event) => {
      if (event.target === modalOverlay) closeInterviewModal();
    });
  }

  if (formatSelect) {
    formatSelect.addEventListener("change", updateFormatFields);
  }

  if (jobSelect) {
    jobSelect.addEventListener("change", syncInterviewJobFields);
  }

  if (dateInput) {
    dateInput.addEventListener("change", updateInterviewResultSection);
  }

  document.querySelectorAll("[data-interview-view]").forEach((button) => {
    button.addEventListener("click", () => setInterviewView(button.dataset.interviewView));
  });

  if (interviewWeekStrip) {
    interviewWeekStrip.addEventListener("click", (event) => {
      const resetButton = event.target.closest("[data-interview-date-reset]");
      if (resetButton) {
        selectedInterviewDate = "";
        renderInterviews();
        return;
      }

      const dayButton = event.target.closest("[data-interview-date]");
      if (!dayButton) return;
      selectedInterviewDate = dayButton.dataset.interviewDate || "";
      renderInterviews();
    });
  }

  if (interviewsGrid) {
    interviewsGrid.addEventListener("click", (event) => {
      const openModalButton = event.target.closest("[data-open-interview-modal]");
      if (openModalButton) {
        openAddInterviewModal();
        return;
      }

      const button = event.target.closest("[data-interview-action]");
      if (!button) return;

      const interviewId = button.dataset.interviewId;
      const action = button.dataset.interviewAction;

      if (action === "edit") openEditInterviewModal(interviewId);
      if (action === "delete") deleteInterview(interviewId);
      if (action === "prepare") prepareForInterview(interviewId);
    });
  }
}

function bindStatsEvents() {
  const statsPanel = document.getElementById("tab-stats");
  if (!statsPanel) return;

  statsPanel.addEventListener("click", (event) => {
    const periodButton = event.target.closest("[data-stats-period]");
    if (periodButton) {
      changePeriod(periodButton.dataset.statsPeriod);
      return;
    }

    const chartButton = event.target.closest("[data-stats-chart]");
    if (chartButton) {
      statsChartType = ["bar", "donut"].includes(chartButton.dataset.statsChart) ? chartButton.dataset.statsChart : "bar";
      renderStats();
    }
  });
}

function bindNavigation() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  const settingsButton = document.getElementById("header-settings-button");
  if (settingsButton) {
    settingsButton.addEventListener("click", openSettingsModal);
  }

  document.querySelectorAll("[data-language-option]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.languageOption));
  });

  bindJobsEvents();
  bindInterviewsEvents();
  bindTodayEvents();
  bindStatsEvents();
  bindAnalyzerEvents();
  bindSettingsEvents();
  bindSettingsModalEvents();
}

function init() {
  AppState.load();
  if (AppState.settings.defaultStatsPeriod && STATS_PERIOD_OPTIONS.includes(AppState.settings.defaultStatsPeriod)) {
    StatsFilters.period = AppState.settings.defaultStatsPeriod;
  }
  applyCompactMode();
  setLanguage(AppState.language);
  bindNavigation();
  bindCountryFieldEvents();
  populateJobSelects();
  populateInterviewSelects();
  initOnboarding();
  initExternalLibraries();
}

document.addEventListener("DOMContentLoaded", init);
