import { toast } from "sonner";

const ERROR_MESSAGES: Record<string, string> = {
  not_authenticated: "لازم تسجّل دخول الأول",
  no_workspace: "مفيش مساحة عمل مفعّلة",
  missing_name: "الاسم مطلوب",
  missing_title: "العنوان مطلوب",
  missing_fields: "من فضلك املأ كل الحقول المطلوبة",
  missing_first_name: "الاسم الأول مطلوب",
  missing_content: "المحتوى مطلوب",
  no_organization: "مفيش مؤسسة",
  not_allowed: "مش عندك صلاحية",
  invalid_email: "الإيميل مش صحيح",
  already_member: "العضو ده موجود بالفعل",
  workspace_failed: "فشل إنشاء مساحة العمل",
  workspace_not_found: "مساحة العمل مش موجودة",
};

export function toastSuccess(message: string, description?: string) {
  toast.success(message, { description });
}

export function toastError(error: string, fallback = "حصل خطأ") {
  const message = ERROR_MESSAGES[error] ?? fallback;
  toast.error(message);
}

export function toastInfo(message: string, description?: string) {
  toast.info(message, { description });
}

export function toastLoading(message: string) {
  return toast.loading(message);
}