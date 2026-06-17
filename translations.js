const TRANSLATIONS = {
  ar: {
    app: {
      kicker: "لوحة تتبع الوظائف"
    },
    onboarding: {
      step1: {
        eyebrow: "رفيقك الذكي للبحث عن عمل",
        title: "مرحباً بك في CV Tracker AI",
        subtitle: "نظم طلباتك، تابع مقابلاتك، وافهم تقدمك من مكان واحد.",
        cta: "هيا نبدأ"
      },
      step2: {
        eyebrow: "إعداد الملف الشخصي",
        title: "أخبرنا عنك قليلاً",
        subtitle: "سنستخدم هذه المعلومات لتخصيص تجربتك داخل التطبيق.",
        name: "الاسم",
        namePlaceholder: "مثال: سارة أحمد",
        specialty: "التخصص",
        specialtyPlaceholder: "اكتب أول كم حرف من تخصصك",
        otherSpecialty: "اكتب تخصصك",
        otherSpecialtyPlaceholder: "مثال: أمن سيبراني",
        country: "البلد",
        countryPlaceholder: "اكتب أول كم حرف من اسم البلد"
      },
      step3: {
        eyebrow: "السيرة الذاتية",
        title: "ارفع سيرتك الذاتية اختيارياً",
        subtitle: "يمكنك إضافة ملف PDF الآن أو تخطي هذه الخطوة والعودة لها لاحقاً.",
        uploadTitle: "اختر ملف PDF",
        uploadHint: "لم يتم اختيار ملف بعد",
        skip: "تخطي",
        start: "ابدأ"
      }
    },
    tabs: {
      today: "اليوم",
      profile: "الملف",
      jobs: "الوظائف",
      stats: "الإحصائيات",
      interviews: "المقابلات",
      analyzer: "المحلل",
      settings: "الإعدادات"
    },
    statuses: {
      wishlist: "قائمة الرغبات",
      preparing: "قيد التحضير",
      applied: "تم التقديم",
      screening: "فرز أولي",
      sent: "تم الإرسال",
      under_review: "قيد المراجعة",
      interview: "مقابلة",
      offer: "عرض",
      accepted: "تم القبول",
      rejected: "مرفوض",
      withdrawn: "منسحب",
      ghosted: "لا رد",
      archived: "مؤرشف"
    },
    jobTypes: {
      full_time: "دوام كامل",
      part_time: "دوام جزئي",
      remote: "عن بُعد",
      hybrid: "هجين",
      contract: "عقد"
    },
    priority: {
      low: "منخفضة",
      medium: "متوسطة",
      high: "عالية"
    },
    sources: {
      linkedin: "LinkedIn",
      indeed: "Indeed",
      bayt: "Bayt",
      glassdoor: "Glassdoor",
      company_site: "موقع الشركة",
      companyWebsite: "موقع الشركة",
      referral: "ترشيح",
      recruiter: "مسؤول توظيف",
      whatsapp: "WhatsApp",
      email: "البريد الإلكتروني",
      jobFair: "معرض وظائف",
      network: "شبكة العلاقات",
      other: "أخرى"
    },
    common: {
      save: "حفظ",
      cancel: "إلغاء",
      edit: "تعديل",
      delete: "حذف",
      archive: "أرشفة",
      back: "رجوع",
      next: "التالي",
      all: "الكل",
      other: "أخرى",
      guest: "ضيف"
    },
    specialties: {
      frontend: "تطوير واجهات أمامية",
      backend: "تطوير خلفيات",
      fullstack: "تطوير شامل",
      data: "بيانات وتحليلات",
      design: "تصميم منتجات",
      marketing: "تسويق",
      operations: "عمليات وإدارة"
    },
    empty: {
      today: {
        title: "يوم جديد للمتابعة الهادئة",
        body: "عندما تضيف وظائف ومقابلات، ستظهر هنا أولويات اليوم وما يحتاج انتباهك."
      },
      profile: {
        title: "ملفك الشخصي ينتظر التفاصيل",
        body: "ستظهر معلوماتك وسيرتك الذاتية هنا في المراحل القادمة."
      },
      jobs: {
        title: "لا توجد وظائف بعد",
        body: "ابدأ بإضافة أول فرصة، وبعدها ستظهر هنا كروت منظمة قابلة للبحث والفلترة."
      },
      stats: {
        title: "الإحصائيات تبدأ بعد أول خطوة",
        body: "بعد إضافة الطلبات، ستتحول هذه الصفحة إلى قراءة واضحة لتقدمك."
      },
      interviews: {
        title: "لا توجد مقابلات مجدولة",
        body: "عندما تصل إلى مرحلة المقابلات، ستجد مواعيدك وتحضيراتك هنا."
      },
      analyzer: {
        title: "المحلل جاهز للمرحلة القادمة",
        body: "تحليل السيرة والوصف الوظيفي سيأتي لاحقاً بدون ازدحام في هذه المرحلة."
      },
      settings: {
        title: "الإعدادات بسيطة الآن",
        body: "سنضع هنا خيارات التخصيص والتفضيلات عندما تتوسع التجربة."
      }
    },
    emotional: {
      welcomeBack: "أهلاً بعودتك. خطوة صغيرة اليوم تكفي لتحريك الأمور.",
      saved: "تم الحفظ. جميل، صار لدينا أساس نبني عليه.",
      jobSaved: "تم حفظ الوظيفة. الفرصة صارت تحت السيطرة.",
      jobDeleted: "تم حذف الوظيفة نهائياً.",
      jobArchived: "تمت أرشفة الوظيفة.",
      followUpDone: "تم تسجيل المتابعة. خطوة ممتازة.",
      noPressure: "لا ضغط. يمكنك البدء بالمعلومات المتاحة الآن فقط.",
      keepGoing: "تقدمك لا يحتاج أن يكون مثالياً، فقط واضحاً وقابلاً للمتابعة."
    },
    errors: {
      requiredName: "يرجى إدخال الاسم للمتابعة.",
      requiredJobFields: "يرجى إدخال عنوان الوظيفة واسم الشركة.",
      invalidPdf: "يرجى اختيار ملف PDF فقط.",
      storageUnavailable: "تعذر الوصول إلى التخزين المحلي في المتصفح.",
      generic: "حدث خطأ غير متوقع. حاول مرة أخرى."
    },
    jobs: {
      kicker: "إدارة الفرص",
      title: "الوظائف",
      addJob: "إضافة وظيفة",
      searchLabel: "بحث",
      searchPlaceholder: "ابحث بعنوان الوظيفة أو الشركة أو الموقع",
      noFiltersResult: "لا توجد وظائف مطابقة للفلاتر الحالية.",
      followUpDue: "المتابعة مستحقة",
      openLink: "فتح الرابط",
      followUpDone: "تمت المتابعة",
      confirmDelete: "هل تريد حذف هذه الوظيفة نهائياً؟",
      activityTitle: "آخر النشاطات",
      followUpCount: "مرات المتابعة",
      appliedDate: "تاريخ التقديم",
      followUpDate: "تاريخ المتابعة",
      modal: {
        kicker: "تفاصيل الفرصة",
        addTitle: "إضافة وظيفة",
        editTitle: "تعديل وظيفة"
      },
      filters: {
        status: "الحالة",
        priority: "الأولوية",
        source: "المصدر",
        reset: "إعادة ضبط"
      },
      fields: {
        jobTitle: "عنوان الوظيفة",
        company: "الشركة",
        location: "الموقع",
        jobType: "نوع العمل",
        status: "الحالة",
        priority: "الأولوية",
        source: "المصدر",
        salary: "الراتب",
        jobUrl: "رابط الوظيفة",
        contactName: "اسم جهة التواصل",
        contactEmail: "بريد جهة التواصل",
        notes: "ملاحظات",
        followUpDate: "تاريخ المتابعة",
        appliedDate: "تاريخ التقديم"
      },
      placeholders: {
        jobTitle: "مثال: Frontend Developer",
        company: "مثال: Acme",
        location: "مثال: Berlin / Remote",
        salary: "مثال: €60k - €75k",
        jobUrl: "https://...",
        contactName: "اسم مسؤول التوظيف",
        contactEmail: "name@company.com",
        notes: "ملاحظات قصيرة عن الفرصة..."
      },
      log: {
        created: "تم إنشاء الوظيفة",
        updated: "تم تحديث الوظيفة",
        status_changed: "تم تغيير الحالة",
        archived: "تمت أرشفة الوظيفة",
        followUpDone: "تم تسجيل متابعة",
        follow_up_done: "تم تسجيل متابعة"
      }
    },
    modal: {
      placeholderTitle: "نافذة",
      placeholderBody: "سيتم استخدام هذه النافذة في المراحل القادمة."
    }
  },
  en: {
    app: {
      kicker: "Job tracking dashboard"
    },
    onboarding: {
      step1: {
        eyebrow: "Your focused job-search companion",
        title: "Welcome to CV Tracker AI",
        subtitle: "Organize applications, follow interviews, and understand your progress from one place.",
        cta: "Let's start"
      },
      step2: {
        eyebrow: "Profile setup",
        title: "Tell us a little about you",
        subtitle: "We will use this information to personalize your experience.",
        name: "Name",
        namePlaceholder: "Example: Sara Ahmed",
        specialty: "Specialty",
        specialtyPlaceholder: "Type the first letters of your specialty",
        otherSpecialty: "Write your specialty",
        otherSpecialtyPlaceholder: "Example: Cybersecurity",
        country: "Country",
        countryPlaceholder: "Type the first letters of your country"
      },
      step3: {
        eyebrow: "Resume",
        title: "Upload your PDF resume optionally",
        subtitle: "You can add a PDF now or skip this step and return later.",
        uploadTitle: "Choose a PDF file",
        uploadHint: "No file selected yet",
        skip: "Skip",
        start: "Start"
      }
    },
    tabs: {
      today: "Today",
      profile: "Profile",
      jobs: "Jobs",
      stats: "Stats",
      interviews: "Interviews",
      analyzer: "Analyzer",
      settings: "Settings"
    },
    statuses: {
      wishlist: "Wishlist",
      preparing: "Preparing",
      applied: "Applied",
      screening: "Screening",
      sent: "Sent",
      under_review: "Under review",
      interview: "Interview",
      offer: "Offer",
      accepted: "Accepted",
      rejected: "Rejected",
      withdrawn: "Withdrawn",
      ghosted: "Ghosted",
      archived: "Archived"
    },
    jobTypes: {
      full_time: "Full-time",
      part_time: "Part-time",
      remote: "Remote",
      hybrid: "Hybrid",
      contract: "Contract"
    },
    priority: {
      low: "Low",
      medium: "Medium",
      high: "High"
    },
    sources: {
      linkedin: "LinkedIn",
      indeed: "Indeed",
      bayt: "Bayt",
      glassdoor: "Glassdoor",
      company_site: "Company site",
      companyWebsite: "Company website",
      referral: "Referral",
      recruiter: "Recruiter",
      whatsapp: "WhatsApp",
      email: "Email",
      jobFair: "Job fair",
      network: "Network",
      other: "Other"
    },
    common: {
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      archive: "Archive",
      back: "Back",
      next: "Next",
      all: "All",
      other: "Other",
      guest: "Guest"
    },
    specialties: {
      frontend: "Frontend development",
      backend: "Backend development",
      fullstack: "Full-stack development",
      data: "Data and analytics",
      design: "Product design",
      marketing: "Marketing",
      operations: "Operations and management"
    },
    empty: {
      today: {
        title: "A fresh day for calm follow-up",
        body: "Once you add jobs and interviews, today's priorities and next actions will appear here."
      },
      profile: {
        title: "Your profile is waiting for details",
        body: "Your information and resume will appear here in upcoming phases."
      },
      jobs: {
        title: "No jobs yet",
        body: "Add your first opportunity, then organized searchable cards will appear here."
      },
      stats: {
        title: "Stats begin after the first step",
        body: "After adding applications, this page will become a clear reading of your progress."
      },
      interviews: {
        title: "No interviews scheduled",
        body: "When you reach interview stages, your dates and preparation notes will live here."
      },
      analyzer: {
        title: "The analyzer is ready for the next phase",
        body: "Resume and job-description analysis will arrive later without crowding this foundation."
      },
      settings: {
        title: "Settings are simple for now",
        body: "Customization and preferences will live here as the experience grows."
      }
    },
    emotional: {
      welcomeBack: "Welcome back. One small step today is enough to move things forward.",
      saved: "Saved. Nice, we have a foundation to build on.",
      jobSaved: "Job saved. This opportunity is under control.",
      jobDeleted: "Job permanently deleted.",
      jobArchived: "Job archived.",
      followUpDone: "Follow-up recorded. Excellent move.",
      noPressure: "No pressure. You can begin with only what you know right now.",
      keepGoing: "Your progress does not need to be perfect, just clear enough to follow."
    },
    errors: {
      requiredName: "Please enter your name to continue.",
      requiredJobFields: "Please enter the job title and company name.",
      invalidPdf: "Please choose a PDF file only.",
      storageUnavailable: "Could not access browser local storage.",
      generic: "Something unexpected happened. Please try again."
    },
    jobs: {
      kicker: "Opportunity management",
      title: "Jobs",
      addJob: "Add Job",
      searchLabel: "Search",
      searchPlaceholder: "Search by job title, company, or location",
      noFiltersResult: "No jobs match the current filters.",
      followUpDue: "Follow-up due",
      openLink: "Open Link",
      followUpDone: "Mark Follow-up Done",
      confirmDelete: "Delete this job permanently?",
      activityTitle: "Latest activity",
      followUpCount: "Follow-ups",
      appliedDate: "Applied",
      followUpDate: "Follow-up",
      modal: {
        kicker: "Opportunity details",
        addTitle: "Add Job",
        editTitle: "Edit Job"
      },
      filters: {
        status: "Status",
        priority: "Priority",
        source: "Source",
        reset: "Reset Filters"
      },
      fields: {
        jobTitle: "Job title",
        company: "Company",
        location: "Location",
        jobType: "Job type",
        status: "Status",
        priority: "Priority",
        source: "Source",
        salary: "Salary",
        jobUrl: "Job URL",
        contactName: "Contact name",
        contactEmail: "Contact email",
        notes: "Notes",
        followUpDate: "Follow-up date",
        appliedDate: "Applied date"
      },
      placeholders: {
        jobTitle: "Example: Frontend Developer",
        company: "Example: Acme",
        location: "Example: Berlin / Remote",
        salary: "Example: €60k - €75k",
        jobUrl: "https://...",
        contactName: "Recruiter name",
        contactEmail: "name@company.com",
        notes: "Short notes about this opportunity..."
      },
      log: {
        created: "Job created",
        updated: "Job updated",
        status_changed: "Status changed",
        archived: "Job archived",
        followUpDone: "Follow-up recorded",
        follow_up_done: "Follow-up recorded"
      }
    },
    modal: {
      placeholderTitle: "Modal",
      placeholderBody: "This modal will be used in upcoming phases."
    }
  }
};
