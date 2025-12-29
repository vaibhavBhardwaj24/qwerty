"use client";

import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export function DraggableBlockView({ node }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: node.attrs.id || `block-${Math.random()}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <NodeViewWrapper
      ref={setNodeRef}
      style={style}
      className="group relative my-1"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="drag-handle-button mt-1 cursor-grab opacity-0 transition-opacity hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded p-1 group-hover:opacity-100"
          contentEditable={false}
        >
          <GripVertical className="h-4 w-4 text-neutral-400" />
        </button>
        <div className="flex-1">
          <NodeViewContent />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
