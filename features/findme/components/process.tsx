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
    <section
      id="workflow"
      className="space-y-10 rounded-[44px] border border-white/10 bg-[rgba(5,7,12,0.85)] px-6 py-12 text-white backdrop-blur-2xl md:px-12"
    >
      <div className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.5em] text-[#7F8CA8]">
          {copy.subtitle}
        </p>
        <h2 className="text-3xl font-semibold text-white md:text-4xl">
          {copy.title}
        </h2>
      </div>
      <ol className="mt-12 grid gap-6 md:grid-cols-2">
        {copy.steps.map((step, index) => (
          <li
            key={step.title}
            className="group relative overflow-hidden rounded-[32px] border border-white/12 bg-gradient-to-br from-white/5 via-[#070c16]/50 to-[#050812]/80 p-8"
          >
            <div className="absolute inset-px rounded-[28px] border border-white/5" />
            <div className="relative space-y-4">
              <div className="flex items-center gap-4 text-xl uppercase tracking-[0.25em] text-[#9FB2D7]">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-base font-semibold text-white">
                  {index + 1}
                </span>
                {step.title}
              </div>
              <p className="text-base text-[#C7D6F3]">{step.description}</p>
            </div>
            <div
              className="pointer-events-none absolute -right-6 top-6 h-24 w-24 rounded-full blur-[70px]"
              style={{
                background:
                  index % 3 === 0
                    ? "rgba(25,255,199,0.25)"
                    : index % 3 === 1
                    ? "rgba(0,174,239,0.25)"
                    : "rgba(155,79,255,0.25)",
              }}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
