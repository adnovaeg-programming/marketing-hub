"use client";

import { useMemo, useState, useOptimistic, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckSquare,
  Calendar,
  FolderKanban,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { updateTaskStatusAction } from "@/app/[locale]/dashboard/tasks/actions";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  project: { id: string; name: string } | null;
  assignee: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
};

const COLUMNS = ["todo", "in_progress", "review", "completed"] as const;
type ColumnKey = (typeof COLUMNS)[number];

const COLUMN_COLORS: Record<string, string> = {
  todo: "border-slate-500/50",
  in_progress: "border-blue-500/50",
  review: "border-amber-500/50",
  completed: "border-emerald-500/50",
};

const PRIORITY_DOTS: Record<string, string> = {
  low: "bg-muted-foreground",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-destructive",
};

/* ═══════════ Droppable Column ═══════════ */

function DroppableColumn({
  id,
  children,
  count,
}: {
  id: ColumnKey;
  children: React.ReactNode;
  count: number;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const t = useTranslations("dashboard.tasks");

  return (
    <div className="flex flex-col">
      <div
        className={`glass mb-3 flex items-center justify-between rounded-xl border-s-4 px-3 py-2 transition-all ${COLUMN_COLORS[id]} ${isOver ? "ring-2 ring-primary/50 scale-[1.02]" : ""}`}
      >
        <span className="text-sm font-semibold">{t(`statuses.${id}`)}</span>
        <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {count}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`glass min-h-[120px] flex-1 space-y-2 rounded-2xl p-2 transition-all ${
          isOver ? "bg-primary/5 border-2 border-dashed border-primary/40" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/* ═══════════ Draggable Task Card ═══════════ */

function DraggableTaskCard({
  task,
  isDragging,
}: {
  task: Task;
  isDragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  const assigneeName = task.assignee
    ? [task.assignee.first_name, task.assignee.last_name]
        .filter(Boolean)
        .join(" ") || task.assignee.email
    : null;
  const initial = assigneeName
    ? assigneeName.charAt(0).toUpperCase()
    : null;
  const dueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString()
    : null;
  const t = useTranslations("dashboard.tasks");

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`glass glass-hover block cursor-grab touch-none rounded-xl p-3 transition-all active:cursor-grabbing ${
        isDragging ? "opacity-40" : "hover:-translate-y-0.5 hover:shadow-lg"
      }`}
    >
      <h4 className="line-clamp-2 text-sm font-medium">{task.title}</h4>

      {task.project && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <FolderKanban className="size-3" />
          <span className="truncate">{task.project.name}</span>
        </div>
      )}

      {dueDate && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Calendar className="size-3" />
          <span dir="ltr">{dueDate}</span>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block size-1.5 rounded-full ${PRIORITY_DOTS[task.priority] ?? "bg-muted-foreground"}`}
          />
          <span className="text-[10px] text-muted-foreground">
            {t(`priorities.${task.priority}`)}
          </span>
        </div>

        {assigneeName && initial && (
          <div
            className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-[9px] font-bold text-white shadow-sm"
            title={assigneeName}
          >
            {initial}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════ Main Kanban ═══════════ */

export function TasksKanban({ tasks }: { tasks: Task[] }) {
  const t = useTranslations("dashboard.tasks");
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [, startTransition] = useTransition();

  const [optimisticTasks, updateOptimistic] = useOptimistic(
    tasks,
    (state: Task[], update: { taskId: string; status: string }) =>
      state.map((task) =>
        task.id === update.taskId ? { ...task, status: update.status } : task
      )
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const columnsWithItems = useMemo(() => {
    return COLUMNS.map((col) => ({
      key: col,
      items: optimisticTasks.filter((task) => task.status === col),
    }));
  }, [optimisticTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined;
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const newStatus = String(over.id) as ColumnKey;

    const task = optimisticTasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    startTransition(async () => {
      updateOptimistic({ taskId, status: newStatus });

      const result = await updateTaskStatusAction(taskId, newStatus);

      if (!result.success) {
        toast.error("فشل تحديث الحالة");
        return;
      }

      toast.success("تم تحديث الحالة ✨");
    });
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columnsWithItems.map((col) => (
          <DroppableColumn key={col.key} id={col.key} count={col.items.length}>
            {col.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckSquare className="size-6 text-muted-foreground/30" />
                <p className="mt-2 text-[10px] text-muted-foreground">
                  {t("kanbanEmpty")}
                </p>
              </div>
            ) : (
              col.items.map((task) => (
                <DraggableTaskCard key={task.id} task={task} />
              ))
            )}
          </DroppableColumn>
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="glass-strong rotate-3 cursor-grabbing rounded-xl p-3 shadow-2xl shadow-primary/30">
            <h4 className="line-clamp-2 text-sm font-medium">
              {activeTask.title}
            </h4>
            {activeTask.project && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <FolderKanban className="size-3" />
                <span className="truncate">{activeTask.project.name}</span>
              </div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}