import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * iVendorz Design System — className composer.
 * Merges conditional class names and de-duplicates conflicting Tailwind
 * utilities so component-level styling always wins predictably.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
