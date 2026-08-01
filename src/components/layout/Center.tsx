import React from "react";

interface CenterProps {
  children: React.ReactNode;
  className?: string;
}

export default function Center({ children, className }: CenterProps) {
  return (
  <div className={`flex justify-center items-center text-center w-full ${className || ""}`}>
    { children }
  </div>
  )
}