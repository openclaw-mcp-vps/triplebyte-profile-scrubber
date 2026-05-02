export type RequestJurisdiction = "gdpr" | "ccpa";

export type Platform = {
  id: string;
  name: string;
  operator: string;
  status: "defunct" | "acquired" | "legacy";
  summary: string;
  deletionEmail: string | null;
  deletionFormUrl: string | null;
  followUpDays: number;
  legalRegion: "EU" | "US" | "global";
  searchHints: string[];
};

export const PLATFORMS: Platform[] = [
  {
    id: "triplebyte-legacy",
    name: "Triplebyte (Legacy)",
    operator: "Karat / Triplebyte legacy systems",
    status: "defunct",
    summary:
      "Legacy Triplebyte candidate profiles can remain indexed long after platform shutdown. Requests typically route through legacy support and privacy channels.",
    deletionEmail: "privacy@karat.com",
    deletionFormUrl: "https://karat.com/privacy-policy",
    followUpDays: 14,
    legalRegion: "global",
    searchHints: ["triplebyte", "candidate profile", "interview", "score"]
  },
  {
    id: "vettery-legacy",
    name: "Vettery (Legacy)",
    operator: "Adecco Group legacy recruiting properties",
    status: "defunct",
    summary:
      "Vettery was sunset after acquisition; stale candidate URLs can still appear in cached mirrors or old subdomains.",
    deletionEmail: "privacy@adeccogroup.com",
    deletionFormUrl: "https://www.adeccogroup.com/privacy",
    followUpDays: 14,
    legalRegion: "global",
    searchHints: ["vettery", "candidate", "profile", "resume"]
  },
  {
    id: "angellist-talent-legacy",
    name: "AngelList Talent (Legacy)",
    operator: "Wellfound / AngelList Talent migration",
    status: "legacy",
    summary:
      "Talent profiles migrated to newer systems, but old public profile endpoints can stay discoverable in search indexes.",
    deletionEmail: "privacy@wellfound.com",
    deletionFormUrl: "https://wellfound.com/privacy",
    followUpDays: 10,
    legalRegion: "global",
    searchHints: ["angellist", "wellfound", "talent", "profile"]
  },
  {
    id: "hired-legacy",
    name: "Hired (Legacy Candidate URLs)",
    operator: "Hired, Inc.",
    status: "acquired",
    summary:
      "Some older Hired candidate URLs or exports can remain live after account inactivity and need explicit deletion requests.",
    deletionEmail: "privacy@hired.com",
    deletionFormUrl: "https://hired.com/privacy",
    followUpDays: 10,
    legalRegion: "global",
    searchHints: ["hired", "candidate profile", "employer"]
  },
  {
    id: "honeypot-legacy",
    name: "Honeypot (Legacy)",
    operator: "New Work SE legacy recruiting stack",
    status: "acquired",
    summary:
      "Honeypot underwent platform transitions. Historical profile references may persist in snapshots and mirrors.",
    deletionEmail: "privacy@new-work.se",
    deletionFormUrl: "https://www.new-work.se/en/privacy-policy",
    followUpDays: 14,
    legalRegion: "EU",
    searchHints: ["honeypot", "developer", "profile", "talent"]
  },
  {
    id: "stackoverflow-jobs-legacy",
    name: "Stack Overflow Jobs (Legacy Resume Data)",
    operator: "Stack Overflow, Inc.",
    status: "defunct",
    summary:
      "Stack Overflow Jobs has closed, but historical resume/profile references can survive in old crawls or partner exports.",
    deletionEmail: "privacy@stackoverflow.com",
    deletionFormUrl: "https://stackoverflow.com/legal/privacy-policy",
    followUpDays: 10,
    legalRegion: "global",
    searchHints: ["stackoverflow jobs", "resume", "candidate"]
  }
];

export function getPlatformById(id: string) {
  return PLATFORMS.find((platform) => platform.id === id);
}
