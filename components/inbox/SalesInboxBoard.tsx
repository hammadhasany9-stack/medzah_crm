"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  SALES_INBOX_ITEMS,
  matchesMailboxView,
  type MailFolderId,
  type MailLabelId,
  type MailboxViewFilterId,
  type SalesInboxColumnId,
  type SalesInboxItem,
} from "@/lib/mock-data/sales-inbox";
import { InboxColumn } from "./InboxColumn";

const COLUMN_ORDER: SalesInboxColumnId[] = ["opportunities", "conversations", "next_steps", "follow_ups"];

const COLUMN_LABEL: Record<SalesInboxColumnId, string> = {
  opportunities: "Opportunities",
  conversations: "Conversations",
  next_steps: "Next steps",
  follow_ups: "Follow ups",
};

function filterInboxThreads(
  items: SalesInboxItem[],
  folderSlug: string,
  vfSlug: string,
  labelSlug: string
): SalesInboxItem[] {
  const folder: MailFolderId = (folderSlug || "mine") as MailFolderId;
  const vf: MailboxViewFilterId = (vfSlug || "all_messages") as MailboxViewFilterId;

  return items.filter((item) => {
    if (!item.mailFolders.includes(folder)) return false;
    if (!matchesMailboxView(item, vf)) return false;
    if (labelSlug) {
      const ml = labelSlug as MailLabelId;
      if (!item.mailLabels?.includes(ml)) return false;
    }
    return true;
  });
}

export function SalesInboxBoard() {
  const searchParams = useSearchParams();
  const folderSlug = searchParams.get("folder") ?? "";
  const vfSlug = searchParams.get("vf") ?? "";
  const labelSlug = searchParams.get("ml") ?? "";

  const filtered = useMemo(() => filterInboxThreads(SALES_INBOX_ITEMS, folderSlug, vfSlug, labelSlug), [folderSlug, vfSlug, labelSlug]);

  const byColumn = useMemo(() => {
    const map = new Map<SalesInboxColumnId, SalesInboxItem[]>();
    for (const col of COLUMN_ORDER) map.set(col, []);
    for (const item of filtered) {
      map.get(item.column)!.push(item);
    }
    return map;
  }, [filtered]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 items-start">
      {COLUMN_ORDER.map((col) => (
        <InboxColumn key={col} label={COLUMN_LABEL[col]} items={byColumn.get(col)!} />
      ))}
    </div>
  );
}
