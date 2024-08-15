"use client";

import React, { Suspense } from "react";
import InvitePage from "./InvitePage"; // Adjust the import path as necessary
import LoadingPage from "@/components/ui/loading";

const InvitePageWrapper = () => (
  <div className="w-full h-full flex justify-center items-center bg-grid-white/[0.2] ">
    <Suspense
      fallback={
        <div className="w-full h-full">
          <LoadingPage />
        </div>
      }
    >
      <InvitePage />
    </Suspense>
  </div>
);

export default InvitePageWrapper;
