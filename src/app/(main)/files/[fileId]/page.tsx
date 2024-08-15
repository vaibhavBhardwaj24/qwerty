"use client";
import HTMLRenderer from "@/app/api/deltaReader";
import { useCustomContext } from "@/lib/providers/customProvider";
import { createClient } from "@/lib/supabase/client";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./customQuill.css";
import Popup from "@/components/popup";

// const Font = ReactQuill.Quill.import('formats/font');
// Font.whitelist = ['Cambria', 'lato', 'sans-serif']; // Default sans-serif and your custom fonts
// ReactQuill.Quill.register(Font, true);
const FilePage = () => {
  const router = useParams();
  const fileId = router.fileId;
  const [file, setFile] = useState([]);
  const [saved, setSaved] = useState("");
  const [saveShow, setSaveShow] = useState(false);
  const [color, setColor] = useState("#444444");
  const [autosave, setAutosave] = useState(false);
  const autoRef = useRef(autosave);
  const [data, setData] = useState("");
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");
  const [bannerURL, setBannerURL] = useState("");
  const [loading, setMainLoading] = useState(true);

  const { disabled, setDisabled, workId, setWorkId, setLoading } =
    useCustomContext();
  const supabase = createClient();

  const sleep = async () => {
    setSaveShow(true);
    setTimeout(() => {
      setSaveShow(false);
    }, 3500);
  };

  useEffect(() => {
    if (!autosave) return;

    const intervalId = setInterval(() => {
      if (autoRef.current) {
        console.log("Autosaving...");
        updateFile();
      }
    }, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, [autosave]);

  const updateFile = async () => {
    const res = await supabase
      .from("files")
      .update({ data: data })
      .eq("id", fileId);
    console.log(res);
    if (res.status == 204) {
      setSaved("saved");
    } else {
      setSaved("error");
    }
    sleep();
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
  const toolbarOptions = [
    // [{ font: Font.whitelist }],
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
    autoRef.current = autosave;
  }, [autosave]);

  const fetchData = async () => {
    const res = await axios.post("/api/fileDetails", { fileId });
    console.log(res.data);

    setFile(res);
    setWorkId(res.data.file[0].fileWorkSpaceId);

    if (res.data.success) {
      setData(res.data.file[0].fileData);
      setIcon(res.data.file[0].fileIcon);
      setTitle(res.data.file[0].fileTitle);
      setBannerURL(res.data.file[0].fileBanner);
      setMainLoading(false);
      setLoading(false);
      console.log("load false");
      
    }
  };

  useEffect(() => {
    fetchData();
    const color = stringToHexColor(fileId);
    setColor(color);
  }, []);

  return (
    <div className="pt-8 w-full h-full overflow-auto">
      {loading ? (
        <>loading..</>
      ) : (
        <div className="h-full w-full ">
          {saveShow ? (
            <>
              <Popup error={false} message="Saved" />
            </>
          ) : (
            <></>
          )}
          <div className="h-1/3">
            <div
              style={{
                backgroundColor: bannerURL === ("" || null) ? color : undefined,
              }}
              className={
                bannerURL == ("" || null)
                  ? `bg-[${color}] w-full h-full`
                  : "object-cover overflow-hidden w-full h-full"
              }
            >
              {bannerURL != ("" || null) ? (
                <img
                  src={bannerURL}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="flex m-2">
            <h1 className="text-7xl flex w-full">
              <input
                className="bg-transparent w-[9%] focus:outline-none focus:border-b-2"
                type="text"
                disabled={disabled}
                value={icon}
                maxLength={1}
                onChange={(e) => {
                  setIcon(e.target.value);
                }}
              />

              {"  "}
              <input
                className="bg-transparent w-[90%] focus:outline-none focus:border-b-2"
                disabled={disabled}
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
              />
            </h1>{" "}
            <div className="flex flex-col gap-2">
              <button
                disabled={disabled}
                onClick={updateFile}
                className="text-4xl"
              >
                <FontAwesomeIcon
                  icon={faFloppyDisk}
                  className="opacity-60 hover:opacity-90 hover:animate-bounce duration-300"
                />
              </button>

              <button
                className={
                  autosave
                    ? "m-1 p-1 rounded-md border-2 bg-green-800/60 border-green-800"
                    : "m-1 p-1 rounded-md border-2 border-green-800 hover:bg-green-800/40 duration-300"
                }
                disabled={disabled}
                onClick={() => {
                  setAutosave(!autosave);
                }}
              >
                Autosave
                {/* {autosave ? <>true</> : <>false</>} */}
              </button>
            </div>
          </div>
          <div className="flex items-center flex-col w-full h-full">
            <div className="h-[100vw] w-[100vh] bg-wh ite/10 flex">
              {disabled ? (
                <HTMLRenderer htmlString={data} />
              ) : (
                <ReactQuill
                  value={data}
                  readOnly={disabled}
                  modules={{ toolbar: toolbarOptions }}
                  onChange={(content) => {
                    setData(content);
                  }}
                ></ReactQuill>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilePage;
