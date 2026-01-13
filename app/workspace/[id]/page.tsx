import {
  getWorkspaces,
  getWorkspaceById,
  getWorkspaceMentions,
} from "@/app/actions";
import { getFavoritePages } from "@/app/actions/page/actions";
import { currentUser } from "@clerk/nextjs/server";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import { FileText, Users, Calendar, AtSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkspaceHeader } from "@/components/workspace-header";
import { CreatePageDialog } from "@/components/create-page-dialog";
import { InviteMember } from "@/components/invite-member";
import { WorkspaceMentions } from "@/components/workspace-mentions";
import Link from "next/link";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await currentUser();
  const workspacesData = await getWorkspaces();
  const workspaces = workspacesData?.data || [];
  // Fetch the specific workspace
  const workspaceData = await getWorkspaceById(id);
  const workspace = workspaceData?.data;

  // Fetch workspace mentions
  const mentionsData = await getWorkspaceMentions(id);
  const mentions = mentionsData?.data || [];

  // Fetch favorite pages
  const favoritesData = await getFavoritePages();
  const favorites = favoritesData?.data || [];

  const userName =
    user?.fullName ||
    user?.username ||
    user?.emailAddresses[0]?.emailAddress ||
    "User";

  const userEmail = user?.emailAddresses[0]?.emailAddress || "user@example.com";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <WorkspaceSidebar
        workspaces={workspaces}
        userName={userName}
        userEmail={userEmail}
        userImage={user?.imageUrl}
        favorites={favorites}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="container mx-auto px-8 py-8 max-w-6xl">
          {workspace ? (
            <>
              <div className="flex items-center justify-between mb-4">
                {/* Workspace Header */}
                <WorkspaceHeader
                  id={workspace.id}
                  initialName={workspace.name}
                  initialIcon={workspace.icon}
                  memberCount={workspace.members?.length || 0}
                  pageCount={workspace.pages?.length || 0}
                  userRole={workspace.userRole as string}
                />
                <InviteMember />
              </div>
              {/* Pages Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">Pages</h2>
                  <CreatePageDialog workspaceId={workspace.id} />
                </div>
                {workspace.pages && workspace.pages.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {workspace.pages.map((page) => (
                      <Card
                        key={page.id}
                        className="hover:border-primary/50 transition-colors cursor-pointer"
                      >
                        <Link href={`/page/${page.id}`}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {page.icon}
                              <span className="truncate">{page.name}</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Updated{" "}
                                {new Date(page.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No pages yet
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Create your first page to get started
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
              {/* Members and Mentions Section */}
              <div className="grid gap-8 md:grid-cols-2">
                {/* Members Section */}
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Members</h2>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        {workspace.members?.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between py-2"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">{member.name}</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-accent text-xs font-medium">
                              {member.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {/* Mentions Section */}
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Mentions</h2>
                  <WorkspaceMentions mentions={mentions} />
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Card className="max-w-md">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    Workspace not found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The workspace you're looking for doesn't exist or you don't
                    have access to it.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
