import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

export type HeroScenario = {
  icon: string;
  label: string;
  description: string;
};

export type HeroCopy = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  scenarios: HeroScenario[];
};

export function FindMeHero({
  copy,
  primaryHref = "#findme-app",
}: {
  copy: HeroCopy;
  primaryHref?: string;
}) {
  return (
    <section className="relative z-10 space-y-16">
      <HeroAurora />
      <div className="space-y-12 text-center">
        <div className="space-y-8">
          <span className="inline-flex items-center justify-center gap-3 rounded-full border border-white/15 bg-white/5 px-6 py-2 text-[11px] uppercase tracking-[0.5em] text-slate-200/80 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#19FFC7] shadow-[0_0_12px_rgba(25,255,199,0.9)]" />
            {copy.eyebrow}
          </span>
          <div className="mx-auto max-w-4xl space-y-6">
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-[0.02em] text-white md:text-5xl lg:text-[56px] lg:leading-[1.15]">
              {copy.title}
            </h1>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-[#C5D8EE] md:text-xl">
              {copy.description}
            </p>
          </div>
          <div className="flex justify-center">
            <a
              href={primaryHref}
              style={{ color: '#05101A' }}
              className="inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-base font-semibold shadow-[0_20px_60px_rgba(255,255,255,0.3)] transition-all duration-300 ease-out hover:scale-[1.08] hover:shadow-[0_25px_70px_rgba(255,255,255,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:px-12 md:py-5 md:text-lg"
            >
              {copy.primaryCta}
            </a>
          </div>
        </div>
        <div className="mt-20">
          <HeroScenarios scenarios={copy.scenarios} />
        </div>
      </div>
    </section>
  );
}

const HeroAurora = () => (
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute -left-10 top-8 h-52 w-52 rounded-full bg-[#00AEEF]/25 blur-[120px]" />
    <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#9B4FFF]/25 blur-[160px]" />
    <div className="absolute inset-x-0 top-1/2 h-80 bg-[radial-gradient(circle_at_center,_rgba(25,255,199,0.12),_transparent_65%)]" />
  </div>
);

const HeroScenarios = ({ scenarios }: { scenarios: HeroScenario[] }) => {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
      {scenarios.map((scenario, index) => (
        <div
          key={scenario.label}
          className="group relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 text-center backdrop-blur transition hover:border-white/20"
        >
          <div className="relative space-y-4">
            <div className="text-5xl">{scenario.icon}</div>
            <h3 className="text-xl font-semibold text-white">{scenario.label}</h3>
            <p className="text-sm leading-relaxed text-[#C5D8EE]">
              {scenario.description}
            </p>
          </div>
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full blur-[80px] transition group-hover:blur-[100px]"
            style={{
              background:
                index % 3 === 0
                  ? "rgba(25,255,199,0.2)"
                  : index % 3 === 1
                  ? "rgba(0,174,239,0.2)"
                  : "rgba(155,79,255,0.2)",
            }}
          />
        </div>
      ))}
    </div>
  );
};
