"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileSetup } from "@/lib/serverAction/authAction";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/utils/cn";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const ProfileSetupPage = () => {
  const supabase = createClient();
  const router = useRouter();
  const profile = async () => {
    profileSetup({ full_name: fullName, avatar_url: avatarURL, userId: user });
    console.log("submitted");
    router.push("/dashboard");
  };
  useEffect(() => {
    const fetchData = async () => {
      const user = await supabase.auth.getSession();
      setUser(user.data.session?.user.id || "");
    };
    fetchData();
  }, []);
  const [user, setUser] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarURL, setAvatarURL] = useState("");
  return (
    <div>
      <div className="bg-dot-white/[0.2] h-[100vh] items-center flex">
        <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black border-[1px] border-white/[0.46]  ">
          <h1 className="text-7xl font-bold bg-clip-text bg-gradient-to-b from-zinc-500 to-gray-800 text-transparent p-6 flex items-center justify-center w-full">
            Profile Setup
          </h1>
          <form action="" className="my-8">
            <div className="flex flex-col md:flex-col space-y-2 md:space-y-0 md:space-x-2 mb-4 gap-4 ">
              <div className={cn("flex flex-col space-y-2 w-full")}>
                <Label htmlFor="username">Your Name</Label>
                <Input
                  id="username"
                  placeholder="Tyler Durden"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                  }}
                />
              </div>
              <div className={cn("flex flex-col space-y-2 w-full")}>
                <Label htmlFor="pass">Avatar URL</Label>
                <Input
                  id="pass"
                  placeholder="URL"
                  type="text"
                  value={avatarURL}
                  onChange={(e) => {
                    setAvatarURL(e.target.value);
                  }}
                />
              </div>
              <button
                className="bg-gradient-to-br relative group/btn font-bold text-2xl from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font -medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  profile();
                }}
              >
                Submit
                <BottomGradient />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* <input
        type="text"
        value={fullName}
        onChange={(e) => {
          setFullName(e.target.value);
        }}
      />
      <input
        type="text"
        value={avatarURL}
        onChange={(e) => {
          setAvatarURL(e.target.value);
        }}
      />
      <button
        onClick={() => {
          profile();
        }}
      >
        Submit
      </button> */}
    </div>
  );
};

export default ProfileSetupPage;
const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};
