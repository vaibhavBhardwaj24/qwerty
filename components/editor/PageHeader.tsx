"use client";

import { usePageMetadata } from "@/hooks/usePageMetadata";
import { updatePage } from "@/app/actions/page/actions";
import EmojiPicker from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import * as Y from "yjs";

interface PageHeaderProps {
  pageId: string;
  initialTitle: string;
  initialIcon?: string | null;
  isEditable: boolean;
  ydoc: Y.Doc | null;
  onVersionHistoryClick?: () => void;
}

export function PageHeader({
  pageId,
  initialTitle,
  initialIcon,
  isEditable,
  ydoc,
  onVersionHistoryClick,
}: PageHeaderProps) {
  const { title, icon, isSaving, updateTitle, updateIcon } = usePageMetadata({
    ydoc,
    pageId,
    initialTitle,
    initialIcon: initialIcon || "📄",
    initialCover: null, // Cover is handled separately
    onSave: async (metadata) => {
      const result = await updatePage({
        pageId,
        ...metadata,
      });

      if (!result.success) {
        console.error("Failed to save metadata:", result.error);
        throw new Error(result.error);
      }
    },
  });

  const handleIconChange = (emojiData: any) => {
    if (!isEditable) return;
    updateIcon(emojiData.emoji);
  };

  const handleTitleChange = (newTitle: string) => {
    if (!isEditable) return;
    updateTitle(newTitle);
  };

  return (
    <div className="max-w-[1024px] mx-auto">
      <div className="flex items-center gap-4">
        {/* Emoji Icon */}
        {isEditable ? (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="relative text-6xl hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors cursor-pointer"
                title="Change icon"
                disabled={isSaving}
              >
                {icon}
                {isSaving && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <EmojiPicker onEmojiClick={handleIconChange} />
            </PopoverContent>
          </Popover>
        ) : (
          <div className="text-6xl p-2">{icon}</div>
        )}

        {/* Title */}
        <div className="flex-1">
          {isEditable ? (
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-5xl font-bold w-full bg-transparent border-none outline-none focus:outline-none placeholder:text-gray-400"
              placeholder="Untitled"
            />
          ) : (
            <h1 className="text-5xl font-bold">{title}</h1>
          )}
          {isSaving && (
            <div className="flex items-center gap-2 mt-1">
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Saving...</p>
            </div>
          )}
        </div>

        {/* Version History Button */}
        {onVersionHistoryClick && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onVersionHistoryClick}
                  className="flex-shrink-0"
                >
                  <Clock className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Version History</p>
                <p className="text-xs text-muted-foreground">Ctrl+Shift+H</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
