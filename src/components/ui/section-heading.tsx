import { cn } from "@/lib/utils/cn";

type SectionHeadingProps = {
  as?: "h1" | "h2";
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
};

export function SectionHeading({
  as = "h2",
  eyebrow,
  title,
  description,
  centered = true,
  className,
}: SectionHeadingProps) {
  const HeadingTag = as;

  return (
    <div className={cn(centered && "text-center", className)}>
      {eyebrow ? (
        <p className="mb-2 text-xs font-bold uppercase text-[#00a67e]">{eyebrow}</p>
      ) : null}
      <div className={cn("flex items-center gap-4", centered && "justify-center")}>
        {centered ? <span className="hidden h-px w-16 bg-[#0a84ff] sm:block" /> : null}
        <HeadingTag className="text-2xl font-semibold tracking-[-0.02em] text-[#06285f] sm:text-3xl">
          {title}
        </HeadingTag>
        {centered ? <span className="hidden h-px w-16 bg-[#0a84ff] sm:block" /> : null}
      </div>
      {description ? (
        <p className={cn("mt-3 text-sm leading-6 text-[#60708a]", centered && "mx-auto max-w-2xl")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
