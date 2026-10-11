/** Arabic validation messages for form / API errors. */
export const submitErrorMessage: Record<string, string> = {
  invalid_json: "حدث خطأ في الإرسال.",
  invalid_name: "الرجاء إدخال اسم صحيح.",
  invalid_phone:
    "الرجاء إدخال جوال سعودي يبدأ ب٠٥.",
  invalid_role: "اختر صفتك من القائمة.",
  sheet_write_failed:
    "ما قدرنا نحفظ البيانات. حاول ثانية.",
  sheet_permission_denied:
    "لا يملك حساب الخدمة صلاحية على الجدول. في Google Sheets: شارك الملف مع بريد الحساب (من ملف JSON) كمحرر.",
  sheet_not_found:
    "لم يتم العثور على الجدول. تحقق من GOOGLE_SHEET_ID.",
  sheet_range_invalid:
    "اسم ورقة الجدول في الإعدادات لا يطابق الملف. اعد التبويب الأول أو ضع GOOGLE_SHEET_APPEND_RANGE و GOOGLE_SHEET_COUNT_RANGE (مثال Sheet1!A:E أو ورقة1!A:E).",
  google_credentials_invalid:
    "إعدادات Google غير صالحة. راجع README و .env.example (المفتاح أو base64 للملف الكامل).",
  network: "تعذر الاتصال. تحقق من الشبكة.",
};
