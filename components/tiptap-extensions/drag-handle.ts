import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const DragHandle = Extension.create({
  name: "dragHandle",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("dragHandle"),
        props: {
          decorations(state) {
            const { doc, selection } = state;
            const decorations: Decoration[] = [];

            doc.descendants((node, pos) => {
              if (
                node.isBlock &&
                node.type.name !== "doc" &&
                node.type.name !== "text"
              ) {
                const decoration = Decoration.widget(
                  pos,
                  () => {
                    const handle = document.createElement("div");
                    handle.className = "drag-handle";
                    handle.contentEditable = "false";
                    handle.draggable = true;
                    handle.innerHTML = `
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="9" cy="5" r="1"/>
                        <circle cx="9" cy="12" r="1"/>
                        <circle cx="9" cy="19" r="1"/>
                        <circle cx="15" cy="5" r="1"/>
                        <circle cx="15" cy="12" r="1"/>
                        <circle cx="15" cy="19" r="1"/>
                      </svg>
                    `;

                    handle.addEventListener("dragstart", (e) => {
                      e.dataTransfer!.effectAllowed = "move";
                      e.dataTransfer!.setData("text/html", node.textContent);
                      
                      const view = (this as any).editor.view;
                      const slice = view.state.doc.slice(pos, pos + node.nodeSize);
                      const { dom, text } = view.someProp("clipboardSerializer") || {};
                      
                      if (dom) {
                        e.dataTransfer!.setData("text/html", dom);
                      }
                      
                      // Store the position for later
                      (handle as any).dragStartPos = pos;
                    });

                    return handle;
                  },
                  {
                    side: -1,
                    key: `drag-handle-${pos}`,
                  }
                );

                decorations.push(decoration);
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});
