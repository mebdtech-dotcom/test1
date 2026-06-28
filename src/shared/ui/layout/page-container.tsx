import * as React from "react";

import { cn } from "@/shared/ui/lib/cn";

const widthMap = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  full: "max-w-none",
} as const;

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Constrains the content column width. Defaults to `lg`. */
  width?: keyof typeof widthMap;
}

/**
 * PageContainer — horizontal gutters + max-width wrapper used inside
 * every content surface so pages share consistent reading widths.
 */
export function PageContainer({
  width = "lg",
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-4 py-6 md:px-6 lg:px-8", widthMap[width], className)} {...props}>
      {children}
    </div>
  );
}
