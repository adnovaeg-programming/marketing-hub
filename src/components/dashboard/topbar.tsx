import { NotificationBell } from "@/components/notifications/notification-bell";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardTopbar() {
  return (
    <div className="glass sticky top-0 z-30 hidden h-16 items-center justify-end gap-2 border-b border-glass-border px-6 md:flex">
      <NotificationBell />
      <LanguageSwitcher />
      <ThemeToggle />
    </div>
  );
}