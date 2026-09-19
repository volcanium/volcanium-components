import { useState, ReactNode } from "react";
import clsx from "clsx";
import { Squircle } from "@squircle-js/react";
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
  const [hover, setHover] = useState(false);

  const card = (
    <Squircle cornerRadius={20} cornerSmoothing={1} asChild>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={clsx(
          "flex flex-col gap-4 p-5 sm:p-8 text-start bg-container border border-line transition-all duration-300",
          link &&
            "cursor-pointer hover:border-line-strong hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-20px_rgba(0,0,0,0.6)]",
          fix ? "w-full sm:w-200" : "w-full",
        )}
      >
        <div className="flex flex-row items-center justify-between gap-3">
          <Title level="lg">{title}</Title>
          {link && (
            <IconArrowRight
              size={20}
              className={clsx(
                "shrink-0 text-secondary transition-all duration-300",
                hover ? "opacity-100 translate-x-0" : "-translate-x-2 opacity-0",
              )}
            />
          )}
        </div>
        <div
          className={clsx(
            "h-px bg-line transition-opacity duration-300",
            hover && link ? "opacity-100" : "opacity-70",
          )}
        />
        <div className="flex flex-col gap-2">{children}</div>
      </div>
    </Squircle>
  );

  if (!link) return card;

  return (
    <Link
      to={link}
      className="block rounded-[20px] focus-visible:outline-2 focus-visible:outline-main focus-visible:outline-offset-2"
    >
      {card}
    </Link>
  );
}

export default Container;
