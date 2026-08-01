import React, { useState, ReactNode } from "react";
import Title from "./Title";
import { format } from "date-fns";
import { useLanguage } from "../../utils/useLanguage";
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "react-router-dom";

/**
 * Button-like component used to display an information item and open a modal for editing.
 *
 * @param {Object} props
 * @param {{
 *   name: string,
 *   title: string,
 *   value: string | Date | Array<string>,
 *   infos?: Array<string>,
 *   inputType?: string
 * }} props.info - Data for the information row.
 * @param {function(Object): void} [props.setCurrentModif] - Function to set the current modification payload.
 * @param {function(boolean): void} [props.setShowModal] - Function to toggle the modal visibility.
 * @param {function(): void} [props.modifFn] - Optional modify callback passed through the payload.
 * @param {function(): void} [props.onClick] - Optional click callback.
 *
 * @returns {JSX.Element}
 */
export interface InfoItem {
  name: string;
  title: string;
  value: string | Date | Array<string>;
  infos?: Array<string>;
  inputType?: string;
}

export interface InformationButtonProps {
  info: InfoItem;
  setCurrentModif?: (payload: any) => void;
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

/**
 * Container component with a title and content section.
 *
 * @param {Object} props
 * @param {string} props.title - Title text displayed at the top of the container.
 * @param {boolean} [props.fix=false] - When true, applies fixed width styling.
 * @param {React.ReactNode} props.children - Child content rendered inside the container.
 * @param {string} props.link - Link to navigate on click
 *
 * @returns {JSX.Element}
 */
export interface ContanerProps {
  title: string;
  fix?: boolean;
  children: ReactNode;
  link?: string;
}

export function Contaner({ title, fix, children, link }: ContanerProps) {
  const [contanerHover, setContanerHover] = useState(false);

  const contanerEl = (
    <div
      onMouseEnter={() => setContanerHover(true)}
      onMouseLeave={() => setContanerHover(false)}
      className={`bg-contaner flex flex-col p-4 sm:p-10 rounded-2xl text-start gap-4 ${link ? "cursor-pointer" : "cursor-auto"} ${fix ? "w-full sm:w-200" : "w-full"}`}
    >
      <div className="flex flex-row gap-2 items-center justify-between">
        <Title>{title}</Title>{" "}
        {link && (
          <IconArrowRight
            className={`text-secondary duration-300 transition-all ${contanerHover ? "opacity-100 translate-x-0" : "-translate-x-2 opacity-0"}`}
          />
        )}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );

  return link ? <Link to={link}>{contanerEl}</Link> : contanerEl;
}
