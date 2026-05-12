"use client";

import { useState, useEffect, type MutableRefObject } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { Lead, KanbanColumn as KanbanColumnType, LeadStatus, Priority, OpportunityData, Opportunity } from "@/lib/types";
import { persistCrmCustomerRecords, opportunityDataToPersistInput } from "@/lib/opportunity-customer-persist";
import { KanbanColumn } from "./KanbanColumn";
import { LeadCard } from "./LeadCard";
import { AttemptedContactModal } from "./AttemptedContactModal";
import { ContactedModal, ContactedModalResult } from "./ContactedModal";
import { QualifiedModal } from "./QualifiedModal";
import { InactiveModal, InactiveModalResult } from "./InactiveModal";

const COLUMNS: KanbanColumnType[] = [
  { id: "New",                 label: "New",                 accentColor: "#6366F1", emptyText: "No new leads" },
  { id: "Attempted Contact",   label: "Attempted Contact",   accentColor: "#F59E0B", emptyText: "No leads attempted contact" },
  { id: "Contacted",           label: "Contacted",           accentColor: "#10B981", emptyText: "No leads contacted" },
  { id: "Qualified",           label: "Qualified",           accentColor: "#8B5CF6", emptyText: "No leads qualified" },
  { id: "Inactive",            label: "Inactive",            accentColor: "#EF4444", emptyText: "No inactive leads" },
];

interface PendingDrop {
  leadId: string;
  targetStatus: LeadStatus;
}

/** Exposed for Lead detail panel — same transitions as drag-and-drop */
export type LeadBoardActions = {
  requestStatusTransition: (leadId: string, targetStatus: LeadStatus) => void;
  applyPriority: (leadId: string, priority: Priority) => void;
};

interface LeadsKanbanBoardProps {
  initialLeads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadsChange?: (leads: Lead[]) => void;
  onOpportunityCreated?: (opp: Opportunity, leadId: string) => void;
  onOpportunityUpdated?: (opp: Opportunity) => void;
  opportunities?: Opportunity[];
  /** Filled while the sales board is mounted — used by LeadDetailPanel dropdowns */
  boardActionsRef?: MutableRefObject<LeadBoardActions | null>;
  /**
   * When true (e.g. Source view), only the kanban chrome is hidden — pipeline modals still mount
   * and show (they must not sit under `display:none` from a parent wrapper).
   */
  boardChromeHidden?: boolean;
}

export function LeadsKanbanBoard({
  initialLeads,
  onLeadClick,
  onLeadsChange,
  onOpportunityCreated,
  onOpportunityUpdated,
  opportunities = [],
  boardActionsRef,
  boardChromeHidden = false,
}: LeadsKanbanBoardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [attemptedContactDrop, setAttemptedContactDrop] = useState<PendingDrop | null>(null);
  const [contactedDrop, setContactedDrop]       = useState<PendingDrop | null>(null);
  const [qualifiedDrop, setQualifiedDrop]       = useState<PendingDrop | null>(null);
  const [inactiveDrop,  setInactiveDrop]        = useState<PendingDrop | null>(null);

  const activeLead        = leads.find((l) => l.id === activeId) ?? null;
  const attemptedLead     = attemptedContactDrop ? leads.find((l) => l.id === attemptedContactDrop.leadId) ?? null : null;
  const contactedLead     = contactedDrop        ? leads.find((l) => l.id === contactedDrop.leadId)        ?? null : null;
  const qualifiedLead     = qualifiedDrop        ? leads.find((l) => l.id === qualifiedDrop.leadId)        ?? null : null;
  const inactiveLead      = inactiveDrop         ? leads.find((l) => l.id === inactiveDrop.leadId)         ?? null : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function requestColumnTransition(leadId: string, targetColumn: LeadStatus) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === targetColumn) return;

    if (targetColumn === "Attempted Contact") {
      setAttemptedContactDrop({ leadId, targetStatus: targetColumn });
      return;
    }
    if (targetColumn === "Contacted") {
      setContactedDrop({ leadId, targetStatus: targetColumn });
      return;
    }
    if (targetColumn === "Qualified") {
      setQualifiedDrop({ leadId, targetStatus: targetColumn });
      return;
    }
    if (targetColumn === "Inactive") {
      setInactiveDrop({ leadId, targetStatus: targetColumn });
      return;
    }

    applyStatus(leadId, targetColumn);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const leadId       = String(active.id);
    const targetColumn = String(over.id) as LeadStatus;

    if (!COLUMNS.find((c) => c.id === targetColumn)) return;

    requestColumnTransition(leadId, targetColumn);
  }

  function applyPriority(leadId: string, priority: Priority) {
    const next = leads.map((l) => (l.id === leadId ? { ...l, priority } : l));
    setLeads(next);
    onLeadsChange?.(next);
  }

  function applyStatus(leadId: string, newStatus: LeadStatus, extra?: Partial<Lead>) {
    const next = leads.map((l) => (l.id === leadId ? { ...l, status: newStatus, ...extra } : l));
    setLeads(next);
    onLeadsChange?.(next);
  }

  function handleAttemptedSave(dueDate: string) {
    if (!attemptedContactDrop) return;
    applyStatus(attemptedContactDrop.leadId, "Attempted Contact", {
      callDue: `Follow-up due ${fmt(dueDate)}`,
    });
    setAttemptedContactDrop(null);
  }

  function handleContactedSave(result: ContactedModalResult) {
    if (!contactedDrop) return;

    applyStatus(contactedDrop.leadId, result.targetStatus, {
      callDue:    result.dueDate ? `Follow-up due ${fmt(result.dueDate)}` : undefined,
      reason:     result.reason ?? undefined,
      reasonNote: result.reasonNote ?? undefined,
    });

    setContactedDrop(null);
  }

  function handleInactiveSave(result: InactiveModalResult) {
    if (!inactiveDrop) return;
    applyStatus(inactiveDrop.leadId, "Inactive", {
      reason:     result.reason ?? undefined,
      reasonNote: result.reasonNote ?? undefined,
      allocationRejection: undefined,
    });
    setInactiveDrop(null);
  }

  function handleQualifiedSave(data: OpportunityData) {
    if (!qualifiedDrop) return;
    const lead = leads.find((l) => l.id === qualifiedDrop.leadId);
    if (!lead) return;

    const idMerge = persistCrmCustomerRecords(opportunityDataToPersistInput(data));
    const dataSynced: OpportunityData = { ...data, ...idMerge };

    applyStatus(qualifiedDrop.leadId, "Qualified", {
      opportunityData: dataSynced,
      callDue: "Qualified",
      priority: dataSynced.leadPriority,
    });

    const today = new Date();
    const createdDate = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}/${String(today.getFullYear()).slice(2)} ; ${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`;

    const existingOpp = lead.opportunityId
      ? opportunities.find((o) => o.id === lead.opportunityId)
      : null;

    if (existingOpp && onOpportunityUpdated) {
      const updatedOpp: Opportunity = {
        ...existingOpp,
        accountName:      dataSynced.accountName,
        businessType:     dataSynced.businessType,
        closingDate:      dataSynced.closingDate,
        contactName:      dataSynced.contactName,
        contactEmail:     dataSynced.contactEmail ?? existingOpp.contactEmail,
        contactPhone:     dataSynced.contactPhone ?? existingOpp.contactPhone,
        pipeline:         dataSynced.pipeline,
        expectedRevenue:  dataSynced.expectedRevenue,
        amount:           dataSynced.amount,
        campaignSource:   dataSynced.campaignSource,
        description:      dataSynced.description,
        leadPriority:     dataSynced.leadPriority,
        companyName:      dataSynced.accountName,
        customerType:     dataSynced.customerType,
        linkedAccountId:  dataSynced.linkedAccountId,
        linkedContactId:  dataSynced.linkedContactId,
        accountWebsite:   dataSynced.accountWebsite,
        accountIndustry:  dataSynced.accountIndustry,
        contactFirstName: dataSynced.contactFirstName,
        contactLastName:  dataSynced.contactLastName,
        contactGender:    dataSynced.contactGender,
      };
      onOpportunityUpdated(updatedOpp);
    } else if (onOpportunityCreated) {
      const newOpp: Opportunity = {
        id: `opp-${Date.now()}`,
        opportunityRef: `O-${10100 + Math.floor(Math.random() * 900)}`,
        accountName:      dataSynced.accountName,
        businessType:     dataSynced.businessType,
        closingDate:      dataSynced.closingDate,
        contactName:      dataSynced.contactName,
        contactEmail:     dataSynced.contactEmail ?? lead.email,
        contactPhone:     dataSynced.contactPhone ?? lead.phone,
        pipeline:         dataSynced.pipeline,
        expectedRevenue:  dataSynced.expectedRevenue,
        amount:           dataSynced.amount,
        campaignSource:   dataSynced.campaignSource,
        description:      dataSynced.description,
        note:             lead.note,
        leadSource:       lead.leadSource,
        createdDate,
        leadPriority:     dataSynced.leadPriority,
        opportunityStage: "Qualified",
        assignedTo:       lead.opportunityOwner,
        companyName:      dataSynced.accountName,
        leadId:           lead.id,
        allocationId:     lead.allocationId,
        customerType:     dataSynced.customerType,
        linkedAccountId:  dataSynced.linkedAccountId,
        linkedContactId:  dataSynced.linkedContactId,
        accountWebsite:   dataSynced.accountWebsite,
        accountIndustry:  dataSynced.accountIndustry,
        contactFirstName: dataSynced.contactFirstName,
        contactLastName:  dataSynced.contactLastName,
        contactGender:    dataSynced.contactGender,
        activities: [
          {
            id:          `oact-${Date.now()}`,
            type:        "created",
            title:       "Opportunity Created",
            description: `Converted from Lead: ${lead.leadSource}`,
            timestamp:   `${String(today.toLocaleString("en-US", { month: "short" })).toUpperCase()} ${today.getDate()}, ${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")} ${today.getHours() >= 12 ? "PM" : "AM"}`,
          },
          ...lead.activities,
        ],
      };
      onOpportunityCreated(newOpp, lead.id);
    }

    setQualifiedDrop(null);
  }

  if (boardActionsRef) {
    boardActionsRef.current = {
      requestStatusTransition: requestColumnTransition,
      applyPriority,
    };
  }

  useEffect(() => {
    return () => {
      if (boardActionsRef) boardActionsRef.current = null;
    };
  }, [boardActionsRef]);

  return (
    <>
      <div
        className={boardChromeHidden ? "hidden" : undefined}
        aria-hidden={boardChromeHidden}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                leads={leads.filter((l) => l.status === column.id)}
                onLeadClick={onLeadClick}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
            {activeLead ? (
              <div className="rotate-1 scale-105 shadow-2xl rounded-xl opacity-95">
                <LeadCard lead={activeLead} onClick={() => {}} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {attemptedContactDrop && attemptedLead && (
        <AttemptedContactModal
          leadName={attemptedLead.contactName}
          onSave={handleAttemptedSave}
          onCancel={() => setAttemptedContactDrop(null)}
        />
      )}

      {contactedDrop && contactedLead && (
        <ContactedModal
          leadName={contactedLead.contactName}
          onSave={handleContactedSave}
          onCancel={() => setContactedDrop(null)}
        />
      )}

      {qualifiedDrop && qualifiedLead && (
        <QualifiedModal
          key={qualifiedLead.id}
          leadName={qualifiedLead.contactName}
          defaultContactName={qualifiedLead.contactName}
          defaultAccountName={qualifiedLead.companyName}
          leadPrefill={{
            companyName: qualifiedLead.companyName,
            website: qualifiedLead.website,
            industry: qualifiedLead.industry,
            expectedRevenue: qualifiedLead.expectedRevenue,
            firstName: qualifiedLead.firstName,
            lastName: qualifiedLead.lastName,
            email: qualifiedLead.email,
            mobile: qualifiedLead.phone,
            gender: qualifiedLead.gender,
          }}
          onSave={handleQualifiedSave}
          onCancel={() => setQualifiedDrop(null)}
        />
      )}

      {inactiveDrop && inactiveLead && (
        <InactiveModal
          leadName={inactiveLead.contactName}
          onSave={handleInactiveSave}
          onCancel={() => setInactiveDrop(null)}
        />
      )}
    </>
  );
}

function fmt(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y.slice(2)}`;
}
