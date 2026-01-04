import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";

interface YjsProviderOptions {
  pageId: string;
  userId: string;
  userName: string;
  userColor: string;
  token: string;
}

/**
 * Create a Yjs provider for collaborative editing using Hocuspocus
 */
export function createYjsProvider(options: YjsProviderOptions): {
  ydoc: Y.Doc;
  provider: HocuspocusProvider;
} {
  const { pageId, userId, userName, userColor, token } = options;

  // Create Yjs document
  const ydoc = new Y.Doc();

  // WebSocket URL from environment
  const baseUrl =
    process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:1234";

  // Append parameters to URL as Hocuspocus server expects them in query string
  const url = new URL(baseUrl);
  url.searchParams.append("token", token);
  url.searchParams.append("userId", userId);
  url.searchParams.append("userName", userName);
  url.searchParams.append("userColor", userColor);

  // Create Hocuspocus provider
  const provider = new HocuspocusProvider({
    url: url.toString(),
    name: `page:${pageId}`,
    document: ydoc,
    onStatus: (event) => {
      console.log("WebSocket status:", event.status);
    },
    onSynced: () => {
      console.log("Document synced");
    },
  });

  return { ydoc, provider };
}

/**
 * Disconnect and cleanup provider
 */
export function destroyProvider(provider: HocuspocusProvider): void {
  provider.disconnect();
  provider.destroy();
}
