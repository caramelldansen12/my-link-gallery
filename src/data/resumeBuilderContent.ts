import dataJson from "@/data/data.json";

export type ResumePageContent = {
  id: string;
  title: string;
  subtitle: string;
  summary?: string;
  body?: string[];
  highlights?: string[];
  accent?: string;
  borderClass?: string;
  noCard?: boolean;
};

export type OtherWorkingExperience = {
  title: string;
  subtitle: string;
  tags: string[];
};

export type EducationDetails = {
  institution: string;
  degree: string;
  period: string;
  grade: string;
  focus: string;
};

export type AwardItem = {
  title: string;
  issuer: string;
  note: string;
};

export type ContactChannel = {
  label: string;
  value: string;
  href: string;
  className: string;
  hidden?: boolean;
};

export type SkillGroups = {
  proficient: string[];
  fluent: string[];
  entryLevel: string[];
};

export type ToolsGroups = SkillGroups & {
  introductory: string[];
};

export type OverviewDetailItem = {
  text: string;
};

export type ResumeBuilderContent = {
  resumePages: ResumePageContent[];
  overviewDetails: OverviewDetailItem[];
  rollingKeywordRows: string[][];
  projectItems: string[];
  otherWorkingExperiences: OtherWorkingExperience[];
  educationDetails: EducationDetails[];
  honorsAndAwards: AwardItem[];
  keySkills: SkillGroups;
  toolsAndEquipment: ToolsGroups;
  highlightedCredentials: string[];
  contactChannels: ContactChannel[];
};

const LINGUISTIC_PSYCHOMETRICS_PAGE_ID = "linguistic-psychometrics";

export const createResumeBuilderContent = (): ResumeBuilderContent => {
  const data = dataJson.resume;

  return {
    resumePages: (data.resumePages as ResumePageContent[]).filter(
      (page) => page.id !== LINGUISTIC_PSYCHOMETRICS_PAGE_ID
    ),
    overviewDetails: data.overviewDetails.map((item) => ({ text: item.text })),
    rollingKeywordRows: data.rollingKeywordRows as string[][],
    projectItems: data.projectItems as string[],
    otherWorkingExperiences: data.otherWorkingExperiences as OtherWorkingExperience[],
    educationDetails: data.educationDetails as EducationDetails[],
    honorsAndAwards: data.honorsAndAwards as AwardItem[],
    keySkills: data.keySkills as SkillGroups,
    toolsAndEquipment: data.toolsAndEquipment as ToolsGroups,
    highlightedCredentials: data.highlightedCredentials as string[],
    contactChannels: data.contactChannels as ContactChannel[],
  };
};
