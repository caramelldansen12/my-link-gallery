import linksDataJson from "@/data/links-data.json";

export interface LinkItem {
  title: string;
  description: string;
  url: string;
  tags: string[];
  pinned?: boolean;
}

export type LinksPageSettings = {
  title: string;
  pageSize: number;
  quickTags: string[];
};

export const linksPageSettings: LinksPageSettings = linksDataJson.settings;

export const links: LinkItem[] = linksDataJson.links;
