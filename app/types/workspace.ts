export interface WorkspaceMember {
  id: string;
  userId: string;
  role: string;
  createdAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members?: WorkspaceMember[];
}
