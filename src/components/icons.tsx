import {
  PenLine,
  Image as ImageIcon,
  Video,
  AudioLines,
  Code2,
  Search,
  Zap,
  PenTool,
  Megaphone,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export const categoryIcons: Record<string, LucideIcon> = {
  PenLine,
  Image: ImageIcon,
  Video,
  AudioLines,
  Code2,
  Search,
  Zap,
  PenTool,
  Megaphone,
  Briefcase,
};

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = categoryIcons[name] ?? Zap;
  return <Icon className={className} aria-hidden="true" />;
}
