const StorageManager = {
  KEYS: {
    USER: "cv_tracker_user",
    CV: "cv_tracker_cv",
    JOBS: "jobtrack_jobs",
    INTERVIEWS: "cv_tracker_interviews",
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
    this.interviews = StorageManager.get(StorageManager.KEYS.INTERVIEWS) || [];
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

const JobFilters = {
  search: "",
  status: "all",
  priority: "all",
  source: "all"
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

function uuid() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
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

function t(key) {
  const languagePack = TRANSLATIONS[AppState.language] || TRANSLATIONS.ar;
  return key.split(".").reduce((value, part) => {
    if (value && Object.prototype.hasOwnProperty.call(value, part)) {
      return value[part];
    }
    return null;
  }, languagePack) || key;
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
    ? "\"Noto Sans Arabic\", \"Inter\", sans-serif"
    : "\"Inter\", \"Noto Sans Arabic\", sans-serif";

  StorageManager.set(StorageManager.KEYS.SETTINGS, AppState.settings);
  translatePage();
  populateSuggestionLists();
  populateJobSelects();
  updateHeader();
  renderEmptyStates();
  renderJobs();
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

  if (countryList && typeof Intl.DisplayNames === "function") {
    const displayNames = new Intl.DisplayNames([AppState.language], { type: "region" });
    countryList.innerHTML = "";
    COUNTRY_CODES
      .map((code) => ({
        code,
        label: displayNames.of(code) || code
      }))
      .sort((first, second) => collator.compare(first.label, second.label))
      .forEach((country) => {
        const option = document.createElement("option");
        option.value = `${countryFlag(country.code)} ${country.label}`;
        option.label = country.code;
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

function saveJobs() {
  StorageManager.set(StorageManager.KEYS.JOBS, AppState.jobs);
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
  renderJobs();
  showToast("emotional.jobSaved");
}

function updateJob(jobId, updater) {
  AppState.jobs = AppState.jobs.map((job) => {
    if (job.id !== jobId) return job;
    return normalizeJob(updater(job));
  });
  saveJobs();
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
    return;
  }

  jobs.forEach((job) => {
    const card = document.createElement("article");
    const due = isFollowUpDue(job);
    card.className = `job-card glass-card${due ? " follow-up-due" : ""}${job.isArchived ? " archived-card" : ""}`;
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
}

function renderEmptyStates() {
  const tabs = ["today", "profile", "stats", "interviews", "analyzer", "settings"];

  tabs.forEach((tabName, index) => {
    const panel = document.getElementById(`tab-${tabName}`);
    if (!panel) return;

    panel.innerHTML = `
      <div class="empty-state glass-card">
        <div class="empty-state-inner">
          <div class="empty-icon">${String(index + 1).padStart(2, "0")}</div>
          <h2>${t(`empty.${tabName}.title`)}</h2>
          <p>${t(`empty.${tabName}.body`)}</p>
        </div>
      </div>
    `;
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

function bindNavigation() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  document.querySelectorAll("[data-language-option]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.languageOption));
  });

  bindJobsEvents();
}

function init() {
  AppState.load();
  setLanguage(AppState.language);
  bindNavigation();
  populateJobSelects();
  initOnboarding();
}

document.addEventListener("DOMContentLoaded", init);
