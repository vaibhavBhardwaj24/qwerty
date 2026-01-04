"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calendar, User, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

interface AddTaskDialogProps {
  onAddTask: (task: {
    title: string;
    assignee: string;
    due: string;
    priority: "low" | "medium" | "high";
  }) => void;
  members?: Member[]; // Optional workspace members
  container?: HTMLElement | null; // Optional portal container
}

export function AddTaskDialog({
  onAddTask,
  members,
  container,
}: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [date, setDate] = useState<Date>();
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !assignee.trim()) {
      return;
    }

    onAddTask({
      title: title.trim(),
      assignee: assignee.trim(),
      due: date ? format(date, "PPP") : "",
      priority,
    });

    // Reset form
    setTitle("");
    setAssignee("");
    setDate(undefined);
    setPriority("medium");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" container={container}>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your board. Title and assignee are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />
              Task Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              required
              autoFocus
            />
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label
              htmlFor="assignee"
              className="text-xs flex items-center gap-2"
            >
              <User className="h-3.5 w-3.5" />
              Assignee *
            </Label>
            {members && members.length > 0 ? (
              <select
                id="assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                required
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <option value="">Select a member...</option>
                {members.map((member) => (
                  <option key={member.id} value={member.name}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id="assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Assign to..."
                required
              />
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due" className="text-xs flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              Due Date (optional)
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-xs">
              Priority
            </Label>
            <select
              id="priority"
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "low" | "medium" | "high")
              }
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !assignee.trim()}>
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
