"use client";
import { createClient } from "@/lib/supabase/client";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const TrashPage = () => {
  const params = useParams();
  //   console.log(params);
  const [loading, setLoading] = useState(true);
  const [trash, setTrash] = useState([]);
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
    setTrash((trash) => ({
      ...trash,
      files: trash.files.filter((_: any, i: number) => i !== index),
    }));
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
    console.log(trash.folders.filter((_: any, i: number) => i !== index));
    setTrash((trash) => ({
      ...trash,
      folders: trash.folders.filter((_: any, i: number) => i !== index),
    }));
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
    setTrash((trash) => ({
      ...trash,
      files: trash.files.filter((_: any, i: number) => i !== index),
    }));
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
    setTrash((trash) => ({
      ...trash,
      folders: trash.folders.filter((_: any, i: number) => i !== index),
    }));
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
  return (
    <>
      {loading ? (
        <h1>loading</h1>
      ) : (
        <div>
          <h1>{trash.workspaceTitle}</h1>
          folders
          {trash.folders.map((fold, index: number) => (
            <div key={index}>
              <h1>
                {fold.folderTitle} - {fold.folderIcon}
              </h1>
              <div>
                {" "}
                <button
                  onClick={() => {
                    restoreFolder({ folderId: fold.folderId, index: index });
                  }}
                >
                  restore
                </button>
              </div>
              <button
                onClick={() => {
                  deleteFolder({ folderId: fold.folderId, index: index });
                }}
              >
                delete
              </button>
            </div>
          ))}
          files
          {trash.files.map((file, index: number) => (
            <div key={index}>
              {file.filesTitle}
              <div>
                <button
                  onClick={() => {
                    restoreFiles({ fileId: file.fileId, index: index });
                  }}
                >
                  restore
                </button>
              </div>
              <button
                onClick={() => {
                  deleteFiles({ fileId: file.fileId, index: index });
                }}
              >
                delete
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default TrashPage;
