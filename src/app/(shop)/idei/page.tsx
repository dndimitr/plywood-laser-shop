import { redirect } from "next/navigation";
import { blogIndexPath } from "@/lib/gift-guides";

/** Legacy /idei → canonical /blog */
export default function IdeiRedirectPage() {
  redirect(blogIndexPath());
}
