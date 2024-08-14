"use client";
import { createClient } from "@/lib/supabase/client";
import React, { useEffect, useState } from "react";
import CreateWorkSpace from "@/components/createWorkSpace";
import axios from "axios";
import Link from "next/link";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faLock,
  faLockOpen,
} from "@fortawesome/free-solid-svg-icons";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState([]);
  const [collabWorkspace, setCollabWorkspace] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showWork, setShowWork] = useState(false);
  const [privateMode, setPrivateMode] = useState(false);
  const [createWork, setCreateWork] = useState(false);
  const [title, setTitle] = useState("");
  const [iconId, setIconId] = useState("");
  const [workDesc, setWorkDesc] = useState("");
  const [bannerURL, setBannerURL] = useState("");

  const supabase = createClient();

  const createWorkspace = async () => {
    if (!title || !user) return; // Ensure required fields are filled

    const data = {
      title,
      iconId,
      ownerID: user,
      privateMode,
      workDesc,
      bannerURL,
    };
    console.log("wertyu");

    // try {
    //   const res = await axios.post("api/createWorkSpace", data);
    //   if (res.status === 200) {
    //     setCreateWork(false);
    //     fetchData(); // Refresh the workspace list after creation
    //   }
    // } catch (error) {
    //   console.error("Error creating workspace:", error);
    // }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) return;

      const userId = sessionData.session.user.id;
      const res = await axios.post("/api/dashboard", { userId });
      console.log(res.data);
      setLoading(false);
      if (res.data.success) {
        setUser(res.data.user);
        setWorkspace(res.data.workspace);
        console.log(res.data);
      }
      const res2 = await axios.post("/api/collabWorkspaces", { userId });
      console.log(res2);
      setCollabWorkspace(res2.data.collabs);

      // if (res2.data.success) {
      //   setCollabWorkspace(res.data.collabs);
      //   console.log(res.data);
      // }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // useEffect(() => {
  //   fetchData();
  // }, []);

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

  // if (loading) {
  //   return <div className="text-center">Loading...</div>;
  // }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-5">
      {createWork ? (
        <div className="flex flex-col w-1/2 h-2/3">
          <div className="flex gap-2 m-2">
            <input
              className="w-[9%] placeholder:text-7xl hover:bg-white/20 duration-200 placeholder:text-white/40 text-4xl flex justify-center bg-transparent rounded-md border-2 border-white/40 focus:outline-none focus:border-white/90"
              placeholder="+"
              maxLength={2}
              value={iconId}
              onChange={(e) => setIconId(e.target.value)}
            />
            <input
              className="bg-transparent w-[90%] text-4xl border-b-2 border-white/40 focus:outline-none focus:border-white/90"
              type="text"
              placeholder="WorkSpace Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="mb-20 h-full flex">
            <ReactQuill
              value={workDesc}
              modules={{ toolbar: toolbarOptions }}
              onChange={setWorkDesc}
            />
          </div>
          <div className="flex w-full justify-between">
            <input
              className="bg-transparent border-2 rounded-md w-[75%]"
              type="text"
              placeholder="Banner URL"
              value={bannerURL}
              onChange={(e) => setBannerURL(e.target.value)}
            />
            <div
              className="cursor-pointer text-2xl rounded-md group"
              onClick={() => setPrivateMode(!privateMode)}
            >
              <div className="flex w-fit gap-2">
                <FontAwesomeIcon
                  icon={privateMode ? faLock : faLockOpen}
                  className="text-white/60 group-hover:text-white/85 duration-300"
                />
                {privateMode ? "Private" : "Public"}
              </div>
            </div>
          </div>
          <div className="flex w-full justify-center mt-4">
            <button
              className="text-4xl w-fit hover:bg-white/15 rounded-lg p-2 duration-200"
              onClick={createWorkspace}
            >
              Create
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 border-2 rounded-md">
          <button
            onClick={() => setCreateWork(true)}
            className="text-2xl bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Create Workspace
          </button>
          <div className="flex gap-2">
            <h2 className="text-2xl mb-2">WorkSpaces</h2>
            <button
              onClick={() => {
                fetchData();
                setShowWork(true);
              }}
            >
              <FontAwesomeIcon icon={faArrowDown} />
            </button>
          </div>

          {showWork ? (
            <div>
              {loading ? (
                <>loading....</>
              ) : (
                <div>
                  <div className="mt-4">
                    {workspace != null ? (
                      workspace.map((work, index) => (
                        <Link href={`/dashboard/${work.id}`} key={index}>
                          <div className="text-2xl hover:bg-white/20 rounded-md">
                            {work.iconId} {work.title}
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p>No workspaces found.</p>
                    )}
                  </div>
                  <div className="mt-4">
                    <h2 className="text-2xl mb-2">Collaborated Workspaces</h2>
                    {collabWorkspace != null ? (
                      collabWorkspace.map((work, index) => (
                        <Link href={`/dashboard/${work.id}`} key={index}>
                          <div className="text-2xl hover:bg-white/20 rounded-md">
                            {work.iconId}
                            {"  "}
                            {work.title}
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p>No collaborated workspaces found.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <></>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
