"use client";

import { Button } from "./button";
import { HiArrowRight } from "react-icons/hi2";
import { Badge } from "./badge";
import { motion } from "framer-motion";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { LocaleLink } from "@/components/locale-link";
import { useTranslations, useLocale } from 'next-intl';

export const Hero = () => {
  const router = useRouter();
  const t = useTranslations('hero');
  const locale = useLocale();
  return (
    <div className="flex flex-col min-h-screen pt-20 md:pt-40 relative overflow-hidden">
      <motion.div
        initial={{
          y: 40,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          ease: "easeOut",
          duration: 0.5,
        }}
        className="flex justify-center"
      >
        <Badge onClick={() => router.push(`/${locale}/blog/top-5-llm-of-all-time`)}>
          {t('badge')}
        </Badge>
      </motion.div>
      <motion.h1
        initial={{
          y: 40,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          ease: "easeOut",
          duration: 0.5,
        }}
        className="text-2xl md:text-4xl lg:text-8xl font-semibold max-w-6xl mx-auto text-center mt-6 relative z-10"
      >
        {t('title')}
      </motion.h1>
      <motion.h2
        initial={{
          y: 40,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          ease: "easeOut",
          duration: 0.5,
          delay: 0.2,
        }}
        className="text-center mt-6 text-base md:text-xl text-muted-foreground max-w-3xl mx-auto relative z-10 font-normal"
      >
        {t('description')}
      </motion.h2>
      <motion.div
        initial={{
          y: 80,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          ease: "easeOut",
          duration: 0.5,
          delay: 0.4,
        }}
        className="flex items-center gap-4 justify-center mt-6 relative z-10"
      >
        <Button
          as={LocaleLink}
          href="https://docs.sistine.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('cta.primary')}
        </Button>
        <Button
          variant="simple"
          as="a"
          href="https://applysistine.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex space-x-2 items-center group"
        >
          <span>{t('cta.secondary')}</span>
          <HiArrowRight className="text-muted-foreground group-hover:translate-x-1 stroke-[1px] h-3 w-3 transition-transform duration-200" />
        </Button>
      </motion.div>
      <div className="p-4 border border-border bg-secondary rounded-[32px] mt-20 relative overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-40 w-full bg-gradient-to-b from-transparent via-background to-background scale-[1.1] pointer-events-none" />
        <div className="p-2 bg-background border border-border rounded-[24px]">
          <Image
            src="https://a.offerget.pro/starter/sample.png"
            alt="Product interface preview"
            width={1920}
            height={1080}
            className="rounded-[20px] dark:hidden"
            priority
          />
          <Image
            src="https://a.offerget.pro/starter/sampledark.png"
            alt="Product interface preview in dark mode"
            width={1920}
            height={1080}
            className="rounded-[20px] hidden dark:block"
            priority
          />
        </div>
      </div>
    </div>
  );
};
