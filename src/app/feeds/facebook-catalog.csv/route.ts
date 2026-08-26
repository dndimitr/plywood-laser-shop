import { GET as catalogGet } from "@/app/feeds/facebook-catalog/route";

export const dynamic = "force-dynamic";

/** Pretty URL for Commerce Manager: /feeds/facebook-catalog.csv */
export async function GET(request: Request) {
  return catalogGet(request);
}
