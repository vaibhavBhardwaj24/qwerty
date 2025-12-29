"use client";

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export default function Page() {
  const [editorContent, setEditorContent] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (editorContent) {
      navigator.clipboard.writeText(JSON.stringify(editorContent, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Editor Section */}
      <div className="flex-1 overflow-auto">
        <SimpleEditor onUpdate={setEditorContent} />
      </div>

      {/* JSON Output Section */}
      {/* <div className="w-[500px] border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            JSON Output
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono">
            {editorContent
              ? JSON.stringify(editorContent, null, 2)
              : "Start typing to see JSON output..."}
          </pre>
        </div>
      </div> */}
    </div>
  );
}
