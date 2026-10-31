import { useEffect, useMemo, useState } from "react";
import { Button, ConfirmModal, IconButton, Input, Notice, Select, Tag, Loader, notify } from "./ui";
import { IconArrowLeft, IconArrowsExchange, IconCheck, IconChecks, IconCopy, IconMail, IconPencil, IconPlus, IconStar, IconStarFilled, IconStarOff, IconTrash, IconUserPlus, IconUsersGroup, IconUsersPlus, IconX } from "@tabler/icons-react";
import { useContactsHost, type Colleague, type PersonContext } from "./host";
import type { ContactsKey as MessageKey } from "./messages";
import { MAX_BULK, type Contact, type ContactList } from "./api";
import { findDuplicates } from "./duplicates";
import { CONTACT_SORT_KEYS, LIST_SORT_KEYS, buildRows, filterRows, sortLists, sortRows, type ContactRow, type ContactSortKey, type ListSortKey, type OriginFilter } from "./sort";
import { formatAddress } from "./address";
import { formatBirthday } from "../calendar/birthdays";
import { useProfileCard } from "../profile/useProfileCard";
import { splitName } from "./name";
import ContactAvatar from "./ContactAvatar";
import FilterPopover from "./FilterPopover";
import OriginTag from "./OriginTag";
import { useContacts } from "./ContactsContext";
import ContactDialog from "./ContactDialog";
import DuplicatesDialog from "./DuplicatesDialog";
import ImportExportDialog from "./ImportExportDialog";
import ListDialog from "./ListDialog";

type Selection = { kind: "contact" | "list" | "member"; id: string } | null;
const MAX_TO = 50; // limite des destinataires d'un nouveau message de Mail (le lien de redaction porte les adresses)

/** Page « Contacts » : ceux de Volcanium Mail (meme carnet, memes listes de diffusion), import et export ; pour un collegue : message et appel dans Echange. */
export default function ContactsPage({ focusContactId = null, onFocusDone }: { /** Fiche a ouvrir a l'arrivee (lien depuis le calendrier) ; `onFocusDone` : l'hote retire ensuite le lien. */ focusContactId?: string | null; onFocusDone?: () => void }) {
  const host = useContactsHost();
  const { t, locale, api: contactsApi, members, colleagues, canWrite, writeTo: hostWriteTo, manageAccountUrl, renderAvatar } = host;
  const { isInternal, find, isSelf } = colleagues;
  const { state, contacts, lists, reload } = useContacts();
  const [tab, setTab] = useState<"contacts" | "lists">("contacts");
  const [sort, setSort] = useState<ContactSortKey>("name-asc");
  const [origin, setOrigin] = useState<OriginFilter>("all");
  const [listSort, setListSort] = useState<ListSortKey>("name-asc");
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState<Selection>(null);
  const [contactDialog, setContactDialog] = useState<Contact | "new" | { colleague: { name: string; email: string } } | null>(null);
  const [listDialog, setListDialog] = useState<ContactList | "new" | null>(null);
  const [ioOpen, setIoOpen] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);
  const duplicateGroups = useMemo(() => findDuplicates(contacts), [contacts]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Selection (clic sur la photo, comme dans la liste des messages) et favoris.
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  const [favOnly, setFavOnly] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const togglePick = (id: string) => setPicked((prev) => { const n = new Set(prev); if (!n.delete(id)) n.add(id); return n; });
  useEffect(() => { setPicked(new Set()); }, [tab]);
  useEffect(() => {
    if (picked.size === 0) return undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !document.querySelector('[role="dialog"]')) setPicked(new Set()); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [picked.size]);

  // Lien venant du calendrier (anniversaire) : `/contacts?contact=<id>` ouvre la fiche, puis le parametre est retire.
  const wanted = focusContactId;
  useEffect(() => {
    if (!wanted || state === "loading") return;
    if (contacts.some((c) => c.id === wanted)) { setSel({ kind: "contact", id: wanted }); setTab("contacts"); }
    onFocusDone?.();
  }, [wanted, state, contacts, onFocusDone]);

  const q = query.trim().toLowerCase();
  const allRows = useMemo(() => buildRows(contacts, members, isInternal), [contacts, members, isInternal]);
  const shownRows = useMemo(() => {
    const matches = (r: ContactRow) => !q || (r.kind === "contact"
      ? [r.contact.name, r.contact.company, r.contact.jobTitle, r.contact.notes, ...r.contact.emails.map((e) => e.address), ...r.contact.phones.map((p) => p.number), ...r.contact.addresses.map(formatAddress)].some((v) => v.toLowerCase().includes(q))
      : r.name.toLowerCase().includes(q) || r.email.includes(q));
    return sortRows(filterRows(allRows, origin), sort).filter((r) => matches(r) && (!favOnly || (r.kind === "contact" && r.contact.favorite)));
  }, [allRows, origin, sort, q, favOnly]);
  const shownLists = useMemo(() => sortLists(q ? lists.filter((l) => l.name.toLowerCase().includes(q) || l.addresses.some((a) => a.includes(q))) : lists, listSort), [lists, q, listSort]);
  const contact = sel?.kind === "contact" ? contacts.find((c) => c.id === sel.id) : undefined;
  const member = sel?.kind === "member" ? allRows.find((r): r is Extract<ContactRow, { kind: "member" }> => r.kind === "member" && r.id === sel.id) : undefined;
  const list = sel?.kind === "list" ? lists.find((l) => l.id === sel.id) : undefined;
  const filterCount = (origin !== "all" ? 1 : 0) + (sort !== "name-asc" ? 1 : 0) + (favOnly ? 1 : 0);
  /** Nous-memes : notre profil se modifie dans Volcanium Compte. Le collegue de l'annuaire derriere une fiche (adresse d'un membre de l'entreprise) : on ne la supprime pas, son nom et son adresse ne se modifient pas. */
  const selfSel = (member && isSelf(member.email)) || (contact && contact.emails.some((e) => isSelf(e.address)));
  const colleagueOf = (c: Contact) => c.emails.map((e) => find(e.address)).find(Boolean);
  /** Collegue joignable (message, appel) derriere la fiche ou la ligne de l'annuaire : pas nous-memes. */
  const reachable: Colleague | undefined = member ? (isSelf(member.email) ? undefined : find(member.email)) : contact ? contact.emails.map((e) => find(e.address)).find((p) => p && !isSelf(p.email)) : undefined;
  const person: PersonContext = { contact, member: member ? { name: member.name, email: member.email } : undefined, colleague: member ? find(member.email) : contact ? colleagueOf(contact) : undefined, reachable, self: !!selfSel };

  // Anniversaire du profil public d'un collegue (s'il le montre a ceux de son entreprise ou a tous) : propose a la fiche de contact, jamais dans l'info-bulle de profil.
  const colleagueCard = useProfileCard(person.colleague && !person.self ? person.colleague.id : undefined, true);
  const bp = colleagueCard?.profile;
  const offeredBirthday = bp?.birthdayMonth && bp.birthdayDay && !contact?.birthday ? { month: bp.birthdayMonth, day: bp.birthdayDay, year: null } : null;

  // Loader dans la zone des contacts seulement (jamais un overlay plein ecran : la barre laterale de l'app reste en place).
  if (state === "loading") return <div className="flex min-h-[50vh] items-center justify-center p-8"><div className="w-48"><Loader full /></div></div>;
  if (state === "unavailable") return <div className="mx-auto max-w-lg p-6"><Notice tone="info">{t("contacts.noMailbox")}</Notice></div>;
  if (state === "error") return <div className="p-6"><Notice tone="danger" action={<Button variant="secondary" onClick={() => void reload()}>{t("contacts.retry")}</Button>}>{t("contacts.loadError")}</Notice></div>;

  const writeTo = (addresses: string[]) => { if (canWrite) hostWriteTo(addresses); };

  const remove = async () => {
    setConfirmDelete(false);
    if (!sel) return;
    const { error } = sel.kind === "contact" ? await contactsApi.remove(sel.id) : await contactsApi.removeList(sel.id);
    if (error) return notify.error(t("contacts.actionFailed"));
    notify.success(t(sel.kind === "contact" ? "contacts.deleted" : "contacts.list.deleted"));
    setSel(null);
    await reload();
  };

  /** Ajoute l'anniversaire du collegue a son contact (cree le contact au besoin) : il apparait alors dans le calendrier. */
  const addBirthday = async () => {
    if (!offeredBirthday) return;
    const email = (person.colleague?.email ?? member?.email ?? "").toLowerCase();
    const { data, error } = contact
      ? await contactsApi.update(contact.id, { firstName: contact.firstName, lastName: contact.lastName, company: contact.company, jobTitle: contact.jobTitle, notes: contact.notes, emails: contact.emails, phones: contact.phones, addresses: contact.addresses, birthday: offeredBirthday })
      : await contactsApi.create({ ...splitName(person.colleague?.name ?? member?.name ?? email, email), company: colleagueCard?.organization?.name ?? "", jobTitle: colleagueCard?.jobTitle ?? "", notes: "", emails: [{ address: email, label: "work" }], phones: [], addresses: [], birthday: offeredBirthday });
    if (error || !data) return notify.error(t("contacts.actionFailed"));
    notify.success(t("contacts.birthday.added"));
    await reload();
    open({ kind: "contact", id: data.contact.id });
  };

  /** Action sur la selection (100 par appel) ; l'etat est recharge depuis le serveur. */
  const bulk = async (action: "delete" | "favorite" | "unfavorite") => {
    const ids = [...picked].filter((id) => action !== "delete" || !contacts.some((c) => c.id === id && colleagueOf(c)));
    if (ids.length === 0 || busy) return;
    setBusy(true);
    let done = 0, failed = 0;
    for (let i = 0; i < ids.length; i += MAX_BULK) {
      const part = ids.slice(i, i + MAX_BULK);
      const { data, error } = await contactsApi.bulk(action, part);
      if (error || !data) failed += part.length; else { done += data.done; failed += data.failed; }
    }
    setBusy(false);
    setPicked(new Set());
    if (sel && ids.includes(sel.id) && action === "delete") setSel(null);
    await reload();
    if (failed > 0) return notify.error(t("contacts.bulk.partial", { done, failed }));
    notify.success(t(action === "delete" ? "contacts.bulk.deleted" : action === "favorite" ? "contacts.bulk.favorited" : "contacts.bulk.unfavorited", { count: done }));
  };
  const toggleFavorite = async (c: Contact) => {
    const { error } = await contactsApi.bulk(c.favorite ? "unfavorite" : "favorite", [c.id]);
    if (error) return notify.error(t("contacts.actionFailed"));
    await reload();
  };

  /** Une adresse : un clic ouvre un nouveau message DANS Volcanium Mail (jamais le client mail par defaut du systeme) ; sans lien avec Mail, du texte. */
  const AddressLink = ({ address }: { address: string }) => canWrite
    ? <button type="button" title={t("contacts.write")} onClick={() => writeTo([address])} className="cursor-pointer break-all text-left text-vc-main hover:underline focus-visible:outline-2 focus-visible:outline-vc-main">{address}</button>
    : <span>{address}</span>;

  // Fiche en cours d'edition : un contact, ou un collegue de l'annuaire (la fiche est alors creee a l'enregistrement).
  const dialogContact = contactDialog && contactDialog !== "new" && !("colleague" in contactDialog) ? contactDialog : null;
  const dialogColleague = contactDialog && contactDialog !== "new" ? ("colleague" in contactDialog ? contactDialog.colleague : (() => { const m = colleagueOf(contactDialog); return m ? { name: m.name, email: m.email } : null; })()) : null;
  const open = (s: NonNullable<Selection>) => { setSel(s); setTab(s.kind === "list" ? "lists" : "contacts"); };

  return (
    <div className="flex h-full min-h-0">
      {/* Liste : masquee sur petit ecran quand une fiche est ouverte */}
      <section className={`min-h-0 flex-1 flex-col border-vc-line md:w-96 md:flex-none md:border-r ${sel ? "hidden md:flex" : "flex"}`} aria-label={t("contacts.title")}>
        <div className="flex flex-col gap-2 p-2">
          <div className="flex items-center justify-between gap-2 px-1">
            <h2 className="text-base font-semibold">{t("contacts.title")}</h2>
            <span className="flex items-center gap-1">
              {tab === "lists"
                ? <IconButton label={t("contacts.new")} onClick={() => setContactDialog("new")}><IconUserPlus size={18} /></IconButton>
                : <IconButton label={t("contacts.newList")} onClick={() => setListDialog("new")}><IconUsersPlus size={18} /></IconButton>}
              {duplicateGroups.length > 0 && (
                <span className="relative">
                  <IconButton label={t("contacts.duplicates.open", { count: duplicateGroups.length })} onClick={() => setDupOpen(true)}><IconCopy size={18} /></IconButton>
                  <span aria-hidden className="pointer-events-none absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-vc-main px-1 text-[10px] font-semibold leading-4 text-white">{duplicateGroups.length}</span>
                </span>
              )}
              <IconButton label={t("contacts.io")} onClick={() => setIoOpen(true)}><IconArrowsExchange size={18} /></IconButton>
            </span>
          </div>
          <Button icon={<IconPlus size={16} />} onClick={() => (tab === "lists" ? setListDialog("new") : setContactDialog("new"))}>{t(tab === "lists" ? "contacts.newList" : "contacts.new")}</Button>
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1"><Input type="search" placeholder={t("contacts.search")} aria-label={t("contacts.search")} value={query} onChange={(e) => setQuery(e.target.value)} /></div>
            {tab === "lists" && (
              <FilterPopover label={t("contacts.filters")} title={t("contacts.filters.title")} count={listSort !== "name-asc" ? 1 : 0}>
                <Select<ListSortKey> label={t("contacts.sort")} className="w-full!" value={listSort} options={LIST_SORT_KEYS.map((k) => ({ value: k, label: t(`contacts.sort.${k}` as MessageKey) }))} onChange={setListSort} />
                <Button type="button" variant="secondary" disabled={listSort === "name-asc"} onClick={() => setListSort("name-asc")}>{t("contacts.filters.reset")}</Button>
              </FilterPopover>
            )}
            {tab === "contacts" && (
              <FilterPopover label={t("contacts.filters")} title={t("contacts.filters.title")} count={filterCount}>
                  <Select<ContactSortKey> label={t("contacts.sort")} className="w-full!" value={sort} options={CONTACT_SORT_KEYS.map((k) => ({ value: k, label: t(`contacts.sort.${k}` as MessageKey) }))} onChange={setSort} />
                  <div>
                    <p className="mb-1.5 text-sm text-vc-text/50">{t("contacts.origin")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(["all", "internal", "external"] as const).map((o) => (
                        <button key={o} type="button" aria-pressed={origin === o} onClick={() => setOrigin(o)} className={`cursor-pointer rounded-md border px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50 ${origin === o ? "border-vc-text/40 bg-vc-veil-strong" : "border-vc-line-strong opacity-70 hover:opacity-100"}`}>{t(`contacts.origin.${o}` as MessageKey)}</button>
                      ))}
                    </div>
                  </div>
                  <button type="button" aria-pressed={favOnly} onClick={() => setFavOnly((v) => !v)} className={`w-fit cursor-pointer rounded-md border px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50 ${favOnly ? "border-vc-text/40 bg-vc-veil-strong" : "border-vc-line-strong opacity-70 hover:opacity-100"}`}>{t("contacts.favorites.only")}</button>
                  <Button type="button" variant="secondary" disabled={filterCount === 0} onClick={() => { setSort("name-asc"); setOrigin("all"); setFavOnly(false); }}>{t("contacts.filters.reset")}</Button>
                </FilterPopover>
            )}
          </div>
        </div>
        {picked.size === 0 && <div role="tablist" className="flex border-b border-vc-line px-2">
          {([["contacts", "contacts.tab.contacts", allRows.length], ["lists", "contacts.tab.lists", lists.length]] as const).map(([id, label, n]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`-mb-px flex-1 cursor-pointer border-b-2 px-3 py-2 text-sm transition-colors ${tab === id ? "border-vc-main font-semibold" : "border-transparent text-vc-text/60 hover:text-vc-text"}`}>
              {t(label)} <span className="ml-1 rounded-full bg-vc-veil-strong px-1.5 text-xs text-vc-text-secondary">{n}</span>
            </button>
          ))}
        </div>}
        {picked.size > 0 && (
          <div role="toolbar" aria-label={t("contacts.bulk.count", { count: picked.size })} className="vm-bulk-in flex flex-wrap items-center gap-1 border-b border-vc-line px-2 py-1.5">
            <IconButton label={t("contacts.bulk.clear")} onClick={() => setPicked(new Set())}><IconX size={18} /></IconButton>
            <span className="mr-auto px-1 text-sm font-medium" aria-live="polite">{t("contacts.bulk.count", { count: picked.size })}</span>
            <IconButton label={t("contacts.bulk.selectAll")} disabled={busy} onClick={() => setPicked(new Set(tab === "contacts" ? shownRows.filter((r) => r.kind === "contact").map((r) => r.id) : shownLists.map((l) => l.id)))}><IconChecks size={18} /></IconButton>
            {tab === "contacts" && <IconButton label={t("contacts.favorite.add")} disabled={busy} onClick={() => void bulk("favorite")}><IconStar size={18} /></IconButton>}
            {tab === "contacts" && <IconButton label={t("contacts.favorite.remove")} disabled={busy} onClick={() => void bulk("unfavorite")}><IconStarOff size={18} /></IconButton>}
            <IconButton label={t("contacts.delete")} disabled={busy} onClick={() => setConfirmBulkDelete(true)}><IconTrash size={18} /></IconButton>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto vc-scroll-hover">
          {tab === "contacts" ? (
            shownRows.length === 0 ? <p className="p-6 text-center text-sm text-vc-text-secondary">{t(q || origin !== "all" ? "contacts.emptySearch" : "contacts.empty")}</p> : (
              <ul>
                {shownRows.map((r) => {
                  const isPicked = picked.has(r.id);
                  return (
                    <li key={r.id} className="relative">
                      <button type="button" onClick={() => (picked.size > 0 && r.kind === "contact" ? togglePick(r.id) : open({ kind: r.kind, id: r.id }))} className={`flex w-full cursor-pointer items-center gap-3 border-b border-vc-line px-3 py-2.5 text-left transition-colors hover:bg-vc-veil ${isPicked ? "bg-vc-main/10" : sel?.id === r.id ? "bg-vc-veil-strong" : ""}`}>
                        <span aria-hidden className="size-9 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 text-sm font-medium"><span className="truncate">{r.name}</span><OriginTag internal={r.internal} className="shrink-0" />{r.kind === "contact" && r.contact.favorite && <IconStarFilled size={13} className="shrink-0 text-vc-warning" aria-label={t("contacts.favorite")} />}</span>
                          <span className="block truncate text-xs text-vc-text-secondary">{r.kind === "contact" ? (r.contact.emails[0]?.address ?? r.contact.company) : r.email}</span>
                        </span>
                      </button>
                      {/* Photo = case de selection pour un contact (un bouton a part : pas de bouton dans un bouton) ; un collegue de l'annuaire n'est pas selectionnable. */}
                      {r.kind === "contact" ? (
                        <button type="button" aria-pressed={isPicked} aria-label={`${t(isPicked ? "contacts.unpick" : "contacts.pick")} : ${r.name}`} title={t(isPicked ? "contacts.unpick" : "contacts.pick")} onClick={() => togglePick(r.id)} className="absolute left-3 top-1/2 size-9 -translate-y-1/2 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-vc-main">
                          {isPicked ? <span className="flex size-9 items-center justify-center rounded-full bg-vc-main text-white"><IconCheck size={18} aria-hidden /></span> : <ContactAvatar contact={r.contact} size={36} />}
                        </button>
                      ) : (
                        <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">{renderAvatar({ name: r.name, email: r.email, colleague: find(r.email), size: 36 })}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )
          ) : shownLists.length === 0 ? <p className="p-6 text-center text-sm text-vc-text-secondary">{t(q ? "contacts.emptySearch" : "contacts.emptyLists")}</p> : (
            <ul>
              {shownLists.map((l) => {
                const isPicked = picked.has(l.id);
                return (
                  <li key={l.id} className="relative">
                    <button type="button" onClick={() => (picked.size > 0 ? togglePick(l.id) : open({ kind: "list", id: l.id }))} className={`flex w-full cursor-pointer items-center gap-3 border-b border-vc-line px-3 py-2.5 text-left transition-colors hover:bg-vc-veil ${isPicked ? "bg-vc-main/10" : sel?.id === l.id ? "bg-vc-veil-strong" : ""}`}>
                      <span aria-hidden className="size-9 shrink-0" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{l.name}</span>
                        <span className="block truncate text-xs text-vc-text-secondary">{t("contacts.list.count", { count: l.addresses.length })}</span>
                      </span>
                    </button>
                    <button type="button" aria-pressed={isPicked} aria-label={`${t(isPicked ? "contacts.unpick" : "contacts.pick")} : ${l.name}`} title={t(isPicked ? "contacts.unpick" : "contacts.pick")} onClick={() => togglePick(l.id)} className="absolute left-3 top-1/2 size-9 -translate-y-1/2 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-vc-main">
                      {isPicked ? <span className="flex size-9 items-center justify-center rounded-full bg-vc-main text-white"><IconCheck size={18} aria-hidden /></span> : <span aria-hidden className="flex size-9 items-center justify-center rounded-full bg-vc-veil-strong text-vc-text-secondary"><IconUsersGroup size={18} /></span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Fiche */}
      <section className={`min-h-0 min-w-0 flex-1 overflow-y-auto p-4 max-sm:p-3 md:p-6 ${sel ? "block" : "hidden md:block"}`}>
        {!contact && !list && !member && <p className="hidden h-full items-center justify-center text-vc-text-secondary md:flex">{t("contacts.select")}</p>}
        {(contact || list || member) && (
          <article className="mx-auto flex max-w-2xl flex-col gap-5">
            <div className="md:hidden"><IconButton label={t("contacts.back")} onClick={() => setSel(null)}><IconArrowLeft size={18} /></IconButton></div>
            <header className="flex items-start gap-4 max-sm:flex-wrap max-sm:gap-x-3 max-sm:gap-y-2">
              {contact ? <ContactAvatar contact={contact} size={64} />
                : member ? renderAvatar({ name: member.name, email: member.email, colleague: find(member.email), size: 64 })
                : <span aria-hidden className="flex size-16 shrink-0 items-center justify-center rounded-full bg-vc-veil-strong text-vc-text-secondary"><IconUsersGroup size={30} /></span>}
              <div className="min-w-0 flex-1 max-sm:basis-[calc(100%-5rem)]">
                <h2 className="flex flex-wrap items-center gap-2 break-words text-xl font-semibold">
                  <span>{contact?.name ?? member?.name ?? list?.name}</span>
                  {contact && <OriginTag internal={contact.emails.some((e) => isInternal(e.address))} />}
                  {member && <OriginTag internal={!member.external} />}
                  {((member && !member.external) || (contact && colleagueOf(contact))) && <Tag tone="info">{t(selfSel ? "contacts.self" : "contacts.colleague")}</Tag>}
                </h2>
                {member && !member.external && find(member.email)?.jobTitle && <p className="break-words text-sm text-vc-text-secondary">{find(member.email)!.jobTitle}</p>}
                {member?.external && (member.external.jobTitle || member.external.company) && <p className="break-words text-sm text-vc-text-secondary">{[member.external.jobTitle, member.external.company].filter(Boolean).join(" · ")}</p>}
                {contact && (contact.jobTitle || contact.company) && <p className="break-words text-sm text-vc-text-secondary">{[contact.jobTitle, contact.company].filter(Boolean).join(" · ")}</p>}
                                {list && <p className="text-sm text-vc-text-secondary">{t("contacts.list.count", { count: list.addresses.length })}</p>}
              </div>
              {/* Actions a droite, en icones, comme l'en-tete d'un message */}
              <div className="flex shrink-0 items-center gap-1 max-sm:w-full max-sm:flex-wrap max-sm:justify-end">
                {contact && <IconButton label={t(contact.favorite ? "contacts.favorite.remove" : "contacts.favorite.add")} aria-pressed={contact.favorite} onClick={() => void toggleFavorite(contact)}>{contact.favorite ? <IconStarFilled size={18} className="text-vc-warning" /> : <IconStar size={18} />}</IconButton>}
                {host.renderActions?.(person)}
                {canWrite && contact && contact.emails.length > 0 && <IconButton label={t("contacts.writeMail")} onClick={() => writeTo([contact.emails[0]!.address])}><IconMail size={18} /></IconButton>}
                {canWrite && member && <IconButton label={t("contacts.writeMail")} onClick={() => writeTo([member.email])}><IconMail size={18} /></IconButton>}
                {canWrite && list && <IconButton label={t("contacts.writeList")} onClick={() => writeTo(list.addresses)}><IconMail size={18} /></IconButton>}
                {(contact || list || (member && !member.external)) && <IconButton label={t(selfSel ? "contacts.self.edit" : "contacts.edit")} onClick={() => (selfSel ? window.location.assign(manageAccountUrl) : contact ? setContactDialog(contact) : member ? setContactDialog({ colleague: { name: member.name, email: member.email } }) : setListDialog(list!))}><IconPencil size={18} /></IconButton>}
                {((contact && !colleagueOf(contact)) || list) && <IconButton label={t("contacts.delete")} onClick={() => setConfirmDelete(true)}><IconTrash size={18} /></IconButton>}
              </div>
            </header>
            {selfSel && <Notice tone="info" dense action={<a href={manageAccountUrl} className="text-sm font-medium text-vc-main hover:underline">{t("contacts.self.open")}</a>}>{t("contacts.self.note")}</Notice>}
            {member?.external && <Notice tone="info" dense>{t("contacts.external.note")}</Notice>}
            {host.renderProfile?.(person)}
            {offeredBirthday && (
              <section aria-label={t("contacts.field.birthday")}>
                <h3 className="mb-1 text-sm font-semibold">{t("contacts.field.birthday")}</h3>
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-vc-line px-3 py-2 text-sm">
                  <span>{formatBirthday(offeredBirthday, locale)}</span>
                  <Button variant="secondary" onClick={() => void addBirthday()}>{t("contacts.birthday.add")}</Button>
                </div>
              </section>
            )}
            {member && (
              <section aria-label={t("contacts.field.emails")}>
                <h3 className="mb-1 text-sm font-semibold">{t("contacts.field.emails")}</h3>
                <ul className="divide-y divide-vc-line rounded-lg border border-vc-line">
                  <li className="flex items-center justify-between gap-3 px-3 py-2 text-sm"><span className="min-w-0 break-all"><AddressLink address={member.email} /> {!member.external && <span className="ml-1 text-xs text-vc-text-secondary">{t("contacts.label.work")}</span>}</span></li>
                </ul>
              </section>
            )}
            {member?.external?.phone && (
              <section aria-label={t("contacts.field.phones")}>
                <h3 className="mb-1 text-sm font-semibold">{t("contacts.field.phones")}</h3>
                <ul className="divide-y divide-vc-line rounded-lg border border-vc-line">
                  <li className="px-3 py-2 text-sm"><a href={`tel:${member.external.phone.replace(/[^+\d]/g, "")}`} className="text-vc-main hover:underline">{member.external.phone}</a></li>
                </ul>
              </section>
            )}

            {contact && (
              <>
                {contact.emails.length > 0 && (
                  <section aria-label={t("contacts.field.emails")}>
                    <h3 className="mb-1 text-sm font-semibold">{t("contacts.field.emails")}</h3>
                    <ul className="divide-y divide-vc-line rounded-lg border border-vc-line">
                      {contact.emails.map((e) => (
                        <li key={e.address} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                          <span className="min-w-0 break-all"><AddressLink address={e.address} /> <span className="ml-1 text-xs text-vc-text-secondary">{t(`contacts.label.${e.label}` as MessageKey)}</span> <OriginTag internal={isInternal(e.address)} className="ml-1 align-middle" /></span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {contact.phones.length > 0 && (
                  <section aria-label={t("contacts.field.phones")}>
                    <h3 className="mb-1 text-sm font-semibold">{t("contacts.field.phones")}</h3>
                    <ul className="divide-y divide-vc-line rounded-lg border border-vc-line">
                      {contact.phones.map((p) => (
                        <li key={p.number} className="px-3 py-2 text-sm">
                          <a href={`tel:${p.number.replace(/[^0-9+]/g, "")}`} className="text-vc-main hover:underline">{p.number}</a> <span className="ml-1 text-xs text-vc-text-secondary">{t(`contacts.label.${p.label}` as MessageKey)}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {contact.addresses.length > 0 && (
                  <section aria-label={t("contacts.field.addresses")}>
                    <h3 className="mb-1 text-sm font-semibold">{t("contacts.field.addresses")}</h3>
                    <ul className="divide-y divide-vc-line rounded-lg border border-vc-line">
                      {contact.addresses.map((a, i) => (
                        <li key={i} className="px-3 py-2 text-sm">
                          <span className="whitespace-pre-line break-words">{formatAddress(a)}</span> <span className="ml-1 text-xs text-vc-text-secondary">{t(`contacts.label.${a.label}` as MessageKey)}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {contact.birthday && (
                  <section aria-label={t("contacts.field.birthday")}>
                    <h3 className="mb-1 text-sm font-semibold">{t("contacts.field.birthday")}</h3>
                    <p className="rounded-lg border border-vc-line px-3 py-2 text-sm">{formatBirthday(contact.birthday, locale)}</p>
                  </section>
                )}
                {contact.notes && (
                  <section aria-label={t("contacts.field.notes")}>
                    <h3 className="mb-1 text-sm font-semibold">{t("contacts.field.notes")}</h3>
                    <p className="whitespace-pre-wrap break-words rounded-lg border border-vc-line px-3 py-2 text-sm">{contact.notes}</p>
                  </section>
                )}
              </>
            )}

            {/* Historique : e-mails, rendez-vous, appels... selon l'application hote. */}
            {(contact || member) && <div key={`h-${contact?.id ?? member?.email}`}>{host.renderHistory?.(person)}</div>}

            {list && (
              <section aria-label={t("contacts.list.addresses")}>
                <h3 className="mb-1 text-sm font-semibold">{t("contacts.list.addresses")}</h3>
                <ul className="divide-y divide-vc-line rounded-lg border border-vc-line">
                  {list.addresses.map((a) => <li key={a} className="break-all px-3 py-2 text-sm"><AddressLink address={a} /> <OriginTag internal={isInternal(a)} className="ml-1 align-middle" /></li>)}
                </ul>
              </section>
            )}
          </article>
        )}
      </section>

      {contactDialog && <ContactDialog initial={dialogContact} {...(dialogColleague ? { colleague: dialogColleague } : {})} onClose={() => setContactDialog(null)} onSaved={(c) => { setContactDialog(null); open({ kind: "contact", id: c.id }); void reload(); }} />}
      {listDialog && <ListDialog initial={listDialog === "new" ? null : listDialog} onClose={() => setListDialog(null)} onSaved={(l) => { setListDialog(null); open({ kind: "list", id: l.id }); void reload(); }} />}
      {dupOpen && <DuplicatesDialog contacts={contacts} isColleague={(c) => !!colleagueOf(c)} onClose={() => setDupOpen(false)} onMerged={async () => { setSel(null); setPicked(new Set()); await reload(); }} />}
      {ioOpen && <ImportExportDialog onClose={() => setIoOpen(false)} onImported={() => void reload()} />}
      <ConfirmModal isOpen={confirmBulkDelete} onClose={() => setConfirmBulkDelete(false)} title={t("contacts.bulk.deleteTitle")} confirmLabel={t("contacts.delete")} cancelLabel={t("contacts.cancel")} danger onConfirm={() => { setConfirmBulkDelete(false); void bulk("delete"); }}>
        {t("contacts.bulk.deleteBody", { count: picked.size })}
      </ConfirmModal>
      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t(sel?.kind === "list" ? "contacts.list.deleteTitle" : "contacts.deleteTitle")}
        confirmLabel={t("contacts.delete")}
        cancelLabel={t("contacts.cancel")}
        danger
        onConfirm={() => void remove()}
      >
        {t(sel?.kind === "list" ? "contacts.list.deleteBody" : "contacts.deleteBody", { name: contact?.name ?? list?.name ?? "" })}
      </ConfirmModal>
    </div>
  );
}
