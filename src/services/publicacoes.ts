import { publicationCategories, publicationNews } from "@/data/publicacoes";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PublicationNews } from "@/types/publicacoes";

export type PublicationStatus = "rascunho" | "publicado" | "arquivado";

export type ManagedPublication = PublicationNews & {
  status: PublicationStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
};

export type PublicationInput = {
  body: string[];
  category: string;
  date: string;
  excerpt: string;
  featured: boolean;
  image: string;
  imageAlt: string;
  originalSlug?: string;
  sourceLabel: string;
  sourceUrl?: string;
  status: PublicationStatus;
  tags: string[];
  title: string;
  userId: string;
};

const publicationsBucket = "portal-publicacoes";
const publicationsIndexPath = "news.json";

export async function getPortalPublicationNews() {
  const managed = await readManagedPublications();
  const published = managed.filter((item) => item.status === "publicado");
  const bySlug = new Map<string, PublicationNews>();

  for (const item of publicationNews) {
    bySlug.set(item.slug, item);
  }

  for (const item of published) {
    bySlug.set(item.slug, toPublicationNews(item));
  }

  const news = Array.from(bySlug.values()).sort(sortNewsByDate);
  return {
    categories: buildPublicationCategories(news),
    news,
  };
}

export async function getManagedPublications() {
  return readManagedPublications();
}

export async function saveManagedPublication(input: PublicationInput) {
  const now = new Date().toISOString();
  const records = await readManagedPublications({ ensureBucket: true });
  const originalSlug = input.originalSlug?.trim();
  const existingIndex = originalSlug
    ? records.findIndex((item) => item.slug === originalSlug)
    : -1;
  const existing = existingIndex >= 0 ? records[existingIndex] : null;
  const slug = createUniqueSlug(
    input.title,
    records.map((item) => item.slug),
    originalSlug,
  );

  const record: ManagedPublication = {
    slug,
    title: input.title,
    date: input.date,
    category: input.category,
    sourceLabel: input.sourceLabel,
    sourceUrl: input.sourceUrl || undefined,
    image: input.image,
    imageAlt: input.imageAlt,
    excerpt: input.excerpt,
    body: input.body,
    tags: input.tags,
    featured: input.featured,
    status: input.status,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    createdBy: existing?.createdBy ?? input.userId,
    updatedBy: input.userId,
  };

  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.unshift(record);
  }

  await writeManagedPublications(records);
  return record;
}

export async function archiveManagedPublication(slug: string, userId: string) {
  const records = await readManagedPublications({ ensureBucket: true });
  const index = records.findIndex((item) => item.slug === slug);

  if (index < 0) return false;

  records[index] = {
    ...records[index],
    status: "arquivado",
    updatedAt: new Date().toISOString(),
    updatedBy: userId,
  };

  await writeManagedPublications(records);
  return true;
}

export async function uploadPublicationImage(file: File, slugBase: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Supabase administrativo não configurado.");

  await ensurePublicationsBucket();

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const fileName = `${slugify(slugBase)}-${Date.now()}.${extension}`;
  const path = `images/${fileName}`;
  const { error } = await admin.storage.from(publicationsBucket).upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });

  if (error) throw error;

  const { data } = admin.storage.from(publicationsBucket).getPublicUrl(path);
  return data.publicUrl;
}

export function getPublicationBySlug(publications: ManagedPublication[], slug: string) {
  return publications.find((item) => item.slug === slug) ?? null;
}

export function normalizePublicationStatus(value: string | null | undefined): PublicationStatus {
  return value === "publicado" || value === "arquivado" ? value : "rascunho";
}

export function slugify(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "publicacao";
}

async function readManagedPublications(options: { ensureBucket?: boolean } = {}) {
  const admin = createSupabaseAdminClient();
  if (!admin) return [];

  if (options.ensureBucket) {
    await ensurePublicationsBucket();
  }

  const { data, error } = await admin.storage
    .from(publicationsBucket)
    .download(publicationsIndexPath);

  if (error || !data) {
    return [];
  }

  try {
    const parsed = JSON.parse(await data.text()) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeManagedPublication).filter(Boolean) as ManagedPublication[];
  } catch {
    return [];
  }
}

async function writeManagedPublications(records: ManagedPublication[]) {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Supabase administrativo não configurado.");

  await ensurePublicationsBucket();

  const payload = new Blob([JSON.stringify(records, null, 2)], {
    type: "application/json",
  });

  const { error } = await admin.storage
    .from(publicationsBucket)
    .upload(publicationsIndexPath, payload, {
      contentType: "application/json",
      upsert: true,
    });

  if (error) throw error;
}

async function ensurePublicationsBucket() {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Supabase administrativo não configurado.");

  const { data: buckets } = await admin.storage.listBuckets();
  const bucket = buckets?.find((item) => item.name === publicationsBucket);

  if (!bucket) {
    const { error } = await admin.storage.createBucket(publicationsBucket, {
      public: true,
    });
    if (error) throw error;
    return;
  }

  if (!bucket.public) {
    await admin.storage.updateBucket(publicationsBucket, { public: true });
  }
}

function normalizeManagedPublication(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<ManagedPublication>;
  const title = cleanText(item.title);
  const excerpt = cleanText(item.excerpt);
  const image = cleanText(item.image);

  if (!title || !excerpt || !image) return null;

  return {
    slug: slugify(item.slug || title),
    title,
    date: cleanDate(item.date),
    category: cleanText(item.category) || "Institucional",
    sourceLabel: cleanText(item.sourceLabel) || "Vigilância Socioassistencial",
    sourceUrl: cleanText(item.sourceUrl) || undefined,
    image,
    imageAlt: cleanText(item.imageAlt) || title,
    excerpt,
    body: Array.isArray(item.body)
      ? item.body.map(cleanText).filter(Boolean)
      : [excerpt],
    tags: Array.isArray(item.tags) ? item.tags.map(cleanText).filter(Boolean) : [],
    featured: Boolean(item.featured),
    status: normalizePublicationStatus(item.status),
    createdAt: cleanText(item.createdAt) || new Date().toISOString(),
    updatedAt: cleanText(item.updatedAt) || new Date().toISOString(),
    createdBy: cleanText(item.createdBy) || null,
    updatedBy: cleanText(item.updatedBy) || null,
  };
}

function toPublicationNews(item: ManagedPublication): PublicationNews {
  return {
    slug: item.slug,
    title: item.title,
    date: item.date,
    category: item.category,
    sourceLabel: item.sourceLabel,
    sourceUrl: item.sourceUrl,
    image: item.image,
    imageAlt: item.imageAlt,
    excerpt: item.excerpt,
    body: item.body,
    tags: item.tags,
    featured: item.featured,
  };
}

function createUniqueSlug(title: string, slugs: string[], originalSlug?: string) {
  const base = slugify(title);
  const existing = new Set(slugs.filter((slug) => slug !== originalSlug));
  let slug = base;
  let index = 2;

  while (existing.has(slug)) {
    slug = `${base}-${index}`;
    index += 1;
  }

  return slug;
}

function buildPublicationCategories(news: PublicationNews[]) {
  const categories = new Set(publicationCategories);

  for (const item of news) {
    categories.add(item.category);
    for (const tag of item.tags) {
      categories.add(tag);
    }
  }

  return ["Todas", ...Array.from(categories).filter((item) => item !== "Todas").sort((a, b) => a.localeCompare(b, "pt-BR"))];
}

function sortNewsByDate(a: PublicationNews, b: PublicationNews) {
  return b.date.localeCompare(a.date) || a.title.localeCompare(b.title, "pt-BR");
}

function cleanText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function cleanDate(value: unknown) {
  const text = cleanText(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(text)
    ? text
    : new Date().toISOString().slice(0, 10);
}
