import dataJson from "@/data/data.json";

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

export const linksPageSettings: LinksPageSettings = dataJson.links.settings;

export const links: LinkItem[] = dataJson.links.links;
