import { NextResponse } from "next/server";
import { z } from "zod";
import { createAccessToken, ACCESS_COOKIE_NAME } from "@/lib/paywall";
import { getPaidEmailForSession, hasPaidAccess } from "@/lib/database";

export const runtime = "nodejs";

const schema = z.object({
  sessionId: z.string().optional(),
  email: z.string().email().optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const { sessionId, email } = parsed.data;
  let paidEmail: string | null = null;

  if (sessionId) {
    paidEmail = await getPaidEmailForSession(sessionId);
  }

  if (!paidEmail && email) {
    const paid = await hasPaidAccess(email);
    if (paid) {
      paidEmail = email.toLowerCase();
    }
  }

  if (!paidEmail) {
    return Response.json(
      {
        error:
          "We could not verify payment yet. If you just paid, wait up to 30 seconds and retry. You can also unlock with the same email used at checkout."
      },
      { status: 403 }
    );
  }

  const token = createAccessToken(paidEmail);
  const response = NextResponse.json({ ok: true, email: paidEmail });

  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}
