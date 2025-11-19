"use client";

import { useState } from "react";

import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { useTranslations } from "next-intl";

import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { NavigationItem } from "@/features/navigation/types";
import { marketingNavigationKeys } from "@/features/navigation/config";

import { NavBarItem } from "./navbar-item";
import { NavBarItemWithDropdown } from "./navbar-item-with-dropdown";
import {
  UserMenu,
} from "./user-menu";

export const DesktopNavbar = () => {
  const t = useTranslations('navigation.main');
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
        "w-full flex relative justify-between px-6 py-3 rounded-full border border-white/10 bg-[rgba(5,7,12,0.85)] text-white transition duration-200",
        showBackground && "bg-[rgba(5,7,12,0.95)] shadow-[0_20px_80px_rgba(5,7,12,0.6)] backdrop-blur"
      )}
    >
      <AnimatePresence>
        {showBackground && (
          <motion.div
            key={String(showBackground)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1,
            }}
            className="absolute inset-0 h-full w-full rounded-full bg-[rgba(6,9,15,0.7)] pointer-events-none"
          />
        )}
      </AnimatePresence>
      <div className="flex flex-row gap-2 items-center">
        <Logo />
        <div className="flex items-center gap-1.5">
          {marketingNavigationKeys.map((item) => (
            item.subItems ? (
              <NavBarItemWithDropdown 
                key={item.key}
                itemKey={item.key}
                href={item.href}
                subItems={item.subItems}
              >
                {t(item.key)}
              </NavBarItemWithDropdown>
            ) : (
              <NavBarItem href={item.href} key={item.key}>
                {t(item.key)}
              </NavBarItem>
            )
          ))}
        </div>
      </div>
      <div className="flex space-x-2 items-center">
        <LanguageSwitcher />
        <ModeToggle />
        <UserMenu />
      </div>
    </div>
  );
};
