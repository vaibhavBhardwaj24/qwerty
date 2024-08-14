"use client";
import db from "@/lib/supabase/db";
import React, { useState } from "react";
import { workspace } from "../../migrations/schema";
import axios from "axios";
interface WSProps {
  ownerID: string;
}
const CreateWorkSpace: React.FC<WSProps> = ({ ownerID }) => {
  const [title, setTitle] = useState("");
  const [iconId, setIconId] = useState("");
  const [workDesc, setWorkdesc] = useState("");
  const [bannerURL, setBannerURL] = useState(null);
  const create = async () => {
    const data = {
      title: title,
      iconId: iconId,
      ownerID: ownerID,
    };
    console.log("here reached");

    const res = await axios.post("api/createWorkSpace", data);
    console.log(res);

    return res;
  };
  return (
    <>
      <input
        type="text"
        placeholder="title"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
      />
      <input
        type="text"
        placeholder="Icon"
        maxLength={1}
        value={iconId}
        onChange={(e) => {
          setIconId(e.target.value);
        }}
      />
      <input type="text" placeholder="Description" />
      <button
        onClick={() => {
          create();
        }}
      >
        Create
      </button>
    </>
  );
};

export default CreateWorkSpace;
