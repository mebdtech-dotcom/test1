"use client";

// Kit app component: RichNoteEditor + RichNoteToolbar — demand-driven kit addition (2026-07-07).
// Needed by BOTH the vendor quotation workbench and the buyer New-RFQ item list; promoting to the
// kit beats duplicating an editor per track (extend-the-kit rule). A MINIMAL rich note field:
// bold + three fixed formatting colors, Enter = new line, single-line default height that grows
// with content, full text always shown (wraps, never truncates).
//
// Uncontrolled contentEditable: the HTML is set once on mount — re-key the component to
// re-initialize (e.g. after a device-draft restore) so typing never fights React re-renders.
// `document.execCommand` is the pragmatic interim (no kit rich-text primitive exists —
// [ESC-7B-TEXTAREA]-class gap). The HTML is scrubbed on every input; consumers should scrub again
// at any dangerouslySetInnerHTML injection point (defense-in-depth).
import * as React from "react";
import { Button } from "../primitives/button";
import { cn } from "../lib/cn";

/** Formatting colors — brand token values (--iv-navy-700 / --iv-amber-500) + danger red. */
export const RICH_NOTE_COLORS = [
  { name: "Navy", value: "#1f3154", dotClass: "bg-iv-navy-700" },
  { name: "Amber", value: "#b8860b", dotClass: "bg-iv-amber-500" },
  { name: "Red", value: "#dc2626", dotClass: "bg-red-600" },
] as const;

/** Light scrub for rich-note HTML (own-authored, device-local; never server-persisted yet). */
export const sanitizeRichNoteHtml = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");

export interface RichNoteEditorProps {
  initialHtml: string;
  onChange: (html: string) => void;
  ariaLabel: string;
  className?: string;
}

export function RichNoteEditor({
  initialHtml,
  onChange,
  ariaLabel,
  className,
}: RichNoteEditorProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (ref.current) ref.current.innerHTML = initialHtml;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialize once per mount (keyed remount to reset)
  }, []);
  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      aria-label={ariaLabel}
      className={cn(
        "min-h-9 w-full min-w-40 whitespace-pre-wrap break-words rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      onInput={(event) =>
        onChange(sanitizeRichNoteHtml((event.target as HTMLDivElement).innerHTML))
      }
    />
  );
}

/** Formatting toolbar — applies to the current selection in whichever RichNoteEditor has focus. */
export function RichNoteToolbar({ hint }: { hint?: string }) {
  return (
    <div
      role="toolbar"
      aria-label="Description formatting"
      className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
    >
      <span>Description formatting:</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-7 w-7 font-bold"
        aria-label="Bold selected description text"
        onMouseDown={(event) => {
          event.preventDefault();
          document.execCommand("bold");
        }}
      >
        B
      </Button>
      {RICH_NOTE_COLORS.map((color) => (
        <Button
          key={color.name}
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          aria-label={`Color selected description text ${color.name}`}
          onMouseDown={(event) => {
            event.preventDefault();
            document.execCommand("foreColor", false, color.value);
          }}
        >
          <span aria-hidden="true" className={`size-3 rounded-full ${color.dotClass}`} />
        </Button>
      ))}
      {hint ? <span>{hint}</span> : null}
    </div>
  );
}
