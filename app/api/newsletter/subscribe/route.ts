import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidEmail } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { email?: string; source?: string; company?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot: bots fill hidden "company" field.
  if (body.company) {
    return NextResponse.json({ ok: true });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const source =
    body.source === "checkout" || body.source === "manual"
      ? body.source
      : "footer";

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    // Not configured yet — accept gracefully so the UI works in dev.
    return NextResponse.json({ ok: true, stored: false });
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        { email, source, unsubscribed_at: null },
        { onConflict: "email" }
      );
    if (error) throw error;
    return NextResponse.json({ ok: true, stored: true });
  } catch (err) {
    console.error("Newsletter subscribe error:", err);
    return NextResponse.json({ error: "Could not subscribe" }, { status: 500 });
  }
}
