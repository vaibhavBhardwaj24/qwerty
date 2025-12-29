"use client";

import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  count: number;
  children: ReactNode;
}

export function KanbanColumn({
  id,
  title,
  color,
  count,
  children,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg p-3 transition-colors ${color} ${
        isOver ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-semibold text-slate-900 dark:text-white">
          {title}
        </h4>
        <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
          {count}
        </span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
