import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "article" | "main";
}

export function Container({
  className,
  as: Comp = "div",
  children,
  ...props
}: ContainerProps) {
  return (
    <Comp
      className={cn("container mx-auto px-4 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </Comp>
  );
}
