import { createClient } from "@/lib/supabase/client";
import { faCheck, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
interface subTodoProps {
  id: string;
  isCompleted: boolean;
  subTask: string;
}
const SubTodo: React.FC<subTodoProps> = ({ id, isCompleted, subTask }) => {
  const supabase = createClient();
  const [isComplete, setIsComplete] = useState(isCompleted);
  //   const isCom = useRef(isComplete);
  const [todoEdit, setTodoEdit] = useState(subTask || "");
  const [edit, setEdit] = useState(true);
  const toggleComplete = async (isCom: boolean) => {
    const res = await supabase
      .from("subTodo")
      .update({ isCompleted: isCom })
      .eq("id", id);
    console.log(res, "aiai", isCom);
  };
  const editTodo = async () => {
    const res = await supabase
      .from("todo")
      .update({
        task: todoEdit,
      })
      .eq("id", id);
    console.log(res);
    if (res.status==204) {
      setEdit(true)
    }
  };
  const deleteTodo = async () => {
    const res = await supabase.from("subTodo").delete().eq("id", id);
    console.log(res);
  };
  useEffect(() => {
    console.log("onload", isCompleted);

    setIsComplete(isCompleted);
    console.log("after", isComplete);
  }, []);
  return (
    <div className="flex w-2/3 justify-center">
      <div className="flex gap-2 justify-center">
        <textarea
          // type="text"
          className="resize-none bg-transparent h-fit"
          value={todoEdit}
          disabled={edit}
          onChange={(e) => {
            setTodoEdit(e.target.value);
          }}
        />
        {edit ? (
          <>
            {" "}
            <button
              onClick={() => {
                setEdit(false);
              }}
            >
              <FontAwesomeIcon
                className="hover:-rotate-12 duration-300  hover:opacity-90 opacity-60"
                icon={faPencil}
              />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                editTodo();
                // setEdit(true);
              }}
              disabled={edit}
            >
              <FontAwesomeIcon
                className="hover:scale-125 duration-300  hover:opacity-90  opacity-100"
                icon={faCheck}
              />
            </button>
          </>
        )}
        <button
          onClick={() => {
            deleteTodo();
          }}
        >
          <FontAwesomeIcon
            icon={faTrash}
            className="hover:-translate-y-1 duration-300  hover:opacity-90  opacity-60"
          />
        </button>
        <div className="h-full flex items-center">
          <div
            onChange={() => {
              setIsComplete(!isComplete);
              toggleComplete(!isComplete);
            }}
            className={
              isComplete
                ? "h-3 w-3 rounded-sm bg-green-800 m-1"
                : "h-3 w-3 rounded-sm border-green-800 border-[1px] hover:bg-green-800/45 m-1"
            }
          ></div>
        </div>
        {/* <input
          type="checkbox"
          checked={isComplete}
          onChange={() => {
            setIsComplete(!isComplete);
            toggleComplete(!isComplete);
          }}
        /> */}
      </div>
    </div>
  );
};

export default SubTodo;
