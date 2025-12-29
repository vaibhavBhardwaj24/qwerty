"use client";

import { NodeViewWrapper } from "@tiptap/react";
import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  title: string;
  assignee: string;
  due: string;
  status: "todo" | "doing" | "done";
  priority: "low" | "medium" | "high";
}

export function TaskTableView({ node, updateAttributes }: any) {
  const rows: Task[] = node.attrs.rows || [];
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns = [
    { id: "todo", title: "To Do", color: "bg-slate-100 dark:bg-slate-800" },
    {
      id: "doing",
      title: "In Progress",
      color: "bg-blue-100 dark:bg-blue-900/30",
    },
    { id: "done", title: "Done", color: "bg-green-100 dark:bg-green-900/30" },
  ];

  function updateRow(id: string, patch: Partial<Task>) {
    const next = rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
    updateAttributes({ rows: next });
  }

  function addTask(status: "todo" | "doing" | "done" = "todo") {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: "New task",
      assignee: "",
      due: "",
      status,
      priority: "medium",
    };
    updateAttributes({ rows: [...rows, newTask] });
  }

  function deleteTask(id: string) {
    const next = rows.filter((r) => r.id !== id);
    updateAttributes({ rows: next });
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = rows.find((r) => r.id === active.id);
    if (!activeTask) return;

    // Check if dropped on a column
    const overColumn = columns.find((col) => col.id === over.id);
    if (overColumn) {
      updateRow(active.id as string, {
        status: overColumn.id as Task["status"],
      });
      return;
    }

    // Check if dropped on another task
    const overTask = rows.find((r) => r.id === over.id);
    if (overTask && overTask.status !== activeTask.status) {
      updateRow(active.id as string, { status: overTask.status });
    }
  }

  const activeTask = rows.find((r) => r.id === activeId);

  return (
    <NodeViewWrapper className="my-4">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Tasks
            </h3>
            <Button
              onClick={() => addTask("todo")}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {columns.map((column) => {
              const columnTasks = rows.filter((r) => r.status === column.id);
              return (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  color={column.color}
                  count={columnTasks.length}
                >
                  <SortableContext
                    items={columnTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {columnTasks.map((task) => (
                      <KanbanCard
                        key={task.id}
                        task={task}
                        onUpdate={(patch) => updateRow(task.id, patch)}
                        onDelete={() => deleteTask(task.id)}
                      />
                    ))}
                  </SortableContext>
                </KanbanColumn>
              );
            })}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 opacity-80">
              <KanbanCard
                task={activeTask}
                onUpdate={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </NodeViewWrapper>
  );
}
