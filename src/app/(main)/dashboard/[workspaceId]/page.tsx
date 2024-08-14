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
import ReactQuill from "react-quill";
interface SingleWorkSpaceProps {
  getWorkId: Function;
  setLoading: Function;
}
const SingleWorkSpace: React.FC<SingleWorkSpaceProps> = ({
  getWorkId,
  setLoading,
  // handleCollabs,
}) => {
  const { disabled, setDisabled } = useCustomContext();
  const [data, setData] = useState([]);
  const [workDesc, setWorkdesc] = useState("");
  // const [parsedWorkDesc, parsedSetWorkdesc] = useState([]);
  const [createdAt, setCreatedAt] = useState("");
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");
  const [bannerURL, setBannerURL] = useState(null);
  const [loading, setMainLoading] = useState(true);

  const [setting, setSetting] = useState(false);
  const [color, setColor] = useState("#654562");
  const [edit, setEdit] = useState(false);

  const router = useParams();
  const workspaceId = router;
  const supabase = createClient();

  const fetchData = async () => {
    try {
      const res = await axios.post("/api/getWorkspace", {
        workspaceId: workspaceId.workspaceId,
      });
      if (res.data.success) {
        setData(res.data.workspace[0]);
        setWorkdesc(res.data.workspace[0].workspaceData);
        setTitle(res.data.workspace[0].workspaceTitle);
        setIcon(res.data.workspace[0].workspaceIcon);
        setBannerURL(res.data.workspace[0].workspaceBanner);
        console.log(res.data.workspace[0]);
        const date = new Date(res.data.workspace[0].workspaceCreatedAt);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
        const year = date.getFullYear();
        // Formatting the date as "dd-mm-yyyy"
        const formattedDate = `${day}-${month}-${year}`;
        setCreatedAt(formattedDate);

        setMainLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const stringToHexColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
    }

    // Convert hash to a 6-digit hex code
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
        bannerURL: bannerURL,
        iconId: icon,
        title: title,
        data: workDesc,
      })
      .eq("id", workspaceId.workspaceId);
    console.log(res);
    if (res.status == 204) {
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
    fetchData();

    getWorkId(workspaceId.workspaceId);
    const color = stringToHexColor(workspaceId.workspaceId);
    setColor(color);
    console.log(color);

    setLoading(false);
  }, []);

  return (
    <div className=" pt-8 w-full h-full overflow-auto">
      {loading ? (
        <div>loading.....</div>
      ) : (
        <div className="h-full w-full">
          <div className="h-1/3">
            {/* {data.workspaceBanner ? (
              <div></div>
            ) : ( */}
            <div
            style={{backgroundColor:color}}
              className={
                bannerURL == null
                  ? `bg-[${color}] w-full h-full`
                  : "object-cover overflow-hidden w-full h-full"
              }
            >
              {edit ? (
                <input
                  className="m-2 bg-transparent rounded-md border-2 p-1 text-white"
                  placeholder="Banner URL"
                  value={bannerURL || ""}
                  onChange={(e) => {
                    setBannerURL(e.target.value);
                  }}
                />
              ) : (
                <></>
              )}
              {bannerURL != null ? (
                <img
                  src={bannerURL}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <></>
              )}
            </div>
            {/* )} */}
          </div>
          <div className="flex w-full">
            <h1 className="text-7xl flex w-full">
              <input
                className="bg-transparent w-[9%]"
                disabled={!edit}
                type="text"
                value={icon}
                onChange={(e) => {
                  setIcon(e.target.value);
                }}
              />

              {"  "}
              <input
                className="bg-transparent w-[90%]"
                disabled={!edit}
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
              />
            </h1>
            <div className="flex gap-4 mx-2">
              <button
                onClick={() => {
                  setEdit(!edit);
                }}
              >
                {edit ? (
                  <FontAwesomeIcon
                    className="hover:-rotate-12 duration-300 text-5xl hover:opacity-90 opacity-100"
                    icon={faPencil}
                  />
                ) : (
                  <FontAwesomeIcon
                    className="hover:-rotate-12 duration-300 text-5xl hover:opacity-90  opacity-60"
                    icon={faPencil}
                  />
                )}
              </button>
              <button
                onClick={() => {
                  setSetting(!setting);
                }}
              >
                {setting ? (
                  <FontAwesomeIcon
                    className="hover:rotate-180 duration-700 text-5xl opacity-100"
                    icon={faGear}
                  />
                ) : (
                  <FontAwesomeIcon
                    className="hover:rotate-180 duration-700 hover:opacity-90 text-5xl opacity-60"
                    icon={faGear}
                  />
                )}
              </button>
              {edit ? (
                <button
                  className="rounded-md hover:bg-white/20 text-3xl m-2"
                  onClick={() => {
                    updateWorkspace();
                  }}
                >
                  Done
                </button>
              ) : (
                <></>
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
                onChange={(content) => {
                  setWorkdesc(content);
                }}
              ></ReactQuill>
            </div>
          )}
          {setting ? (
            <div
              className="absolute inset-0 flex items-center justify-center w-full h-full backdrop-blur-sm"
              onClick={() => {
                setSetting(false);
              }}
            >
              <div
                className=" w-1/3 h-1/4 justify-center items-center flex"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Setting
                  workspaceId={data.workspaceId}
                  workspaceTitle={data.workspaceTitle}
                  workspaceIcon={data.workspaceIcon}
                  workspaceData={data.workspaceData}
                  workspaceBanner={data.workspaceBanner}
                  workspacePrivate={data.workspacePrivate}
                />
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className="flex w-full p-2">
            <TodoContainer />
            {/* <div className="border-[1px]"></div> */}
            <div className="w-1/2 px-6 flex flex-col">
              <h1 className="text-2xl">Folders</h1>
              <hr />
              <div className="p-2">
                {data.folders.map((fold: any, index: number) => (
                  <Link href={`/folder/${fold.folderId}`} key={index}>
                    <div
                      // key={index}
                      className="m-2 w-4/5 rounded-md hover:bg-white/25 text-xl p-1 duration-300"
                    >
                      {fold.folderIcon}
                      {"  "}
                      {fold.folderTitle}
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
