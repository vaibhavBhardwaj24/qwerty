"use client";
import Sidebar from "@/components/Sidebar";
import React, { useState } from "react";
import FilePage from "./page";
import { CustomProvider } from "@/lib/providers/customProvider";
const FileLayout = ({ children }: { children: React.ReactNode }) => {
  const [workId, setWorkId] = useState("");
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(true);

  const handleWorkId = (data: string) => {
    setWorkId(data);
    console.log(workId);
  };

  const handleLoading = (data: boolean) => {
    setLoading(data);
  };

  const handleDisable = (data: boolean) => {
    setDisabled(data);
    console.log(disabled);
  };

  return (
    <CustomProvider>
      <main className="flex flex-row  h-full w-full">
        {loading ? (
          <>loading...</>
        ) : (
          <Sidebar handleDisable={handleDisable} workspaceIdProp={workId} />
        )}
        <FilePage
          getWorkId={handleWorkId}
          setSideLoad={handleLoading}
          // isDisabled={disabled}
        />
      </main>
    </CustomProvider>
  );
};

export default FileLayout;