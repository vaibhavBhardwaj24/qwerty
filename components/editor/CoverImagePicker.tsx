"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import coverImages from "@/app/actions/cover/cover.json";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface CoverImagePickerProps {
  pageId: string;
  currentCover: string | null;
  isEditable: boolean;
  onCoverChange?: (cover: string | null) => void;
}

export function CoverImagePicker({
  pageId,
  currentCover,
  isEditable,
  onCoverChange,
}: CoverImagePickerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedCover, setSelectedCover] = useState<string | null>(
    currentCover
  );
  const [isLoading, setIsLoading] = useState(false);

  if (!isEditable) return null;

  const handleSetCover = async (coverUrl: string) => {
    setIsLoading(true);

    // Optimistic update - set locally first
    setSelectedCover(coverUrl);
    onCoverChange?.(coverUrl);
    setOpen(false);

    try {
      const { setCoverImage } = await import("@/app/actions/cover/actions");
      await setCoverImage({ pageId, cover: coverUrl });

      // Refresh server component data without full reload
      router.refresh();
    } catch (error) {
      console.error("Failed to set cover:", error);
      // Revert on error
      setSelectedCover(currentCover);
      onCoverChange?.(currentCover);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCover = async () => {
    setIsLoading(true);

    // Optimistic update - remove locally first
    setSelectedCover(null);
    onCoverChange?.(null);
    setOpen(false);

    try {
      const { removeCoverImage } = await import("@/app/actions/cover/actions");
      await removeCoverImage({ pageId });

      // Refresh server component data without full reload
      router.refresh();
    } catch (error) {
      console.error("Failed to remove cover:", error);
      // Revert on error
      setSelectedCover(currentCover);
      onCoverChange?.(currentCover);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-accent"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Choose a cover image</p>
          </TooltipContent>
        </Tooltip>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a cover image</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {currentCover && (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <img
                    src={currentCover}
                    alt="Current cover"
                    className="w-20 h-12 object-cover rounded"
                  />
                  <span className="text-sm text-muted-foreground">
                    Current cover
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveCover}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            )}

            {Object.entries(coverImages).map(([category, images]) => (
              <div key={category} className="space-y-3">
                <h3 className="font-semibold text-lg">{category}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {images.map((imageUrl) => (
                    <button
                      key={imageUrl}
                      onClick={() => handleSetCover(imageUrl)}
                      disabled={isLoading}
                      className="relative group overflow-hidden rounded-lg border-2 border-transparent hover:border-primary transition-all"
                    >
                      <img
                        src={imageUrl}
                        alt={category}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          Select
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
