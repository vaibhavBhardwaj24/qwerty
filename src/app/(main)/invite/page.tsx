"use client";

import React, { Suspense } from "react";
import InvitePage from "./InvitePage"; // Adjust the import path as necessary

const InvitePageWrapper = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <InvitePage />
  </Suspense>
);

export default InvitePageWrapper;
