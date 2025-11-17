import type { NavigationItem } from "./types";

// These are the navigation keys for translation
export const marketingNavigationKeys = [
  {
    key: "demo",
    href: "/demo",
    subItems: [
      {
        key: "chat",
        href: "/demo/chat",
        icon: "MessageSquare",
      },
      {
        key: "image",
        href: "/demo/image",
        icon: "Image",
      },
      {
        key: "video",
        href: "/demo/video",
        icon: "Video",
      },
    ],
  },
  {
    key: "pricing",
    href: "/pricing",
  },
  {
    key: "blog",
    href: "/blog",
  },
  {
    key: "contact",
    href: "/contact",
  },
];

export const appNavigationKeys = [
  {
    key: "dashboard",
    href: "/dashboard",
  },
  {
    key: "profile",
    href: "/profile",
  },
];

// Legacy exports for compatibility
export const marketingNavigation: NavigationItem[] = [
  {
    title: "Demo",
    href: "/demo",
  },
  {
    title: "Pricing",
    href: "/pricing",
  },
  {
    title: "Blog",
    href: "/blog",
  },
  {
    title: "Contact",
    href: "/contact",
  },
];

export const appNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    title: "Profile",
    href: "/profile",
  },
];
