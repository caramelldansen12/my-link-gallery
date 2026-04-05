export type LinkCategory = "Social" | "Projects" | "Content" | "Tools" | "Community";

export interface LinkItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category: LinkCategory;
  tags: string[];
  pinned?: boolean;
}

export const categories: LinkCategory[] = ["Social", "Projects", "Content", "Tools", "Community"];

export const tagColorMap: Record<LinkCategory, string> = {
  Social: "bg-tag-social text-tag-social-foreground",
  Projects: "bg-tag-project text-tag-project-foreground",
  Content: "bg-tag-content text-tag-content-foreground",
  Tools: "bg-tag-tools text-tag-tools-foreground",
  Community: "bg-tag-community text-tag-community-foreground",
};

export const links: LinkItem[] = [
  {
    id: "1",
    title: "Twitter / X",
    description: "Follow me for thoughts on tech, design, and life updates.",
    url: "https://x.com",
    category: "Social",
    tags: ["Social Media", "Updates"],
    pinned: true,
  },
  {
    id: "2",
    title: "GitHub",
    description: "Check out my open-source projects and contributions.",
    url: "https://github.com",
    category: "Projects",
    tags: ["Code", "Open Source"],
    pinned: true,
  },
  {
    id: "3",
    title: "YouTube Channel",
    description: "Tutorials, vlogs, and deep dives on various topics.",
    url: "https://youtube.com",
    category: "Content",
    tags: ["Video", "Tutorials"],
  },
  {
    id: "4",
    title: "Personal Blog",
    description: "Long-form writing about technology, productivity, and creativity.",
    url: "https://blog.example.com",
    category: "Content",
    tags: ["Writing", "Blog"],
  },
  {
    id: "5",
    title: "LinkedIn",
    description: "Professional profile and career updates.",
    url: "https://linkedin.com",
    category: "Social",
    tags: ["Professional", "Networking"],
  },
  {
    id: "6",
    title: "Figma Community",
    description: "Free design templates and UI kits I've published.",
    url: "https://figma.com",
    category: "Tools",
    tags: ["Design", "Templates"],
  },
  {
    id: "7",
    title: "Discord Server",
    description: "Join our community to chat about tech and design.",
    url: "https://discord.gg",
    category: "Community",
    tags: ["Chat", "Community"],
  },
  {
    id: "8",
    title: "Newsletter",
    description: "Weekly curated insights on design and development.",
    url: "https://newsletter.example.com",
    category: "Content",
    tags: ["Newsletter", "Weekly"],
  },
  {
    id: "9",
    title: "Portfolio",
    description: "Showcase of my best design and development work.",
    url: "https://portfolio.example.com",
    category: "Projects",
    tags: ["Portfolio", "Showcase"],
  },
  {
    id: "10",
    title: "Notion Templates",
    description: "Productivity templates I use and share for free.",
    url: "https://notion.so",
    category: "Tools",
    tags: ["Productivity", "Templates"],
  },
  {
    id: "11",
    title: "Instagram",
    description: "Visual stories, photography, and behind-the-scenes.",
    url: "https://instagram.com",
    category: "Social",
    tags: ["Social Media", "Photography"],
  },
  {
    id: "12",
    title: "Open Source Library",
    description: "A React component library I maintain for the community.",
    url: "https://github.com",
    category: "Projects",
    tags: ["Code", "Open Source", "React"],
  },
];
