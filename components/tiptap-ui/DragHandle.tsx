"use client";

import { Editor } from "@tiptap/react";
import { useEffect, useState, useRef } from "react";
import { GripVertical } from "lucide-react";

interface DragHandleProps {
  editor: Editor;
}

export function DragHandle({ editor }: DragHandleProps) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [currentBlock, setCurrentBlock] = useState<HTMLElement | null>(null);
  const draggedPosRef = useRef<number | null>(null);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const editorElement = editor.view.dom as HTMLElement;
    let hideTimeout: NodeJS.Timeout | null = null;

    const handleMouseMove = (e: Event) => {
      const mouseEvent = e as unknown as MouseEvent;
      const target = mouseEvent.target as HTMLElement;

      // Clear any pending hide timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }

      // Check if we're inside the ProseMirror element
      if (!editorElement.contains(target)) {
        // Delay hiding by 1000ms
        hideTimeout = setTimeout(() => {
          setShow(false);
        }, 1000);
        return;
      }

      // Find the block element - direct child of ProseMirror
      let blockElement: HTMLElement | null = null;
      let current = target;

      while (current && current !== editorElement) {
        if (current.parentElement === editorElement) {
          blockElement = current;
          break;
        }
        current = current.parentElement as HTMLElement;
      }

      if (!blockElement) {
        return; // Don't hide, just don't update
      }

      const blockRect = blockElement.getBoundingClientRect();

      // Calculate left position - ensure it's at least 4px from left edge
      const leftPos = Math.max(4, blockRect.left - 32);

      const newPosition = {
        top: blockRect.top + window.scrollY,
        left: leftPos + window.scrollX,
      };

      // Position using viewport coordinates
      setPosition(newPosition);
      setCurrentBlock(blockElement);
      setShow(true);
    };

    const handleMouseLeave = () => {
      // Delay hiding by 1000ms
      hideTimeout = setTimeout(() => {
        setShow(false);
      }, 1000);
    };

    editorElement.addEventListener("mousemove", handleMouseMove);
    editorElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      editorElement.removeEventListener("mousemove", handleMouseMove);
      editorElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [editor]);

  const handleDragStart = (e: React.DragEvent) => {
    if (!currentBlock || !editor) return;

    // Find the position of the current block in the document
    const pos = editor.view.posAtDOM(currentBlock, 0);
    draggedPosRef.current = pos;

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", currentBlock.innerHTML);

    // Add visual feedback
    currentBlock.style.opacity = "0.4";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (currentBlock) {
      currentBlock.style.opacity = "1";
    }
    draggedPosRef.current = null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!editor || draggedPosRef.current === null || !currentBlock) return;

    const dropTarget = e.target as HTMLElement;
    const editorElement = editor.view.dom as HTMLElement;

    // Find the block element where we're dropping
    let targetBlock: HTMLElement | null = null;
    let current = dropTarget;

    while (current && current !== editorElement) {
      if (current.parentElement === editorElement) {
        targetBlock = current;
        break;
      }
      current = current.parentElement as HTMLElement;
    }

    if (!targetBlock || targetBlock === currentBlock) {
      if (currentBlock) {
        currentBlock.style.opacity = "1";
      }
      return;
    }

    try {
      const targetPos = editor.view.posAtDOM(targetBlock, 0);
      const draggedPos = draggedPosRef.current;

      // Get the node at the dragged position
      const $pos = editor.state.doc.resolve(draggedPos);
      const node = $pos.nodeAfter;

      if (!node) return;

      const nodeSize = node.nodeSize;

      // Calculate insert position
      let insertPos = targetPos;

      // If dragging down, insert after the target
      if (draggedPos < targetPos) {
        insertPos = targetPos;
      }

      // Create a transaction to move the node
      const tr = editor.state.tr;

      // First, insert the node at the new position
      tr.insert(insertPos, node);

      // Then delete from the old position
      // Adjust the delete position if we inserted before it
      const deletePos =
        insertPos <= draggedPos ? draggedPos + nodeSize : draggedPos;
      tr.delete(deletePos, deletePos + nodeSize);

      // Apply the transaction
      editor.view.dispatch(tr);
    } catch (error) {
      console.error("Error moving block:", error);
    } finally {
      if (currentBlock) {
        currentBlock.style.opacity = "1";
      }
      draggedPosRef.current = null;
    }
  };

  if (!show) return null;

  return (
    <div
      className="drag-handle-floating"
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 50,
      }}
      contentEditable={false}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => {
        setTimeout(() => setShow(false), 1000);
      }}
    >
      <div className="flex h-6 w-6 cursor-grab items-center justify-center rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 active:cursor-grabbing transition-colors">
        <GripVertical className="h-4 w-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" />
      </div>
    </div>
  );
}
