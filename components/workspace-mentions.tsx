"use client";

import { AtSign, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface WorkspaceMention {
  id: string;
  userId: string;
  pageId: string;
  createdAt: Date;
  mentionedUserName: string;
  mentionerName: string;
  page: {
    id: string;
    title: string;
    icon: string | null;
  };
}

interface WorkspaceMentionsProps {
  mentions: WorkspaceMention[];
}

export function WorkspaceMentions({ mentions }: WorkspaceMentionsProps) {
  if (!mentions || mentions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AtSign className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No mentions yet</h3>
          <p className="text-sm text-muted-foreground">
            Mentions will appear here when team members are mentioned in pages
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {mentions.map((mention) => (
            <Link
              key={mention.id}
              href={`/page/${mention.pageId}`}
              className="block"
            >
              <div className="flex items-center justify-between py-2 hover:bg-accent rounded-lg px-3 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {mention.mentionedUserName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {mention.mentionedUserName}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="truncate">
                        mentioned by {mention.mentionerName}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground ml-2 flex-shrink-0">
                  {mention.page.icon && (
                    <span className="text-base">{mention.page.icon}</span>
                  )}
                  {!mention.page.icon && <FileText className="h-3 w-3" />}
                  <span className="truncate max-w-[120px]">
                    {mention.page.title}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
