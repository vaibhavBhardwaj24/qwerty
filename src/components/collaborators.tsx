import { createClient } from "@/lib/supabase/client";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
interface collabProps {
  collId: string;
  collaboratorAvatar: string;
  collaboratorEmail: string;
  collaboratorId: string;
  collaboratorsName: string;
  isDisabled: boolean;
}
const Collaborators: React.FC<collabProps> = ({
  collId,
  collaboratorAvatar,
  collaboratorEmail,
  collaboratorId,
  collaboratorsName,
  isDisabled,
}) => {
  const supabase = createClient();
  const [color, setColor] = useState("");
  const removeCollab = async (collId: string) => {
    const res = await supabase.from("collaborators").delete().eq("id", collId);
    console.log(res);
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
    const color = stringToHexColor(collId);
    setColor(color);
  }, []);
  return (
    <div className="flex justify-between w-full">
      <div className="">
        <div className="h-5 w-fit rounded-full flex-row flex gap-1 ">
          {collaboratorAvatar ? (
            <>
              <img
                className="h-5 w-5 rounded-full object-fill"
                src={collaboratorAvatar}
                alt=""
              />
            </>
          ) : (
            <>
              <div
                className="h-5 w-5 rounded-full text-xs font-bold text-black flex justify-center items-center"
                style={{ backgroundColor: color }}
              >
                {collaboratorEmail.substring(0, 2)}
              </div>
            </>
          )}

          {collaboratorsName || collaboratorEmail}
        </div>
      </div>
      <button
        disabled={isDisabled}
        onClick={() => {
          removeCollab(collId);
        }}
      >
        <FontAwesomeIcon
          icon={faXmark}
          className="hover:opacity-90 dur opacity-60"
        />
      </button>{" "}
    </div>
  );
};

export default Collaborators;
