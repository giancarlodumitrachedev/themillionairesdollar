import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendRemovalEmail } from "@/lib/resend";
import { isValidEmail } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * GDPR "right to be forgotten". Marks tiles non-public and records the request
 * timestamp (we retain the minimal financial record required by law, but the
 * tile leaves the Wall). A confirmation email is sent.
 */
export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json({ ok: true, processed: false });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("participants")
      .update({ is_public: false, removal_requested_at: new Date().toISOString() })
      .eq("email", email)
      .eq("is_public", true)
      .select("tile_number");
    if (error) throw error;

    // Confirm removal (best-effort) for each tile.
    for (const row of data ?? []) {
      try {
        await sendRemovalEmail(email, { tileNumber: row.tile_number as number });
      } catch {
        // ignore individual email failures
      }
    }

    // Also unsubscribe from the newsletter.
    await supabase
      .from("newsletter_subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("email", email);

    return NextResponse.json({ ok: true, removed: (data ?? []).length });
  } catch (err) {
    console.error("Data deletion error:", err);
    return NextResponse.json({ error: "Could not process request" }, { status: 500 });
  }
}
