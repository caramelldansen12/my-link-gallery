import type { ResumeBuilderContent } from "@/data/resumeBuilderContent";
import dataJson from "@/data/data.json";

export const resumeBuilderStorageKey = "my-link-gallery.resume-builder.draft.v1";

const LINGUISTIC_PSYCHOMETRICS_PAGE_ID = "linguistic-psychometrics";

const OVERVIEW_ICON_NAMES = ["MapPin", "MapPinned", "ArrowRightLeft", "Briefcase"] as const;

const linguisticPsychometricsPage = dataJson.resume.resumePages.find(
  (page) => page.id === LINGUISTIC_PSYCHOMETRICS_PAGE_ID
);

export const buildResumeSection = (content: ResumeBuilderContent) => {
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

  return {
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
};
