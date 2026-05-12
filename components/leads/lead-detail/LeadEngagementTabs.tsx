"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Lead } from "@/lib/types";
import {
  LEAD_CALL_DIRECTIONS,
  LEAD_CALL_STATUSES,
  LEAD_TASK_STATUSES,
  type LeadAttachmentRecord,
  type LeadCallDirection,
  type LeadCallLogRecord,
  type LeadCallStatus,
  type LeadEngagementNoteRecord,
  type LeadEngagementTaskRecord,
  type LeadLeadCommentRecord,
  type LeadSentEmailRecord,
  type LeadTaskAssignee,
  type LeadTaskStatus,
  type TaskPriority,
} from "@/lib/types/lead-engagement";
import { getAccountById, getAccountByName } from "@/lib/mock-data/accounts";
import { ClipboardList, FileText, MoreVertical, Paperclip, PenLine, Phone, Send, StickyNote, Trash2, Upload } from "lucide-react";

const PRI_OPTS: TaskPriority[] = ["Hot", "Warm", "Cold"];

/** Name shown on notes as "created by" — from linked account, or account name match, then fallbacks. */
function accountOwnerNameForLead(lead: Lead): string {
  if (lead.linkedAccountId) {
    const acc = getAccountById(lead.linkedAccountId);
    if (acc?.accountOwner?.trim()) return acc.accountOwner.trim();
  }
  const an = lead.accountName?.trim();
  if (an) {
    const acc = getAccountByName(an);
    if (acc?.accountOwner?.trim()) return acc.accountOwner.trim();
  }
  return lead.opportunityOwner?.trim() || lead.assignedTo?.trim() || "—";
}

function nowIso(): string {
  return new Date().toISOString();
}

function formatTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatRelativeFromIso(iso: string): string {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  let diffSec = Math.round((d - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(Math.round(diffSec / 1), "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 604800) return rtf.format(Math.round(diffSec / 86400), "day");
  if (abs < 2629800) return rtf.format(Math.round(diffSec / 604800), "week");
  if (abs < 31557600) return rtf.format(Math.round(diffSec / 2629800), "month");
  return rtf.format(Math.round(diffSec / 31557600), "year");
}

function formatFileSize(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Modal shell ─────────────────────────────────────────────────────────────

function ModalShell({
  title,
  children,
  footer,
  onClose,
  widthClass = "w-[520px]",
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  widthClass?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const headingId = useId();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      role="presentation"
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-labelledby={headingId}
        className={`bg-white rounded-2xl ${widthClass} mx-4 shadow-[0_24px_64px_rgba(0,0,0,0.22)] overflow-hidden max-h-[92vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-slate-100 flex-shrink-0">
          <h2 id={headingId} className="text-lg font-bold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
        {footer ? (
          <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

function LabeledRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function fieldClass(disabled?: boolean) {
  return `w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002f93] focus:ring-offset-1 ${disabled ? "bg-slate-50 text-slate-500" : "bg-white"}`;
}

export type LeadEngagementPanel =
  | "emails"
  | "calls"
  | "comments"
  | "tasks"
  | "notes"
  | "attachments";

interface LeadEngagementTabsProps {
  lead: Lead;
  panel: LeadEngagementPanel;
}

export function LeadEngagementTabs({ lead, panel }: LeadEngagementTabsProps) {
  const trackedUrlsRef = useRef<string[]>([]);

  const [sentEmails, setSentEmails] = useState<LeadSentEmailRecord[]>([]);
  const [callLogs, setCallLogs] = useState<LeadCallLogRecord[]>([]);
  const [comments, setComments] = useState<LeadLeadCommentRecord[]>([]);
  const [tasks, setTasks] = useState<LeadEngagementTaskRecord[]>([]);
  const [notes, setNotes] = useState<LeadEngagementNoteRecord[]>([]);
  const [attachments, setAttachments] = useState<LeadAttachmentRecord[]>([]);

  const revokeAllTracked = useCallback(() => {
    trackedUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    trackedUrlsRef.current = [];
  }, []);

  useEffect(() => {
    revokeAllTracked();
    setSentEmails([]);
    setCallLogs([]);
    setComments([]);
    setTasks([]);
    setNotes([]);
    setAttachments([]);
  }, [lead.id, revokeAllTracked]);

  useEffect(() => {
    return () => {
      revokeAllTracked();
    };
  }, [revokeAllTracked]);

  // ── Email tab ──────────────────────────────────────────────────────────────
  const [showEmailCompose, setShowEmailCompose] = useState(false);
  const [emailTo, setEmailTo] = useState(lead.email);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  useEffect(() => {
    setEmailTo(lead.email);
  }, [lead.email]);

  function handleSendEmail() {
    const to = emailTo.trim();
    if (!to) return;
    setSentEmails((prev) => [
      {
        id: crypto.randomUUID(),
        to,
        subject: emailSubject.trim() || "(no subject)",
        body: emailBody,
        sentAt: nowIso(),
      },
      ...prev,
    ]);
    setEmailSubject("");
    setEmailBody("");
    setEmailTo(lead.email);
    setShowEmailCompose(false);
  }

  // ── Call logs ──────────────────────────────────────────────────────────────
  const [callModal, setCallModal] = useState<"create" | "edit" | null>(null);
  const [editingCallId, setEditingCallId] = useState<string | null>(null);
  const [callDraft, setCallDraft] = useState({
    type: "Outgoing" as LeadCallDirection,
    toNumber: "",
    fromNumber: "",
    status: "Completed" as LeadCallStatus,
    duration: "",
  });
  const [callMenuOpenId, setCallMenuOpenId] = useState<string | null>(null);

  function openCallCreate() {
    setCallDraft({
      type: "Outgoing",
      toNumber: "",
      fromNumber: "",
      status: "Completed",
      duration: "",
    });
    setEditingCallId(null);
    setCallModal("create");
  }

  function openCallEdit(rec: LeadCallLogRecord) {
    setEditingCallId(rec.id);
    setCallDraft({
      type: rec.type,
      toNumber: rec.toNumber,
      fromNumber: rec.fromNumber,
      status: rec.status,
      duration: rec.duration,
    });
    setCallModal("edit");
  }

  function saveCall() {
    if (callModal === "edit" && editingCallId) {
      setCallLogs((prev) =>
        prev.map((c) =>
          c.id === editingCallId
            ? { ...c, ...callDraft }
            : c
        )
      );
    } else {
      setCallLogs((prev) => [
        { id: crypto.randomUUID(), ...callDraft },
        ...prev,
      ]);
    }
    setCallModal(null);
    setEditingCallId(null);
  }

  // ── Tasks ───────────────────────────────────────────────────────────────────
  const [taskModal, setTaskModal] = useState<"create" | "edit" | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskDraft, setTaskDraft] = useState({
    title: "",
    description: "",
    priority: "Warm" as TaskPriority,
    assignedToType: "lead_owner" as LeadTaskAssignee,
    dueDate: "",
    status: "To do" as LeadTaskStatus,
  });

  function openTaskCreate(partial?: Partial<typeof taskDraft>) {
    setTaskDraft({
      title: partial?.title ?? "",
      description: partial?.description ?? "",
      priority: partial?.priority ?? "Warm",
      assignedToType: partial?.assignedToType ?? "lead_owner",
      dueDate: partial?.dueDate ?? "",
      status: partial?.status ?? "To do",
    });
    setEditingTaskId(null);
    setTaskModal("create");
    setCallMenuOpenId(null);
  }

  function openTaskEdit(t: LeadEngagementTaskRecord) {
    setEditingTaskId(t.id);
    setTaskDraft({
      title: t.title,
      description: t.description,
      priority: t.priority,
      assignedToType: t.assignedToType,
      dueDate: t.dueDate,
      status: t.status,
    });
    setTaskModal("edit");
    setCallMenuOpenId(null);
  }

  function saveTask() {
    if (!taskDraft.title.trim()) return;
    if (taskModal === "edit" && editingTaskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTaskId ? { ...t, ...taskDraft } : t
        )
      );
    } else {
      setTasks((prev) => [
        { id: crypto.randomUUID(), ...taskDraft },
        ...prev,
      ]);
    }
    setTaskModal(null);
    setEditingTaskId(null);
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  // ── Notes ──────────────────────────────────────────────────────────────────
  const [noteModal, setNoteModal] = useState<"create" | "edit" | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState({
    title: "",
    description: "",
  });

  function openNoteCreate(partial?: { title?: string; description?: string }) {
    setNoteDraft({
      title: partial?.title ?? "",
      description: partial?.description ?? "",
    });
    setEditingNoteId(null);
    setNoteModal("create");
    setCallMenuOpenId(null);
  }

  function openNoteEdit(n: LeadEngagementNoteRecord) {
    setEditingNoteId(n.id);
    setNoteDraft({
      title: n.title,
      description: n.description,
    });
    setNoteModal("edit");
  }

  function saveNote() {
    if (!noteDraft.title.trim()) return;
    if (noteModal === "edit" && editingNoteId) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNoteId
            ? { ...n, title: noteDraft.title, description: noteDraft.description }
            : n
        )
      );
    } else {
      setNotes((prev) => [
        {
          id: crypto.randomUUID(),
          title: noteDraft.title,
          description: noteDraft.description,
          createdBy: accountOwnerNameForLead(lead),
          createdAt: nowIso(),
        },
        ...prev,
      ]);
    }
    setNoteModal(null);
    setEditingNoteId(null);
  }

  // ── Comments (inline compose) ───────────────────────────────────────────────
  const [showCommentCompose, setShowCommentCompose] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");

  function postComment() {
    const body = commentBody.trim();
    if (!body) return;
    setComments((prev) => [
      {
        id: crypto.randomUUID(),
        body,
        createdAt: nowIso(),
        authorName: commentAuthor.trim() || undefined,
      },
      ...prev,
    ]);
    setCommentBody("");
    setCommentAuthor("");
    setShowCommentCompose(false);
  }

  // ── Attachments ─────────────────────────────────────────────────────────────
  const [uploadOpen, setUploadOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function addFiles(files: FileList | File[]) {
    const list = Array.from(files as File[]);
    const rows: LeadAttachmentRecord[] = list.map((file) => {
      const url = URL.createObjectURL(file);
      trackedUrlsRef.current.push(url);
      return {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        mimeType: file.type || undefined,
        url,
      };
    });
    setAttachments((prev) => [...rows, ...prev]);
  }

  function removeAttachment(rec: LeadAttachmentRecord) {
    URL.revokeObjectURL(rec.url);
    trackedUrlsRef.current = trackedUrlsRef.current.filter((u) => u !== rec.url);
    setAttachments((prev) => prev.filter((a) => a.id !== rec.id));
  }

  useEffect(() => {
    if (!callMenuOpenId) return;
    function onDocMouseDown(e: MouseEvent) {
      const el = e.target;
      if (el instanceof Element && el.closest("[data-call-menu-root]")) return;
      setCallMenuOpenId(null);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [callMenuOpenId]);

  function taskFromCall(rec: LeadCallLogRecord) {
    openTaskCreate({
      title: `Follow up: call to ${rec.toNumber}`,
      description: `Call log (${rec.type}) — status: ${rec.status}, duration: ${rec.duration || "—"}`,
    });
  }

  function noteFromCall(rec: LeadCallLogRecord) {
    openNoteCreate({
      title: `Call log — ${rec.toNumber}`,
      description: `Type: ${rec.type}\nFrom: ${rec.fromNumber}\nTo: ${rec.toNumber}\nStatus: ${rec.status}\nDuration: ${rec.duration || "—"}`,
    });
  }

  return (
    <>
      {panel === "emails" && (
        <EngagementSection title="Emails" icon={<Send size={14} className="text-slate-400" />}>
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={() => setShowEmailCompose((v) => !v)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-[#002f93] text-white hover:bg-[#001f6b] transition-colors"
            >
              <Send size={16} />
              Send email
            </button>
          </div>
          {showEmailCompose && (
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <LabeledRow label="To">
                <input
                  className={fieldClass()}
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  type="email"
                  autoComplete="off"
                />
              </LabeledRow>
              <LabeledRow label="Subject">
                <input
                  className={fieldClass()}
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </LabeledRow>
              <LabeledRow label="Body">
                <textarea className={`${fieldClass()} min-h-[120px] resize-y`} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} />
              </LabeledRow>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmailCompose(false)}
                  className="px-3 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-black"
                >
                  Send
                </button>
              </div>
            </div>
          )}
          {sentEmails.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No emails sent yet.</p>
          ) : (
            <div className="space-y-3">
              {sentEmails.map((e) => (
                <div key={e.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{e.subject}</p>
                    <span className="text-[10px] font-semibold uppercase text-slate-400 whitespace-nowrap">
                      {formatTimestamp(e.sentAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">To: {e.to}</p>
                  <p className="text-sm text-slate-700 line-clamp-4 whitespace-pre-wrap">{e.body || "—"}</p>
                </div>
              ))}
            </div>
          )}
        </EngagementSection>
      )}

      {panel === "calls" && (
        <EngagementSection title="Calls" icon={<Phone size={14} className="text-slate-400" />}>
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={openCallCreate}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-[#002f93] text-white hover:bg-[#001f6b] transition-colors"
            >
              <Phone size={16} />
              Add Call log
            </button>
          </div>
          {callLogs.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No call logs yet.</p>
          ) : (
            <div className="space-y-3">
              {callLogs.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-2 hover:border-[#002f93]/40 transition-colors"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    className="flex-1 min-w-0 text-left cursor-pointer"
                    onClick={() => openCallEdit(c)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openCallEdit(c);
                      }
                    }}
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {c.type} call · {c.status}
                      </p>
                      <p className="text-xs text-slate-500">
                        To: {c.toNumber} · From: {c.fromNumber}
                      </p>
                      <p className="text-xs text-slate-500">Duration: {c.duration || "—"}</p>
                    </div>
                  </div>
                  <div className="relative flex-shrink-0" data-call-menu-root>
                    <button
                      type="button"
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
                      aria-label="Actions"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCallMenuOpenId((id) => (id === c.id ? null : c.id));
                      }}
                    >
                      <MoreVertical size={18} />
                    </button>
                    {callMenuOpenId === c.id && (
                      <div className="absolute right-0 top-10 z-[55] w-44 bg-white rounded-xl border border-slate-200 shadow-lg py-1 overflow-hidden">
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                          onClick={() => taskFromCall(c)}
                        >
                          <ClipboardList size={14} /> Add task
                        </button>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                          onClick={() => noteFromCall(c)}
                        >
                          <StickyNote size={14} /> Add note
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </EngagementSection>
      )}

      {panel === "comments" && (
        <EngagementSection title="Comments" icon={<PenLine size={14} className="text-slate-400" />}>
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={() => setShowCommentCompose((v) => !v)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-[#002f93] text-white hover:bg-[#001f6b] transition-colors"
            >
              <PenLine size={16} />
              New comment
            </button>
          </div>
          {showCommentCompose && (
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <LabeledRow label="Posted by (optional)">
                <input
                  className={fieldClass()}
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  placeholder="Your name"
                />
              </LabeledRow>
              <LabeledRow label="Description">
                <textarea className={`${fieldClass()} min-h-[100px]`} value={commentBody} onChange={(e) => setCommentBody(e.target.value)} placeholder="Write a comment…" />
              </LabeledRow>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCommentCompose(false);
                    setCommentBody("");
                    setCommentAuthor("");
                  }}
                  className="px-3 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button type="button" onClick={postComment} className="px-3 py-2 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-black">
                  Post
                </button>
              </div>
            </div>
          )}
          {comments.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No comments yet.</p>
          ) : (
            <div className="space-y-3">
              {comments.map((cm) => (
                <div key={cm.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  {cm.authorName && <p className="text-xs font-semibold text-slate-600 mb-1">{cm.authorName}</p>}
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">{cm.body}</p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    {formatTimestamp(cm.createdAt)} · {formatRelativeFromIso(cm.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </EngagementSection>
      )}

      {panel === "tasks" && (
        <EngagementSection title="Tasks" icon={<ClipboardList size={14} className="text-slate-400" />}>
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={() => openTaskCreate()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-[#002f93] text-white hover:bg-[#001f6b] transition-colors"
            >
              <ClipboardList size={16} />
              New task
            </button>
          </div>
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No tasks yet.</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((t) => (
                <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-slate-900">{t.title}</p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{t.description || "—"}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 pt-1">
                      <span>
                        Priority: <span className="font-medium text-slate-700">{t.priority}</span>
                      </span>
                      <span>
                        Assigned: <span className="font-medium text-slate-700">{assigneeDisplay(lead, t)}</span>
                      </span>
                      <span>
                        Due: <span className="font-medium text-slate-700">{t.dueDate || "—"}</span>
                      </span>
                      <span>
                        Status: <span className="font-medium text-slate-700">{t.status}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => openTaskEdit(t)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      Change task
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTask(t.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </EngagementSection>
      )}

      {panel === "notes" && (
        <EngagementSection title="Notes" icon={<StickyNote size={14} className="text-slate-400" />}>
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={() => openNoteCreate()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-[#002f93] text-white hover:bg-[#001f6b] transition-colors"
            >
              <StickyNote size={16} />
              New note
            </button>
          </div>
          {notes.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No notes yet.</p>
          ) : (
            <div className="space-y-3">
              {notes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => openNoteEdit(n)}
                  className="w-full text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-[#002f93]/40 transition-colors"
                >
                  <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap mt-1">{n.description || "—"}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Account owner: {n.createdBy} · {formatTimestamp(n.createdAt)} ({formatRelativeFromIso(n.createdAt)})
                  </p>
                </button>
              ))}
            </div>
          )}
        </EngagementSection>
      )}

      {panel === "attachments" && (
        <EngagementSection title="Attachments" icon={<Paperclip size={14} className="text-slate-400" />}>
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-[#002f93] text-white hover:bg-[#001f6b] transition-colors"
            >
              <Upload size={16} />
              Upload attachments
            </button>
          </div>
          {attachments.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No attachments yet.</p>
          ) : (
            <div className="space-y-3">
              {attachments.map((a) => (
                <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{a.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(a.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={a.url}
                      download={a.name}
                      className="text-xs font-semibold text-[#002f93] hover:underline"
                    >
                      Download
                    </a>
                    <button
                      type="button"
                      onClick={() => removeAttachment(a)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </EngagementSection>
      )}

      {/* Call modal */}
      {callModal && (
        <ModalShell
          title={callModal === "edit" ? "Edit call log" : "Add call log"}
          onClose={() => {
            setCallModal(null);
            setEditingCallId(null);
          }}
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-white"
                onClick={() => {
                  setCallModal(null);
                  setEditingCallId(null);
                }}
              >
                Cancel
              </button>
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#002f93] text-white hover:bg-[#001f6b]" onClick={saveCall}>
                {callModal === "edit" ? "Save" : "Create"}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <LabeledRow label="Type">
              <select className={fieldClass()} value={callDraft.type} onChange={(e) => setCallDraft((d) => ({ ...d, type: e.target.value as LeadCallDirection }))}>
                {LEAD_CALL_DIRECTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </LabeledRow>
            <LabeledRow label="To Number">
              <input className={fieldClass()} value={callDraft.toNumber} onChange={(e) => setCallDraft((d) => ({ ...d, toNumber: e.target.value }))} />
            </LabeledRow>
            <LabeledRow label="From Number">
              <input className={fieldClass()} value={callDraft.fromNumber} onChange={(e) => setCallDraft((d) => ({ ...d, fromNumber: e.target.value }))} />
            </LabeledRow>
            <LabeledRow label="Status">
              <select className={fieldClass()} value={callDraft.status} onChange={(e) => setCallDraft((d) => ({ ...d, status: e.target.value as LeadCallStatus }))}>
                {LEAD_CALL_STATUSES.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </LabeledRow>
            <LabeledRow label="Duration">
              <input className={fieldClass()} value={callDraft.duration} onChange={(e) => setCallDraft((d) => ({ ...d, duration: e.target.value }))} placeholder="e.g. 3:42" />
            </LabeledRow>
          </div>
        </ModalShell>
      )}

      {/* Task modal */}
      {taskModal && (
        <ModalShell
          title={taskModal === "edit" ? "Change task" : "New task"}
          onClose={() => {
            setTaskModal(null);
            setEditingTaskId(null);
          }}
          footer={
            <div className="flex justify-end gap-2">
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-white" onClick={() => { setTaskModal(null); setEditingTaskId(null); }}>
                Cancel
              </button>
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#002f93] text-white hover:bg-[#001f6b]" onClick={saveTask}>
                {taskModal === "edit" ? "Save" : "Create"}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <LabeledRow label="Title">
              <input className={fieldClass()} value={taskDraft.title} onChange={(e) => setTaskDraft((d) => ({ ...d, title: e.target.value }))} />
            </LabeledRow>
            <LabeledRow label="Description">
              <textarea className={`${fieldClass()} min-h-[80px]`} value={taskDraft.description} onChange={(e) => setTaskDraft((d) => ({ ...d, description: e.target.value }))} />
            </LabeledRow>
            <LabeledRow label="Priority">
              <select className={fieldClass()} value={taskDraft.priority} onChange={(e) => setTaskDraft((d) => ({ ...d, priority: e.target.value as TaskPriority }))}>
                {PRI_OPTS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </LabeledRow>
            <LabeledRow label="Assigned to">
              <select
                className={fieldClass()}
                value={taskDraft.assignedToType}
                onChange={(e) => setTaskDraft((d) => ({ ...d, assignedToType: e.target.value as LeadTaskAssignee }))}
              >
                <option value="lead_owner">Lead Owner ({lead.assignedTo})</option>
                <option value="lead_user">Lead user ({lead.contactName})</option>
              </select>
            </LabeledRow>
            <LabeledRow label="Due date">
              <input className={fieldClass()} type="date" value={taskDraft.dueDate} onChange={(e) => setTaskDraft((d) => ({ ...d, dueDate: e.target.value }))} />
            </LabeledRow>
            <LabeledRow label="Status">
              <select className={fieldClass()} value={taskDraft.status} onChange={(e) => setTaskDraft((d) => ({ ...d, status: e.target.value as LeadTaskStatus }))}>
                {LEAD_TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </LabeledRow>
          </div>
        </ModalShell>
      )}

      {/* Note modal */}
      {noteModal && (
        <ModalShell
          title={noteModal === "edit" ? "Edit note" : "New note"}
          onClose={() => {
            setNoteModal(null);
            setEditingNoteId(null);
          }}
          footer={
            <div className="flex justify-end gap-2">
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-white" onClick={() => { setNoteModal(null); setEditingNoteId(null); }}>
                Cancel
              </button>
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#002f93] text-white hover:bg-[#001f6b]" onClick={saveNote}>
                {noteModal === "edit" ? "Save" : "Create"}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <LabeledRow label="Title">
              <input className={fieldClass()} value={noteDraft.title} onChange={(e) => setNoteDraft((d) => ({ ...d, title: e.target.value }))} />
            </LabeledRow>
            <LabeledRow label="Description">
              <textarea className={`${fieldClass()} min-h-[100px]`} value={noteDraft.description} onChange={(e) => setNoteDraft((d) => ({ ...d, description: e.target.value }))} />
            </LabeledRow>
          </div>
        </ModalShell>
      )}

      {/* Upload modal */}
      {uploadOpen && (
        <ModalShell
          title="Upload attachments"
          onClose={() => setUploadOpen(false)}
          widthClass="w-[560px]"
          footer={
            <div className="flex justify-end">
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-black" onClick={() => setUploadOpen(false)}>
                Done
              </button>
            </div>
          }
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const f = e.target.files;
              if (f?.length) addFiles(f);
              e.target.value = "";
            }}
          />
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
            }}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
              dragOver ? "border-[#002f93] bg-blue-50/50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto text-slate-400 mb-2" size={32} />
            <p className="text-sm font-semibold text-slate-700">Drag and drop files here</p>
            <p className="text-xs text-slate-500 mt-1">or click to open file browser</p>
          </div>
        </ModalShell>
      )}
    </>
  );
}

function assigneeDisplay(lead: Lead, t: Pick<LeadEngagementTaskRecord, "assignedToType">): string {
  return t.assignedToType === "lead_owner" ? lead.assignedTo : lead.contactName;
}

function EngagementSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
        {icon}
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{title}</p>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
