"use client";

import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * iv-file-link — generic file reference primitive.
 *
 * Per GI-09 a file link carries a `fileRef` ONLY. It never embeds a raw URL,
 * storage path, bucket, or signed token — resolution from `fileRef` to an
 * actual location is the app's responsibility, surfaced via `onActivate`.
 * This primitive just renders the affordance (label + optional icon) and emits
 * the opaque reference when activated.
 */
export interface IvFileLinkProps extends Omit<React.ComponentProps<"button">, "onClick"> {
  /** Opaque file reference. The only identifier this primitive knows about. */
  fileRef: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** Caller resolves and handles the reference (open/download/preview). */
  onActivate?: (fileRef: string) => void;
}

function IvFileLink({
  fileRef,
  label,
  icon,
  onActivate,
  className,
  type = "button",
  ...props
}: IvFileLinkProps) {
  return (
    <button
      type={type}
      data-slot="iv-file-link"
      data-file-ref={fileRef}
      onClick={() => onActivate?.(fileRef)}
      className={cn(
        "iv-file-link inline-flex items-center gap-2 rounded-[var(--radius)] text-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span className="iv-file-link-label">{label}</span>
    </button>
  );
}

export { IvFileLink };
