"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Building2, Check, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

import { switchWorkspaceAction } from "@/app/[locale]/dashboard/actions";

type Workspace = { id: string; name: string; slug: string; role: string };

export function WorkspaceSwitcher({
  currentId,
  workspaces,
}: {
  currentId: string | null;
  workspaces: Workspace[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = workspaces.find((w) => w.id === currentId) ?? workspaces[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSwitch = async (id: string) => {
    if (id === currentId) {
      setOpen(false);
      return;
    }
    setPending(true);
    await switchWorkspaceAction(id);
    setPending(false);
    setOpen(false);
    router.refresh();
  };

  if (workspaces.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="glass glass-hover flex w-full items-center gap-2.5 rounded-xl p-2.5 text-start"
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white shadow-md shadow-primary/30">
          <Building2 className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold">
            {current?.name ?? "—"}
          </p>
          <p className="truncate text-[10px] capitalize text-muted-foreground">
            {current?.role ?? ""}
          </p>
        </div>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="glass-strong animate-scale-in absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-glass-border shadow-2xl">
          <div className="max-h-64 overflow-y-auto">
            {workspaces.map((w) => (
              <button
                key={w.id}
                onClick={() => handleSwitch(w.id)}
                disabled={pending}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-start text-sm transition hover:bg-muted/50"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{w.name}</p>
                  <p className="truncate text-[10px] capitalize text-muted-foreground">
                    {w.role}
                  </p>
                </div>
                {w.id === currentId && (
                  <Check className="size-4 shrink-0 text-primary" />
                )}
                {pending && w.id !== currentId && (
                  <Loader2 className="size-3 shrink-0 animate-spin text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}