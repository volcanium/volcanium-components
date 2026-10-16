import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useInRouterContext } from "react-router-dom";
import { Squircle } from "@squircle-js/react";
import LinkV from "../ui/Link";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconMenu2,
  IconX,
  IconArrowsRightLeft,
  IconUserPlus,
  IconLogout,
  IconCheck,
  IconUserCog,
  IconDotsVertical,
} from "@tabler/icons-react";
import Title from "../ui/Title";
import Center from "./Center";
import { useLanguage } from "../../utils/useLanguage";
import { formatUserTitle, getInitials } from "../../utils/userIdentity";

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

export interface AccountSwitcherAccount {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  initials?: string;
  /** Whether this is the currently active account */
  active?: boolean;
}

export interface AccountSwitcherProps {
  /** Accounts to list (usually: every account signed in on this device) */
  accounts: AccountSwitcherAccount[];
  /** Shows a loader in place of the list while accounts are being fetched */
  loading?: boolean;
  /** Called when the user picks an account to switch to */
  onSwitch: (id: string) => void;
  /** Called when the user removes an account from the list (e.g. sign it out) */
  onRemove?: (id: string) => void;
  /** Called when the user wants to add another account */
  onAdd?: () => void;
  /** Account id currently being switched to, shows a spinner on that row */
  switchingId?: string | null;
  /** Account id currently being removed, disables that row's remove button */
  removingId?: string | null;
  labels?: {
    title?: string;
    active?: string;
    add?: string;
  };
}

export interface UserMenuProps {
  /** Called when the user picks "Changer de compte". Omit to hide that row. */
  onSwitchAccount?: () => void;
  /** Called when the user picks "Se déconnecter". Omit to hide that row. */
  onLogout?: () => void;
  /** Called when the user picks "Gérer mon compte" (usually a redirect to Volcanium Compte). Omit to hide that row. */
  onManageAccount?: () => void;
  labels?: {
    switchAccount?: string;
    logout?: string;
    manageAccount?: string;
  };
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
    /** Free text under the name (e.g. an email, an account type). Ignored when `title` or `organization` is set. */
    roleName?: string;
    role?: string;
    /** Absolute URL of the profile picture. Falls back to the initials when missing or when it fails to load. */
    avatarUrl?: string;
    /** Overrides the initials computed from `name` (two letters: first + last word). */
    initials?: string;
    /** Job title. With `organization` it is shown as "Title - Organization", cut with "…" when too long. */
    title?: string;
    /** Organization name of a business account. */
    organization?: string;
  };
  /** Enables the account switcher: shows a "switch" button on the user card that
   *  opens a compact side panel listing accounts. Omit to hide the button entirely.
   *  Ignored if `onSwitchAccountClick` is also provided. */
  accountSwitcher?: AccountSwitcherProps;
  /** Shows the same "switch" button on the user card, but calls this instead of
   *  opening the built-in panel - for apps that just need a simple link out
   *  (e.g. to another service's own account switcher) without the full panel. */
  onSwitchAccountClick?: () => void;
  /** Turns the whole user card into a menu trigger: clicking it (instead of only the small
   *  switch-account icon) opens a small popover with "Changer de compte" / "Se déconnecter" /
   *  "Gérer mon compte" rows - for apps whose own logout button shouldn't sit in the main nav
   *  (everything except Volcanium Compte itself, which keeps its own bottomTabs logout button).
   *  Takes precedence over `accountSwitcher` / `onSwitchAccountClick` when provided. */
  userMenu?: UserMenuProps;
  /** Whether to show the "Panel powered by volcanium studio" branding at the bottom of the sidebar. Defaults to true. */
  showBranding?: boolean;
  /** Replaces the branding line ("Panel powered by volcanium studio") by a custom label, e.g. "Volcanium". */
  brandingLabel?: React.ReactNode;
  /** Content to display next to the sidebar (via children) */
  children?: React.ReactNode;
}

const ICON_BOX = "w-10 h-10";

// ---------------------------------------------
// Sub-components
// ---------------------------------------------

function Header({ openFnc, open, title, subtitle }: any) {
  const { t } = useLanguage();
  return (
    <header className="flex flex-row items-center gap-3 flex-1 min-w-0 h-10">
      <Squircle cornerRadius={7} cornerSmoothing={1} asChild>
        <button
          type="button"
          onClick={openFnc}
          aria-label={open ? t("collapse_menu") : t("expand_menu")}
          className={clsx(
            ICON_BOX,
            "shrink-0 hidden sm:flex items-center justify-center text-vc-secondary/70 hover:text-vc-secondary hover:bg-vc-veil active:scale-95 transition-all duration-200 cursor-pointer",
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
          className="text-vc-main! whitespace-nowrap overflow-hidden w-full"
        >
          {subtitle}
        </Title>
      </div>
    </header>
  );
}

function SwitcherAvatar({ account }: { account: AccountSwitcherAccount }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (account.avatarUrl && failedUrl !== account.avatarUrl) {
    return (
      <img
        src={account.avatarUrl}
        alt={account.name}
        referrerPolicy="no-referrer"
        onError={() => setFailedUrl(account.avatarUrl ?? null)}
        className="w-full h-full object-cover"
      />
    );
  }
  return <span className="text-xs font-bold text-vc-main">{account.initials || getInitials(account.name)}</span>;
}

function UserCard({
  name,
  roleName,
  avatarUrl,
  initials,
  onToggleSwitcher,
  switcherActive,
  menuMode = false,
  className,
  open = true,
  onClick,
  ...props
}: any) {
  const { t } = useLanguage();
  // A picture that fails to load (blocked, deleted, unreachable) must not leave a broken image: show the initials instead.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(avatarUrl) && failedUrl !== avatarUrl;
  return (
    <Squircle cornerRadius={9} cornerSmoothing={1} asChild>
      <div
        {...props}
        onClick={onClick}
        className={clsx(
          "group flex flex-row items-center gap-4 h-14 transition-[width,padding-left,background-color] duration-300 ease-in-out overflow-hidden",
          open
            ? clsx("w-full pl-3 bg-vc-veil hover:bg-vc-veil-strong", onClick && "cursor-pointer")
            : "w-10 pl-0 bg-transparent cursor-pointer",
          className,
        )}
      >
        {/* Fixed-size slot, always centered inside it — but unlike justify-content,
            padding-left DOES animate smoothly, so the avatar genuinely slides over to
            make room when opening and slides back to dead-center when collapsed,
            instead of jumping. */}
        <div className={clsx(ICON_BOX, "flex items-center justify-center shrink-0")}>
          {showImage ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              referrerPolicy="no-referrer"
              onError={() => setFailedUrl(avatarUrl)}
              className="h-9 w-9 rounded-full ring-1 ring-vc-line bg-vc-back object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-full ring-1 ring-vc-line bg-vc-veil-strong flex items-center justify-center text-sm font-bold text-vc-main">
              {initials || getInitials(name)}
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
          <h3 className="text-vc-secondary/50 truncate text-xs mt-0.5">
            {roleName}
          </h3>
        </div>
        {onToggleSwitcher && open && (
          <button
            type="button"
            aria-label={menuMode ? t("open_account_menu") : t("switch_account")}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSwitcher();
            }}
            className={clsx(
              "shrink-0 mr-2.5 w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200",
              switcherActive
                ? "bg-vc-veil-strong text-vc-main opacity-100"
                : clsx(
                    "text-vc-secondary/70 hover:text-vc-main hover:bg-vc-veil-strong",
                    // Le trigger du menu (3 points) reste visible en permanence -
                    // c'est le seul indice que la carte entiere est cliquable,
                    // contrairement a l'icone switch (au clic dedie, deja
                    // affordant via le curseur de la carte).
                    menuMode ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                  ),
            )}
          >
            {menuMode ? (
              <IconDotsVertical size={16} stroke={1.75} />
            ) : (
              <IconArrowsRightLeft size={16} stroke={1.75} />
            )}
          </button>
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
      ? "bg-vc-main text-vc-on-main"
      : "bg-transparent text-vc-secondary/85 hover:bg-vc-veil hover:text-vc-secondary font-normal",
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
          <span className="w-1.5 h-1.5 bg-vc-main rounded-full ring-2 ring-vc-main/30 animate-pulse" />
        </span>
      )}
    </>
  );

  const content = (
    <Squircle cornerRadius={7} cornerSmoothing={1} asChild>
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
                  <div className="w-[85%] h-px my-3 bg-vc-line"></div>
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
// Account switcher — compact side panel anchored to the user card, not a
// full-screen modal: it lists every account signed in on this device and
// lets the user pick one, add another, or remove one, without leaving the
// current page.
// ---------------------------------------------
function AccountSwitcherPanel({
  anchorRef,
  accounts,
  loading,
  onSwitch,
  onRemove,
  onAdd,
  switchingId,
  removingId,
  labels,
  onClose,
}: AccountSwitcherProps & { anchorRef: React.RefObject<HTMLElement | null>; onClose: () => void }) {
  const { t } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  // The sidebar itself clips overflow-x (needed for the collapse animation),
  // so this panel can't just be an absolutely-positioned child of it — it
  // would be cut off. Instead it's portaled to <body> and manually pinned to
  // the user card's live position, recomputed on scroll/resize so it tracks
  // the card even if the sidebar scrolls or the viewport changes.
  useLayoutEffect(() => {
    const PANEL_WIDTH = 288; // matches w-72
    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      // Detached from the sidebar (extra gap) and aligned with the top of the
      // card, not its bottom — reads as "floating next to" rather than
      // "hanging off" the card.
      const left = Math.min(rect.right + 16, window.innerWidth - PANEL_WIDTH - 12);
      const top = Math.min(rect.top - 4, window.innerHeight - 12);
      setCoords({ top, left: Math.max(12, left) });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !anchorRef.current?.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!coords) return null;

  return createPortal(
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "fixed", top: coords.top, left: coords.left }}
      className="z-[999] w-72 max-w-[85vw] rounded-2xl border border-vc-line bg-vc-container shadow-xl p-2 flex flex-col gap-1"
    >
      <p className="px-2 pt-1.5 pb-2 text-[11px] font-semibold uppercase tracking-wide text-vc-secondary/50">
        {labels?.title ?? t("accounts")}
      </p>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="w-5 h-5 border-2 border-vc-main border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && (
        <div className="flex flex-col gap-0.5 max-h-64 overflow-y-auto vc-scroll-hover">
          {accounts.map((account) => {
            const isSwitching = switchingId === account.id;
            const isRemoving = removingId === account.id;
            return (
              <div
                key={account.id}
                onClick={() => !account.active && onSwitch(account.id)}
                className={clsx(
                  "group/row flex items-center gap-2.5 rounded-xl p-2 transition-colors",
                  account.active
                    ? "bg-vc-veil-strong"
                    : "cursor-pointer hover:bg-vc-veil",
                )}
              >
                <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden ring-1 ring-vc-line bg-vc-back flex items-center justify-center">
                  <SwitcherAvatar account={account} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{account.name}</p>
                  {account.email && (
                    <p className="text-[11px] text-vc-secondary/50 truncate">{account.email}</p>
                  )}
                </div>
                {isSwitching ? (
                  <div className="w-4 h-4 border-2 border-vc-main border-t-transparent rounded-full animate-spin shrink-0" />
                ) : account.active ? (
                  <IconCheck size={16} className="text-vc-main shrink-0" />
                ) : (
                  onRemove && (
                    <button
                      type="button"
                      disabled={isRemoving}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(account.id);
                      }}
                      aria-label={t("remove_account")}
                      className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-vc-secondary/40 opacity-0 group-hover/row:opacity-100 hover:text-vc-main hover:bg-vc-veil-strong transition-all"
                    >
                      <IconLogout size={14} />
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}

      {onAdd && (
        <>
          <div className="h-px bg-vc-line my-1" />
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-2.5 rounded-xl p-2 text-left text-[13px] text-vc-secondary/85 hover:bg-vc-veil hover:text-vc-secondary transition-colors"
          >
            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center border border-dashed border-vc-line">
              <IconUserPlus size={16} className="text-vc-secondary/60" />
            </div>
            {labels?.add ?? t("add_account")}
          </button>
        </>
      )}
    </motion.div>,
    document.body,
  );
}

// ---------------------------------------------
// User menu — small popover opened by clicking the user card itself, for
// apps that shouldn't carry their own logout button in the main nav (see
// `userMenu` on SidebarProps). Same anchored-portal mechanics as
// AccountSwitcherPanel above, kept separate since the two are mutually
// exclusive (a card is either a switcher trigger or a menu trigger).
// ---------------------------------------------
function UserMenuPanel({
  anchorRef,
  onSwitchAccount,
  onLogout,
  onManageAccount,
  labels,
  onClose,
}: UserMenuProps & { anchorRef: React.RefObject<HTMLElement | null>; onClose: () => void }) {
  const { t } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const PANEL_WIDTH = 240; // matches w-60
    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      const left = Math.min(rect.right + 16, window.innerWidth - PANEL_WIDTH - 12);
      const top = Math.min(rect.top - 4, window.innerHeight - 12);
      setCoords({ top, left: Math.max(12, left) });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !anchorRef.current?.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!coords) return null;

  const rows = [
    onSwitchAccount && {
      key: "switch",
      label: labels?.switchAccount ?? t("switch_account"),
      icon: IconArrowsRightLeft,
      onClick: onSwitchAccount,
    },
    onManageAccount && {
      key: "manage",
      label: labels?.manageAccount ?? t("manage_account"),
      icon: IconUserCog,
      onClick: onManageAccount,
    },
    onLogout && {
      key: "logout",
      label: labels?.logout ?? t("logout"),
      icon: IconLogout,
      onClick: onLogout,
    },
  ].filter(Boolean) as { key: string; label: string; icon: React.ElementType; onClick: () => void }[];

  return createPortal(
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "fixed", top: coords.top, left: coords.left }}
      className="z-[999] w-60 max-w-[85vw] rounded-2xl border border-vc-line bg-vc-container shadow-xl p-1.5 flex flex-col gap-0.5"
    >
      {rows.map(({ key, label, icon: Icon, onClick }) => (
        <button
          key={key}
          type="button"
          onClick={() => {
            onClose();
            onClick();
          }}
          className="flex items-center gap-2.5 rounded-xl p-2 text-left text-[13px] text-vc-secondary/85 hover:bg-vc-veil hover:text-vc-secondary transition-colors"
        >
          <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-vc-veil">
            <Icon size={15} stroke={1.75} />
          </div>
          {label}
        </button>
      ))}
    </motion.div>,
    document.body,
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
  accountSwitcher,
  onSwitchAccountClick,
  userMenu,
  showBranding = true,
  brandingLabel,
  children,
}: SidebarProps) {
  const { t } = useLanguage();
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const open = onToggle ? isOpen : internalOpen;
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userCardRef = useRef<HTMLDivElement>(null);

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
    <main className="flex h-screen font-vc-main text-vc-text bg-vc-back overflow-hidden relative">
      {/* Mobile-only hamburger trigger — replaces the collapsed icon strip entirely below `sm` */}
      {!open && (
        <Squircle cornerRadius={7} cornerSmoothing={1} asChild>
          <button
            type="button"
            onClick={toggleOpen}
            aria-label={t("open_menu")}
            className="sm:hidden fixed top-4 left-4 z-30 w-10 h-10 flex items-center justify-center bg-vc-container text-vc-secondary border border-vc-line active:scale-95 transition-transform duration-150 cursor-pointer"
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
          className="sm:hidden fixed inset-0 bg-vc-scrim z-10"
        />
      )}

      <div
        className={clsx(
          // Mobile: a plain slide (transform), the drawer is always full-width and
          // just moves on/off screen — no width animation involved there at all.
          // Desktop: unaffected, still the icon-strip <-> full-width expand/collapse.
          "flex flex-col overflow-y-auto overflow-x-hidden vc-scroll-hover shrink-0 w-full px-3 pt-5 py-3",
          "fixed sm:static h-full z-20 bg-vc-back border-r border-vc-line",
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
                className="sm:hidden shrink-0 w-10 h-10 flex items-center justify-center text-vc-secondary/70 hover:text-vc-secondary hover:bg-vc-veil rounded-lg transition-colors duration-200 cursor-pointer"
              >
                <IconX size={19} stroke={1.75} />
              </button>
            )}
          </div>

          {user && (
            <div className="relative" ref={userCardRef}>
              <UserCard
                onClick={
                  open
                    ? userMenu
                      ? () => setUserMenuOpen((v) => !v)
                      : undefined
                    : toggleOpen
                }
                open={open}
                onToggleSwitcher={
                  userMenu
                    ? () => setUserMenuOpen((v) => !v)
                    : onSwitchAccountClick
                      ? onSwitchAccountClick
                      : accountSwitcher
                        ? () => setSwitcherOpen((v) => !v)
                        : undefined
                }
                switcherActive={userMenu ? userMenuOpen : switcherOpen}
                menuMode={Boolean(userMenu)}
                name={user.name}
                roleName={
                  user.title || user.organization
                    ? formatUserTitle({ title: user.title, organization: user.organization })
                    : user.roleName
                }
                avatarUrl={user.avatarUrl}
                initials={user.initials}
              />
              <AnimatePresence>
                {switcherOpen && accountSwitcher && (
                  <AccountSwitcherPanel
                    {...accountSwitcher}
                    anchorRef={userCardRef}
                    onClose={() => setSwitcherOpen(false)}
                  />
                )}
                {userMenuOpen && userMenu && (
                  <UserMenuPanel
                    {...userMenu}
                    anchorRef={userCardRef}
                    onClose={() => setUserMenuOpen(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          )}

          <div
            className={clsx(
              "w-full h-px bg-vc-line transition-opacity duration-300",
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
                  "w-full h-px bg-vc-line mb-3 transition-opacity duration-300",
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
              {brandingLabel ? (
                <LinkV onClick={() => window.open("https://volcanium-studio.com/")}>{brandingLabel}</LinkV>
              ) : (
                <>
                  Panel powered by{" "}
                  <LinkV onClick={() => window.open("https://volcanium-studio.com/")}>
                    volcanium studio
                  </LinkV>
                </>
              )}
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
