"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useNavigate } from "@/components/shell/PageTransition";

type Props = ComponentProps<typeof Link> & { transition?: boolean };

/** next/link with the power-cut page transition. */
export function TLink({ transition = true, onNavigate, href, ...rest }: Props) {
  const navigate = useNavigate();
  const target = typeof href === "string" ? href : `${href.pathname ?? ""}${href.search ?? ""}${href.hash ?? ""}`;
  return (
    <Link
      href={href}
      onNavigate={(e) => {
        onNavigate?.(e);
        if (!transition) return;
        e.preventDefault();
        void navigate(target);
      }}
      {...rest}
    />
  );
}
