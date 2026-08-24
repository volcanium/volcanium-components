import React, { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import Title from "./Title";

export interface StageProps {
  
  title: string;
  
  children: ReactNode;
  
  count: number | string;
  
  className?: string;
  
  done?: boolean;
}

export default function Stage({
  children,
  title,
  count,
  className = "",
  done = false,
}: StageProps) {
  const [hover, setHover] = useState(false);

  return (
    <div className="flex flex-col relative">
      <div
        className={`absolute ${done ? "scale-100 opacity-100" : "scale-0 opacity-0"} transition-all duration-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80%] bg-main/50 blur-[70px] rounded-[100%] z-0 pointer-events-none`}
      />
      <motion.div
        className={`p-6 sm:p-8 pl-10 sm:pl-14 rounded-2xl relative z-10 transition-colors duration-300 bg-contaner ${className}`}
        whileHover={{ translateY: -5 }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <>
          <div
            className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 ${done ? "border-main" : "border-transparent"} pointer-events-none`}
            style={{
              WebkitMaskImage:
                "radial-gradient(circle at 15px 10px, transparent 45px, black 46px)",
              maskImage:
                "radial-gradient(circle at 15px 10px, transparent 45px, black 46px)",
            }}
          />
          <div
            className={`transition-all duration-300 ${done ? "scale-100 opacity-100" : "scale-50 opacity-0"} px-5 py-0.5 text-sm bg-main rounded-lg -mt-10 absolute top-12 right-2`}
          >
            Fait
          </div>
        </>
        <h1
          className={`absolute -top-6 -left-2 text-5xl sm:text-7xl font-secondary text-main font-bold duration-500 origin-bottom-left flex items-center justify-center z-20 ${
            hover ? "scale-110" : "scale-100"
          }`}
        >
          {count}
        </h1>
        <div className="flex flex-row justify-between items-center">
          <Title>{title}</Title>
        </div>
        <div className="mt-2 text-white/80">{children}</div>
      </motion.div>
    </div>
  );
}
