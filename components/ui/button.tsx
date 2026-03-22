import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "icon";
}

export function Button({ className, variant = "default", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50",
        variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
        variant === "outline" && "border border-border bg-transparent hover:bg-accent",
        size === "sm" && "h-7 px-2.5 text-xs",
        size === "md" && "h-9 px-4 text-sm",
        size === "icon" && "h-8 w-8",
        className
      )}
      {...props}
    />
  );
}
