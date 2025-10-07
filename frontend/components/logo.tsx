import { cn } from "@/lib/utils"

interface NotesmanLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Logo({ className, size = "md" }: NotesmanLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-lg",
    md: "w-10 h-10 text-xl",
    lg: "w-12 h-12 text-2xl",
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-lg font-bold border border-border shadow-sm",
          "bg-black text-white dark:bg-white dark:text-black", // 👈 flips correctly
          sizeClasses[size],
        )}
      >
        N
      </div>
      <span className="font-semibold text-foreground tracking-tight">Notesman</span>
    </div>
  )
}
