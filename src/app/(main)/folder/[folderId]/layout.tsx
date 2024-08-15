"use client";
import Sidebar from "@/components/Sidebar";
import React, { useState } from "react";
import FolderDetail from "./page";
import { useCustomContext } from "@/lib/providers/customProvider";

const FolderLayout = ({ children }: { children: React.ReactNode }) => {
  const [workId, setWorkId] = useState("");
  const { loading, setLoading } = useCustomContext();
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
    <main className="flex flex-row  h-full w-full">
      {loading ? (
        <>loading...</>
      ) : (
        <>
          <Sidebar />
        </>
      )}
      <FolderDetail />
    </main>
  );
};

export default FolderLayout;
