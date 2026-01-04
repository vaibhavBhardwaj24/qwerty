"use client";

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

interface EditorPresenceProps {
  status: "connecting" | "connected" | "disconnected";
  isSynced: boolean;
  activeUsers: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

export function EditorPresence({
  status,
  isSynced,
  activeUsers,
}: EditorPresenceProps) {
  return (
    <div className="flex items-center gap-4 px-4 py-2 border-b bg-background">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {status === "connected" ? (
          <>
            <Wifi className="w-4 h-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              {isSynced ? "Synced" : "Syncing..."}
            </span>
          </>
        ) : status === "connecting" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
            <span className="text-sm text-muted-foreground">Connecting...</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-500" />
            <span className="text-sm text-muted-foreground">Disconnected</span>
          </>
        )}
      </div>

      {/* Active Users */}
      {activeUsers.length > 0 && (
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-muted-foreground">
            {activeUsers.length} {activeUsers.length === 1 ? "user" : "users"}{" "}
            editing
          </span>
          <div className="flex -space-x-2">
            {activeUsers.slice(0, 5).map((user) => (
              <Avatar
                key={user.id}
                className="w-8 h-8 border-2 border-background"
                style={{ borderColor: user.color }}
              >
                <AvatarFallback
                  style={{
                    backgroundColor: user.color + "20",
                    color: user.color,
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {activeUsers.length > 5 && (
              <Avatar className="w-8 h-8 border-2 border-background">
                <AvatarFallback>+{activeUsers.length - 5}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
