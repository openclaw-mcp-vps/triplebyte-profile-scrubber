import puppeteer from "puppeteer";
import type { Platform } from "@/lib/platforms";

export type ScrapeResult = {
  checkedAt: string;
  stillPublic: boolean | null;
  httpStatus: number | null;
  title: string | null;
  indicator: string | null;
  error?: string;
};

const GENERIC_REMOVAL_INDICATORS = [
  "404",
  "not found",
  "page removed",
  "profile unavailable",
  "doesn't exist",
  "account has been closed",
  "gone"
];

export function normalizeProfileUrl(url: string) {
  if (!url) {
    return "";
  }

  const trimmed = url.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export async function checkProfileVisibility(platform: Platform, profileUrl: string): Promise<ScrapeResult> {
  const checkedAt = new Date().toISOString();
  const normalizedUrl = normalizeProfileUrl(profileUrl);

  if (!normalizedUrl) {
    return {
      checkedAt,
      stillPublic: null,
      httpStatus: null,
      title: null,
      indicator: "no_profile_url"
    };
  }

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout: 25000
    });

    const page = await browser.newPage();
    const response = await page.goto(normalizedUrl, {
      waitUntil: "domcontentloaded",
      timeout: 25000
    });

    const [title, bodyText] = await Promise.all([
      page.title(),
      page.evaluate(() => document.body?.innerText?.slice(0, 8000) || "")
    ]);

    const status = response?.status() ?? null;
    const lowerBody = bodyText.toLowerCase();
    const lowerTitle = title.toLowerCase();

    const signals = [...GENERIC_REMOVAL_INDICATORS, ...platform.searchHints.map((hint) => hint.toLowerCase())];
    const removalIndicator = GENERIC_REMOVAL_INDICATORS.find(
      (signal) => lowerBody.includes(signal) || lowerTitle.includes(signal)
    );

    const hasPlatformHints = platform.searchHints.some(
      (hint) => lowerBody.includes(hint.toLowerCase()) || lowerTitle.includes(hint.toLowerCase())
    );

    const stillPublic =
      status === 404
        ? false
        : Boolean(hasPlatformHints || (status !== null && status >= 200 && status < 300 && !removalIndicator));

    return {
      checkedAt,
      stillPublic,
      httpStatus: status,
      title,
      indicator: removalIndicator || (hasPlatformHints ? "platform_keywords_found" : signals[0] ?? null)
    };
  } catch (error) {
    return {
      checkedAt,
      stillPublic: null,
      httpStatus: null,
      title: null,
      indicator: null,
      error: error instanceof Error ? error.message : "Unknown scrape error"
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
