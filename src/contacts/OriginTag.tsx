import { Tag } from "./ui";
import { useI18n } from "./host";

/** « Interne » (adresse de l'entreprise) ou « Externe », comme dans Volcanium Mail. */
export default function OriginTag({ internal, className }: { internal: boolean; className?: string }) {
  const { t } = useI18n();
  return <Tag tone={internal ? "info" : "neutral"} {...(className ? { className } : {})}>{t(internal ? "contacts.tag.internal" : "contacts.tag.external")}</Tag>;
}
