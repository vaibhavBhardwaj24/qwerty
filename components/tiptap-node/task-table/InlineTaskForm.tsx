"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { MentionAssigneeInput } from "./MentionAssigneeInput";
import { getWorkspaceMembers } from "@/app/actions";
import { getWorkspaceMembersByPageId } from "@/app/actions/mentions/actions";

interface InlineTaskFormProps {
  onAddTask: (task: {
    title: string;
    assignee: string;
    due: string;
    priority: "low" | "medium" | "high";
  }) => void;
  onCancel: () => void;
  pageId: string;
}

interface Member {
  id: string;
  userId: string;
  name: string;
  role: string;
}

export function InlineTaskForm({
  onAddTask,
  onCancel,
  pageId,
}: InlineTaskFormProps) {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [assigneeUserId, setAssigneeUserId] = useState<string>();
  const [date, setDate] = useState<Date>();
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [members, setMembers] = useState<Member[]>([]);

  // Fetch workspace members
  useEffect(() => {
    const fetchMembers = async () => {
      console.log("Fetching members for pageId:", pageId);
      const result = await getWorkspaceMembersByPageId(pageId);
      console.log("Members fetch result:", result);
      if (result.success && result.data) {
        console.log("Setting members:", result.data);
        setMembers(result.data);
      } else {
        console.error("Failed to fetch members:", result);
      }
    };
    if (pageId) {
      fetchMembers();
    } else {
      console.warn("No pageId provided to InlineTaskForm", pageId);
    }
  }, [pageId]);

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
  };

  return (
    <div className="mb-6 rounded-lg border-2 border-primary/20 bg-primary/5 p-4 shadow-sm animate-in slide-in-from-top-2 duration-200">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">
          Create New Task
        </h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-7 w-7 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-medium">
              Task Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              required
              autoFocus
              className="h-9"
            />
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <Label htmlFor="assignee" className="text-xs font-medium">
              Assignee *{" "}
              <span className="text-muted-foreground font-normal">
                (Type @ to mention)
              </span>
            </Label>
            <MentionAssigneeInput
              value={assignee}
              onChange={(value, userId) => {
                setAssignee(value);
                if (userId) setAssigneeUserId(userId);
              }}
              members={members}
              placeholder="Type @ to mention someone..."
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Due Date */}
          <div className="space-y-1.5">
            <Label htmlFor="due" className="text-xs font-medium">
              Due Date (optional)
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-9 justify-start text-left font-normal",
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
          <div className="space-y-1.5">
            <Label htmlFor="priority" className="text-xs font-medium">
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
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={!title.trim() || !assignee.trim()}
            className="gap-1.5"
          >
            <Check className="h-4 w-4" />
            Create Task
          </Button>
        </div>
      </form>
    </div>
  );
}
