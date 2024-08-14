"use client";
import db from "@/lib/supabase/db";
import React, { useState } from "react";
import { users } from "../../../migrations/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/client";
import { inviteMail } from "@/lib/nodeMailer/inviteToWorkspace";
import Collaborators from "../collaborators";
interface InviteProps {
  workspaceId: any;
}
const InviteUserPage: React.FC<InviteProps> = ({ workspaceId }) => {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState([]);

  const supabase = createClient();
  const findUser = async () => {
    const userFound = await supabase.from("users").select().eq("email", email);
    // const userFound = await db
    //   .select()
    //   .from(users)
    //   .where(eq(users.email, email));
    console.log(userFound.data);

    if (userFound == null && userFound == undefined) {
      return;
    }
    if (userFound.data?.length > 0) {
      console.log("user found");

      setUser(userFound.data);
    }
  };
  const InviteUser = async (userId: string, email: string) => {
    const res = await inviteMail({
      email: email,
      userId: userId,
      workspaceId: workspaceId,
    });
    console.log(res);
  };
  return (
    <div className="absolute bg-black border-2 p-5 rounded-md ">
      Invite User
      {/* <h1>{workspaceId}</h1> */}
      <div className="flex flex-col">
        <input
          type="text"
          className="bg-transparent border-2 p-2 rounded-md"
          placeholder="enter email to invite"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <button
          onClick={() => {
            findUser();
          }}
        >
          Search
        </button>
        {user.map((use, index) => (
          <div key={index} className="w-full flex justify-between">
            {/* <Collaborators /> */}
            {use.email}
            <button
            className="hover:bg-white/30 rounded-md p-2"
              onClick={() => {
                InviteUser(use.id, use.email);
              }}
            >
              Invite
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InviteUserPage;
