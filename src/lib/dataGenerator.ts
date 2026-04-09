import type { ResumeBuilderContent } from "@/data/resumeBuilderContent";
import type { LinkBuilderContent } from "@/data/linkBuilderContent";
import { buildResumeSection } from "@/lib/resumeBuilderGenerator";

export const buildDataJson = (
  resumeContent: ResumeBuilderContent,
  linksContent: LinkBuilderContent
): string => {
  const output = {
    resume: buildResumeSection(resumeContent),
    links: {
      settings: linksContent.settings,
      links: linksContent.links,
    },
  };

  return JSON.stringify(output, null, 2);
};

export const downloadDataJson = (
  resumeContent: ResumeBuilderContent,
  linksContent: LinkBuilderContent
) => {
  const file = new Blob([buildDataJson(resumeContent, linksContent)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "data.json";
  anchor.rel = "noopener noreferrer";
  anchor.click();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
