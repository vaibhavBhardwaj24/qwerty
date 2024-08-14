import React, { useEffect, useState } from "react";
interface PopupProps {
  error: boolean;
  message: string;
}
const Popup: React.FC<PopupProps> = ({ error, message }) => {
  const [open, setOpen] = useState(true);
  const reggi = async () => {
    setTimeout(() => setOpen(false), 3000);
  };
  useEffect(() => {
    reggi();
  }, []);
  return (
    <div className={`fixed left-[94%]`}>
      <div
        className={`absolute top-5 ${
          error ? "bg-red-800" : "bg-green-800"
        }  p-2 rounded-md transform ${
          open ? "translate-y-[20px]" : "-translate-y-60"
        } transition-transform duration-1000`}
        onClick={() => {
          setOpen(true);
          reggi();
        }}
      >
        {message}
      </div>
    </div>
  );
};

export default Popup;
