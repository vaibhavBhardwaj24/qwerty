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
      className={`rounded-lg p-4 transition-all border border-border/50 ${color} ${
        isOver ? "ring-2 ring-primary shadow-lg scale-[1.02]" : ""
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-semibold text-foreground text-sm">{title}</h4>
        <span className="rounded-full bg-background/80 border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {count}
        </span>
      </div>
      <div className="space-y-3 min-h-[100px]">{children}</div>
    </div>
  );
}
