import { FindMeLandingBackground } from "@/components/findme-landing-background";
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

  const playgroundCopy = {
    title: t("playground.title"),
    subtitle: t("playground.subtitle"),
    uploadLabel: t("playground.uploadLabel"),
    uploadHint: t("playground.uploadHint"),
    urlLabel: t("playground.urlLabel"),
    urlPlaceholder: t("playground.urlPlaceholder"),
    startButton: t("playground.startButton"),
    resetButton: t("playground.resetButton"),
    resultsTitle: t("playground.resultsTitle"),
    resultsEmpty: t("playground.resultsEmpty"),
    resultsHelp: t("playground.resultsHelp"),
    cardDownloadCta: t("playground.cardDownloadCta"),
    messages: {
      missingFields: t("playground.messages.missingFields"),
      invalidSelfie: t("playground.messages.invalidSelfie"),
      noResults: t("playground.messages.noResults"),
      ready: t("playground.messages.ready"),
      downloadReady: t("playground.messages.downloadReady"),
      fileTooLarge: t("playground.messages.fileTooLarge"),
    },
    statuses,
    localToggleLabel: t("playground.localToggleLabel"),
    localToggleDescription: t("playground.localToggleDescription"),
    albumUploadCta: t("playground.albumUploadCta"),
    albumSelectedLabel: t("playground.albumSelectedLabel"),
    albumClearCta: t("playground.albumClearCta"),
    urlDisabled: t("playground.urlDisabled"),
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05060a] text-white">
      <FindMeLandingBackground />
      <div className="relative pb-20">
        <Container className="pt-32 pb-10">
          <FindMePlayground copy={playgroundCopy} />
        </Container>
      </div>
    </div>
  );
}
