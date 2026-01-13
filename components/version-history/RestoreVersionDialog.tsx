"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  restoreVersion,
  type VersionMetadata,
} from "@/app/actions/versions/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import * as Y from "yjs";

interface RestoreVersionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  version: VersionMetadata;
  pageId: string;
}

export function RestoreVersionDialog({
  isOpen,
  onClose,
  onConfirm,
  version,
  pageId,
}: RestoreVersionDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleRestore = async () => {
    setLoading(true);

    try {
      const result = await restoreVersion(pageId, version.id);

      if (result.success && result.data) {
        // Show success message
        toast.success("Version restored successfully", {
          description: `Restored to version ${
            version.version
          } from ${formatDistanceToNow(new Date(version.createdAt), {
            addSuffix: true,
          })}`,
        });

        // Note: The actual restoration to the Y.Doc happens on the client side
        // The server action just validates permissions and returns the snapshot data
        // You would need to integrate this with your Yjs provider to apply the snapshot

        onConfirm();
      } else {
        toast.error("Failed to restore version", {
          description:
            result.error || "An error occurred while restoring the version",
        });
      }
    } catch (error) {
      console.error("Failed to restore version:", error);
      toast.error("Failed to restore version", {
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Restore Version?
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p>
              You are about to restore this page to{" "}
              <strong>Version {version.version}</strong> from{" "}
              <strong>
                {formatDistanceToNow(new Date(version.createdAt), {
                  addSuffix: true,
                })}
              </strong>
              .
            </p>
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-600 dark:text-yellow-500">
                <strong>Warning:</strong> This will replace your current content
                with the selected version. This action cannot be undone, but a
                new version will be created automatically.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted border border-border">
              <p className="text-xs text-muted-foreground mb-2">
                Version Preview:
              </p>
              <p className="text-sm line-clamp-3">{version.preview}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleRestore} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Restoring...
              </>
            ) : (
              "Restore Version"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
