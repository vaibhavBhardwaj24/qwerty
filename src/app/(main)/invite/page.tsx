"use client";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

const InvitePage = () => {
  const router = useSearchParams();
  const [err, setErr] = useState(false);
  const route = useRouter();
  const [errMess, setErrMess] = useState("");
  const workspaceId = router.get("workspaceId");
  const userId = router.get("userId");
  console.log(workspaceId, userId);
  const supabase = createClient();

  const addCollab = async () => {
    const user = await supabase.auth.getSession();
    console.log(typeof userId);
    if (user.data.session?.user.id != userId) {
      console.log(typeof user.data.session?.user.id);

      setErr(true);
      setErrMess("invalid user");
      return;
    }
    const res = await supabase.from("collaborators").insert({
      workspaceId: workspaceId,
      collabId: userId,
      email: user.data.session?.user.email,
    });
    console.log(res);
    if (res.status == 201) {
      route.replace(`/dashboard/${workspaceId}`)
    }
    if (res.error) {
      setErr(true);
      setErrMess(res.error.message);
    }
  };
  return (
    <div className="w-full pt-8 h-full flex flex-col">
      Invite Page
      {/* <h1>{workspaceId}</h1> */}
      <div>
        {err ? (
          <>
            <h1>Error {errMess}</h1>
          </>
        ) : (
          <></>
        )}
        <button
          className="hover:bg-white/30 p-4 rounded-md w-fit h-fit"
          onClick={() => {
            addCollab();
          }}
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default InvitePage;
