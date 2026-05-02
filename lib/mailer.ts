import nodemailer from "nodemailer";

export type MailResult = {
  delivered: boolean;
  messageId?: string;
  error?: string;
};

function isMailerConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_FROM);
}

function createTransport() {
  const port = Number(process.env.SMTP_PORT || "587");

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        : undefined
  });
}

export async function sendDeletionEmail({
  to,
  subject,
  text,
  requesterEmail
}: {
  to: string;
  subject: string;
  text: string;
  requesterEmail: string;
}): Promise<MailResult> {
  if (!isMailerConfigured()) {
    return {
      delivered: false,
      error: "SMTP is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_FROM, and optional SMTP auth variables."
    };
  }

  try {
    const transport = createTransport();
    const info = await transport.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      replyTo: requesterEmail
    });

    return {
      delivered: true,
      messageId: info.messageId
    };
  } catch (error) {
    return {
      delivered: false,
      error: error instanceof Error ? error.message : "Unknown SMTP error"
    };
  }
}
