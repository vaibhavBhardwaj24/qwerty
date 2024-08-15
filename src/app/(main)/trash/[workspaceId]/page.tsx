"use client";
import Popup from "@/components/popup";
import LoadingPage from "@/components/ui/loading";
import { useCustomContext } from "@/lib/providers/customProvider";
import { createClient } from "@/lib/supabase/client";
import { faArrowRotateLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

// Define types for folder and file
interface Folder {
  folderId: string;
  folderTitle: string;
  folderIcon: string;
}

interface File {
  fileId: string;
  filesTitle: string;
}

interface TrashData {
  folders: Folder[];
  files: File[];
}

const TrashPage: React.FC = () => {
  const params = useParams();
  const workspaceId = Array.isArray(params.workspaceId)
    ? params.workspaceId[0]
    : params.workspaceId;

  const [loading, setLoading] = useState<boolean>(true);
  const [trash, setTrash] = useState<TrashData>({ folders: [], files: [] });
  const [popup, setPopup] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const { setWorkId, setLoading: setContextLoading } = useCustomContext();
  const supabase = createClient();

  const restoreFiles = async ({
    fileId,
    index,
  }: {
    fileId: string;
    index: number;
  }) => {
    try {
      const { status } = await supabase
        .from("files")
        .update({ inTrash: null })
        .eq("id", fileId);

      if (status === 204) {
        setPopup(true);
        setSuccess(true);
        setTrash((prevTrash) => ({
          ...prevTrash,
          files: prevTrash.files.filter((_, i) => i !== index),
        }));
      } else {
        setPopup(true);
        setSuccess(false);
      }
    } catch (error) {
      console.error("Error restoring file:", error);
      setPopup(true);
      setSuccess(false);
    }
    setTimeout(() => setPopup(false), 3500);
  };

  const restoreFolder = async ({
    folderId,
    index,
  }: {
    folderId: string;
    index: number;
  }) => {
    try {
      const { status } = await supabase
        .from("folders")
        .update({ inTrash: null })
        .eq("id", folderId);

      if (status === 204) {
        setPopup(true);
        setSuccess(true);
        setTrash((prevTrash) => ({
          ...prevTrash,
          folders: prevTrash.folders.filter((_, i) => i !== index),
        }));
      } else {
        setPopup(true);
        setSuccess(false);
      }
    } catch (error) {
      console.error("Error restoring folder:", error);
      setPopup(true);
      setSuccess(false);
    }
    setTimeout(() => setPopup(false), 3500);
  };

  const deleteFiles = async ({
    fileId,
    index,
  }: {
    fileId: string;
    index: number;
  }) => {
    try {
      const { status } = await supabase.from("files").delete().eq("id", fileId);

      if (status === 204) {
        setPopup(true);
        setSuccess(true);
        setTrash((prevTrash) => ({
          ...prevTrash,
          files: prevTrash.files.filter((_, i) => i !== index),
        }));
      } else {
        setPopup(true);
        setSuccess(false);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      setPopup(true);
      setSuccess(false);
    }
    setTimeout(() => setPopup(false), 3500);
  };

  const deleteFolder = async ({
    folderId,
    index,
  }: {
    folderId: string;
    index: number;
  }) => {
    try {
      const [res1, res2] = await Promise.all([
        supabase.from("folders").delete().eq("id", folderId),
        supabase.from("files").delete().eq("folderId", folderId),
      ]);

      if (res1.status === 204 && res2.status === 204) {
        setPopup(true);
        setSuccess(true);
        setTrash((prevTrash) => ({
          ...prevTrash,
          folders: prevTrash.folders.filter((_, i) => i !== index),
        }));
      } else {
        setPopup(true);
        setSuccess(false);
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      setPopup(true);
      setSuccess(false);
    }
    setTimeout(() => setPopup(false), 3500);
  };

  const fetchData = async () => {
    try {
      const response = await axios.post<{ trash: TrashData }>("/api/trash", {
        workspaceId,
      });
      setTrash(response.data.trash);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching trash data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      setWorkId(workspaceId);
      fetchData();
    }
  }, [workspaceId]);

  return (
    <>
      {loading ? (
        <div className="w-full h-full">
          <LoadingPage />
        </div>
      ) : (
        <div className="h-full w-full bg-grid-white/[0.2]  flex flex-col pt-8 p-4">
          {popup && (
            <Popup error={!success} message={success ? "Success" : "Error"} />
          )}
          <div>
            <h1 className="text-4xl m-2">Trash 🗑️</h1>
            <hr />
            <div className="text-2xl">Folders 📂</div>
            {trash.folders.map((fold, index) => (
              <div key={fold.folderId} className="mb-2">
                <h1>
                  {fold.folderTitle} - {fold.folderIcon}
                </h1>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      restoreFolder({ folderId: fold.folderId, index })
                    }
                  >
                    <FontAwesomeIcon
                      icon={faArrowRotateLeft}
                      className="text-2xl opacity-60 hover:opacity-90 duration-300"
                    />
                  </button>
                  <button
                    onClick={() =>
                      deleteFolder({ folderId: fold.folderId, index })
                    }
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="text-2xl opacity-60 hover:opacity-90 duration-300"
                    />
                  </button>
                </div>
              </div>
            ))}
            <br />
            <div className="text-2xl">Files</div>
            {trash.files.map((file, index) => (
              <div key={file.fileId} className="flex gap-3 mb-2">
                {file.filesTitle}
                <div className="flex gap-3">
                  <button
                    onClick={() => restoreFiles({ fileId: file.fileId, index })}
                  >
                    <FontAwesomeIcon
                      icon={faArrowRotateLeft}
                      className="text-2xl opacity-60 hover:opacity-90 duration-300"
                    />
                  </button>
                  <button
                    onClick={() => deleteFiles({ fileId: file.fileId, index })}
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="text-2xl opacity-60 hover:opacity-90 duration-300"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default TrashPage;
