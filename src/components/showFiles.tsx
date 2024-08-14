"use client";
import { createClient } from "@/lib/supabase/client";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronUp,
  faChevronDown,
  faTrash,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
interface showFileProps {
  folderId: string;
  workspaceId: any;
  owner: string;
  username: string;
  isDisabled: boolean;
  folderTitle: string;
  folderIcon: string;
}
const ShowFiles: React.FC<showFileProps> = ({
  folderId,
  workspaceId,
  owner,
  username,
  isDisabled,
  folderIcon,
  folderTitle,
}) => {
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [iconId, setIconId] = useState("");
  const [bannerURL, setBannerURL] = useState("");
  const [showFiles, setShowFiles] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const router = useRouter();
  const fetchData = async () => {
    const data = { folderId };
    const result = await axios.post("/api/folderDetails", data);
    console.log(result.data.folders[0].files);
    setResult(result.data.folders[0].files);
    setLoading(false);
  };
  const inTrash = async ({ fileId }: { fileId: string }) => {
    const inTrash = `deleted by ${username}`;
    console.log(inTrash);
    const result = await supabase
      .from("files")
      .update({ inTrash })
      .eq("id", fileId);
    console.log(result);
    setShowFiles(true);
    if (result.status == 204) {
      setResult((prevResult) =>
        prevResult.filter((file) => file.filesId !== fileId)
      );
    }

    // setResult(result.filter((a, i) => i !== index));
  };

  const createFile = async () => {
    const data = { workspaceId, folderId, owner, title, iconId };
    const res = await axios.post("/api/createFile", data);
    console.log(res);
    setLoading(false);
  };
  return (
    <>
      <div
        onClick={() => {
          // setLoading(true);
          console.log(owner, "qwertyu");

          // setShowFiles(!showFiles);
        }}
        className="flex flex-col w-full justify-between"
      >
        <div className="flex flex-row w-full justify-between text-2xl">
          <Link
            className="hover:underline duration-300"
            href={`/folder/${folderId}`}
          >
            {folderIcon} {folderTitle}
          </Link>
          <div className=" align-middle flex rounded-full bg-transparent hover:bg-white/20  justify-center h-7 w-7 duration-300">
            <button
              onClick={() => {
                setLoading(true);
                fetchData();
                setShowFiles(!showFiles);
              }}
            >
              <div>
                {showFiles ? (
                  <div
                    onClick={(e) => {
                      setShowFiles(!showFiles);
                      e.stopPropagation();
                    }}
                  >
                    <FontAwesomeIcon icon={faChevronUp} size="xs" />
                  </div>
                ) : (
                  <FontAwesomeIcon size="xs" icon={faChevronDown} />
                )}
              </div>
            </button>
          </div>
        </div>
        {showFiles ? (
          <div className="flex justify-center">
            {loading ? (
              <>loading</>
            ) : (
              <div className="w-[90%] -end flex flex-col">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <div className="flex w-full gap-1">
                    <input
                      disabled={isDisabled}
                      className="w-1/5 bg-transparent border-2 rounded-md px-2"
                      type="text"
                      value={iconId}
                      placeholder="Icon "
                      onChange={(e) => {
                        setIconId(e.target.value);
                      }}
                    />
                    <input
                      disabled={isDisabled}
                      className="w-4/5 bg-transparent border-2 rounded-md px-2"
                      type="text"
                      value={title}
                      placeholder="Title"
                      onChange={(e) => {
                        setTitle(e.target.value);
                      }}
                    />
                    <button
                      disabled={isDisabled}
                      onClick={() => {
                        setLoading(true);
                        createFile();
                        fetchData();
                        setIconId("");
                        setTitle("");
                      }}
                    >
                      {/* <FontAwesomeIcon
                        icon={faPlus}
                        // size="xs"
                        className="hover:bg-white/20 w-5 h-5 rounded-full duration-300"
                      /> */}
                      <div className="hover:bg-white/20 w-5 h-5 rounded-full duration-300 text-xl flex justify-center items-center">
                        +
                      </div>
                    </button>
                  </div>
                </div>

                {result.map((file, index) => (
                  <div key={index} className="flex justify-between w-full">
                    <Link
                      href={`/files/${file.filesId}`}
                      className="hover:underline duration-300"
                    >
                      {file.filesIcon}
                      {"  "}
                      {file.filesTitle}
                    </Link>
                    <button
                      onClick={() => {
                        inTrash({ fileId: file.filesId });
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="hover:-translate-y-1 duration-300"
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </>
  );
};

export default ShowFiles;
