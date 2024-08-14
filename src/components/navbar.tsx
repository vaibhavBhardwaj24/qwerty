"use client";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Navbar = () => {
  const supabase = createClient();
  const route = useRouter();
  const [user, SetUser] = useState(false);
  const [color, setColor] = useState("");
  const [URL, setURL] = useState("");
  const [short, setShort] = useState("");
  const signOut = async () => {
    const res = await supabase.auth.signOut();
    console.log(res);
    route.push("/signUp");
  };
  const stringToHexColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
    }

    // Convert hash to a 6-digit hex code
    const color =
      ((hash >> 16) & 0xff).toString(16).padStart(2, "0") +
      ((hash >> 8) & 0xff).toString(16).padStart(2, "0") +
      (hash & 0xff).toString(16).padStart(2, "0");

    return `#${color}`;
  };
  useEffect(() => {
    const getUser = async () => {
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        SetUser(true);
        console.log(user);
        const color = stringToHexColor(user.data.user.id);
        setColor(color);
        // setURL(user.data.session.user.user_metadata.)
        setShort(user.data.user.email?.substring(0, 2));
        if (!user.data.user.user_metadata.email_verified) {
          route.replace("/verify");
          console.log(user.data.user.user_metadata.email_verified);
          
        }
      }
    };
    getUser();
  }, []);
  return (
    <div className="bg-black h-fit flex justify-between ">
      {/* {collaboratorAvatar ? (
        <>
          <img
            className="h-5 w-5 rounded-full object-fill"
            src={collaboratorAvatar}
            alt=""
          />
        </>
      ) : (
        <>
          
        </>
      )} */}
      <Link href={"/profileSetup"}>
        <div
          className="h-7 w-7  ml-2 rounded-full text-sm font-bold text-black flex justify-center items-center hover:border-[2px] cursor-pointer "
          style={{ backgroundColor: color }}
        >
          {short}
        </div>
      </Link>
      {user ? (
        <div>
          <button
            className="hover:underline"
            onClick={() => {
              signOut();
            }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <button
            className="hover:underline"
            onClick={() => {
              route.push("/signUp");
            }}
          >
            Sign In/Sign Up
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
