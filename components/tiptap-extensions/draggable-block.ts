import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { DraggableBlockView } from "./DraggableBlockView";

export const DraggableBlock = Node.create({
  name: "draggableBlock",
  group: "block",
  content: "block+",
  draggable: true,

  parseHTML() {
    return [
      {
        tag: "div[data-draggable-block]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { ...HTMLAttributes, "data-draggable-block": "" }, 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DraggableBlockView);
  },
});
