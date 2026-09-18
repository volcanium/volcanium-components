import { IconCheck } from "@tabler/icons-react";
import { ReactNode, HTMLAttributes } from "react";

export interface CheckListItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export default function CheckListItem({
  children,
  className,
  ...props
}: CheckListItemProps) {
  return (
    <div className={`flex flex-row gap-2 items-center ${className || ""}`} {...props}>
      <IconCheck className="text-main flex items-center justify-center flex-col" />
      <p className="flex-1 flex items-center">{children}</p>
    </div>
  );
}
