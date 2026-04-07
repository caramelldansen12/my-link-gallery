import type { ResumeBuilderContent } from "@/data/resumeBuilderContent";
import resumeTemplate from "@/pages/Resume.tsx?raw";

export const resumeBuilderStorageKey = "my-link-gallery.resume-builder.draft.v1";

const formatJson = (value: unknown) => JSON.stringify(value, null, 2);

const replaceConst = (source: string, constName: string, literal: string) => {
  const pattern = new RegExp(`const\\s+${constName}\\s*=\\s*[\\s\\S]*?;\\r?\\n`);
  return source.replace(pattern, `const ${constName} = ${literal};\n`);
};

const extractConstLiteral = (source: string, constName: string) => {
  const pattern = new RegExp(`const\\s+${constName}\\s*=\\s*([\\s\\S]*?);\\r?\\n`);
  const match = source.match(pattern);
  return match?.[1]?.trim() ?? null;
};

const evalLiteral = <T>(literal: string) => {
  return new Function(`return (${literal});`)() as T;
};

const LINGUISTIC_PSYCHOMETRICS_PAGE_ID = "linguistic-psychometrics";

const removeLinguisticPsychometricsPage = (pages: ResumeBuilderContent["resumePages"]) => {
  return pages.filter((page) => page.id !== LINGUISTIC_PSYCHOMETRICS_PAGE_ID);
};

const createBlankEducation = (): ResumeBuilderContent["educationDetails"][number] => ({
  institution: "",
  degree: "",
  period: "",
  grade: "",
  focus: "",
});

const normalizeEducationDetails = (value: unknown): ResumeBuilderContent["educationDetails"] => {
  const rawItems = Array.isArray(value) ? value : [value];
  return rawItems
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      institution: typeof item.institution === "string" ? item.institution : "",
      degree: typeof item.degree === "string" ? item.degree : "",
      period: typeof item.period === "string" ? item.period : "",
      grade: typeof item.grade === "string" ? item.grade : "",
      focus: typeof item.focus === "string" ? item.focus : "",
    }));
};

const normalizeContactChannels = (value: unknown): ResumeBuilderContent["contactChannels"] => {
  const rawItems = Array.isArray(value) ? value : [value];
  return rawItems
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      label: typeof item.label === "string" ? item.label : "",
      value: typeof item.value === "string" ? item.value : "",
      href: typeof item.href === "string" ? item.href : "",
      className: typeof item.className === "string" ? item.className : "",
      hidden: typeof item.hidden === "boolean" ? item.hidden : false,
    }));
};

const buildExportContactChannels = (channels: ResumeBuilderContent["contactChannels"]) => {
  return channels
    .filter((channel) => !channel.hidden)
    .map(({ hidden, ...channel }) => channel);
};

const stripContactSupplementalBlocks = (source: string) => {
  let next = source;

  // Remove only the explicit Contact "Partnership" block.
  next = next.replace(
    /\r?\n\s*<div className="space-y-2">\s*\r?\n\s*<p className="text-sm font-semibold uppercase tracking-\[0\.2em\] text-muted-foreground">\s*\r?\n\s*Partnership\s*\r?\n\s*<\/p>\s*\r?\n\s*<div className="space-y-1 text-sm text-foreground\/95">[\s\S]*?<\/div>\s*\r?\n\s*<\/div>/,
    ""
  );

  // Remove only the explicit Contact "Inquiries?" block.
  next = next.replace(
    /\r?\n\s*<div className="space-y-2">\s*\r?\n\s*<p className="text-sm font-semibold uppercase tracking-\[0\.2em\] text-muted-foreground">\s*\r?\n\s*Inquiries\?\s*\r?\n\s*<\/p>\s*\r?\n\s*<div className="space-y-1 text-sm text-foreground\/95">[\s\S]*?<\/div>\s*\r?\n\s*<\/div>/,
    ""
  );

  // If wrapper becomes empty after removing both blocks, remove it too.
  next = next.replace(/\r?\n\s*<div className="space-y-5">\s*(?:\r?\n\s*)<\/div>/, "");

  return next;
};

const stripResumePageNavigation = (source: string) => {
  let next = source;

  next = next.replace(/\r?\nimport\s+ResumePageNavigation\s+from\s+"@\/components\/ResumePageNavigation";\r?\n/, "\n");
  next = next.replace(/\r?\nimport\s+\{\s*useResumePageNavigation\s*\}\s+from\s+"@\/hooks\/useResumePageNavigation";\r?\n/, "\n");
  next = next.replace(
    /\r?\n\s*const\s+\{\s*goToPrevious\s*,\s*goToNext\s*,\s*isAtStart\s*,\s*isAtEnd\s*\}\s*=\s*useResumePageNavigation\([\s\S]*?\);\r?\n/,
    "\n"
  );
  next = next.replace(
    /\r?\n\s*<ResumePageNavigation[\s\S]*?\/>\s*\r?\n/,
    "\n"
  );

  return next;
};

export const parseResumeContentFromSource = (source: string): ResumeBuilderContent | null => {
  try {
    const sanitizedSource = stripContactSupplementalBlocks(source);

    const resumePagesLiteral = extractConstLiteral(sanitizedSource, "resumePages");
    const projectItemsLiteral = extractConstLiteral(sanitizedSource, "projectItems");
    const otherWorkingExperiencesLiteral = extractConstLiteral(sanitizedSource, "otherWorkingExperiences");
    const educationDetailsLiteral = extractConstLiteral(sanitizedSource, "educationDetails");
    const honorsAndAwardsLiteral = extractConstLiteral(sanitizedSource, "honorsAndAwards");
    const keySkillsLiteral = extractConstLiteral(sanitizedSource, "keySkills");
    const toolsAndEquipmentLiteral = extractConstLiteral(sanitizedSource, "toolsAndEquipment");
    const highlightedCredentialsLiteral = extractConstLiteral(sanitizedSource, "highlightedCredentials");
    const contactChannelsLiteral = extractConstLiteral(sanitizedSource, "contactChannels");
    const overviewDetailsLiteral = extractConstLiteral(sanitizedSource, "overviewDetails");
    const rollingKeywordRowsLiteral = extractConstLiteral(sanitizedSource, "rollingKeywordRows");

    if (
      !resumePagesLiteral ||
      !projectItemsLiteral ||
      !otherWorkingExperiencesLiteral ||
      !educationDetailsLiteral ||
      !honorsAndAwardsLiteral ||
      !keySkillsLiteral ||
      !toolsAndEquipmentLiteral ||
      !highlightedCredentialsLiteral ||
      !contactChannelsLiteral ||
      !overviewDetailsLiteral ||
      !rollingKeywordRowsLiteral
    ) {
      return null;
    }

    const overviewDetailsRaw = new Function(
      "MapPin",
      "MapPinned",
      "ArrowRightLeft",
      "Briefcase",
      `return (${overviewDetailsLiteral});`
    )(null, null, null, null) as Array<{ text?: string }>;

    return {
      resumePages: removeLinguisticPsychometricsPage(
        evalLiteral<ResumeBuilderContent["resumePages"]>(resumePagesLiteral)
      ),
      projectItems: evalLiteral<ResumeBuilderContent["projectItems"]>(projectItemsLiteral),
      otherWorkingExperiences: evalLiteral<ResumeBuilderContent["otherWorkingExperiences"]>(otherWorkingExperiencesLiteral),
      educationDetails: normalizeEducationDetails(evalLiteral<unknown>(educationDetailsLiteral)),
      honorsAndAwards: evalLiteral<ResumeBuilderContent["honorsAndAwards"]>(honorsAndAwardsLiteral),
      keySkills: evalLiteral<ResumeBuilderContent["keySkills"]>(keySkillsLiteral),
      toolsAndEquipment: evalLiteral<ResumeBuilderContent["toolsAndEquipment"]>(toolsAndEquipmentLiteral),
      highlightedCredentials: evalLiteral<ResumeBuilderContent["highlightedCredentials"]>(highlightedCredentialsLiteral),
      contactChannels: normalizeContactChannels(evalLiteral<unknown>(contactChannelsLiteral)),
      overviewDetails: overviewDetailsRaw.map((item) => ({ text: item.text ?? "" })),
      rollingKeywordRows: evalLiteral<ResumeBuilderContent["rollingKeywordRows"]>(rollingKeywordRowsLiteral),
    };
  } catch {
    return null;
  }
};

const buildOverviewDetailsLiteral = (details: Array<{ text: string }>) => {
  const iconNames = ["MapPin", "MapPinned", "ArrowRightLeft", "Briefcase"];
  const texts = details.slice(0, iconNames.length).map((item) => item.text);

  while (texts.length < iconNames.length) {
    texts.push("");
  }

  const lines = iconNames.map(
    (iconName, index) =>
      `  {\n    icon: ${iconName},\n    text: ${JSON.stringify(texts[index])},\n  }`
  );

  return `[\n${lines.join(",\n")}\n]`;
};

export const buildResumeTsx = (content: ResumeBuilderContent, templateSource = resumeTemplate) => {
  let output = templateSource;

  const resumePagesWithoutLinguisticPsychometrics = removeLinguisticPsychometricsPage(content.resumePages);

  output = replaceConst(output, "resumePages", formatJson(resumePagesWithoutLinguisticPsychometrics));
  output = replaceConst(output, "projectItems", formatJson(content.projectItems));
  output = replaceConst(output, "otherWorkingExperiences", formatJson(content.otherWorkingExperiences));
  output = replaceConst(output, "educationDetails", formatJson(normalizeEducationDetails(content.educationDetails)));
  output = replaceConst(output, "honorsAndAwards", formatJson(content.honorsAndAwards));
  output = replaceConst(output, "keySkills", formatJson(content.keySkills));
  output = replaceConst(output, "toolsAndEquipment", formatJson(content.toolsAndEquipment));
  output = replaceConst(output, "highlightedCredentials", formatJson(content.highlightedCredentials));
  output = replaceConst(output, "contactChannels", formatJson(buildExportContactChannels(content.contactChannels)));
  output = replaceConst(output, "rollingKeywordRows", formatJson(content.rollingKeywordRows));
  output = replaceConst(output, "overviewDetails", buildOverviewDetailsLiteral(content.overviewDetails));
  output = stripContactSupplementalBlocks(output);
  output = stripResumePageNavigation(output);

  return output;
};

export const downloadResumeTsx = (content: ResumeBuilderContent, templateSource = resumeTemplate) => {
  const file = new Blob([buildResumeTsx(content, templateSource)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "Resume.tsx";
  anchor.rel = "noopener noreferrer";
  anchor.click();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
