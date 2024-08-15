"use client";
import HTMLRenderer from "@/app/api/deltaReader";
import Setting from "@/components/setting";
import ShowFiles from "@/components/showFiles";
import Todo from "@/components/todo";
import TodoContainer from "@/components/todoContainer";
import { useCustomContext } from "@/lib/providers/customProvider";
import { createClient } from "@/lib/supabase/client";
import { faGear, faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

import "react-quill/dist/quill.snow.css";

// Define the props for the component
interface Folder {
  folderId: string;
  folderTitle: string;
  folderIcon: string;
}

interface WorkspaceData {
  workspaceTitle: string;
  workspaceIcon: string;
  workspaceBanner: string;
  workspaceCreatedAt: string;
  workspaceData: string;
  workspacePrivate: boolean;
  folders?: Folder[];
  owner?: Folder[];
  collaborators?: Folder[];
}

const SingleWorkSpace = () => {
  const { disabled, setDisabled, workId, setWorkId, loading, setLoading } =
    useCustomContext();
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [workDesc, setWorkdesc] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [icon, setIcon] = useState<string>("");
  const [bannerURL, setBannerURL] = useState<string | null>(null);
  const [mainLoading, setMainLoading] = useState<boolean>(true);
  const [setting, setSetting] = useState<boolean>(false);
  const [color, setColor] = useState<string>("#654562");
  const [edit, setEdit] = useState<boolean>(false);

  const { workspaceId } = useParams();
  const supabase = createClient();

  const fetchData = async () => {
    try {
      const res = await axios.post("/api/getWorkspace", { workspaceId });
      if (res.data.success) {
        const workspace = res.data.workspace[0];
        console.log(workspace);

        setData(workspace);
        setWorkdesc(workspace.workspaceData);
        setTitle(workspace.workspaceTitle);
        setIcon(workspace.workspaceIcon);
        setBannerURL(workspace.workspaceBanner);

        const date = new Date(workspace.workspaceCreatedAt);
        const formattedDate = `${date.getDate().toString().padStart(2, "0")}-${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${date.getFullYear()}`;
        setCreatedAt(formattedDate);

        setMainLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const stringToHexColor = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
    }
    const color =
      ((hash >> 16) & 0xff).toString(16).padStart(2, "0") +
      ((hash >> 8) & 0xff).toString(16).padStart(2, "0") +
      (hash & 0xff).toString(16).padStart(2, "0");
    return `#${color}`;
  };

  const updateWorkspace = async () => {
    const res = await supabase
      .from("workspace")
      .update({
        bannerURL,
        iconId: icon,
        title,
        data: workDesc,
      })
      .eq("id", workspaceId);

    if (res.status === 204) {
      setEdit(false);
    }
  };

  const toolbarOptions = [
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    [{ header: 1 }, { header: 2 }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ size: ["small", false, "large", "huge"] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ["clean"],
  ];

  useEffect(() => {
    if (workspaceId) {
      fetchData();
      setWorkId(Array.isArray(workspaceId) ? workspaceId[0] : workspaceId);
      setColor(
        stringToHexColor(
          Array.isArray(workspaceId) ? workspaceId[0] : workspaceId
        )
      );
      setLoading(false);
    }
  }, [workspaceId, setWorkId, setLoading]);

  return (
    <div className="pt-8 w-full h-full overflow-auto">
      {mainLoading ? (
        <div>Loading.....</div>
      ) : (
        <div className="h-full w-full">
          <div className="h-1/3">
            <div
              style={{ backgroundColor: color }}
              className={
                bannerURL
                  ? "object-cover overflow-hidden w-full h-full"
                  : `bg-[${color}] w-full h-full`
              }
            >
              {edit && (
                <input
                  className="m-2 bg-transparent rounded-md border-2 p-1 text-white"
                  placeholder="Banner URL"
                  value={bannerURL || ""}
                  onChange={(e) => setBannerURL(e.target.value)}
                />
              )}
              {bannerURL && (
                <img
                  src={bannerURL}
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
          </div>
          <div className="flex w-full">
            <h1 className="text-7xl flex w-full">
              <input
                className="bg-transparent w-[9%]"
                disabled={!edit}
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              />
              <input
                className="bg-transparent w-[90%]"
                disabled={!edit}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </h1>
            <div className="flex gap-4 mx-2">
              <button onClick={() => setEdit(!edit)}>
                <FontAwesomeIcon
                  className={`text-5xl duration-300 ${
                    edit
                      ? "hover:-rotate-12 opacity-100"
                      : "hover:-rotate-12 opacity-60"
                  }`}
                  icon={faPencil}
                />
              </button>
              <button onClick={() => setSetting(!setting)}>
                <FontAwesomeIcon
                  className={`text-5xl duration-700 ${
                    setting
                      ? "opacity-100 hover:rotate-180"
                      : "opacity-60 hover:rotate-180"
                  }`}
                  icon={faGear}
                />
              </button>
              {edit && (
                <button
                  className="rounded-md hover:bg-white/20 text-3xl m-2"
                  onClick={updateWorkspace}
                >
                  Done
                </button>
              )}
            </div>
          </div>
          {disabled || !edit ? (
            <>
              <p>{createdAt}</p>
              <HTMLRenderer htmlString={workDesc} />
            </>
          ) : (
            <div className="p-2">
              <p>{createdAt}</p>
              <ReactQuill
                value={workDesc}
                readOnly={!edit}
                modules={{ toolbar: toolbarOptions }}
                onChange={setWorkdesc}
              />
            </div>
          )}
          {setting && (
            <div
              className="absolute inset-0 flex items-center justify-center w-full h-full backdrop-blur-sm"
              onClick={() => setSetting(false)}
            >
              <div
                className="w-1/3 h-1/4 justify-center items-center flex"
                onClick={(e) => e.stopPropagation()}
              >
                <Setting
                  workspaceId={
                    Array.isArray(workspaceId) ? workspaceId[0] : workspaceId
                  }
                  workspaceBanner={bannerURL || ""}
                  workspacePrivate={data ? data.workspacePrivate : true}
                  {...data}
                />
              </div>
            </div>
          )}
          <div className="flex w-full p-2">
            <TodoContainer />
            <div className="w-1/2 px-6 flex flex-col">
              <h1 className="text-2xl">Folders</h1>
              <hr />
              <div className="p-2">
                {data?.folders?.map((fold, index) => (
                  <Link href={`/folder/${fold.folderId}`} key={index}>
                    <div className="m-2 w-4/5 rounded-md hover:bg-white/25 text-xl p-1 duration-300">
                      {fold.folderIcon} {fold.folderTitle}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleWorkSpace;
