// Supabase Edge Function: send-newsletter
//
// Input (POST JSON): { subject: string, html: string, text: string,
//                      audience?: "all" | "consented" }
// Auth: requires the SERVICE_ROLE key in the Authorization header (admin only).
//
// Batches sends via Resend and logs to admin_log.
// Deploy: supabase functions deploy send-newsletter
//
// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
const FROM = "The Curators <hello@themillionairesdollar.com>";
const SITE = "https://themillionairesdollar.com";

function withUnsubscribe(html: string, email: string): string {
  const link = `${SITE}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;
  return `${html}<hr style="border:none;border-top:1px solid #2a2a2a;margin:32px 0"/>
    <p style="font-family:monospace;font-size:11px;color:#6b6862">
      <a href="${link}" style="color:#6b6862">Unsubscribe</a>
    </p>`;
}

Deno.serve(async (req) => {
  // Authorize: must present the service-role key.
  const auth = req.headers.get("Authorization") ?? "";
  if (auth !== `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return new Response("RESEND_API_KEY not set", { status: 400 });

  let body: { subject?: string; html?: string; text?: string; audience?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.subject || !body.html) {
    return Response.json({ error: "subject and html required" }, { status: 400 });
  }

  let query = supabase
    .from("newsletter_subscribers")
    .select("email")
    .is("unsubscribed_at", null);

  const { data: subs, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  let sent = 0;
  for (const row of subs ?? []) {
    const email = (row as any).email as string;
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM,
          to: email,
          subject: body.subject,
          html: withUnsubscribe(body.html!, email),
          text: body.text ?? "",
        }),
      });
      if (res.ok) sent++;
      // Resend free tier: be gentle.
      await new Promise((r) => setTimeout(r, 60));
    } catch {
      // continue
    }
  }

  await supabase.from("admin_log").insert({
    admin_email: "edge:send-newsletter",
    action: "newsletter_send",
    details: { subject: body.subject, recipients: sent },
  });

  return Response.json({ ok: true, sent });
});
