type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl";

  return (
    <div className={alignment}>
      <span className="inline-flex items-center rounded-full border border-[#00C896]/25 bg-[#00C896]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#00C896]">
        {eyebrow}
      </span>
      <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-white/70 sm:text-lg">{description}</p>
    </div>
  );
}
