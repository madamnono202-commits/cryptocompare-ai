import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: string;
  description?: string;
  centered?: boolean;
}

export function PageHeader({
  heading,
  description,
  centered = false,
  className,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        centered && "items-center text-center",
        className
      )}
      {...props}
    >
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
        {heading}
      </h1>
      {description && (
        <p className="max-w-2xl text-lg text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  );
}
