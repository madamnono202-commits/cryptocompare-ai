import { cn } from "@/lib/utils";
import { Construction } from "lucide-react";

interface PlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export function Placeholder({
  label,
  description,
  icon,
  className,
  ...props
}: PlaceholderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center",
        className
      )}
      {...props}
    >
      <div className="mb-4 rounded-full bg-muted p-3">
        {icon ?? <Construction className="h-6 w-6 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold">{label}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
