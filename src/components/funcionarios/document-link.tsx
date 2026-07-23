import type { AnchorHTMLAttributes, ReactNode } from "react";

type DocumentLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: ReactNode;
};

export function DocumentLink({ href, children, ...props }: DocumentLinkProps) {
  return (
    <a {...props} href={href}>
      {children}
    </a>
  );
}
