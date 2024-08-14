"use client";
import React, { useState } from "react";

const App = () => {
  const [openIndex, setOpenIndex] = useState(false);

  const handleToggle = () => {
    setOpenIndex(!openIndex);
  };

  const sections = {
    title: "Section 1",
    content: "Content for section 1.",
  };

  const collaborators = [
    {
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
    },
    {
      name: "Bob Smith",
      email: "bob.smith@example.com",
    },
    {
      name: "Carol White",
      email: "carol.white@example.com",
    },
  ];

  return (
    <div className="p-8 max-w-md mx-auto">
      <div className="border-b border-gray-200">
        <button
          onClick={() => handleToggle()}
          className="w-full p-4 text-left bg-gray-100 hover:bg-gray-200 focus:outline-none"
        >
          {/* <h2 className="text-lg font-medium">{section.title}</h2> */}
        </button>
        <div
          className={`transition-max-height duration-500 ease-in-out overflow-hidden ${
            openIndex ? "max-h-screen" : "max-h-0"
          }`}
        >
          <div className="p-4">
            {collaborators.map((coll, index) => (
              <div key={index}>{coll.email}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
