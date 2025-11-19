"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageSquare, Image, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface SubItem {
  key: string;
  href: string;
  icon?: string;
}

interface NavBarItemWithDropdownProps {
  itemKey: string;
  href: string;
  subItems?: SubItem[];
  children: React.ReactNode;
}

const iconMap = {
  MessageSquare: MessageSquare,
  Image: Image,
  Video: Video,
};

export function NavBarItemWithDropdown({
  itemKey,
  href,
  subItems,
  children
}: NavBarItemWithDropdownProps) {
  const t = useTranslations('navigation.main');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  if (!subItems || subItems.length === 0) {
    return (
      <Link
        href={href}
        className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 transition-colors"
      >
        {children}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={cn(
          "px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1 transition-colors",
          isOpen
            ? "bg-white/15 text-white"
            : "text-white/70 hover:bg-white/10"
        )}
      >
        {children}
        <ChevronDown
          className={cn(
            "w-3 h-3 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-1 w-56 rounded-2xl border border-white/10 bg-[rgba(5,7,12,0.95)] text-white shadow-[0_25px_80px_rgba(5,7,12,0.7)] overflow-hidden z-50"
          >
            <div className="py-2">
              {subItems.map((subItem) => {
                const IconComponent = subItem.icon ? iconMap[subItem.icon as keyof typeof iconMap] : null;

                return (
                  <Link
                    key={subItem.key}
                    href={subItem.href}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {IconComponent && (
                      <IconComponent className="w-4 h-4 text-white/70" />
                    )}
                    <span>{t(subItem.key)}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
