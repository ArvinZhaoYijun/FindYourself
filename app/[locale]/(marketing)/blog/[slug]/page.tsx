import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllBlogs, getBlogModule } from "@/lib/blog";
import { locales, type Locale } from "@/i18n.config";

interface PageProps {
  params: {
    locale: Locale;
    slug: string;
  };
}

export async function generateStaticParams() {
  const blogs = await getAllBlogs();

  return blogs.flatMap((blog) =>
    locales.map((locale) => ({
      slug: blog.slug,
      locale,
    }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = params;

  const blogModule = await getBlogModule(slug, locale);

  if (!blogModule) {
    notFound();
  }

  const { blog } = blogModule;
  const metadata: Metadata = {
    title: blog.title,
    description: blog.description,
  };

  if (blog.image) {
    metadata.openGraph = {
      images: [blog.image],
    };
  }

  return metadata;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug, locale } = params;

  const blogModule = await getBlogModule(slug, locale);

  if (!blogModule) {
    notFound();
  }

  const MDXContent = blogModule.default;

  return <MDXContent />;
}
