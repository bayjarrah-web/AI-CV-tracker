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
      console.error(TRANSLATIONS.ar.errors.storageUnavailable, error);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(TRANSLATIONS.ar.errors.storageUnavailable, error);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(TRANSLATIONS.ar.errors.storageUnavailable, error);
      return false;
    }
  }
};

const AppState = {
  currentTab: "today",
  language: "ar",
  user: null,
  jobs: [],
  interviews: [],
  analyses: [],
  settings: {
    onboardingCompleted: false,
    language: "ar"
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
    this.language = this.settings.language || "ar";
  }
};

let onboardingStep = 1;
let editingJobId = null;
let highlightedJobId = null;
let editingInterviewId = null;
let currentInterviewView = "upcoming";
let analyzerMode = "cv_review";
let analyzerCvText = "";
let analyzerCvFileName = "";
let isAnalyzing = false;
let statusChart = null;
let weeklyChart = null;

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
  populateSelect(document.getElementById("job-status"), JOB_STATUS_OPTIONS, "statuses");
  populateSelect(document.getElementById("job-priority"), JOB_PRIORITY_OPTIONS, "priority");
  populateSelect(document.getElementById("job-source"), JOB_SOURCE_OPTIONS, "sources");
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
  document.getElementById("job-status").value = job?.status || "sent";
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

function archiveJob(jobId) {
  updateJob(jobId, (job) => ({
    ...job,
    status: "archived",
    isArchived: true,
    updatedAt: todayISO(),
    activityLog: [createActivity("archived"), ...job.activityLog]
  }));
  showToast("emotional.jobArchived");
}

function deleteJob(jobId) {
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

function renderInterviewCard(interview) {
  const isPast = isPastInterview(interview);
  const isToday = interview.interviewDate === todayISO();
  const countdown = calculateCountdown(interview.interviewDate);
  const details = [
    interview.interviewTime ? `${t("interviews.fields.interviewTime")}: ${interview.interviewTime}` : "",
    interview.duration ? `${t("interviews.fields.duration")}: ${interview.duration}` : "",
    interview.platform ? `${t("interviews.fields.platform")}: ${interview.platform}` : "",
    interview.location ? `${t("interviews.fields.location")}: ${interview.location}` : ""
  ].filter(Boolean);

  return `
    <article class="interview-card glass-card${isPast ? " past-interview" : ""}${isToday ? " today-interview" : ""}">
      <div class="interview-card-top">
        <div>
          <p class="eyebrow">${escapeHTML(t("interviews.round"))} ${escapeHTML(interview.round)}</p>
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
        <span class="badge badge-round-type">${escapeHTML(t(`interviewRoundTypes.${interview.roundType}`))}</span>
        <span class="badge badge-interview-status-${escapeHTML(interview.status)}">${escapeHTML(t(`interviewStatuses.${interview.status}`))}</span>
        <span class="badge badge-format-${escapeHTML(interview.format)}">${escapeHTML(t(`interviewFormats.${interview.format}`))}</span>
        ${interview.result ? `<span class="badge badge-result-${escapeHTML(interview.result)}">${escapeHTML(t(`interviewResults.${interview.result}`))}</span>` : ""}
      </div>

      ${details.length ? `<div class="interview-detail-list">${details.map((detail) => `<span>${escapeHTML(detail)}</span>`).join("")}</div>` : ""}

      ${(interview.interviewerName || interview.interviewerTitle) ? `
        <p class="interview-person">${escapeHTML(interview.interviewerName)}${interview.interviewerTitle ? ` · ${escapeHTML(interview.interviewerTitle)}` : ""}</p>
      ` : ""}

      ${interview.preparationNotes ? `<p class="job-notes">${escapeHTML(interview.preparationNotes)}</p>` : ""}
      ${interview.notes ? `<p class="job-notes">${escapeHTML(interview.notes)}</p>` : ""}
      ${interview.postInterviewNotes ? `<p class="job-notes">${escapeHTML(interview.postInterviewNotes)}</p>` : ""}
      ${interview.questionsAsked ? `<p class="job-notes">${escapeHTML(interview.questionsAsked)}</p>` : ""}

      <div class="job-actions">
        <button class="btn btn-small btn-secondary" type="button" data-interview-action="edit" data-interview-id="${escapeHTML(interview.id)}">${escapeHTML(t("common.edit"))}</button>
        <button class="btn btn-small btn-danger" type="button" data-interview-action="delete" data-interview-id="${escapeHTML(interview.id)}">${escapeHTML(t("common.delete"))}</button>
        ${interview.format === "video" && interview.meetingUrl ? `<a class="btn btn-small btn-link" href="${escapeHTML(interview.meetingUrl)}" target="_blank" rel="noopener noreferrer">${escapeHTML(t("interviews.joinMeeting"))}</a>` : ""}
        ${interview.format === "in_person" && interview.googleMapsUrl ? `<a class="btn btn-small btn-link" href="${escapeHTML(interview.googleMapsUrl)}" target="_blank" rel="noopener noreferrer">${escapeHTML(t("interviews.openMap"))}</a>` : ""}
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
  const interviews = groups[currentInterviewView] || groups.upcoming;

  document.querySelectorAll("[data-interview-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.interviewView === currentInterviewView);
  });

  ["upcoming", "past", "all"].forEach((view) => {
    const counter = document.getElementById(`interview-count-${view}`);
    if (counter) counter.textContent = groups[view].length;
  });

  grid.innerHTML = interviews.map(renderInterviewCard).join("");
  empty.classList.toggle("hidden", interviews.length > 0);

  if (!interviews.length) {
    const title = empty.querySelector("h2");
    const body = empty.querySelector("p");
    if (title) title.textContent = t(`interviews.empty.${currentInterviewView}Title`);
    if (body) body.textContent = t(`interviews.empty.${currentInterviewView}Body`);
  }

  safeInitIcons();
}

function isFollowUpDue(job) {
  return Boolean(job.followUpDate && job.followUpDate <= todayISO() && !job.isArchived);
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
  const linkButton = interview.format === "video" && interview.meetingUrl
    ? `<a class="btn btn-small btn-link" href="${escapeHTML(interview.meetingUrl)}" target="_blank" rel="noopener noreferrer">${escapeHTML(t("interviews.joinMeeting"))}</a>`
    : interview.format === "in_person" && interview.googleMapsUrl
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

function renderStats() {
  const panel = document.getElementById("tab-stats");
  if (!panel) return;

  const data = getStatsData(StatsFilters.period);
  const timeline = getMonthlyTimeline();

  panel.innerHTML = `
    <section class="stats-dashboard">
      <div class="stats-hero glass-card">
        <div>
          <p class="eyebrow">${escapeHTML(t("statsDashboard.kicker"))}</p>
          <h2>${escapeHTML(t("statsDashboard.title"))}</h2>
          <p>${escapeHTML(t("statsDashboard.subtitle"))}</p>
        </div>
        <div class="stats-hero-score">
          <span>${escapeHTML(t(`statsDashboard.periods.${StatsFilters.period}`))}</span>
          <strong>${escapeHTML(data.responseRate)}%</strong>
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

      ${renderKPICards(data)}

      <div class="stats-grid">
        <section class="stats-card chart-card glass-card">
          <div class="stats-card-header">
            <h3>${escapeHTML(t("statsDashboard.applicationsByStatus"))}</h3>
            <span>${escapeHTML(data.total)}</span>
          </div>
          ${data.byStatus.length
            ? `<div class="chart-wrap"><canvas id="stats-status-chart"></canvas></div>`
            : `<div class="today-positive-state muted-state">${escapeHTML(t("foundation.unlockAnalytics"))}</div>`}
        </section>

        <section class="stats-card chart-card glass-card">
          <div class="stats-card-header">
            <h3>${escapeHTML(t("statsDashboard.applicationsThisMonth"))}</h3>
            <span>${escapeHTML(data.byWeek.reduce((sum, week) => sum + week.count, 0))}</span>
          </div>
          <div class="chart-wrap"><canvas id="stats-weekly-chart"></canvas></div>
        </section>

        ${renderSourceAnalytics(data)}
        ${renderInterviewAnalytics(data)}
        ${renderActivityHeatmap(data)}

        <section class="stats-card stats-timeline-card glass-card">
          <div class="stats-card-header">
            <h3>${escapeHTML(t("statsDashboard.monthTimeline"))}</h3>
            <span>${escapeHTML(timeline.length)}</span>
          </div>
          ${timeline.length
            ? `<div class="stats-timeline-list">
                ${timeline.map((item) => `
                  <article class="stats-timeline-item">
                    <span class="activity-dot"></span>
                    <div>
                      <strong>${escapeHTML(item.title)}</strong>
                      <p>${escapeHTML(item.action)}</p>
                    </div>
                    <time>${escapeHTML(getRelativeDateLabel(item.date))}</time>
                  </article>
                `).join("")}
              </div>`
            : `<div class="today-positive-state muted-state">${escapeHTML(t("statsDashboard.noTimeline"))}</div>`}
        </section>

        ${renderAchievements(data)}
      </div>
    </section>
  `;

  destroyStatsCharts();
  renderStatusDonut(data);
  renderWeeklyBar(data);
  safeInitIcons();
}

function renderStatsDashboard() {
  renderStats();
}

function renderJobs() {
  const grid = document.getElementById("jobs-grid");
  const empty = document.getElementById("jobs-empty-state");
  if (!grid || !empty) return;

  const jobs = getFilteredJobs();
  grid.innerHTML = "";
  empty.classList.toggle("hidden", jobs.length > 0);

  if (!jobs.length) {
    const emptyTitle = empty.querySelector("h2");
    const emptyBody = empty.querySelector("p");
    if (emptyTitle) emptyTitle.textContent = AppState.jobs.length ? t("jobs.noFiltersResult") : t("empty.jobs.title");
    if (emptyBody) emptyBody.textContent = AppState.jobs.length ? t("empty.jobs.body") : t("empty.jobs.body");
    safeInitIcons();
    return;
  }

  jobs.forEach((job) => {
    const card = document.createElement("article");
    const due = isFollowUpDue(job);
    card.className = `job-card glass-card${due ? " follow-up-due" : ""}${job.isArchived ? " archived-card" : ""}${job.id === highlightedJobId ? " job-highlighted" : ""}`;
    card.dataset.jobId = job.id;

    const activityItems = job.activityLog.slice(0, 3).map((item) => `
      <div class="activity-log-item">${escapeHTML(formatDate(item.date))} · ${escapeHTML(t(`jobs.log.${item.action}`))}${item.note ? ` · ${escapeHTML(item.note)}` : ""}</div>
    `).join("");

    card.innerHTML = `
      <div class="job-card-top">
        <div class="job-title-group">
          <h3>${escapeHTML(job.jobTitle)}</h3>
          <p class="job-company">${escapeHTML(job.company)}</p>
          ${job.location ? `<p class="job-location">${escapeHTML(job.location)}</p>` : ""}
        </div>
        ${due ? `<span class="job-due-label">${escapeHTML(t("jobs.followUpDue"))}</span>` : ""}
      </div>

      <div class="job-badge-row">
        <span class="badge badge-status badge-status-${escapeHTML(job.status)}">${escapeHTML(t(`statuses.${job.status}`))}</span>
        <span class="badge badge-priority-${escapeHTML(job.priority)}">${escapeHTML(t(`priority.${job.priority}`))}</span>
        <span class="badge">${escapeHTML(t(`sources.${job.source}`))}</span>
        <span class="badge">${escapeHTML(t(`jobTypes.${job.jobType}`))}</span>
      </div>

      <div class="job-meta-grid">
        <span class="job-meta"><strong>${escapeHTML(t("jobs.appliedDate"))}:</strong> ${escapeHTML(formatDate(job.appliedDate))}</span>
        ${job.followUpDate ? `<span class="job-meta"><strong>${escapeHTML(t("jobs.followUpDate"))}:</strong> ${escapeHTML(formatDate(job.followUpDate))}</span>` : ""}
        <span class="job-meta"><strong>${escapeHTML(t("jobs.followUpCount"))}:</strong> ${escapeHTML(job.followUpCount)}</span>
        ${job.salary ? `<span class="job-meta"><strong>${escapeHTML(t("jobs.fields.salary"))}:</strong> ${escapeHTML(job.salary)}</span>` : ""}
      </div>

      ${job.notes ? `<p class="job-notes">${escapeHTML(job.notes)}</p>` : ""}

      <div class="job-actions">
        <button class="btn btn-small btn-secondary" type="button" data-job-action="edit" data-job-id="${escapeHTML(job.id)}">${escapeHTML(t("common.edit"))}</button>
        <button class="btn btn-small btn-secondary" type="button" data-job-action="followUp" data-job-id="${escapeHTML(job.id)}">${escapeHTML(t("jobs.followUpDone"))}</button>
        <button class="btn btn-small btn-secondary" type="button" data-job-action="archive" data-job-id="${escapeHTML(job.id)}">${escapeHTML(t("common.archive"))}</button>
        <button class="btn btn-small btn-danger" type="button" data-job-action="delete" data-job-id="${escapeHTML(job.id)}">${escapeHTML(t("common.delete"))}</button>
        ${job.jobUrl ? `<a class="btn btn-small btn-link" href="${escapeHTML(job.jobUrl)}" target="_blank" rel="noopener noreferrer">${escapeHTML(t("jobs.openLink"))}</a>` : ""}
      </div>

      ${activityItems ? `
        <div class="activity-log">
          <span class="activity-log-title">${escapeHTML(t("jobs.activityTitle"))}</span>
          ${activityItems}
        </div>
      ` : ""}
    `;

    grid.appendChild(card);
  });

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

  if (!name) {
    showToast("errors.requiredName");
    nameInput.focus();
    return false;
  }

  AppState.user = {
    id: AppState.user?.id || uuid(),
    name,
    specialty: specialtyInput.value.trim(),
    country: countryInput.value.trim(),
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
  if (!AppState.user && !saveUserFromOnboarding()) {
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
  if (userName) {
    userName.textContent = AppState.user?.name || t("common.guest");
  }
}

function switchTab(tabName) {
  AppState.currentTab = tabName;

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `tab-${tabName}`);
  });

  const fab = document.querySelector(".fab-add-job");
  if (fab) {
    fab.classList.toggle("hidden", tabName !== "jobs");
  }

  if (tabName === "today") {
    renderTodayDashboard();
  }

  if (tabName === "stats") {
    renderStats();
  }

  if (tabName === "interviews") {
    renderInterviews();
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

function buildAnalyzerPrompt(mode, cvText, job) {
  const lang = AppState.language === "ar" ? "Arabic" : "English";
  const header = `You are an expert career coach and ATS specialist. Respond ONLY in ${lang}. Use clean Markdown with headings, bullet points, and a final summary. Be specific and actionable.`;

  if (mode === "job_match" && job) {
    const jobInfo = [
      `Job Title: ${job.jobTitle}`,
      `Company: ${job.company}`,
      `Location: ${job.location}`,
      `Type: ${job.jobType}`,
      job.notes ? `Job Notes/Description: ${job.notes}` : ""
    ].filter(Boolean).join("\n");

    return `${header}\n\nTask: Compare the following CV against this job and give a match score out of 100, matched skills, missing skills, and concrete improvement tips.\n\n--- JOB ---\n${jobInfo}\n\n--- CV ---\n${cvText}`;
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

  panel.innerHTML = `
    <section class="foundation-panel">
      <div class="foundation-hero glass-card">
        <div class="foundation-icon"><i data-lucide="brain"></i></div>
        <div>
          <p class="eyebrow">${escapeHTML(t("foundation.libraries"))}</p>
          <h2>${escapeHTML(t("foundation.analyzerReady"))}</h2>
          <p>${escapeHTML(t("empty.analyzer.body"))}</p>
        </div>
      </div>

      <section class="foundation-card glass-card">
        <div class="g-section-header">
          <div>
            <p class="eyebrow">${escapeHTML(t("foundation.foundationReady"))}</p>
            <h3>${escapeHTML(t("foundation.libraryStatus"))}</h3>
          </div>
          <span class="g-chip">${escapeHTML(t("foundation.comingSoon"))}</span>
        </div>
        ${renderLibraryStatus()}
      </section>
    </section>
  `;
}

function renderSettingsReadiness() {
  const panel = document.getElementById("tab-settings");
  if (!panel) return;

  const cards = [
    { icon: "palette", title: t("foundation.appearance"), body: t("foundation.comingSoon") },
    { icon: "database", title: t("foundation.dataExport"), body: t("foundation.comingSoon") },
    { icon: "sparkles", title: t("foundation.aiSetupComingSoon"), body: t("foundation.foundationReady") }
  ];

  panel.innerHTML = `
    <section class="foundation-panel">
      <div class="foundation-hero glass-card">
        <div class="foundation-icon"><i data-lucide="settings"></i></div>
        <div>
          <p class="eyebrow">${escapeHTML(t("foundation.foundationReady"))}</p>
          <h2>${escapeHTML(t("empty.settings.title"))}</h2>
          <p>${escapeHTML(t("empty.settings.body"))}</p>
        </div>
      </div>

      <div class="settings-readiness-grid">
        ${cards.map((card) => `
          <article class="foundation-card glass-card">
            <div class="foundation-card-icon"><i data-lucide="${escapeHTML(card.icon)}"></i></div>
            <h3>${escapeHTML(card.title)}</h3>
            <p>${escapeHTML(card.body)}</p>
          </article>
        `).join("")}
      </div>

      <section class="foundation-card glass-card">
        <div class="g-section-header">
          <div>
            <p class="eyebrow">${escapeHTML(t("foundation.libraries"))}</p>
            <h3>${escapeHTML(t("foundation.libraryStatus"))}</h3>
          </div>
          <span class="g-chip">${escapeHTML(t("foundation.foundationReady"))}</span>
        </div>
        ${renderLibraryStatus()}
      </section>
    </section>
  `;
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

  if (interviewsGrid) {
    interviewsGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-interview-action]");
      if (!button) return;

      const interviewId = button.dataset.interviewId;
      const action = button.dataset.interviewAction;

      if (action === "edit") openEditInterviewModal(interviewId);
      if (action === "delete") deleteInterview(interviewId);
    });
  }
}

function bindStatsEvents() {
  const statsPanel = document.getElementById("tab-stats");
  if (!statsPanel) return;

  statsPanel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-stats-period]");
    if (!button) return;
    changePeriod(button.dataset.statsPeriod);
  });
}

function bindNavigation() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  document.querySelectorAll("[data-language-option]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.languageOption));
  });

  bindJobsEvents();
  bindInterviewsEvents();
  bindTodayEvents();
  bindStatsEvents();
}

function init() {
  AppState.load();
  setLanguage(AppState.language);
  bindNavigation();
  populateJobSelects();
  populateInterviewSelects();
  initOnboarding();
  initExternalLibraries();
}

document.addEventListener("DOMContentLoaded", init);
