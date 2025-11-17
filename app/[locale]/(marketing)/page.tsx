import { Background } from "@/components/background";
import { Container } from "@/components/container";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n.config";
import { generatePageMetadata } from "@/lib/metadata";
import { FindMeHero } from "@/features/findme/components/hero";
import { FindMeValueGrid } from "@/features/findme/components/value-grid";
import { FindMeProcess } from "@/features/findme/components/process";

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
    secondaryCta: t("hero.secondaryCta"),
    panelTitle: t("hero.panel.title"),
    panelDescription: t("hero.panel.description"),
    panelItems: [
      t("hero.panel.items.selfie"),
      t("hero.panel.items.album"),
      t("hero.panel.items.zip"),
    ],
    metrics: [
      {
        label: t("hero.metrics.photos.label"),
        value: t("hero.metrics.photos.value"),
      },
      {
        label: t("hero.metrics.precision.label"),
        value: t("hero.metrics.precision.value"),
      },
      {
        label: t("hero.metrics.time.label"),
        value: t("hero.metrics.time.value"),
      },
    ],
  };

  const valueCopy = {
    title: t("values.title"),
    subtitle: t("values.subtitle"),
    items: [
      {
        tag: t("values.items.precision.tag"),
        title: t("values.items.precision.title"),
        description: t("values.items.precision.description"),
      },
      {
        tag: t("values.items.speed.tag"),
        title: t("values.items.speed.title"),
        description: t("values.items.speed.description"),
      },
      {
        tag: t("values.items.experience.tag"),
        title: t("values.items.experience.title"),
        description: t("values.items.experience.description"),
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
    <div className="relative">
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        <Background />
      </div>
      <div className="relative space-y-16 pb-24">
        <Container className="pt-24">
          <FindMeHero
            copy={heroCopy}
            primaryHref={`/${locale}/findme`}
            secondaryHref="#workflow"
          />
        </Container>
        <Container>
          <FindMeValueGrid copy={valueCopy} />
        </Container>
        <Container>
          <FindMeProcess copy={processCopy} />
        </Container>
      </div>
    </div>
  );
}
