"use client";
import React from "react";
import { Logo } from "./Logo";
import { useTranslations } from 'next-intl';
import { LocaleLink } from './locale-link';
import { NewsletterInline } from './newsletter-inline';

export const Footer = () => {
  const t = useTranslations();
  
  const links = [
    {
      name: t('navigation.main.pricing'),
      href: "/pricing",
    },
    {
      name: t('navigation.main.blog'),
      href: "/blog",
    },
    {
      name: t('navigation.main.contact'),
      href: "/contact",
    },
  ];
  const legal = [
    {
      name: t('navigation.footer.legal.terms'),
      href: "/terms",
    },
    {
      name: t('navigation.footer.legal.privacy'),
      href: "/privacy",
    },
    {
      name: t('navigation.footer.legal.cookies'),
      href: "/cookies",
    },
    {
      name: t('navigation.footer.legal.refund'),
      href: "/refund",
    },
  ];
  const socials = [
    {
      name: t('footer.social.twitter'),
      href: "https://x.com/bourneliu66",
      external: true,
    },
    {
      name: t('footer.social.github'),
      href: "https://github.com/Idea-To-Business/sistine-starter-vibe-to-production",
      external: true,
    },
  ];
  return (
    <footer className="border-t border-white/10 bg-[rgba(5,7,12,0.95)] px-6 py-16 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 md:flex-row md:justify-between">
        <div className="space-y-4 text-sm text-white/70">
          <Logo />
          <div>{t("common.brand.copyright")}</div>
          <div>{t("common.brand.allRightsReserved")}</div>
          <div className="pt-4">
            <NewsletterInline />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm text-white/60 md:grid-cols-3">
          <div className="space-y-3">
            {links.map((link) => (
              <LocaleLink
                key={link.name}
                className="transition-colors hover:text-white"
                href={link.href}
              >
                {link.name}
              </LocaleLink>
            ))}
          </div>
          <div className="space-y-3">
            {legal.map((link) => (
              <LocaleLink
                key={link.name}
                className="transition-colors hover:text-white"
                href={link.href}
              >
                {link.name}
              </LocaleLink>
            ))}
          </div>
          <div className="space-y-3">
            {socials.map((link) => (
              <a
                key={link.name}
                className="transition-colors hover:text-white"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
