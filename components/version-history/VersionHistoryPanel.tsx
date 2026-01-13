"use client";

import { useState, useEffect } from "react";
import { X, Clock, User, ChevronRight, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  getPageVersions,
  type VersionMetadata,
} from "@/app/actions/versions/actions";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { VersionPreview } from "./VersionPreview";
import { RestoreVersionDialog } from "./RestoreVersionDialog";

interface VersionHistoryPanelProps {
  pageId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore?: () => void;
}

export function VersionHistoryPanel({
  pageId,
  isOpen,
  onClose,
  onRestore,
}: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<VersionMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] =
    useState<VersionMetadata | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen, pageId]);

  const loadVersions = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getPageVersions(pageId);

      if (result.success && result.data) {
        setVersions(result.data);
      } else {
        setError(result.error || "Failed to load versions");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Failed to load versions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreClick = (version: VersionMetadata) => {
    setVersionToRestore(version);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = () => {
    setRestoreDialogOpen(false);
    setVersionToRestore(null);
    onRestore?.();
    onClose();
  };

  const groupVersionsByDate = (versions: VersionMetadata[]) => {
    const groups: { [key: string]: VersionMetadata[] } = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      "This Month": [],
      Older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    versions.forEach((version) => {
      const versionDate = new Date(version.createdAt);

      if (versionDate >= today) {
        groups.Today.push(version);
      } else if (versionDate >= yesterday) {
        groups.Yesterday.push(version);
      } else if (versionDate >= weekAgo) {
        groups["This Week"].push(version);
      } else if (versionDate >= monthAgo) {
        groups["This Month"].push(version);
      } else {
        groups.Older.push(version);
      }
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full md:w-[500px] bg-background border-l border-border z-50",
          "transform transition-transform duration-300 ease-out",
          "flex flex-col overflow-hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Version History</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 h-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 px-4">
              <p className="text-sm text-destructive mb-4">{error}</p>
              <Button onClick={loadVersions} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          ) : versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 px-4 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No version history available yet
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Versions are automatically saved as you edit
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {/* Current Version */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Current Version
                </h3>
                <div className="p-3 rounded-lg border-2 border-primary bg-primary/5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This is the current version you're editing
                  </p>
                </div>
              </div>

              {/* Version Groups */}
              {groupVersionsByDate(versions).map(
                ([groupName, groupVersions]) => (
                  <div key={groupName} className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {groupName}
                    </h3>
                    <div className="space-y-2">
                      {groupVersions.map((version, index) => (
                        <div
                          key={version.id}
                          className={cn(
                            "group relative p-3 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer",
                            selectedVersion === version.id &&
                              "border-primary bg-primary/5"
                          )}
                          onClick={() => setSelectedVersion(version.id)}
                        >
                          {/* Timeline connector */}
                          {index < groupVersions.length - 1 && (
                            <div className="absolute left-[19px] top-[40px] w-px h-[calc(100%+8px)] bg-border" />
                          )}

                          <div className="flex items-start gap-3">
                            {/* Timeline dot */}
                            <div className="relative flex-shrink-0 mt-1">
                              <div className="w-2 h-2 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors" />
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Version info */}
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">
                                  Version {version.version}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(
                                    new Date(version.createdAt),
                                    {
                                      addSuffix: true,
                                    }
                                  )}
                                </span>
                              </div>

                              {/* Author */}
                              <div className="flex items-center gap-1 mb-2">
                                <User className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground truncate">
                                  {version.createdBy}
                                </span>
                              </div>

                              {/* Preview */}
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                {version.preview}
                              </p>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedVersion(version.id);
                                  }}
                                >
                                  Preview
                                  <ChevronRight className="w-3 h-3 ml-1" />
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRestoreClick(version);
                                  }}
                                >
                                  Restore
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Version Preview Panel */}
      {selectedVersion && (
        <VersionPreview
          snapshotId={selectedVersion}
          isOpen={!!selectedVersion}
          onClose={() => setSelectedVersion(null)}
          onRestore={() => {
            const version = versions.find((v) => v.id === selectedVersion);
            if (version) handleRestoreClick(version);
          }}
        />
      )}

      {/* Restore Dialog */}
      {versionToRestore && (
        <RestoreVersionDialog
          isOpen={restoreDialogOpen}
          onClose={() => {
            setRestoreDialogOpen(false);
            setVersionToRestore(null);
          }}
          onConfirm={handleRestoreConfirm}
          version={versionToRestore}
          pageId={pageId}
        />
      )}
    </>
  );
}
