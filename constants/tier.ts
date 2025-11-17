export type Tier = {
  name: string;
  id: string;
  href: string;
  priceMonthly: string;
  priceYearly: string;
  description: string;
  features: string[];
  featured: boolean;
  cta: string;
  onClick: () => void;
};

export const tiers: Tier[] = [
  {
    name: "Free",
    id: "tier-free",
    href: "#",
    priceMonthly: "$0",
    priceYearly: "$0",
    description: "Perfect for trying out",
    features: [
      "100 AI operations/month",
      "3 active workflows",
      "Basic integrations",
      "Community support",
      "Basic analytics",
    ],
    featured: false,
    cta: "Start Free",
    onClick: () => {},
  },
  {
    name: "Starter",
    id: "tier-starter",
    href: "#",
    priceMonthly: "$29",
    priceYearly: "$290",
    description: "For individuals and small teams",
    features: [
      "1,000 AI operations/month",
      "Unlimited workflows",
      "All integrations",
      "Email support",
      "Advanced AI models",
      "Custom branding",
      "API access",
    ],
    featured: false,
    cta: "Start Trial",
    onClick: () => {},
  },
  {
    name: "Professional",
    id: "tier-professional",
    href: "#",
    priceMonthly: "$99",
    priceYearly: "$990",
    description: "For growing businesses",
    features: [
      "10,000 AI operations/month",
      "Priority processing",
      "Custom AI training",
      "Advanced API access",
      "Priority support",
      "Team collaboration",
      "White-label options",
      "Advanced analytics",
      "SSO authentication",
    ],
    featured: true,
    cta: "Get Started",
    onClick: () => {},
  },

  {
    name: "Enterprise",
    id: "tier-enterprise",
    href: "#",
    priceMonthly: "Custom",
    priceYearly: "Custom",
    description: "For large organizations",
    features: [
      "Unlimited AI operations",
      "Dedicated infrastructure",
      "Custom AI models",
      "SLA guarantee",
      "24/7 phone support",
      "Custom integrations",
      "On-premise deployment",
      "Compliance certifications",
      "Dedicated account manager",
    ],
    featured: false,
    cta: "Contact Sales",
    onClick: () => {},
  },
];
