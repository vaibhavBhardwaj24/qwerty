"use client";
import Sidebar from "@/components/Sidebar";
import React, { useEffect, useState } from "react";
import SingleWorkSpace from "./page";
import { useCustomContext } from "@/lib/providers/customProvider";
import LoadingPage from "@/components/ui/loading";
const WorkSpaceLayout = ({ children }: { children: React.ReactNode }) => {
  const [workId, setWorkId] = useState("");
  const { loading, setLoading } = useCustomContext();
  const [disabled, setDisabled] = useState(true);
  return (
    <main className="flex flex-row  h-full w-full">
      {/*  */}

      <div>
        {loading ? (
          <div className="w-full h-full">
            <LoadingPage />
          </div>
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
