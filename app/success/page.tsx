import SuccessClient from "@/components/SuccessClient";

export default async function SuccessPage({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const resolved = await searchParams;
  const sessionId = resolved.session_id || "";

  return <SuccessClient sessionId={sessionId} />;
}
