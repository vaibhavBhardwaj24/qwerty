'use client'
import { useRouter } from "next/navigation";
import React from "react";

const NotAllowed = () => {
  const router = useRouter();
  return (
    <div className="flex w-full h-full justify-center items-center flex-col">
      <div className=" text-9xl m-4 bg-clip-text bg-gradient-to-b from-gray-50 to-gray-400 text-transparent">
        Not Allowed
      </div>
      <button
        className="text-2xl bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        onClick={() => {
          router.push("/dashboard");
        }}
      >
        Dashboard
      </button>
    </div>
  );
};

export default NotAllowed;
