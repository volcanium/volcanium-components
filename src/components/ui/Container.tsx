import { useState, ReactNode } from "react";
import clsx from "clsx";
import Title from "./Title";
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "react-router-dom";

/**
 * Container component with a title and content section.
 *
 * @param {Object} props
 * @param {string} props.title - Title text displayed at the top of the container.
 * @param {boolean} [props.fix=false] - When true, applies fixed width styling.
 * @param {React.ReactNode} props.children - Child content rendered inside the container.
 * @param {string} [props.link] - Link to navigate on click.
 *
 * @returns {JSX.Element}
 */
export interface ContainerProps {
  title: string;
  fix?: boolean;
  children: ReactNode;
  link?: string;
}

export function Container({ title, fix, children, link }: ContainerProps) {
  const [containerHover, setContainerHover] = useState(false);

  const containerEl = (
    <div
      onMouseEnter={() => setContainerHover(true)}
      onMouseLeave={() => setContainerHover(false)}
      tabIndex={link ? 0 : undefined}
      className={clsx(
        "bg-container flex flex-col p-4 sm:p-10 rounded-2xl text-start gap-4",
        link
          ? "cursor-pointer focus-visible:outline-2 focus-visible:outline-main focus-visible:outline-offset-2"
          : "cursor-auto",
        fix ? "w-full sm:w-200" : "w-full",
      )}
    >
      <div className="flex flex-row gap-2 items-center justify-between">
        <Title>{title}</Title>{" "}
        {link && (
          <IconArrowRight
            className={clsx(
              "text-secondary duration-300 transition-all",
              containerHover
                ? "opacity-100 translate-x-0"
                : "-translate-x-2 opacity-0",
            )}
          />
        )}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );

  return link ? <Link to={link}>{containerEl}</Link> : containerEl;
}

export default Container;
