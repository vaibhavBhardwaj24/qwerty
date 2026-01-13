"use client";

import { VersionHistoryPanel } from "@/components/version-history/VersionHistoryPanel";

import { useEffect, useRef, useState } from "react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import * as Y from "yjs";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import Collaboration from "@tiptap/extension-collaboration";
import { Mention } from "@tiptap/extension-mention";

// --- Custom Extensions ---
import { SlashCommand } from "@/components/tiptap-extensions/slash-command";
import { DollarCommand } from "@/components/tiptap-extensions/dollar-command";
import suggestion from "@/components/tiptap-extensions/suggestion";
import aiSuggestion from "@/components/tiptap-extensions/ai-suggestion";
import { TaskTable } from "@/components/tiptap-node/task-table/TaskTable";
import { createMentionSuggestion } from "./mention-suggestion";
import { deleteMention } from "@/app/actions";

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "@/components/tiptap-node/table-node/table-node.scss";
import "@/components/tiptap-extensions/slash-command.scss";
import "@/components/tiptap-ui/drag-handle.scss";
import "@/components/editor/mention.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover";
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";
import {
  TableButton,
  TableControls,
} from "@/components/tiptap-ui/table-button";

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@/components/tiptap-icons/link-icon";
import { Wifi, WifiOff, Loader2, CloudUpload } from "lucide-react";

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";
import { useWindowSize } from "@/hooks/use-window-size";
import { useCursorVisibility } from "@/hooks/use-cursor-visibility";
import { useCollaboration } from "@/hooks/useCollaboration";

// --- Components ---
import { ThemeToggle } from "@/components/tiptap-templates/simple/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";
import { createYjsProvider, destroyProvider } from "@/lib/yjs-provider";

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss";

// --- Hocuspocus ---
import { HocuspocusProvider } from "@hocuspocus/provider";
import { PageHeader } from "./PageHeader";

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  status,
  isSynced,
  activeUsers,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
  status: "connecting" | "connected" | "disconnected";
  isSynced: boolean;
  activeUsers: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}) => {
  return (
    <>
      {/* Connection Status & Active Users */}
      <ToolbarGroup>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 px-2 cursor-default">
                {status === "connected" ? (
                  isSynced ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <CloudUpload className="w-4 h-4 text-blue-500 animate-pulse" />
                  )
                ) : status === "connecting" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {status === "connected"
                  ? isSynced
                    ? "All changes saved"
                    : "Saving changes..."
                  : status === "connecting"
                  ? "Connecting to server..."
                  : "Disconnected from server"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {activeUsers.length > 0 && (
          <>
            <ToolbarSeparator />
            <div className="flex items-center gap-2 px-2">
              <span className="text-xs text-muted-foreground">
                {activeUsers.length}
              </span>
              <div className="flex -space-x-2">
                {activeUsers.slice(0, 3).map((user) => (
                  <Avatar
                    key={user.id}
                    className="w-6 h-6 border-2 border-background"
                    style={{ borderColor: user.color }}
                  >
                    <AvatarFallback
                      style={{
                        backgroundColor: user.color + "20",
                        color: user.color,
                        fontSize: "0.625rem",
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {activeUsers.length > 3 && (
                  <Avatar className="w-6 h-6 border-2 border-background">
                    <AvatarFallback style={{ fontSize: "0.625rem" }}>
                      +{activeUsers.length - 3}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          </>
        )}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
        <TableButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TableControls />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

interface CollaborativeEditorProps {
  pageId: string;
  userId: string;
  userName: string;
  userColor?: string;
  token: string;
  initialTitle: string;
  initialIcon: string | null;
  isEditable: boolean;
  workspaceId: string;
  cover: string | null;
}

export function CollaborativeEditor({
  pageId,
  userId,
  userName,
  userColor = "#" + Math.floor(Math.random() * 16777215).toString(16),
  token,
  initialTitle,
  initialIcon,
  isEditable,
  workspaceId,
  cover,
}: CollaborativeEditorProps) {
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);

  // Initialize Yjs provider
  useEffect(() => {
    const { ydoc: doc, provider: prov } = createYjsProvider({
      pageId,
      userId,
      userName,
      userColor,
      token,
    });

    // Set user info on provider awareness
    prov.awareness?.setLocalStateField("user", {
      name: userName,
      color: userColor,
    });

    setYdoc(doc);
    setProvider(prov);

    return () => {
      destroyProvider(prov);
    };
  }, [pageId, userId, userName, userColor, token]);

  // Track collaboration state
  const { status, isSynced, activeUsers } = useCollaboration(provider);

  // Show loading state while connecting
  if (!ydoc || !provider) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          Connecting to collaboration server...
        </div>
      </div>
    );
  }

  // Render the inner editor component only when ydoc and provider are ready
  return (
    <CollaborativeEditorInner
      ydoc={ydoc}
      provider={provider}
      status={status}
      isSynced={isSynced}
      activeUsers={activeUsers}
      userId={userId}
      userName={userName}
      userColor={userColor}
      initialTitle={initialTitle}
      initialIcon={initialIcon}
      isEditable={isEditable}
      pageId={pageId}
      workspaceId={workspaceId}
      cover={cover}
    />
  );
}

interface CollaborativeEditorInnerProps {
  ydoc: Y.Doc;
  provider: HocuspocusProvider;
  status: "connecting" | "connected" | "disconnected";
  isSynced: boolean;
  activeUsers: any[];
  userId: string;
  userName: string;
  userColor: string;
  pageId: string;
  initialTitle: string;
  initialIcon: string | null;
  isEditable: boolean;
  workspaceId: string;
  cover: string | null;
}

function CollaborativeEditorInner({
  ydoc,
  status,
  isSynced,
  activeUsers,
  pageId,
  initialTitle,
  initialIcon,
  isEditable,
  workspaceId,
  cover,
}: CollaborativeEditorInnerProps) {
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const isMobile = useIsBreakpoint();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main"
  );
  const toolbarRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        // The history extension is not compatible with collaboration
        // history: false,
        horizontalRule: false,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      // Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      SlashCommand.configure({
        suggestion: (() => {
          console.log("Configuring SlashCommand with pageId:", pageId);
          return suggestion(pageId);
        })(),
      }),
      DollarCommand.configure({
        suggestion: aiSuggestion(),
      }),
      Mention.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            mentionId: {
              default: null,
              parseHTML: (element) => element.getAttribute("data-mention-id"),
              renderHTML: (attributes) => {
                if (!attributes.mentionId) {
                  return {};
                }
                return {
                  "data-mention-id": attributes.mentionId,
                };
              },
            },
          };
        },
      }).configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: createMentionSuggestion(workspaceId, pageId),
      }),
      TaskTable,
    ],
  });

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  // Track mention deletions
  useEffect(() => {
    if (!editor) return;

    // Store current mentions
    const previousMentions = new Set<string>();
    editor.state.doc.descendants((node) => {
      if (node.type.name === "mention" && node.attrs.mentionId) {
        previousMentions.add(node.attrs.mentionId);
      }
    });

    const handleUpdate = () => {
      const currentMentions = new Set<string>();
      editor.state.doc.descendants((node) => {
        if (node.type.name === "mention" && node.attrs.mentionId) {
          currentMentions.add(node.attrs.mentionId);
        }
      });

      // Find deleted mentions
      previousMentions.forEach((mentionId) => {
        if (!currentMentions.has(mentionId)) {
          // Mention was deleted, remove from database
          deleteMention(mentionId).catch((error) => {
            console.error("Failed to delete mention from database:", error);
          });
        }
      });

      // Update the set for next comparison
      previousMentions.clear();
      currentMentions.forEach((id) => previousMentions.add(id));
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor]);

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  // Keyboard shortcut for version history (Ctrl+Shift+H)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "H") {
        e.preventDefault();
        setVersionHistoryOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Initializing editor...</div>
      </div>
    );
  }

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        {cover && (
          <img
            src={cover}
            alt=""
            className="h-[250px] w-full object-cover mb-2 "
          />
        )}
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
          }}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
              status={status}
              isSynced={isSynced}
              activeUsers={activeUsers}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>
        <PageHeader
          pageId={pageId}
          initialTitle={initialTitle}
          initialIcon={initialIcon}
          isEditable={isEditable}
          ydoc={ydoc}
          onVersionHistoryClick={() => setVersionHistoryOpen(true)}
        />
        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />

        {/* Version History Panel */}
        <VersionHistoryPanel
          pageId={pageId}
          isOpen={versionHistoryOpen}
          onClose={() => setVersionHistoryOpen(false)}
          onRestore={() => {
            // Optionally refresh the page or show a success message
            window.location.reload();
          }}
        />
      </EditorContext.Provider>
    </div>
  );
}
