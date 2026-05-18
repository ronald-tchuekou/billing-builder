import nodemailer, {type Transporter} from "nodemailer";
import {serverEnv} from "@/lib/env";

let cached: Transporter | null = null;

export function getMailer(): Transporter {
  if (cached) return cached;
  const host = serverEnv.SMTP_HOST;
  const port = Number(serverEnv.SMTP_PORT ?? 587);
  const secure = serverEnv.SMTP_SECURE === "true";
  const user = serverEnv.SMTP_USER;
  const pass = serverEnv.SMTP_PASS;
  if (!host) throw new Error("SMTP_HOST not configured");

  cached = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? {user, pass} : undefined,
  });
  return cached;
}

export async function sendInvoiceEmail(opts: {
  to: string;
  subject: string;
  html: string;
  attachment: { filename: string; content: Buffer };
}) {
  const from = serverEnv.SMTP_FROM ?? "no-reply@example.com";
  return getMailer().sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    attachments: [
      {filename: opts.attachment.filename, content: opts.attachment.content},
    ],
  });
}
