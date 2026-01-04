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
import { InlineTaskForm } from "./InlineTaskForm";
import { ListTodo, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import "@/components/editor/mention.scss";

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
  const [showForm, setShowForm] = useState(false);
  const pageId = node.attrs.pageId || "";

  console.log("TaskTableView - node.attrs:", node.attrs);
  console.log("TaskTableView - pageId:", pageId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns = [
    {
      id: "todo",
      title: "To Do",
      color: "bg-accent/30",
    },
    {
      id: "doing",
      title: "In Progress",
      color: "bg-primary/5",
    },
    {
      id: "done",
      title: "Done",
      color: "bg-green-50 dark:bg-green-950/20",
    },
  ];

  function updateRow(id: string, patch: Partial<Task>) {
    const next = rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
    updateAttributes({ rows: next });
  }

  function addTask(taskData: {
    title: string;
    assignee: string;
    due: string;
    priority: "low" | "medium" | "high";
  }) {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      assignee: taskData.assignee,
      due: taskData.due,
      status: "todo",
      priority: taskData.priority,
    };
    updateAttributes({ rows: [...rows, newTask] });
    setShowForm(false);
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
    <NodeViewWrapper className="my-6">
      <div className="rounded-lg border border-border bg-card shadow-sm p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Task Board
            </h3>
            <span className="text-sm text-muted-foreground">
              ({rows.length} {rows.length === 1 ? "task" : "tasks"})
            </span>
          </div>
          {!showForm && (
            <Button
              size="sm"
              className="gap-2"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          )}
        </div>

        {/* Inline Task Form */}
        {showForm && (
          <InlineTaskForm
            onAddTask={addTask}
            onCancel={() => setShowForm(false)}
            pageId={pageId}
          />
        )}

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Kanban Board */}
          {rows.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">
                No tasks yet. Click "Add Task" to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          )}

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-2 opacity-90 scale-105">
                <KanbanCard
                  task={activeTask}
                  onUpdate={() => {}}
                  onDelete={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </NodeViewWrapper>
  );
}
