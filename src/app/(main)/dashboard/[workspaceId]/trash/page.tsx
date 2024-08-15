"use client";
import { createClient } from "@/lib/supabase/client";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

// Define the interfaces for the data structures
interface File {
  fileId: string;
  filesTitle: string;
  // Add any other properties needed for files
}

interface Folder {
  folderId: string;
  folderTitle: string;
  folderIcon: string;
  // Add any other properties needed for folders
}

interface Trash {
  workspaceTitle: string;
  files: File[];
  folders: Folder[];
}

const TrashPage = () => {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [trash, setTrash] = useState<Trash | null>(null); // Initialize with null to indicate loading state
  const supabase = createClient();

  const restoreFiles = async ({
    fileId,
    index,
  }: {
    fileId: string;
    index: number;
  }) => {
    const res = await supabase
      .from("files")
      .update({ inTrash: null })
      .eq("id", fileId);
    console.log(res);

    if (trash) {
      setTrash({
        ...trash,
        files: trash.files.filter((_, i) => i !== index),
      });
    }
  };

  const restoreFolder = async ({
    folderId,
    index,
  }: {
    folderId: string;
    index: number;
  }) => {
    const res = await supabase
      .from("folders")
      .update({ inTrash: null })
      .eq("id", folderId);
    console.log(res);

    if (trash) {
      setTrash({
        ...trash,
        folders: trash.folders.filter((_, i) => i !== index),
      });
    }
  };

  const deleteFiles = async ({
    fileId,
    index,
  }: {
    fileId: string;
    index: number;
  }) => {
    const res = await supabase.from("files").delete().eq("id", fileId);
    console.log(res);

    if (trash) {
      setTrash({
        ...trash,
        files: trash.files.filter((_, i) => i !== index),
      });
    }
  };

  const deleteFolder = async ({
    folderId,
    index,
  }: {
    folderId: string;
    index: number;
  }) => {
    const res1 = await supabase.from("folders").delete().eq("id", folderId);
    console.log(res1);
    const res2 = await supabase.from("files").delete().eq("folderId", folderId);
    console.log(res2);

    if (trash) {
      setTrash({
        ...trash,
        folders: trash.folders.filter((_, i) => i !== index),
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.post("/api/trash", {
        workspaceId: params.workspaceId,
      });
      console.log(res);

      setTrash(res.data.trash[0]);
      setLoading(false);
      console.log(res.data.trash[0]);
    };
    fetchData();
  }, []);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (!trash) {
    return <h1>No data found</h1>;
  }

  return (
    <div>
      <h1>{trash.workspaceTitle}</h1>
      <div>
        <h2>Folders</h2>
        {trash.folders.map((folder, index) => (
          <div key={index}>
            <h1>
              {folder.folderTitle} - {folder.folderIcon}
            </h1>
            <div>
              <button
                onClick={() =>
                  restoreFolder({ folderId: folder.folderId, index: index })
                }
              >
                Restore
              </button>
            </div>
            <button
              onClick={() =>
                deleteFolder({ folderId: folder.folderId, index: index })
              }
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <div>
        <h2>Files</h2>
        {trash.files.map((file, index) => (
          <div key={index}>
            {file.filesTitle}
            <div>
              <button
                onClick={() => restoreFiles({ fileId: file.fileId, index: index })}
              >
                Restore
              </button>
            </div>
            <button
              onClick={() => deleteFiles({ fileId: file.fileId, index: index })}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrashPage;
