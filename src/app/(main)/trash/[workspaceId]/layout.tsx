"use client";
import Sidebar from "@/components/Sidebar";
import React, { useState } from "react";
import FilePage from "./page";
import {
  CustomProvider,
  useCustomContext,
} from "@/lib/providers/customProvider";
import TrashPage from "./page";
const FileLayout = ({ children }: { children: React.ReactNode }) => {
  const [workId, setWorkId] = useState("");
  const { loading, setLoading } = useCustomContext();
  const [disabled, setDisabled] = useState(true);

  return (
    <CustomProvider>
      <main className="flex flex-row  h-full w-full">
        <Sidebar />

        <TrashPage />
      </main>
    </CustomProvider>
  );
};

export default FileLayout;
