import Stripe from "stripe";
import { markPaymentCompleted } from "@/lib/database";

export const runtime = "nodejs";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await request.text();

  if (!signature || !webhookSecret) {
    return Response.json(
      {
        error:
          "Missing Stripe signature or STRIPE_WEBHOOK_SECRET. Configure Stripe to send events to this endpoint and include signing secret."
      },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Invalid webhook payload" },
      { status: 400 }
    );
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email || session.customer_email;

    if (email && session.id && session.payment_status === "paid") {
      await markPaymentCompleted({
        email,
        sessionId: session.id,
        source: event.type
      });
    }
  }

  return Response.json({ received: true, eventType: event.type });
}
