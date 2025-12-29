"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, GripVertical, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Task {
  id: string;
  title: string;
  assignee: string;
  due: string;
  status: "todo" | "doing" | "done";
  priority: "low" | "medium" | "high";
}

interface KanbanCardProps {
  task: Task;
  onUpdate: (patch: Partial<Task>) => void;
  onDelete: () => void;
}

export function KanbanCard({ task, onUpdate, onDelete }: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    medium:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="group cursor-grab active:cursor-grabbing"
    >
      <CardContent className="p-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={task.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
                className="w-full rounded border border-slate-300 dark:border-slate-600 bg-transparent px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <h5
                onClick={() => setIsEditing(true)}
                className="cursor-text text-sm font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
              >
                {task.title || "Untitled task"}
              </h5>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab text-slate-400 opacity-0 transition-opacity hover:text-slate-600 group-hover:opacity-100 dark:hover:text-slate-300"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {task.assignee && (
            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
              <User className="h-3 w-3" />
              <input
                type="text"
                value={task.assignee}
                onChange={(e) => onUpdate({ assignee: e.target.value })}
                className="flex-1 bg-transparent focus:outline-none"
                placeholder="Assignee"
              />
            </div>
          )}

          {task.due && (
            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
              <Calendar className="h-3 w-3" />
              <input
                type="text"
                value={task.due}
                onChange={(e) => onUpdate({ due: e.target.value })}
                className="flex-1 bg-transparent focus:outline-none"
                placeholder="Due date"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Badge
              className={`text-xs ${priorityColors[task.priority]}`}
              variant="secondary"
            >
              {task.priority}
            </Badge>
            <select
              value={task.priority}
              onChange={(e) =>
                onUpdate({ priority: e.target.value as Task["priority"] })
              }
              className="ml-auto rounded border border-slate-300 dark:border-slate-600 bg-transparent px-2 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
