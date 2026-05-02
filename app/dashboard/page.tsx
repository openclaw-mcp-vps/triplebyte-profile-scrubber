import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/paywall";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const email = verifyAccessToken(token);

  if (!email) {
    redirect("/");
  }

  return <DashboardClient />;
}
