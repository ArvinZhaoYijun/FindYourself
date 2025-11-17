import { Background } from "@/components/background";
import { Container } from "@/components/container";
import { FindMePlayground } from "@/features/findme/components/playground";
import type { Locale } from "@/i18n.config";
import { generatePageMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "findme" });

  return generatePageMetadata({
    locale,
    path: "/findme",
    title: t("playground.title"),
    description: t("hero.description"),
  });
}

export default async function FindMeAppPage({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const t = await getTranslations({ locale, namespace: "findme" });

  const statuses = [
    {
      title: t("playground.statuses.gather.title"),
      description: t("playground.statuses.gather.description"),
    },
    {
      title: t("playground.statuses.detect.title"),
      description: t("playground.statuses.detect.description"),
    },
    {
      title: t("playground.statuses.faceset.title"),
      description: t("playground.statuses.faceset.description"),
    },
    {
      title: t("playground.statuses.search.title"),
      description: t("playground.statuses.search.description"),
    },
    {
      title: t("playground.statuses.package.title"),
      description: t("playground.statuses.package.description"),
    },
  ];

  const mockResults = [
    {
      id: "stage",
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
      caption: t("playground.mockResults.stage.caption"),
      detail: t("playground.mockResults.stage.detail"),
      score: t("playground.mockResults.stage.score"),
    },
    {
      id: "crowd",
      image:
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
      caption: t("playground.mockResults.crowd.caption"),
      detail: t("playground.mockResults.crowd.detail"),
      score: t("playground.mockResults.crowd.score"),
    },
    {
      id: "afterparty",
      image:
        "https://images.unsplash.com/photo-1472652692800-915bbf4c4999?auto=format&fit=crop&w=800&q=80",
      caption: t("playground.mockResults.afterparty.caption"),
      detail: t("playground.mockResults.afterparty.detail"),
      score: t("playground.mockResults.afterparty.score"),
    },
  ];

  const playgroundCopy = {
    title: t("playground.title"),
    subtitle: t("playground.subtitle"),
    uploadLabel: t("playground.uploadLabel"),
    uploadHint: t("playground.uploadHint"),
    urlLabel: t("playground.urlLabel"),
    urlPlaceholder: t("playground.urlPlaceholder"),
    startButton: t("playground.startButton"),
    resetButton: t("playground.resetButton"),
    downloadCta: t("playground.downloadCta"),
    downloadHelp: t("playground.downloadHelp"),
    resultsTitle: t("playground.resultsTitle"),
    resultsEmpty: t("playground.resultsEmpty"),
    messages: {
      missingFields: t("playground.messages.missingFields"),
      invalidSelfie: t("playground.messages.invalidSelfie"),
      noResults: t("playground.messages.noResults"),
      ready: t("playground.messages.ready"),
      downloadReady: t("playground.messages.downloadReady"),
    },
    statuses,
    mockResults,
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        <Background />
      </div>
      <div className="relative space-y-12 pb-16">
        <Container className="pt-24 text-center space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            {t("playground.subtitle")}
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold">
            {t("playground.title")}
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto">
            {t("hero.description")}
          </p>
        </Container>
        <Container className="pb-10">
          <FindMePlayground copy={playgroundCopy} />
        </Container>
      </div>
    </div>
  );
}
