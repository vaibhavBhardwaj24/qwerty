"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileText } from "lucide-react";

interface Page {
  id: string;
  name: string;
  icon?: string | null;
}

interface Workspace {
  id: string;
  name: string;
  icon?: string | null;
  pages?: Page[];
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaces: Workspace[];
}

export function SearchDialog({
  open,
  onOpenChange,
  workspaces,
}: SearchDialogProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Fuzzy matching function
  const fuzzyMatch = (text: string, query: string): boolean => {
    if (!query) return true;

    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();

    // Direct substring match
    if (textLower.includes(queryLower)) return true;

    // Match individual words
    const words = textLower.split(/\s+/);
    return words.some((word) => word.startsWith(queryLower));
  };

  // Filter and group results
  const searchResults = useMemo(() => {
    if (!search.trim()) {
      // Show all pages when no search query
      return workspaces
        .filter((workspace) => workspace.pages && workspace.pages.length > 0)
        .map((workspace) => ({
          workspace,
          pages: workspace.pages || [],
        }));
    }

    // Filter pages and workspaces based on search
    const results = workspaces
      .map((workspace) => {
        const matchingPages = (workspace.pages || []).filter((page) =>
          fuzzyMatch(page.name, search)
        );

        // Also match workspace name
        const workspaceMatches = fuzzyMatch(workspace.name, search);

        return {
          workspace,
          pages: workspaceMatches ? workspace.pages || [] : matchingPages,
        };
      })
      .filter((result) => result.pages.length > 0);

    return results;
  }, [search, workspaces]);

  const handleSelect = (pageId: string) => {
    router.push(`/page/${pageId}`);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) setSearch("");
      }}
      title="Search Pages"
      description="Search for pages across all workspaces"
    >
      <CommandInput
        placeholder="Search pages and workspaces..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {searchResults.map(({ workspace, pages }) => (
          <CommandGroup key={workspace.id} heading={workspace.name}>
            {pages.map((page) => (
              <CommandItem
                key={page.id}
                value={`${workspace.name}-${page.name}-${page.id}`}
                onSelect={() => handleSelect(page.id)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="h-4 w-4 flex-shrink-0 flex items-center justify-center">
                    {page.icon || (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <span className="flex-1 truncate">{page.name}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {workspace.name}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
