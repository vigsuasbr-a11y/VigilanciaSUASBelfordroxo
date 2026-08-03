"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Home,
  UsersRound,
} from "lucide-react";

import { CompletionBadge } from "@/monitoramento/components/competencies/completion-badge";
import { IndicatorGroupStep } from "@/monitoramento/components/competencies/indicator-group-step";
import { NavigationButtons } from "@/monitoramento/components/competencies/navigation-buttons";
import { ProgressHeader } from "@/monitoramento/components/competencies/progress-header";
import {
  SummaryCard,
  type SummaryGroup,
} from "@/monitoramento/components/competencies/summary-card";
import { Badge } from "@/monitoramento/components/ui/badge";
import {
  saveGroupObservationAction,
  saveIndicatorValueAction,
  saveSpecialFieldValueAction,
  submitCompetencyReviewAction,
} from "@/monitoramento/features/competencies/actions";
import type {
  CompetencyWizardData,
  FieldDraft,
  FieldMessage,
  ReviewSubmitResult,
  SaveState,
  SpecialFieldDefinition,
} from "@/monitoramento/features/competencies/wizard/types";
import {
  buildRelationshipMessages,
  calculateCompletionStats,
  draftFromValue,
  emptyDraft,
  formatSavedTime,
  groupState,
  groupStepLabel,
  validateIndicatorDraft,
  validateSpecialDraft,
  validationResultsToMessages,
} from "@/monitoramento/features/competencies/wizard/utils";
import type { Indicator, IndicatorGroup } from "@/monitoramento/types/domain";

const AUTOSAVE_DELAY_MS = 1800;
const EDITABLE_STATUSES = new Set([
  "draft",
  "in_progress",
  "returned_for_correction",
  "reopened",
]);

export function CompetencyWizard({
  data,
  canEdit,
  canSubmit,
}: {
  data: CompetencyWizardData;
  canEdit: boolean;
  canSubmit: boolean;
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [indicatorDrafts, setIndicatorDrafts] = useState<
    Record<string, FieldDraft>
  >(() =>
    Object.fromEntries(
      data.indicators.map((indicator) => [
        indicator.id,
        draftFromValue(
          data.indicatorValues.find(
            (value) => value.indicator_id === indicator.id,
          ),
        ),
      ]),
    ),
  );
  const [specialDrafts, setSpecialDrafts] = useState<
    Record<string, FieldDraft>
  >(() =>
    Object.fromEntries(
      data.specialFieldDefinitions.map((definition) => [
        definition.id,
        draftFromValue(
          data.specialFieldValues.find(
            (value) => value.special_field_definition_id === definition.id,
          ),
        ),
      ]),
    ),
  );
  const [observations, setObservations] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      data.groups.map((group) => [
        group.id,
        data.groupObservations.find(
          (observation) => observation.indicator_group_id === group.id,
        )?.text ?? "",
      ]),
    ),
  );
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const [savedAt, setSavedAt] = useState<Record<string, string | null>>(() => ({
    ...Object.fromEntries(
      data.indicatorValues.map((value) => [
        value.indicator_id,
        formatSavedTime(value.updated_at),
      ]),
    ),
    ...Object.fromEntries(
      data.specialFieldValues.map((value) => [
        value.special_field_definition_id,
        formatSavedTime(value.updated_at),
      ]),
    ),
    ...Object.fromEntries(
      data.groupObservations.map((observation) => [
        observation.indicator_group_id,
        formatSavedTime(observation.updated_at),
      ]),
    ),
  }));
  const [reviewComment, setReviewComment] = useState("");
  const [warningJustification, setWarningJustification] = useState("");
  const [reviewResult, setReviewResult] = useState<ReviewSubmitResult | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const canEditFields =
    canEdit && EDITABLE_STATUSES.has(data.competency.status);
  const canSubmitCompetency =
    canSubmit && EDITABLE_STATUSES.has(data.competency.status);

  const indicatorsByGroup = useMemo(
    () => groupBy(data.indicators, (indicator) => indicator.group_id),
    [data.indicators],
  );
  const specialFieldsByGroup = useMemo(
    () =>
      groupBy(
        data.specialFieldDefinitions,
        (definition) => definition.group_id,
      ),
    [data.specialFieldDefinitions],
  );
  const latestReturnDate =
    data.reviewHistory.find(
      (review) => review.action === "returned_for_correction",
    )?.created_at ?? null;

  const allMessages = useMemo(() => {
    const messages: FieldMessage[] = [];

    for (const indicator of data.indicators) {
      messages.push(
        ...validateIndicatorDraft(
          indicator,
          indicatorDrafts[indicator.id] ?? emptyDraft(),
        ),
      );
    }

    for (const definition of data.specialFieldDefinitions) {
      messages.push(
        ...validateSpecialDraft({
          id: definition.id,
          label: definition.label,
          dataType: definition.proposed_data_type,
          required: false,
          draft: specialDrafts[definition.id] ?? emptyDraft(),
        }),
      );
    }

    messages.push(
      ...buildRelationshipMessages(
        data.relationships,
        data.indicators,
        indicatorDrafts,
      ),
    );
    messages.push(...validationResultsToMessages(data.validationResults));

    if (latestReturnDate) {
      const returnedAt = new Date(latestReturnDate).getTime();

      for (const value of data.indicatorValues) {
        if (new Date(value.updated_at).getTime() > returnedAt) {
          messages.push({
            severity: "information",
            message: "Campo alterado após devolução da revisão.",
            code: "changed_after_return",
            indicatorId: value.indicator_id,
          });
        }
      }
    }

    return messages;
  }, [
    data.indicators,
    data.indicatorValues,
    data.relationships,
    data.specialFieldDefinitions,
    data.validationResults,
    indicatorDrafts,
    latestReturnDate,
    specialDrafts,
  ]);

  const messagesById = useMemo(() => {
    const grouped: Record<string, FieldMessage[]> = {};

    for (const message of allMessages) {
      if (!message.indicatorId) {
        continue;
      }

      grouped[message.indicatorId] = [
        ...(grouped[message.indicatorId] ?? []),
        message,
      ];
    }

    return grouped;
  }, [allMessages]);

  const totalStats = useMemo(
    () => calculateCompletionStats(data.indicators, indicatorDrafts),
    [data.indicators, indicatorDrafts],
  );
  const groupSummaries = useMemo<SummaryGroup[]>(
    () =>
      data.groups.map((group) => {
        const indicators = indicatorsByGroup[group.id] ?? [];
        const stats = calculateCompletionStats(indicators, indicatorDrafts);
        const messages = messagesForGroup(
          group,
          indicators,
          specialFieldsByGroup[group.id] ?? [],
          messagesById,
        );

        return {
          id: group.id,
          label: groupStepLabel(group.display_order, group.name),
          total: stats.total,
          filled: stats.informed + stats.notApplicable,
          percent: stats.percent,
          errors: messages.filter((message) => message.severity === "error")
            .length,
          warnings: messages.filter((message) => message.severity === "warning")
            .length,
        };
      }),
    [
      data.groups,
      indicatorDrafts,
      indicatorsByGroup,
      messagesById,
      specialFieldsByGroup,
    ],
  );
  const observationsFilled = Object.values(observations).filter(
    (text) => text.trim().length > 0,
  ).length;
  const saveStateValues = Object.values(saveStates);
  const saveSummary = saveStateValues.includes("saving")
    ? "saving"
    : saveStateValues.includes("dirty")
      ? "dirty"
      : saveStateValues.includes("error")
        ? "error"
        : "saved";
  const lastSavedLabel =
    Object.values(savedAt).find((value) => value && value !== "Nunca salvo") ??
    null;

  const currentGroup = data.groups[currentStep] ?? null;
  const isSummaryStep = currentStep >= data.groups.length;
  const currentObservationDefinition = currentGroup
    ? data.observationDefinitions.find(
        (definition) => definition.group_id === currentGroup.id,
      )
    : undefined;

  function setFieldSaveState(id: string, state: SaveState): void {
    setSaveStates((current) => ({ ...current, [id]: state }));
  }

  function setFieldSavedAt(id: string, value: string): void {
    setSavedAt((current) => ({ ...current, [id]: formatSavedTime(value) }));
  }

  function queueSave(id: string, callback: () => Promise<void>): void {
    if (!canEditFields) {
      return;
    }

    clearTimeout(timersRef.current[id]);
    timersRef.current[id] = setTimeout(() => {
      void callback();
    }, AUTOSAVE_DELAY_MS);
  }

  function handleIndicatorChange(
    indicator: Indicator,
    draft: FieldDraft,
  ): void {
    setIndicatorDrafts((current) => ({ ...current, [indicator.id]: draft }));
    setFieldSaveState(indicator.id, "dirty");
    queueSave(indicator.id, () => commitIndicator(indicator, draft));
  }

  async function commitIndicator(
    indicator: Indicator,
    draft = indicatorDrafts[indicator.id] ?? emptyDraft(),
  ): Promise<void> {
    if (
      !canEditFields ||
      hasBlockingSaveError(validateIndicatorDraft(indicator, draft), draft)
    ) {
      setFieldSaveState(indicator.id, "error");
      return;
    }

    clearTimeout(timersRef.current[indicator.id]);
    setFieldSaveState(indicator.id, "saving");
    const result = await saveIndicatorValueAction({
      competencyId: data.competency.id,
      indicatorId: indicator.id,
      valueStatus: draft.valueStatus,
      numericValue:
        draft.valueStatus === "informed" ? draft.numericValue : null,
      textValue: draft.valueStatus === "informed" ? draft.textValue : null,
    });

    if (result.ok) {
      setFieldSavedAt(indicator.id, result.savedAt);
      setFieldSaveState(indicator.id, "saved");
      return;
    }

    setReviewResult({
      ok: false,
      status: "error",
      message: result.message,
      issues: result.issues,
    });
    setFieldSaveState(indicator.id, "error");
  }

  function handleSpecialChange(
    definition: SpecialFieldDefinition,
    draft: FieldDraft,
  ): void {
    setSpecialDrafts((current) => ({ ...current, [definition.id]: draft }));
    setFieldSaveState(definition.id, "dirty");
    queueSave(definition.id, () => commitSpecial(definition, draft));
  }

  async function commitSpecial(
    definition: SpecialFieldDefinition,
    draft = specialDrafts[definition.id] ?? emptyDraft(),
  ): Promise<void> {
    if (
      !canEditFields ||
      hasBlockingSaveError(
        validateSpecialDraft({
          id: definition.id,
          label: definition.label,
          dataType: definition.proposed_data_type,
          required: false,
          draft,
        }),
        draft,
      )
    ) {
      setFieldSaveState(definition.id, "error");
      return;
    }

    clearTimeout(timersRef.current[definition.id]);
    setFieldSaveState(definition.id, "saving");
    const result = await saveSpecialFieldValueAction({
      competencyId: data.competency.id,
      specialFieldDefinitionId: definition.id,
      valueStatus: draft.valueStatus,
      numericValue:
        draft.valueStatus === "informed" ? draft.numericValue : null,
      textValue: draft.valueStatus === "informed" ? draft.textValue : null,
    });

    if (result.ok) {
      setFieldSavedAt(definition.id, result.savedAt);
      setFieldSaveState(definition.id, "saved");
      return;
    }

    setReviewResult({
      ok: false,
      status: "error",
      message: result.message,
      issues: result.issues,
    });
    setFieldSaveState(definition.id, "error");
  }

  function handleObservationChange(group: IndicatorGroup, text: string): void {
    setObservations((current) => ({ ...current, [group.id]: text }));
    setFieldSaveState(group.id, "dirty");
    queueSave(group.id, () => commitObservation(group, text));
  }

  async function commitObservation(
    group: IndicatorGroup,
    text = observations[group.id] ?? "",
  ): Promise<void> {
    if (!canEditFields) {
      return;
    }

    clearTimeout(timersRef.current[group.id]);
    setFieldSaveState(group.id, "saving");
    const result = await saveGroupObservationAction({
      competencyId: data.competency.id,
      groupId: group.id,
      text,
    });

    if (result.ok) {
      setFieldSavedAt(group.id, result.savedAt);
      setFieldSaveState(group.id, "saved");
      return;
    }

    setReviewResult({
      ok: false,
      status: "error",
      message: result.message,
      issues: result.issues,
    });
    setFieldSaveState(group.id, "error");
  }

  async function saveCurrentStep(): Promise<void> {
    if (!canEditFields || !currentGroup) {
      return;
    }

    const indicators = indicatorsByGroup[currentGroup.id] ?? [];
    const specialFields = specialFieldsByGroup[currentGroup.id] ?? [];

    await Promise.all([
      ...indicators
        .filter(
          (indicator) =>
            saveStates[indicator.id] === "dirty" ||
            saveStates[indicator.id] === "error",
        )
        .map((indicator) => commitIndicator(indicator)),
      ...specialFields
        .filter(
          (definition) =>
            saveStates[definition.id] === "dirty" ||
            saveStates[definition.id] === "error",
        )
        .map((definition) => commitSpecial(definition)),
      saveStates[currentGroup.id] === "dirty" ||
      saveStates[currentGroup.id] === "error"
        ? commitObservation(currentGroup)
        : Promise.resolve(),
    ]);
  }

  async function saveAllDirty(): Promise<void> {
    if (!canEditFields) {
      return;
    }

    await Promise.all([
      ...data.indicators
        .filter((indicator) => saveStates[indicator.id] === "dirty")
        .map((indicator) => commitIndicator(indicator)),
      ...data.specialFieldDefinitions
        .filter((definition) => saveStates[definition.id] === "dirty")
        .map((definition) => commitSpecial(definition)),
      ...data.groups
        .filter((group) => saveStates[group.id] === "dirty")
        .map((group) => commitObservation(group)),
    ]);
  }

  async function handleSubmitReview(): Promise<void> {
    if (!canSubmitCompetency || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    await saveAllDirty();
    const result = await submitCompetencyReviewAction({
      competencyId: data.competency.id,
      comment: reviewComment,
      warningJustification,
    });
    setReviewResult(result);
    setIsSubmitting(false);

    if (result.ok) {
      router.refresh();
    }
  }

  const errorCount = allMessages.filter(
    (message) => message.severity === "error",
  ).length;
  const warningCount = allMessages.filter(
    (message) => message.severity === "warning",
  ).length;

  return (
    <div className="space-y-5 pb-24 lg:pb-6">
      {data.groups.length !== 13 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          O catálogo retornou {data.groups.length} grupos ativos. A versão
          homologada esperada possui 13 grupos.
        </p>
      ) : null}

      {!canEditFields ? (
        <p className="rounded-lg border border-blue-100 bg-white px-4 py-3 text-sm font-medium text-muted-foreground shadow-sm">
          Esta competência está em modo de leitura para seu papel ou status
          atual.
        </p>
      ) : null}

      {data.competency.status === "returned_for_correction" ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 shadow-sm">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Competência devolvida para correção
          </div>
          {data.reviewHistory.find(
            (review) => review.action === "returned_for_correction",
          )?.comment ? (
            <p className="mt-2 whitespace-pre-wrap">
              {
                data.reviewHistory.find(
                  (review) => review.action === "returned_for_correction",
                )?.comment
              }
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface-card rounded-[18px] shadow-[var(--shadow-panel)]">
            <div className="h-1.5 bg-[linear-gradient(90deg,#0066CC,#003D7A,#FF9800)]" />
            <div className="relative z-10 flex items-center justify-between gap-2 border-b border-blue-100 bg-white/72 px-5 py-4 backdrop-blur">
              <div className="flex items-center gap-2">
                <span className="icon-surface flex h-9 w-9 items-center justify-center rounded-[12px] text-blue-700">
                  <ClipboardList className="h-4 w-4" aria-hidden="true" />
                </span>
                <h2 className="text-base font-semibold text-blue-950">
                  Etapas da Competência
                </h2>
              </div>
              <Badge tone="info">
                {currentStep + 1 > data.groups.length
                  ? "Final"
                  : `${currentStep + 1}/${data.groups.length}`}
              </Badge>
            </div>
            <div className="relative z-10 grid max-h-[calc(100vh-220px)] gap-2 overflow-auto p-4">
              {data.groups.map((group, index) => {
                const indicators = indicatorsByGroup[group.id] ?? [];
                const stats = calculateCompletionStats(
                  indicators,
                  indicatorDrafts,
                );
                const messages = messagesForGroup(
                  group,
                  indicators,
                  specialFieldsByGroup[group.id] ?? [],
                  messagesById,
                );
                const state = groupState(stats, messages);
                const StepIcon = stepIconForIndex(index);

                return (
                  <button
                    className={`grid min-h-16 w-full grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] border px-3 py-3 text-left text-sm transition duration-200 ease-out hover:-translate-y-0.5 ${
                      currentStep === index
                        ? "border-blue-200 bg-blue-50/85 text-blue-950 shadow-[0_12px_26px_rgba(0,102,204,0.12)]"
                        : "border-transparent bg-white/78 hover:border-blue-100 hover:bg-blue-50/60"
                    }`}
                    key={group.id}
                    onClick={() => setCurrentStep(index)}
                    type="button"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-[13px] transition ${currentStep === index ? "bg-white text-blue-700 shadow-sm" : "bg-slate-50 text-blue-500"}`}
                    >
                      <StepIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {groupStepLabel(group.display_order, group.name)}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {stats.informed + stats.notApplicable} / {stats.total}{" "}
                        indicadores
                        {messages.filter(
                          (message) => message.severity === "error",
                        ).length > 0
                          ? ` / ${messages.filter((message) => message.severity === "error").length} erros`
                          : ""}
                      </span>
                    </span>
                    <CompletionBadge state={state} />
                  </button>
                );
              })}
              <button
                className={`mt-2 grid min-h-16 w-full grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] border px-3 py-3 text-left text-sm transition duration-200 ease-out hover:-translate-y-0.5 ${
                  isSummaryStep
                    ? "border-blue-200 bg-blue-50/85 text-blue-950 shadow-sm"
                    : "border-blue-100 bg-white/78 hover:bg-blue-50/50"
                }`}
                onClick={() => setCurrentStep(data.groups.length)}
                type="button"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-[13px] ${isSummaryStep ? "bg-white text-blue-700 shadow-sm" : "bg-slate-50 text-blue-500"}`}
                >
                  <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="font-semibold">Revisão Final</span>
                {errorCount === 0 ? (
                  <CheckCircle2
                    className="h-4 w-4 text-emerald-700"
                    aria-hidden="true"
                  />
                ) : (
                  <AlertTriangle
                    className="h-4 w-4 text-red-700"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-5">
          <ProgressHeader
            competency={data.competency}
            currentGroup={currentGroup}
            currentStep={currentStep}
            errors={errorCount}
            isSummaryStep={isSummaryStep}
            stats={totalStats}
            totalGroups={data.groups.length}
            warnings={warningCount}
          />

          {isSummaryStep ? (
            <SummaryCard
              canEditReviewText={canSubmitCompetency}
              comment={reviewComment}
              groups={groupSummaries}
              messages={allMessages}
              observationsFilled={observationsFilled}
              observationsTotal={data.groups.length}
              onCommentChange={setReviewComment}
              onWarningJustificationChange={setWarningJustification}
              reviewHistory={data.reviewHistory}
              reviewResult={reviewResult}
              specialDrafts={specialDrafts}
              specialFieldDefinitions={data.specialFieldDefinitions}
              stats={totalStats}
              warningJustification={warningJustification}
            />
          ) : currentGroup ? (
            <IndicatorGroupStep
              disabled={!canEditFields}
              group={currentGroup}
              indicatorDrafts={indicatorDrafts}
              indicators={indicatorsByGroup[currentGroup.id] ?? []}
              messagesById={messagesById}
              observationDefinition={currentObservationDefinition}
              observationSavedAt={savedAt[currentGroup.id]}
              observationSaveState={saveStates[currentGroup.id] ?? "idle"}
              observationText={observations[currentGroup.id] ?? ""}
              onIndicatorBlur={(indicator) => void commitIndicator(indicator)}
              onIndicatorChange={handleIndicatorChange}
              onObservationBlur={(group) => void commitObservation(group)}
              onObservationChange={handleObservationChange}
              onSpecialBlur={(definition) => void commitSpecial(definition)}
              onSpecialChange={handleSpecialChange}
              savedAtById={savedAt}
              saveStateById={saveStates}
              specialDrafts={specialDrafts}
              specialFieldDefinitions={
                specialFieldsByGroup[currentGroup.id] ?? []
              }
            />
          ) : null}

          <NavigationButtons
            canEdit={canEditFields}
            canSubmit={canSubmitCompetency && !isSubmitting}
            isFirst={currentStep === 0}
            isLast={isSummaryStep}
            lastSavedLabel={lastSavedLabel}
            onNext={() =>
              setCurrentStep((step) => Math.min(step + 1, data.groups.length))
            }
            onPrevious={() => setCurrentStep((step) => Math.max(step - 1, 0))}
            onSave={() => void saveCurrentStep()}
            onSubmit={() => void handleSubmitReview()}
            saveSummary={saveSummary}
            stats={totalStats}
          />
        </main>
      </div>
    </div>
  );
}

function groupBy<T>(
  items: T[],
  getKey: (item: T) => string,
): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((accumulator, item) => {
    const key = getKey(item);
    accumulator[key] = [...(accumulator[key] ?? []), item];
    return accumulator;
  }, {});
}

function messagesForGroup(
  group: IndicatorGroup,
  indicators: Indicator[],
  specialFields: SpecialFieldDefinition[],
  messagesById: Record<string, FieldMessage[]>,
): FieldMessage[] {
  return [
    ...indicators.flatMap((indicator) => messagesById[indicator.id] ?? []),
    ...specialFields.flatMap((definition) => messagesById[definition.id] ?? []),
  ].filter((message) => {
    if (!message.indicatorId) {
      return false;
    }

    return (
      indicators.some((indicator) => indicator.id === message.indicatorId) ||
      specialFields.some((field) => field.id === message.indicatorId) ||
      group.id === message.indicatorId
    );
  });
}

function hasBlockingSaveError(
  messages: FieldMessage[],
  draft: FieldDraft,
): boolean {
  return messages.some(
    (message) =>
      message.severity === "error" &&
      !(message.code === "required" && draft.valueStatus === "not_informed"),
  );
}

function stepIconForIndex(index: number): typeof ClipboardList {
  const icons = [UsersRound, Home, ClipboardList, FileText, ClipboardCheck];

  return icons[index % icons.length];
}
