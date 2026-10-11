export type RoleId = "investor" | "marketer" | "buyer";

export const ROLES: { id: RoleId; label: string }[] = [
  { id: "investor", label: "مستثمر" },
  { id: "marketer", label: "مسوّق عقاري" },
  { id: "buyer", label: "باحث عن عقار" },
];

/** One random line per page visit (popup). */
export const visitPopupMessages: readonly string[] = [
  "قدها؟ أثبت",
  "ثواني بس.. و تفهم",
  "مكعبّ واحد، قرار يغيّر كل شي",
  "الفرصة ما تجي مرتين",
  "بلوكه: العقار بشكل مختلف",
];

export const copy = {
  tagline: "منصة بلوكه – العقار بشكل مختلف",
  heroHook: "شكلك .. قدها فعلاً",
  heroHookLead: "لما وصلت هنا، أنت داخل التحدّي",
  counterHeroTitle: "موقعك في التحدّي",
  counterBefore: "قبلك قدها",
  counterYou: "تراك رقم",
  counterLoading: "جاري التحميل...",
  challengeLine: "خطوة وحدة بس بينك وبين هديتك.",
  challengeSub: "جاهز تكمّل؟",
  ctaContinue: "أكمل و خذ هديتك",
  ctaHint: "بثانيتين بس وتخلص",
  formTitle: "بياناتك بأمان",
  formSubtitle: "نحتاجها عشان نوصلك للهدية",
  nameLabel: "الاسم",
  namePlaceholder: "اكتب اسمك",
  phoneLabel: "الجوال",
  phonePlaceholder: "05xxxxxxxx",
  roleLabel: "وش صفتك؟",
  submitCta: "يلا.. أرسل و شوف هديتك",
  submitting: "جاري الإرسال...",
  privacyNote: "معلوماتك ما تطلع برّا.. كلام شرف",
  gifts: {
    investor: {
      title: "المستثمر الذكي.. يعرف الفرصة من نظرة",
      giftLabel: "هديتك:",
      giftBody:
        "وصول مبكّر لأفضل الصفقات + تقرير السوق الحصري",
      foot: "راح نوصلك على جوالك خلال دقايق",
      footEm: "افتحها قبل لا تفوتك",
    },
    marketer: {
      title: "السوق ما ينتظر.. و أنت جاهز",
      giftLabel: "هديتك:",
      giftBody:
        "باقة إعلانات مجانية + أدوات احترافية تخليك تسبق الكل",
      foot: "جهّزنالك عرض يخليك فعلاً قدها",
      footEm: "شيّك جوالك",
    },
    buyer: {
      title: "بيتك الجديد.. أقرب مما تتخيّل",
      giftLabel: "هديتك:",
      giftBody:
        "أولوية الوصول لعقارات حصرية + كاش باك على أول صفقة",
      foot: "خبّينالك مفاجأة تستاهل",
      footEm: "الرسالة في جوالك",
    },
  } satisfies Record<
    RoleId,
    { title: string; giftLabel: string; giftBody: string; foot: string; footEm: string }
  >,
  modalEyebrow: "رسالة لك",
  modalBrandChip: "بلوكه",
  modalDismiss: "حسناً",
  modalBackdropClose: "إغلاق النافذة",
  statsDemoBanner: "عرض تجريبي — اربط الإحصائيات بالميز",
  back: "الرجوع",
  again: "البداية",
  followUs: "تابع بلوكه",
  shareCardThanks: "تم تسجيلك بنجاح",
  shareCardHint: "شارك الرسالة وادعم رحلة منشآت معنا",
  shareNative: "مشاركة",
  shareOnX: "إكس",
  shareWhatsApp: "واتساب",
  shareLinkedIn: "لينكد إن",
  shareCopyLink: "نسخ النص",
  shareCopied: "تم النسخ!",
} as const;
