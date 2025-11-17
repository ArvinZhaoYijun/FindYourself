import { SignupForm } from "@/features/auth/components/signup-form";
import { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import type { Locale } from "@/i18n.config";

export async function generateMetadata({
  params
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'seo' });

  return {
    title: t('signup.title'),
    description: t('signup.description'),
    openGraph: {
      images: [t('signup.ogImage')],
    },
  };
}

export default function SignupPage() {
  return <SignupForm />;
}
