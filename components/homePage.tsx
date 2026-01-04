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
import { cn } from "@/lib/utils";

export const HomePage = async () => {
  const user = await currentUser();
  const workspaces = await getWorkspaces();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="w-full mb-12 flex items-center justify-between text-center flex-col md:flex-row gap-6">
          <div className="flex-1 md:text-start">
            <h1 className="mb-4 text-6xl font-bold tracking-tight text-foreground font-[family-name:var(--font-outfit)]">
              Hey, {user?.firstName || user?.username || "there"}!
            </h1>
            <p className="text-xl text-muted-foreground">Welcome back</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Workspaces Section */}
        <div className="mx-auto ">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                Your Workspaces
              </h2>
              <p className="mt-1 text-start text-muted-foreground">
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
                      h-full border-2 border-border
                      transition-all duration-500 ease-out
                      hover:scale-[1.02]
                      hover:border-primary/50
                      hover:shadow-xl
                      bg-card
                    "
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
                            !workspace.icon &&
                              "bg-primary text-primary-foreground",
                            workspace.icon && "text-2xl"
                          )}
                        >
                          {workspace.icon ||
                            workspace.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{workspace.name}</span>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {workspace.userRole}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>
                          {workspace?.pages?.length || 0} page
                          {workspace?.pages?.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {workspace.members && workspace.members.length > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
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
            <Card className="border-2 border-dashed border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  No workspaces yet
                </h3>
                <p className="mb-6 text-muted-foreground">
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
