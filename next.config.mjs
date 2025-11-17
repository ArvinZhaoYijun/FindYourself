import fs from "node:fs";
import path from "node:path";

import rehypePrism from "@mapbox/rehype-prism";
import nextMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');

const pnpmManagedPath = path.join(process.cwd(), "node_modules", ".pnpm");
const snapshotManagedPaths = fs.existsSync(pnpmManagedPath) ? [pnpmManagedPath] : [];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "a.offerget.pro",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  pageExtensions: ["ts", "tsx", "mdx"],
  webpack(config) {
    config.snapshot ??= {};
    config.snapshot.managedPaths = snapshotManagedPaths;
    return config;
  },
};

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypePrism],
  },
});

export default withNextIntl(withMDX(nextConfig));
