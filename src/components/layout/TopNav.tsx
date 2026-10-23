import React, { ReactNode } from "react";
import { Link, Outlet } from "react-router-dom";
import Title from "../ui/Title";
import Button from "../ui/Button";

export interface TopNavBtn {
  label: string;
  page: string;
  icon?: ReactNode;
}

export interface TopNavProps {
  title?: string;
  titleLink?: string;
  buttons?: TopNavBtn[];
  className?: string;
  children?: ReactNode;
}

export default function TopNav({ title = "App", titleLink = "/", buttons = [], className = "", children }: TopNavProps) {
  return (
    <div className={`flex flex-col gap-0 w-full ${className}`}>
      <div className="bg-vc-container p-1 px-5 pt-2 w-full border-b border-vc-line-strong flex flex-row justify-between items-center gap-3 max-sm:flex-wrap max-sm:px-3 max-sm:pt-[max(0.5rem,env(safe-area-inset-top))] max-sm:pb-2">
        <div className="flex flex-row items-center gap-3 max-sm:min-w-0 max-sm:flex-wrap">
          <Link to={titleLink}>
            <Title className="text-2xl text-vc-main/85 transition-all cursor-pointer hover:text-vc-main">
              {title}
            </Title>
          </Link>
          <div className="flex flex-row gap-2 max-sm:flex-wrap">
            {buttons.map((btn, index) => {
              return (
                <Button
                  key={index}
                  className="bg-transparent hover:scale-100! hover:bg-vc-back/80"
                  link={btn.page}
                  variant="secondary"
                >
                  {btn.icon}
                  {btn.label}
                </Button>
              );
            })}
          </div>
        </div>
        {children && <div>{children}</div>}
      </div>
      <Outlet />
    </div>
  );
}
