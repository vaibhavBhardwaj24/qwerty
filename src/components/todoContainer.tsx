"use client";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Todo from "./todo";
import axios from "axios";
import { useCustomContext } from "@/lib/providers/customProvider";
// interface todoProps{
//     workspaceId:string
// }
const TodoContainer = () => {
  const [percent, setPercent] = useState(0);
  const [todo, setTodo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [mode, setMode] = useState(1);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const [data, setData] = useState([]);
  const router = useParams();
  const workspaceId = router;
  const { disabled, setDisabled } = useCustomContext();
  const fetchData = async () => {
    setLoading(true);
    const res = await axios.post("/api/todo", {
      workspaceId: workspaceId.workspaceId,
    });
    console.log(res, "todo TodoContainer");
    setData(res.data.todo);
    const completedTodos = await res.data.todo.reduce(
      (count: number, todo: any) => (todo.todoCompleted ? count + 1 : count),
      0
    );
    console.log(completedTodos);
    setPercent((completedTodos / res.data.todo.length) * 100);
    setLoading(false);
  };
  const addTodo = async () => {
    const res = await supabase.from("todo").insert([
      {
        task: todo,
        workspaceId: workspaceId.workspaceId,
        // dueDate: dueDate,
      },
    ]);
    console.log(res);
    if (res.status == 201) {
      fetchData();
      setTodo("")
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="w-1/2">
      <h1 className="text-2xl">Todos</h1>
      <hr />
      <div className="p-2 gap-2 w-full flex">
        <input
          className="text-white bg-transparent border-2 border-white/15 rounded-md w-5/6 text-xl"
          disabled={disabled}
          type="text"
          value={todo}
          onChange={(e) => {
            setTodo(e.target.value);
          }}
        />
        <input
          className="text-white bg-transparent border-2 border-white/15 rounded-md w-1/10"
          disabled={disabled}
          type="date"
          value={dueDate}
          onChange={(e) => {
            setDueDate(e.target.value);
          }}
        />
        <button
          className="rounded-md  hover:bg-white/15 duration-300"
          disabled={disabled}
          onClick={() => {
            addTodo();
          }}
        >
          Add Todo
        </button>
      </div>
      <div>
        <div className=" flex mb-2">
          <button
            onClick={() => {
              setMode(1);
            }}
            className={
              mode == 1
                ? "px-3 text-red-900 border-b-2  border-red-900 font-bold "
                : "px-3"
            }
          >
            All
          </button>
          <button
            onClick={() => {
              setMode(2);
            }}
            className={
              mode == 2
                ? "px-3 text-red-900 border-b-2  border-red-900 font-bold"
                : "px-3"
            }
          >
            Completed
          </button>
          <button
            onClick={() => {
              setMode(3);
            }}
            className={
              mode == 3
                ? "px-3 text-red-900 border-b-2  border-red-900 font-bold"
                : "px-3"
            }
          >
            Remaining
          </button>
          <button
            onClick={() => {
              setMode(4);
            }}
            className={
              mode == 4
                ? "px-3 text-red-900 border-b-2  border-red-900 font-bold"
                : "px-3"
            }
          >
            Urgent
          </button>
        </div>
        {/* <br /> */}
        {/* <hr /> */}
        <div className="w-10/12 mt-1 flex items-center gap-2">
          <div className="w-full h-2  border-[1px] rounded-sm border-white/15">
            <div
              className=" bg-green-800 h-full"
              style={{ width: `${percent}%` }}
            ></div>
          </div>{" "}
          {percent.toFixed(1)}%
        </div>
        {loading ? (
          <>loading.....</>
        ) : (
          <div>
            {mode == 1 ? (
              <>
                {data.map((todo: any, index: number) => (
                  <div className="px-4 py-2" key={index}>
                    <Todo
                      workspaceId={workspaceId.workspaceId}
                      todoCompleted={todo.todoCompleted}
                      todoUrgent={todo.todoUrgent}
                      todoTask={todo.todoTask}
                      todoDueDate={todo.todoDueDate}
                      todoId={todo.todoId}
                    />
                  </div>
                ))}
              </>
            ) : (
              <></>
            )}
            {mode == 2 ? (
              <>
                {data
                  .filter((todo: any) => todo.todoCompleted)
                  .map((todo: any, index: number) => (
                    <div className="px-4 py-2" key={index}>
                      <Todo
                        workspaceId={workspaceId.workspaceId}
                        todoCompleted={todo.todoCompleted}
                        todoUrgent={todo.todoUrgent}
                        todoTask={todo.todoTask}
                        todoDueDate={todo.todoDueDate}
                        todoId={todo.todoId}
                      />
                    </div>
                  ))}
              </>
            ) : (
              <></>
            )}
            {mode == 3 ? (
              <>
                {data
                  .filter((todo: any) => !todo.todoCompleted)
                  .map((todo: any, index: number) => (
                    <div className="px-4 py-2" key={index}>
                      <Todo
                        workspaceId={workspaceId.workspaceId}
                        todoCompleted={todo.todoCompleted}
                        todoUrgent={todo.todoUrgent}
                        todoTask={todo.todoTask}
                        todoDueDate={todo.todoDueDate}
                        todoId={todo.todoId}
                      />
                    </div>
                  ))}
              </>
            ) : (
              <></>
            )}
            {mode == 4 ? (
              <>
                {data
                  .filter((todo: any) => todo.todoUrgent)
                  .map((todo: any, index: number) => (
                    <div className="px-4 py-2" key={index}>
                      <Todo
                        workspaceId={workspaceId.workspaceId}
                        todoCompleted={todo.todoCompleted}
                        todoUrgent={todo.todoUrgent}
                        todoTask={todo.todoTask}
                        todoDueDate={todo.todoDueDate}
                        todoId={todo.todoId}
                      />
                    </div>
                  ))}
              </>
            ) : (
              <></>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoContainer;
