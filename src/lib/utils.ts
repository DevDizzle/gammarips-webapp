import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Removes trailing .0 from dollar amounts in a string.
 * Example: "Targets $49.0" -> "Targets $49"
 */
export function cleanPriceStrings(text: string | undefined | null): string {
  if (!text) return "";
  return text.replace(/\$(\d+)\.0\b/g, '$$$1');
}
