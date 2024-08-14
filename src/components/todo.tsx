import { createClient } from "@/lib/supabase/client";
import React, { useEffect, useState } from "react";
import SubTodo from "./subTodo";
import { useCustomContext } from "@/lib/providers/customProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faL,
  faList,
  faPencil,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
// import "./check.css";
interface todoProps {
  todoCompleted: boolean;
  todoDueDate: string;
  todoId: string;
  todoTask: string;
  todoUrgent: boolean;
  workspaceId: string;
}
const Todo: React.FC<todoProps> = ({
  todoCompleted,
  todoDueDate,
  todoId,
  todoTask,
  todoUrgent,
  workspaceId,
}) => {
  const supabase = createClient();

  const { disabled, setDisabled } = useCustomContext();
  const [isComplete, setIsComplete] = useState(false);
  const [isUrgent, setIsUrgent] = useState(todoUrgent);
  const [todoEdit, setTodoEdit] = useState(todoTask);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subTodo, setSubTodo] = useState("");
  const [edit, setEdit] = useState(false);
  const [showSubTodo, setShowSubTodo] = useState(false);
  const [percent, setPercent] = useState(0);

  const toggleComplete = async () => {
    const newCompleteStatus = !isComplete; // Calculate the new status
    setIsComplete(newCompleteStatus); // Set the state immediately

    try {
      const res = await supabase
        .from("todo")
        .update({ isCompleted: newCompleteStatus })
        .eq("id", todoId);

      if (res.error) {
        console.error(res.error);
        // Optionally, revert state if the update fails
        setIsComplete(isComplete);
      } else {
        console.log("Updated successfully:", res, newCompleteStatus);
      }
    } catch (error) {
      console.error("Error updating:", error);
      setIsComplete(isComplete); // Revert state if error occurs
    }
  };

  const toggleUrgent = async () => {
    const newUrgentStatus = !isUrgent; // Calculate the new status
    setIsUrgent(newUrgentStatus); // Set the state immediately

    try {
      const res = await supabase
        .from("todo")
        .update({ isUrgent: newUrgentStatus })
        .eq("id", todoId);

      if (res.error) {
        console.error(res.error);
        // Optionally, revert state if the update fails
        setIsUrgent(isUrgent);
      } else {
        console.log("Updated successfully:", res, newUrgentStatus);
      }
    } catch (error) {
      console.error("Error updating:", error);
      setIsUrgent(isUrgent); // Revert state if error occurs
    }
  };

  const editTodo = async () => {
    const res = await supabase
      .from("todo")
      .update({
        task: todoEdit,
      })
      .eq("id", todoId);
    console.log(res);
    if (res.status == 204) {
      setEdit(!edit);
    }
  };
  const deleteTodo = async () => {
    const res = await supabase.from("todo").delete().eq("id", todoId);
    console.log(res);
  };
  const fetchData = async () => {
    const res = await supabase.from("subTodo").select("*").eq("todoId", todoId);
    setData(res.data);
    console.log(res);
    const completedTodos = await res.data.reduce(
      (count: number, todo: any) => (todo.isCompleted ? count + 1 : count),
      0
    );
    setPercent((completedTodos / res.data?.length) * 100);
    console.log(completedTodos / res.data?.length);
    setLoading(false);
  };
  const addSubTodo = async () => {
    const res = await supabase.from("subTodo").insert([
      {
        subTask: subTodo,
        workspaceId: workspaceId,
        todoId: todoId,
      },
    ]);
  };
  // useEffect(() => {
  //   setIsComplete(todoCompleted);
  // }, [todoCompleted]);
  useEffect(() => {
    setIsComplete(todoCompleted); // Sync local state with props
  }, [todoCompleted]);

  useEffect(() => {
    setIsUrgent(todoUrgent); // Sync local state with props
  }, [todoUrgent]);

  return (
    <div className="flex flex-col">
      <div className="flex w-full justify-between">
        {/* {edit ? "edit" : "no edit"} */}
        <textarea
          className="text-white bg-transparent resize-none w-full mr-2"
          // type="text"
          value={todoEdit}
          disabled={!edit || disabled}
          onChange={(e) => {
            setTodoEdit(e.target.value);
          }}
        />

        <div className=" flex gap-2">
          <div
            onClick={() => {
              toggleUrgent();
            }}
            className={
              isUrgent
                ? "flex bg-red-800/40 rounded-md w-fit justify-center items-center"
                : "flex hover:bg-red-800/40 rounded-md w-fit justify-center items-center duration-300"
            }
          >
            <div
              className={
                isUrgent
                  ? "h-5 w-5 rounded-md bg-red-800 m-1"
                  : "h-5 w-5 rounded-md border-red-800 border-[2px] m-1"
              }
            ></div>
            <h1 className="m-1">Urgent</h1>
          </div>
          <div
            onClick={() => {
              toggleComplete();
            }}
            className={
              isComplete
                ? "flex bg-green-800/40 rounded-md w-fit justify-center items-center"
                : "flex hover:bg-green-800/40 rounded-md w-fit justify-center items-center duration-300"
            }
          >
            <div
              className={
                isComplete
                  ? "h-5 w-5 rounded-md bg-green-800 m-1"
                  : "h-5 w-5 rounded-md border-green-800 border-[2px] m-1"
              }
            ></div>
            <h1 className="m-1 ">Completed</h1>
          </div>

          {!edit ? (
            <button
              disabled={disabled}
              onClick={() => {
                setEdit(!edit);
              }}
            >
              <FontAwesomeIcon
                className="hover:-rotate-12 duration-300 text-xl hover:opacity-90 opacity-60"
                icon={faPencil}
              />
            </button>
          ) : (
            <button
              onClick={() => {
                editTodo();
              }}
              disabled={!edit || disabled}
            >
              <FontAwesomeIcon
                className="hover:scale-125 duration-300 text-xl hover:opacity-90  opacity-100"
                icon={faCheck}
              />
            </button>
          )}
          <button
            onClick={() => {
              fetchData();
              setShowSubTodo(!showSubTodo);
            }}
          >
            <FontAwesomeIcon
              icon={faList}
              className=" duration-300 text-xl hover:opacity-90  opacity-60"
            />
          </button>
          <button
            disabled={disabled}
            onClick={() => {
              deleteTodo();
            }}
          >
            <FontAwesomeIcon
              icon={faTrash}
              className="hover:-translate-y-1 duration-300 text-xl hover:opacity-90  opacity-60"
            />
          </button>
        </div>
      </div>
      {showSubTodo ? (
        <>
          {loading ? (
            <></>
          ) : (
            <>
              <div className="w-10/12 mt-1 flex items-center gap-2">
                <div className="w-full h-2  border-[1px] rounded-sm border-white/15">
                  <div
                    className=" bg-green-800 h-full"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>{" "}
                {percent.toFixed(1)}%
              </div>
              <div className="flex w-10/12 gap-2 h-8 justify-center my-2">
                <input
                  className="bg-transparent border-2 px-1 rounded-md w-10/12"
                  type="text"
                  placeholder="SubTodo"
                  value={subTodo}
                  onChange={(e) => {
                    setSubTodo(e.target.value);
                  }}
                />
                <button
                  className="border-2 border-white/35 rounded-md px-2"
                  onClick={() => {
                    addSubTodo();
                  }}
                >
                  Add
                </button>
              </div>
              {data.map((todo, index) => (
                <div key={index}>
                  <SubTodo
                    id={todo.id}
                    subTask={todo.subTask}
                    isCompleted={todo.isCompleted}
                  />
                </div>
              ))}
            </>
          )}
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Todo;
