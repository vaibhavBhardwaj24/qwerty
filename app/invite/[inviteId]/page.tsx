"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { getInviteDetails, acceptInvite } from "@/app/actions/invite/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UserPlus,
  Loader2,
  CheckCircle2,
  XCircle,
  Mail,
  Shield,
  Building2,
} from "lucide-react";

interface InviteDetails {
  workspaceId: string;
  workspaceName: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function InvitePage({
  params,
}: {
  params: Promise<{ inviteId: string }>;
}) {
  // Unwrap the params Promise using React.use()
  const { inviteId } = use(params);

  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    async function fetchInviteDetails() {
      try {
        const result = await getInviteDetails(inviteId);

        if (result.success && result.data) {
          setInviteDetails(result.data);
        } else {
          setError(result.error || "Invalid or expired invitation");
        }
      } catch (err) {
        setError("Failed to load invitation details");
      } finally {
        setLoading(false);
      }
    }

    fetchInviteDetails();
  }, [inviteId]);

  const handleAcceptInvite = async () => {
    if (!user) {
      toast.error("Please sign in to accept this invitation");
      return;
    }

    setAccepting(true);
    try {
      const result = await acceptInvite(inviteId);

      if (result.success && result.data) {
        setAccepted(true);
        toast.success("Welcome to the workspace!", {
          description: `You've joined ${result.data.workspace.name}`,
        });

        // Redirect to workspace after a short delay
        setTimeout(() => {
          router.push(`/workspace/${result.data.workspace.id}`);
        }, 2000);
      } else {
        toast.error("Failed to accept invitation", {
          description: result.error || "Please try again",
        });
      }
    } catch (err) {
      toast.error("Something went wrong", {
        description: "Unable to accept invitation",
      });
    } finally {
      setAccepting(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading invitation...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5 p-4">
        <Card className="w-full max-w-md shadow-lg border-destructive/20">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Invalid Invitation</CardTitle>
            <CardDescription className="text-base">{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="gap-2"
            >
              Go to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="w-full max-w-md shadow-lg border-primary/20">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-in zoom-in duration-300">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome Aboard! 🎉</CardTitle>
            <CardDescription className="text-base">
              You've successfully joined{" "}
              <span className="font-semibold text-foreground">
                {inviteDetails?.workspaceName}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Redirecting you to the workspace...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">You're Invited!</CardTitle>
            <CardDescription className="text-base">
              Join the workspace and start collaborating
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Workspace Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/50 border border-border">
              <Building2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Workspace
                </p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {inviteDetails?.workspaceName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/50 border border-border">
              <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Invited Email
                </p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {inviteDetails?.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/50 border border-border">
              <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Role
                </p>
                <p className="text-sm font-semibold text-foreground capitalize">
                  {inviteDetails?.role}
                </p>
              </div>
            </div>
          </div>

          {/* User Status */}
          {!user && (
            <div className="p-4 rounded-lg bg-muted border border-border">
              <p className="text-sm text-muted-foreground text-center">
                Please{" "}
                <button
                  onClick={() => router.push("/sign-in")}
                  className="text-primary font-medium hover:underline"
                >
                  sign in
                </button>{" "}
                to accept this invitation
              </p>
            </div>
          )}

          {user &&
            user.emailAddresses[0]?.emailAddress !== inviteDetails?.email && (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
                  ⚠️ You're signed in as{" "}
                  <span className="font-semibold">
                    {user.emailAddresses[0]?.emailAddress}
                  </span>
                  , but this invite was sent to{" "}
                  <span className="font-semibold">{inviteDetails?.email}</span>
                </p>
              </div>
            )}
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            disabled={accepting}
            className="flex-1"
          >
            Decline
          </Button>
          <Button
            onClick={handleAcceptInvite}
            disabled={accepting || !user}
            className="flex-1 gap-2"
          >
            {accepting && <Loader2 className="h-4 w-4 animate-spin" />}
            {accepting ? "Accepting..." : "Accept Invitation"}
          </Button>
        </CardFooter>

        <div className="px-6 pb-6">
          <p className="text-xs text-center text-muted-foreground">
            This invitation link will expire in 7 days
          </p>
        </div>
      </Card>
    </div>
  );
}
