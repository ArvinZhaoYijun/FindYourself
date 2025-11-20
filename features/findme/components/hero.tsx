import { cn } from "@/lib/utils";
import { Spotlight } from "@/components/ui/spotlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Button as MovingButton } from "@/components/ui/moving-border";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Heart, GraduationCap, Camera, LucideIcon, Sparkles, Scan } from "lucide-react";

export type HeroScenario = {
  iconType: "wedding" | "graduation" | "festival";
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
    <section className="relative z-10 space-y-16 pt-10 md:pt-20">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="#19FFC7"
      />
      <div className="space-y-12 text-center relative">
        <div className="space-y-8">
          <NeonBadge text={copy.eyebrow} />
          <div className="mx-auto max-w-5xl space-y-6">
            <TextGenerateEffect
              words={copy.title}
              className="text-center text-4xl font-semibold leading-tight tracking-[0.02em] text-white md:text-5xl lg:text-[64px] lg:leading-[1.15]"
            />
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-[#C5D8EE] md:text-xl">
              {copy.description}
            </p>
          </div>
          <div className="flex justify-center">
            <MovingButton
              borderRadius="9999px"
              className="bg-white text-black text-lg font-bold hover:bg-slate-100 transition-colors"
              containerClassName="w-64 h-16"
              duration={3000}
              as="a"
              href={primaryHref}
            >
              {copy.primaryCta}
            </MovingButton>
          </div>
        </div>
        <div className="mt-20">
          <HeroScenarios scenarios={copy.scenarios} />
        </div>
      </div>
    </section>
  );
}

const HeroScenarios = ({ scenarios }: { scenarios: HeroScenario[] }) => {
  return (
    <BentoGrid className="max-w-5xl mx-auto md:auto-rows-[20rem]">
      {scenarios.map((scenario, index) => (
        <BentoGridItem
          key={index}
          title={<span className="text-white font-semibold">{scenario.label}</span>}
          description={<span className="text-neutral-400 text-sm">{scenario.description}</span>}
          header={<ScenarioHeader index={index} iconType={scenario.iconType} />}
          className={cn("md:col-span-1 bg-white/5 border-white/10 shadow-none")}
        />
      ))}
    </BentoGrid>
  );
};

const getIconComponent = (iconType: "wedding" | "graduation" | "festival"): LucideIcon => {
  switch (iconType) {
    case "wedding":
      return Heart;
    case "graduation":
      return GraduationCap;
    case "festival":
      return Camera;
  }
};

const getColorClass = (index: number) => {
  switch (index) {
    case 0:
      return "bg-cyan-400";
    case 1:
      return "bg-emerald-400";
    case 2:
      return "bg-fuchsia-500";
    default:
      return "bg-cyan-400";
  }
};

const ScenarioHeader = ({ index, iconType }: { index: number; iconType: "wedding" | "graduation" | "festival" }) => {
  const IconComponent = getIconComponent(iconType);

  return (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 relative overflow-hidden border border-white/10 group-hover/bento:border-white/20 transition">
      <div className="absolute inset-0 bg-[url('/noise.webp')] opacity-20 mix-blend-overlay"></div>
      <div
        className={cn(
          "absolute inset-0 opacity-50",
          getColorClass(index)
        )}
        style={{
          filter: "blur(60px)",
          transform: "translateY(30%) scale(1.5)",
        }}
      />
      <div className="relative z-10 p-6 flex items-center justify-center w-full h-full">
        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-[inset_0_2px_8px_rgba(255,255,255,0.1)] transform transition-all duration-500 group-hover/bento:scale-110 group-hover/bento:bg-white/15">
          <IconComponent
            className="w-10 h-10 text-white"
            strokeWidth={1.5}
            style={{
              filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))"
            }}
          />
        </div>
      </div>
    </div>
  );
};

const NeonBadge = ({ text }: { text: string }) => {
  return (
    <div className="inline-flex items-center justify-center">
      <div className="group relative">
        {/* 外层发光效果 */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400 opacity-75 blur-lg group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>

        {/* 主容器 */}
        <div className="relative flex items-center gap-3 rounded-full border-2 border-transparent bg-gradient-to-r from-cyan-400/20 via-fuchsia-500/20 to-cyan-400/20 px-6 py-2.5 backdrop-blur-xl">
          {/* 边框渐变效果 */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400 opacity-50 animate-[spin_3s_linear_infinite]"
               style={{
                 mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                 WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                 maskComposite: 'exclude',
                 WebkitMaskComposite: 'xor',
                 padding: '2px'
               }}
          ></div>

          {/* 左侧 AI 图标 */}
          <div className="relative">
            <Sparkles
              className="w-4 h-4 text-cyan-400 animate-pulse"
              strokeWidth={2}
              style={{
                filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.8))"
              }}
            />
          </div>

          {/* 文字内容 */}
          <span
            className="relative text-xs font-bold uppercase tracking-[0.3em] bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent animate-gradient"
            style={{
              backgroundSize: "200% auto"
            }}
          >
            {text}
          </span>

          {/* 右侧扫描图标 */}
          <div className="relative">
            <Scan
              className="w-4 h-4 text-fuchsia-400 animate-pulse"
              strokeWidth={2}
              style={{
                filter: "drop-shadow(0 0 8px rgba(217, 70, 239, 0.8))",
                animationDelay: "0.5s"
              }}
            />
          </div>

          {/* 内部微光点 */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-1 h-1 rounded-full bg-cyan-300 animate-ping opacity-75"></div>
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-1 h-1 rounded-full bg-fuchsia-300 animate-ping opacity-75" style={{ animationDelay: "1s" }}></div>
        </div>
      </div>
    </div>
  );
};
