type ProcessStep = {
  title: string;
  description: string;
};

export type ProcessCopy = {
  title: string;
  subtitle: string;
  steps: ProcessStep[];
};

export function FindMeProcess({ copy }: { copy: ProcessCopy }) {
  return (
    <section id="workflow" className="space-y-8">
      <div className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          {copy.subtitle}
        </p>
        <h2 className="text-3xl font-semibold">{copy.title}</h2>
      </div>
      <ol className="grid gap-4 md:grid-cols-2">
        {copy.steps.map((step, index) => (
          <li
            key={step.title}
            className="rounded-3xl border border-border/70 bg-background/90 p-6"
          >
            <div className="flex items-center gap-3 text-sm font-semibold text-primary">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/50 bg-primary/10 text-base">
                {index + 1}
              </span>
              <span>{step.title}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
