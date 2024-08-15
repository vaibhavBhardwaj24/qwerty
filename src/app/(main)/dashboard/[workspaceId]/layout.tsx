"use client";
import Sidebar from "@/components/Sidebar";
import React, { useEffect, useState } from "react";
import SingleWorkSpace from "./page";
import { useCustomContext } from "@/lib/providers/customProvider";
const WorkSpaceLayout = ({ children }: { children: React.ReactNode }) => {
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
  // useEffect(()=>{},[disabled])
  return (
    <main className="flex flex-row  h-full w-full">
      {/*  */}

      <div>
        {loading ? (
          <>loading...</>
        ) : (
          <div className="h-full">
            {/* <h1>{workId}</h1> */}
            <Sidebar />
          </div>
        )}
      </div>
      <SingleWorkSpace />
    </main>
  );
};

export default WorkSpaceLayout;
