import { useEffect, useState, useRef } from "react";
import * as Y from "yjs";

interface PageMetadata {
  title: string;
  icon: string;
  cover: string | null;
}

interface UsePageMetadataProps {
  ydoc: Y.Doc | null;
  pageId: string;
  initialTitle: string;
  initialIcon: string;
  initialCover: string | null;
  onSave?: (metadata: Partial<PageMetadata>) => Promise<void>;
}

export function usePageMetadata({
  ydoc,
  pageId,
  initialTitle,
  initialIcon,
  initialCover,
  onSave,
}: UsePageMetadataProps) {
  const [title, setTitle] = useState(initialTitle);
  const [icon, setIcon] = useState(initialIcon);
  const [cover, setCover] = useState<string | null>(initialCover);
  const [isSaving, setIsSaving] = useState(false);

  const metadataMapRef = useRef<Y.Map<any> | null>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLocalUpdateRef = useRef(false);

  // Initialize metadata in Yjs
  useEffect(() => {
    if (!ydoc) return;

    const metadataMap = ydoc.getMap("metadata");
    metadataMapRef.current = metadataMap;

    // Set initial values if not already set
    if (!metadataMap.has("title")) {
      metadataMap.set("title", initialTitle);
    }
    if (!metadataMap.has("icon")) {
      metadataMap.set("icon", initialIcon);
    }
    if (!metadataMap.has("cover")) {
      metadataMap.set("cover", initialCover);
    }

    // Sync local state with Yjs
    setTitle((metadataMap.get("title") as string) || initialTitle);
    setIcon((metadataMap.get("icon") as string) || initialIcon);
    setCover((metadataMap.get("cover") as string | null) || initialCover);

    // Listen for changes from other users
    const observer = () => {
      if (isLocalUpdateRef.current) {
        isLocalUpdateRef.current = false;
        return;
      }

      const newTitle = metadataMap.get("title") as string | undefined;
      const newIcon = metadataMap.get("icon") as string | undefined;
      const newCover = metadataMap.get("cover") as string | null | undefined;

      if (newTitle !== undefined) setTitle(newTitle);
      if (newIcon !== undefined) setIcon(newIcon);
      if (newCover !== undefined) setCover(newCover);
    };

    metadataMap.observe(observer);

    return () => {
      metadataMap.unobserve(observer);
    };
  }, [ydoc, initialTitle, initialIcon, initialCover]);

  // Debounced save to Postgres
  const debouncedSave = (metadata: Partial<PageMetadata>) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      if (!onSave) return;

      setIsSaving(true);
      try {
        await onSave(metadata);
      } catch (error) {
        console.error("Failed to save metadata:", error);
      } finally {
        setIsSaving(false);
      }
    }, 500);
  };

  // Update title
  const updateTitle = (newTitle: string) => {
    if (!metadataMapRef.current) return;

    isLocalUpdateRef.current = true;
    metadataMapRef.current.set("title", newTitle);
    setTitle(newTitle);

    // Debounced save to Postgres
    debouncedSave({ title: newTitle });
  };

  // Update icon
  const updateIcon = (newIcon: string) => {
    if (!metadataMapRef.current) return;

    isLocalUpdateRef.current = true;
    metadataMapRef.current.set("icon", newIcon);
    setIcon(newIcon);

    // Debounced save to Postgres
    debouncedSave({ icon: newIcon });
  };

  // Update cover
  const updateCover = (newCover: string | null) => {
    if (!metadataMapRef.current) return;

    isLocalUpdateRef.current = true;
    metadataMapRef.current.set("cover", newCover);
    setCover(newCover);

    // Immediate save to Postgres for cover (no debounce)
    if (onSave) {
      setIsSaving(true);
      onSave({ cover: newCover })
        .catch((error) => console.error("Failed to save cover:", error))
        .finally(() => setIsSaving(false));
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return {
    title,
    icon,
    cover,
    isSaving,
    updateTitle,
    updateIcon,
    updateCover,
  };
}
