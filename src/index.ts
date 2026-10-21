// --- config ---
export * from "./components/config/VolcaniumProvider";
export { useTheme } from "./utils/useTheme";
export { getInitials, formatUserTitle, truncateWithEllipsis, USER_SUBTITLE_MAX_LENGTH } from "./utils/userIdentity";
export { default as ThemeToggle } from "./components/ui/ThemeToggle";

// --- ui ---
export { default as Title } from "./components/ui/Title";
export type { TitleProps, TitleLevel, TitleVariant } from "./components/ui/Title";
export { default as CheckListItem } from "./components/ui/CheckListItem";
export { default as Button } from "./components/ui/Button";
export { Container } from "./components/ui/Container";
export type { ContainerProps } from "./components/ui/Container";
export { InformationButton } from "./components/ui/InformationButton";
export type { InformationButtonProps } from "./components/ui/InformationButton";
export { default as Select } from "./components/ui/Select";
export type { SelectProps, SelectOption } from "./components/ui/Select";
export { default as DatePicker } from "./components/ui/DatePicker";
export type { DatePickerProps } from "./components/ui/DatePicker";
export { default as Modal } from "./components/ui/Modal";
export type { ModalProps, ModalButtonConfig } from "./components/ui/Modal";
export { default as ToastProvider } from "./components/ui/Toast";
export type { ToastProps } from "./components/ui/Toast";
export { notify } from "./components/ui/notify";
export { default as InDev } from "./components/ui/InDev";
export { default as Input } from "./components/ui/Input";
export { default as Table } from "./components/ui/Table";
export type {
  TableProps,
  TableColumnDef,
  TableCellType,
  TableCellValueParams,
  CellValueChangedEvent,
  TableFetchParams,
  TableSort,
} from "./components/ui/Table";
export { default as TooltipButton } from "./components/ui/TooltipButton";
export { default as Form } from "./components/ui/Form";
export type { FormField, FormProps } from "./components/ui/Form";
export { default as Link } from "./components/ui/Link";
export { default as Textarea } from "./components/ui/Textarea";
export { default as Loader } from "./components/ui/Loader";
export { default as FullPageLoader } from "./components/ui/FullPageLoader";
export { default as Toggle } from "./components/ui/Toggle";
export { default as InfoCard, InfoGrid } from "./components/ui/InfoCard";
export type { InfoCardProps } from "./components/ui/InfoCard";
export { default as ConfirmModal, PromptModal } from "./components/ui/ConfirmModal";
export type { ConfirmModalProps, PromptModalProps } from "./components/ui/ConfirmModal";
export { default as Tabs } from "./components/ui/Tabs";
export type { TabsProps, TabItem } from "./components/ui/Tabs";
export { default as Stepper } from "./components/ui/Stepper";
export type { StepperProps, StepperItem } from "./components/ui/Stepper";
export { default as Notice } from "./components/ui/Notice";
export type { NoticeProps, NoticeTone } from "./components/ui/Notice";
export { default as Card } from "./components/ui/Card";
export type { CardProps } from "./components/ui/Card";
export { default as CodeBlock } from "./components/ui/CodeBlock";
export type { CodeBlockProps } from "./components/ui/CodeBlock";
export { default as IconButton } from "./components/ui/IconButton";
export type { IconButtonProps } from "./components/ui/IconButton";
export { default as TextButton } from "./components/ui/TextButton";
export type { TextButtonProps } from "./components/ui/TextButton";
export { default as SegmentedControl } from "./components/ui/SegmentedControl";
export type { SegmentedControlProps, SegmentedOption } from "./components/ui/SegmentedControl";
export { default as ListRow } from "./components/ui/ListRow";
export type { ListRowProps } from "./components/ui/ListRow";
export { default as Badge } from "./components/ui/Badge";
export type { BadgeProps, BadgeTone } from "./components/ui/Badge";
export { default as FilePicker } from "./components/ui/FilePicker";
export type { FilePickerProps } from "./components/ui/FilePicker";
export { default as SimpleTable } from "./components/ui/SimpleTable";
export type { SimpleTableProps, SimpleTableColumn } from "./components/ui/SimpleTable";
export { default as ExternalLink } from "./components/ui/ExternalLink";
export type { ExternalLinkProps } from "./components/ui/ExternalLink";
export { default as LinkButton } from "./components/ui/LinkButton";
export type { LinkButtonProps } from "./components/ui/LinkButton";
export { default as BarStrip } from "./components/ui/BarStrip";
export type { BarStripProps, BarStripItem } from "./components/ui/BarStrip";
export { default as Tag } from "./components/ui/Tag";
export type { TagProps } from "./components/ui/Tag";
export { default as Disclosure } from "./components/ui/Disclosure";
export type { DisclosureProps } from "./components/ui/Disclosure";
export { default as DescriptionList } from "./components/ui/DescriptionList";
export type { DescriptionListProps, DescriptionItem } from "./components/ui/DescriptionList";
export { default as Checkbox } from "./components/ui/Checkbox";
export type { CheckboxProps } from "./components/ui/Checkbox";
export { default as RouterLink } from "./components/ui/RouterLink";
export type { RouterLinkProps } from "./components/ui/RouterLink";
export { default as Chip } from "./components/ui/Chip";
export type { ChipProps } from "./components/ui/Chip";
export { default as Tile } from "./components/ui/Tile";
export type { TileProps } from "./components/ui/Tile";
export { default as PresenceDot, PRESENCE_STATUSES, presenceLabelKey } from "./presence/PresenceDot";
export type { PresenceStatus, ManualPresence, PresenceDotProps } from "./presence/PresenceDot";
export { PresenceProvider, usePresence, usePresenceOf } from "./presence/PresenceProvider";
export type { PresenceProviderProps, PresenceApi } from "./presence/PresenceProvider";
export { default as Avatar, initialsOf } from "./components/ui/Avatar";
export type { AvatarProps } from "./components/ui/Avatar";
export { default as MessageItem } from "./components/ui/MessageItem";
export type { MessageItemProps } from "./components/ui/MessageItem";
export { default as ReactionPill } from "./components/ui/ReactionPill";
export type { ReactionPillProps } from "./components/ui/ReactionPill";
export { default as VideoTile } from "./components/ui/VideoTile";
export type { VideoTileProps } from "./components/ui/VideoTile";
export { default as ControlBar } from "./components/ui/ControlBar";
export type { ControlBarProps } from "./components/ui/ControlBar";
export { default as ControlButton } from "./components/ui/ControlButton";
export type { ControlButtonProps } from "./components/ui/ControlButton";
export { default as MessageComposer } from "./components/ui/MessageComposer";
export type { MessageComposerProps } from "./components/ui/MessageComposer";
export { default as EmojiPicker, DEFAULT_EMOJIS } from "./components/ui/EmojiPicker";
export type { EmojiPickerProps } from "./components/ui/EmojiPicker";
export { default as ProfilePopover } from "./components/ui/ProfilePopover";
export type { ProfilePopoverProps, ProfileTab } from "./components/ui/ProfilePopover";

// --- layout ---
export { default as Center } from "./components/layout/Center";
export { default as Grid } from "./components/layout/Grid";
export { default as TopNav } from "./components/layout/TopNav";
export { default as Sidebar } from "./components/layout/Sidebar";
export type { SidebarProps, UserMenuProps, AccountSwitcherProps, AppSwitcherProps, AppSwitcherApp } from "./components/layout/Sidebar";
export { default as Hero } from "./components/layout/Hero";
export { default as Nav } from "./components/layout/Nav";
