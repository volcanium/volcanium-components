import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { Link, useInRouterContext } from "react-router-dom";
import { Squircle } from "@squircle-js/react";
import LinkV from "../ui/Link";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconMenu2,
  IconX,
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
  /** Whether to show the "Panel powered by volcanium studio" branding at the bottom of the sidebar. Defaults to true. */
  showBranding?: boolean;
  /** Content to display next to the sidebar (via children) */
  children?: React.ReactNode;
}

const ICON_BOX = "w-10 h-10";

// ---------------------------------------------
// Sub-components
// ---------------------------------------------

function Header({ openFnc, open, title, subtitle }: any) {
  return (
    <header className="flex flex-row items-center gap-3 flex-1 min-w-0 h-10">
      <Squircle cornerRadius={9} cornerSmoothing={1} asChild>
        <button
          type="button"
          onClick={openFnc}
          aria-label={open ? "Réduire le menu" : "Déplier le menu"}
          className={clsx(
            ICON_BOX,
            "shrink-0 hidden sm:flex items-center justify-center text-secondary/70 hover:text-secondary hover:bg-veil active:scale-95 transition-all duration-200 cursor-pointer",
          )}
        >
          {open ? (
            <IconLayoutSidebarLeftCollapse size={19} stroke={1.75} />
          ) : (
            <IconLayoutSidebarLeftExpand size={19} stroke={1.75} />
          )}
        </button>
      </Squircle>
      {/* Always mounted, flex-1 + min-w-0 — same pattern as the nav labels: it's the
          header row's own width (driven by the panel's width transition) that
          naturally shrinks this to nothing, so it fades in sync instead of
          vanishing the instant `open` flips. No "truncate" here either, since its
          ellipsis would recompute every frame while shrinking and flicker. */}
      <div
        className={clsx(
          "flex flex-col items-start min-w-0 flex-1 overflow-hidden transition-opacity duration-300 ease-in-out",
          open ? "opacity-100 delay-150" : "opacity-0",
        )}
      >
        <Title
          variant="brand"
          level="md"
          className="leading-tight whitespace-nowrap overflow-hidden w-full"
        >
          {title}
        </Title>
        <Title
          variant="brand"
          level="sm"
          className="text-main! whitespace-nowrap overflow-hidden w-full"
        >
          {subtitle}
        </Title>
      </div>
    </header>
  );
}

function UserCard({
  name,
  roleName,
  avatarUrl,
  initials = "U",
  onModif,
  className,
  open = true,
  ...props
}: any) {
  return (
    <Squircle cornerRadius={12} cornerSmoothing={1} asChild>
      <div
        {...props}
        className={clsx(
          "group flex flex-row items-center gap-4 h-14 transition-[width,padding-left,background-color] duration-300 ease-in-out overflow-hidden",
          open
            ? "w-full pl-3 bg-veil hover:bg-veil-strong"
            : "w-10 pl-0 bg-transparent cursor-pointer",
          className,
        )}
      >
        {/* Fixed-size slot, always centered inside it — but unlike justify-content,
            padding-left DOES animate smoothly, so the avatar genuinely slides over to
            make room when opening and slides back to dead-center when collapsed,
            instead of jumping. */}
        <div className={clsx(ICON_BOX, "flex items-center justify-center shrink-0")}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-9 w-9 rounded-full ring-1 ring-line bg-back object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-full ring-1 ring-line bg-main/20 flex items-center justify-center text-sm font-bold text-main">
              {initials}
            </div>
          )}
        </div>
        <div
          className={clsx(
            "flex flex-col min-w-0 flex-1 transition-opacity duration-300 ease-in-out pr-1",
            open ? "opacity-100 delay-150" : "opacity-0",
          )}
        >
          <h2 className="text-[14.5px] font-medium leading-tight truncate w-40">
            {name || "Name"}
          </h2>
          <h3 className="text-secondary/50 truncate text-xs mt-0.5">
            {roleName}
          </h3>
        </div>
        {onModif && open && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onModif();
            }}
            className="shrink-0 pr-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <IconUserEdit
              className="text-secondary/70 hover:text-main cursor-pointer w-[18px] h-[18px]"
              stroke={1.75}
            />
          </div>
        )}
      </div>
    </Squircle>
  );
}

function NavButton({
  open,
  children,
  label,
  alert,
  active = false,
  loading,
  onClick,
  page,
  ...props
}: any) {
  const inRouterContext = useInRouterContext();
  const className = clsx(
    "flex items-center h-10 rounded-lg cursor-pointer overflow-hidden transition-[width,background-color] duration-300 hover:scale-100!",
    open ? "w-full" : ICON_BOX,
    active
      ? "bg-main text-white"
      : "bg-transparent text-secondary/85 hover:bg-veil hover:text-secondary font-normal",
  );

  const inner = (
    <>
      {/* Fixed-size slot: the icon never moves, regardless of open state */}
      <div className={clsx(ICON_BOX, "flex items-center justify-center shrink-0")}>
        {children}
      </div>
      {/* Always flex-1 + min-w-0: it's the button's own width transition (above) that
          naturally shrinks this to nothing as it collapses. No text-overflow ellipsis
          here on purpose — "truncate" recomputes the "…" every frame as the width
          shrinks, which flashes. Plain overflow-hidden just gets covered cleanly by
          the same edge that's already animating, in sync with the fade. */}
      <span
        className={clsx(
          "whitespace-nowrap overflow-hidden text-left min-w-0 flex-1 pr-3 transition-opacity duration-300 ease-in-out",
          open ? "opacity-100 delay-150" : "opacity-0",
        )}
      >
        {label}
      </span>
      {alert && (
        <span className="mr-3 flex items-center justify-center w-2 h-2 shrink-0">
          <span className="w-1.5 h-1.5 bg-main rounded-full ring-2 ring-main/30 animate-pulse" />
        </span>
      )}
    </>
  );

  const content = (
    <Squircle cornerRadius={10} cornerSmoothing={1} asChild>
      {page ? (
        inRouterContext ? (
          <Link to={page} className={className} onClick={onClick} {...props}>
            {inner}
          </Link>
        ) : (
          <a href={page} className={className} onClick={onClick} {...props}>
            {inner}
          </a>
        )
      ) : (
        <button
          className={className}
          onClick={onClick}
          disabled={loading}
          {...props}
        >
          {inner}
        </button>
      )}
    </Squircle>
  );

  return content;
}

function Nav({
  tabs,
  open = true,
  activePath,
  specificTabs = [],
  userRole,
}: any) {
  const isPageActive = (btn: any) => {
    if (btn.notActive) return false;
    const normalizedPath = (activePath || "/").replace(/\/+$/, "") || "/";
    const normalizedPage = (btn.page || "/").replace(/\/+$/, "") || "/";
    return (
      normalizedPath === normalizedPage ||
      (normalizedPage !== "/" &&
        normalizedPage !== "/account" &&
        normalizedPath.startsWith(`${normalizedPage}/`))
    );
  };

  const renderIcon = (btn: any, isActive: boolean) => {
    if (btn.loading) {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          className="w-[19px] h-[19px] shrink-0 border-2 border-current border-t-transparent rounded-full opacity-70"
        />
      );
    }
    const IconFilled = btn.iconFilled;
    const IconOutline = btn.icon;
    const Icon = isActive && IconFilled ? IconFilled : IconOutline;
    if (!Icon) return <span className="w-[19px] h-[19px] shrink-0" />;
    return <Icon className="shrink-0" size={19} stroke={isActive ? 2.25 : 1.75} />;
  };

  return (
    <div className="flex flex-col gap-1">
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
            label={btn.name}
            alert={open && btn.alert}
          >
            {renderIcon(btn, isActive)}
          </NavButton>
        );
      })}
      {specificTabs?.length > 0 &&
        specificTabs.map((section: any) => {
          return (
            section.role === userRole && (
              <React.Fragment key={section.groupName}>
                <Center>
                  <div className="w-[85%] h-px my-3 bg-line"></div>
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
                      label={btn.name}
                      alert={open && btn.alert}
                    >
                      {renderIcon(btn, isActive)}
                    </NavButton>
                  );
                })}
              </React.Fragment>
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
  title = "Name",
  subtitle = "App",
  tabs = [],
  specificTabs = [],
  bottomTabs = [],
  activePath = "/",
  user,
  onUserModif,
  showBranding = true,
  children,
}: SidebarProps) {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const open = onToggle ? isOpen : internalOpen;

  const toggleOpen = () => {
    const nextOpen = !open;
    if (onToggle) onToggle(nextOpen);
    else setInternalOpen(nextOpen);
  };

  // Close the drawer on navigation — but only on mobile, where it's a
  // full-screen overlay covering the destination page. On desktop `open`
  // is the user's persisted collapse preference (icon strip <-> full
  // sidebar), unrelated to which page is active, so it must stay untouched.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!open) return;
    if (typeof window === "undefined" || window.matchMedia("(min-width: 640px)").matches) {
      return;
    }
    if (onToggle) onToggle(false);
    else setInternalOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePath]);

  return (
    <main className="flex h-screen font-main text-text bg-back overflow-hidden relative">
      {/* Mobile-only hamburger trigger — replaces the collapsed icon strip entirely below `sm` */}
      {!open && (
        <Squircle cornerRadius={10} cornerSmoothing={1} asChild>
          <button
            type="button"
            onClick={toggleOpen}
            aria-label="Ouvrir le menu"
            className="sm:hidden fixed top-4 left-4 z-30 w-10 h-10 flex items-center justify-center bg-container text-secondary border border-line active:scale-95 transition-transform duration-150 cursor-pointer"
          >
            <IconMenu2 size={20} stroke={1.75} />
          </button>
        </Squircle>
      )}

      {/* Mobile-only backdrop, tap to close */}
      {open && (
        <div
          onClick={toggleOpen}
          aria-hidden="true"
          className="sm:hidden fixed inset-0 bg-black/60 z-10"
        />
      )}

      <div
        className={clsx(
          // Mobile: a plain slide (transform), the drawer is always full-width and
          // just moves on/off screen — no width animation involved there at all.
          // Desktop: unaffected, still the icon-strip <-> full-width expand/collapse.
          "flex flex-col overflow-y-auto overflow-x-hidden shrink-0 w-full px-3 pt-5 py-3",
          "fixed sm:static h-full z-20 bg-back border-r border-line",
          "transition-transform sm:transition-[width] duration-300 ease-in-out",
          open
            ? "translate-x-0 sm:w-72"
            : "-translate-x-full sm:translate-x-0 sm:w-16",
        )}
      >
        <div className="flex flex-col gap-5 w-full">
          <div className="flex flex-row items-center gap-3 w-full h-10">
            <Header openFnc={toggleOpen} open={open} title={title} subtitle={subtitle} />
            {open && (
              <button
                type="button"
                onClick={toggleOpen}
                aria-label="Fermer le menu"
                className="sm:hidden shrink-0 w-10 h-10 flex items-center justify-center text-secondary/70 hover:text-secondary hover:bg-veil rounded-lg transition-colors duration-200 cursor-pointer"
              >
                <IconX size={19} stroke={1.75} />
              </button>
            )}
          </div>

          {user && (
            <UserCard
              onClick={open ? undefined : toggleOpen}
              open={open}
              onModif={onUserModif}
              name={user.name}
              roleName={user.roleName}
              avatarUrl={user.avatarUrl}
              initials={user.initials}
            />
          )}

          <div
            className={clsx(
              "w-full h-px bg-line transition-opacity duration-300",
              open ? "opacity-100" : "opacity-0",
            )}
          />

          <Nav
            open={open}
            activePath={activePath}
            tabs={tabs}
            specificTabs={specificTabs}
            userRole={user?.role}
          />
        </div>

        <div className="flex flex-col gap-3 w-full mt-auto">
          {bottomTabs.length > 0 && (
            <div className="flex flex-col w-full">
              <div
                className={clsx(
                  "w-full h-px bg-line mb-3 transition-opacity duration-300",
                  open ? "opacity-100" : "opacity-0",
                )}
              />
              <Nav open={open} activePath={activePath} tabs={bottomTabs} />
            </div>
          )}
          {showBranding && (
            <small
              className={clsx(
                "text-center truncate text-[11px] tracking-wide transition-opacity duration-200",
                open ? "opacity-100 delay-150" : "opacity-0",
              )}
            >
              Panel powered by{" "}
              <LinkV onClick={() => window.open("https://volcanium-studio.com/")}>
                volcanium studio
              </LinkV>
            </small>
          )}
        </div>
      </div>

      <div className="overflow-auto flex-1 pt-16 sm:pt-0 sm:p-0 pb-4 w-full h-full relative">
        {children}
      </div>
    </main>
  );
}
