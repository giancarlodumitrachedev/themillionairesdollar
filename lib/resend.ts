import { Resend } from "resend";

const FROM = "The Curators <hello@themillionairesdollar.com>";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  _resend = new Resend(key);
  return _resend;
}

const SITE = process.env.NEXT_PUBLIC_URL ?? "https://themillionairesdollar.com";

/**
 * Welcome email — plain text only. No images, no logos, no buttons.
 * Per PRD 12.1.
 */
export async function sendWelcomeEmail(
  to: string,
  params: { tileNumber: number; tileId: string }
): Promise<void> {
  const body = [
    "Your tile is now part of the Wall.",
    "",
    `You are number ${params.tileNumber}.`,
    "",
    `View it here: ${SITE}/tile/${params.tileId}`,
    "Share it if you wish.",
    "",
    "We're glad you exist.",
    "",
    "— The Curators",
  ].join("\n");

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Welcome to the Wall, #${params.tileNumber}`,
    text: body,
  });
}

/** Removal confirmation — plain text. Per PRD 12.2. */
export async function sendRemovalEmail(
  to: string,
  params: { tileNumber: number }
): Promise<void> {
  const body = [
    `Your tile #${params.tileNumber} has been removed from the Wall, as requested.`,
    "",
    "Per our terms, contributions are not refunded.",
    "",
    "If you change your mind in the future, you may participate again.",
    "",
    "— The Curators",
  ].join("\n");

  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Your tile has been removed",
    text: body,
  });
}

/** Newsletter double opt-in / generic send. HTML allowed here. */
export async function sendNewsletterEmail(
  to: string | string[],
  subject: string,
  html: string,
  text: string
): Promise<void> {
  await getResend().emails.send({ from: FROM, to, subject, html, text });
}
