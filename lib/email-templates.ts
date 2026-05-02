import type { Platform, RequestJurisdiction } from "@/lib/platforms";

type BuildTemplateInput = {
  platform: Platform;
  legalName: string;
  requesterEmail: string;
  profileUrl: string;
  jurisdiction: RequestJurisdiction;
};

function legalBasisText(jurisdiction: RequestJurisdiction) {
  if (jurisdiction === "gdpr") {
    return "This request is made under GDPR Art. 17 (right to erasure) and Art. 12(3) timeline requirements.";
  }

  return "This request is made under the California Consumer Privacy Act (CCPA/CPRA), including deletion rights and non-discrimination protections.";
}

export function buildInitialDeletionEmail(input: BuildTemplateInput) {
  const subject = `Data deletion request: ${input.legalName} (${input.platform.name})`;

  const body = [
    `Hello ${input.platform.operator} privacy team,`,
    "",
    `I am requesting full deletion of my personal data from ${input.platform.name}, including profile data, resumes, notes, evaluations, and any partner-visible exports tied to my account.`,
    "",
    `Name: ${input.legalName}`,
    `Email associated with account: ${input.requesterEmail}`,
    `Profile URL or evidence link: ${input.profileUrl}`,
    "",
    legalBasisText(input.jurisdiction),
    "",
    "Please confirm in writing once deletion is complete, including whether any processors or data recipients were notified.",
    "",
    "If identity verification is required, reply with the minimum necessary steps.",
    "",
    "Thank you,",
    input.legalName
  ].join("\n");

  return { subject, body };
}

export function buildFollowUpDeletionEmail(input: BuildTemplateInput, daysSinceRequest: number) {
  const subject = `Follow-up: pending deletion request for ${input.legalName}`;

  const body = [
    `Hello ${input.platform.operator} privacy team,`,
    "",
    `I am following up on my deletion request submitted ${daysSinceRequest} day(s) ago for ${input.platform.name}.`,
    "",
    `Name: ${input.legalName}`,
    `Email associated with account: ${input.requesterEmail}`,
    `Profile URL or evidence link: ${input.profileUrl}`,
    "",
    legalBasisText(input.jurisdiction),
    "",
    "Please confirm current status and completion date. If deletion has already completed, please share confirmation for my records.",
    "",
    "Regards,",
    input.legalName
  ].join("\n");

  return { subject, body };
}
