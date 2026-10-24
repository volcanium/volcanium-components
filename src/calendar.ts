// Point d'entree a part (`@volcanium/volcanium-components/calendar`) : l'ecran du calendrier est lourd, l'application le charge a la demande
// (`React.lazy`) au lieu de l'embarquer dans son paquet principal. Les types, le client et les textes restent dans l'entree principale.
export { default as CalendarPage } from "./calendar/CalendarPage";
