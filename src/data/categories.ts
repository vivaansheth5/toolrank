import type { CategoryInfo } from "./types";

export const categories: CategoryInfo[] = [
  {
    slug: "writing",
    name: "Writing",
    description: "AI writing assistants, chatbots and editing tools.",
    icon: "PenLine",
  },
  {
    slug: "image",
    name: "Image",
    description: "AI image generation and visual creation tools.",
    icon: "Image",
  },
  {
    slug: "video",
    name: "Video",
    description: "AI video generation, editing and repurposing tools.",
    icon: "Video",
  },
  {
    slug: "audio",
    name: "Audio",
    description: "Voice generation, transcription and audio editing.",
    icon: "AudioLines",
  },
  {
    slug: "coding",
    name: "Coding",
    description: "AI coding assistants, editors and dev platforms.",
    icon: "Code2",
  },
  {
    slug: "research",
    name: "Research",
    description: "AI-powered search and research assistants.",
    icon: "Search",
  },
  {
    slug: "productivity",
    name: "Productivity",
    description: "Notes, automation, project management and more.",
    icon: "Zap",
  },
  {
    slug: "design",
    name: "Design",
    description: "UI/UX design, graphic design and website builders.",
    icon: "PenTool",
  },
  {
    slug: "marketing",
    name: "Marketing",
    description: "SEO, copywriting and marketing platforms.",
    icon: "Megaphone",
  },
  {
    slug: "business",
    name: "Business",
    description: "CRM, communication and business operations tools.",
    icon: "Briefcase",
  },
];

export function getCategory(slug: string): CategoryInfo | undefined {
  return categories.find((c) => c.slug === slug);
}
