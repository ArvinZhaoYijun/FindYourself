type ValueItem = {
  tag: string;
  title: string;
  description: string;
};

export type ValueCopy = {
  title: string;
  subtitle: string;
  items: ValueItem[];
};

export function FindMeValueGrid({ copy }: { copy: ValueCopy }) {
  return (
    <section className="space-y-10 rounded-[40px] border border-white/10 bg-[rgba(6,9,15,0.92)] px-6 py-10 text-white backdrop-blur-2xl md:px-12">
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.45em] text-[#7F8CA8]">
          {copy.subtitle}
        </p>
        <h2 className="text-3xl font-semibold text-white md:text-4xl">
          {copy.title}
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {copy.items.map((item, index) => (
          <article
            key={item.title}
            className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 text-left text-white transition hover:-translate-y-1 hover:border-[#19FFC7]/40"
          >
            <div className="absolute inset-px rounded-[24px] border border-white/5" />
            <span className="relative inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[11px] uppercase tracking-[0.4em] text-[#9FB2D7]">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background:
                    index % 3 === 0
                      ? "#19FFC7"
                      : index % 3 === 1
                      ? "#00AEEF"
                      : "#9B4FFF",
                }}
              />
              {item.tag}
            </span>
            <h3 className="relative mt-5 text-2xl font-semibold">
              {item.title}
            </h3>
            <p className="relative mt-3 text-sm text-[#C7D6F3]">
              {item.description}
            </p>
            <div
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-[60px]"
              style={{
                background:
                  index % 3 === 0
                    ? "rgba(25,255,199,0.25)"
                    : index % 3 === 1
                    ? "rgba(0,174,239,0.25)"
                    : "rgba(155,79,255,0.25)",
              }}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
