import { ReactRenderer } from "@tiptap/react";
import tippy, { Instance as TippyInstance } from "tippy.js";
import { MentionList, MentionListRef } from "./MentionList";
import { getWorkspaceMembers, createMention } from "@/app/actions";

export function createMentionSuggestion(workspaceId: string, pageId: string) {
  return {
    items: async ({ query }: { query: string }) => {
      const result = await getWorkspaceMembers(workspaceId);

      if (!result.success || !result.data) {
        return [];
      }

      return result.data
        .filter((member) =>
          member.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5);
    },

    render: () => {
      let component: ReactRenderer<MentionListRef> | null = null;
      let popup: TippyInstance[] | null = null;

      return {
        onStart: (props: any) => {
          component = new ReactRenderer(MentionList, {
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
          component?.updateProps(props);

          if (!props.clientRect) {
            return;
          }

          popup?.[0]?.setProps({
            getReferenceClientRect: props.clientRect,
          });
        },

        onKeyDown(props: any) {
          if (props.event.key === "Escape") {
            popup?.[0]?.hide();
            return true;
          }

          return component?.ref?.onKeyDown(props) ?? false;
        },

        onExit() {
          popup?.[0]?.destroy();
          component?.destroy();
        },
      };
    },

    command: async ({ editor, range, props }: any) => {
      // Save mention to database first to get the ID
      const result = await createMention({
        userId: props.userId,
        pageId,
      });

      // Get the mention ID from the result
      const mentionId = result.success && result.data ? result.data.id : null;

      // Insert mention node with the database ID
      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          {
            type: "mention",
            attrs: {
              id: props.userId,
              label: props.name,
              mentionId: mentionId, // Store the database mention ID
            },
          },
          {
            type: "text",
            text: " ",
          },
        ])
        .run();

      if (!result.success) {
        console.error("Failed to save mention:", result.error);
      }
    },
  };
}
