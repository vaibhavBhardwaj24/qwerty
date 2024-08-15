"use client";
import Popup from "@/components/popup";
import { useCustomContext } from "@/lib/providers/customProvider";
import { createClient } from "@/lib/supabase/client";
import { faArrowRotateLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const TrashPage = () => {
  const params = useParams();
  //   console.log(params);
  const [loading, setLoading2] = useState(true);
  const [trash, setTrash] = useState([]);
  const [popup, setPopup] = useState(false);
  const [success, setSuccess] = useState(false);

  const { disabled, setDisabled, workId, setWorkId, setLoading } =
    useCustomContext();
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
    if (res.status == 204) {
      setPopup(true);
      setSuccess(true);
      setTrash((trash) => ({
        ...trash,
        files: trash.files.filter((_: any, i: number) => i !== index),
      }));
    } else {
      setPopup(true);
      setSuccess(false);
    }
    setTimeout(() => {
      setPopup(false);
    }, 3500);
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
    if (res.status == 204) {
      setPopup(true);
      setSuccess(true);
      console.log(trash.folders.filter((_: any, i: number) => i !== index));
      setTrash((trash) => ({
        ...trash,
        folders: trash.folders.filter((_: any, i: number) => i !== index),
      }));
    } else {
      setPopup(true);
      setSuccess(false);
    }
    setTimeout(() => {
      setPopup(false);
    }, 3500);
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
    if (res.status == 204) {
      setPopup(true);
      setSuccess(true);
      setTrash((trash) => ({
        ...trash,
        files: trash.files.filter((_: any, i: number) => i !== index),
      }));
    } else {
      setPopup(true);
      setSuccess(false);
    }
    setTimeout(() => {
      setPopup(false);
    }, 3500);
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
    if (res1.status == 204 && res2.status == 204) {
      setPopup(true);
      setSuccess(true);
      setTrash((trash) => ({
        ...trash,
        folders: trash.folders.filter((_: any, i: number) => i !== index),
      }));
    } else {
      setPopup(true);
      setSuccess(false);
    }
    setTimeout(() => {
      setPopup(false);
    }, 3500);
  };
  const fetchData = async () => {
    const res = await axios.post("/api/trash", {
      workspaceId: params.workspaceId,
    });
    console.log(res);

    setTrash(res.data.trash[0]);
    setLoading2(false);
    console.log(res.data.trash[0]);
  };
  useEffect(() => {
    setWorkId(params.workspaceId);
    fetchData();
    setLoading(false);
  }, []);
  return (
    <>
      {loading ? (
        <h1>loading</h1>
      ) : (
        <div className="h-full w-full flex flex-col pt-8 p-4">
          {popup ? (
            <div>
              {success ? (
                <Popup error={false} message="Success" />
              ) : (
                <Popup error={true} message="Error" />
              )}
            </div>
          ) : (
            <></>
          )}
          <div>
            <h1 className="text-4xl m-2">Trash 🗑️</h1>
            <hr />
            <div className="text-2xl">Folders 📂</div>
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
                    <FontAwesomeIcon
                      icon={faArrowRotateLeft}
                      className="text-2xl opacity-60 hover:opacity-90 duration-300"
                    />
                  </button>
                </div>
                <button
                  onClick={() => {
                    deleteFolder({ folderId: fold.folderId, index: index });
                  }}
                >
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="text-2xl opacity-60 hover:opacity-90 duration-300"
                  />
                </button>
              </div>
            ))}
            <br />
            <div className="text-2xl"> Files </div>
            {trash.files.map((file, index: number) => (
              <div key={index} className="flex gap-3">
                {file.filesTitle}
                <div>
                  <button
                    onClick={() => {
                      restoreFiles({ fileId: file.fileId, index: index });
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faArrowRotateLeft}
                      className="text-2xl opacity-60 hover:opacity-90 duration-300"
                    />
                  </button>
                </div>
                <button
                  onClick={() => {
                    deleteFiles({ fileId: file.fileId, index: index });
                  }}
                >
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="text-2xl opacity-60 hover:opacity-90 duration-300"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default TrashPage;
