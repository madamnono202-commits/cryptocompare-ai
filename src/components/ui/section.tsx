import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "muted" | "card" | "gradient";
  size?: "sm" | "default" | "lg" | "hero";
}

const sizeStyles = {
  sm: "py-8 md:py-12",
  default: "py-12 md:py-16",
  lg: "py-16 md:py-24",
  hero: "py-20 md:py-32",
};

const variantStyles = {
  default: "",
  muted: "bg-muted/50",
  card: "bg-card border-y",
  gradient: "bg-gradient-brand text-white",
};

export function Section({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </section>
  );
}
