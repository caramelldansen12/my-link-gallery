import type { ResumeBuilderContent } from "@/data/resumeBuilderContent";
import resumeDataJson from "@/data/resume-data.json";

export const resumeBuilderStorageKey = "my-link-gallery.resume-builder.draft.v1";

const LINGUISTIC_PSYCHOMETRICS_PAGE_ID = "linguistic-psychometrics";

const OVERVIEW_ICON_NAMES = ["MapPin", "MapPinned", "ArrowRightLeft", "Briefcase"] as const;

const linguisticPsychometricsPage = resumeDataJson.resumePages.find(
  (page) => page.id === LINGUISTIC_PSYCHOMETRICS_PAGE_ID
);

export const buildResumeDataJson = (content: ResumeBuilderContent): string => {
  const outputPages = [...content.resumePages];

  if (linguisticPsychometricsPage) {
    const educationIndex = outputPages.findIndex((p) => p.id === "education-honors");
    if (educationIndex >= 0) {
      outputPages.splice(educationIndex, 0, linguisticPsychometricsPage as typeof outputPages[number]);
    } else {
      outputPages.push(linguisticPsychometricsPage as typeof outputPages[number]);
    }
  }

  const outputOverviewDetails = OVERVIEW_ICON_NAMES.map((iconName, index) => ({
    icon: iconName,
    text: content.overviewDetails[index]?.text ?? "",
  }));

  const output = {
    resumePages: outputPages,
    overviewDetails: outputOverviewDetails,
    rollingKeywordRows: content.rollingKeywordRows,
    projectItems: content.projectItems,
    otherWorkingExperiences: content.otherWorkingExperiences,
    educationDetails: content.educationDetails,
    honorsAndAwards: content.honorsAndAwards,
    keySkills: content.keySkills,
    toolsAndEquipment: content.toolsAndEquipment,
    highlightedCredentials: content.highlightedCredentials,
    contactChannels: content.contactChannels,
  };

  return JSON.stringify(output, null, 2);
};

export const downloadResumeDataJson = (content: ResumeBuilderContent) => {
  const file = new Blob([buildResumeDataJson(content)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "resume-data.json";
  anchor.rel = "noopener noreferrer";
  anchor.click();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
