# Workspace-Based Role System Migration

Migrate from a page-based permission system to a workspace-based role system where users have roles (owner, admin, member) at the workspace level instead of per-page permissions.

## User Review Required

> [!WARNING]
> **Breaking Change**: This migration will remove the `PagePermission` model and all existing page-level permissions. All users will need to be re-invited to workspaces with appropriate roles.

> [!IMPORTANT]
> **Role Hierarchy**: The new system will have three roles:
> - **Owner**: Full control over workspace, can manage members, delete workspace
> - **Admin**: Can manage pages and invite members, but cannot delete workspace or remove owner
> - **Member**: Can view and edit pages (based on page privacy settings), cannot manage workspace

> [!IMPORTANT]
> **Page Access Logic**: Pages will inherit permissions from workspace membership. Private pages will only be visible to workspace members. The `private` flag will control visibility within the workspace, not across users.

## Proposed Changes

### Database Schema

#### [MODIFY] [schema.prisma](file:///c:/Users/Vaibhav/Desktop/code/qwerty/prisma/schema.prisma)

**Changes**:
1. Add `WorkspaceMember` model to track workspace memberships with roles
2. Add `members` relation to [Workspace](file:///c:/Users/Vaibhav/Desktop/code/qwerty/app/types/workspace.ts#1-5) model
3. Remove `PagePermission` model (breaking change)
4. Remove `permissions` relation from `Page` model

**New WorkspaceMember Model**:
```prisma
model WorkspaceMember {
  id          String    @id @default(uuid())
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  userId      String
  role        String    // 'owner', 'admin', 'member'
  createdAt   DateTime  @default(now())
  
  @@unique([workspaceId, userId])
  @@index([userId])
}
```

**Role Definitions**:
- `owner`: Creator of workspace, full control
- `admin`: Can manage pages and members
- `member`: Can view/edit pages based on privacy settings

---

### Type Definitions

#### [MODIFY] [roles.ts](file:///c:/Users/Vaibhav/Desktop/code/qwerty/app/types/roles.ts)

Update role definitions to reflect workspace roles:
```typescript
export const WorkspaceRole = {
  owner: "owner",
  admin: "admin",
  member: "member",
} as const;

export type WorkspaceRoleType = typeof WorkspaceRole[keyof typeof WorkspaceRole];
```

#### [MODIFY] [workspace.ts](file:///c:/Users/Vaibhav/Desktop/code/qwerty/app/types/workspace.ts)

Add member information to workspace type:
```typescript
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
```

---

### API Routes - Workspace Management

#### [MODIFY] [route.ts](file:///c:/Users/Vaibhav/Desktop/code/qwerty/app/api/workspace/route.ts)

**POST (Create Workspace)**:
- After creating workspace, automatically create `WorkspaceMember` record with `owner` role

**GET (List Workspaces)**:
- Update query to fetch workspaces where user is a member (not just owner)
- Include member information and role in response

**PATCH (Update Workspace)**:
- Add authorization check: only `owner` or `admin` can update workspace name
- Return error if user doesn't have sufficient permissions

#### [NEW] [route.ts](file:///c:/Users/Vaibhav/Desktop/code/qwerty/app/api/workspace/members/route.ts)

New endpoint for workspace member management:

**POST (Invite Member)**:
- Add user to workspace with specified role
- Only `owner` and `admin` can invite members
- Validate role is one of: owner, admin, member

**DELETE (Remove Member)**:
- Remove user from workspace
- Only `owner` can remove members
- Cannot remove the workspace owner

**PATCH (Update Member Role)**:
- Change member's role
- Only `owner` can change roles
- Cannot change owner's role

---

### API Routes - Page Management

#### [MODIFY] [route.ts](file:///c:/Users/Vaibhav/Desktop/code/qwerty/app/api/page/route.ts)

**POST (Create Page)**:
- Remove `PagePermission` creation logic
- Verify user is a member of the workspace before creating page

**GET (Fetch Page)**:
- Replace permission check with workspace membership check
- Allow access if user is a workspace member
- Respect `private` flag: private pages only visible to workspace members

**PATCH (Update Page)**:
- Replace page permission check with workspace role check
- Allow `owner` and `admin` to edit any page
- Allow `member` to edit non-private pages or pages they created

---

### Helper Functions

#### [NEW] [workspace-auth.ts](file:///c:/Users/Vaibhav/Desktop/code/qwerty/lib/workspace-auth.ts)

Create helper functions for workspace authorization:

```typescript
// Check if user is a member of workspace
async function isWorkspaceMember(userId: string, workspaceId: string): Promise<boolean>

// Get user's role in workspace
async function getWorkspaceRole(userId: string, workspaceId: string): Promise<string | null>

// Check if user has minimum required role
async function hasMinimumRole(userId: string, workspaceId: string, requiredRole: string): Promise<boolean>

// Role hierarchy: owner > admin > member
function isRoleHigherOrEqual(userRole: string, requiredRole: string): boolean
```

---

## Verification Plan

### Database Migration
1. Run `npx prisma migrate dev --name workspace-role-system` to create migration
2. Verify migration creates `WorkspaceMember` table
3. Verify migration drops `PagePermission` table
4. Check database schema matches expected structure

### Automated Tests
1. Test workspace creation automatically creates owner membership
2. Test workspace GET returns only workspaces where user is a member
3. Test member invitation with different roles
4. Test role-based authorization for workspace updates
5. Test page access with workspace membership
6. Test private page visibility within workspace

### Manual Verification
1. Create a new workspace and verify owner role is assigned
2. Invite users with different roles (admin, member)
3. Test page creation and access with different roles
4. Verify admins can manage pages but not remove workspace
5. Verify members can view/edit pages based on privacy settings
6. Test removing members from workspace
