import { useState, useEffect } from "react";
import { HocuspocusProvider } from "@hocuspocus/provider";

export interface CollaborationState {
  status: "connecting" | "connected" | "disconnected";
  isSynced: boolean;
  activeUsers: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

/**
 * React hook for tracking collaboration state
 */
export function useCollaboration(
  provider: HocuspocusProvider | null
): CollaborationState {
  const [status, setStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [isSynced, setIsSynced] = useState(false);
  const [activeUsers, setActiveUsers] = useState<
    Array<{ id: string; name: string; color: string }>
  >([]);

  useEffect(() => {
    if (!provider) return;

    const handleStatus = (event: { status: string }) => {
      setStatus(event.status as "connecting" | "connected" | "disconnected");
    };

    const handleSynced = () => {
      setIsSynced(true);
    };

    const handleAwareness = () => {
      const awareness = provider.awareness;
      if (!awareness) return;

      const states = Array.from(awareness.getStates().entries());

      const users = states
        .filter(([clientId]) => clientId !== awareness.clientID)
        .map(([, state]) => ({
          id: (state as any).user?.id || "unknown",
          name: (state as any).user?.name || "Anonymous",
          color: (state as any).user?.color || "#000000",
        }));

      setActiveUsers(users);
    };

    provider.on("status", handleStatus);
    provider.on("synced", handleSynced);
    provider.awareness?.on("change", handleAwareness);

    // Initial awareness update
    handleAwareness();

    return () => {
      provider.off("status", handleStatus);
      provider.off("synced", handleSynced);
      provider.awareness?.off("change", handleAwareness);
    };
  }, [provider]);

  return {
    status,
    isSynced,
    activeUsers,
  };
}
