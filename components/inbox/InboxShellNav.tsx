"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, SquarePen } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  countThreadsAllMessages,
  countThreadsForLabel,
  countThreadsUnread,
  countThreadsForMailboxView,
  countThreadsInFolder,
  type MailFolderId,
  type MailLabelId,
  type MailboxViewFilterId,
} from "@/lib/mock-data/sales-inbox";

const FOLDERS: { id: MailFolderId; label: string }[] = [
  { id: "mine", label: "Mine" },
  { id: "inbox", label: "Inbox" },
  { id: "drafts", label: "Drafts" },
  { id: "scheduled", label: "Scheduled" },
  { id: "sent", label: "Sent" },
  { id: "spam", label: "Spam" },
  { id: "trash", label: "Trash" },
  { id: "closing", label: "Closing this Month" },
  { id: "customers", label: "Customers" },
];

const VIEWS: { id: MailboxViewFilterId; label: string }[] = [
  { id: "unread", label: "Unread" },
  { id: "unopened", label: "Unopened" },
  { id: "not_responded", label: "Not Responded" },
  { id: "not_replied", label: "Not Replied" },
  { id: "all_messages", label: "All Messages" },
];

const LABEL_ITEMS: { id: MailLabelId; label: string }[] = [
  { id: "vip", label: "VIP" },
  { id: "renewal", label: "Renewal" },
  { id: "pricing", label: "Pricing" },
];

export interface InboxShellNavProps {
  composeHref: string;
}

/** Build `/inbox` URL; omits defaulted `mine` folder and `all_messages` view. */
function packInboxQuery(
  searchParams: URLSearchParams,
  patch: Partial<{ folder: string; vf: string; ml: string }>
): string {
  const nextFolder =
    patch.folder !== undefined ? patch.folder : searchParams.get("folder") ?? "";
  const nextVf =
    patch.vf !== undefined ? patch.vf : searchParams.get("vf") ?? "";
  const nextMl =
    patch.ml !== undefined ? patch.ml : searchParams.get("ml") ?? "";

  const q = new URLSearchParams();
  if (nextFolder && nextFolder !== "mine") q.set("folder", nextFolder);
  if (nextVf && nextVf !== "all_messages") q.set("vf", nextVf);
  if (nextMl.length) q.set("ml", nextMl);

  const s = q.toString();
  return s ? `/inbox?${s}` : "/inbox";
}

function FolderCount({ fid }: { fid: MailFolderId }) {
  const n = countThreadsInFolder(fid);
  return (
    <span className="ml-2 min-w-[1.125rem] text-center rounded-md bg-white/12 px-1.5 py-0.5 text-[10px] font-bold text-slate-200 tabular-nums leading-none shrink-0">
      {n}
    </span>
  );
}

function ViewCountCell({ vf }: { vf: MailboxViewFilterId }) {
  const n =
    vf === "unread"
      ? countThreadsUnread()
      : vf === "all_messages"
        ? countThreadsAllMessages()
        : countThreadsForMailboxView(vf);
  return (
    <span className="ml-2 min-w-[1.125rem] text-center rounded-md bg-white/12 px-1.5 py-0.5 text-[10px] font-bold text-slate-200 tabular-nums leading-none shrink-0">
      {n}
    </span>
  );
}

function LabelCount({ lid }: { lid: MailLabelId }) {
  const n = countThreadsForLabel(lid);
  return (
    <span className="ml-2 min-w-[1.125rem] text-center rounded-md bg-white/12 px-1.5 py-0.5 text-[10px] font-bold text-slate-200 tabular-nums leading-none shrink-0">
      {n}
    </span>
  );
}

function SectionHeader({
  title,
  showAdd,
}: {
  title: string;
  /** Folders / Labels (+) in reference; Views has no trailing + */
  showAdd?: boolean;
}) {
  function noopAdd() {}

  return (
    <div className="flex items-center gap-0.5 flex-shrink-0">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 whitespace-nowrap">
        {title}
      </span>
      {showAdd ? (
        <button
          type="button"
          onClick={noopAdd}
          className="p-1 rounded-md text-slate-500 hover:bg-white/10 hover:text-slate-200 transition-colors shrink-0"
          aria-label={`Add ${title}`}
          title="Add"
        >
          <Plus size={12} strokeWidth={2.5} />
        </button>
      ) : null}
    </div>
  );
}

export function InboxShellNav({ composeHref }: InboxShellNavProps) {
  const searchParams = useSearchParams();
  const folder = searchParams.get("folder") ?? "mine";
  const vf = searchParams.get("vf") ?? "all_messages";
  const ml = searchParams.get("ml") ?? "";

  return (
    <nav
      aria-label="Sales inbox navigation"
      className={cn(
        "flex items-center gap-3 px-3 sm:px-4 min-h-[56px] py-2",
        "bg-[#0F172A] border-b border-white/10 overflow-x-auto scrollbar-thin text-slate-200"
      )}
    >
      <Link
        href={composeHref}
        className={cn(
          "flex items-center gap-2 flex-shrink-0 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap",
          "bg-[#002f93] text-white shadow-sm hover:bg-[#0038b3] transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]"
        )}
      >
        <SquarePen size={18} aria-hidden />
        Compose
      </Link>

      <div className="h-8 w-px bg-white/10 flex-shrink-0" aria-hidden />

      {/* FOLDERS */}
      <div className="flex items-center gap-2 flex-shrink-0 py-1 pr-3 border-r border-white/10">
        <SectionHeader title="folders" showAdd />
        <div className="flex items-center gap-1">
          {FOLDERS.map(({ id: fid, label }) => (
            <Link
              key={fid}
              href={packInboxQuery(searchParams, {
                folder: fid === "mine" ? "" : fid,
              })}
              scroll={false}
              className={cn(
                "flex items-center flex-shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors border border-transparent",
                folder === fid
                  ? "bg-white/[0.12] text-white border-white/15 ring-1 ring-[#002f93]/55"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100"
              )}
            >
              {label}
              <FolderCount fid={fid} />
            </Link>
          ))}
        </div>
      </div>

      {/* VIEWS */}
      <div className="flex items-center gap-2 flex-shrink-0 py-1 pr-3 border-r border-white/10">
        <SectionHeader title="views" />
        <div className="flex items-center gap-1">
          {VIEWS.map(({ id: vid, label }) => (
            <Link
              key={vid}
              href={packInboxQuery(searchParams, {
                vf: vid === "all_messages" ? "" : vid,
              })}
              scroll={false}
              className={cn(
                "flex items-center flex-shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors border border-transparent",
                vf === vid
                  ? "bg-white/[0.12] text-white border-white/15 ring-1 ring-[#002f93]/55"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100"
              )}
            >
              {label}
              <ViewCountCell vf={vid} />
            </Link>
          ))}
        </div>
      </div>

      {/* LABELS */}
      <div className="flex items-center gap-2 flex-shrink-0 py-1">
        <SectionHeader title="labels" showAdd />
        <div className="flex items-center gap-1">
          <Link
            href={packInboxQuery(searchParams, { ml: "" })}
            scroll={false}
            className={cn(
              "flex-shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors border border-transparent",
              !ml
                ? "bg-white/[0.12] text-white border-white/15 ring-1 ring-[#002f93]/55"
                : "text-slate-500 hover:bg-white/[0.06] hover:text-slate-300"
            )}
          >
            All
          </Link>
          {LABEL_ITEMS.map(({ id: lid, label }) => (
            <Link
              key={lid}
              href={packInboxQuery(searchParams, { ml: lid })}
              scroll={false}
              className={cn(
                "flex items-center flex-shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors border border-transparent",
                ml === lid
                  ? "bg-white/[0.12] text-white border-white/15 ring-1 ring-[#002f93]/55"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100"
              )}
            >
              {label}
              <LabelCount lid={lid} />
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
