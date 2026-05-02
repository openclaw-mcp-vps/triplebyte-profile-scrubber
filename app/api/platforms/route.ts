import { getPlatformCatalog } from "@/lib/database";

export async function GET() {
  const platforms = await getPlatformCatalog();
  return Response.json({ platforms });
}
