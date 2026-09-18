import { format } from "date-fns";
import { useLanguage } from "../../utils/useLanguage";

/**
 * Button-like component used to display an information item and open a modal for editing.
 */
export interface InfoItem {
  name: string;
  title: string;
  value: string | Date | Array<string>;
  infos?: Array<string>;
  inputType?: string;
}

export interface InformationButtonPayload {
  title: string;
  value: string | Date | Array<string>;
  infos: Array<string>;
  modifFn?: () => void;
  inputType: string;
}

export interface InformationButtonProps {
  info: InfoItem;
  setCurrentModif?: (payload: InformationButtonPayload) => void;
  setShowModal?: (show: boolean) => void;
  modifFn?: () => void;
  onClick?: () => void;
}

export function InformationButton({
  info,
  setCurrentModif,
  setShowModal,
  modifFn,
  onClick,
}: InformationButtonProps) {
  const { t } = useLanguage();
  return (
    <button
      className="flex w-full flex-1 flex-col gap-2 bg-back hover:bg-black/50 items-start justify-start tracking-normal transition rounded-lg py-2 px-4 cursor-pointer"
      onClick={() => {
        onClick && onClick();
        setCurrentModif &&
          setCurrentModif({
            title: info.title,
            value: info.value || t("not_provided"),
            infos: info.infos || [],
            modifFn: modifFn,
            inputType:
              info.inputType || (info.value instanceof Date ? "date" : "text"),
          });
        setShowModal?.(true);
      }}
    >
      <div className="flex flex-col items-start justify-start">
        <p className="text-xl font-bold">{info.name}</p>
        <p>
          {info.value instanceof Date
            ? format(info.value, "dd/MM/yyyy")
            : Array.isArray(info.value)
              ? info.value.join(" • ")
              : info.value}
        </p>
      </div>
    </button>
  );
}

export default InformationButton;
