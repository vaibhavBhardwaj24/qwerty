"use client";
import HTMLRenderer from "@/app/api/deltaReader";
import { useCustomContext } from "@/lib/providers/customProvider";
import { createClient } from "@/lib/supabase/client";
import { faCheck, faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import LoadingPage from "@/components/ui/loading";
import Files from "@/components/files";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const FolderDetail = () => {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");
  const [bannerURL, setBannerURL] = useState("");
  const [color, setColor] = useState("#444444");
  const [edit, setEdit] = useState(false);
  const [folderDesc, setFolderDesc] = useState("");
  const [loading, setMainLoading] = useState(true);
  const [user, setUser] = useState<any>([]);
  const [folder, setFolder] = useState([]);

  const { disabled, setDisabled, workId, setWorkId, setLoading } =
    useCustomContext();
  const supabase = createClient();

  const router = useParams();
  const folderId = router.folderId;
  console.log(folderId);

  const updateFolder = async () => {
    const res = await supabase
      .from("folders")
      .update({
        bannerURL: bannerURL,
        iconId: icon,
        title: title,
        data: folderDesc,
      })
      .eq("id", folderId);
    console.log(res);
    if (res.status == 204) {
      setEdit(false);
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
  const fetchData = async () => {
    try {
      const res = await axios.post("/api/folderDetails", {
        folderId: folderId,
      });
      const user = await supabase.auth.getSession();
      setUser(user.data.session?.user.id);
      if (res.data.success) {
        console.log(res);
        setFolder(res.data.folders[0]);
        setFolderDesc(res.data.folders[0].folderDesc);
        setTitle(res.data.folders[0].folderTitle);
        setIcon(res.data.folders[0].folderIcon);
        setBannerURL(res.data.folders[0].folderBanner);
        setWorkId(res.data.folders[0].folderWorkSpaceId);
        // setFile(res.data.folders[0].files);
        setMainLoading(false);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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
    ["image"],
    ["clean"],
  ];
  useEffect(() => {
    fetchData();

    const color = stringToHexColor(
      Array.isArray(router.folderId) ? router.folderId[0] : router.folderId
    );
    setColor(color);
    setLoading(false);
  }, []);

  return (
    <div className="pt-8 bg-dot-white/[0.2]  w-full h-full overflow-auto">
      {loading ? (
        <div className="w-full h-full">
          <LoadingPage />
        </div>
      ) : (
        <>
          <div className="h-full w-full">
            <div className="h-1/3">
              <div
                style={{
                  backgroundColor: bannerURL === "" ? color : undefined,
                }}
                className={
                  bannerURL == ""
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
                {bannerURL != "" ? (
                  <img
                    src={bannerURL || ""}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <></>
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
                {edit ? (
                  <button
                    disabled={disabled}
                    className="rounded-md text-3xl m-2"
                    onClick={() => {
                      updateFolder();
                    }}
                  >
                    <FontAwesomeIcon
                      className="hover:-rotate-12 duration-300 text-5xl hover:opacity-90  opacity-60"
                      icon={faCheck}
                    />
                  </button>
                ) : (
                  <button
                    disabled={disabled}
                    onClick={() => {
                      setEdit(!edit);
                    }}
                  >
                    <FontAwesomeIcon
                      className="hover:-rotate-12 duration-300 text-5xl hover:opacity-90 opacity-60"
                      icon={faPencil}
                    />
                  </button>
                )}
              </div>
            </div>
            {disabled || !edit ? (
              <>
                {/* <p>{createdAt}</p> */}
                <HTMLRenderer htmlString={folderDesc} />
              </>
            ) : (
              <div className="p-2">
                {/* <p>{createdAt}</p> */}
                <ReactQuill
                  value={folderDesc}
                  readOnly={!edit}
                  modules={{ toolbar: toolbarOptions }}
                  onChange={(content) => {
                    setFolderDesc(content);
                  }}
                ></ReactQuill>
              </div>
            )}
            <Files folderId={folderId} user={user} workId={workId} />
          </div>
        </>
      )}
    </div>
  );
};

export default FolderDetail;
