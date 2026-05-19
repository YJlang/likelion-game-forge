import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TextEntryProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TextEntry({ value, onChange, placeholder, className }: TextEntryProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || document.activeElement === el || el.textContent === value) return;
    el.textContent = value;
  }, [value]);

  return (
    <div
      ref={ref}
      role="textbox"
      tabIndex={0}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={cn(
        "text-entry w-full min-h-12 rounded-lg bg-input border border-border px-3 py-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      onInput={(event) => onChange(event.currentTarget.textContent ?? "")}
      onPaste={(event) => {
        event.preventDefault();
        const text = event.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.preventDefault();
      }}
    />
  );
}
