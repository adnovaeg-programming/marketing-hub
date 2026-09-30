import { NotificationBell } from "@/components/notifications/notification-bell";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandHint } from "@/components/dashboard/command-hint";

export function DashboardTopbar() {
  return (
    <div className="glass sticky top-0 z-30 hidden h-16 items-center gap-3 border-b border-glass-border px-6 md:flex">
      {/* Left — Command hint */}
      <div className="flex flex-1 items-center">
        <CommandHint />
      </div>

      {/* Right — Actions */}
      <div className="flex flex-1 items-center justify-end gap-1">
        <NotificationBell />
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </div>
  );
}