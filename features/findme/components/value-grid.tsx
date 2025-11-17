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
    <section className="space-y-8 rounded-[32px] border border-border/70 bg-background/80 p-8 backdrop-blur">
      <div className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          {copy.subtitle}
        </p>
        <h2 className="text-3xl font-semibold">{copy.title}</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {copy.items.map((item) => (
          <article
            key={item.title}
            className="rounded-3xl border border-border/70 bg-gradient-to-b from-background/90 to-background/30 p-6 shadow-[0_12px_45px_rgba(15,23,42,0.15)]"
          >
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {item.tag}
            </span>
            <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
