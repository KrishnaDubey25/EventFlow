/**
 * EventFlow Canonical Event Image Resolver
 * Provides visually authentic, high-quality banner images based on event category,
 * name keywords, venue, and explicit organizer selection.
 */

import { AppEvent } from "../types/event";

// Curated high-resolution Unsplash photo collections with optimal aspect ratios and rich lighting
export const CURATED_EVENT_IMAGES = {
  // Sports & Stadiums
  cricket: [
    "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1600&q=80", // Floodlit Stadium
    "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1600&q=80", // Cricket pitch / stadium
    "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=1600&q=80", // Stadium crowd & green field
  ],
  football: [
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=80", // Football stadium match
    "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=1600&q=80", // Stadium under floodlights
  ],
  sportsGeneral: [
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80", // Running track / athletics
    "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1600&q=80", // Sports stadium action
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80", // Match arena crowd
  ],

  // Concerts & Music
  concertsLive: [
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80", // Concert stage lights & crowd
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80", // Colorful concert stage
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1600&q=80", // Live band concert
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=80", // Music festival arena
  ],
  electronicMusic: [
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80", // DJ stage laser lights
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80", // EDM festival crowd
  ],

  // Conferences & Tech
  techAI: [
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=80", // Tech summit keynote presentation
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1600&q=80", // Professional conference hall
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80", // Convention keynote audience
  ],
  conferenceGeneral: [
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1600&q=80", // Speaker on stage with audience
    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80", // Executive business conference
  ],

  // Festivals & Cultural
  festivals: [
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1600&q=80", // Cultural festival illumination
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1600&q=80", // Festive night celebration
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=80", // Outdoor festival tents and lights
  ],

  // Large Gatherings, Expos & Mega Events
  largeGatherings: [
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1600&q=80", // Large auditorium crowd
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80", // Grand expo event hall
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80", // Mass venue gathering
  ],
};

/**
 * Resolves the most accurate event banner image based on event name, category, and venue.
 * Follows strict priority order:
 * 1. Explicit organizer image (if valid and not placeholder)
 * 2. Exact keyword matches in title/venue (Cricket, Football, AI, Hackathon, Rock, EDM, etc.)
 * 3. Primary category defaults
 * 4. Generic high quality fallback
 */
export function resolveEventBanner(
  category?: string,
  name?: string,
  venue?: string,
  explicitImage?: string
): string {
  // 1. Explicit valid URL provided by organizer
  if (
    explicitImage &&
    explicitImage.trim() !== "" &&
    !explicitImage.includes("placeholder") &&
    !explicitImage.includes("via.placeholder") &&
    explicitImage.startsWith("http")
  ) {
    return explicitImage.trim();
  }

  const query = `${name || ""} ${category || ""} ${venue || ""}`.toLowerCase();

  // 2. Keyword-specific intelligent routing
  // Cricket / Wankhede / IPL / Match
  if (query.includes("cricket") || query.includes("wankhede") || query.includes("ipl") || query.includes("pitch")) {
    return CURATED_EVENT_IMAGES.cricket[0];
  }

  // Football / Soccer / League / Derby
  if (query.includes("football") || query.includes("soccer") || query.includes("fifa") || query.includes("goal")) {
    return CURATED_EVENT_IMAGES.football[0];
  }

  // AI / Tech / Quantum / Hackathon / Dev / Cloud / Cyber
  if (
    query.includes("ai") ||
    query.includes("tech") ||
    query.includes("quantum") ||
    query.includes("hackathon") ||
    query.includes("developer") ||
    query.includes("software") ||
    query.includes("innovation")
  ) {
    return CURATED_EVENT_IMAGES.techAI[0];
  }

  // EDM / DJ / Rave / Electronic
  if (query.includes("dj") || query.includes("edm") || query.includes("electronic") || query.includes("rave")) {
    return CURATED_EVENT_IMAGES.electronicMusic[0];
  }

  // Rock / Music / Concert / Singer / Symphony / Band / Fest
  if (
    query.includes("music") ||
    query.includes("concert") ||
    query.includes("rock") ||
    query.includes("band") ||
    query.includes("singer") ||
    query.includes("symphony")
  ) {
    return CURATED_EVENT_IMAGES.concertsLive[0];
  }

  // Marathon / Athletics / Sports Tournament
  if (query.includes("marathon") || query.includes("run") || query.includes("athletic") || query.includes("sports")) {
    return CURATED_EVENT_IMAGES.sportsGeneral[0];
  }

  // Summit / Keynote / Leadership / Expo
  if (query.includes("summit") || query.includes("keynote") || query.includes("conference") || query.includes("leadership")) {
    return CURATED_EVENT_IMAGES.techAI[1];
  }

  // 3. Category Fallbacks
  const cat = (category || "").toLowerCase();
  if (cat.includes("sport")) {
    return CURATED_EVENT_IMAGES.cricket[0];
  }
  if (cat.includes("concert")) {
    return CURATED_EVENT_IMAGES.concertsLive[0];
  }
  if (cat.includes("conference")) {
    return CURATED_EVENT_IMAGES.techAI[0];
  }
  if (cat.includes("festival")) {
    return CURATED_EVENT_IMAGES.festivals[0];
  }
  if (cat.includes("gathering") || cat.includes("large")) {
    return CURATED_EVENT_IMAGES.largeGatherings[0];
  }

  // 4. Default fallback
  return CURATED_EVENT_IMAGES.techAI[0];
}

/**
 * Standard accessor helper to extract an event's banner safely.
 */
export function getEventImage(event: Partial<AppEvent> | null | undefined): string {
  if (!event) return CURATED_EVENT_IMAGES.techAI[0];
  return resolveEventBanner(event.category, event.name, event.venue, event.image);
}
