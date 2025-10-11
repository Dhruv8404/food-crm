"use client"

export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  )
}
