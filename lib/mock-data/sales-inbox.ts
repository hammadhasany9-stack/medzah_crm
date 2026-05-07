export type SalesInboxColumnId =
  | "opportunities"
  | "conversations"
  | "next_steps"
  | "follow_ups";

/** Folder keys match the inbox top bar (“FOLDERS” section). */
export type MailFolderId =
  | "mine"
  | "inbox"
  | "drafts"
  | "scheduled"
  | "sent"
  | "spam"
  | "trash"
  | "closing"
  | "customers";

/** “VIEWS” section chips. `all_messages` = no mailbox view filter. */
export type MailboxViewFilterId =
  | "all_messages"
  | "unread"
  | "unopened"
  | "not_responded"
  | "not_replied";

export type MailLabelId = "vip" | "renewal" | "pricing";

/** Legacy inbox tags kept for badges if needed; mailbox filters use folders/views/labels. */
export type SalesInboxTeamId = "sales" | "support";
export type SalesInboxTagId = "important" | "follow-up" | "hot";

export interface SalesInboxItem {
  id: string;
  column: SalesInboxColumnId;
  title: string;
  subtitle: string;
  timeLabel: string;
  leadId?: string;
  team?: SalesInboxTeamId;
  tags?: SalesInboxTagId[];
  initials?: string;
  mailFolders: MailFolderId[];
  unread: boolean;
  unopened: boolean;
  notResponded: boolean;
  notReplied: boolean;
  mailLabels?: MailLabelId[];
}

/** Per-thread routing for folder / views / labels (demo data tuned for plausible counts). */
const MAIL_LOOKUP: Record<
  string,
  {
    mailFolders: MailFolderId[];
    unread: boolean;
    unopened: boolean;
    notResponded: boolean;
    notReplied: boolean;
    mailLabels?: MailLabelId[];
  }
> = {
  "si-001": {
    mailFolders: ["mine", "inbox", "customers"],
    unread: true,
    unopened: true,
    notResponded: false,
    notReplied: true,
    mailLabels: ["vip"],
  },
  "si-002": {
    mailFolders: ["mine", "closing"],
    unread: true,
    unopened: false,
    notResponded: true,
    notReplied: false,
    mailLabels: ["renewal"],
  },
  "si-003": {
    mailFolders: ["mine", "customers"],
    unread: false,
    unopened: false,
    notResponded: false,
    notReplied: false,
  },
  "si-004": {
    mailFolders: ["mine", "inbox"],
    unread: true,
    unopened: true,
    notResponded: true,
    notReplied: true,
    mailLabels: ["pricing"],
  },
  "si-005": {
    mailFolders: ["mine", "closing"],
    unread: true,
    unopened: true,
    notResponded: false,
    notReplied: true,
  },
  "si-006": {
    mailFolders: ["mine", "sent"],
    unread: false,
    unopened: false,
    notResponded: false,
    notReplied: false,
    mailLabels: ["vip"],
  },
  "si-007": {
    mailFolders: ["mine", "inbox"],
    unread: true,
    unopened: false,
    notResponded: true,
    notReplied: false,
  },
  "si-008": {
    mailFolders: ["mine", "customers"],
    unread: true,
    unopened: true,
    notResponded: false,
    notReplied: true,
    mailLabels: ["renewal"],
  },
  "si-009": {
    mailFolders: ["mine", "inbox"],
    unread: false,
    unopened: false,
    notResponded: false,
    notReplied: false,
    mailLabels: ["pricing"],
  },
  "si-010": {
    mailFolders: ["mine"],
    unread: true,
    unopened: false,
    notResponded: true,
    notReplied: true,
  },
  "si-011": {
    mailFolders: ["mine", "inbox"],
    unread: false,
    unopened: false,
    notResponded: false,
    notReplied: false,
  },
  "si-012": {
    mailFolders: ["mine", "sent"],
    unread: true,
    unopened: true,
    notResponded: true,
    notReplied: false,
  },
  "si-013": {
    mailFolders: ["spam"],
    unread: true,
    unopened: false,
    notResponded: false,
    notReplied: false,
  },
  "si-014": {
    mailFolders: ["mine", "customers"],
    unread: true,
    unopened: true,
    notResponded: true,
    notReplied: true,
    mailLabels: ["vip"],
  },
  "si-015": {
    mailFolders: ["mine"],
    unread: false,
    unopened: false,
    notResponded: false,
    notReplied: false,
    mailLabels: ["renewal"],
  },
  "si-016": {
    mailFolders: ["scheduled"],
    unread: true,
    unopened: true,
    notResponded: false,
    notReplied: true,
    mailLabels: ["pricing"],
  },
  "si-017": {
    mailFolders: ["mine", "closing"],
    unread: true,
    unopened: true,
    notResponded: true,
    notReplied: false,
  },
  "si-018": {
    mailFolders: ["drafts"],
    unread: false,
    unopened: false,
    notResponded: false,
    notReplied: false,
  },
  "si-019": {
    mailFolders: ["trash"],
    unread: true,
    unopened: false,
    notResponded: false,
    notReplied: false,
    mailLabels: ["renewal"],
  },
};

const BASE_ITEMS: Omit<
  SalesInboxItem,
  "mailFolders" | "unread" | "unopened" | "notResponded" | "notReplied" | "mailLabels"
>[] = [
  {
    id: "si-001",
    column: "opportunities",
    title: "Hannah Robertson",
    subtitle: "VertoBuild — Expansion RFQ",
    timeLabel: "2h",
    leadId: "lead-001",
    team: "sales",
    tags: ["hot"],
    initials: "HR",
  },
  {
    id: "si-002",
    column: "opportunities",
    title: "Marcus Chen",
    subtitle: "Wants pricing by Friday",
    timeLabel: "5h",
    team: "sales",
    tags: ["important"],
    initials: "MC",
  },
  {
    id: "si-003",
    column: "opportunities",
    title: "Elena Vogt",
    subtitle: "Referred by partner channel",
    timeLabel: "Yesterday",
    team: "support",
    tags: ["follow-up"],
    initials: "EV",
  },
  {
    id: "si-004",
    column: "conversations",
    title: "James Wright",
    subtitle: "Re: shipment schedule clarification",
    timeLabel: "32m",
    leadId: "lead-005",
    team: "sales",
    tags: ["hot"],
    initials: "JW",
  },
  {
    id: "si-005",
    column: "conversations",
    title: "Priya Nair",
    subtitle: "Slack thread — onboarding checklist",
    timeLabel: "1h",
    team: "support",
    tags: ["follow-up"],
    initials: "PN",
  },
  {
    id: "si-006",
    column: "conversations",
    title: "Omar Hassan",
    subtitle: "Last message: Sounds good",
    timeLabel: "Yesterday",
    team: "sales",
    tags: ["important"],
    initials: "OH",
  },
  {
    id: "si-007",
    column: "next_steps",
    title: "Nina Kovacs",
    subtitle: "Send revised quote PDF",
    timeLabel: "20m",
    team: "sales",
    tags: ["important"],
    initials: "NK",
  },
  {
    id: "si-008",
    column: "next_steps",
    title: "David Park",
    subtitle: "Schedule technical walkthrough",
    timeLabel: "45m",
    team: "sales",
    tags: ["follow-up"],
    initials: "DP",
  },
  {
    id: "si-009",
    column: "next_steps",
    title: "Sofia Martins",
    subtitle: "Confirm PO number with finance",
    timeLabel: "3h",
    team: "support",
    initials: "SM",
  },
  {
    id: "si-010",
    column: "next_steps",
    title: "Leo Bennett",
    subtitle: "Upload signed MSA to DMS",
    timeLabel: "Yesterday",
    team: "sales",
    tags: ["hot"],
    initials: "LB",
  },
  {
    id: "si-011",
    column: "next_steps",
    title: "Amira Saleh",
    subtitle: "Call facilities manager",
    timeLabel: "Oct 12",
    team: "support",
    tags: ["follow-up"],
    initials: "AS",
  },
  {
    id: "si-012",
    column: "next_steps",
    title: "Tomás Iglesias",
    subtitle: "Verify delivery window with carrier",
    timeLabel: "Oct 11",
    team: "sales",
    initials: "TI",
  },
  {
    id: "si-013",
    column: "next_steps",
    title: "Rachel Kim",
    subtitle: "Internal pricing review complete",
    timeLabel: "Oct 10",
    team: "sales",
    tags: ["important"],
    initials: "RK",
  },
  {
    id: "si-014",
    column: "next_steps",
    title: "Andre Willis",
    subtitle: "Send sample kit tracking",
    timeLabel: "Oct 9",
    team: "support",
    initials: "AW",
  },
  {
    id: "si-015",
    column: "next_steps",
    title: "Yuki Tanaka",
    subtitle: "Follow up — budget approval",
    timeLabel: "Oct 8",
    team: "sales",
    tags: ["follow-up"],
    initials: "YT",
  },
  {
    id: "si-016",
    column: "next_steps",
    title: "Claire Dupont",
    subtitle: "Export compliance questionnaire",
    timeLabel: "Oct 7",
    team: "sales",
    initials: "CD",
  },
  {
    id: "si-017",
    column: "follow_ups",
    title: "Ethan Rhodes",
    subtitle: "Circle back after board meeting",
    timeLabel: "Mon",
    team: "sales",
    tags: ["important"],
    initials: "ER",
  },
  {
    id: "si-018",
    column: "follow_ups",
    title: "Megan Flores",
    subtitle: "Check in on demo feedback",
    timeLabel: "Tue",
    team: "support",
    tags: ["hot"],
    initials: "MF",
  },
  {
    id: "si-019",
    column: "follow_ups",
    title: "Victor Alam",
    subtitle: "Renewal discussion — Q1",
    timeLabel: "Oct 14",
    team: "sales",
    initials: "VA",
  },
];

export const SALES_INBOX_ITEMS: SalesInboxItem[] = BASE_ITEMS.map((row) => {
  const meta = MAIL_LOOKUP[row.id];
  return {
    ...row,
    mailFolders: meta.mailFolders,
    unread: meta.unread,
    unopened: meta.unopened,
    notResponded: meta.notResponded,
    notReplied: meta.notReplied,
    mailLabels: meta.mailLabels,
  };
});

export function countThreadsInFolder(fid: MailFolderId): number {
  return SALES_INBOX_ITEMS.filter((i) => i.mailFolders.includes(fid)).length;
}

export function matchesMailboxView(item: SalesInboxItem, vf: MailboxViewFilterId): boolean {
  switch (vf) {
    case "all_messages":
      return true;
    case "unread":
      return item.unread;
    case "unopened":
      return item.unopened;
    case "not_responded":
      return item.notResponded;
    case "not_replied":
      return item.notReplied;
    default:
      return true;
  }
}

export function countThreadsForMailboxView(vf: MailboxViewFilterId): number {
  return SALES_INBOX_ITEMS.filter((i) => matchesMailboxView(i, vf)).length;
}

export function countThreadsAllMessages(): number {
  return SALES_INBOX_ITEMS.length;
}

export function countThreadsUnread(): number {
  return SALES_INBOX_ITEMS.filter((i) => i.unread).length;
}

export function countThreadsForLabel(lid: MailLabelId): number {
  return SALES_INBOX_ITEMS.filter((i) => i.mailLabels?.includes(lid)).length;
}
