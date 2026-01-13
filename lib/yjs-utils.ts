import * as Y from "yjs";

/**
 * Deserialize a Yjs snapshot from a Buffer to a Y.Doc
 * The snapshot worker stores raw binary data (already decoded from base64)
 */
export function deserializeYjsSnapshot(buffer: Buffer): Y.Doc {
  const ydoc = new Y.Doc();

  try {
    // Prisma returns Uint8Array for Bytes fields
    // The data is already raw binary (decoded by snapshot worker before storage)
    const state = new Uint8Array(buffer);

    Y.applyUpdate(ydoc, state);
    return ydoc;
  } catch (error) {
    console.error("Failed to deserialize Yjs snapshot:", error);
    console.error("Buffer length:", buffer.length);
    console.error("First 20 bytes:", Array.from(buffer.slice(0, 20)));
    throw error;
  }
}

/**
 * Apply a snapshot to an existing Y.Doc
 */
export function applyYjsSnapshot(ydoc: Y.Doc, buffer: Buffer): void {
  const state = new Uint8Array(buffer);
  Y.applyUpdate(ydoc, state);
}

/**
 * Get a simple text preview from Y.Doc
 * This is a simplified version that doesn't try to parse the full structure
 */
export function yjsDocToText(ydoc: Y.Doc): string {
  try {
    // Try to get the prosemirror document
    const fragment = ydoc.getXmlFragment("default");
    if (!fragment || fragment.length === 0) {
      return "[Empty document]";
    }

    // Simple text extraction
    let text = "";
    fragment.forEach((item) => {
      if (item instanceof Y.XmlText) {
        text += item.toString() + " ";
      } else if (item instanceof Y.XmlElement) {
        // Recursively extract text from elements
        const extractText = (el: Y.XmlElement): string => {
          let result = "";
          el.forEach((child) => {
            if (child instanceof Y.XmlText) {
              result += child.toString() + " ";
            } else if (child instanceof Y.XmlElement) {
              result += extractText(child);
            }
          });
          return result;
        };
        text += extractText(item);
      }
    });

    return text.trim() || "[No text content]";
  } catch (error) {
    console.error("Error extracting text from Y.Doc:", error);
    return "[Error reading content]";
  }
}

/**
 * Compare two Y.Doc snapshots and return diff information
 */
export function diffYjsSnapshots(
  snapshot1: Buffer,
  snapshot2: Buffer
): {
  added: number;
  removed: number;
  modified: number;
} {
  const doc1 = deserializeYjsSnapshot(snapshot1);
  const doc2 = deserializeYjsSnapshot(snapshot2);

  const text1 = yjsDocToText(doc1);
  const text2 = yjsDocToText(doc2);

  // Simple character-based diff
  const len1 = text1.length;
  const len2 = text2.length;

  return {
    added: Math.max(0, len2 - len1),
    removed: Math.max(0, len1 - len2),
    modified: Math.min(len1, len2),
  };
}

/**
 * Create a snapshot from current Y.Doc state
 */
export function createYjsSnapshot(ydoc: Y.Doc): Buffer {
  const state = Y.encodeStateAsUpdate(ydoc);
  return Buffer.from(state);
}
