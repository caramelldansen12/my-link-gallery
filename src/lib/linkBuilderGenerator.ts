import type { LinkBuilderContent } from "@/data/linkBuilderContent";

export const buildLinksDataJson = (content: LinkBuilderContent): string => {
  const output = {
    settings: content.settings,
    links: content.links,
  };

  return JSON.stringify(output, null, 2);
};

export const downloadLinksDataJson = (content: LinkBuilderContent) => {
  const file = new Blob([buildLinksDataJson(content)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "links-data.json";
  anchor.rel = "noopener noreferrer";
  anchor.click();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
