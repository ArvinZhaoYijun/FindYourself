import { Container } from "@/components/container";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n.config";
import { generatePageMetadata } from "@/lib/metadata";
import { FindMeHero } from "@/features/findme/components/hero";
import { FindMeProcess } from "@/features/findme/components/process";
import { FindMeLandingBackground } from "@/components/findme-landing-background";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "findme" });

  return generatePageMetadata({
    locale,
    path: "",
    title: t("hero.title"),
    description: t("hero.description"),
  });
}

export default async function Home({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const t = await getTranslations({ locale, namespace: "findme" });

  const heroCopy = {
    eyebrow: t("hero.eyebrow"),
    title: t("hero.title"),
    description: t("hero.description"),
    primaryCta: t("hero.primaryCta"),
    scenarios: [
      {
        icon: t("hero.scenarios.wedding.icon"),
        label: t("hero.scenarios.wedding.label"),
        description: t("hero.scenarios.wedding.description"),
      },
      {
        icon: t("hero.scenarios.graduation.icon"),
        label: t("hero.scenarios.graduation.label"),
        description: t("hero.scenarios.graduation.description"),
      },
      {
        icon: t("hero.scenarios.festival.icon"),
        label: t("hero.scenarios.festival.label"),
        description: t("hero.scenarios.festival.description"),
      },
    ],
  };

  const processCopy = {
    title: t("process.title"),
    subtitle: t("process.subtitle"),
    steps: [
      {
        title: t("process.steps.selfie.title"),
        description: t("process.steps.selfie.description"),
      },
      {
        title: t("process.steps.album.title"),
        description: t("process.steps.album.description"),
      },
      {
        title: t("process.steps.match.title"),
        description: t("process.steps.match.description"),
      },
      {
        title: t("process.steps.download.title"),
        description: t("process.steps.download.description"),
      },
    ],
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05060a] text-white">
      <FindMeLandingBackground />
      <div className="relative space-y-20 pb-20">
        <Container className="pt-32">
          <FindMeHero
            copy={heroCopy}
            primaryHref={`/${locale}/findme`}
          />
        </Container>
        <Container>
          <FindMeProcess copy={processCopy} />
        </Container>
      </div>
    </div>
  );
}
