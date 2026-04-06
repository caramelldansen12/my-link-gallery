import type { LinkBuilderContent } from "@/data/linkBuilderContent";
import linksTemplate from "@/data/links.ts?raw";

const formatJson = (value: unknown) => JSON.stringify(value, null, 2);

const replaceConst = (source: string, constName: string, literal: string) => {
  const pattern = new RegExp(`export\\s+const\\s+${constName}(?:\\s*:\\s*[^=]+)?\\s*=\\s*[\\s\\S]*?;\\r?\\n`);
  return source.replace(pattern, `export const ${constName} = ${literal};\n`);
};

const extractConstLiteral = (source: string, constName: string) => {
  const pattern = new RegExp(`export\\s+const\\s+${constName}(?:\\s*:\\s*[^=]+)?\\s*=\\s*([\\s\\S]*?);\\r?\\n`);
  const match = source.match(pattern);
  return match?.[1]?.trim() ?? null;
};

const evalLiteral = <T>(literal: string) => {
  return new Function(`return (${literal});`)() as T;
};

export const parseLinkBuilderContentFromSource = (source: string): LinkBuilderContent | null => {
  try {
    const linksLiteral = extractConstLiteral(source, "links");
    const settingsLiteral = extractConstLiteral(source, "linksPageSettings");

    if (!linksLiteral || !settingsLiteral) {
      return null;
    }

    const settingsRaw = evalLiteral<Record<string, unknown>>(settingsLiteral);

    return {
      links: evalLiteral<LinkBuilderContent["links"]>(linksLiteral),
      settings: {
        title: typeof settingsRaw.title === "string" ? settingsRaw.title : "Links",
        pageSize:
          typeof settingsRaw.pageSize === "number" && Number.isFinite(settingsRaw.pageSize)
            ? Math.max(1, Math.floor(settingsRaw.pageSize))
            : 12,
        quickTags: Array.isArray(settingsRaw.quickTags)
          ? settingsRaw.quickTags.filter((tag): tag is string => typeof tag === "string")
          : [],
      },
    };
  } catch {
    return null;
  }
};

export const buildLinksTs = (content: LinkBuilderContent) => {
  let output = linksTemplate;

  output = replaceConst(output, "linksPageSettings", formatJson(content.settings));
  output = replaceConst(output, "links", formatJson(content.links));

  return output;
};

export const downloadLinksTs = (content: LinkBuilderContent) => {
  const file = new Blob([buildLinksTs(content)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "links.ts";
  anchor.rel = "noopener noreferrer";
  anchor.click();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
