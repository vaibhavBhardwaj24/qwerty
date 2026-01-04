"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { inviteMember } from "@/app/actions";
import { WorkspaceRoleType } from "@/app/types/roles";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Shield, Loader2 } from "lucide-react";
// import { useToast } from "@/components/ui/sonner";
interface InviteMemberProps {
  children?: React.ReactNode;
}

export function InviteMember({ children }: InviteMemberProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRoleType>("member");
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const result = await inviteMember({
        workspaceId: params.id as string,
        inviteUserEmail: email,
        role,
      });

      if (result.success) {
        toast.success("Invitation sent!", {
          description: `Invited ${email} as ${role}`,
        });
        setOpen(false);
        setEmail("");
        setRole("member");
        router.refresh();
      } else {
        toast.error("Failed to send invitation", {
          description: result.error || "Please try again",
        });
      }
    } catch (error) {
      toast.error("Something went wrong", {
        description: "Unable to send invitation. Please try again.",
      });
      console.error("Failed to invite member", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              Invite Team Member
            </h4>
            <p className="text-xs text-muted-foreground">
              Send an invitation to join this workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs">
                <Mail className="h-3.5 w-3.5" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-xs">
                <Shield className="h-3.5 w-3.5" />
                Role
              </Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as WorkspaceRoleType)}
                disabled={isLoading}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <p className="text-xs text-muted-foreground">
                {role === "admin"
                  ? "Can manage workspace settings and members"
                  : "Can view and edit workspace content"}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!email.trim() || isLoading}
                className="flex-1 gap-2"
              >
                {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Send Invite
              </Button>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
