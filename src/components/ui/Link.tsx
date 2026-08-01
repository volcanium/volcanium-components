import { useNavigate } from "react-router-dom";
import { ReactNode, AnchorHTMLAttributes } from "react";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  link?: string;
}

export default function Link({ children, link, ...props }: LinkProps) {
  const navigate = useNavigate();
  return (
    <a
      onClick={link ? () => navigate(link) : undefined}
      {...props}
      className="hover:underline cursor-pointer active:text-secondary"
    >
      {children}
    </a>
  );
}
