export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UserLocationState {
  coords: Coordinates | null;
  district: string | null;
  state: string | null;
  city: string | null;
  country: string | null;
  loading: boolean;
  error: string | null;
  source: "gps" | "manual" | "default" | null;
}

/**
 * Calculates Haversine distance in kilometers between two points
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Common Indian States and their prominent districts for quick filtering
 */
export interface IndianStateOption {
  state: string;
  districts: string[];
  lat: number;
  lng: number;
}

export const INDIAN_STATES_DATA: IndianStateOption[] = [
  {
    state: "Gujarat",
    districts: ["Ahmedabad", "Surat", "Vadodara", "Gandhinagar", "Rajkot"],
    lat: 23.0225,
    lng: 72.5714,
  },
  {
    state: "Maharashtra",
    districts: ["Mumbai", "Navi Mumbai", "Pune", "Thane", "Nagpur", "Nashik"],
    lat: 19.076,
    lng: 72.8777,
  },
  {
    state: "Karnataka",
    districts: ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Mangaluru", "Hubballi"],
    lat: 12.9716,
    lng: 77.5946,
  },
  {
    state: "Delhi NCR",
    districts: ["New Delhi", "South Delhi", "Central Delhi", "Noida", "Gurugram"],
    lat: 28.6139,
    lng: 77.209,
  },
  {
    state: "Goa",
    districts: ["North Goa", "South Goa"],
    lat: 15.2993,
    lng: 74.124,
  },
  {
    state: "Uttar Pradesh",
    districts: ["Ayodhya", "Lucknow", "Varanasi", "Noida", "Kanpur", "Agra"],
    lat: 26.8467,
    lng: 80.9462,
  },
  {
    state: "Telangana",
    districts: ["Hyderabad", "Rangareddy", "Medchal-Malkajgiri", "Warangal"],
    lat: 17.385,
    lng: 78.4867,
  },
  {
    state: "West Bengal",
    districts: ["Kolkata", "North 24 Parganas", "Howrah", "Darjeeling"],
    lat: 22.5726,
    lng: 88.3639,
  },
  {
    state: "Tamil Nadu",
    districts: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
    lat: 13.0827,
    lng: 80.2707,
  },
  {
    state: "Rajasthan",
    districts: ["Jaipur", "Udaipur", "Jodhpur", "Kota", "Ajmer"],
    lat: 26.9124,
    lng: 75.7873,
  },
  {
    state: "Kerala",
    districts: ["Ernakulam", "Thiruvananthapuram", "Kozhikode", "Thrissur"],
    lat: 9.9312,
    lng: 76.2673,
  },
];

/**
 * Reverse geocodes coordinates to city/district/state using OpenStreetMap Nominatim with fallback
 */
export async function reverseGeocodeCoords(
  lat: number,
  lng: number
): Promise<{ district: string; state: string; city: string; country: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          "Accept-Language": "en",
        },
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const district =
        addr.state_district ||
        addr.county ||
        addr.district ||
        addr.city_district ||
        addr.city ||
        addr.town ||
        "Local District";
      const state = addr.state || addr.region || "Local State";
      const city = addr.city || addr.town || addr.municipality || district;
      const country = addr.country || "India";

      return {
        district: district.replace(/ district/i, "").trim(),
        state: state.trim(),
        city: city.trim(),
        country: country.trim(),
      };
    }
  } catch (err) {
    console.warn("Reverse geocode network fallback:", err);
  }

  // Geometric fallback: find nearest known Indian state
  let closestState = INDIAN_STATES_DATA[0];
  let minD = Infinity;
  for (const s of INDIAN_STATES_DATA) {
    const d = calculateDistanceKm(lat, lng, s.lat, s.lng);
    if (d < minD) {
      minD = d;
      closestState = s;
    }
  }

  return {
    district: closestState.districts[0],
    state: closestState.state,
    city: closestState.districts[0],
    country: "India",
  };
}
