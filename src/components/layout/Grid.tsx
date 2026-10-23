import React from "react";

interface GridProps {
  children: React.ReactNode;
  min?: number;
}

export default function Grid({ children, min = 300 }: GridProps) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(500px,1fr))] gap-4 w-full mt-5 p-3 xl:px-20 transition-all`}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))`,
      }}
    >
      {children}
    </div>
  );
}
