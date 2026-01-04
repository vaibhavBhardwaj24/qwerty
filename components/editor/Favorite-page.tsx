"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FavoritePageProps {
  pageId: string;
  initialIsFavorite: boolean;
}

export default function FavoritePage({
  pageId,
  initialIsFavorite,
}: FavoritePageProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFavorite = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const previousState = isFavorite;

    // Optimistic update
    setIsFavorite(!isFavorite);

    try {
      if (isFavorite) {
        // Unfavorite
        const { unfavoritePage } = await import("@/app/actions/page/actions");
        const result = await unfavoritePage({ pageId });

        if (!result.success) {
          throw new Error(result.error);
        }
      } else {
        // Favorite
        const { favoritePage } = await import("@/app/actions/page/actions");
        const result = await favoritePage({ pageId });

        if (!result.success) {
          throw new Error(result.error);
        }
      }

      // Refresh server component data
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      // Revert on error
      setIsFavorite(previousState);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleToggleFavorite}
            disabled={isLoading}
            className="group relative p-2 rounded-lg hover:bg-accent transition-all duration-200 disabled:opacity-50"
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Star
              className={`w-5 h-5 transition-all duration-300 ${
                isFavorite
                  ? "fill-yellow-400 text-yellow-400 scale-110"
                  : "text-muted-foreground group-hover:text-yellow-400 group-hover:scale-110"
              } ${isLoading ? "animate-pulse" : ""}`}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isFavorite ? "Remove from favorites" : "Add to favorites"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
