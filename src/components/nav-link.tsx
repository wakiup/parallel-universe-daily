import { cn } from "@/lib/utils";

export function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200",
        active
          ? "text-quantum bg-quantum/10 border border-quantum/15"
          : "text-void-text hover:text-signal hover:bg-abyss/50 border border-transparent"
      )}
    >
      {children}
    </a>
  );
}
