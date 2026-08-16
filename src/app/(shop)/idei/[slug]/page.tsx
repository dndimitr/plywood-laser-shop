import { redirect } from "next/navigation";
import { giftGuideBySlug, giftGuidePath } from "@/lib/gift-guides";

type Props = { params: Promise<{ slug: string }> };

/** Legacy /idei/[slug] → canonical /blog/[slug] */
export default async function IdeiSlugRedirectPage({ params }: Props) {
  const { slug } = await params;
  const guide = giftGuideBySlug(slug);
  redirect(guide ? giftGuidePath(guide.slug) : "/blog");
}
