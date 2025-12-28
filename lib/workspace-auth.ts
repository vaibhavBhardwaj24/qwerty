import { prisma } from "./prisma";
import { WorkspaceRole } from "@/app/types/roles";

/**
 * Check if a user is a member of a workspace
 */
export async function isWorkspaceMember(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });
  return member !== null;
}

/**
 * Get a user's role in a workspace
 * Returns null if user is not a member
 */
export async function getWorkspaceRole(
  userId: string,
  workspaceId: string
): Promise<string | null> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });
  return member?.role ?? null;
}

/**
 * Check if a user has at least the minimum required role in a workspace
 * Role hierarchy: owner > admin > member
 */
export async function hasMinimumRole(
  userId: string,
  workspaceId: string,
  requiredRole: string
): Promise<boolean> {
  const userRole = await getWorkspaceRole(userId, workspaceId);
  if (!userRole) return false;
  return isRoleHigherOrEqual(userRole, requiredRole);
}

/**
 * Compare roles based on hierarchy
 * Role hierarchy: owner > admin > member
 */
export function isRoleHigherOrEqual(
  userRole: string,
  requiredRole: string
): boolean {
  const roleHierarchy: Record<string, number> = {
    [WorkspaceRole.owner]: 3,
    [WorkspaceRole.admin]: 2,
    [WorkspaceRole.member]: 1,
  };

  const userLevel = roleHierarchy[userRole] ?? 0;
  const requiredLevel = roleHierarchy[requiredRole] ?? 0;

  return userLevel >= requiredLevel;
}

/**
 * Get workspace with member information for a specific user
 */
export async function getWorkspaceWithRole(
  workspaceId: string,
  userId: string
) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: true,
      pages: true,
    },
  });

  if (!workspace) return null;

  const userMember = workspace.members.find((m) => m.userId === userId);

  return {
    ...workspace,
    userRole: userMember?.role ?? null,
  };
}
