import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
interface FilesProps {
  folderId: string | string[];
  workId: string;
  user: string;
}
const Files: React.FC<FilesProps> = ({ folderId, workId, user }) => {
  const [file, setFile] = useState([]);
  const [fileTitle, setFileTitle] = useState("");
  const [iconId, setIconId] = useState("");
  const [loading, setLoading] = useState(true);
  const folderIdStr = Array.isArray(folderId) ? folderId[0] : folderId;
  const createFile = async () => {
    setLoading(true);
    if (!workId || !folderId || !user || !fileTitle || !iconId) {
      console.log("not all fields given");
      return;
    }
    const data = {
      workspaceId: workId,
      folderId: folderId,
      owner: user,
      title: fileTitle,
      iconId: iconId,
    };
    const res = await axios.post("/api/createFile", data);
    console.log(res);
    fetchData();
    setIconId("");
    setFileTitle("");
    setLoading(false);
  };
  const fetchData = async () => {
    const res = await axios.post("/api/getFiles", { folderId: folderIdStr });
    if (res.data.success) {
      setFile(res.data.files);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="flex w-full p-2">
      <div className="w-1/2 px-6 flex flex-col">
        <h1 className="text-2xl">Files</h1>
        <hr />
        {loading ? (
          <>loading...</>
        ) : (
          <div className="p-2">
            {file.map((file: any, index: number) => (
              <div
                key={index}
                className="m-2 w-4/5 rounded-md hover:bg-white/25 text-xl p-1 duration-300"
              >
                <Link href={`/files/${file.filesId}`}>
                  {file.filesIcon}
                  {"  "}
                  {file.filesTitle}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-1/2 px-6 flex h-fit gap-2">
        <input
          className="w-[9%] placeholder:text-6xl hover:bg-white/20 duration-200 placeholder:text-white/40 text-3xl flex justify-center bg-transparent rounded-md border-2 border-white/40 focus:outline-none focus:border-white/90"
          placeholder="+"
          maxLength={2}
          value={iconId}
          onChange={(e) => setIconId(e.target.value)}
        />
        <input
          className="bg-transparent w-[90%] text-3xl border-b-2 border-white/40 focus:outline-none focus:border-white/90"
          type="text"
          placeholder="File Title"
          value={fileTitle}
          onChange={(e) => setFileTitle(e.target.value)}
        />
        <button
          className="text-2xl w-fit hover:bg-white/15 rounded-lg p-2 duration-200"
          onClick={createFile}
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default Files;
