"use client";

import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import { CommandMenu } from "./CommandList";
import {
  Code,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Kanban,
  ListOrdered,
  ListTodo,
  LucideList,
  Quote,
  Ruler,
  TableIcon,
} from "lucide-react";

export default function createSuggestion(pageId?: string) {
  console.log("createSuggestion called with pageId:", pageId);
  return {
    items: ({ query }: { query: string }) => {
      const capturedPageId = pageId; // Capture pageId in closure
      console.log("Items function - capturedPageId:", capturedPageId);
      return [
        {
          title: "Heading 1",
          command: ({ editor, range }: any) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .setNode("heading", { level: 1 })
              .run();
          },
          icon: <Heading1Icon />,
        },
        {
          title: "Heading 2",
          command: ({ editor, range }: any) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .setNode("heading", { level: 2 })
              .run();
          },
          icon: <Heading2Icon />,
        },
        {
          title: "Heading 3",
          command: ({ editor, range }: any) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .setNode("heading", { level: 3 })
              .run();
          },
          icon: <Heading3Icon />,
        },
        {
          title: "Bullet List",
          command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
          },
          icon: <LucideList />,
        },
        {
          title: "Numbered List",
          command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run();
          },
          icon: <ListOrdered />,
        },
        {
          title: "Task List",
          command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).toggleTaskList().run();
          },
          icon: <ListTodo />,
        },
        {
          title: "Blockquote",
          command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).toggleBlockquote().run();
          },
          icon: <Quote />,
        },
        {
          title: "Code Block",
          command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
          },
          icon: <Code />,
        },
        {
          title: "Table",
          command: ({ editor, range }: any) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run();
          },
          icon: <TableIcon />,
        },
        {
          title: "Kanban Board",
          command: ({ editor, range }: any) => {
            console.log(
              "Creating task table with capturedPageId:",
              capturedPageId
            );
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertContent({
                type: "taskTable",
                attrs: { pageId: capturedPageId || "" },
              })
              .run();
          },
          icon: <Kanban />,
        },
        {
          title: "Divider",
          command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).setHorizontalRule().run();
          },
          icon: <Ruler />,
        },
      ].filter((item) =>
        item.title.toLowerCase().startsWith(query.toLowerCase())
      );
    },

    render: () => {
      let component: any;
      let popup: any;

      return {
        onStart: (props: any) => {
          component = new ReactRenderer(CommandMenu, {
            props,
            editor: props.editor,
          });

          if (!props.clientRect) {
            return;
          }

          popup = tippy("body", {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
          });
        },

        onUpdate(props: any) {
          component.updateProps(props);

          if (!props.clientRect) {
            return;
          }

          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          });
        },

        onKeyDown(props: any) {
          if (props.event.key === "Escape") {
            popup[0].hide();
            return true;
          }

          return component.ref?.onKeyDown(props);
        },

        onExit() {
          popup[0].destroy();
          component.destroy();
        },
      };
    },
  };
}
