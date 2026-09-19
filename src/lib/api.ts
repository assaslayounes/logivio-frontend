import axios from "axios";

// عنوان الخلفية (Backend). عدّله في .env عبر VITE_API_BASE_URL عند النشر الفعلي.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// إرفاق رمز الدخول (JWT) تلقائيًا بكل طلب إن كان المستخدم مسجّلاً دخوله
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("logivio_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// توحيد رسالة الخطأ القادمة من الخلفية العربية لعرضها مباشرة في toast
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error?.response?.data?.error || "تعذّر الاتصال بالخادم";
    return Promise.reject(new Error(message));
  }
);
