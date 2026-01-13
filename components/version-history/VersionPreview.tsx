"use client";

import { useState, useEffect } from "react";
import { X, Loader2, RotateCcw } from "lucide-react";
import {
  getVersionContent,
  type VersionDetail,
} from "@/app/actions/versions/actions";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface VersionPreviewProps {
  snapshotId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore: () => void;
}

export function VersionPreview({
  snapshotId,
  isOpen,
  onClose,
  onRestore,
}: VersionPreviewProps) {
  const [version, setVersion] = useState<VersionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && snapshotId) {
      loadVersion();
    }
  }, [isOpen, snapshotId]);

  const loadVersion = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getVersionContent(snapshotId);

      if (result.success && result.data) {
        setVersion(result.data);
      } else {
        setError(result.error || "Failed to load version");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Failed to load version:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Preview Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full md:w-[700px] bg-background border-l border-border z-50",
          "transform transition-transform duration-300 ease-out",
          "flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex-1 min-w-0">
            {version && (
              <div>
                <h2 className="text-lg font-semibold">
                  Version {version.version}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(version.createdAt), {
                    addSuffix: true,
                  })}{" "}
                  by {version.createdBy}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {version && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  onRestore();
                  onClose();
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 px-4">
              <p className="text-sm text-destructive mb-4">{error}</p>
              <Button onClick={loadVersion} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          ) : version ? (
            <div className="p-6">
              {/* Version Info Card */}
              <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Version:</span>
                    <span className="ml-2 font-medium">{version.version}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <span className="ml-2 font-medium">
                      {new Date(version.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Author:</span>
                    <span className="ml-2 font-medium">
                      {version.createdBy}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview Badge */}
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Read-only Preview
                </span>
              </div>

              {/* Content Preview */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="p-4 rounded-lg border border-border bg-background/50">
                  {version.textContent &&
                  version.textContent !== "[Empty document]" &&
                  version.textContent !== "[Error reading content]" ? (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {version.textContent}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      {version.textContent || "This version has no content"}
                    </p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  💡 Tip: This is a text-only preview. Restore the version to
                  see the full formatted content.
                </p>
              </div>
            </div>
          ) : null}
        </ScrollArea>
      </div>
    </>
  );
}
