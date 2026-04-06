import { links, linksPageSettings, type LinkItem, type LinksPageSettings } from "@/data/links";

export type LinkBuilderContent = {
  links: LinkItem[];
  settings: LinksPageSettings;
};

export const defaultLinkBuilderContent: LinkBuilderContent = {
  links,
  settings: linksPageSettings,
};

export const createLinkBuilderContent = (): LinkBuilderContent =>
  JSON.parse(JSON.stringify(defaultLinkBuilderContent)) as LinkBuilderContent;
