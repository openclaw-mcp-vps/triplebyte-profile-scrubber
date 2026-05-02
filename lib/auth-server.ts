import { cookies } from "next/headers";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/paywall";

export async function requirePaidEmail() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  return verifyAccessToken(token);
}
