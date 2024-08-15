"use client";
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const HomePage: React.FC = () => {
  const router = useRouter();
  return (
    <div className="w-full h-full mt-8 flex justify-center items-center bg-transparent border-t-2  border-white">
      <HeroHighlight>
        <motion.h1
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: [20, -5, 0],
          }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className="text-2xl px-4 md:text-4xl lg:text-4xl font-bold text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto "
        >
          <p className="text-9xl m-4 bg-clip-text bg-gradient-to-b from-gray-50 to-gray-400 text-transparent">Qwerty</p>
          Create, Organize, and Collaborate Seamlessly. Everything You Need,{" "}
          <br />
          <Highlight className="text-black dark:text-white">
            All in One Place
          </Highlight>
          <br />{" "}
          <button
            type="button"
            className="bg-white text-center w-48 mt-3 rounded-2xl h-14 relative font-sans text-black text-xl font-semibold"
            onClick={() => {
              router.push("/login");
            }}
          >
            <p className="translate-x-2">Get Started</p>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl h-12 w-1/4 flex items-center justify-center absolute left-1 top-[4px] hover:w-[184px] z-10 duration-500">
              <svg
                width="25px"
                height="25px"
                viewBox="0 0 1024 1024"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#000000"
                  d="M800 480H160a32 32 0 1 0 0 64h640a32 32 0 1 0 0-64z"
                ></path>
                <path
                  fill="#000000"
                  d="M786.752 512 521.344 777.344a32 32 0 0 0 45.312 45.312l288-288a32 32 0 0 0 0-45.312l-288-288a32 32 0 1 0-45.312 45.312L786.752 512z"
                ></path>
              </svg>
            </div>
          </button>
        </motion.h1>
      </HeroHighlight>
    </div>
  );
};

export default HomePage;
// "use client";

// export function HomePage() {
//   return (
//     <HeroHighlight>
//       <motion.h1
//         initial={{
//           opacity: 0,
//           y: 20,
//         }}
//         animate={{
//           opacity: 1,
//           y: [20, -5, 0],
//         }}
//         transition={{
//           duration: 0.5,
//           ease: [0.4, 0.0, 0.2, 1],
//         }}
//         className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto "
//       >
//         Your Workspace, Reimagined
//         <br />
//         Create, Organize, and Collaborate Seamlessly. Everything You Need,
//         <Highlight className="text-black dark:text-white">
//           All in One Place
//         </Highlight>
//       </motion.h1>
//     </HeroHighlight>
//   );
// }
