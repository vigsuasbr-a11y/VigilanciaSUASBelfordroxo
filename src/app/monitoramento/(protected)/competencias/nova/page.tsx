import { AppIcon } from "@/monitoramento/components/ui/app-icon";
import { Button } from "@/monitoramento/components/ui/button";
import {
  DataTable,
  dataTableCellClass,
  dataTableHeaderClass,
  dataTableRowClass,
} from "@/monitoramento/components/ui/data-table";
import { PageContainer } from "@/monitoramento/components/ui/page-container";
import { PageHeader } from "@/monitoramento/components/ui/page-header";
import { SectionCard } from "@/monitoramento/components/ui/section-card";
import { StatusBadge } from "@/monitoramento/components/ui/status-badge";
import { openOrCreateCompetencyAction } from "@/monitoramento/features/competencies/actions";
import { requireActiveSession } from "@/monitoramento/lib/auth/session";
import { MONTH_LABELS } from "@/monitoramento/lib/format";
import { serviceTypeLabel } from "@/monitoramento/lib/service-types";
import { getCompetencyLookups } from "@/monitoramento/services/competencies";

type NewCompetencyProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const errors = new Map<string, string>([
  ["dados-invalidos", "Confira unidade, mês, ano e versão do formulário."],
  [
    "ambiente-nao-configurado",
    "Configuração de acesso pendente para abrir competências.",
  ],
  [
    "competencia-duplicada-ou-sem-permissao",
    "A competência já existe ou sua sessão não tem permissão para criá-la.",
  ],
  [
    "sem-permissao-ou-consulta",
    "Não foi possível localizar a competência com as permissões atuais.",
  ],
  [
    "unidade-formulario-incompativeis",
    "A unidade selecionada não pertence ao mesmo setor da versão de formulário.",
  ],
  [
    "formulario-inativo-ou-em-revisao",
    "O formulário selecionado ainda não está ativo para abertura de competências.",
  ],
]);

const fieldControlClass =
  "mt-1 h-11 w-full rounded-[var(--radius-md)] border border-blue-100 bg-white px-3 text-sm shadow-sm transition hover:border-blue-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export default async function NewCompetencyPage({
  searchParams,
}: NewCompetencyProps) {
  await requireActiveSession();

  const params = (await searchParams) ?? {};
  const error =
    typeof params.erro === "string" ? errors.get(params.erro) : null;
  const lookups = await getCompetencyLookups();
  const selectedUnitId = stringParam(params.unit_id) ?? "";
  const selectedFormVersionId = stringParam(params.form_version_id) ?? "";
  const currentYear =
    numberParam(params.reference_year) ?? new Date().getFullYear();
  const selectedMonth =
    numberParam(params.reference_month) ?? new Date().getMonth() + 1;
  const unavailableServiceTypes = [
    ...new Set(lookups.unavailableUnits.map((unit) => unit.unit_type)),
  ];

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        description="Escolha unidade, ano, mês e versão do formulário. Se a competência já existir, ela será aberta; caso contrário, será criada."
        eyebrow="Fluxo mensal"
        icon="calendar"
        title="Abrir competência mensal"
      />

      {error ? (
        <section className="flex items-center gap-2 rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
          <AppIcon name="alert" size="sm" />
          {error}
        </section>
      ) : null}

      {unavailableServiceTypes.length > 0 ? (
        <section className="rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-amber-900">
              Em revisão:
            </span>
            {unavailableServiceTypes.map((serviceType) => (
              <StatusBadge key={serviceType} icon="review" tone="warning">
                {serviceTypeLabel(serviceType)}
              </StatusBadge>
            ))}
          </div>
        </section>
      ) : null}

      <SectionCard
        description="Esses dados definem qual unidade preencherá o formulário no período escolhido."
        icon="calendar"
        title="Dados da competência"
      >
        <form action={openOrCreateCompetencyAction} className="space-y-4">
          <label className="block text-sm font-bold text-slate-800">
            Unidade ou serviço
            <select
              className={fieldControlClass}
              defaultValue={selectedUnitId}
              name="unit_id"
              required
            >
              <option value="">Selecione</option>
              {lookups.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.full_name} - {serviceTypeLabel(unit.unit_type)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-bold text-slate-800">
            Versão do formulário
            <select
              className={fieldControlClass}
              defaultValue={selectedFormVersionId}
              name="form_version_id"
              required
            >
              <option value="">Selecione</option>
              {lookups.formVersions.map((formVersion) => (
                <option key={formVersion.id} value={formVersion.id}>
                  {formVersion.name} (
                  {serviceTypeLabel(formVersion.service_type)})
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-slate-800">
              Ano
              <input
                className={fieldControlClass}
                defaultValue={currentYear}
                max={2100}
                min={2000}
                name="reference_year"
                required
                type="number"
              />
            </label>

            <label className="block text-sm font-bold text-slate-800">
              Mês
              <select
                className={fieldControlClass}
                defaultValue={selectedMonth}
                name="reference_month"
                required
              >
                {MONTH_LABELS.map((label, index) => (
                  <option key={label} value={index + 1}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="pt-1">
            <Button type="submit">
              <AppIcon name="open" size="sm" />
              Abrir preenchimento
            </Button>
          </div>
        </form>
      </SectionCard>

      {lookups.draftFormVersions.length > 0 ? (
        <DataTable minWidth="min-w-[760px]">
          <thead className={dataTableHeaderClass}>
            <tr>
              <th className={dataTableCellClass}>Setor</th>
              <th className={dataTableCellClass}>Formulário</th>
              <th className={dataTableCellClass}>Status</th>
            </tr>
          </thead>
          <tbody>
            {lookups.draftFormVersions.map((formVersion) => (
              <tr className={dataTableRowClass} key={formVersion.id}>
                <td className={dataTableCellClass}>
                  {serviceTypeLabel(formVersion.service_type)}
                </td>
                <td className={dataTableCellClass}>
                  <p className="font-bold text-blue-950">{formVersion.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Identificador interno:{" "}
                    <span className="font-mono">{formVersion.code}</span>
                  </p>
                </td>
                <td className={dataTableCellClass}>
                  <StatusBadge icon="review" tone="warning">
                    Rascunho
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      ) : null}
    </PageContainer>
  );
}

function stringParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function numberParam(value: string | string[] | undefined): number | undefined {
  const parsed = Number(stringParam(value));
  return Number.isFinite(parsed) ? parsed : undefined;
}
