import { getWorkspaces } from "@/app/actions";
import { currentUser } from "@clerk/nextjs/server";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";
import { ThemeToggle } from "./ThemeToggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { FileText, Users } from "lucide-react";

export const HomePage = async () => {
  const user = await currentUser();
  const workspaces = await getWorkspaces();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header with Theme Toggle */}
        <div className="mb-8 flex justify-end">
          <ThemeToggle />
        </div>

        {/* Hero Section */}
        <div className="mb-12 text-start">
          <h1 className="mb-4 text-6xl font-bold tracking-tight text-neutral-900 dark:text-white font-[family-name:var(--font-outfit)]">
            Hey, {user?.firstName || user?.username || "there"}!
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            Welcome back
          </p>
        </div>

        {/* Workspaces Section */}
        <div className="mx-auto ">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">
                Your Workspaces
              </h2>
              <p className="mt-1 text-start text-neutral-600 dark:text-neutral-400">
                {workspaces?.data?.length || 0} workspace
                {workspaces?.data?.length !== 1 ? "s" : ""}
              </p>
            </div>
            <CreateWorkspaceDialog />
          </div>

          {/* Workspace Grid */}
          {workspaces?.data && workspaces.data.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {workspaces.data.map((workspace) => (
                <Link
                  key={workspace.id}
                  href={`/workspace/${workspace.id}`}
                  className="group  "
                >
                  <Card
                    className="
      h-full border-2
      transition-all duration-500 ease-out
      group-hover:scale-[1.02]
      group-hover:border-neutral-400
      group-hover:shadow-xl
      dark:group-hover:border-neutral-600
      dark:bg-neutral-800
    "
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {workspace.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{workspace.name}</span>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {workspace.userRole}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <FileText className="h-4 w-4" />
                        <span>
                          {workspace?.pages?.length || 0} page
                          {workspace?.pages?.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {workspace.members && workspace.members.length > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                          <Users className="h-4 w-4" />
                          <span>
                            {workspace.members.length} member
                            {workspace.members.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <FileText className="h-10 w-10 text-neutral-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
                  No workspaces yet
                </h3>
                <p className="mb-6 text-neutral-600 dark:text-neutral-400">
                  Create your first workspace to get started
                </p>
                <CreateWorkspaceDialog />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
