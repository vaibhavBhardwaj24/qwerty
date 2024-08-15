"use client";
import InviteUserPage from "@/components/inviteUser/page";
import ShowFiles from "@/components/showFiles";
import { createClient } from "@/lib/supabase/client";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

import "react-quill/dist/quill.snow.css";
import "./ui/customQuillStyles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCross,
  faPlus,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useCustomContext } from "@/lib/providers/customProvider";
import Collaborators from "./collaborators";

const Sidebar = () => {
  const supabase = createClient();
  const forward = useRouter();
  const { disabled, setDisabled, workId, setWorkId } = useCustomContext();

  interface Workspace {
    workspaceId: string;
    workspaceIcon: string;
    workspaceTitle: string;
    workspacePrivate: boolean;
    ownerId: string;
    folders: Folder[];
    collaborators: Collaborator[];
  }

  interface Folder {
    folderId: string;
    folderIcon: string;
    folderTitle: string;
  }

  interface Collaborator {
    collId: string;
    collaboratorAvatar: string;
    collaboratorEmail: string;
    collaboratorId: string;
    collaboratorsName: string;
  }

  const removeCollab = async (collId: string) => {
    const res = await supabase.from("collaborators").delete().eq("id", collId);
    console.log(res);
  };
  const inTrash = async ({
    folderId,
    index,
  }: {
    folderId: string;
    index: number;
  }) => {
    const inTrash = `deleted by ${user.data.session?.user.email}`;
    const result = await supabase
      .from("folders")
      .update({ inTrash })
      .eq("id", folderId);
    console.log(result);
    if (result.status == 204) {
      setWorkspace((workspace) => {
        const newWork = {
          ...workspace[0],
          folders: workspace[0].folders.filter(
            (_: any, i: number) => i !== index
          ),
        };
        return [newWork];
      });
    }

    console.log("intrash", workspace);
  };
  const addFolder = async () => {
    const data = {
      title: folderTitle,
      iconId: folderIcon,
      owner: user.data.session?.user.email,
      workspaceId: workspaceId.workspaceId || workId,
      bannerURL: folderBannerURL,
      data: folderDesc,
    };

    const res = await axios.post("/api/createFolder", data);
    if (res.status == 200) {
      fetchData();
    }
    console.log("qwertyui ", res);
    return res;
  };

  const [workspace, setWorkspace] = useState<Workspace[]>([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const [makefolder, setMakeFolder] = useState(false);
  const [folderTitle, setFolderTitle] = useState("");
  const [folderIcon, setFolderIcon] = useState("");
  const [folderBannerURL, setFolderBannerURL] = useState("");
  const [folderDesc, setFolderDesc] = useState("");

  const [loading, setLoading] = useState(true);
  const [InviteUser, setInviteUser] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>([]);
  const [openCollab, setOpenCollab] = useState(false);
  const router = useParams();

  const workspaceId = router;
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
    ["link"],
    ["clean"],
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const user = await supabase.auth.getSession();
      setUser(user);
      const data = {
        workspaceId: workId,
      };
      const res = await axios.post("/api/sidebar", data);
      console.log(res.data);

      if (res.data.success) {
        setWorkspace(res.data.workspace);
        // console.log(res.data.workspace[0].workspacePrivate);

        if (
          user.data.session?.user.id &&
          res.data.workspace[0].workspacePrivate
        ) {
          console.log("vbnm");
          // const isCollab=re
          if (res.data.workspace[0].ownerId != user.data.session?.user.id) {
            console.log("not owner");
            const isCollab = res.data.workspace[0].collaborators.find(
              (obj: any) => obj.collaboratorId === user.data.session?.user.id
            );
            console.log("iscollabed", isCollab);
            if (Object.keys(isCollab).length == 0) {
              forward.push("/notAllowed");
            } else {
              // handleDisable(false);
              setDisabled(false);
              setIsDisabled(false);
              console.log("not disabled");
            }
          } else {
            console.log("owner");
            // handleDisable(false);
            setDisabled(false);
            setIsDisabled(false);
          }
          console.log(res.data.workspace[0].collaborators);
        }
        if (
          user.data.session?.user.id &&
          res.data.workspace[0].workspacePrivate
        ) {
          console.log("vbnm");
          // const isCollab=re
          if (res.data.workspace[0].ownerId != user.data.session?.user.id) {
            console.log("not owner");
            const isCollab = res.data.workspace[0].collaborators.find(
              (obj: any) => obj.collaboratorId === user.data.session?.user.id
            );
            console.log("iscollabed", isCollab);
            if (Object.keys(isCollab).length != 0) {
              // handleDisable(true);
              setDisabled(true);
              setIsDisabled(true);
            } else {
              // handleDisable(false);
              setDisabled(false);
              setIsDisabled(false);
              console.log("not disabled");
            }
          } else {
            console.log("owner");
          }
          console.log(res.data.workspace[0].collaborators);
        }

        setLoading(false);
      }

      // console.log(workspace);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    if (!workspaceId) return; // Ensure workspaceId is available

    fetchData();
  }, [workId]); // Add workspaceId to the dependency array

  return (
    <div className="border-r-2 border-black h-full w-[25vw] flex flex-col items-center p-4 pt-8 overflow-auto">
      {loading ? (
        <>
          <h1>loading</h1>
        </>
      ) : (
        // <h1>loaded</h1>
        <div className="flex flex-col w-full">
          <Link
            href={`/dashboard/${workspace[0].workspaceId}`}
            className="text-5xl hover:underline duration-200 pb-2"
          >
            <h1>
              {workspace[0].workspaceIcon}
              {"  "}
              {workspace[0].workspaceTitle}
            </h1>
          </Link>
          <div className="flex w-full justify-center">
            {InviteUser ? (
              <div
                className="absolute inset-0 flex items-center justify-center w-full h-full backdrop-blur-sm"
                onClick={() => {
                  setInviteUser(false);
                }}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <InviteUserPage workspaceId={workId} />
                </div>
              </div>
            ) : (
              <></>
            )}

            <div className="flex w-full justify-start gap-4  ">
              <button
                className="text-xl hover:bg-zinc-800 p-2 rounded-md duration-300"
                onClick={() => {
                  setOpenCollab(!openCollab);
                }}
              >
                Collaborators
              </button>
              <button
                className="text-xl hover:bg-zinc-800 p-2 rounded-md duration-300"
                disabled={isDisabled}
                onClick={() => {
                  setInviteUser(!InviteUser);
                }}
              >
                Invite
              </button>
            </div>
            <div></div>
          </div>
          <div
            className={`transition-max-height duration-500 ease-in-out overflow-hidden  ${
              openCollab ? "max-h-screen " : "max-h-0"
            }`}
          >
            {openCollab ? (
              <div className="pl-2">
                {workspace[0].collaborators.length == 0 ? (
                  <>no collaborators</>
                ) : (
                  <>
                    <div>
                      {workspace[0].collaborators.map(
                        (collab: any, index: number) => (
                          <div
                            key={index}
                            className="flex h-8 w-2/3 border-b-[1px] justify-between p-2"
                          >
                            <Collaborators
                              isDisabled={isDisabled}
                              collId={collab.collId}
                              collaboratorAvatar={collab.collaboratorAvatar}
                              collaboratorEmail={collab.collaboratorEmail}
                              collaboratorId={collab.collaboratorId}
                              collaboratorsName={collab.collaboratorsName}
                            />
                            {/* {collab.collaboratorsName ||
                              collab.collaboratorEmail}
                            <button
                              disabled={isDisabled}
                              onClick={() => {
                                removeCollab(collab.collId);
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faXmark}
                                className="hover:opacity-90 dur opacity-60"
                              />
                            </button> */}
                          </div>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <></>
            )}
          </div>
          <Link
            className="text-xl hover:bg-zinc-800 p-2 rounded-md w-fit duration-300"
            href={`/trash/${workId}`}
          >
            Trash
          </Link>
          <hr />
          <div className="flex flex-col text-xs ">
            Create Folder
            <button
              className="border-2 rounded-md p-4 w-1/4 hover:bg-white/15 duration-300"
              disabled={isDisabled}
              onClick={() => {
                setMakeFolder(!makefolder);
              }}
            >
              <FontAwesomeIcon icon={faPlus} size="xl" />
            </button>
          </div>
          {!makefolder ? (
            <div></div>
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center w-full h-full backdrop-blur-sm"
              onClick={() => {
                setMakeFolder(!makefolder);
              }}
            >
              <div
                className="flex flex-col p-6 gap-2 h-3/4 bg-black w-1/2 rounded-xl items-center border-2"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div className="flex w-full gap-2 text-4xl">
                  <span className="flex flex-col w-1/5">
                    <label htmlFor="icon" className="text-sm">
                      Folder Icon
                    </label>
                    <input
                      id="icon"
                      className="w-full bg-transparent border-2 rounded-md p-2"
                      disabled={isDisabled}
                      type="text"
                      value={folderIcon}
                      // placeholder="folderIcon"
                      onChange={(e) => {
                        setFolderIcon(e.target.value);
                      }}
                    />
                  </span>
                  <span className="flex flex-col w-4/5">
                    <label htmlFor="input" className="text-sm">
                      Folder Title
                    </label>
                    <input
                      id="title"
                      className="w-full bg-transparent border-2 rounded-md p-2"
                      disabled={isDisabled}
                      type="text"
                      value={folderTitle}
                      // placeholder="folderTitle"
                      onChange={(e) => {
                        setFolderTitle(e.target.value);
                      }}
                    />
                  </span>
                </div>
                <span className="flex overflow-hidden gap-8 w-full ">
                  <input
                    disabled={isDisabled}
                    className="w-4/5 bg-transparent border-2 rounded-md p-2"
                    type="text"
                    value={folderBannerURL}
                    placeholder="Folder Banner URL"
                    onChange={(e) => {
                      setFolderBannerURL(e.target.value);
                    }}
                  />
                  <div
                    onMouseEnter={() => {
                      setOpen(true);
                    }}
                    onMouseLeave={() => {
                      setOpen(false);
                    }}
                    className="w-1/5 bg-transparent border-2 rounded-md p-2 flex justify-center items-center"
                  >
                    Preview
                  </div>
                  <div
                    className={
                      open
                        ? "absolute  top-1/4 right-12 rounded-md border-2 h-1/5 w-1/5 object-cover overflow-hidden"
                        : "hidden"
                    }
                  >
                    <img
                      src={folderBannerURL}
                      alt=""
                      className="h-full w-full"
                    />
                  </div>
                </span>
                <div className="h-full">
                  <ReactQuill
                    className="h-3/4  text-ellipsis "
                    value={folderDesc}
                    readOnly={isDisabled}
                    modules={{ toolbar: toolbarOptions }}
                    onChange={(content) => {
                      setFolderDesc(content);
                    }}
                  ></ReactQuill>
                </div>

                <button
                  className="border-2 w-1/2 p-1 rounded-md hover:bg-white/35"
                  disabled={isDisabled}
                  onClick={() => {
                    addFolder();
                    fetchData();
                    setMakeFolder(!makefolder);
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          )}
          <h1>Folders 📂</h1>
          <hr />
          <div className="h-[61vh] overflow-auto">
            {workspace[0].folders.map((fold: any, index: number) => (
              <div
                key={index}
                className="flex w-full justify-between align-top my-2"
              >
                {/* <Link
                  className={
                    router.folderId == fold.folderId ? "bg-red-200" : ""
                  }
                  href={`/folder/${fold.folderId}`}
                >
                   {console.log(fold.id)} 
                  {fold.folderIcon} {"  "}
                  {fold.folderTitle}
                </Link> */}
                <ShowFiles
                  isDisabled={isDisabled}
                  folderId={fold.folderId}
                  folderIcon={fold.folderIcon}
                  folderTitle={fold.folderTitle}
                  workspaceId={workId}
                  owner={user.data.session?.user.id}
                  username={user.data.session?.user.email}
                />
                <div className="flex items-start">
                  <button
                    className="flex items-center mx-2"
                    disabled={isDisabled}
                    onClick={() => {
                      inTrash({ folderId: fold.folderId, index: index });
                    }}
                  >
                    {" "}
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="hover:-translate-y-1 duration-300"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default Sidebar;
