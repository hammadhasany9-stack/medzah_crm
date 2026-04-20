"use client";

import { useState, useEffect, type MutableRefObject } from "react";
import { mockProducts } from "@/lib/mock-data/products";
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
import { Lead, KanbanColumn as KanbanColumnType, LeadStatus, Priority, OpportunityData, Opportunity, AllocationRecord, AllocationProduct, InventoryItem, ProductRow } from "@/lib/types";
import { KanbanColumn } from "./KanbanColumn";
import { LeadCard } from "./LeadCard";
import { AttemptedContactModal } from "./AttemptedContactModal";
import { ContactedModal, ContactedModalResult } from "./ContactedModal";
import { AllocationModal, AllocationModalResult } from "./AllocationModal";
import { QualifiedModal } from "./QualifiedModal";
import { BlockedModal } from "./BlockedModal";
import { InactiveModal, InactiveModalResult } from "./InactiveModal";

const COLUMNS: KanbanColumnType[] = [
  { id: "New",                 label: "New",                 accentColor: "#6366F1", emptyText: "No new leads" },
  { id: "Attempted Contact",   label: "Attempted Contact",   accentColor: "#F59E0B", emptyText: "No leads attempted contact" },
  { id: "Contacted",           label: "Contacted",           accentColor: "#10B981", emptyText: "No leads contacted" },
  { id: "Allocation",          label: "Allocation",          accentColor: "#002f93", emptyText: "No leads in allocation" },
  { id: "Qualified",           label: "Qualified",           accentColor: "#8B5CF6", emptyText: "No leads qualified" },
  { id: "Allocation on hold",  label: "Allocation on hold",  accentColor: "#94A3B8", emptyText: "No leads on hold" },
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
  onAllocationCreated?: (record: AllocationRecord, leadId: string) => void;
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
  onAllocationCreated,
  opportunities = [],
  boardActionsRef,
  boardChromeHidden = false,
}: LeadsKanbanBoardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [attemptedContactDrop, setAttemptedContactDrop] = useState<PendingDrop | null>(null);
  const [contactedDrop, setContactedDrop]       = useState<PendingDrop | null>(null);
  const [procurementDrop, setProcurementDrop]   = useState<PendingDrop | null>(null);
  const [qualifiedDrop, setQualifiedDrop]       = useState<PendingDrop | null>(null);
  const [inactiveDrop,  setInactiveDrop]        = useState<PendingDrop | null>(null);
  const [showProcurementBlock, setShowProcurementBlock] = useState(false);

  const activeLead        = leads.find((l) => l.id === activeId) ?? null;
  const attemptedLead     = attemptedContactDrop ? leads.find((l) => l.id === attemptedContactDrop.leadId) ?? null : null;
  const contactedLead     = contactedDrop        ? leads.find((l) => l.id === contactedDrop.leadId)        ?? null : null;
  const procurementLead   = procurementDrop      ? leads.find((l) => l.id === procurementDrop.leadId)      ?? null : null;
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
    if (targetColumn === "Allocation") {
      setProcurementDrop({ leadId, targetStatus: targetColumn });
      return;
    }
    if (targetColumn === "Qualified") {
      if (lead.procurementStatus !== "approved") {
        setShowProcurementBlock(true);
        return;
      }
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

  // ── Shared helper: build AllocationRecord and fire the callback ──────────────
  function buildAndFireAllocation(lead: Lead, products: ProductRow[], dueDate: string) {
    if (!onAllocationCreated) return null;

    const today = new Date();
    const createdDate = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const allocId  = `alloc-${Date.now()}`;
    const refNum   = `ALO-${10100 + Math.floor(Math.random() * 9000)}`;

    const allocProducts: AllocationProduct[] = products.map((p, idx) => {
      const basePrice = p.unitPrice ?? (10 + idx * 3);
      const catalogEntry = p.sku
        ? mockProducts.find((c) => c.sku === p.sku)
        : mockProducts.find((c) => c.productName.toLowerCase() === p.name.toLowerCase());
      const inv: InventoryItem = {
        sku:              p.sku ?? `SKU-${String(idx + 1).padStart(3, "0")}`,
        productName:      p.name,
        manufacturerName: "TBD",
        qtyAvailable:     catalogEntry?.qtyAvailable ?? 0,
        uom:              p.uom ?? catalogEntry?.uom ?? "Each",
        uomConversions:   "N/A",
        cost:  +(basePrice * 0.6).toFixed(2),
        price: +basePrice.toFixed(2),
      };
      return {
        sku:         inv.sku,
        productName: p.name,
        requiredQty: Number(p.quantity) || 0,
        inventory:   inv,
        tierPrices: [
          { rangeLabel: "1–50",    suggestedPrice: basePrice,                      userPrice: basePrice },
          { rangeLabel: "50–100",  suggestedPrice: +(basePrice * 0.95).toFixed(2), userPrice: +(basePrice * 0.95).toFixed(2) },
          { rangeLabel: "100–500", suggestedPrice: +(basePrice * 0.90).toFixed(2), userPrice: +(basePrice * 0.90).toFixed(2) },
          { rangeLabel: "500+",    suggestedPrice: +(basePrice * 0.85).toFixed(2), userPrice: +(basePrice * 0.85).toFixed(2) },
        ],
      };
    });

    const record: AllocationRecord = {
      id:             allocId,
      allocationRef:  refNum,
      leadId:         lead.id,
      contactName:    lead.contactName,
      companyName:    lead.companyName,
      email:          lead.email,
      phone:          lead.phone,
      location:       lead.location ?? "",
      businessType:   lead.businessType,
      leadSource:     lead.leadSource,
      leadPriority:   lead.priority,
      totalProducts:  products.length,
      ownerName:      lead.assignedTo,
      nextStepAction: `Follow-up on ${fmt(dueDate)}`,
      dueDate:        `${dueDate}T09:00:00`,
      status:         "Pending",
      createdDate,
      products:       allocProducts,
    };

    onAllocationCreated(record, lead.id);
    return allocId;
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

  /** Reuses the same AllocationModal + handleAllocationSave path as dragging to the Allocation column */
  function handleStartAllocationFromContacted() {
    if (!contactedDrop) return;
    const { leadId } = contactedDrop;
    setContactedDrop(null);
    setProcurementDrop({ leadId, targetStatus: "Allocation" });
  }

  function handleInactiveSave(result: InactiveModalResult) {
    if (!inactiveDrop) return;
    applyStatus(inactiveDrop.leadId, "Inactive", {
      reason:     result.reason ?? undefined,
      reasonNote: result.reasonNote ?? undefined,
    });
    setInactiveDrop(null);
  }

  function handleQualifiedSave(data: OpportunityData) {
    if (!qualifiedDrop) return;
    const lead = leads.find((l) => l.id === qualifiedDrop.leadId);
    if (!lead) return;

    applyStatus(qualifiedDrop.leadId, "Qualified", {
      opportunityData: data,
      callDue: `Follow-up due ${fmt(data.followUpDate)}`,
      priority: data.leadPriority,
    });

    const today = new Date();
    const createdDate = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}/${String(today.getFullYear()).slice(2)} ; ${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`;

    // Check if this lead already has a linked opportunity — update it instead of creating a new one
    const existingOpp = lead.opportunityId
      ? opportunities.find((o) => o.id === lead.opportunityId)
      : null;

    if (existingOpp && onOpportunityUpdated) {
      const updatedOpp: Opportunity = {
        ...existingOpp,
        opportunityName:  data.opportunityName,
        accountName:      data.accountName,
        businessType:     data.businessType,
        closingDate:      data.closingDate,
        contactName:      data.contactName,
        pipeline:         data.pipeline,
        expectedRevenue:  data.expectedRevenue,
        amount:           data.amount,
        campaignSource:   data.campaignSource,
        description:      data.description,
        leadPriority:     data.leadPriority,
      };
      onOpportunityUpdated(updatedOpp);
    } else if (onOpportunityCreated) {
      const newOpp: Opportunity = {
        id: `opp-${Date.now()}`,
        opportunityRef: `O-${10100 + Math.floor(Math.random() * 900)}`,
        opportunityName:  data.opportunityName,
        accountName:      data.accountName,
        businessType:     data.businessType,
        closingDate:      data.closingDate,
        contactName:      data.contactName,
        contactEmail:     lead.email,
        contactPhone:     lead.phone,
        pipeline:         data.pipeline,
        expectedRevenue:  data.expectedRevenue,
        amount:           data.amount,
        campaignSource:   data.campaignSource,
        description:      data.description,
        note:             lead.note,
        leadSource:       lead.leadSource,
        createdDate,
        leadPriority:     data.leadPriority,
        opportunityStage: "Qualified",
        assignedTo:       lead.opportunityOwner,
        companyName:      lead.companyName,
        leadId:           lead.id,
        allocationId:     lead.allocationId,
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

  function handleAllocationSave(result: AllocationModalResult) {
    if (!procurementDrop || !procurementLead) return;

    const allocId = buildAndFireAllocation(procurementLead, result.products, result.dueDate);

    applyStatus(procurementDrop.leadId, "Allocation", {
      procurementStatus:   "checking",
      callDue:             `Follow-up due ${fmt(result.dueDate)}`,
      procurementProducts: result.products,
      allocationId:        allocId ?? undefined,
    });

    setProcurementDrop(null);
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
          onStartAllocation={handleStartAllocationFromContacted}
        />
      )}

      {procurementDrop && procurementLead && (
        <AllocationModal
          leadName={procurementLead.contactName}
          onSave={handleAllocationSave}
          onCancel={() => setProcurementDrop(null)}
        />
      )}

      {qualifiedDrop && qualifiedLead && (
        <QualifiedModal
          leadName={qualifiedLead.contactName}
          defaultContactName={qualifiedLead.contactName}
          defaultAccountName={qualifiedLead.companyName}
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

      {showProcurementBlock && (
        <BlockedModal
          title="Allocation Approval Required"
          message="This lead must be approved by the Allocation team before it can be moved to the Qualified stage. Please wait for allocation approval first."
          onClose={() => setShowProcurementBlock(false)}
        />
      )}
    </>
  );
}

function fmt(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y.slice(2)}`;
}
