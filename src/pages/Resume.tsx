import { ArrowLeft, ArrowRightLeft, Briefcase, ChevronLeft, ChevronRight, MapPinned, MapPin } from "lucide-react";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import ResumePageNavigation from "@/components/ResumePageNavigation";
import { useResumePageNavigation } from "@/hooks/useResumePageNavigation";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";
import ResumeToolsPanel from "@/components/ResumeToolsPanel";

const resumePages = [
  {
    "id": "overview",
    "title": "Kyle Jaden",
    "subtitle": "Bridge and deliver solutions that matter."
  },
  {
    "id": "work-1",
    "title": "Microsoft 365 Engineer at SoftwareOne Indonesia",
    "subtitle": "Freelance & On-site, Oct 2025 – Mar 2026 (7 months)",
    "summary": "Microsoft 365 engineering work centered on secure productivity, DLP deployment, and operational support for more than 10,000 users.",
    "body": [
      "Delivered configurations and policies for Microsoft 365, SharePoint Online, Exchange Online, Entra ID, Purview, and Intune, validating them and troubleshooting user and admin-reported issues to ensure compliance and secure endpoint and app management.",
      "Streamlined enterprise secure productivity deployments by resolving configuration inquiries and designing business dashboard using Power BI, reducing policy misconfigurations and accelerating rollout timelines.",
      "Successfully deployed Data Loss Prevention (DLP) policies with 99% adoption rate to more than 10,000 users across Indonesia, ensuring consistent data governance and strengthening the organization's information-protection posture."
    ],
    "highlights": [
      "Microsoft 365",
      "SharePoint",
      "Intune",
      "Purview",
      "DLP"
    ],
    "accent": "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500",
    "borderClass": "border-emerald-400/70"
  },
  {
    "id": "work-2",
    "title": "Functional Consultant at PT Dinamika Teknologi Informasi",
    "subtitle": "Contract & Remote, Jan 2025 – Sep 2025 (9 months)",
    "summary": "Functional consulting and project delivery for Dynamics 365 CRM, Power Platform, and Microsoft 365 for Education implementation.",
    "body": [
      "Collaborated with stakeholders to gather business requirements and translate them into functional specifications of Microsoft Dynamics 365 CRM and Power Platform solutions.",
      "Extended Dynamics 365 CE into 7 modules for education management system application using Power Platform and provided relevant training for the back-office staff and office administrator.",
      "Supported the implementation and provided training session of Microsoft 365 for Education, which includes Office 365, Teams for Education, SharePoint Online, and Entra for teachers, educators and school admins."
    ],
    "highlights": [
      "Dynamics 365",
      "Power Platform",
      "Project Management",
      "Training"
    ],
    "accent": "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500",
    "borderClass": "border-amber-400/70"
  },
  {
    "id": "other-working-experience",
    "title": "Other Working Experience",
    "subtitle": "Additional role history before current consulting and M365 roles.",
    "noCard": true
  },
  {
    "id": "projects",
    "title": "Projects",
    "subtitle": "Selected implementations and practice portfolios."
  },
  {
    "id": "key-skills",
    "title": "Key Skills",
    "subtitle": "Capability levels across business, technical, and delivery functions.",
    "noCard": true
  },
  {
    "id": "tools-equipment",
    "title": "Tools and Equipment",
    "subtitle": "Core platforms and tools grouped by proficiency level.",
    "noCard": true
  },
  {
    "id": "highlighted-credentials",
    "title": "Highlighted Credentials",
    "subtitle": "Selected certifications and professional credentials.",
    "noCard": true
  },
  {
    "id": "education-honors",
    "title": "Education & Honors",
    "subtitle": "Academic background and notable recognitions.",
    "noCard": true
  },
  {
    "id": "contact",
    "title": "Contact",
    "subtitle": "",
    "body": [
      "Email: carlosrichardgeraldine@outlook.com",
      "LinkedIn: https://www.linkedin.com/in/carlosgeraldine/",
      "WhatsApp: https://wa.me/6285770078016"
    ],
    "highlights": [
      "Email",
      "LinkedIn",
      "WhatsApp",
      "Linktree"
    ],
    "accent": "bg-gradient-to-r from-slate-500 via-zinc-500 to-stone-500",
    "borderClass": "border-slate-400/70"
  }
];

const projectItems = [
  "Microsoft Office 365, Purview DLP and Intune Implementation at national multi-finance company in Tangerang.",
  "Extending Dynamics 365 CRM with Power Platform for private school in Jakarta + Google Workspace migration to Microsoft 365 for Education.",
  "Snowflake Hands-On Essentials Data Warehouse, Data App (Streamlit), Data Lake, Data Engineering & Data Science labs.",
  "ServiceNow Administration Fundamentals, Configure the CMDB & CMDB Health Simulator.",
  "Salesforce Agentforce Service & Prompt Builder Templates.",
  "Microsoft PowerUp Challenge Portfolio - simple Power Apps, Power Automate and Power BI solutions.",
  "CI/CD, Serverless and Microservices using OpenStack (Podman, Kubernetes, OpenShift and Tekton) with IBM Skills Network.",
  "Implementing CI/CD using Docker, Jenkins, Grafana, Prometheus with Dicoding Indonesia.",
  "Rice University Engineering Project Management Capstone Project",
  "University of California, Irvine Project Management Capstone Project",
  "Anaplan Level 1 & 2 Model Builder Exercise."
];

const otherWorkingExperiences = [
  {
    "title": "Project Leader (Node.js/React Webdev Project) at Alameda Academy",
    "subtitle": "Freelance & On-site, Jan 2024 - Dec 2024 (1 year)",
    "tags": [
      "Project Management",
      "Web Development"
    ]
  },
  {
    "title": "Business to Business (B2B) Area Account Officer at PT PrimeBread Indonesia",
    "subtitle": "Contract & On-site, Nov 2022 - Dec 2023 (1 year 2 months)",
    "tags": [
      "B2B Marketing",
      "Sales"
    ]
  },
  {
    "title": "Optician Assistant and Sales Counter at Optik Melawai",
    "subtitle": "Contract, Oct 2019 - Oct 2022 (3 years 1 months)",
    "tags": [
      "Sales",
      "Customer Service"
    ]
  }
];

const educationDetails = [
  {
    "institution": "University of California, Berkeley",
    "degree": "Bachelor of Science - BS, Computer Science",
    "period": "Oct 2023 - Jun 2027",
    "grade": "Grade: 3.25/4.0",
    "focus": "Database Management System (DBMS), Operating Systems"
  }
];

const honorsAndAwards = [
  {
    "title": "ASEAN Youth for Digital Action",
    "issuer": "Issued by ASEAN & Orbit Future Academy · Feb 2025",
    "note": "Professional Scholarship Awardee"
  },
  {
    "title": "University of California Full Scholarship",
    "issuer": "Issued by University of California · Dec 2024",
    "note": "Scholarship Awardee"
  }
];

const linguisticScores = [
  {
    name: "EFSET Common European Framework of Reference for Languages (CEFR)",
    score: "61/100 (C1)",
    date: "Jun 2025",
  },
  {
    name: "British Council EnglishScore",
    score: "578/600 (C1)",
    date: "Jan 2024",
  },
];

const bigFiveScores = [
  { trait: "Openness", value: 89 },
  { trait: "Conscientiousness", value: 33 },
  { trait: "Extraversion", value: 66 },
  { trait: "Agreeableness", value: 25 },
  { trait: "Neuroticism", value: 69 },
];

const discScores = [
  { trait: "Dominance", value: 68 },
  { trait: "Influence", value: 7 },
  { trait: "Steadiness", value: 7 },
  { trait: "Conscientiousness", value: 18 },
];

const cliftonStrengths = [
  "Communication",
  "Arranger",
  "Focus",
  "Restorative",
  "Analytical",
];

const schwartzValues = ["Stimulation", "Self-Direction", "Achievement"];

const hollandCodes = ["IAE", "Investigative", "Artistic", "Enterprising"];

const jungianArchetypes = ["Primary - The Explorer", "Secondary - The Rebel"];

const keySkills = {
  "proficient": [
    "Business Analysis",
    "IT Solutions Design",
    "Low-code-no-code AI Platform"
  ],
  "fluent": [
    "Project Management",
    "Presales",
    "Cloud Computing",
    "IT Support",
    "System Administration",
    "Identity & Access Management",
    "Data Loss Prevention",
    "IT Service Management"
  ],
  "entryLevel": [
    "Microsoft Licensing",
    "Data Analysis",
    "Data Engineering",
    "Database Administration",
    "Mobile Device Management"
  ]
};

const toolsAndEquipment = {
  "proficient": [
    "Power Apps",
    "Power Automate",
    "Power BI",
    "Dataverse",
    "Purview"
  ],
  "fluent": [
    "Dynamics 365 CRM",
    "SharePoint Online",
    "Exchange Online",
    "Microsoft 365",
    "Office 365",
    "Snowflake",
    "SQL",
    "Python",
    "Jira",
    "Confluence",
    "Camunda",
    "Signavio",
    "BPMN",
    "DMN",
    "UML",
    "DFD",
    "FSD",
    "BRD/PRD"
  ],
  "entryLevel": [
    "Copilot Studio",
    "Azure Admin",
    "Azure DevOps",
    "Intune",
    "Anaplan",
    "Delinea",
    "ManageEngine",
    "Google Cloud Security Command Center",
    "ServiceNow",
    "Microsoft Entra",
    "Microsoft Defender",
    "CyberArk PAM",
    "Debian",
    "Ubuntu"
  ],
  "introductory": [
    "Microsoft Fabric",
    "Azure AI Services",
    "Microsoft Foundry",
    "Dynamics 365 ERP",
    "Oracle Cloud",
    "Oracle Fusion ERP",
    "AWS Cloud Services",
    "Salesforce",
    "Creatio",
    "Datadog",
    "Okta",
    "Docker",
    "Elastic"
  ]
};

const highlightedCredentials = [
  "SailPoint Identity Security Leader Credential",
  "Palo Alto Certified Network Security Associate (PCNSA)",
  "Collibra Data Governance Foundations",
  "Microsoft Certified: Dynamics 365 Customer Service Functional Consultant Associate",
  "Microsoft Certified: Power Platform Solution Architect Expert",
  "Microsoft Certified: Power Platform Functional Consultant Associate",
  "Microsoft Certified: Information Security Administrator Associate",
  "Microsoft Certified: Identity and Access Administrator Associate",
  "Microsoft Certified: Dynamics 365 Customer Experience Analyst Associate",
  "Microsoft Certified: Dynamics 365 Field Service Functional Consultant Associate",
  "Snowflake SnowPro Associate: Platform Certification",
  "ServiceNow Suite Certification - Data Foundations (CMDB and CSDM) Professional",
  "SAP Certified - Business Transformation Consultant",
  "SAP Certified - Organizational Change Management",
  "LinkedIn Learning Change Management Professional Certificate",
  "Microsoft Business Analyst Professional Certificate",
  "Microsoft and LinkedIn Career Essentials in System Administration",
  "Google Cybersecurity Professional Certificate",
  "Google Business Intelligence Professional Certificate",
  "Google IT Support Professional Certificate",
  "Google Project Management Professional Certificate",
  "ISC2 Certified in Cybersecurity",
  "Certified ARIS Modeler Associate",
  "Camunda Knowledge - Business Analyst"
];

const contactChannels = [
  {
    "label": "Email",
    "value": "kylejaden@outlook.com",
    "href": "mailto:kylejaden@outlook.com",
    "className": "border-red-400/80 text-red-500 dark:text-red-300"
  },
  {
    "label": "LinkedIn",
    "value": "linkedin.com/in/kylejaden",
    "href": "https://www.linkedin.com/in/carlosgeraldine/",
    "className": "border-blue-400/80 text-blue-600 dark:text-blue-300"
  },
  {
    "label": "WhatsApp",
    "value": "+62 857-7007-8808",
    "href": "https://wa.me/6285770078016",
    "className": "border-emerald-400/80 text-emerald-600 dark:text-emerald-300"
  }
];

const overviewDetails = [
  {
    icon: MapPin,
    text: "Slipi, West Jakarta",
  },
  {
    icon: MapPinned,
    text: "from Banyuwangi, East Java",
  },
  {
    icon: ArrowRightLeft,
    text: "Ready to relocate across the country",
  },
  {
    icon: Briefcase,
    text: "Full time, contract, paid internship",
  }
];

const rollingKeywordRows = [
  [
    "Leadership",
    "Communication",
    "Collaboration",
    "Stakeholder Management",
    "Problem Solving",
    "Critical Thinking",
    "Adaptability",
    "Initiative"
  ],
  [
    "Business Analysis",
    "Project Delivery",
    "Functional Consultant",
    "Presales",
    "Documentation",
    "Process Mapping",
    "Requirements Gathering",
    "Change Management"
  ],
  [
    "Microsoft 365",
    "SharePoint Online",
    "Exchange Online",
    "Power Platform",
    "Dynamics 365",
    "Entra ID",
    "Purview",
    "Intune"
  ],
  [
    "Data Loss Prevention",
    "Identity & Access",
    "Security Baseline",
    "Governance",
    "Compliance",
    "Endpoint Management",
    "Admin Support",
    "Troubleshooting"
  ],
  [
    "Power BI",
    "Power Apps",
    "Power Automate",
    "Dataverse",
    "SQL",
    "Python",
    "Dashboard",
    "Automation"
  ],
  [
    "ServiceNow",
    "Anaplan",
    "Salesforce",
    "Snowflake",
    "Azure",
    "DevOps",
    "CI/CD",
    "Docker"
  ],
  [
    "Training",
    "Workshops",
    "User Enablement",
    "Knowledge Transfer",
    "Presentation",
    "Mentoring",
    "Teamwork",
    "Coordination"
  ],
  [
    "Growth Mindset",
    "Continuous Learning",
    "Certification",
    "Cross-functional",
    "Execution",
    "Ownership",
    "Delivery Focus",
    "Impact"
  ],
  [
    "Customer Success",
    "Solution Design",
    "Roadmap",
    "Discovery",
    "Scoping",
    "Backlog",
    "Sprint",
    "Iteration"
  ],
  [
    "KPI",
    "SLA",
    "Escalation",
    "Root Cause",
    "Risk Mitigation",
    "Incident Response",
    "Service Quality",
    "Optimization"
  ],
  [
    "Documentation",
    "Standard Operating Procedure",
    "Playbook",
    "Handover",
    "Governance Model",
    "Audit Readiness",
    "Controls",
    "Assurance"
  ],
  [
    "Productivity",
    "Reliability",
    "Scalability",
    "Security",
    "Performance",
    "Adoption",
    "Enablement",
    "Outcome"
  ]
];

type GroupCard = {
  title: string;
  items: string[];
};

const keySkillsCards: GroupCard[] = [
  { title: "Proficient", items: keySkills.proficient },
  { title: "Fluent", items: keySkills.fluent },
  { title: "Entry-level", items: keySkills.entryLevel },
];

const toolsAndEquipmentCards: GroupCard[] = [
  { title: "Proficient", items: toolsAndEquipment.proficient },
  { title: "Fluent", items: toolsAndEquipment.fluent },
  { title: "Entry-level", items: toolsAndEquipment.entryLevel },
  { title: "Introductory", items: toolsAndEquipment.introductory },
];

const GroupedCardsCarousel = ({
  cards,
  lockHorizontalOnPortrait = false,
}: {
  cards: GroupCard[];
  lockHorizontalOnPortrait?: boolean;
}) => {
  const [isScrollGuidanceVisible, setIsScrollGuidanceVisible] = useState(false);
  const scrollFadeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (scrollFadeTimerRef.current) {
        window.clearTimeout(scrollFadeTimerRef.current);
      }
    };
  }, []);

  const handleHorizontalScroll = () => {
    setIsScrollGuidanceVisible(true);

    if (scrollFadeTimerRef.current) {
      window.clearTimeout(scrollFadeTimerRef.current);
    }

    scrollFadeTimerRef.current = window.setTimeout(() => {
      setIsScrollGuidanceVisible(false);
      scrollFadeTimerRef.current = null;
    }, 380);
  };

  const borderGradients = [
    "from-cyan-400/80 via-sky-400/70 to-blue-500/80",
    "from-emerald-400/80 via-lime-400/70 to-yellow-400/80",
    "from-fuchsia-400/80 via-pink-400/70 to-rose-500/80",
    "from-violet-400/80 via-indigo-400/70 to-blue-400/80",
    "from-amber-400/80 via-orange-400/70 to-red-500/80",
    "from-teal-400/80 via-cyan-400/70 to-indigo-500/80",
  ];

  return (
    <div className="relative w-full">
      <div
        className={`-mx-1 overflow-x-auto pb-2 ${
          lockHorizontalOnPortrait ? "portrait-cards-scroll-track" : ""
        }`}
        onScroll={handleHorizontalScroll}
      >
        <div className="grouped-cards-track flex min-w-full snap-x snap-mandatory gap-4 px-1">
          {cards.map((card, cardIndex) => (
            <article
              key={card.title}
              className={`grouped-card min-w-[200px] sm:min-w-[230px] lg:min-w-[260px] flex-1 basis-0 snap-start rounded-2xl bg-gradient-to-br ${borderGradients[cardIndex % borderGradients.length]} p-[1px] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]`}
            >
              <div className="h-full rounded-2xl border border-border/70 bg-card p-3 sm:p-4">
                <h3 className="portrait-card-content-text text-sm font-semibold text-foreground sm:text-base">{card.title}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {card.items.map((item) => (
                    <span
                      key={item}
                      className="portrait-card-content-text hover-chroma-pill rounded-full border border-border bg-background/70 px-2.5 py-1 text-xs leading-relaxed text-foreground/90 sm:px-3 sm:text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-1 transition-opacity duration-150 ${
          isScrollGuidanceVisible ? "opacity-20" : "opacity-0"
        }`}
      >
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </div>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center pr-1 transition-opacity duration-150 ${
          isScrollGuidanceVisible ? "opacity-20" : "opacity-0"
        }`}
      >
        <ChevronRight className="h-5 w-5 text-foreground" />
      </div>
    </div>
  );
};

const DeckEntryCard = ({
  item,
  label,
  footerText,
  showLogo = true,
}: {
  item: string;
  label: string;
  footerText?: string;
  showLogo?: boolean;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <article
      className={`h-full rounded-2xl bg-gradient-to-br from-fuchsia-400/80 via-violet-400/70 to-cyan-400/80 p-[1px] shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-all duration-500 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <div className="flex h-full min-h-[148px] sm:min-h-[180px] flex-col rounded-2xl border border-border/70 bg-card p-3 sm:p-4">
        <div className="mb-4 flex items-start gap-3">
          {showLogo && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:h-12 sm:w-12 sm:text-[10px] sm:tracking-[0.25em]">
              Logo
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-[11px] sm:tracking-[0.24em]">
              {label}
            </p>
            <h3 className="portrait-card-content-text mt-1 text-xs font-semibold leading-snug text-foreground sm:text-sm">
              {item}
            </h3>
          </div>
        </div>

        {footerText && (
          <div className="portrait-card-content-text mt-auto flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-foreground/60" />
            {footerText}
          </div>
        )}
      </div>
    </article>
  );
};

const PagedCardsDeck = ({
  items,
  label,
  footerText,
  showLogo = true,
  isActive = false,
}: {
  items: string[];
  label: string;
  footerText?: string;
  showLogo?: boolean;
  isActive?: boolean;
}) => {
  const cardsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [hoverSide, setHoverSide] = useState<"left" | "right" | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const previousActiveRef = useRef(isActive);

  const totalPages = Math.max(1, Math.ceil(items.length / cardsPerPage));

  useEffect(() => {
    const wasInactive = !previousActiveRef.current;
    previousActiveRef.current = isActive;

    if (isActive && wasInactive) {
      setCurrentPage(1);
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive || isHovered || totalPages <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentPage((page) => (page === totalPages ? 1 : page + 1));
    }, 7000);

    return () => window.clearInterval(interval);
  }, [currentPage, totalPages, isActive, isHovered]);

  useEffect(() => {
    setCurrentPage(1);
  }, [totalPages]);

  const visibleCredentials = useMemo(() => {
    const start = (currentPage - 1) * cardsPerPage;
    return items.slice(start, start + cardsPerPage);
  }, [currentPage, items]);

  const goPrev = () => {
    setCurrentPage((page) => (page === 1 ? totalPages : page - 1));
  };

  const goNext = () => {
    setCurrentPage((page) => (page === totalPages ? 1 : page + 1));
  };

  return (
    <div className="w-full">
      <div
        className="group relative w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setHoverSide(null);
          setIsHovered(false);
        }}
      >
        <div key={currentPage} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visibleCredentials.map((item, index) => (
            <DeckEntryCard
              key={`${item}-${currentPage}-${index}`}
              item={item}
              label={label}
              footerText={footerText}
              showLogo={showLogo}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous credentials page"
              onMouseEnter={() => setHoverSide("left")}
              onFocus={() => setHoverSide("left")}
              onClick={goPrev}
              className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer border-0 bg-transparent p-0 outline-none"
            />
            <button
              type="button"
              aria-label="Next credentials page"
              onMouseEnter={() => setHoverSide("right")}
              onFocus={() => setHoverSide("right")}
              onClick={goNext}
              className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer border-0 bg-transparent p-0 outline-none"
            />

            <div
              className={`pointer-events-none absolute inset-y-0 left-0 z-20 flex w-9 items-center justify-start transition-opacity duration-200 ${hoverSide === "left" ? "opacity-100" : "opacity-0"}`}
            >
              <div className="flex h-24 w-9 items-center justify-center rounded-r-full bg-card/90 border border-border border-l-0 shadow-sm">
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </div>
            </div>

            <div
              className={`pointer-events-none absolute inset-y-0 right-0 z-20 flex w-9 items-center justify-end transition-opacity duration-200 ${hoverSide === "right" ? "opacity-100" : "opacity-0"}`}
            >
              <div className="flex h-24 w-9 items-center justify-center rounded-l-full bg-card/90 border border-border border-r-0 shadow-sm">
                <ChevronRight className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ProjectsDeck = ({ isActive }: { isActive: boolean }) => {
  return (
    <PagedCardsDeck
      items={projectItems}
      label="Project"
      showLogo={false}
      isActive={isActive}
    />
  );
};

const HighlightedCredentialsDeck = ({ isActive }: { isActive: boolean }) => {
  return (
    <PagedCardsDeck
      items={highlightedCredentials}
      label="Credential"
      isActive={isActive}
    />
  );
};

const ResumeKeywordPillWall = ({ style }: { style?: CSSProperties }) => {
  return (
    <div className="resume-pill-wall" style={style}>
      {rollingKeywordRows.map((row, rowIndex) => {
        const duration = 48 + rowIndex * 2;

        return (
          <div key={`row-${rowIndex}`} className="resume-pill-row">
            <div
              className={`resume-pill-track ${rowIndex % 2 === 1 ? "resume-pill-track-reverse" : ""}`}
              style={{ animationDuration: `${duration}s` }}
            >
              {[...row, ...row].map((item, itemIndex) => (
                <span key={`${rowIndex}-${itemIndex}-${item}`} className="resume-keyword-pill">
                  {item}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const RadialIntensityGrid = ({
  items,
  tone,
  isActive = false,
}: {
  items: Array<{ trait: string; value: number }>;
  tone: string;
  isActive?: boolean;
}) => {
  const [animatedValues, setAnimatedValues] = useState(() => items.map(() => 0));

  useEffect(() => {
    if (!isActive) {
      setAnimatedValues(items.map(() => 0));
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setAnimatedValues(items.map((item) => item.value));
      return;
    }

    const durationMs = 1200;
    const animationStart = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - animationStart) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues(items.map((item) => Math.round(item.value * eased)));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isActive, items]);

  return (
    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item, index) => {
        const currentValue = animatedValues[index] ?? 0;
        const endDeg = currentValue * 3.6;

        return (
            <div
            key={item.trait}
              className="hover-chroma-border rounded-xl border border-border/70 bg-card/60 px-2 py-2"
          >
            <div
              className="mx-auto h-14 w-14 rounded-full p-[3px]"
              style={{
                background: `conic-gradient(${tone} ${endDeg}deg, hsl(var(--secondary)) ${endDeg}deg 360deg)`,
              }}
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-background text-[11px] font-semibold text-foreground">
                {currentValue}%
              </div>
            </div>
            <p className="mt-2 text-center text-[11px] font-medium leading-tight text-foreground/95">
              {item.trait}
            </p>
          </div>
        );
      })}
    </div>
  );
};

const Resume = () => {
  const sectionRefs = useRef<HTMLElement[]>([]);
  const overviewHeroRef = useRef<HTMLDivElement | null>(null);
  const overviewCardsRef = useRef<HTMLDivElement | null>(null);
  const [activeSectionId, setActiveSectionId] = useState("overview");
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [overviewWallMetrics, setOverviewWallMetrics] = useState({
    height: 0,
    offsetTop: 0,
  });

  const { goToPrevious, goToNext, isAtStart, isAtEnd } = useResumePageNavigation(
    sectionRefs.current,
    activeSectionId,
    () => {}
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const activeEntry = entries.find((entry) => entry.isIntersecting);

        if (activeEntry?.target instanceof HTMLElement) {
          setActiveSectionId(activeEntry.target.id);
        }
      },
      {
        threshold: 0.6,
      }
    );

    sectionRefs.current.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const recalculateOverviewWall = () => {
      if (!overviewHeroRef.current || !overviewCardsRef.current) {
        return;
      }

      const heroRect = overviewHeroRef.current.getBoundingClientRect();
      const cardsRect = overviewCardsRef.current.getBoundingClientRect();
      const offsetTop = Math.max(0, cardsRect.top - heroRect.top);
      const height = Math.max(0, cardsRect.bottom - heroRect.top - 5);

      setOverviewWallMetrics({
        height,
        offsetTop,
      });
    };

    const frame = window.requestAnimationFrame(recalculateOverviewWall);
    const resizeObserver = new ResizeObserver(recalculateOverviewWall);

    if (overviewHeroRef.current) {
      resizeObserver.observe(overviewHeroRef.current);
    }

    if (overviewCardsRef.current) {
      resizeObserver.observe(overviewCardsRef.current);
    }

    window.addEventListener("resize", recalculateOverviewWall);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", recalculateOverviewWall);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsToolsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative isolate h-screen min-h-screen overflow-hidden bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div
        className={`absolute inset-0 z-10 transition-all duration-300 ${
          isToolsOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ResumeToolsPanel isOpen={isToolsOpen} onClose={() => setIsToolsOpen(false)} />
      </div>

      <div className={`relative z-20 flex h-full min-h-0 flex-col bg-transparent transition-transform duration-500 ease-out ${isToolsOpen ? "translate-x-full" : "translate-x-0"}`}>
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
          <h1 className="text-base font-semibold text-foreground md:text-xl">Resume</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/resume-builder"
              className="inline-flex items-center rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card md:text-sm"
            >
              Build your own
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth">
        {resumePages.map((page, index) => {
          const showSidePanel = !page.noCard && page.id !== "projects" && index !== 0 && index !== resumePages.length - 1;

          return (
          <section
            key={page.id}
            id={page.id}
            ref={(section) => {
              if (section) {
                sectionRefs.current[index] = section;
              }
            }}
            className={`snap-start min-h-full border-b border-border ${
              page.id === "tools-equipment" ? "portrait-hide-section" : ""
            }`}
          >
            <div className="container mx-auto flex min-h-full items-center px-4 py-12">
              <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_1.15fr_0.7fr] lg:grid-rows-[auto_1fr]">
                <div
                  className="min-w-0 lg:col-span-3"
                  ref={(node) => {
                    if (page.id === "overview") {
                      overviewHeroRef.current = node;
                    }
                  }}
                >
                  <h1 className="max-w-4xl pb-1 text-3xl font-bold leading-[1.05] sm:text-4xl md:text-6xl">
                    {page.title}
                  </h1>
                  <p className="mt-4 max-w-3xl text-sm text-muted-foreground sm:text-base md:text-lg">{page.subtitle}</p>
                </div>

                <div
                    className={`min-w-0 min-h-[330px] ${showSidePanel ? "lg:col-span-2" : "lg:col-span-3"}`}
                >
                  {page.id === "overview" ? (
                    <div className="resume-overview-columns">
                      <div ref={overviewCardsRef} className="space-y-4 text-base leading-relaxed text-foreground/90 sm:text-lg">
                        {overviewDetails.map((item) => {
                          const Icon = item.icon;

                          return (
                            <div key={item.text} className="hover-chroma-border flex items-start gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3">
                              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
                              <p>{item.text}</p>
                            </div>
                          );
                        })}
                      </div>
                      <ResumeKeywordPillWall
                        style={{
                          marginTop: `-${overviewWallMetrics.offsetTop}px`,
                          marginLeft: "40px",
                          width: "calc(100% - 96px)",
                          height: `${overviewWallMetrics.height}px`,
                        }}
                      />
                    </div>
                  ) : page.id === "projects" ? (
                    <ProjectsDeck isActive={activeSectionId === page.id} />
                  ) : page.id === "other-working-experience" ? (
                    <div className="grid gap-4">
                      {otherWorkingExperiences.map((experience) => (
                        <article
                          key={experience.title}
                          className="hover-chroma-border rounded-2xl border border-border/70 bg-card p-4 md:p-5"
                        >
                          <h3 className="text-lg font-semibold text-foreground md:text-xl">
                            {experience.title}
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground md:text-base">
                            {experience.subtitle}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {experience.tags.map((tag) => (
                              <span
                                key={tag}
                                className="hover-chroma-pill rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : page.id === "education-honors" ? (
                    <div className="grid gap-8 md:grid-cols-2">
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          Education
                        </h3>
                        <div className="space-y-4 text-foreground/95">
                          {educationDetails
                            .filter(
                              (item) =>
                                item.institution || item.degree || item.period || item.grade || item.focus
                            )
                            .map((item, index) => (
                              <div key={`${item.institution}-${item.degree}-${index}`} className="space-y-2">
                                <p className="text-lg font-semibold">{item.institution}</p>
                                <p className="text-base">{item.degree}</p>
                                <p className="text-sm text-muted-foreground">{item.period}</p>
                                <p className="text-sm text-muted-foreground">{item.grade}</p>
                                <p className="text-sm text-muted-foreground">{item.focus}</p>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          Honors & awards
                        </h3>
                        <div className="space-y-5">
                          {honorsAndAwards.map((award) => (
                            <div key={award.title} className="space-y-1">
                              <p className="text-base font-semibold text-foreground/95">{award.title}</p>
                              <p className="text-sm text-muted-foreground">{award.issuer}</p>
                              <p className="text-sm text-foreground/85">{award.note}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : page.id === "key-skills" ? (
                    <div className="space-y-6">
                      <GroupedCardsCarousel cards={keySkillsCards} lockHorizontalOnPortrait />

                      <div className="portrait-only-block space-y-3">
                        <div className="pb-1">
                          <h2 className="max-w-4xl pb-1 text-3xl font-bold leading-[1.05] sm:text-4xl md:text-6xl">
                            Tools and Equipment
                          </h2>
                          <p className="mt-4 max-w-3xl text-sm text-muted-foreground sm:text-base md:text-lg">
                            Core platforms and tools grouped by proficiency level.
                          </p>
                        </div>
                        <GroupedCardsCarousel cards={toolsAndEquipmentCards} lockHorizontalOnPortrait />
                      </div>
                    </div>
                  ) : page.id === "tools-equipment" ? (
                    <GroupedCardsCarousel cards={toolsAndEquipmentCards} lockHorizontalOnPortrait />
                  ) : page.id === "contact" ? (
                    <div className="grid gap-8 md:grid-cols-2">
                      <div className="space-y-3">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          Contact Channels
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {contactChannels.map((channel) => (
                            <a
                              key={channel.label}
                              href={channel.href}
                              target={channel.href.startsWith("http") ? "_blank" : undefined}
                              rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                              className={`hover-chroma-pill inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-transform duration-200 hover:-translate-y-0.5 ${channel.className}`}
                            >
                              <span className="opacity-80">{channel.label}</span>
                              <span className="text-foreground/85">{channel.value}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : page.id === "linguistic-psychometrics" ? (
                    <div className="grid gap-8 lg:grid-cols-2">
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Language
                          </p>
                          <div className="mt-3 space-y-3">
                            {linguisticScores.map((item) => (
                              <div key={item.name} className="space-y-1 border-b border-border/60 pb-2">
                                <p className="text-sm font-semibold text-foreground/95">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Score: {item.score} - {item.date}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Profile
                          </p>
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              MBTI
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="hover-chroma-pill rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground">
                                ENTP - Debater
                              </span>
                              <span className="hover-chroma-pill rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground">
                                Extroverted
                              </span>
                              <span className="hover-chroma-pill rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground">
                                Intuitive
                              </span>
                              <span className="hover-chroma-pill rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground">
                                Thinking
                              </span>
                              <span className="hover-chroma-pill rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground">
                                Perceiving
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Enneagram
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="hover-chroma-pill rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground">
                                Type 3 - The Achiever
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Holland Code/RIASEC
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {hollandCodes.map((item) => (
                                <span
                                  key={item}
                                  className="hover-chroma-pill rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Jungian Archetype Assessment
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {jungianArchetypes.map((item) => (
                                <span
                                  key={item}
                                  className="hover-chroma-pill rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Top 3 Schwartz's Core Values
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {schwartzValues.map((value) => (
                                <span
                                  key={value}
                                  className="hover-chroma-pill rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground"
                                >
                                  {value}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Top 5 CliftonStrengths
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {cliftonStrengths.map((item) => (
                                <span
                                  key={item}
                                  className="hover-chroma-pill rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Big Five Assessment
                          </p>
                            <RadialIntensityGrid
                              items={bigFiveScores}
                              tone="hsl(var(--foreground))"
                              isActive={activeSectionId === "linguistic-psychometrics"}
                            />
                        </div>

                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            DISC
                          </p>
                            <RadialIntensityGrid
                              items={discScores}
                              tone="hsl(var(--primary))"
                              isActive={activeSectionId === "linguistic-psychometrics"}
                            />
                        </div>

                      </div>
                    </div>
                  ) : page.id === "highlighted-credentials" ? (
                    <HighlightedCredentialsDeck isActive={activeSectionId === page.id} />
                  ) : (
                    <div className="space-y-4 pr-1 text-lg leading-relaxed text-foreground/90">
                      {page.body.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>

                {showSidePanel && (
                  <div className={`h-full min-h-[260px] rounded-[1.25rem] border bg-card p-4 shadow-sm md:p-5 ${page.borderClass}`}>
                    <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-background p-3 md:p-4">
                      <p className="text-sm font-semibold">Summary</p>
                      <p className="mt-3 border-l border-border/70 pl-3 text-[19px] italic leading-relaxed text-muted-foreground/90">
                        {page.summary}
                      </p>

                      <div className="mt-auto pt-4 flex flex-wrap gap-2">
                        {page.highlights.map((item) => (
                          <span
                            key={item}
                            className="hover-chroma-pill rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
          );
        })}
      </main>

      <ResumePageNavigation
        onPrevious={goToPrevious}
        onNext={goToNext}
        isAtStart={isAtStart}
        isAtEnd={isAtEnd}
      />

      <Link
        to="#"
        aria-label="Tools"
        onClick={(event) => {
          event.preventDefault();
          setIsToolsOpen(true);
        }}
        className={`fixed bottom-4 left-4 z-40 select-none text-5xl font-bold leading-none tracking-tight text-foreground transition-all duration-300 origin-bottom-left hover:scale-110 md:bottom-6 md:left-6 md:text-7xl ${
          isToolsOpen ? "opacity-100" : "opacity-25"
        }`}
      >
        ← tools
      </Link>

      <Link
        to="/links"
        aria-label="Links"
        className={`fixed bottom-4 right-4 z-40 select-none text-5xl font-bold leading-none tracking-tight text-foreground transition-all duration-300 origin-bottom-right hover:scale-110 md:bottom-6 md:right-6 md:text-7xl ${
          activeSectionId === "contact" ? "opacity-100" : "opacity-25"
        }`}
      >
        links →
      </Link>
      </div>
    </div>
  );
};

export default Resume;
