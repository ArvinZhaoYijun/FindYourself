import { Badge } from "@/components/badge";
import { Button } from "@/components/button";

export type HeroMetric = {
  label: string;
  value: string;
};

export type HeroCopy = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  panelTitle: string;
  panelDescription: string;
  panelItems: string[];
  metrics: HeroMetric[];
};

export function FindMeHero({
  copy,
  primaryHref = "#findme-app",
  secondaryHref = "#workflow",
}: {
  copy: HeroCopy;
  primaryHref?: string;
  secondaryHref?: string;
}) {
  return (
    <section className="space-y-10">
      <div className="space-y-6 text-center lg:text-left">
        <div className="flex justify-center lg:justify-start">
          <Badge type="button" aria-hidden>
            {copy.eyebrow}
          </Badge>
        </div>
        <div className="space-y-6">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
            {copy.title}
          </h1>
          <p className="text-muted-foreground text-lg lg:text-xl">
            {copy.description}
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
          <Button as="a" href={primaryHref} className="w-full sm:w-auto">
            {copy.primaryCta}
          </Button>
          <Button
            variant="outline"
            as="a"
            href={secondaryHref}
            className="w-full sm:w-auto"
          >
            {copy.secondaryCta}
          </Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[3fr,2fr]">
        <div className="rounded-[28px] border border-border/70 bg-background/80 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.25)]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              {copy.panelTitle}
            </p>
            <p className="text-base text-muted-foreground">
              {copy.panelDescription}
            </p>
          </div>
          <ul className="mt-6 space-y-4">
            {copy.panelItems.map((item, index) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3"
              >
                <span className="text-xs font-semibold text-primary">
                  {index + 1 < 10 ? `0${index + 1}` : index + 1}
                </span>
                <span className="text-sm text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[28px] border border-border/70 bg-gradient-to-b from-background/80 to-secondary/20 p-6">
          <dl className="grid gap-6">
            {copy.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-border/60 bg-background/70 p-6"
              >
                <dt className="text-sm uppercase tracking-widest text-muted-foreground">
                  {metric.label}
                </dt>
                <dd className="text-4xl font-semibold mt-2">{metric.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
