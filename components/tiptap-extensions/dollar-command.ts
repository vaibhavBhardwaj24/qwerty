import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { PluginKey } from "@tiptap/pm/state";

export const DollarCommand = Extension.create({
  name: "dollarCommand",

  addOptions() {
    return {
      suggestion: {
        char: "$",
        pluginKey: new PluginKey("dollarSuggestion"),
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
