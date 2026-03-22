"use client";

import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export function Select({ className, options, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-8 rounded-md border border-border bg-muted px-2 text-xs text-foreground",
        "focus:outline-none focus:ring-2 focus:ring-primary/50",
        "cursor-pointer",
        className
      )}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
