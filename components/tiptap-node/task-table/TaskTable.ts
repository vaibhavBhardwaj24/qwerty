// extensions/TaskTable.ts
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { TaskTableView } from "./TaskTableView";

export const TaskTable = Node.create({
  name: "taskTable",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      rows: {
        default: [],
      },
      pageId: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-task-table]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-task-table": "" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TaskTableView);
  },
});
