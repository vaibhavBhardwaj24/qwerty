"use client";

import { useState, useEffect, useCallback } from "react";
import { updateWorkspace } from "@/app/actions/workspace/actions";
import { Users, FileText, Smile } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useDebounce } from "use-debounce";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";

interface WorkspaceHeaderProps {
  id: string;
  initialName: string;
  initialIcon?: string | null;
  memberCount: number;
  pageCount: number;
  userRole: string;
}

export function WorkspaceHeader({
  id,
  initialName,
  initialIcon,
  memberCount,
  pageCount,
  userRole,
}: WorkspaceHeaderProps) {
  const [name, setName] = useState(initialName);
  const [icon, setIcon] = useState(initialIcon || "");
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  const [debouncedName] = useDebounce(name, 500);
  const isOwner = userRole === "owner";

  const handleUpdate = useCallback(
    async (newName: string, newIcon: string) => {
      try {
        await updateWorkspace({
          id,
          name: newName,
          icon: newIcon,
        });
      } catch (error) {
        console.error("Failed to update workspace:", error);
      }
    },
    [id]
  );

  // Handle name update via debounce
  useEffect(() => {
    if (debouncedName !== initialName && debouncedName.trim()) {
      handleUpdate(debouncedName, icon);
    }
  }, [debouncedName, initialName, icon, handleUpdate]);

  const onEmojiClick = (emojiData: { emoji: string }) => {
    const newIcon = emojiData.emoji;
    setIcon(newIcon);
    // Use the current name state when updating icon immediately
    handleUpdate(name, newIcon);
  };

  return (
    <div className="mb-8 group">
      <div className="flex items-center gap-4 mb-2">
        {/* Icon Picker - Only for owners */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              disabled={!isOwner}
              className={cn(
                "text-5xl flex items-center justify-center transition-colors shrink-0 duration-200",
                isOwner && "group-hover:scale-110 cursor-pointer",
                !isOwner && "cursor-default"
              )}
              {...(mounted
                ? {}
                : {
                    "aria-controls": undefined,
                    "aria-expanded": undefined,
                    "aria-haspopup": undefined,
                  })}
            >
              {icon ? (
                <span>{icon}</span>
              ) : (
                <Smile className="h-6 w-6 text-muted-foreground" />
              )}
            </button>
          </PopoverTrigger>
          {mounted && isOwner && (
            <PopoverContent className="p-0 border-none w-auto" align="start">
              <EmojiPicker
                theme={resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT}
                onEmojiClick={onEmojiClick}
                lazyLoadEmojis={true}
              />
            </PopoverContent>
          )}
        </Popover>

        {/* Title Input - Only for owners */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!isOwner}
          className={cn(
            "text-4xl font-bold bg-transparent border-none outline-none focus:ring-0 w-full rounded px-2 transition-colors",
            isOwner
              ? "hover:bg-accent/10 focus:bg-accent/5 cursor-text"
              : "cursor-default"
          )}
          placeholder="Workspace Name"
        />
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground px-2">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{memberCount} members</span>
        </div>
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          <span>{pageCount} pages</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="px-2 py-0.5 rounded-full bg-accent text-xs font-medium">
            {userRole}
          </span>
        </div>
      </div>
    </div>
  );
}
