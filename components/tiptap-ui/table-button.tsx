"use client";

import { useCurrentEditor } from "@tiptap/react";
import { Button } from "@/components/tiptap-ui-primitive/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, Columns3, Rows3, Trash2, ChevronDown } from "lucide-react";

export function TableButton() {
  const { editor } = useCurrentEditor();

  if (!editor) return null;

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <Button
      data-style="ghost"
      onClick={insertTable}
      aria-label="Insert table"
      title="Insert table"
    >
      <Table className="tiptap-button-icon" />
    </Button>
  );
}

export function TableControls() {
  const { editor } = useCurrentEditor();

  if (!editor) return null;

  const isTableActive = editor.isActive("table");

  if (!isTableActive) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          data-style="ghost"
          aria-label="Table options"
          title="Table options"
        >
          <Table className="tiptap-button-icon h-4 w-4" />
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          className="gap-2"
        >
          <Columns3 className="h-4 w-4" />
          Insert column left
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          className="gap-2"
        >
          <Columns3 className="h-4 w-4" />
          Insert column right
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().deleteColumn().run()}
          className="gap-2 text-red-600 dark:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
          Delete column
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => editor.chain().focus().addRowBefore().run()}
          className="gap-2"
        >
          <Rows3 className="h-4 w-4" />
          Insert row above
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().addRowAfter().run()}
          className="gap-2"
        >
          <Rows3 className="h-4 w-4" />
          Insert row below
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().deleteRow().run()}
          className="gap-2 text-red-600 dark:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
          Delete row
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => editor.chain().focus().deleteTable().run()}
          className="gap-2 text-red-600 dark:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
          Delete table
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
