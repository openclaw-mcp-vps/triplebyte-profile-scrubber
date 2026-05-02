import { createHmac, timingSafeEqual } from "node:crypto";

export const ACCESS_COOKIE_NAME = "tbps_access";

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

function getSecret() {
  return process.env.PAYWALL_COOKIE_SECRET || "local-dev-secret";
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

type AccessPayload = {
  email: string;
  exp: number;
};

export function createAccessToken(email: string) {
  const payload: AccessPayload = {
    email: email.toLowerCase().trim(),
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = createHmac("sha256", getSecret()).update(encodedPayload).digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifyAccessToken(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  const [encodedPayload, suppliedSignature] = token.split(".");

  if (!encodedPayload || !suppliedSignature) {
    return null;
  }

  const expectedSignature = createHmac("sha256", getSecret()).update(encodedPayload).digest("base64url");

  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);

  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as AccessPayload;

    if (!payload.email || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload.email;
  } catch {
    return null;
  }
}
