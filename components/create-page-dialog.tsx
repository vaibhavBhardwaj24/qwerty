"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { createPage } from "@/app/actions/page/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreatePageDialogProps {
  workspaceId: string;
  children?: React.ReactNode;
}

export function CreatePageDialog({
  workspaceId,
  children,
}: CreatePageDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const result = await createPage({
        workspaceId,
        title,
        icon: icon || undefined,
      });

      if (result.success) {
        setOpen(false);
        setTitle("");
        setIcon("");
        router.refresh();
      } else {
        console.error(result.error);
        // Could enable a toast here if available
      }
    } catch (error) {
      console.error("Failed to create page", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onEmojiClick = (emojiData: { emoji: string }) => {
    setIcon(emojiData.emoji);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Page
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Page</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 w-10 p-0 shrink-0 text-xl"
                  type="button"
                >
                  {icon ? (
                    icon
                  ) : (
                    <Smile className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 border-none w-auto" align="start">
                <EmojiPicker
                  theme={resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT}
                  onEmojiClick={onEmojiClick}
                  lazyLoadEmojis={true}
                />
              </PopoverContent>
            </Popover>
            <Input
              placeholder="Page title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Page
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
