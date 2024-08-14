"use client";
import { createClient } from "@/lib/supabase/client";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
interface FilePageProps {
  getWorkId: Function;
  setSideLoad: Function;
  isDisabled: boolean;
}
const FilePage: React.FC<FilePageProps> = ({
  getWorkId,
  setSideLoad,
  isDisabled,
}) => {
  const router = useParams();
  const fileId = router.fileId;
  const [file, setFile] = useState([]);
  const [saved, setSaved] = useState("");
  const [saveShow, setSaveShow] = useState(false);
  const [autosave, setAutosave] = useState(false);
  const autoRef = useRef(autosave);
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const sleep = async () => {
    setSaveShow(true);
    setTimeout(() => {
      setSaveShow(false);
    }, 2000);
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
  const toolbarOptions = [
    ["bold", "italic", "underline", "strike"], // toggled buttons
    ["blockquote", "code-block"],

    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }], // superscript/subscript
    [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
    [{ direction: "rtl" }], // text direction

    [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }],

    ["clean"], // remove formatting button
  ];
  useEffect(() => {
    autoRef.current = autosave;
  }, [autosave]);
  // useEffect(() => {
  //   if (socket === null) {
  //     return;
  //   }
  //   const res = socket.emit("join_room", fileId);
  //   console.log(res,"sdfghj");
  // }, [socket]);
  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.post("/api/fileDetails", { fileId });
      console.log(res.data);

      setFile(res);
      getWorkId(res.data.file[0].fileWorkSpaceId);
      setSideLoad(false);
      if (res.data.file[0].fileData) {
        setData(res.data.file[0].fileData);
      }

      setLoading(false);
    };
    fetchData();
    // TriggerAutosave();
  }, []);

  return (
    <div>
      {fileId}
      {loading ? (
        <>loading..</>
      ) : (
        <div>
          <h1>{file.data.file[0].fileTitle}</h1>

          <ReactQuill
            value={data}
            readOnly={isDisabled}
            modules={{ toolbar: toolbarOptions }}
            onChange={(content, delta, source, editor) => {
              setData(content);
            }}
          ></ReactQuill>

          <button
            disabled={isDisabled}
            onClick={() => {
              updateFile();
            }}
          >
            save
          </button>
          <div>
            <button
              disabled={isDisabled}
              onClick={() => {
                setAutosave(!autosave);
              }}
            >
              autosave
              {autosave ? <>tru</> : <>false</>}
            </button>
          </div>
          <div>{saveShow ? <>{saved}</> : <></>}</div>
        </div>
      )}
    </div>
  );
};

export default FilePage;
