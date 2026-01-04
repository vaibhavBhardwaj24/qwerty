"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2, GripVertical, Calendar, User, Flag } from "lucide-react";
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

  const priorityConfig = {
    low: {
      badge:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      icon: "text-blue-500",
    },
    medium: {
      badge:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      icon: "text-amber-500",
    },
    high: {
      badge:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
      icon: "text-red-500",
    },
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="group cursor-grab active:cursor-grabbing transition-all hover:shadow-md border-border bg-card"
    >
      <CardContent className="p-4">
        {/* Header with title and actions */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <Input
                type="text"
                value={task.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
                className="h-7 text-sm font-semibold"
                autoFocus
              />
            ) : (
              <h5
                onClick={() => setIsEditing(true)}
                className="cursor-text text-sm font-semibold text-foreground hover:text-primary transition-colors truncate"
              >
                {task.title || "Untitled task"}
              </h5>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab text-muted-foreground opacity-0 transition-all hover:text-foreground group-hover:opacity-100 p-1 rounded hover:bg-accent"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-7 w-7 p-0 opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Task details */}
        <div className="space-y-2.5">
          {/* Assignee */}
          <div className="flex items-center gap-2 text-xs">
            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Input
              type="text"
              value={task.assignee}
              onChange={(e) => onUpdate({ assignee: e.target.value })}
              className="h-7 text-xs bg-background/50 border-border/50 focus:bg-background"
              placeholder="Assign to..."
            />
          </div>

          {/* Due date */}
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Input
              type="text"
              value={task.due}
              onChange={(e) => onUpdate({ due: e.target.value })}
              className="h-7 text-xs bg-background/50 border-border/50 focus:bg-background"
              placeholder="Due date..."
            />
          </div>

          {/* Priority */}
          <div className="flex items-center gap-2 pt-1">
            <Badge
              className={`text-xs font-medium border ${
                priorityConfig[task.priority].badge
              }`}
              variant="secondary"
            >
              <Flag
                className={`h-3 w-3 mr-1 ${priorityConfig[task.priority].icon}`}
              />
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
            <select
              value={task.priority}
              onChange={(e) =>
                onUpdate({ priority: e.target.value as Task["priority"] })
              }
              onPointerDown={(e) => e.stopPropagation()}
              className="ml-auto h-7 w-[100px] rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
