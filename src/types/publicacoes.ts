export type PublicationNews = {
  slug: string;
  title: string;
  date: string;
  category: string;
  sourceLabel: string;
  sourceUrl?: string;
  image: string;
  imageAlt: string;
  excerpt: string;
  body: string[];
  tags: string[];
  featured?: boolean;
};
