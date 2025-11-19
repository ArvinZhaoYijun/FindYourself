"use client";

import { useState } from "react";

import { useMotionValueEvent, useScroll, motion, AnimatePresence } from "framer-motion";
import { IoIosClose, IoIosMenu } from "react-icons/io";
import { Link } from "next-view-transitions";
import { ChevronRight, MessageSquare, Image as ImageIcon, Video } from "lucide-react";

import { Button } from "@/components/button";
import { Logo } from "@/components/Logo";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from 'next-intl';
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/features/navigation/types";
import { marketingNavigationKeys, appNavigationKeys } from "@/features/navigation/config";

const iconMap = {
  MessageSquare: MessageSquare,
  Image: ImageIcon,
  Video: Video,
};

export const MobileNavbar = () => {
  const [open, setOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const session = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('navigation.main');
  const tCommon = useTranslations('common.actions');

  const { scrollY } = useScroll();

  const [showBackground, setShowBackground] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    if (value > 100) {
      setShowBackground(true);
    } else {
      setShowBackground(false);
    }
  });

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between rounded-full border border-white/10 bg-[rgba(5,7,12,0.85)] px-4 py-2 text-white transition duration-200",
        showBackground && "bg-[rgba(5,7,12,0.95)] shadow-[0_20px_80px_rgba(5,7,12,0.6)]"
      )}
    >
      <Logo />
      <IoIosMenu
        className="h-6 w-6 cursor-pointer text-white"
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col items-start justify-start bg-[#05060a] pt-4 text-xl text-white transition duration-200">
          <div className="flex w-full items-center justify-between border-b border-white/10 px-5 pb-4">
            <Logo />
            <div className="flex items-center gap-2">
              <ModeToggle />
              <button
                onClick={() => setOpen(!open)}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
              >
                <IoIosClose className="h-7 w-7 text-white" />
              </button>
            </div>
          </div>
          <div className="flex w-full flex-1 flex-col items-start justify-start gap-3 overflow-y-auto px-6 py-6">
            {marketingNavigationKeys.map((navItem) => (
              <div key={navItem.key} className="w-full">
                {navItem.subItems ? (
                  <>
                    <button
                      onClick={() => {
                        setExpandedItems(prev =>
                          prev.includes(navItem.key)
                            ? prev.filter(item => item !== navItem.key)
                            : [...prev, navItem.key]
                        );
                      }}
                      className="group flex w-full items-center justify-between gap-3 py-2"
                    >
                      <span className="text-xl font-semibold text-white">
                        {t(navItem.key)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white/70">
                          {navItem.subItems.length}
                        </span>
                        <ChevronRight
                          className={cn(
                            "h-5 w-5 text-white/60 transition-transform duration-200",
                            expandedItems.includes(navItem.key) && "rotate-90"
                          )}
                        />
                      </div>
                    </button>
                    <AnimatePresence>
                      {expandedItems.includes(navItem.key) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="ml-1 mt-2 space-y-0.5 rounded-2xl border border-white/10 bg-white/5 p-2">
                            {navItem.subItems.map((subItem, index) => {
                              const IconComponent = subItem.icon ? iconMap[subItem.icon as keyof typeof iconMap] : null;
                              return (
                                <motion.div
                                  key={subItem.key}
                                  initial={{ x: -8, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: index * 0.04, duration: 0.15 }}
                                >
                                  <Link
                                    href={`/${locale}${subItem.href}`}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-150 hover:bg-white/10 active:scale-[0.98]"
                                  >
                                    {IconComponent && (
                                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 shadow-sm">
                                        <IconComponent className="h-4.5 w-4.5 text-white" />
                                      </div>
                                    )}
                                    <span className="text-[15px] font-medium text-white">
                                      {t(subItem.key)}
                                    </span>
                                  </Link>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={`/${locale}${navItem.href}`}
                    onClick={() => setOpen(false)}
                    className="relative block w-full py-2 transition-opacity hover:opacity-70"
                  >
                    <span className="block text-xl font-semibold text-white">
                      {t(navItem.key)}
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </div>
          <div className="flex w-full flex-col items-start gap-4 border-t border-white/10 bg-white/5 px-6 py-5 backdrop-blur-lg">
            <div className="w-full">
              <LanguageSwitcher />
            </div>
            {session.data?.user ? (
              <>
                <div className="flex w-full flex-col gap-2">
                  <div className="mb-2 border-b border-white/10 pb-3">
                    <p className="text-[15px] font-semibold text-white">
                      {session.data.user.name || session.data.user.email}
                    </p>
                    {session.data.user.name && (
                      <p className="mt-1 text-sm text-white/70">
                        {session.data.user.email}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/${locale}/dashboard`}
                    onClick={() => setOpen(false)}
                    className="py-2 text-[15px] font-medium text-white/70 transition-colors hover:text-white"
                  >
                    {t('dashboard')}
                  </Link>
                  <Link
                    href={`/${locale}/profile`}
                    onClick={() => setOpen(false)}
                    className="py-2 text-[15px] font-medium text-white/70 transition-colors hover:text-white"
                  >
                    {t('profile')}
                  </Link>
                  <button
                    onClick={async () => {
                      await signOut();
                      setOpen(false);
                      router.push("/");
                      router.refresh();
                    }}
                    className="py-2 text-left text-[15px] font-medium text-red-400 transition-opacity hover:opacity-80"
                  >
                    {tCommon('signOut')}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex w-full flex-col gap-2.5">
                <Button
                  as={Link}
                  href={`/${locale}/signup`}
                  onClick={() => setOpen(false)}
                  className="w-full justify-center"
                >
                  {tCommon('signUp')}
                </Button>
                <Button
                  variant="simple"
                  as={Link}
                  href={`/${locale}/login`}
                  onClick={() => setOpen(false)}
                  className="w-full justify-center text-white"
                >
                  {tCommon('signIn')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
