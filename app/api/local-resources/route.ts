import { NextRequest, NextResponse } from "next/server";

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toMiles(km: number) {
  return (km * 0.621371).toFixed(1) + " miles";
}

function classifyElement(tags: Record<string, string>) {
  const amenity = tags.amenity ?? "";
  const landuse = tags.landuse ?? "";
  const religion = tags.religion ?? "";

  if (amenity === "funeral_hall" || amenity === "funeral_home" || tags.shop === "funeral_directors")
    return "funeral-director";
  if (amenity === "crematorium") return "crematorium";
  if (amenity === "grave_yard" || landuse === "cemetery") return "cemetery";
  if (amenity === "place_of_worship") return "faith-organisation";
  if (amenity === "townhall" || amenity === "government" || tags.office === "government") return "council";
  return null;
}

function formatName(tags: Record<string, string>, fallbackType: string) {
  if (tags.name) return tags.name;
  const labels: Record<string, string> = {
    "funeral-director": "Funeral Director",
    crematorium: "Crematorium",
    cemetery: "Cemetery",
    "faith-organisation": tags.religion
      ? tags.religion.charAt(0).toUpperCase() + tags.religion.slice(1) + " Place of Worship"
      : "Place of Worship",
    council: "Council Office",
  };
  return labels[fallbackType] ?? fallbackType;
}

export async function POST(req: NextRequest) {
  try {
    const { postcode } = await req.json();
    if (!postcode) return NextResponse.json({ error: "Postcode required" }, { status: 400 });

    // 1. Geocode the postcode
    const geoRes = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.replace(/\s/g, ""))}`,
      { next: { revalidate: 86400 } }
    );
    if (!geoRes.ok) return NextResponse.json({ error: "Invalid postcode" }, { status: 400 });
    const geoData = await geoRes.json();
    if (geoData.status !== 200) return NextResponse.json({ error: "Postcode not found" }, { status: 400 });

    const { latitude: lat, longitude: lon, admin_district: district } = geoData.result;

    // 2. Query Overpass API
    const radius = 8000; // 8 km ≈ 5 miles
    const overpassQuery = `
[out:json][timeout:20];
(
  node["amenity"="funeral_hall"](around:${radius},${lat},${lon});
  node["amenity"="funeral_home"](around:${radius},${lat},${lon});
  node["shop"="funeral_directors"](around:${radius},${lat},${lon});
  way["shop"="funeral_directors"](around:${radius},${lat},${lon});
  node["amenity"="crematorium"](around:${radius},${lat},${lon});
  way["amenity"="crematorium"](around:${radius},${lat},${lon});
  node["amenity"="grave_yard"](around:${radius},${lat},${lon});
  way["landuse"="cemetery"](around:${radius},${lat},${lon});
  node["amenity"="place_of_worship"](around:${radius},${lat},${lon});
  node["amenity"="townhall"](around:${radius},${lat},${lon});
);
out body center;
    `.trim();

    const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: overpassQuery,
      signal: AbortSignal.timeout(15000),
    });

    const resources: {
      id: string;
      type: string;
      name: string;
      address: string;
      phone?: string;
      website?: string;
      distance: string;
      distanceKm: number;
      lat: number;
      lng: number;
    }[] = [];

    if (overpassRes.ok) {
      const overpassData = await overpassRes.json();
      const elements: OverpassElement[] = overpassData.elements ?? [];

      for (const el of elements) {
        const tags = el.tags ?? {};
        const elLat = el.lat ?? el.center?.lat;
        const elLon = el.lon ?? el.center?.lon;
        if (!elLat || !elLon) continue;

        const type = classifyElement(tags);
        if (!type) continue;

        const distKm = haversineKm(lat, lon, elLat, elLon);

        // Build address from OSM tags
        const addrParts = [
          tags["addr:housenumber"],
          tags["addr:street"],
          tags["addr:city"] || tags["addr:town"] || tags["addr:suburb"],
          tags["addr:postcode"],
        ].filter(Boolean);

        resources.push({
          id: `osm-${el.type}-${el.id}`,
          type,
          name: formatName(tags, type),
          address: addrParts.length > 0 ? addrParts.join(", ") : district ?? "See directions",
          phone: tags.phone || tags["contact:phone"],
          website: tags.website || tags["contact:website"] || tags["contact:url"],
          distance: toMiles(distKm),
          distanceKm: distKm,
          lat: elLat,
          lng: elLon,
        });
      }
    }

    // 3. Add registry office via GOV.UK data lookup (static — registry offices are not in OSM)
    // We always add the council's registration service
    resources.push({
      id: "gov-registry",
      type: "registry-office",
      name: `${district ?? "Local"} Register Office`,
      address: `${district ?? "Your local"} Register Office — book via GOV.UK`,
      website: "https://www.gov.uk/register-a-death/find-register-office",
      distance: "Local",
      distanceKm: 0,
      lat,
      lng: lon,
    });

    // Sort by distance, deduplicate by name
    const seen = new Set<string>();
    const sorted = resources
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .filter((r) => {
        const key = r.name.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    return NextResponse.json({
      resources: sorted,
      centre: { lat, lon, district },
    });
  } catch (err) {
    console.error("local-resources error:", err);
    return NextResponse.json({ error: "Search failed — please try again" }, { status: 500 });
  }
}
