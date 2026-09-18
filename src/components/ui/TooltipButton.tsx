import { ReactNode, useId } from "react";

export interface TooltipButtonProps {
  children: ReactNode;
  tooltip: ReactNode;
}

export default function TooltipButton({
  children,
  tooltip,
}: TooltipButtonProps) {
  const tooltipId = useId();

  return (
    <div
      className="relative inline-block group transition focus-within:[&>div:last-child]:opacity-100 focus-within:[&>div:last-child]:translate-y-0"
      tabIndex={0}
      aria-describedby={tooltipId}
    >
      <div>{children}</div>

      <div
        id={tooltipId}
        role="tooltip"
        className="absolute border border-secondary/40 bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 translate-y-2
                    group-hover:opacity-100 group-hover:translate-y-0
                    bg-container/50 text-white text-sm rounded-md px-3 py-1 text-center pointer-events-none
                    transition-all duration-300 ease-out whitespace-nowrap max-w-max z-50"
      >
        {tooltip}
        <div
          className="absolute top-full mt-px left-1/2 transform -translate-x-1/2 w-0 h-0
                      border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-secondary/50"
        ></div>
      </div>
    </div>
  );
}
