export const NotificationType = {
  invite: "invite",
  task_assigned: "task_assigned",
  due_soon: "due_soon",
  mentioned: "mentioned",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];
