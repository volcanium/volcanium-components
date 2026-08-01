import { IconCheck } from "@tabler/icons-react"
import { ReactNode, HTMLAttributes } from "react";

export interface LiCheckProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export default function LiCheck({ children, className, ...props }: LiCheckProps) {
    return <div className={`flex flex-row gap-2 items-center ${className || ""}`} {...props} ><IconCheck className="text-main flex items-center justify-center flex-col" ></IconCheck><p className="flex-1 flex items-center" >{ children }</p></div>
}

