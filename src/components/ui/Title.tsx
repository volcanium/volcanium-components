import { twMerge } from "tailwind-merge";
import { ReactNode } from "react";

export interface TitleProps {
  children: ReactNode;
  className?: string;
}

export default function Title({ children, className }: TitleProps) {
  return (
    <h2 className={twMerge("text-2xl text-secondary  font-title", className)}>
      {children}
    </h2>
  );
}
