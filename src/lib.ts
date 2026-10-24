// Point d'entree SANS interface (`@volcanium/volcanium-components/lib`) : fonctions pures du calendrier et des contacts. Pour les modules qui n'ont
// pas besoin de React (et leurs tests) : rien d'autre n'est charge.
export { isValidEmail, parseRecipients } from "./contacts/recipients";
export type { Recipient } from "./contacts/recipients";
export { splitName } from "./contacts/name";
export { formatAddress } from "./contacts/address";
export * from "./contacts/duplicates";
export * from "./contacts/sort";
export * from "./calendar/time";
export { BIRTHDAY_CALENDAR_ID, BIRTHDAY_COLOR, birthdayCalendar, birthdayContactId, birthdayEvents, birthdayFromFields, formatBirthday, isBirthdayEvent } from "./calendar/birthdays";
