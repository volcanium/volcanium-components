import React, { useState, useEffect, useRef, Fragment, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  IconLayoutSidebar,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconUserEdit,
} from "@tabler/icons-react";
import Title from "../ui/Title";
import Center from "./Center";

// ---------------------------------------------
// Types
// ---------------------------------------------
export interface TabDef {
  name: string;
  icon?: React.ElementType;
  iconFilled?: React.ElementType;
  page?: string;
  alert?: boolean;
  notActive?: boolean;
  loading?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
}

export interface SpecificTabsDef {
  groupName: string;
  role: string;
  tabs: TabDef[];
}

export interface SidebarProps {
  /** If true, sidebar is expanded. If false, collapsed. */
  isOpen?: boolean;
  /** Callback when the sidebar toggle button is clicked */
  onToggle?: (open: boolean) => void;
  /** Title of the app or section */
  title?: string;
  /** Subtitle of the app */
  subtitle?: string;
  /** Array of main navigation tabs */
  tabs: TabDef[];
  /** Array of specific grouped tabs based on role */
  specificTabs?: SpecificTabsDef[];
  /** Array of bottom tabs (like Logout) */
  bottomTabs?: TabDef[];
  /** The currently active path to highlight the correct tab */
  activePath?: string;
  /** User information to display in the card */
  user?: {
    name: string;
    roleName?: string;
    role?: string;
    avatarUrl?: string;
    initials?: string;
  };
  /** Callback when the user edit button is clicked */
  onUserModif?: () => void;
  /** Content to display next to the sidebar (via children) */
  children?: React.ReactNode;
}

// ---------------------------------------------
// Sub-components
// ---------------------------------------------

function Header({ openFnc, open, openDelay, title, subtitle }: any) {
  const [btnHover, setBtnHover] = useState(false);

  return (
    <header className="flex flex-row w-full relative">
      <div
        className={`flex flex-col transition-all duration-300 items-start ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <Title className="text-3xl">{title}</Title>
        <Title className="text-lg text-main!">{subtitle}</Title>
      </div>
      <div
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        className="pt-1 cursor-pointer"
        onClick={openFnc}
      >
        {btnHover ? (
          open ? (
            <IconLayoutSidebarLeftCollapse
              className={`text-secondary transition-all duration-300 cursor-pointer absolute z-2 ${openDelay ? "sm:left-65 right-5" : "left-5"}`}
            />
          ) : (
            <IconLayoutSidebarLeftExpand
              className={`text-secondary transition-all duration-300 cursor-pointer absolute z-2 ${openDelay ? "sm:left-65 right-5" : "left-5"}`}
            />
          )
        ) : (
          <IconLayoutSidebar
            className={`text-secondary transition-all duration-300 cursor-pointer absolute z-2 ${openDelay ? "sm:left-65 right-5" : "left-5"}`}
          />
        )}
      </div>
    </header>
  );
}

function UserCard({ name, roleName, avatarUrl, initials = "U", onModif, className, open = true, ...props }: any) {
  return (
    <div
      {...props}
      className={`transition-all duration-300 overflow-hidden py-2 ${open ? "min-w-50 px-2 bg-back pr-5" : "min-w-11 max-w-11 px-0 bg-transparent cursor-pointer sm:-ml-0 -ml-1"} w-full rounded-lg flex flex-row items-center gap-3 ${className || ""}`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className={`h-10 w-10 ${open ? "ml-0" : "ml-0.5"} rounded-full bg-contaner object-cover shrink-0`}
        />
      ) : (
        <div
          className={`h-10 w-10 rounded-full transition-all duration-300 ${open ? "bg-contaner" : "bg-back"} flex items-center justify-center text-lg font-bold text-secondary shrink-0`}
        >
          {initials}
        </div>
      )}
      {open && (
        <div className="flex flex-col min-w-0 flex-1">
          <h2 className="text-[17px] truncate w-40">{name || "Name"}</h2>
          <h3 className="text-white/50 truncate text-sm -mt-1">{roleName}</h3>
        </div>
      )}
      {onModif && open && (
        <div onClick={(e) => { e.stopPropagation(); onModif(); }}>
          <IconUserEdit className="text-secondary transition hover:text-main cursor-pointer w-6 h-6 shrink-0" />
        </div>
      )}
    </div>
  );
}

function NavButton({ open, children, active = false, onClick, page, loading, ...props }: any) {
  const baseClasses = `px-2 py-1 flex w-full relative flex-row gap-2 items-center hover:scale-100! text-xl rounded-lg cursor-pointer transition-colors duration-200`;
  const sizeClasses = `${loading && !open ? "w-44 justify-start" : ""} ${open ? "justify-start h-11" : "h-11"}`;
  const activeClasses = active
    ? "bg-main hover:brightness-110 text-white"
    : "bg-transparent text-secondary hover:bg-back font-normal";

  const className = `${baseClasses} ${sizeClasses} ${activeClasses}`;

  if (page) {
    return (
      <Link to={page} className={className} onClick={onClick} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={className} onClick={onClick} disabled={loading} {...props}>
      {children}
    </button>
  );
}

function Nav({ tabs, open = true, openDelay = true, activePath, specificTabs = [], userRole }: any) {
  const isPageActive = (btn: any) => {
    if (btn.notActive) return false;
    const normalizedPath = (activePath || "/").replace(/\/+$/, "") || "/";
    const normalizedPage = (btn.page || "/").replace(/\/+$/, "") || "/";
    return (
      normalizedPath === normalizedPage ||
      (normalizedPage !== "/" && normalizedPage !== "/account" && normalizedPath.startsWith(`${normalizedPage}/`))
    );
  };

  const IconSystem = (btn: any, isActive: boolean) => {
    const IconFilled = btn.iconFilled;
    const IconOutline = btn.icon;
    return isActive && !btn.loading && IconFilled ? (
      <IconFilled className="w-6 h-6 absolute left-2.5" />
    ) : (
      !btn.loading && IconOutline && (
        <IconOutline className="absolute left-2.5" stroke={isActive ? 3 : 2} />
      )
    );
  };

  return (
    <div className={`flex flex-col gap-2 ${open ? "sm:p-0 p-8 sm:px-0 px-10" : "sm:p-0 p-0 sm:px-0 px-0"} transition-all duration-300`}>
      {tabs.map((btn: any) => {
        const isActive = isPageActive(btn);
        return (
          <NavButton
            key={btn.page ?? btn.name}
            onClick={btn.onClick}
            loading={btn.loading}
            open={open}
            active={isActive}
            page={btn.page}
          >
            {IconSystem(btn, isActive)}
            <div className={`truncate transition-all duration-300 absolute left-10 ${open && openDelay ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              {btn.name}
            </div>
            {btn.alert && (
              <div className={`flex justify-center absolute duration-0 transition-none ${open ? "left-8" : "right-1.5"} items-center w-2 h-2 bg-main/50 rounded-full -mt-2 -ml-1`}>
                <div className="w-1 h-1 bg-main rounded-full"></div>
              </div>
            )}
          </NavButton>
        );
      })}
      {specificTabs?.length > 0 &&
        specificTabs.map((section: any) => {
          return (
            section.role === userRole && (
              <Fragment key={section.groupName}>
                <Center>
                  <div className="w-[80%] h-0.5 my-2 bg-secondary/50 rounded-2xl"></div>
                </Center>
                {section.tabs.map((btn: any) => {
                  const isActive = isPageActive(btn);
                  return (
                    <NavButton
                      key={btn.page}
                      onClick={btn.onClick}
                      page={btn.page}
                      loading={btn.loading}
                      open={open}
                      active={isActive}
                    >
                      {IconSystem(btn, isActive)}
                      <div className={`truncate transition-all duration-300 absolute left-10 ${open && openDelay ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                        {btn.name}
                      </div>
                    </NavButton>
                  );
                })}
              </Fragment>
            )
          );
        })}
    </div>
  );
}

// ---------------------------------------------
// Sidebar Main Component
// ---------------------------------------------

export default function Sidebar({
  isOpen = true,
  onToggle,
  title = "Account",
  subtitle = "App",
  tabs = [],
  specificTabs = [],
  bottomTabs = [],
  activePath = "/",
  user,
  onUserModif,
  children,
}: SidebarProps) {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const open = onToggle ? isOpen : internalOpen;
  const [openDelay, setOpenDelay] = useState(open);
  const delayTimerRef = useRef<number | null>(null);

  const toggleOpen = useCallback(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    const nextOpen = !open;
    if (onToggle) onToggle(nextOpen);
    else setInternalOpen(nextOpen);

    delayTimerRef.current = window.setTimeout(() => {
      setOpenDelay(nextOpen);
      delayTimerRef.current = null;
    }, 100);
  }, [open, onToggle]);

  useEffect(() => {
    setOpenDelay(open);
  }, [open]);

  useEffect(() => {
    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    };
  }, []);

  return (
    <main className="flex h-screen font-main text-text bg-back overflow-hidden">
      <div
        className={`flex overflow-y-auto overflow-x-hidden transition-all duration-300 ${open ? "sm:w-75 w-full" : openDelay ? "sm:w-85" : "w-15"} ${open ? "sm:static fixed h-full z-20" : ""} px-2 z-10 items-center justify-between gap-5 py-4 flex-col bg-contaner`}
      >
        <div className="flex flex-col sm:gap-5 w-full">
          <Header openFnc={toggleOpen} open={open} openDelay={openDelay} title={title} subtitle={subtitle} />
          
          {user && (
            <div className={`sm:p-0 sm:px-0 px-2 sm:mt-0 mt-3 transition-all duration-300 overflow-hidden`}>
              <UserCard
                onClick={open ? undefined : toggleOpen}
                className="transition-all duration-300"
                open={open}
                onModif={onUserModif}
                name={user.name}
                roleName={user.roleName}
                avatarUrl={user.avatarUrl}
                initials={user.initials}
              />
            </div>
          )}

          <Nav
            open={open}
            openDelay={openDelay}
            activePath={activePath}
            tabs={tabs}
            specificTabs={specificTabs}
            userRole={user?.role}
          />
        </div>

        {bottomTabs.length > 0 && (
          <div className="flex flex-col sm:gap-5 w-full">
            <Nav open={open} openDelay={openDelay} activePath={activePath} tabs={bottomTabs} />
          </div>
        )}
      </div>
      
      <div className="overflow-auto flex-1 sm:p-0 pb-4 w-full h-full relative">
        {children}
      </div>
    </main>
  );
}
