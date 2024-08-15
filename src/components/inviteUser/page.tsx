"use client";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { inviteMail } from "@/lib/nodeMailer/inviteToWorkspace";

interface User {
  id: string;
  email: string;
}

interface InviteProps {
  workspaceId: string;
}

const InviteUserPage: React.FC<InviteProps> = ({ workspaceId }) => {
  const [email, setEmail] = useState<string>("");
  const [user, setUser] = useState<User[]>([]);
  const supabase = createClient();

  const findUser = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("email", email);

      if (error) {
        console.error("Error finding user:", error);
        return;
      }

      if (data?.length > 0) {
        console.log("User found");
        setUser(data);
      } else {
        console.log("No user found");
        setUser([]);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const InviteUser = async (userId: string, email: string) => {
    try {
      const res = await inviteMail({
        email: email,
        userId: userId,
        workspaceId: workspaceId,
      });
      console.log(res);
    } catch (error) {
      console.error("Error inviting user:", error);
    }
  };

  return (
    <div className="absolute bg-black border-2 p-5 rounded-md">
      <h1 className="text-white text-lg mb-4">Invite User</h1>
      <div className="flex flex-col">
        <input
          type="text"
          className="bg-transparent border-2 p-2 rounded-md mb-2"
          placeholder="Enter email to invite"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={findUser}
          className="bg-blue-500 text-white p-2 rounded-md mb-4"
        >
          Search
        </button>
        {user.length > 0 && (
          <div className="space-y-2">
            {user.map((u, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded-md">
                <span className="text-white">{u.email}</span>
                <button
                  className="bg-green-500 text-white rounded-md p-2 hover:bg-green-600"
                  onClick={() => InviteUser(u.id, u.email)}
                >
                  Invite
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteUserPage;
