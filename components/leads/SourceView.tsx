"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Plus, Trash2,
  PhoneCall, Globe, UserPlus, Building2, Link2,
  Megaphone, Star, Zap, HelpCircle, Users,
} from "lucide-react";
import { Lead, SourceColumn } from "@/lib/types";
import { getSourceIcon } from "./AddSourceModal";
import { LeadCreatedModal } from "./LeadCreatedModal";

const sourceIconMap: Record<string, LucideIcon> = {
  "Cold Call":             PhoneCall,
  "Cold Outreach":         PhoneCall,
  "Internal Referral":     UserPlus,
  "External Referral":     UserPlus,
  Referral:                UserPlus,
  "Chamber of Commerce":   Building2,
  Premier:                 Star,
  "Premier Activation":    Zap,
  Facebook:                Globe,
  LinkedIn:                Link2,
  "Yamas Rental Commerce": Building2,
  Unaccounted:             HelpCircle,
  "Social Media":          Megaphone,
  Website:                 Globe,
};

function resolveIcon(source: SourceColumn): LucideIcon {
  if (source.iconName) return getSourceIcon(source.iconName);
  return sourceIconMap[source.label] ?? Users;
}
import { LeadCard } from "./LeadCard";
import { ConfirmModal } from "./ConfirmModal";
import { CreateLeadModal } from "./CreateLeadModal";

interface SourceViewProps {
  leads: Lead[];
  sources: SourceColumn[];
  onLeadClick: (lead: Lead) => void;
  onAddSource: () => void;
  onDeleteSource: (sourceId: string) => void;
  onCreateLead: (lead: Lead) => void;
}

function SourceColumnPanel({
  source,
  leads,
  onLeadClick,
  onDelete,
  onCreate,
}: {
  source: SourceColumn;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onDelete: () => void;
  onCreate: () => void;
}) {
  const Icon = resolveIcon(source);

  return (
    <div className="flex-shrink-0 w-[300px] flex flex-col">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1 gap-2">
        {/* Left: icon + label */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: source.badgeColor + "18" }}
          >
            <Icon size={13} style={{ color: source.badgeColor }} />
          </span>
          <h3
            className="text-[12px] font-bold tracking-wide uppercase truncate"
            style={{ color: source.badgeColor }}
          >
            {source.label}
          </h3>
        </div>

        {/* Right: count + actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span
            className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: source.badgeColor + "18", color: source.badgeColor }}
          >
            {leads.length}
          </span>

          {/* Add lead button */}
          <button
            type="button"
            onClick={onCreate}
            title="Create lead in this source"
            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-white transition-all duration-150"
            style={{ ["--hover-bg" as string]: source.badgeColor }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = source.badgeColor; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
          >
            <Plus size={13} />
          </button>

          {/* Delete button */}
          <button
            type="button"
            onClick={onDelete}
            title="Remove this source"
            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all duration-150"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Accent line */}
      <div
        className="h-[3px] rounded-full mb-3 mx-1"
        style={{ backgroundColor: source.badgeColor + "40" }}
      />

      {/* Cards */}
      <div className="flex flex-col gap-3 flex-1">
        {leads.length === 0 ? (
          <div
            className="flex-1 min-h-[80px] flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed cursor-pointer group transition-all duration-150"
            style={{ borderColor: source.badgeColor + "40" }}
            onClick={onCreate}
          >
            <Icon size={16} style={{ color: source.badgeColor + "60" }} className="group-hover:scale-110 transition-transform" />
            <p className="text-[12px]" style={{ color: source.badgeColor + "80" }}>Add first lead</p>
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} variant="source" />
          ))
        )}
      </div>
    </div>
  );
}

export function SourceView({
  leads,
  sources,
  onLeadClick,
  onAddSource,
  onDeleteSource,
  onCreateLead,
}: SourceViewProps) {
  const [confirmDelete,    setConfirmDelete]    = useState<SourceColumn | null>(null);
  const [createFor,        setCreateFor]        = useState<SourceColumn | null>(null);
  const [showLeadCreated,  setShowLeadCreated]  = useState(false);

  const knownLabels = new Set(sources.map((s) => s.label));

  function leadsForSource(source: SourceColumn): Lead[] {
    if (source.id === "unaccounted") {
      return leads.filter(
        (l) => !sources.some((s) => s.label === l.leadSource && s.id !== "unaccounted")
      );
    }
    return leads.filter((l) => l.leadSource === source.label);
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {sources.map((source) => (
          <SourceColumnPanel
            key={source.id}
            source={source}
            leads={leadsForSource(source)}
            onLeadClick={onLeadClick}
            onDelete={() => setConfirmDelete(source)}
            onCreate={() => setCreateFor(source)}
          />
        ))}

        {/* Add New Source column */}
        <div className="flex-shrink-0 w-[220px] flex flex-col">
          <button
            type="button"
            onClick={onAddSource}
            className="flex flex-col items-center justify-center gap-3 h-full min-h-[160px] rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-[#002f93] hover:text-[#002f93] hover:bg-blue-50/30 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
              <Plus size={20} />
            </div>
            <p className="text-[13px] font-semibold">Add New Source</p>
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <ConfirmModal
          title={`Remove "${confirmDelete.label}"?`}
          message={`This will remove the "${confirmDelete.label}" source column from the board. Existing leads will not be deleted — they'll move to Unaccounted.`}
          confirmLabel="Remove Source"
          variant="danger"
          onConfirm={() => {
            onDeleteSource(confirmDelete.id);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Create lead modal */}
      {createFor && (
        <CreateLeadModal
          sourceLabel={createFor.label}
          sourceBadgeColor={createFor.badgeColor}
          onSave={(lead) => {
            onCreateLead(lead);
            setCreateFor(null);
            setShowLeadCreated(true);
          }}
          onCancel={() => setCreateFor(null)}
        />
      )}

      {/* Lead created confirmation modal */}
      {showLeadCreated && (
        <LeadCreatedModal
          onSave={() => setShowLeadCreated(false)}
        />
      )}
    </>
  );
}
