"use client";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from 'next-intl';

export function Pricing() {
  const [active, setActive] = useState("monthly");
  const session = useSession();
  const router = useRouter();
  const t = useTranslations('pricing');
  const locale = useLocale();
  const userId = session.data?.user?.id;
  
  const tabs = [
    { name: t('billing.monthly'), value: "monthly" },
    { name: t('billing.yearly'), value: "yearly" },
  ];

  const startCheckout = useCallback(
    async (key: string, kind: "subscription" | "one_time") => {
      if (!userId) {
        router.push(`/${locale}/signup`);
        return;
      }
      const res = await fetch("/api/payments/creem/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, kind }),
      });
      if (!res.ok) return;
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    },
    [locale, router, userId]
  );

  const handleTierClick = (tierId: string) => {
    // Map the current UI tiers to billing keys
    if (tierId === "tier-free") {
      return () => router.push(`/${locale}/signup`);
    }
    if (tierId === "tier-enterprise") {
      return () => router.push(`/${locale}/contact`);
    }

    if (tierId === "tier-starter") {
      const key = active === "monthly" ? "starter_monthly" : "starter_yearly";
      return () => startCheckout(key, "subscription");
    }

    if (tierId === "tier-professional") {
      const key = active === "monthly" ? "pro_monthly" : "pro_yearly";
      return () => startCheckout(key, "subscription");
    }

    // default fallback
    return () => {};
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-center bg-muted w-fit mx-auto mb-12 rounded-md overflow-hidden">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={cn(
              "text-sm font-medium text-muted-foreground p-4 rounded-md relative",
              active === tab.value ? "text-primary-foreground" : ""
            )}
            onClick={() => setActive(tab.value)}
          >
            {active === tab.value && (
              <motion.span
                layoutId="moving-div"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                className="absolute inset-0 bg-primary"
              />
            )}
            <span className="relative z-10">{tab.name}</span>
          </button>
        ))}
      </div>
      <div className="mx-auto mt-4 md:mt-20   grid relative z-20 grid-cols-1 gap-4 items-center  md:grid-cols-2 xl:grid-cols-4">
        {['free', 'starter', 'professional', 'enterprise'].map((tierId, tierIdx) => {
          const tier = {
            id: `tier-${tierId}`,
            name: t(`tiers.${tierId}.name`),
            description: t(`tiers.${tierId}.description`),
            priceMonthly: t(`tiers.${tierId}.price.monthly`),
            priceYearly: t(`tiers.${tierId}.price.yearly`),
            cta: t(`tiers.${tierId}.cta`),
            features: t.raw(`tiers.${tierId}.features`) as string[],
            featured: tierId === 'professional'
          };
          return (
          <div
            key={tier.id}
            className={cn(
              tier.featured
                ? "relative bg-primary shadow-2xl"
                : "bg-card",
              "rounded-lg px-6 py-8 sm:mx-8 lg:mx-0 h-full flex flex-col justify-between"
            )}
          >
            <div className="">
              <h3
                id={tier.id}
                className={cn(
                  tier.featured
                    ? "text-primary-foreground"
                    : "text-muted-foreground",
                  "text-base font-semibold leading-7"
                )}
              >
                {tier.name}
              </h3>
              <p className="mt-4">
                <motion.span
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  key={active}
                  className={cn(
                    "text-4xl font-bold tracking-tight inline-block",
                    tier.featured
                      ? "text-primary-foreground"
                      : "text-foreground"
                  )}
                >
                  {active === "monthly" ? tier.priceMonthly : tier.priceYearly}
                </motion.span>
              </p>
              <p
                className={cn(
                  tier.featured
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground",
                  "mt-6 text-sm leading-7 h-12 md:h-12 xl:h-12"
                )}
              >
                {tier.description}
              </p>
              <ul
                role="list"
                className={cn(
                  tier.featured
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground",
                  "mt-8 space-y-3 text-sm leading-6 sm:mt-10"
                )}
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <IconCircleCheckFilled
                      className={cn(
                        tier.featured
                          ? "text-primary-foreground"
                          : "text-muted-foreground",
                        "h-6 w-5 flex-none"
                      )}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Button
                onClick={handleTierClick(tier.id)}
                aria-describedby={tier.id}
                className={cn(
                  tier.featured
                    ? "bg-background text-foreground shadow-sm hover:bg-background/90 focus-visible:outline-background"
                    : "",
                  "mt-8 rounded-full py-2.5 px-3.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10 block w-full"
                )}
              >
                {tier.cta}
              </Button>
            </div>
          </div>
          );
        })}

        {/* One-time credits pack card */}
        <div
          className={cn(
            "bg-card",
            "rounded-lg px-6 py-8 sm:mx-8 lg:mx-0 h-full flex flex-col justify-between"
          )}
        >
          <div>
            <h3 className={cn("text-base font-semibold leading-7", "text-muted-foreground")}>
              {t('tiers.credits.name')}
            </h3>
            <p className="mt-4">
              <motion.span
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                key={active}
                className={cn(
                  "text-4xl font-bold tracking-tight inline-block",
                  "text-foreground"
                )}
              >
                {t('tiers.credits.price')}
              </motion.span>
            </p>
            <p className={cn("mt-6 text-sm leading-7 h-12 md:h-12 xl:h-12", "text-muted-foreground")}>
              {t('tiers.credits.description')}
            </p>
            <ul role="list" className={cn("mt-8 space-y-3 text-sm leading-6 sm:mt-10", "text-muted-foreground")}>
              {(t.raw('tiers.credits.features') as string[]).map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <IconCircleCheckFilled className={cn("text-muted-foreground", "h-6 w-5 flex-none")} aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Button
              onClick={() => startCheckout("pack_200", "one_time")}
              className={cn(
                "mt-8 rounded-full py-2.5 px-3.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10 block w-full"
              )}
            >
              {t('tiers.credits.cta')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
