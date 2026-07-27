import Image from "next/image";
import type { ReactNode } from "react";
import {
  Archive,
  CalendarDays,
  FileText,
  ImagePlus,
  Newspaper,
  Pencil,
  Plus,
  Save,
  Tag,
} from "lucide-react";
import {
  archivePublicationAction,
  savePublicationAction,
} from "@/app/funcionarios/actions";
import { DocumentLink as Link } from "@/components/funcionarios/document-link";
import { PendingSubmitButton } from "@/components/funcionarios/pending-submit-button";
import type {
  ManagedPublication,
  PublicationStatus,
} from "@/services/publicacoes";

type PublicationsAdminViewProps = {
  publications: ManagedPublication[];
  canManage: boolean;
};

const statusLabels: Record<PublicationStatus, string> = {
  publicado: "Publicada",
  rascunho: "Rascunho",
  arquivado: "Arquivada",
};

export function PublicationsAdminView({
  publications,
  canManage,
}: PublicationsAdminViewProps) {
  if (!canManage) {
    return (
      <section className="panel publications-admin-empty">
        <span className="publication-empty-icon">
          <Newspaper size={24} aria-hidden="true" />
        </span>
        <h2>Notícias</h2>
        <p>Esta área é restrita à conta administradora do sistema.</p>
      </section>
    );
  }

  const published = publications.filter((item) => item.status === "publicado");
  const drafts = publications.filter((item) => item.status === "rascunho");
  const archived = publications.filter((item) => item.status === "arquivado");
  const orderedPublications = [...publications].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );

  return (
    <div className="publications-admin-shell">
      <section className="publications-admin-hero">
        <div>
          <span className="panel-kicker">
            <Newspaper size={16} aria-hidden="true" />
            Notícias do Portal
          </span>
          <h2>Crie e gerencie notícias da Vigilância</h2>
          <p>
            Publique comunicados, registros de eventos, capacitações e ações da
            rede socioassistencial com imagem, resumo e texto completo.
          </p>
        </div>
        <Link
          className="primary-action"
          href="/funcionarios?view=publications&modal=publication"
        >
          <Plus size={18} aria-hidden="true" />
          Nova notícia
        </Link>
      </section>

      <div className="publication-stats-grid" aria-label="Resumo das notícias">
        <PublicationStatCard
          icon={<Newspaper size={22} aria-hidden="true" />}
          label="Total"
          value={publications.length}
          note="notícias cadastradas"
          tone="blue"
        />
        <PublicationStatCard
          icon={<FileText size={22} aria-hidden="true" />}
          label="Publicadas"
          value={published.length}
          note="visíveis no Portal"
          tone="green"
        />
        <PublicationStatCard
          icon={<Pencil size={22} aria-hidden="true" />}
          label="Rascunhos"
          value={drafts.length}
          note="em preparação"
          tone="amber"
        />
        <PublicationStatCard
          icon={<Archive size={22} aria-hidden="true" />}
          label="Arquivadas"
          value={archived.length}
          note="fora do Portal"
          tone="red"
        />
      </div>

      <section className="panel publications-admin-panel">
        <div className="panel-heading publications-admin-heading">
          <div>
            <span className="panel-kicker">Notícias</span>
            <h2>Notícias cadastradas</h2>
            <span>
              Conteúdos manuais criados pela conta administradora para aparecer
              no Portal.
            </span>
          </div>
          <span className="publication-count-pill">
            {publications.length} registros
          </span>
        </div>

        {orderedPublications.length ? (
          <div className="publication-admin-list">
            {orderedPublications.map((publication) => (
              <PublicationAdminCard
                key={publication.slug}
                publication={publication}
              />
            ))}
          </div>
        ) : (
          <div className="publication-admin-empty-state">
            <span className="publication-empty-icon">
              <ImagePlus size={26} aria-hidden="true" />
            </span>
            <h3>Nenhuma notícia manual cadastrada</h3>
            <p>
              Clique em Nova notícia para criar o primeiro conteúdo do Portal.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function PublicationStatCard({
  icon,
  label,
  value,
  note,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  note: string;
  tone: "blue" | "green" | "amber" | "red";
}) {
  return (
    <article className={`publication-stat-card tone-${tone}`}>
      <span className="publication-stat-icon">{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}

function PublicationAdminCard({
  publication,
}: {
  publication: ManagedPublication;
}) {
  return (
    <article className="publication-admin-card">
      <div className="publication-admin-image">
        <Image
          src={publication.image}
          alt={publication.imageAlt}
          width={220}
          height={140}
          sizes="220px"
        />
      </div>
      <div className="publication-admin-content">
        <div className="publication-admin-meta">
          <span className={`publication-status status-${publication.status}`}>
            {statusLabels[publication.status]}
          </span>
          <span>
            <CalendarDays size={14} aria-hidden="true" />
            {formatPublicationDate(publication.date)}
          </span>
          <span>
            <Tag size={14} aria-hidden="true" />
            {publication.category}
          </span>
        </div>
        <h3>{publication.title}</h3>
        <p>{publication.excerpt}</p>
        <small>Atualizada em {formatDateTime(publication.updatedAt)}</small>
      </div>
      <div className="publication-admin-actions">
        <Link
          className="secondary-action"
          href={`/funcionarios?view=publications&modal=publication&publicationSlug=${publication.slug}`}
        >
          <Pencil size={16} aria-hidden="true" />
          Editar
        </Link>
        {publication.status !== "arquivado" ? (
          <Link
            className="danger-outline-action"
            href={`/funcionarios?view=publications&modal=archivePublication&publicationSlug=${publication.slug}`}
          >
            <Archive size={16} aria-hidden="true" />
            Arquivar
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function PublicationDialog({
  publication,
}: {
  publication: ManagedPublication | null;
}) {
  const title = publication ? "Editar notícia" : "Nova notícia";
  const description = publication
    ? "Atualize as informações da notícia selecionada."
    : "Preencha os dados para publicar uma notícia no Portal.";
  const status = publication?.status ?? "publicado";
  const body = publication?.body.join("\n\n") ?? "";
  const tags = publication?.tags.join(", ") ?? "";

  return (
    <dialog id="publicationDialog" className="modal publication-modal" open>
      <form action={savePublicationAction} encType="multipart/form-data">
        <input type="hidden" name="slug" value={publication?.slug ?? ""} />
        <input
          type="hidden"
          name="existing_image"
          value={publication?.image ?? ""}
        />

        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-title-icon">
              <Newspaper size={23} aria-hidden="true" />
            </span>
            <div>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
          </div>
          <Link
            id="closePublicationDialog"
            className="modal-close-button"
            href="/funcionarios?view=publications"
            aria-label="Fechar"
          >
            <span aria-hidden="true">x</span>
          </Link>
        </div>

        <div className="publication-modal-layout">
          <aside className="publication-modal-aside">
            <span className="publication-aside-icon">
              <ImagePlus size={28} aria-hidden="true" />
            </span>
            <h3>Conteúdo visual</h3>
            <p>
              Use uma foto clara e institucional. A imagem sera exibida nos
              cards e no modal de leitura do Portal.
            </p>
            <div className="publication-aside-note">
              <strong>Somente administrador</strong>
              <span>A criação de notícias fica restrita a este perfil.</span>
            </div>
          </aside>

          <div className="publication-form-stack">
            <fieldset className="publication-fieldset">
              <legend>
                <Newspaper size={16} aria-hidden="true" />
                Dados da notícia
              </legend>
              <div className="publication-form-grid two-columns">
                <label>
                  <span>Título *</span>
                  <input
                    name="title"
                    type="text"
                    defaultValue={publication?.title ?? ""}
                    placeholder="Digite o título da notícia"
                    required
                  />
                </label>
                <label>
                  <span>Data *</span>
                  <input
                    name="date"
                    type="date"
                    defaultValue={
                      publication?.date ?? new Date().toISOString().slice(0, 10)
                    }
                    required
                  />
                </label>
                <label>
                  <span>Categoria</span>
                  <input
                    name="category"
                    type="text"
                    defaultValue={publication?.category ?? "Institucional"}
                    placeholder="Institucional, Evento, Capacitação..."
                  />
                </label>
                <label>
                  <span>Status</span>
                  <select name="status" defaultValue={status}>
                    <option value="publicado">Publicada</option>
                    <option value="rascunho">Rascunho</option>
                    <option value="arquivado">Arquivada</option>
                  </select>
                </label>
              </div>
              <label className="publication-checkbox">
                <input
                  name="featured"
                  type="checkbox"
                  defaultChecked={Boolean(publication?.featured)}
                />
                <span>Marcar como destaque</span>
              </label>
            </fieldset>

            <fieldset className="publication-fieldset">
              <legend>
                <ImagePlus size={16} aria-hidden="true" />
                Imagem e fonte
              </legend>
              <div className="publication-form-grid two-columns">
                <label>
                  <span>Enviar imagem</span>
                  <input name="image_file" type="file" accept="image/*" />
                </label>
                <label>
                  <span>Ou informar URL da imagem</span>
                  <input
                    name="image_url"
                    type="url"
                    defaultValue={publication?.image ?? ""}
                    placeholder="https://..."
                  />
                </label>
                <label>
                  <span>Fonte</span>
                  <input
                    name="source_label"
                    type="text"
                    defaultValue={
                      publication?.sourceLabel ?? "Vigilancia Socioassistencial"
                    }
                    placeholder="Fonte da notícia"
                  />
                </label>
                <label>
                  <span>Link da fonte</span>
                  <input
                    name="source_url"
                    type="url"
                    defaultValue={publication?.sourceUrl ?? ""}
                    placeholder="https://..."
                  />
                </label>
              </div>
              <label>
                <span>Texto alternativo da imagem</span>
                <input
                  name="image_alt"
                  type="text"
                  defaultValue={publication?.imageAlt ?? ""}
                  placeholder="Descreva a imagem para acessibilidade"
                />
              </label>
            </fieldset>

            <fieldset className="publication-fieldset">
              <legend>
                <FileText size={16} aria-hidden="true" />
                Texto da notícia
              </legend>
              <label>
                <span>Resumo *</span>
                <textarea
                  name="excerpt"
                  defaultValue={publication?.excerpt ?? ""}
                  placeholder="Resumo curto que aparece no card da notícia"
                  rows={3}
                  required
                />
              </label>
              <label>
                <span>Corpo da notícia</span>
                <textarea
                  name="body"
                  defaultValue={body}
                  placeholder="Escreva o texto completo. Separe paragrafos com uma linha em branco."
                  rows={7}
                />
              </label>
              <label>
                <span>Tags</span>
                <input
                  name="tags"
                  type="text"
                  defaultValue={tags}
                  placeholder="CRAS, CREAS, Capacitação"
                />
              </label>
            </fieldset>
          </div>
        </div>

        <div className="form-actions publication-modal-actions">
          <Link className="secondary-action" href="/funcionarios?view=publications">
            Cancelar
          </Link>
          <PendingSubmitButton
            className="primary-action"
            pendingLabel="Salvando..."
          >
            <Save size={18} aria-hidden="true" />
            Salvar notícia
          </PendingSubmitButton>
        </div>
      </form>
    </dialog>
  );
}

export function ArchivePublicationDialog({
  publication,
}: {
  publication: ManagedPublication;
}) {
  return (
    <dialog className="modal confirm-modal" open>
      <form action={archivePublicationAction}>
        <input type="hidden" name="slug" value={publication.slug} />
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-title-icon danger">
              <Archive size={22} aria-hidden="true" />
            </span>
            <div>
              <h2>Arquivar notícia</h2>
              <p>
                A notícia deixará de aparecer no Portal, mas seguirá salva no
                histórico administrativo.
              </p>
            </div>
          </div>
          <Link
            className="modal-close-button"
            href="/funcionarios?view=publications"
            aria-label="Fechar"
          >
            <span aria-hidden="true">x</span>
          </Link>
        </div>

        <div className="access-confirm-card danger">
          <strong>{publication.title}</strong>
          <span>Esta ação pode ser revertida editando o status depois.</span>
        </div>

        <div className="form-actions">
          <Link className="secondary-action" href="/funcionarios?view=publications">
            Cancelar
          </Link>
          <PendingSubmitButton
            className="danger-submit-button"
            pendingLabel="Arquivando..."
          >
            <Archive size={18} aria-hidden="true" />
            Arquivar notícia
          </PendingSubmitButton>
        </div>
      </form>
    </dialog>
  );
}

function formatPublicationDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
