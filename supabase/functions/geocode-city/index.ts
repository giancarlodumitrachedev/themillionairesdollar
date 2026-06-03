// Supabase Edge Function: geocode-city
//
// Input  (POST JSON): { country: string (ISO alpha-2), city?: string }
// Output (JSON):       { latitude: number, longitude: number } | { error }
//
// Applies a random ±~5km jitter for privacy. Uses OpenStreetMap Nominatim.
// Deploy: supabase functions deploy geocode-city

function jitter(lat: number, lng: number) {
  return {
    latitude: +(lat + (Math.random() - 0.5) * 0.09).toFixed(5),
    longitude: +(lng + (Math.random() - 0.5) * 0.09).toFixed(5),
  };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let payload: { country?: string; city?: string };
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const country = (payload.country ?? "").toUpperCase();
  if (!country) return Response.json({ error: "country required" }, { status: 400 });

  try {
    const params = new URLSearchParams({ format: "jsonv2", limit: "1", country });
    if (payload.city) params.set("city", payload.city);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      { headers: { "User-Agent": "TheMillionairesDollar/1.0" } },
    );
    if (!res.ok) return Response.json({ error: "geocode failed" }, { status: 502 });

    const data = await res.json();
    if (!data[0]) return Response.json({ latitude: null, longitude: null });

    return Response.json(jitter(parseFloat(data[0].lat), parseFloat(data[0].lon)));
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
});
