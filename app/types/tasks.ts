export const TaskStatus = {
  pending: "pending",
  in_progress: "in_progress",
  completed: "completed",
} as const;

export type TaskStatusType = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskPriority = {
  low: "low",
  medium: "medium",
  high: "high",
} as const;

export type TaskPriorityType = (typeof TaskPriority)[keyof typeof TaskPriority];
