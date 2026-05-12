"use client";

import { useMemo, useState } from "react";
import { useTenantRouter } from "@/components/providers/TenantProvider";
import {
  IntakeFieldGrid,
  IntakeFormRow,
  IntakeSelectInput,
  IntakeTextInput,
  joinContactName,
  ORDER_METHOD_OPTIONS,
  W9_OPTIONS,
} from "@/components/customer-intake/intake-form-shared";
import {
  getOnboardingProgress,
  isOnboardingComplete,
  isStepValid,
} from "@/lib/customer-intake-onboarding";
import type { CustomerIntakeRecord } from "@/lib/mock-data/customer-intake";
import { upsertCustomerIntake } from "@/lib/mock-data/customer-intake";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

const STEPS = [
  { title: "Primary contact", hint: "Reach the right person" },
  { title: "Accounts payable", hint: "Billing contacts" },
  { title: "Address", hint: "Ship-to / primary location" },
  { title: "Ordering & compliance", hint: "How you buy and tax docs" },
] as const;

const ONBOARDING_MAX = "max-w-7xl w-full mx-auto";
const ONBOARDING_PAD = "px-6 sm:px-10 lg:px-14";
const ROW_WIDE =
  "gap-x-12 lg:gap-x-20 xl:gap-x-24 gap-y-7 items-start *:min-w-0";
const FIELD_WIDE =
  "grid-cols-[14rem_1fr] sm:grid-cols-[16rem_1fr] gap-x-5 lg:gap-x-6 items-start";
/** Width of one column in a 2-col row (matches ROW_WIDE gaps). */
const ONBOARDING_SINGLE_COL =
  "w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(50%-2.5rem)] xl:w-[calc(50%-3rem)]";

function canNavigateToStep(target: number, current: number, draft: CustomerIntakeRecord): boolean {
  if (target === current) return true;
  if (target < current) return true;
  for (let s = current; s < target; s += 1) {
    if (!isStepValid(s, draft)) return false;
  }
  return true;
}

interface CustomerIntakeOnboardingWizardProps {
  initialRecord: CustomerIntakeRecord;
}

export function CustomerIntakeOnboardingWizard({ initialRecord }: CustomerIntakeOnboardingWizardProps) {
  const router = useTenantRouter();
  const [draft, setDraft] = useState<CustomerIntakeRecord>(initialRecord);
  const [step, setStep] = useState(0);
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const progress = useMemo(() => getOnboardingProgress(draft), [draft]);
  const complete = useMemo(() => isOnboardingComplete(draft), [draft]);

  const sectionsLeft = useMemo(() => {
    let n = 0;
    for (let i = 0; i < STEPS.length; i += 1) {
      if (!isStepValid(i, draft)) n += 1;
    }
    return n;
  }, [draft]);

  const contactReadOnly = joinContactName(draft.primaryContactFirstName, draft.primaryContactLastName);

  function patch(partial: Partial<CustomerIntakeRecord>) {
    setDraft((d) => ({ ...d, ...partial }));
  }

  function handleStepClick(idx: number) {
    if (!canNavigateToStep(idx, step, draft)) {
      setAttemptedNext(true);
      return;
    }
    setAttemptedNext(false);
    setStep(idx);
  }

  function handleNext() {
    if (!isStepValid(step, draft)) {
      setAttemptedNext(true);
      return;
    }
    setAttemptedNext(false);
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  }

  function handleBack() {
    setAttemptedNext(false);
    setStep((s) => Math.max(0, s - 1));
  }

  function handleSubmit() {
    if (!isOnboardingComplete(draft)) return;
    setSubmitting(true);
    upsertCustomerIntake({
      ...draft,
      status: "Onboarding Complete",
      modifiedTime: new Date().toISOString(),
    });
    router.push(`/customer-intake/${draft.id}`);
  }

  const showStepError = attemptedNext && !isStepValid(step, draft);

  return (
    <div className="flex flex-col min-h-full pb-28">
      <div className="border-b border-slate-100 bg-white">
        <div className={`${ONBOARDING_MAX} ${ONBOARDING_PAD} pt-6 pb-4`}>
          <p className="text-sm text-slate-600 mb-1">
            {sectionsLeft === 0
              ? "All sections complete — you can submit when ready."
              : `Almost there — ${sectionsLeft} section${sectionsLeft === 1 ? "" : "s"} left to finish.`}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden min-w-0">
              <div
                className="h-full rounded-full bg-[#002f93] transition-all duration-500 ease-out"
                style={{
                  width: `${progress.percent}%`,
                  minWidth: progress.percent > 0 ? "4px" : undefined,
                }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-500 tabular-nums whitespace-nowrap flex-shrink-0">
              {progress.filled}/{progress.total}
            </span>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="py-5 bg-white border-b border-slate-100">
        <div className={`${ONBOARDING_MAX} ${ONBOARDING_PAD}`}>
          <div className="flex items-center w-full">
            {STEPS.map(({ title }, idx) => {
              const past = idx < step;
              const current = idx === step;
              const reachable = canNavigateToStep(idx, step, draft);
              return (
              <div key={title} className="flex items-stretch flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1 min-w-0 gap-2 w-full">
                  <div className="flex items-center w-full min-w-0">
                    <div
                      className={`flex-1 h-px ${idx === 0 ? "invisible" : past || current ? "bg-[#002f93]" : "bg-slate-200"}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleStepClick(idx)}
                      className={cn(
                        "w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#002f93]/30",
                        current
                          ? "bg-[#002f93] text-white ring-2 ring-[#002f93]/25"
                          : past && isStepValid(idx, draft)
                          ? "bg-[#002f93] text-white"
                          : past
                          ? "bg-[#002f93]/40 text-white"
                          : reachable
                          ? "bg-slate-200 text-slate-600 hover:bg-slate-300"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      {past && isStepValid(idx, draft) ? <Check size={14} strokeWidth={2.5} /> : idx + 1}
                    </button>
                    <div
                      className={`flex-1 h-px ${idx === STEPS.length - 1 ? "invisible" : past ? "bg-[#002f93]" : "bg-slate-200"}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStepClick(idx)}
                    className={cn(
                      "w-full flex justify-center text-center text-[10px] font-semibold leading-tight px-1 max-w-[100px] sm:max-w-[140px] md:max-w-none sm:text-xs",
                      current ? "text-[#002f93]" : reachable ? "text-slate-600 hover:text-[#002f93]" : "text-slate-400"
                    )}
                  >
                    {title}
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`flex-1 ${ONBOARDING_PAD} pb-6 pt-6 lg:pt-10 lg:pb-8`}>
        <div className={`${ONBOARDING_MAX} bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden`}>
          <div className={`bg-slate-50 border-b border-slate-100 ${ONBOARDING_PAD} py-4`}>
            <h2 className="text-base font-bold text-slate-800">{STEPS[step].title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{STEPS[step].hint}</p>
            {showStepError && (
              <p className="text-xs text-red-600 font-medium mt-2">Please complete all required fields in this section.</p>
            )}
          </div>

          <div className={`${ONBOARDING_PAD} py-8 space-y-6`}>
            {step === 0 && (
              <>
                <IntakeFormRow className={ROW_WIDE}>
                  <div className={`col-span-2 min-w-0 ${ONBOARDING_SINGLE_COL}`}>
                    <IntakeFieldGrid className={FIELD_WIDE} label="Full name">
                      <IntakeTextInput value={contactReadOnly} onChange={() => {}} disabled placeholder="" />
                    </IntakeFieldGrid>
                  </div>
                </IntakeFormRow>
                <IntakeFormRow className={ROW_WIDE}>
                  <IntakeFieldGrid className={FIELD_WIDE} label="Primary contact phone" required>
                    <IntakeTextInput
                      type="tel"
                      value={draft.primaryContactPhone}
                      onChange={(v) => patch({ primaryContactPhone: v })}
                      placeholder="(555) 000-0000"
                    />
                  </IntakeFieldGrid>
                  <IntakeFieldGrid className={FIELD_WIDE} label="Primary contact mobile">
                    <IntakeTextInput
                      type="tel"
                      value={draft.primaryContactMobile}
                      onChange={(v) => patch({ primaryContactMobile: v })}
                      placeholder="(555) 000-0000"
                    />
                  </IntakeFieldGrid>
                </IntakeFormRow>
              </>
            )}

            {step === 1 && (
              <>
                <IntakeFormRow className={ROW_WIDE}>
                  <IntakeFieldGrid className={FIELD_WIDE} label="Accounts payable first name" required>
                    <IntakeTextInput
                      value={draft.accountsPayableFirstName}
                      onChange={(v) => patch({ accountsPayableFirstName: v })}
                      placeholder="First name"
                    />
                  </IntakeFieldGrid>
                  <IntakeFieldGrid className={FIELD_WIDE} label="Accounts payable last name" required>
                    <IntakeTextInput
                      value={draft.accountsPayableLastName}
                      onChange={(v) => patch({ accountsPayableLastName: v })}
                      placeholder="Last name"
                    />
                  </IntakeFieldGrid>
                </IntakeFormRow>
                <IntakeFormRow className={ROW_WIDE}>
                  <IntakeFieldGrid className={FIELD_WIDE} label="Accounts payable email" required>
                    <IntakeTextInput
                      type="email"
                      value={draft.accountsPayableEmail}
                      onChange={(v) => patch({ accountsPayableEmail: v })}
                      placeholder="ap@example.com"
                      error={
                        showStepError && draft.accountsPayableEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.accountsPayableEmail)
                          ? "Valid email required"
                          : undefined
                      }
                    />
                  </IntakeFieldGrid>
                  <IntakeFieldGrid className={FIELD_WIDE} label="Accounts payable phone" required>
                    <IntakeTextInput
                      type="tel"
                      value={draft.accountsPayablePhone}
                      onChange={(v) => patch({ accountsPayablePhone: v })}
                      placeholder="(555) 000-0000"
                    />
                  </IntakeFieldGrid>
                </IntakeFormRow>
              </>
            )}

            {step === 2 && (
              <>
                <IntakeFormRow className={ROW_WIDE}>
                  <IntakeFieldGrid className={FIELD_WIDE} label="Street" required>
                    <IntakeTextInput
                      value={draft.primaryAddressStreet}
                      onChange={(v) => patch({ primaryAddressStreet: v })}
                      placeholder="123 Main St"
                    />
                  </IntakeFieldGrid>
                  <IntakeFieldGrid className={FIELD_WIDE} label="City" required>
                    <IntakeTextInput value={draft.primaryAddressCity} onChange={(v) => patch({ primaryAddressCity: v })} placeholder="City" />
                  </IntakeFieldGrid>
                </IntakeFormRow>
                <IntakeFormRow className={ROW_WIDE}>
                  <IntakeFieldGrid className={FIELD_WIDE} label="State" required>
                    <IntakeTextInput
                      value={draft.primaryAddressState}
                      onChange={(v) => patch({ primaryAddressState: v })}
                      placeholder="State"
                    />
                  </IntakeFieldGrid>
                  <IntakeFieldGrid className={FIELD_WIDE} label="ZIP code" required>
                    <IntakeTextInput
                      value={draft.primaryAddressZipCode}
                      onChange={(v) => patch({ primaryAddressZipCode: v })}
                      placeholder="00000"
                    />
                  </IntakeFieldGrid>
                </IntakeFormRow>
              </>
            )}

            {step === 3 && (
              <>
                <IntakeFormRow className={ROW_WIDE}>
                  <IntakeFieldGrid className={FIELD_WIDE} label="Order method preference" required>
                    <IntakeSelectInput
                      value={draft.orderMethodPreference}
                      onChange={(v) => patch({ orderMethodPreference: v })}
                      options={ORDER_METHOD_OPTIONS}
                    />
                  </IntakeFieldGrid>
                  <IntakeFieldGrid className={FIELD_WIDE} label="W9 or Tax Exempt" required>
                    <IntakeSelectInput value={draft.w9OrTaxExempt} onChange={(v) => patch({ w9OrTaxExempt: v })} options={W9_OPTIONS} />
                  </IntakeFieldGrid>
                </IntakeFormRow>
              </>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 0}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft size={16} />
                Back
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white bg-[#002f93] rounded-lg hover:bg-[#002070]"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              ) : (
                <span className="text-xs text-slate-400">Use the bar below to submit</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className={`${ONBOARDING_MAX} ${ONBOARDING_PAD} flex items-center justify-between gap-4`}>
          <p className="text-xs text-slate-500 hidden sm:block">
            {complete ? "Every required field is filled. Submit to mark onboarding complete." : "Complete all steps to enable submit."}
          </p>
          <button
            type="button"
            disabled={!complete || submitting}
            onClick={handleSubmit}
            className={cn(
              "ml-auto px-6 py-2.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap",
              complete && !submitting
                ? "bg-slate-900 text-white hover:bg-black"
                : "bg-slate-200 text-slate-500 cursor-not-allowed"
            )}
          >
            {submitting ? "Saving…" : "Submit onboarding"}
          </button>
        </div>
      </div>
    </div>
  );
}
