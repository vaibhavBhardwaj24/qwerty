export const WorkspaceRole = {
  owner: "owner",
  admin: "admin",
  member: "member",
} as const;

export type WorkspaceRoleType =
  (typeof WorkspaceRole)[keyof typeof WorkspaceRole];
