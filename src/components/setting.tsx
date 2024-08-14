import { createClient } from "@/lib/supabase/client";
import React, { useState } from "react";
interface settingProps {
  workspaceId: string;
  workspaceTitle: string;
  workspaceIcon: string;
  workspaceData: string;
  workspaceBanner: string;
  workspacePrivate: boolean;
}
const Setting: React.FC<settingProps> = ({
  workspaceId,
  workspaceTitle,
  workspaceIcon,
  workspaceData,
  //   workspaceCreatedAt,
  workspaceBanner,
  workspacePrivate,
}) => {
  const supabase = createClient();
  const [mode, setMode] = useState(false);

  const [workBanner, setWorkspaceBanner] = useState(workspaceBanner);
  const [workPrivate, setWorkspacePrivate] = useState(workspacePrivate);
  const saveData = async () => {
    const res = await supabase
      .from("workspace")
      .update({
        // title: workTitle,
        // iconId: workIcon,
        // data: workData,
        private: workPrivate,
        bannerURL: workBanner,
      })
      .eq("id", workspaceId);
    console.log(res);
  };
  return (
    <div className="w-full h-full flex flex-col bg-black rounded-xl border-2 border-white p-7">
      <div className="flex w-full h-full flex-col">
        <h1 className="text-3xl">Settings</h1>
        <div>
          <button
            className="rounded-md hover:bg-white/30"
            onClick={() => {
              setMode(!mode);
            }}
          >
            MODE
          </button>
          {mode && (
            <div
              className="origin-top-right absolute right-[60%] mt-2 w-30 rounded-md shadow-lg bg-blue-600/15 ring-1 ring-black ring-opacity-5 border-2 border-blue-700"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
            >
              <div className="py-" role="none">
                <div
                  className={
                    "text-blue-600 block px-4 py-2 text-sm hover:bg-blue-600/30 cursor-pointer"
                  }
                  role="menuitem"
                  onClick={() => {
                    setWorkspacePrivate(true);
                  }}
                >
                  PRIVATE {workPrivate ? "✔" : ""}
                </div>
                <div
                  className={
                    "text-blue-600 block px-4 py-2 text-sm hover:bg-blue-600/30 cursor-pointer"
                  }
                  role="menuitem"
                  onClick={() => {
                    setWorkspacePrivate(false);
                  }}
                >
                  PUBLIC {!workPrivate ? "✔" : ""}
                </div>
              </div>
            </div>
          )}{" "}
          <input
            type="text"
            // readOnly={edit}
            value={workBanner}
            onChange={(e) => {
              setWorkspaceBanner(e.target.value);
            }}
          />
        </div>{" "}
        <button
          onClick={() => {
            saveData();
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default Setting;
