export type TaskPriority = "Hot" | "Warm" | "Cold";

export type LeadCallDirection = "Incoming" | "Outgoing";

export type LeadCallStatus =
  | "Initiated"
  | "Ringing"
  | "In progress"
  | "Completed"
  | "Failed"
  | "Busy"
  | "No Answer"
  | "Queued"
  | "Canceled";

export const LEAD_CALL_DIRECTIONS: LeadCallDirection[] = ["Incoming", "Outgoing"];

export const LEAD_CALL_STATUSES: LeadCallStatus[] = [
  "Initiated",
  "Ringing",
  "In progress",
  "Completed",
  "Failed",
  "Busy",
  "No Answer",
  "Queued",
  "Canceled",
];

export interface LeadSentEmailRecord {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
}

export interface LeadCallLogRecord {
  id: string;
  type: LeadCallDirection;
  toNumber: string;
  fromNumber: string;
  status: LeadCallStatus;
  duration: string;
}

export interface LeadLeadCommentRecord {
  id: string;
  body: string;
  createdAt: string;
  /** Optional poster name for parity with notes UX */
  authorName?: string;
}

export type LeadTaskAssignee = "lead_owner" | "lead_user";

export type LeadTaskStatus =
  | "Backlog"
  | "To do"
  | "In progress"
  | "Done"
  | "Canceled";

export const LEAD_TASK_STATUSES: LeadTaskStatus[] = [
  "Backlog",
  "To do",
  "In progress",
  "Done",
  "Canceled",
];

export interface LeadEngagementTaskRecord {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  assignedToType: LeadTaskAssignee;
  dueDate: string;
  status: LeadTaskStatus;
}

export interface LeadEngagementNoteRecord {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

/** Client-created file row; revoke `url` on remove/unmount */
export interface LeadAttachmentRecord {
  id: string;
  name: string;
  size: number;
  mimeType?: string;
  url: string;
}
