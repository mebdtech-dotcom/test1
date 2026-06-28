import { Loader2 } from "lucide-react";

import { cn } from "@/shared/ui/lib/cn";

interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  label?: string;
}

function Spinner({ className, label = "Loading", ...props }: SpinnerProps) {
  return (
    <Loader2
      role="status"
      aria-label={label}
      className={cn("size-4 animate-spin text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Spinner };
