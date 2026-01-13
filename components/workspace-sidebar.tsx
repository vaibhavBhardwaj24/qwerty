"use client";

import { useState, useEffect } from "react";
import { SearchDialog } from "@/components/search-dialog";
import { useClerk } from "@clerk/nextjs";
import {
  ChevronDown,
  ChevronRight,
  Settings,
  LogOut,
  Mail,
  Plus,
  ChevronLeft,
  Home,
  Search,
  Loader2,
  Star,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useMounted } from "@/hooks/use-mounted";
import { CreatePageDialog } from "@/components/create-page-dialog";

interface Page {
  id: string;
  name: string;
  icon?: string | null;
}

interface Workspace {
  id: string;
  name: string;
  icon?: string | null;
  userRole: string;
  pages?: Page[];
}

interface FavoritePage {
  pageId: string;
  page: {
    title: string;
    icon: string | null;
    updatedAt: Date;
    workspace: {
      name: string;
    };
  };
}

interface WorkspaceSidebarProps {
  workspaces: Workspace[];
  userName: string;
  userEmail?: string;
  userImage?: string;
  favorites?: FavoritePage[];
}

export function WorkspaceSidebar({
  workspaces,
  userName,
  userEmail = "user@example.com",
  userImage,
  favorites = [],
}: WorkspaceSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(
    new Set(workspaces.map((w) => w.id))
  );
  const [isFavoritesExpanded, setIsFavoritesExpanded] = useState(true);
  const params = useParams();
  const currentWorkspaceId = params?.id as string;
  const router = useRouter();
  const { signOut, openUserProfile } = useClerk();
  const mounted = useMounted();
  const [loadingWorkspaceId, setLoadingWorkspaceId] = useState<string | null>(
    null
  );
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    if (loadingWorkspaceId === currentWorkspaceId) {
      setLoadingWorkspaceId(null);
    }
  }, [currentWorkspaceId, loadingWorkspaceId]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleWorkspace = (workspaceId: string) => {
    const newExpanded = new Set(expandedWorkspaces);
    if (newExpanded.has(workspaceId)) {
      newExpanded.delete(workspaceId);
    } else {
      newExpanded.add(workspaceId);
    }
    setExpandedWorkspaces(newExpanded);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "relative flex h-screen flex-col bg-background border-r border-border",
          "transition-all duration-300 ease-out overflow-hidden",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-12 items-center justify-between px-3 py-2">
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 flex items-center gap-2 px-1",
              isCollapsed ? "w-0 opacity-0" : "w-full opacity-100"
            )}
          >
            <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
              <img
                src="/qwerty.svg"
                alt="Qwerty"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <span className="font-bold text-lg tracking-tight">Qwerty</span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md",
                  "transition-all duration-200 hover:bg-accent",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isCollapsed && "mx-auto"
                )}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {isCollapsed ? "Expand" : "Collapse"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Search & Home Navigation */}
        <div className="px-2 py-2 space-y-1">
          <button
            onClick={() => setSearchOpen(true)}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 rounded-md",
              "text-sm text-muted-foreground hover:text-foreground",
              "hover:bg-accent/50 transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isCollapsed && "justify-center"
            )}
          >
            <Search className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Search</span>}
            {!isCollapsed && (
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            )}
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 rounded-md",
              "text-sm text-muted-foreground hover:text-foreground",
              "hover:bg-accent/50 transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isCollapsed && "justify-center"
            )}
          >
            <Home className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Home</span>}
          </button>
        </div>

        {/* Divider */}
        <div className="px-2">
          <div className="h-px bg-border" />
        </div>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <>
            {!isCollapsed && (
              <div className="px-3 py-2 flex items-center justify-between">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Favorites
                </h2>
                <button
                  onClick={() => setIsFavoritesExpanded(!isFavoritesExpanded)}
                  className="h-5 w-5 flex items-center justify-center hover:bg-accent rounded transition-all duration-200"
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-300",
                      !isFavoritesExpanded && "-rotate-90"
                    )}
                  />
                </button>
              </div>
            )}

            {/* Favorites List */}
            {isFavoritesExpanded && (
              <div className="px-2 pb-2 space-y-0.5">
                {favorites.map((favorite) => (
                  <Tooltip key={favorite.pageId}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded-md",
                          "text-sm text-muted-foreground hover:text-foreground",
                          "hover:bg-accent/50 transition-all duration-200 cursor-pointer",
                          "group",
                          isCollapsed && "justify-center"
                        )}
                        onClick={() => {
                          router.push(`/page/${favorite.pageId}`);
                        }}
                      >
                        <Star className="h-4 w-4 flex-shrink-0 fill-yellow-500 text-yellow-500" />
                        {!isCollapsed && (
                          <>
                            <div className="h-4 w-4 rounded text-muted-foreground flex-shrink-0">
                              {favorite.page.icon}
                            </div>
                            <span className="flex-1 truncate text-xs">
                              {favorite.page.title}
                            </span>
                          </>
                        )}
                      </div>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right" className="text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">
                            {favorite.page.title}
                          </span>
                          <span className="text-muted-foreground">
                            {favorite.page.workspace.name}
                          </span>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            )}

            {/* Divider */}
            <div className="px-2 pb-2">
              <div className="h-px bg-border" />
            </div>
          </>
        )}

        {/* Workspaces Header */}
        {!isCollapsed && (
          <div className="px-3 py-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Workspaces
            </h2>
          </div>
        )}

        {/* Workspaces List */}
        <div
          className={cn(
            "flex-1 overflow-y-auto px-2 py-2 space-y-1",
            "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
          )}
        >
          {workspaces.map((workspace) => {
            const isExpanded = expandedWorkspaces.has(workspace.id);
            const initial = workspace.name.charAt(0).toUpperCase();
            const isActive = workspace.id === currentWorkspaceId;

            return (
              <div key={workspace.id} className="space-y-0.5">
                {/* Workspace Item */}
                <div
                  className={cn(
                    "group flex items-center gap-2 rounded-md px-2 py-1.5",
                    "transition-all duration-200 hover:bg-accent/50",
                    isActive && "bg-accent"
                  )}
                >
                  <button
                    onClick={() => {
                      if (workspace.id !== currentWorkspaceId) {
                        setLoadingWorkspaceId(workspace.id);
                        router.push(`/workspace/${workspace.id}`);
                      }
                    }}
                    className={cn(
                      "flex-1 flex items-center gap-2 min-w-0 text-left",
                      isCollapsed && "flex-col"
                    )}
                  >
                    <div
                      className={cn(
                        "flex-shrink-0 flex items-center justify-center rounded transition-all duration-200",
                        !workspace.icon &&
                          !loadingWorkspaceId &&
                          "bg-gradient-to-br from-blue-400 to-blue-600 text-white",
                        isCollapsed ? "h-6 w-6 text-xs" : "h-6 w-6 text-sm"
                      )}
                    >
                      {loadingWorkspaceId === workspace.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        workspace.icon || initial
                      )}
                    </div>
                    <div
                      className={cn(
                        "flex-1 min-w-0 transition-all duration-300 overflow-hidden",
                        isCollapsed ? "opacity-0 h-0" : "opacity-100 h-auto"
                      )}
                    >
                      <p className="text-sm font-medium text-foreground truncate">
                        {workspace.name}
                      </p>
                    </div>
                  </button>
                  {!isCollapsed && (
                    <CreatePageDialog workspaceId={workspace.id}>
                      <button className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-5 w-5 flex items-center justify-center hover:bg-accent rounded">
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </CreatePageDialog>
                  )}{" "}
                  {!isCollapsed &&
                    workspace.pages &&
                    workspace.pages.length > 0 && (
                      <button
                        onClick={() => toggleWorkspace(workspace.id)}
                        className="flex-shrink-0 h-5 w-5 flex items-center justify-center hover:bg-accent rounded transition-all duration-200"
                      >
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-300",
                            !isExpanded && "-rotate-90"
                          )}
                        />
                      </button>
                    )}
                </div>

                {/* Pages */}
                {!isCollapsed &&
                  isExpanded &&
                  workspace.pages &&
                  workspace.pages.length > 0 && (
                    <div className="space-y-0.5 ml-6 overflow-hidden">
                      {workspace.pages.map((page) => (
                        <div
                          key={page.id}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-md",
                            "text-sm text-muted-foreground hover:text-foreground",
                            "hover:bg-accent/50 transition-all duration-200 cursor-pointer",
                            "group"
                          )}
                          onClick={() => {
                            router.push(`/page/${page.id}`);
                          }}
                        >
                          <div className="h-4 w-4 rounded text-muted-foreground">
                            {page.icon}
                          </div>
                          <span className="flex-1 truncate text-xs">
                            {page.name}
                          </span>
                          {/* <button className="opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4 flex items-center justify-center hover:bg-accent rounded text-muted-foreground text-xs">
                            ⋮
                          </button> */}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border bg-background">
          {/* Settings */}
          {!isCollapsed && (
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200">
              <Settings className="h-4 w-4 flex-shrink-0" />
              <span>workspace settings</span>
            </button>
          )}

          {/* Profile & Dropdown */}
          <div className="px-2 py-2">
            {mounted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-2 rounded-md",
                      "hover:bg-accent/50 transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={userImage} alt={userName} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs font-semibold">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "flex-1 min-w-0 transition-all duration-300 text-left",
                        isCollapsed ? "opacity-0 h-0 hidden" : "opacity-100"
                      )}
                    >
                      <p className="text-sm font-medium text-foreground truncate">
                        {userName}
                      </p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase">
                    Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <div className="px-2 py-2">
                    <p className="text-sm font-medium text-foreground">
                      {userName}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{userEmail}</span>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="text-sm cursor-pointer"
                    onClick={() => openUserProfile()}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="text-sm text-red-600  hover:bg-red-500/40 cursor-pointer focus:bg-red-500/40"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </aside>

      {/* Search Dialog */}
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        workspaces={workspaces}
      />
    </TooltipProvider>
  );
}
