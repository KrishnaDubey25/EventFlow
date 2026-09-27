import { AppEvent } from "../types/event";

const now = new Date();
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const MONTH_NAMES_LIST = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// 1. Tomorrow Event: Starts 18 hours from current execution time (guaranteed <= 24h: Event Day Mode)
const event1Start = new Date(now.getTime() + 18 * 60 * 60 * 1000);
const event1End = new Date(event1Start.getTime() + 9 * 60 * 60 * 1000);
const event1DateStr = `${MONTH_NAMES_LIST[event1Start.getMonth()]} ${event1Start.getDate()}, ${event1Start.getFullYear()}`;
const event1TimeStr = `${pad(event1Start.getHours())}:${pad(event1Start.getMinutes())} - ${pad(event1End.getHours())}:${pad(event1End.getMinutes())} IST`;

// 2. Few Days Later Event: 4 days from now (~96h: Pre-Event Countdown)
const event2Start = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
const event2End = new Date(event2Start.getTime() + 1 * 24 * 60 * 60 * 1000);
const event2DateStr = `${MONTH_NAMES_LIST[event2Start.getMonth()]} ${event2Start.getDate()} - ${event2End.getDate()}, ${event2Start.getFullYear()}`;

// 3. Wankhede Sports Event: 8 days from now
const event3Start = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
const event3DateStr = `${MONTH_NAMES_LIST[event3Start.getMonth()]} ${event3Start.getDate()}, ${event3Start.getFullYear()}`;

// 4. Future Bengaluru Event: 45 days from now
const event4Start = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);
const event4End = new Date(event4Start.getTime() + 2 * 24 * 60 * 60 * 1000);
const event4DateStr = `${MONTH_NAMES_LIST[event4Start.getMonth()]} ${event4Start.getDate()} - ${event4End.getDate()}, ${event4Start.getFullYear()}`;

// 5. Delhi Bharat Mandapam Event: 15 days from now
const event5Start = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
const event5End = new Date(event5Start.getTime() + 2 * 24 * 60 * 60 * 1000);
const event5DateStr = `${MONTH_NAMES_LIST[event5Start.getMonth()]} ${event5Start.getDate()} - ${event5End.getDate()}, ${event5Start.getFullYear()}`;

export const SAMPLE_EVENTS: AppEvent[] = [
  // EVENT 1 — TOMORROW (<= 24 HOURS: EVENT DAY MODE)
  {
    id: "mumbai-tech-ai-expo-2026",
    eventGuide: { reception: "08:30 IST · Welcome and registration at Concourse Hall A", medicalHours: "During the published event programme", helpPoint: "Gate 1 Concierge Wing" },
    admissionBenefits: { "VIP Executive Delegate Pass": "Welcome breakfast and event lunch included with this delegate pass." },
    name: "Mumbai Tech & AI Expo 2026",
    category: "Conferences",
    date: event1DateStr,
    time: event1TimeStr,
    location: "Bandra Kurla Complex (BKC), Mumbai, Maharashtra, India",
    venue: "Jio World Convention Centre, Mumbai",
    district: "Bandra Kurla Complex",
    state: "Maharashtra",
    country: "India",
    latitude: 19.0607,
    longitude: 72.8656,
    capacity: "12,000",
    expectedAttendance: "11,500",
    description:
      "[DEMO EVENT] India's premier executive summit for sovereign AI, enterprise foundation models, and quantum tech infrastructure. Gathering 12,000+ researchers, engineers, and digital innovators across 4 exhibition pavilions.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
    ],
    agePolicy: "18+ for delegates and startup participants.",
    language: "English",
    duration: "9 Hours",
    highlights: [
      "Jio World Convention Centre Grand Ballroom",
      "250+ Frontier AI Keynotes & Panels",
      "Direct BKC Metro Line 3 Skywalk Access",
      "Smart NFC Badge Turnstile Ingress",
      "High-Speed Wi-Fi 7 & Recharge Hubs",
    ],
    accentColor: "blue",
    statusBadge: "Tomorrow • Event Day Mode",
    highlightStat: "12,000 Delegates",
    organizerInfo: {
      name: "Global Technology & AI Forum India",
      verified: true,
      supportContact: "+91 (022) 3500-1100",
      licenseNo: "TECH-EXP-MUM-2026-01",
    },
    guidelines: {
      permitted: [
        "Laptops, tablets, and mobile smartphones",
        "Official delegate badge and digital QR pass",
        "Business cards and marketing portfolios",
        "Personal water bottles (refill stations inside)",
      ],
      prohibited: [
        "Large luggage and non-transparent duffel bags",
        "External food items and outside catering",
        "Loud amplification equipment",
      ],
      bagPolicy: "Standard laptop backpacks permitted. Complimentary secure cloakroom at Level 1 Concourse.",
      entryRules: "Doors open at 08:30 IST. Keep your EventFlow digital badge active for seamless turnstile tap-in.",
    },
    faqs: [
      {
        question: "When do turnstiles open for badge collection?",
        answer: "Turnstiles open at 08:30 IST. Welcome breakfast and smart badge pick-up commence immediately in Concourse Hall A.",
      },
      {
        question: "Which metro line is closest to Jio World Convention Centre?",
        answer: "Mumbai Metro Line 3 (Aqua Line) BKC Station connects directly via a covered 200m pedestrian overpass.",
      },
      {
        question: "Is lunch and catering included with the Delegate Pass?",
        answer: "Yes, all delegate and VIP passes include the networking lunch buffet at the JWCC Dining Pavilion.",
      },
    ],
    gates: [
      { id: "gate-jwcc-1", name: "Gate 1 — BKC Grand Ingress", type: "Smart Turnstile Bank", status: "optimal", avgWaitMins: 2 },
      { id: "gate-jwcc-2", name: "Gate 2 — VIP & Speaker Fast Track", type: "Executive Express", status: "optimal", avgWaitMins: 1 },
      { id: "gate-jwcc-3", name: "Gate 3 — North Transit Overpass", type: "Metro Skywalk Link", status: "optimal", avgWaitMins: 2 },
    ],
    zones: [
      { id: "zone-plenary", name: "Grand Plenary Auditorium", capacity: "4,500", description: "Main stage for inaugural keynotes & global pioneer debates" },
      { id: "zone-pavilion-a", name: "Applied AI Exhibition Pavilion A", capacity: "5,000", description: "Enterprise demo booths and sovereign cloud hardware displays" },
      { id: "zone-lounge-vip", name: "Executive Founders Lounge", capacity: "2,500", description: "Private dealmaking pods and catered refreshments" },
    ],
    transport: [
      { type: "metro", title: "Mumbai Metro Line 3 (Aqua Line)", detail: "BKC Station (Exit 1 direct covered skywalk to Gate 1)", frequency: "Every 3 mins", badge: "Recommended" },
      { type: "shuttle", title: "EventFlow Electric Shuttle", detail: "Continuous loops connecting Bandra & Kurla Western Railway Stations", frequency: "Every 7 mins" },
      { type: "rideshare", title: "Ola / Uber Dedicated Drop Bay", detail: "Designated taxi turn-in at JWCC Gate 2 G-Block Plaza", frequency: "Continuous" },
    ],
    parking: [
      { id: "park-jwcc-p1", name: "JWCC Underground Multilevel Deck P1-P3", capacity: "2,500 Cars", occupied: "1,100 Cars", fee: "₹150 / day", status: "available", shuttleAvailable: false },
      { id: "park-bkc-overflow", name: "MMRDA Open Ground Overflow Parking", capacity: "3,000 Cars", occupied: "800 Cars", fee: "₹100 / day", status: "available", shuttleAvailable: true },
    ],
    hospitality: [
      { type: "f&b", title: "Jio World Culinary Boulevard & Cafes", location: "Level 1 & 2 Atriums", details: "Artisan coffee bars, grab-and-go salads, continental breakfast & executive lunch", mobileOrdering: true },
      { type: "hydration", title: "Complimentary Chilled RO Water Hubs", location: "Outside every seminar hall", details: "Free purified water dispensers with compostable paper cups", mobileOrdering: false },
      { type: "medical", title: "Apollo Emergency Medical Station", location: "Gate 1 Concierge Wing", details: "Certified paramedics, trauma kit & defibrillators on standby", mobileOrdering: false },
    ],
    schedule: [
      { time: "08:30 IST", activity: "Delegate Registration & Welcome Breakfast", description: "Smart NFC badge collection and morning networking mixer" },
      { time: "09:30 IST", activity: "Inaugural Plenary: The Sovereign AI Era", description: "Global pioneer keynote addresses on frontier intelligence" },
      { time: "12:30 IST", activity: "Networking Luncheon & Venture Showcase", description: "Catered executive buffet across Hall 2 Dining Promenade" },
      { time: "14:30 IST", activity: "Generative Enterprise Breakthrough Demos", description: "Live demonstrations of next-gen autonomous systems" },
      { time: "17:30 IST", activity: "Global Unicorn AI Awards & Closing Reception", description: "Evening social mixer with celebratory hors d'oeuvres" },
    ],
  },

  // EVENT 2 — FEW DAYS LATER (CONCERT TICKET DESIGN)
  {
    id: "mumbai-music-fest-2026",
    name: "Mumbai Music Festival 2026",
    category: "Concerts",
    date: event2DateStr,
    time: "16:00 - 23:30 IST",
    location: "Goregaon East, Western Express Highway, Mumbai, Maharashtra, India",
    venue: "NESCO Centre, Mumbai",
    district: "Goregaon East",
    state: "Maharashtra",
    country: "India",
    latitude: 19.1551,
    longitude: 72.8532,
    capacity: "25,000",
    expectedAttendance: "24,000",
    description:
      "[DEMO EVENT] Mumbai's flagship electronic and live acoustic music gathering featuring international headliners, immersive stage projections, artisan culinary bazaars, and sunset soundscapes.",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    ],
    agePolicy: "16+ strictly. Valid photo government ID required at turnstiles.",
    language: "English & Hindi Live Performances",
    duration: "7.5 Hours",
    highlights: [
      "25,000 Fans Outdoor Acoustic Amphitheatre",
      "3 Immense Visual Stages with 4K LED Walls",
      "Artisan Flea Market & Cocktail Boulevard",
      "Direct Western Railway & Metro 7 Link",
      "Cashless RFID Wristband Ecosystem",
    ],
    accentColor: "indigo",
    statusBadge: "Concert • 4 Days Away",
    highlightStat: "25,000 Music Lovers",
    organizerInfo: {
      name: "Sunwave Live Entertainment",
      verified: true,
      supportContact: "+91 (022) 2875-9922",
      licenseNo: "MMF-MUM-CON-2026",
    },
    guidelines: {
      permitted: [
        "Smartphones, chargers, and compact battery banks",
        "Small clutches or fanny packs up to 10\" x 10\"",
        "Sunglasses, hats, and light festival gear",
      ],
      prohibited: [
        "Professional zoom lens DSLRs and recording rigs",
        "Outside food, glass bottles, and alcoholic drinks",
        "Glowsticks, laser pointers, and aerosol sprays",
      ],
      bagPolicy: "Small personal waistbags permitted. No standard backpacks allowed inside concert arena.",
      entryRules: "Turnstiles open at 16:00 IST. Re-entry is not permitted once scanned.",
    },
    faqs: [
      {
        question: "When do festival gates open?",
        answer: "Gates open at 16:00 IST. Sunset DJ sessions begin promptly at 17:30 IST on the Garden Stage.",
      },
      {
        question: "Can I bring food or water inside?",
        answer: "Outside food and drinks are strictly barred. Complimentary chilled water dispensers are placed throughout the arena.",
      },
    ],
    gates: [
      { id: "gate-nesco-1", name: "Gate 1 — Western Express Highway Portal", type: "Main Spectator Turnstiles", status: "optimal", avgWaitMins: 3 },
      { id: "gate-nesco-2", name: "Gate 2 — Ram Mandir Station Link", type: "Rapid Pedestrian Ingress", status: "optimal", avgWaitMins: 2 },
      { id: "gate-nesco-3", name: "Gate 3 — VIP Lounge Fast Track", type: "Club Portal", status: "optimal", avgWaitMins: 1 },
    ],
    zones: [
      { id: "zone-pit", name: "Golden Circle Pitch Standing", capacity: "8,000", description: "Direct front-of-stage sightlines under lighting trusses" },
      { id: "zone-ga", name: "General Admission Lawn", capacity: "13,000", description: "Spacious festival meadow with panoramic stage sightlines" },
      { id: "zone-vip-deck", name: "Elevated VIP Lounge Deck", capacity: "4,000", description: "Private viewing platform, dedicated bar & air-conditioned lounge" },
    ],
    transport: [
      { type: "metro", title: "Mumbai Metro Line 7 (Red Line)", detail: "Goregaon East Station (5 min pedestrian walk to Gate 1)", frequency: "Every 4 mins", badge: "Recommended" },
      { type: "train", title: "Western Suburban Railway", detail: "Ram Mandir Station (Direct walkway to NESCO East Gate 2)", frequency: "Every 3 mins" },
      { type: "rideshare", title: "NESCO Dedicated Taxi Bay", detail: "Drop-off and pick-up at Gate 1 service road", frequency: "Continuous" },
    ],
    parking: [
      { id: "park-nesco-lotb", name: "NESCO Multilevel Parking Deck B", capacity: "2,000 Cars", occupied: "1,200 Cars", fee: "₹250 / event", status: "available", shuttleAvailable: false },
      { id: "park-hub-mall", name: "The Hub Mall Overflow Lot", capacity: "1,500 Cars", occupied: "900 Cars", fee: "₹200 / event", status: "available", shuttleAvailable: true },
    ],
    hospitality: [
      { type: "f&b", title: "Global Street Food Village", location: "Central Festival Lawn", details: "Gourmet burgers, tacos, Asian noodles, craft mocktails & gelato", mobileOrdering: true },
      { type: "hydration", title: "Free Chilled Water Stations", location: "Concert Lawn Perimeter", details: "Unlimited pure drinking water refills for all attendees", mobileOrdering: false },
      { type: "medical", title: "Red Cross Emergency First Aid Hub", location: "Adjacent to Gate 1 Concourse", details: "Trained medical emergency staff and rapid response team", mobileOrdering: false },
    ],
    schedule: [
      { time: "16:00 IST", activity: "Festival Gates & Food Village Open", description: "Early entry, sponsor zones & festival flea market active" },
      { time: "17:30 IST", activity: "Indie Electronic Opening Recitals", description: "Melodic ambient beats as the sun sets over Mumbai" },
      { time: "19:15 IST", activity: "Co-Headline Melodic Symphonic Set", description: "Live vocal and acoustic set with 20-piece ensemble" },
      { time: "21:00 IST", activity: "Grand Headline Stadium Performance & Lasers", description: "2-hour mainstage visual and audio spectacle with fireworks" },
    ],
  },

  // EVENT 3 — WANKHEDE (SPORTS TICKET DESIGN)
  {
    id: "mumbai-cricket-wankhede-2026",
    name: "Mumbai Cricket Night — Wankhede",
    category: "Sports",
    date: event3DateStr,
    time: "17:00 - 23:30 IST",
    location: "D Road, Churchgate, Marine Drive, Mumbai, Maharashtra, India",
    venue: "Wankhede Stadium, Mumbai",
    district: "Churchgate",
    state: "Maharashtra",
    country: "India",
    latitude: 18.9389,
    longitude: 72.8258,
    capacity: "33,000",
    expectedAttendance: "32,800",
    description:
      "[DEMO EVENT] High-voltage T20 twilight cricket clash under the iconic floodlights of Wankhede Stadium. Featuring premier Indian and international cricket superstars competing before a passionate 33,000-seat stadium crowd right off Marine Drive.",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
    ],
    agePolicy: "All ages welcome. Children over 3 require standard admission tickets.",
    language: "English & Hindi Commentary",
    duration: "4.5 Hours",
    highlights: [
      "Iconic 33,000-Seat Seafront Wankhede Stadium",
      "Garware Pavilion, Sachin Tendulkar & Sunil Gavaskar Stands",
      "2-Minute Walk from Churchgate Railway Station",
      "High-Power LED Floodlights & Pyro Presentation",
      "Official Team Merchandise & Fan Village Stalls",
    ],
    accentColor: "blue",
    statusBadge: "Sports Demo Event",
    highlightStat: "33,000 Packed Stadium",
    organizerInfo: {
      name: "Mumbai Cricket Association (MCA)",
      verified: true,
      supportContact: "+91 (022) 2279-5500",
      licenseNo: "MCA-WANK-T20-2026",
    },
    guidelines: {
      permitted: [
        "Mobile phones and personal chargers",
        "Prescription medications with doctor's prescription",
        "Official team banners without wooden or metal poles",
      ],
      prohibited: [
        "Bottles, cans, coins, and metal cutlery",
        "Helmets, umbrellas with pointed tips, and backpacks",
        "Crackers, flares, and laser torches",
      ],
      bagPolicy: "No backpacks or large bags permitted inside stadium bowl. Cloakrooms available at Churchgate Station.",
      entryRules: "Gates open at 16:30 IST. Arrive within your designated entry window to clear barcode scanners smoothly.",
    },
    faqs: [
      {
        question: "When do stadium gates open?",
        answer: "Stadium gates open at 16:30 IST, exactly 3 hours before the 19:30 match commencement.",
      },
      {
        question: "Which railway station is closest to Wankhede?",
        answer: "Churchgate Station (Western Line terminus) is literally 200m from Gate 1 and Gate 4.",
      },
    ],
    gates: [
      { id: "gate-wank-4", name: "Gate 4 — D Road Garware Turnstiles", type: "Main Pavilion Ingress", status: "optimal", avgWaitMins: 3 },
      { id: "gate-wank-1", name: "Gate 1 — Vinoo Mankad Gate", type: "Vip & Club Portal", status: "optimal", avgWaitMins: 1 },
      { id: "gate-wank-7", name: "Gate 7 — Marine Drive North Turnstiles", type: "Public Grandstand", status: "optimal", avgWaitMins: 4 },
    ],
    zones: [
      { id: "zone-garware", name: "Garware Pavilion Level 2", capacity: "9,000", description: "Direct view behind bowler's arm with cushioned bucket seating" },
      { id: "zone-tendulkar", name: "Sachin Tendulkar Stand", capacity: "12,000", description: "Vibrant cheering concourse right on midwicket boundary" },
      { id: "zone-gavaskar", name: "Sunil Gavaskar Grandstand", capacity: "12,000", description: "Unobstructed elevation over square leg and extra cover" },
    ],
    transport: [
      { type: "train", title: "Western Railway (Churchgate Station)", detail: "Terminal station 2 minutes walking distance from Gate 1 & Gate 4", frequency: "Every 3 mins", badge: "Recommended" },
      { type: "train", title: "Central Railway (CSMT Station)", detail: "Fast taxi or feeder bus connection (10 mins to stadium)", frequency: "Every 4 mins" },
      { type: "bus", title: "BEST Special Match Shuttles", detail: "Direct routes from Dadar, Bandra, and CST to Marine Drive", frequency: "Every 5 mins" },
    ],
    parking: [
      { id: "park-brabourne", name: "Brabourne Stadium Cricket Club Lot", capacity: "1,200 Cars", occupied: "950 Cars", fee: "₹300 / match", status: "available", shuttleAvailable: true },
      { id: "park-nariman", name: "Nariman Point Pay & Park Grounds", capacity: "2,000 Cars", occupied: "1,400 Cars", fee: "₹200 / match", status: "available", shuttleAvailable: true },
    ],
    hospitality: [
      { type: "f&b", title: "Wankhede Stadium Canteen Concourse", location: "Level 1 & 2 Stands", details: "Famous Mumbai Vada Pav, Frankie wraps, popcorn, tea and cold sodas", mobileOrdering: true },
      { type: "hydration", title: "Free Chilled RO Water Dispensers", location: "Every 20 meters along concourses", details: "Eco-friendly free drinking water points for all stand spectators", mobileOrdering: false },
      { type: "medical", title: "Red Cross Stadium Trauma Center", location: "Under Garware Pavilion Gate 4", details: "Physicians, emergency triage and ambulances stationed on-site", mobileOrdering: false },
    ],
    schedule: [
      { time: "16:30 IST", activity: "Stadium Turnstiles & Fan Merchandise Open", description: "Early entry, DJ tunes, face painting and batting simulator zones" },
      { time: "18:30 IST", activity: "Team Warm-ups & Pitch Inspection", description: "Players take the outfield for fielding drills and boundary catches" },
      { time: "19:00 IST", activity: "Official Match Toss & Team Playing XI", description: "Captains take center pitch for live toss broadcast" },
      { time: "19:30 IST", activity: "Match Commences: First Ball Bowled", description: "Opening 20 overs begin under floodlights" },
      { time: "23:15 IST", activity: "Post-Match Presentation & Fireworks", description: "Man of the match trophy, captain interviews, and victory lap" },
    ],
  },

  // EVENT 4 — FUTURE EVENT (LARGE GATHERINGS / CONFERENCE PRE-EVENT > 24H)
  {
    id: "india-innovation-summit-2026",
    name: "India Innovation & Technology Summit 2026",
    category: "Large Gatherings",
    date: event4DateStr,
    time: "09:00 - 18:30 IST",
    location: "10th Mile, Tumkur Road, Madavara, Bengaluru, Karnataka, India",
    venue: "Bengaluru International Exhibition Centre, Bengaluru",
    district: "Tumkur Road Corridor",
    state: "Karnataka",
    country: "India",
    latitude: 13.0645,
    longitude: 77.4699,
    capacity: "40,000",
    expectedAttendance: "38,500",
    description:
      "[DEMO EVENT] Asia's largest multi-industry convention for robotics, green energy, deeptech and industrial innovation. Gathering 40,000+ engineers, researchers and venture pioneers across 5 expansive exhibition halls.",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
    ],
    agePolicy: "All professional delegates and student innovators welcome.",
    language: "English",
    duration: "3 Full Days",
    highlights: [
      "BIEC Multi-Acre Campus & 5 Mega Exhibition Halls",
      "500+ Deeptech, Robotics & Clean Energy Pavilions",
      "Direct Madavara Green Line Metro Overbridge",
      "Automated High-Throughput Turnstile Ingress",
      "Outdoor Electric Mobility Demonstration Track",
    ],
    accentColor: "indigo",
    statusBadge: "Future Mega Summit",
    highlightStat: "40,000+ Delegates",
    organizerInfo: {
      name: "Confederation of Indian Tech Innovators",
      verified: true,
      supportContact: "+91 (080) 4122-8800",
      licenseNo: "CITI-BIEC-2026-INNO",
    },
    guidelines: {
      permitted: [
        "Laptops, presentation devices, and portable chargers",
        "Official delegate RFID badges and digital credentials",
        "Product samples and startup demo kits",
      ],
      prohibited: [
        "Flammable materials, drones without flight clearance, and hazard devices",
        "External non-approved catering inside conference halls",
      ],
      bagPolicy: "Standard briefcases and backpacks permitted. Complimentary secure luggage cloakroom at BIEC Main Plaza.",
      entryRules: "Doors open at 08:30 IST. Show EventFlow QR token at Gate 1 or Gate 3 turnstiles.",
    },
    faqs: [
      {
        question: "How do I reach BIEC from Bengaluru Airport (KIA)?",
        answer: "Direct KIA-8 airport luxury air-conditioned electric buses run directly to Madavara BIEC entrance every 30 minutes.",
      },
      {
        question: "Which metro line serves the venue directly?",
        answer: "Namma Metro Green Line's Madavara Station is adjacent to BIEC with an enclosed pedestrian skywalk.",
      },
    ],
    gates: [
      { id: "gate-biec-1", name: "Gate 1 — Tumkur Highway Main Gate", type: "High-Throughput Turnstiles", status: "optimal", avgWaitMins: 2 },
      { id: "gate-biec-3", name: "Gate 3 — Madavara Metro Skywalk Gate", type: "Rapid Transit Portal", status: "optimal", avgWaitMins: 1 },
      { id: "gate-biec-vip", name: "Gate 5 — VIP & Diplomatic Concourse", type: "Executive Express", status: "optimal", avgWaitMins: 1 },
    ],
    zones: [
      { id: "zone-hall-1", name: "Hall 1 — Sovereign AI & Quantum Pavilion", capacity: "12,000", description: "Next-gen computing hardware, foundation models & enterprise cloud" },
      { id: "zone-hall-2", name: "Hall 2 — Green Mobility & Battery Tech", capacity: "14,000", description: "Electric vehicles, hydrogen powertrains and smart grid innovation" },
      { id: "zone-hall-3", name: "Hall 3 — Robotics & Aerospace Lab", capacity: "14,000", description: "Humanoid robotics, satellite components and automated drones" },
    ],
    transport: [
      { type: "metro", title: "Namma Metro Green Line", detail: "Madavara Station (Direct covered skybridge into Gate 3)", frequency: "Every 4 mins", badge: "Recommended" },
      { type: "bus", title: "BMTC Special Electric Feeder Fleet", detail: "Connecting Majestic Railway Station and Yeshwanthpur Hub", frequency: "Every 6 mins" },
      { type: "rideshare", title: "BIEC Dedicated Taxi & Cab Boulevard", detail: "Designated drop and pickup terminal inside Gate 1", frequency: "Continuous" },
    ],
    parking: [
      { id: "park-biec-main", name: "BIEC Dedicated Surface Multilevel Lot", capacity: "5,000 Cars", occupied: "2,200 Cars", fee: "Complimentary for delegates", status: "available", shuttleAvailable: true },
      { id: "park-tumkur-p2", name: "Tumkur Road North Overflow Ground", capacity: "3,500 Cars", occupied: "1,100 Cars", fee: "Free Public Parking", status: "available", shuttleAvailable: true },
    ],
    hospitality: [
      { type: "f&b", title: "BIEC Grand International Food Court", location: "Central Plaza between Halls 2 & 3", details: "South Indian filter coffee, dosas, pan-Asian cuisine, Italian pastas & artisan deli", mobileOrdering: true },
      { type: "hydration", title: "Purified Chilled Water Pavilions", location: "Every 40m along exhibition corridors", details: "Free drinking water dispensers with compostable paper cups", mobileOrdering: false },
      { type: "medical", title: "Fortis Healthcare Emergency Medical Clinic", location: "Gate 1 Concierge Complex", details: "Full emergency triage, cardiac defibrillators & 2 standby ambulances", mobileOrdering: false },
    ],
    schedule: [
      { time: "08:30 IST", activity: "Delegate Registration & Welcome Breakfast", description: "Smart NFC badge collection and morning tea reception" },
      { time: "09:30 IST", activity: "Inaugural Keynote: Building Tomorrow's DeepTech", description: "Opening address by leading researchers and industry heads" },
      { time: "12:30 IST", activity: "Networking Luncheon & Startup Pitch Arena", description: "Catered luncheon with 100+ seed-stage venture presentations" },
      { time: "15:00 IST", activity: "Breakthrough Robotics & Mobility Demos", description: "Outdoor demonstration track trials and live autonomous hardware" },
      { time: "17:30 IST", activity: "Global Tech Pioneer Awards & Networking Mixer", description: "Evening social reception with live acoustic music" },
    ],
  },
  // EVENT 5 — DELHI BHARAT MANDAPAM (CONFERENCES & DEEPTECH SUMMIT)
  {
    id: "delhi-global-tech-summit-2026",
    name: "Delhi Global AI & DeepTech Summit 2026",
    category: "Conferences",
    date: event5DateStr,
    time: "09:00 - 18:30 IST",
    location: "Pragati Maidan, Mathura Road, New Delhi, Delhi 110001, India",
    venue: "Bharat Mandapam, Pragati Maidan, New Delhi",
    address: "Pragati Maidan, Mathura Road, New Delhi, Delhi 110001, India",
    placeId: "ChIJ_delhi_mandapam_demo",
    district: "Central Delhi",
    state: "Delhi",
    country: "India",
    latitude: 28.6186,
    longitude: 77.2435,
    capacity: "20,000",
    expectedAttendance: "18,500",
    description:
      "[DEMO EVENT] India's capital world-stage summit at the iconic Bharat Mandapam complex. Hosting 20,000+ national delegates, policymakers, AI architects, and international technology missions across 6 grand plenaries and multilateral exhibition halls.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
    ],
    agePolicy: "Professional delegates and enterprise leaders (18+).",
    language: "English & Hindi",
    duration: "2 Full Days",
    highlights: [
      "G20 Plenary Hall & Multilateral Tier-1 Auditorium",
      "Underpass Tunnel Connecting Mathura Road Directly",
      "Supreme Court Metro Station Direct Pedestrian Link",
      "Automated NFC Delegate Ingress & Smart Badge Printing",
      "High-Density 5G Private Network across all Pavilions",
    ],
    accentColor: "blue",
    statusBadge: "Capital Summit • Delhi",
    highlightStat: "20,000 Leaders",
    organizerInfo: {
      name: "National Technology Council of India (NTC)",
      verified: true,
      supportContact: "+91 (011) 2337-1800",
      licenseNo: "NTC-DEL-MANDAPAM-2026",
    },
    guidelines: {
      permitted: [
        "Laptops, tablets, and personal smartphones",
        "Official delegate RFID credentials and digital QR passes",
        "Personal portfolios and business accessories",
      ],
      prohibited: [
        "Large non-transparent suitcases and luggage bags",
        "Flammables, aerosol sprays, and sharp metallic objects",
        "Outside catering and non-sealed beverages",
      ],
      bagPolicy: "Standard executive laptop bags allowed. Secure cloakrooms at Gates 4 and 10.",
      entryRules: "Doors open at 08:30 IST. Show EventFlow QR code at Gate 10 Metro entrance or Gate 4 VIP entrance.",
    },
    faqs: [
      {
        question: "Which metro station provides direct access to Bharat Mandapam?",
        answer: "Supreme Court Metro Station (Blue Line) connects directly via Gate 10 covered underpass without crossing traffic.",
      },
      {
        question: "Is delegate parking available inside Bharat Mandapam?",
        answer: "Yes, Basement 1 & 2 multilevel underground parking offers 4,800 automated sensor slots with direct lift access.",
      },
    ],
    gates: [
      { id: "gate-del-10", name: "Gate 10 — Supreme Court Metro Underpass", type: "Rapid Transit Turnstiles", status: "optimal", avgWaitMins: 2 },
      { id: "gate-del-4", name: "Gate 4 — Mathura Road VIP & Speaker Portal", type: "Executive Express Ingress", status: "optimal", avgWaitMins: 1 },
      { id: "gate-del-6", name: "Gate 6 — Bhairon Marg North Concourse", type: "High-Capacity Turnstile Bank", status: "optimal", avgWaitMins: 2 },
    ],
    zones: [
      { id: "zone-del-plenary", name: "Grand Plenary Amphitheatre", capacity: "7,000", description: "Main keynote hall for national digital infrastructure & sovereign AI addresses" },
      { id: "zone-del-hall3", name: "Exhibition Hall 3 & 4 (Enterprise Cloud)", capacity: "8,500", description: "Frontier hardware, GPU superclusters and autonomous robotics booths" },
      { id: "zone-del-lounge", name: "Diplomatic & Founder Bilateral Lounge", capacity: "4,500", description: "Private dealmaking suites and executive dining promenade" },
    ],
    transport: [
      { type: "metro", title: "Delhi Metro Blue Line (Supreme Court Station)", detail: "Exit 2 direct underpass leading directly to Gate 10 Turnstiles", frequency: "Every 2.5 mins", badge: "Recommended" },
      { type: "bus", title: "DTC Mandapam Electric AC Express", detail: "Feeder loops connecting New Delhi & Old Delhi Railway Stations", frequency: "Every 5 mins" },
      { type: "rideshare", title: "Bhairon Marg Dedicated App Cab Terminal", detail: "Designated Ola / Uber pickup & drop-off bay with waiting lounge", frequency: "Continuous" },
    ],
    parking: [
      { id: "park-del-mandapam", name: "Bharat Mandapam Underground Smart Deck P1-P2", capacity: "4,800 Cars", occupied: "2,100 Cars", fee: "₹200 / day", status: "available", shuttleAvailable: false },
      { id: "park-del-bhairon", name: "Bhairon Marg Surface Overflow Lot", capacity: "3,200 Cars", occupied: "1,400 Cars", fee: "₹120 / day", status: "available", shuttleAvailable: true },
    ],
    hospitality: [
      { type: "f&b", title: "Mandapam Executive Dining & Plenary Bistro", location: "Level 2 Atrium Promenade", details: "Mughlai delicacies, continental salads, artisan bakery & filter coffee", mobileOrdering: true },
      { type: "hydration", title: "Complimentary RO Drinking Water Hubs", location: "All hall concourses and gate rotundas", details: "Pure drinking water refill stations with paper cups", mobileOrdering: false },
      { type: "medical", title: "Apollo Mandapam Onsite Emergency Triage Center", location: "Gate 10 Medical Complex", details: "Physicians, cardiac defibrillators, oxygen & 3 dedicated standby ambulances", mobileOrdering: false },
    ],
    accommodation: [
      { id: "del-acc-1", name: "The Lalit New Delhi", type: "Hotel", distance: "2.8 km", rating: 4.8, priceRange: "₹11,000 / night", address: "Barakhamba Avenue, Connaught Place, New Delhi", shuttleConnected: true, status: "Available" },
      { id: "del-acc-2", name: "Shangri-La Eros New Delhi", type: "Hotel", distance: "2.9 km", rating: 4.9, priceRange: "₹14,000 / night", address: "19 Ashoka Road, Connaught Place, New Delhi", shuttleConnected: true, status: "Limited" },
    ],
    foodDining: [
      { id: "del-fd-1", name: "Mandapam Executive Dining & Plenary Bistro", type: "Food Court", location: "Level 2 Atrium", avgWaitMins: 4, mobileOrdering: true, status: "Normal" },
      { id: "del-fd-2", name: "Gulati Restaurant Pandara Road", type: "Restaurant", location: "Pandara Road Market (2.1 km)", avgWaitMins: 12, mobileOrdering: false, status: "High Demand" },
    ],
    medicalAssistance: [
      { id: "del-med-1", name: "Apollo Mandapam Onsite Emergency Triage", type: "Medical Desk", location: "Gate 10 Rotunda", staffCount: 12, contactNumber: "+91 11 2337 1899", status: "Operational" },
      { id: "del-med-2", name: "Dr. Ram Manohar Lohia Hospital Emergency Post", type: "First Aid", location: "Connaught Place Hub (3.5 km)", staffCount: 30, contactNumber: "+91 11 2336 5525", status: "Operational" },
    ],
    schedule: [
      { time: "08:30 IST", activity: "Delegate Registration & Welcome Breakfast", description: "Smart NFC badge collection and executive breakfast mixer" },
      { time: "09:30 IST", activity: "Inaugural Plenary: Frontier AI & Sovereign Tech", description: "Opening keynote by national leadership and global tech pioneers" },
      { time: "12:30 IST", activity: "Executive Luncheon & Venture Showcase", description: "Catered networking luncheon across Plenary Dining Atrium" },
      { time: "14:30 IST", activity: "Breakthrough Enterprise AI Demos", description: "Live demonstrations of next-gen sovereign foundation models" },
      { time: "17:30 IST", activity: "National DeepTech Leadership Awards & Reception", description: "Evening social reception with live acoustic recitals" },
    ],
  },
  {
    id: "ipl-grand-final-2026",
    name: "TATA IPL Grand Final 2026: Championship Climax",
    category: "Sports",
    date: "May 31, 2026",
    time: "19:30 - 23:45 IST",
    location: "Ahmedabad, Gujarat, India",
    venue: "Narendra Modi Stadium, Motera",
    district: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    latitude: 23.0917,
    longitude: 72.5975,
    capacity: "132,000",
    expectedAttendance: "128,500",
    description:
      "The world's highest-attended cricket final featuring the top two franchises competing for the coveted TATA IPL Trophy. Experience thunderous crowd cheers under high-intensity stadium floodlights, accompanied by dazzling pre-match laser choreography and national anthems.",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
    ],
    agePolicy: "All age groups welcome. Children above 3 require a valid ticket.",
    language: "English & Hindi Stadium Commentary",
    duration: "4.5 Hours",
    highlights: [
      "132,000 Capacity World Record Stadium",
      "360° LED Ribbon & 4K Mega Screens",
      "Official Team Merchandise Pavilions",
      "Direct Sabarmati Riverfront Metro Skywalk",
      "Chilled RO Water Dispenser Points Every 50m",
    ],
    accentColor: "blue",
    statusBadge: "Championship Final",
    highlightStat: "132,000 Fans Capacity",
    organizerInfo: {
      name: "Board of Control for Cricket in India (BCCI)",
      verified: true,
      supportContact: "+91 (079) 2755-4000",
      licenseNo: "BCCI-IPL-FIN-2026-09",
    },
    guidelines: {
      permitted: [
        "Smartphones and mobile power banks",
        "Prescription medicines with medical badge",
        "Transparent bags up to 12\" x 12\"",
        "Official national and team flags without wooden sticks",
      ],
      prohibited: [
        "Professional DSLR / zoom camera gear without media credential",
        "Outside food, canned beverages, and alcoholic drinks",
        "Laser pointers, fireworks, and smoke devices",
        "Helmets, sharp metallic objects, and large umbrellas",
      ],
      bagPolicy: "Clear PVC bags up to 12x12x6 inches permitted. Standard backpack cloakrooms available at Gates 1, 2, and 4.",
      entryRules: "Gates open at 16:30 IST (3 hours prior). Physical wristbands or digital barcode passes must be kept active throughout.",
    },
    faqs: [
      {
        question: "When do the stadium entry gates open?",
        answer: "Gates open strictly at 16:30 IST, 3 hours before the 19:30 toss. Early arrival is highly encouraged to clear fast-track security checkpoints.",
      },
      {
        question: "Is metro transit integrated with stadium ingress?",
        answer: "Yes! Motera Stadium Metro Station connects directly to Gate 1 and Gate 2 concourses via elevated pedestrian walkways.",
      },
      {
        question: "Are drinking water and medical aid available inside?",
        answer: "Complimentary drinking water is provided at every stand level, along with 8 fully staffed Apollo Red Cross medical triage stations.",
      },
    ],
    gates: [
      { id: "gate-motera-1", name: "Gate 1 — Sabarmati Metro Concourse", type: "Rapid Rail Ingress", status: "optimal", avgWaitMins: 3 },
      { id: "gate-motera-2", name: "Gate 2 — West Grandstand Turnstiles", type: "High-Capacity Turnstile Bank", status: "optimal", avgWaitMins: 4 },
      { id: "gate-motera-3", name: "Gate 3 — VIP & Hospitality Portal", type: "Club Lounge Ingress", status: "optimal", avgWaitMins: 2 },
    ],
    zones: [
      { id: "zone-club", name: "Reliance Club Pavilion", capacity: "28,000", description: "Direct sightlines with air-conditioned lounge access" },
      { id: "zone-east", name: "Adani East Grandstand", capacity: "45,000", description: "Vibrant cheering section behind boundary ropes" },
      { id: "zone-north", name: "North Pavilion Upper Tier", capacity: "59,000", description: "Panoramic stadium bowl view with food boulevard" },
    ],
    transport: [
      { type: "metro", title: "Ahmedabad Metro Red Line", detail: "Motera Stadium Station (Exit 2 direct elevated skywalk to Gates 1 & 2)", frequency: "Every 2.5 mins" },
      { type: "bus", title: "AMTS Special Express Shuttles", detail: "Connecting Kalupur Railway Station & RTO Circle", frequency: "Every 5 mins" },
      { type: "shuttle", title: "Ring Road Park-and-Ride Fleet", detail: "Zero-emission electric buses from Sabarmati Riverfront bays", frequency: "Continuous loop" },
    ],
    parking: [
      { id: "park-motera-p1", name: "Motera Sports Enclave Parking Deck", capacity: "4,500 Cars", occupied: "3,200 Cars", fee: "₹200 / match", status: "available", shuttleAvailable: true },
      { id: "park-motera-p2", name: "Riverfront North Overflow Lot", capacity: "3,000 Cars", occupied: "2,400 Cars", fee: "₹150 / match", status: "available", shuttleAvailable: true },
    ],
    hospitality: [
      { type: "f&b", title: "Gujarati Gourmet & Street Food Street", location: "Concourses Level 1 & 3", details: "Kathiyawadi snacks, live pizza ovens, chai & fresh fruit juices", mobileOrdering: true },
      { type: "hydration", title: "Free Chilled RO Water Hubs", location: "All Gate concourses", details: "Eco-friendly refill cups available at no charge", mobileOrdering: false },
      { type: "merchandise", title: "Official IPL Fan Village", location: "North Forecourt Plaza", details: "Authentic jerseys, caps, autograph bats and fan accessories", mobileOrdering: false },
    ],
    schedule: [
      { time: "16:30 IST", activity: "Turnstiles Open & Fan Village Activation", description: "Live DJ, sponsor stalls and face-painting zones active" },
      { time: "18:45 IST", activity: "Grand Closing Ceremony & Laser Show", description: "Musical performances and stadium illumination sequence" },
      { time: "19:30 IST", activity: "Match Commences: First Ball Bowled", description: "First innings 20-over battle begins" },
      { time: "23:15 IST", activity: "Post-Match Presentation & Trophy Lift", description: "Fireworks, champion lap of honor and awards" },
    ],
  },
  {
    id: "coldplay-arijit-mumbai-2026",
    name: "Coldplay & Arijit Singh: Music of the Spheres Live Tour",
    category: "Concerts",
    date: "November 14 - 15, 2026",
    time: "18:00 - 23:00 IST",
    location: "Navi Mumbai, Maharashtra, India",
    venue: "D.Y. Patil Sports Stadium",
    district: "Navi Mumbai",
    state: "Maharashtra",
    country: "India",
    latitude: 19.0448,
    longitude: 73.0297,
    capacity: "55,000",
    expectedAttendance: "54,200",
    description:
      "A once-in-a-generation symphonic collaboration bringing together Coldplay's iconic stadium show and Arijit Singh's soulful masterpieces. Featuring kinetic LED wristbands, kinetic dance floors, solar-powered audio stacks, and breathtaking stadium pyrotechnics.",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
    ],
    agePolicy: "5+ years. Attendees under 16 must be accompanied by an adult guardian.",
    language: "English & Hindi",
    duration: "4.5 Hours",
    highlights: [
      "Synchronized Interactive LED Wristbands",
      "Kinetic Energy Dancefloors & Solar Powered Audio",
      "Immersive 360° Surround Sound Acoustic Grid",
      "World-Class Stage Pyrotechnics & Biodegradable Confetti",
      "Dedicated Eco-Village & Vegan Food Trucks",
    ],
    accentColor: "indigo",
    statusBadge: "Early Bird Sold Out",
    highlightStat: "55,000 Singing Voices",
    organizerInfo: {
      name: "BookMyShow Live & Live Nation India",
      verified: true,
      supportContact: "+91 (022) 6144-5000",
      licenseNo: "BMS-LN-COLDPLAY-2026",
    },
    guidelines: {
      permitted: [
        "Smartphones and compact power banks",
        "Clear bags under 10\" x 10\"",
        "Earplugs and hearing protection",
        "Empty reusable water bottles for refill at water hubs",
      ],
      prohibited: [
        "Professional cameras with detachable lenses and selfie sticks",
        "Laser pointers, glowsticks, and sharp items",
        "Outside food, drinks, and chewing gum",
        "Drones and unauthorized recording devices",
      ],
      bagPolicy: "Strict small bag policy. Clear bags up to 10x10 inches only.",
      entryRules: "Wristbands must be redeemed beforehand or at on-site redemption counters located at Sector 7.",
    },
    faqs: [
      {
        question: "How do I get my interactive LED wristband?",
        answer: "Every attendee receives an illuminated LED wristband upon entering their turnstile gate. Please return it at the collection bins after the show for recycling!",
      },
      {
        question: "What is the best way to travel from South Mumbai / Western Suburbs?",
        answer: "Take the Harbour Line train to Nerul Station or the Trans-Harbour Line to Juinagar. Special EventFlow express electric shuttles connect both stations directly to the stadium.",
      },
    ],
    gates: [
      { id: "gate-dyp-a", name: "Gate A — Sion-Panvel Highway Express Ingress", type: "Floor GA Standing", status: "optimal", avgWaitMins: 4 },
      { id: "gate-dyp-b", name: "Gate B — Nerul Promenade Turnstiles", type: "Grandstand Lower & Upper", status: "optimal", avgWaitMins: 3 },
      { id: "gate-dyp-c", name: "Gate C — VIP Diamond Club Portal", type: "Lounge & Hospitality", status: "optimal", avgWaitMins: 1 },
    ],
    zones: [
      { id: "zone-floor", name: "Standing Pitch GA", capacity: "18,000", description: "Immersive field access surrounding the main catwalk stage" },
      { id: "zone-west", name: "West Stand Level 1 & 2", capacity: "22,000", description: "Elevated sightlines facing the grand LED constellation" },
      { id: "zone-east", name: "East Concourse Seating", capacity: "15,000", description: "Direct view of stage right and visual towers" },
    ],
    transport: [
      { type: "train", title: "Mumbai Suburban Harbour Line", detail: "Nerul & Juinagar Railway Stations (10-min walk or free e-shuttle)", frequency: "Every 4 mins" },
      { type: "shuttle", title: "EventFlow City Express Fleet", detail: "Buses running from BKC, Dadar, Thane, and Vashi depots", frequency: "Every 8 mins" },
      { type: "rideshare", title: "Designated Uber / Ola Hub", detail: "Nerul Gymkhana grounds drop-off and pickup zone", frequency: "Continuous" },
    ],
    parking: [
      { id: "park-dyp-1", name: "Wonders Park Multilevel Parking", capacity: "3,500 Cars", occupied: "2,800 Cars", fee: "₹300 / event", status: "available", shuttleAvailable: true },
    ],
    hospitality: [
      { type: "f&b", title: "Mumbai Street Food & Global Bistro Stalls", location: "Concourses Level 1 & Outer Perimeter", details: "Kathi rolls, burgers, artisanal coffee, bao buns & ice creams", mobileOrdering: true },
      { type: "merchandise", title: "Coldplay & Arijit Official Tour Pop-Up", location: "Gates A, B & C Plazas", details: "Eco-cotton tees, tour posters, caps, and music memorabilia", mobileOrdering: true },
    ],
    schedule: [
      { time: "16:00 IST", activity: "Gates & Merchandise Village Open", description: "Early ingress to enjoy the interactive climate village" },
      { time: "18:00 IST", activity: "Opening Artist & Folk Ensemble", description: "Support performance by rising indie talent" },
      { time: "19:15 IST", activity: "Arijit Singh Symphonic Set", description: "60 minutes of soul-stirring melodies with 40-piece live orchestra" },
      { time: "20:45 IST", activity: "Coldplay Headline Spectacle", description: "2-hour stadium anthem set featuring collaborative duets" },
    ],
  },
  {
    id: "sunburn-goa-festival-2026",
    name: "Sunburn Goa: World EDM & Coastal Music Festival",
    category: "Festivals",
    date: "December 27 - 30, 2026",
    time: "15:00 - 01:00 IST",
    location: "Vagator, North Goa, India",
    venue: "Vagator Beach Arena & Cliffside Amphitheatre",
    district: "North Goa",
    state: "Goa",
    country: "India",
    latitude: 15.5997,
    longitude: 73.7432,
    capacity: "40,000",
    expectedAttendance: "38,500",
    description:
      "Asia's premier electronic dance music gathering overlooking the Arabian Sea. Four monumental stages, world number 1 DJs, immersive psychedelic art structures, beachside flea markets, and awe-inspiring sunset pyrotechnics.",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1468359601543-843bfaef291a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    ],
    agePolicy: "18+ only. Government-issued photo ID strictly required at entry.",
    language: "Multilingual / Universal Music",
    duration: "10 Hours Daily (4-Day Festival)",
    highlights: [
      "4 Immersive Megastages & Visual Art Portals",
      "Sunset Sessions overlooking Vagator Cliffs",
      "Top 10 DJ Mag Headliners & Live Synths",
      "Beachside Artisanal Bazaar & Goa Food Trail",
      "Medical Support & Safe-Space Sanctuary Tents",
    ],
    accentColor: "purple",
    statusBadge: "General Sale Active",
    highlightStat: "4 Megastages • 120+ DJs",
    organizerInfo: {
      name: "Spacebound Events & Sunburn Global",
      verified: true,
      supportContact: "+91 (0832) 245-7788",
      licenseNo: "GOA-TOUR-FEST-2026-88",
    },
    guidelines: {
      permitted: [
        "Small waist packs / fanny packs",
        "Sealed sunscreen lotions (non-aerosol)",
        "Mobile phones, portable power banks, and sunglasses",
        "Official festival RFID wristbands",
      ],
      prohibited: [
        "Any illegal substances (zero tolerance law enforcement policy)",
        "Liquor or outside beverages",
        "Professional cameras and tripods",
        "Sharp objects, lighters, and metal water flasks",
      ],
      bagPolicy: "Small bags only. Strict metal-detector and bag frisking protocols in effect.",
      entryRules: "Re-entry is not permitted on single-day passes. Multi-day festival passes allow one exit and re-entry per day before 19:00.",
    },
    faqs: [
      {
        question: "Is there a minimum age limit for Sunburn Goa?",
        answer: "Yes, Sunburn is strictly an 18+ event. A valid government photo ID (Aadhaar, Passport, or Driving License) is verified at wristband pickup.",
      },
      {
        question: "How do RFID cashless wristbands work?",
        answer: "All food, beverages, and merchandise at the festival are purchased via RFID wristbands. You can top them up online or at on-ground top-up kiosks.",
      },
    ],
    gates: [
      { id: "gate-sun-main", name: "Main Vagator Ingress Hub", type: "RFID Fast Scanning", status: "optimal", avgWaitMins: 3 },
      { id: "gate-sun-vip", name: "VIP Cliffside Lounge Gate", type: "Express Portal", status: "optimal", avgWaitMins: 1 },
    ],
    zones: [
      { id: "zone-solar", name: "Solaris Mainstage Arena", capacity: "22,000", description: "Iconic kinetic structure with massive bass arrays" },
      { id: "zone-techno", name: "Neon Jungle Deep Stage", capacity: "10,000", description: "Melodic techno & house under banyan tree canopy" },
      { id: "zone-psy", name: "Cosmic Dunes Psy Pavilion", capacity: "8,000", description: "Psychedelic UV visual artwork and progressive beats" },
    ],
    transport: [
      { type: "shuttle", title: "Sunburn Official Beach Shuttles", detail: "Connecting Calangute, Baga, Candolim, and Mapusa directly to Vagator", frequency: "Every 15 mins" },
      { type: "rideshare", title: "Goa Miles App Taxi Hub", detail: "Dedicated pre-paid pickup zone at Vagator Helipad grounds", frequency: "On-demand" },
    ],
    parking: [
      { id: "park-sun-1", name: "Anjuna-Vagator Bypass Event Lot", capacity: "2,200 Two-Wheelers & 1,500 Cars", occupied: "1,800 Vehicles", fee: "₹100 Bike / ₹250 Car", status: "available", shuttleAvailable: true },
    ],
    hospitality: [
      { type: "f&b", title: "Goan Beach Shack Flavours & Global Food Truck Court", location: "Outer Festival Boulevard", details: "Poi sandwiches, fish curry bowls, shawarmas, smoothies & coconut water", mobileOrdering: true },
      { type: "hydration", title: "Complimentary Hydration Tanks", location: "Next to all stage sound-towers", details: "Free purified cool water refills all day and night", mobileOrdering: false },
    ],
    schedule: [
      { time: "15:00 IST", activity: "Festival Gates & Flea Bazaar Open", description: "Acoustic beach lounge and daytime chillout sessions" },
      { time: "17:30 IST", activity: "Sunburn Sunset Ritual", description: "Pyrotechnics, drum circles and ceremonial lighting as sun dips" },
      { time: "20:00 IST", activity: "International Co-Headliners Live", description: "Heavy electro-house and progressive sets across 4 stages" },
      { time: "23:00 IST", activity: "Grand Headline Spectacular & Lasers", description: "Final closing set with massive firework display" },
    ],
  },
  {
    id: "bengaluru-tech-summit-2026",
    name: "Bengaluru Global AI & Tech Summit 2026",
    category: "Conferences",
    date: "November 18 - 20, 2026",
    time: "09:00 - 18:30 IST",
    location: "Bengaluru, Karnataka, India",
    venue: "Bangalore Palace Grounds, Vasanth Nagar",
    district: "Bengaluru Urban",
    state: "Karnataka",
    country: "India",
    latitude: 12.9982,
    longitude: 77.5921,
    capacity: "35,000",
    expectedAttendance: "32,400",
    description:
      "India's largest deep-tech and artificial intelligence convention. Bringing together global CTOs, Silicon Valley pioneers, unicorn founders, researchers, and venture capitalists across 6 interactive conference halls and an innovation expo.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80",
    ],
    agePolicy: "16+ (Professional & Academic Delegates).",
    language: "English",
    duration: "3 Full Days",
    highlights: [
      "250+ Keynotes from Global Tech Leaders",
      "500+ AI & Deep-Tech Startup Demo Booths",
      "Speed Networking & Investor Pitch Arenas",
      "Live Robotics & Quantum Computing Showcase",
      "Direct Metro Shuttle from Cubbon Park Station",
    ],
    accentColor: "teal",
    statusBadge: "Delegate Pass Ready",
    highlightStat: "250+ Tech Keynotes",
    organizerInfo: {
      name: "Department of IT & BT, Govt of Karnataka",
      verified: true,
      supportContact: "+91 (080) 2223-1100",
      licenseNo: "KA-BTS-2026-AI",
    },
    guidelines: {
      permitted: [
        "Laptops, tablets, smart devices, and chargers",
        "Professional portfolios and business cards",
        "Conference delegate bags and personal items",
      ],
      prohibited: [
        "Unauthorized merchandise selling or flyering",
        "Large baggage or luggage (cloakrooms provided at reception)",
        "Hazardous items and weapons",
      ],
      bagPolicy: "Standard professional backpacks and laptop bags allowed.",
      entryRules: "Digital delegate badges on the EventFlow app or physical printed pass must be displayed at all times.",
    },
    faqs: [
      {
        question: "Is there high-speed Wi-Fi throughout the venue?",
        answer: "Yes, complimentary enterprise-grade Wi-Fi 6 is provisioned across all exhibition halls and speaker auditoriums.",
      },
      {
        question: "Are networking lunches included with delegate passes?",
        answer: "All standard, VIP, and speaker passes include access to the daily executive networking buffet lunch and artisan coffee lounges.",
      },
    ],
    gates: [
      { id: "gate-bts-main", name: "Bellary Road Main Gate", type: "Smart NFC Turnstiles", status: "optimal", avgWaitMins: 1 },
      { id: "gate-bts-vip", name: "Jayachamaraja Road Executive Gate", type: "VIP Fast Track", status: "optimal", avgWaitMins: 1 },
    ],
    zones: [
      { id: "zone-keynote", name: "Grand Plenary Auditorium", capacity: "8,000", description: "Flagship executive announcements & global panels" },
      { id: "zone-expo", name: "Global Innovation Pavilions A-D", capacity: "18,000", description: "Startup displays, hardware demos & robotics track" },
      { id: "zone-lounge", name: "Founders & Investors Terrace", capacity: "9,000", description: "Private meeting pods and networking lounges" },
    ],
    transport: [
      { type: "metro", title: "Namma Metro Purple & Green Lines", detail: "Cubbon Park & Mantri Square Stations (5 mins by dedicated summit shuttle)", frequency: "Every 3 mins" },
      { type: "shuttle", title: "Tech Park Express Fleet", detail: "Connecting Electronic City, Whitefield, and Manyata directly to Palace Grounds", frequency: "Every 15 mins" },
    ],
    parking: [
      { id: "park-bts-1", name: "Palace Grounds Gate 4 Open Lot", capacity: "3,000 Cars", occupied: "1,900 Cars", fee: "Complimentary for delegates", status: "available", shuttleAvailable: true },
    ],
    hospitality: [
      { type: "f&b", title: "Executive Networking Buffet & South Indian Filter Coffee", location: "Central Pavilion Lawn", details: "Gourmet multi-cuisine spreads, live dosa counters & specialty espresso bars", mobileOrdering: true },
    ],
    schedule: [
      { time: "08:30 IST", activity: "Delegate Registration & Welcome Breakfast", description: "Smart NFC badge collection and morning networking" },
      { time: "09:30 IST", activity: "Inaugural Plenary: The Sovereign AI Era", description: "Global keynote addresses by distinguished pioneers" },
      { time: "12:30 IST", activity: "Networking Luncheon & Startup Pavilions", description: "Explore 500+ breakthrough venture booths" },
      { time: "17:00 IST", activity: "Global Unicorn Awards & Networking Mixer", description: "Evening social reception with live acoustic music" },
    ],
  },
  {
    id: "deepotsav-ayodhya-cultural-2026",
    name: "Deepotsav Grand Cultural Celebration & Laser Spectacle",
    category: "Large Gatherings",
    date: "October 18 - 20, 2026",
    time: "16:00 - 22:30 IST",
    location: "Ayodhya, Uttar Pradesh, India",
    venue: "Ram Ki Paidi & Saryu Riverfront Ghats",
    district: "Ayodhya",
    state: "Uttar Pradesh",
    country: "India",
    latitude: 26.7995,
    longitude: 82.2045,
    capacity: "250,000",
    expectedAttendance: "240,000",
    description:
      "A Guinness World Record cultural gathering witnessing 2.5 million earthen lamps (diyas) illuminating the holy Saryu riverfront. Accompanied by 3D architectural projection mapping, drone aerial choreography, traditional devotional music, and cultural tableaux from 16 states.",
    image: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80",
    ],
    agePolicy: "Family friendly. All age groups welcomed with open access.",
    language: "Hindi & Sanskrit Devotional Chants",
    duration: "6.5 Hours",
    highlights: [
      "2.5 Million Handcrafted Earthen Lamps Lighting",
      "Grand 3D Riverfront Laser & Drone Choreography",
      "Traditional Classical Music & Dance Tableaux",
      "Synchronized Crowd Flow Across 52 Ancient Ghats",
      "Free Refreshment & Mahaprasad Distribution",
    ],
    accentColor: "emerald",
    statusBadge: "Heritage Gathering",
    highlightStat: "2.5M Illuminated Lamps",
    organizerInfo: {
      name: "Department of Tourism & Culture, Uttar Pradesh",
      verified: true,
      supportContact: "+91 (0522) 223-8844",
      licenseNo: "UP-AYODHYA-DEEP-2026",
    },
    guidelines: {
      permitted: [
        "Mobile phones and personal cameras",
        "Small handbags and traditional offerings",
        "Personal drinking water bottles",
      ],
      prohibited: [
        "Open flammable fuels or unauthorized fireworks",
        "Drones without civil aviation clearance",
        "Single-use plastic bottles on river ghats",
      ],
      bagPolicy: "Small bags only. Security screening points located at all temple street entry archways.",
      entryRules: "Free entry for all public spectators. Please follow the illuminated green pedestrian corridors along the riverfront promenade.",
    },
    faqs: [
      {
        question: "Is there any ticket required to attend Deepotsav?",
        answer: "No, Deepotsav is a public cultural heritage festival with free entry. Dedicated viewing enclosures are cordoned off for elderly and family visitors.",
      },
      {
        question: "How is pedestrian safety managed around the ghats?",
        answer: "Continuous steel safety railings, 60 life-saving disaster response boats, and 2,000 trained civil volunteers ensure safe crowd flow along the water's edge.",
      },
    ],
    gates: [
      { id: "gate-deep-saryu", name: "Saryu Barrage Ingress Corridor", type: "Pedestrian Flow Corridors", status: "optimal", avgWaitMins: 2 },
      { id: "gate-deep-ramkatha", name: "Ram Katha Park Western Portal", type: "Family Access Zone", status: "optimal", avgWaitMins: 3 },
    ],
    zones: [
      { id: "zone-paidi", name: "Ram Ki Paidi Central Amphitheatre", capacity: "90,000", description: "Main diya lighting record zone and drone show view" },
      { id: "zone-ghats", name: "Saryu River Promenade", capacity: "110,000", description: "Continuous riverside walking path with cultural stages" },
      { id: "zone-park", name: "Ram Katha Park Cultural Stage", capacity: "50,000", description: "Live musical dramas, folk dances & classical recitals" },
    ],
    transport: [
      { type: "train", title: "Indian Railways (Ayodhya Dham Junction)", detail: "Ayodhya Dham & Ayodhya Cantt Stations (dedicated pedestrian shuttle fleet)", frequency: "Every 5 mins" },
      { type: "bus", title: "UPSRTC Special Electric Buses", detail: "Operating between Lucknow, Varanasi, Gorakhpur and Ayodhya terminals", frequency: "Every 10 mins" },
    ],
    parking: [
      { id: "park-deep-1", name: "Bypass Ring Road Multi-Acre Lots", capacity: "10,000 Vehicles", occupied: "6,500 Vehicles", fee: "Free Public Parking", status: "available", shuttleAvailable: true },
    ],
    hospitality: [
      { type: "f&b", title: "Traditional Awadhi Cuisine & Mahaprasad Bhandara", location: "Ram Katha Park & Ghat Forecourts", details: "Pure ghee sweets, hot khichdi prasad, masala chai & mineral water", mobileOrdering: false },
      { type: "hydration", title: "Filtered Chilled Water Kiosks", location: "Every 100 meters along all ghats", details: "Free purified water refills supported by municipal water works", mobileOrdering: false },
    ],
    schedule: [
      { time: "16:00 IST", activity: "Grand Cultural Heritage Procession (Shobha Yatra)", description: "Tableaux from 16 states showcasing ancient Indian epics" },
      { time: "18:00 IST", activity: "Maha Aarti on the Saryu Riverfront", description: "Chanting and ceremonial brass lamps lit by 1,100 priests" },
      { time: "18:45 IST", activity: "Guinness World Record 2.5 Million Diya Illumination", description: "Simultaneous lighting of earthen lamps across all 52 ghats" },
      { time: "20:00 IST", activity: "3D Holographic Projection & Mega Drone Show", description: "Sky symphony depicting cultural tales across the river horizon" },
    ],
  },
  {
    id: "india-trade-fair-delhi-2026",
    name: "India International Trade Fair & Global Tech Expo",
    category: "Conferences",
    date: "November 14 - 27, 2026",
    time: "10:00 - 19:30 IST",
    location: "New Delhi, Delhi NCR, India",
    venue: "Bharat Mandapam (Pragati Maidan)",
    district: "New Delhi",
    state: "Delhi NCR",
    country: "India",
    latitude: 28.6186,
    longitude: 77.2415,
    capacity: "80,000",
    expectedAttendance: "76,000",
    description:
      "South Asia's premier mega-exhibition held inside India's state-of-the-art Bharat Mandapam. Featuring 3,500+ exhibitors representing 28 states, union territories, and 40 foreign nations with trade deals, cultural pavilions, and state handicrafts.",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    ],
    agePolicy: "All ages welcome. Children under 5 enter free.",
    language: "English, Hindi & Regional Languages",
    duration: "14-Day Global Exhibition",
    highlights: [
      "Over 3,500 Exhibitors from 40+ Nations",
      "Iconic Bharat Mandapam Convention Halls",
      "State Craft & Culinary Heritage Pavilions",
      "Supreme Court Metro Underpass Direct Ingress",
      "Automated Baggage Scanners & Fast QR Gates",
    ],
    accentColor: "teal",
    statusBadge: "Global Trade Hub",
    highlightStat: "40+ Nations Exhibiting",
    organizerInfo: {
      name: "India Trade Promotion Organisation (ITPO)",
      verified: true,
      supportContact: "+91 (011) 2337-1540",
      licenseNo: "ITPO-DEL-IITF-2026",
    },
    guidelines: {
      permitted: [
        "Smartphones, laptops, and shopping carry bags",
        "Business brochures and commercial catalogs",
        "Baby strollers and mobility devices",
      ],
      prohibited: [
        "Flammable materials, sharp instruments, and weapons",
        "Outside alcohol or unauthorized loudspeakers",
      ],
      bagPolicy: "Standard shopping and hand luggage permitted through airport-style x-ray scanners.",
      entryRules: "Tickets can be validated digitally via QR code at any of the automated turnstiles at Gates 4, 6, and 10.",
    },
    faqs: [
      {
        question: "Which Metro station is closest to Bharat Mandapam?",
        answer: "Supreme Court Metro Station (Blue Line) features a covered pedestrian subway directly leading into Gate 10 of Bharat Mandapam.",
      },
      {
        question: "Is wheel-chair assistance available for elderly attendees?",
        answer: "Yes, free wheelchair assistance and battery-operated golf carts operate continuously between exhibition halls.",
      },
    ],
    gates: [
      { id: "gate-pragati-10", name: "Gate 10 — Supreme Court Metro Ingress", type: "Direct Rapid Transit Link", status: "optimal", avgWaitMins: 2 },
      { id: "gate-pragati-4", name: "Gate 4 — Mathura Road Turnstiles", type: "Vehicular & Pedestrian Portal", status: "optimal", avgWaitMins: 3 },
    ],
    zones: [
      { id: "zone-bharat", name: "Bharat Mandapam Plenary Halls 1-5", capacity: "35,000", description: "International and partner country innovations" },
      { id: "zone-states", name: "State Pavilions Hall 6-12", capacity: "30,000", description: "Handicrafts, textiles, tourism & culinary traditions" },
      { id: "zone-foods", name: "National Flavours Courtyard", capacity: "15,000", description: "Open-air food plazas from all Indian states" },
    ],
    transport: [
      { type: "metro", title: "Delhi Metro Blue Line", detail: "Supreme Court Metro Station (directly connects to Gate 10 via subway)", frequency: "Every 2.5 mins" },
      { type: "bus", title: "DTC Special Electric AC Fleet", detail: "Routes connecting New Delhi Railway Station, Kashmere Gate & AIIMS", frequency: "Every 6 mins" },
    ],
    parking: [
      { id: "park-iitf-1", name: "Bhairon Marg Underground Multilevel Facility", capacity: "3,000 Cars", occupied: "2,100 Cars", fee: "₹150 / day", status: "available", shuttleAvailable: true },
    ],
    hospitality: [
      { type: "f&b", title: "State Food Festival Court", location: "Hall 14 Forecourt", details: "Rajasthani Dal Baati, Hyderabadi Biryani, Bengali Sweets & South Indian Thalis", mobileOrdering: true },
    ],
    schedule: [
      { time: "10:00 IST", activity: "Exhibition Halls & Business Pavilions Open", description: "B2B meetings and open public walkthroughs begin" },
      { time: "14:00 IST", activity: "Cultural State Showcase Recitals", description: "Traditional dances and folk music in Central Open Amphitheatre" },
      { time: "19:30 IST", activity: "Daily Expo Closing & Phased Transit Egress", description: "Automated subway crowd metering active" },
    ],
  },
  {
    id: "formula-e-hyderabad-2026",
    name: "Hyderabad E-Prix & Global Green Mobility Expo",
    category: "Sports",
    date: "February 20 - 22, 2026",
    time: "09:00 - 18:00 IST",
    location: "Hyderabad, Telangana, India",
    venue: "Hyderabad Street Circuit, Hussain Sagar Waterfront",
    district: "Hyderabad",
    state: "Telangana",
    country: "India",
    latitude: 17.4156,
    longitude: 78.475,
    capacity: "45,000",
    expectedAttendance: "43,000",
    description:
      "High-octane FIA Formula E World Championship race roaring around the scenic Hussain Sagar Lake. World-class electric race cars reaching 320 km/h with zero emissions, surrounded by the gaming Allianz Fan Village and waterfront concerts.",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80",
    ],
    agePolicy: "All ages. Ear defenders strongly recommended for young children.",
    language: "English & Telugu Track Commentary",
    duration: "Full Weekend Grand Prix",
    highlights: [
      "2.8km FIA-Grade Street Circuit Around Hussain Sagar",
      "Gen3 Electric Racecars Reaching 320+ km/h",
      "Allianz Fan Village with Racing Simulators",
      "Paddock Club Luxury Dining & Pit-Lane Walks",
      "Lumbini Park & Secretariat Metro Connectivity",
    ],
    accentColor: "blue",
    statusBadge: "World Championship Race",
    highlightStat: "320 km/h Top Speed",
    organizerInfo: {
      name: "FIA Formula E & Govt of Telangana",
      verified: true,
      supportContact: "+91 (040) 2345-0011",
      licenseNo: "FIA-HYD-E-PRIX-2026",
    },
    guidelines: {
      permitted: [
        "Smartphones and compact power banks",
        "Hearing protection and ear muffs",
        "Clear bags up to 12\" x 12\"",
      ],
      prohibited: [
        "Glass bottles, alcohol, and sharp metal tools",
        "Large promotional flags or commercial banners",
        "Drones or radio-controlled devices",
      ],
      bagPolicy: "Strict bag checks at all circuit pedestrian overbridges.",
      entryRules: "All grandstand tickets provide assigned seat numbers with re-entry permitted upon scanning out.",
    },
    faqs: [
      {
        question: "Where are the best grandstands for race overtakes?",
        answer: "Grandstand 1 at Turn 3 (NTR Gardens hairpin) and Grandstand 3 along Tank Bund straightaway provide maximum overtaking action.",
      },
      {
        question: "Can I walk on the pit-lane?",
        answer: "Paddock Club and VIP pass holders enjoy scheduled Pit-Lane Walk sessions each morning before practice runs.",
      },
    ],
    gates: [
      { id: "gate-eprix-1", name: "Gate 1 — NTR Marg Grandstand Ingress", type: "Grandstand 1 & 2 Access", status: "optimal", avgWaitMins: 2 },
      { id: "gate-eprix-2", name: "Gate 2 — Secretariat Metro Walkway", type: "Rapid Metro Overbridge", status: "optimal", avgWaitMins: 2 },
    ],
    zones: [
      { id: "zone-gs1", name: "NTR Hairpin Grandstand", capacity: "16,000", description: "Braking zone and prime overtaking corner" },
      { id: "zone-village", name: "Allianz E-Village & Food Court", capacity: "18,000", description: "Simulators, live acoustic stage & team merchandise" },
      { id: "zone-paddock", name: "Waterfront Paddock Club", capacity: "11,000", description: "Exclusive pit-lane viewing and Michelin-star dining" },
    ],
    transport: [
      { type: "metro", title: "Hyderabad Metro Red Line", detail: "Khairatabad & Assembly Stations (8-min walk through dedicated marshaled paths)", frequency: "Every 3 mins" },
      { type: "shuttle", title: "Hitex & Gachibowli Express", detail: "Dedicated direct race shuttles from IT corridor hubs", frequency: "Every 10 mins" },
    ],
    parking: [
      { id: "park-eprix-1", name: "People's Plaza Reserved Deck", capacity: "2,000 Cars", occupied: "1,600 Cars", fee: "₹250 / day", status: "available", shuttleAvailable: true },
    ],
    hospitality: [
      { type: "f&b", title: "Hyderabadi Biryani & Artisan Cafe Village", location: "Allianz Fan Village", details: "Authentic Hyderabadi dum biryani, kebabs, specialty cold coffees & gelato", mobileOrdering: true },
    ],
    schedule: [
      { time: "09:00 IST", activity: "Circuit Gates & Fan Village Open", description: "Practice telemetry feeds and racing simulator battles" },
      { time: "11:40 IST", activity: "Qualifying & Duel Rounds", description: "Knockout single-lap battles for the Julius Baer Pole Position" },
      { time: "15:00 IST", activity: "Green Flag: Hyderabad E-Prix Race", description: "45 laps of fierce electric street-fighting action" },
      { time: "16:45 IST", activity: "Podium Ceremony & Lake Fireworks", description: "Trophy presentation and celebratory champagne showers" },
    ],
  },
  {
    id: "jaipur-literature-festival-2026",
    name: "Jaipur Literature & Royal Heritage Festival 2026",
    category: "Festivals",
    date: "January 22 - 26, 2026",
    time: "09:30 - 20:00 IST",
    location: "Jaipur, Rajasthan, India",
    venue: "Hotel Clarks Amer & Diggi Palace Precinct",
    district: "Jaipur",
    state: "Rajasthan",
    country: "India",
    latitude: 26.8523,
    longitude: 75.8055,
    capacity: "30,000",
    expectedAttendance: "28,500",
    description:
      "Described as the 'greatest literary show on Earth', bringing Nobel laureates, Booker Prize winners, historians, artists, and passionate book lovers together. Enjoy intellectual dialogues, poetry recitations, musical mornings, and vibrant Rajasthani craft markets.",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80",
    ],
    agePolicy: "All age groups welcome.",
    language: "English, Hindi & Multilingual Readings",
    duration: "5 Days of Literary Dialogues",
    highlights: [
      "400+ World Renowned Authors & Thinkers",
      "Morning Classical Ragas & Evening Heritage Concerts",
      "Author Book Signings & Literary Bookstores",
      "Handcrafted Rajasthani Artisan Bazaar",
      "Complimentary Delegate Tea & Chai Stalls",
    ],
    accentColor: "purple",
    statusBadge: "Literary Festival",
    highlightStat: "400+ Global Authors",
    organizerInfo: {
      name: "Teamwork Arts & Jaipur Virasat Foundation",
      verified: true,
      supportContact: "+91 (0141) 257-2200",
      licenseNo: "JLF-RAJ-2026-LIT",
    },
    guidelines: {
      permitted: [
        "Books, notebooks, pens, and reading materials",
        "Mobile phones and tablet readers",
        "Personal tote bags and water bottles",
      ],
      prohibited: [
        "Loud amplification or unauthorized recording",
        "Outside food or plastic disposable bags",
      ],
      bagPolicy: "Cloth tote bags and small backpacks allowed.",
      entryRules: "Registration badge is mandatory. Free general passes or premium delegate access available.",
    },
    faqs: [
      {
        question: "How do book signing sessions work?",
        answer: "Authors move to the official Penguin & HarperCollins signing marquee immediately following their main stage sessions.",
      },
    ],
    gates: [
      { id: "gate-jlf-1", name: "Main JLN Marg Ingress", type: "RFID Delegate Turnstile", status: "optimal", avgWaitMins: 2 },
    ],
    zones: [
      { id: "zone-front", name: "Front Lawn Grand Stage", capacity: "12,000", description: "Flagship keynote debates & festival opening" },
      { id: "zone-durbar", name: "Durbar Hall Intimate Pavilion", capacity: "8,000", description: "Deep poetry readings & historical discourses" },
      { id: "zone-bazaar", name: "Heritage Craft & Book Village", capacity: "10,000", description: "Bookstalls, cafes & Rajasthani bandhani textiles" },
    ],
    transport: [
      { type: "bus", title: "Jaipur City Transport JCTSL", detail: "JLN Marg route connecting Railway Station & Sindhi Camp", frequency: "Every 5 mins" },
      { type: "rideshare", title: "Pre-Paid Auto & Taxi Hub", detail: "Located outside Clarks Amer gate", frequency: "Continuous" },
    ],
    parking: [
      { id: "park-jlf-1", name: "Jawahar Kala Kendra Overflow Ground", capacity: "1,500 Cars", occupied: "1,100 Cars", fee: "₹100 / day", status: "available", shuttleAvailable: true },
    ],
    hospitality: [
      { type: "f&b", title: "Rajasthani Royal Chai & Heritage Bistro", location: "Festival Courtyard", details: "Masala kulhad chai, pyaaz kachoris, millet cookies & organic salads", mobileOrdering: true },
    ],
    schedule: [
      { time: "09:30 IST", activity: "Morning Music & Raga Invocations", description: "Sublime Indian classical instruments to start the day" },
      { time: "10:30 IST", activity: "Inaugural Keynote & Debates", description: "Provocative panels with award-winning authors" },
      { time: "18:30 IST", activity: "Evening Heritage Concert", description: "Desert folk melodies and world acoustic collaborations" },
    ],
  },
  {
    id: "kochi-biennale-arts-2026",
    name: "Kochi-Muziris Biennale & Contemporary Arts Pavilion",
    category: "Festivals",
    date: "December 12, 2026 - March 31, 2027",
    time: "10:00 - 19:00 IST",
    location: "Kochi, Kerala, India",
    venue: "Aspinwall House & Fort Kochi Waterfront",
    district: "Ernakulam",
    state: "Kerala",
    country: "India",
    latitude: 9.9658,
    longitude: 76.2422,
    capacity: "25,000",
    expectedAttendance: "22,000",
    description:
      "South Asia's largest contemporary art exhibition spread across colonial heritage warehouses overlooking the historic spice harbor of Fort Kochi. Showcasing monumental sculptures, audio installations, video art, and waterfront cultural cafes.",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    ],
    agePolicy: "All ages welcome. Free student entry on Mondays.",
    language: "English & Malayalam",
    duration: "100+ Days of Continuous Exhibition",
    highlights: [
      "Over 90 Contemporary Artists from 35 Countries",
      "Heritage Sea-Facing Warehouses & Courtyards",
      "Kerala Water Metro Direct Pier Connectivity",
      "Daily Curatorial Guided Art Walks",
      "Waterfront Sculpture Terraces & Artisan Cafes",
    ],
    accentColor: "purple",
    statusBadge: "Biennale Art Trail",
    highlightStat: "90+ Global Artists",
    organizerInfo: {
      name: "Kochi Biennale Foundation",
      verified: true,
      supportContact: "+91 (0484) 221-5000",
      licenseNo: "KBF-KER-BIENNALE-2026",
    },
    guidelines: {
      permitted: [
        "Cameras and mobile phones (no flash photography)",
        "Sketchbooks, notebooks, and pencils",
        "Small personal daypacks",
      ],
      prohibited: [
        "Touching or leaning on fragile artwork",
        "Large umbrellas or luggage",
      ],
      bagPolicy: "Medium bags permitted with security tags applied at entry.",
      entryRules: "Day passes allow access to all 12 collateral heritage venues throughout Fort Kochi.",
    },
    faqs: [
      {
        question: "Can I take the Kochi Water Metro to the Biennale venues?",
        answer: "Yes! High-speed electric Water Metro boats run from High Court Jetty directly to Fort Kochi Jetty, located 200m from Aspinwall House.",
      },
    ],
    gates: [
      { id: "gate-asp-main", name: "Aspinwall Sea Gate", type: "Main Heritage Portal", status: "optimal", avgWaitMins: 1 },
    ],
    zones: [
      { id: "zone-asp", name: "Aspinwall Main Warehouse", capacity: "12,000", description: "Sculpture halls, sound installations and harbor lawns" },
      { id: "zone-pepper", name: "Pepper House Studios", capacity: "6,000", description: "Artist residencies, design library & courtyard cafe" },
      { id: "zone-cabral", name: "Cabral Yard Pavilion", capacity: "7,000", description: "Open-air architecture seminar dome" },
    ],
    transport: [
      { type: "ferry", title: "Kochi Water Metro (Electric Boats)", detail: "High Court to Fort Kochi Terminal (5-min walk along beach road)", frequency: "Every 10 mins" },
      { type: "bus", title: "KSRTC Low-Floor AC Shuttles", detail: "Aluva & Ernakulam South Railway Station to Fort Kochi Bus Stand", frequency: "Every 15 mins" },
    ],
    parking: [
      { id: "park-bien-1", name: "Parade Ground Public Parking Area", capacity: "800 Cars", occupied: "500 Cars", fee: "₹50 / day", status: "available", shuttleAvailable: false },
    ],
    hospitality: [
      { type: "f&b", title: "Kerala Spice Kitchen & Waterfront Artisanal Cafe", location: "Pepper House Courtyard", details: "Appam with vegetable stew, banana fritters, tender coconut coolers & filter coffee", mobileOrdering: true },
    ],
    schedule: [
      { time: "10:00 IST", activity: "Heritage Gates & Art Pavilions Open", description: "Self-guided walkthroughs and curator-led gallery tours" },
      { time: "14:30 IST", activity: "Artists' In-Conversation Sessions", description: "Public colloquiums with participating painters and sculptors" },
      { time: "17:30 IST", activity: "Waterfront Sunset Cinema & Music", description: "Experimental short film screenings on harbor lawn" },
    ],
  },
  {
    id: "world-athletics-championship",
    name: "World Athletics Grand Championship 2026",
    category: "Sports",
    date: "October 14 - 18, 2026",
    time: "09:00 - 21:30 JST",
    location: "Tokyo, Japan",
    venue: "Olympic National Stadium & Coastal Precinct",
    district: "Shinjuku",
    state: "Tokyo",
    country: "Japan",
    latitude: 35.6778,
    longitude: 139.7145,
    capacity: "68,000",
    expectedAttendance: "67,200",
    description:
      "The pinnacle of international track and field, gathering world-record holders across 48 athletic events. Features multi-ring spectator routing, automated concourse turnstiles, and synchronized municipal subway waves.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80",
    ],
    agePolicy: "All age groups welcome.",
    language: "Japanese & English Official Commentary",
    duration: "5-Day Track & Field Tournament",
    highlights: [
      "48 World Championship Medal Events",
      "State-of-the-Art Sustainable Timber Stadium Bowl",
      "Automated Facial & QR Recognition Turnstiles",
      "Subway Waves Ingress Direct to Gate 1",
      "Zero-Emission Fleet Transport",
    ],
    accentColor: "blue",
    statusBadge: "Global Athletics Final",
    highlightStat: "48 Medal Events",
    organizerInfo: {
      name: "World Athletics & JAAF",
      verified: true,
      supportContact: "+81 3-5555-0199",
      licenseNo: "WA-TOKYO-2026-CHAMP",
    },
    guidelines: {
      permitted: [
        "Smartphones, compact cameras, and power banks",
        "Sealed clear water bottles up to 500ml",
      ],
      prohibited: [
        "Alcoholic beverages and glass bottles",
        "Large banners blocking spectators",
      ],
      bagPolicy: "Standard backpack inspection at all gate turnstiles.",
      entryRules: "Digital ticketing passes active via EventFlow companion QR.",
    },
    faqs: [
      {
        question: "Which subway station is closest to Olympic National Stadium?",
        answer: "Kokuritsu-Kyogijo Station (Toei Oedo Line, Exit A2) opens directly to the Gate 1 North Concourse.",
      },
    ],
    gates: [
      { id: "gate-tokyo-1", name: "Gate 1 — Sendagaya North Concourse", type: "Main Spectator Ingress", status: "optimal", avgWaitMins: 2 },
    ],
    zones: [
      { id: "zone-track-a", name: "Grandstand North Trackside", capacity: "25,000", description: "Direct 100m sprint & finish line sightlines" },
      { id: "zone-upper-b", name: "East Concourse Upper Tier", capacity: "43,000", description: "Panoramic stadium bowl view with hospitality terrace" },
    ],
    transport: [
      { type: "metro", title: "Toei Oedo Line", detail: "Kokuritsu-Kyogijo Station (Exit A2 direct to Gate 1)", frequency: "Every 2.5 mins" },
      { type: "train", title: "JR Chuo-Sobu Line", detail: "Sendagaya Station (3-min pedestrian walkway)", frequency: "Every 3 mins" },
    ],
    parking: [
      { id: "park-tokyo-1", name: "Meiji Outer Garden Deck", capacity: "2,200 Bays", occupied: "1,450 Bays", fee: "¥2,500 / day", status: "available", shuttleAvailable: true },
    ],
    hospitality: [
      { type: "f&b", title: "Olympic Gourmet Pavilion", location: "Level 2 Concourse Ring", details: "Artisan bento, matcha treats & craft refreshments", mobileOrdering: true },
    ],
    schedule: [
      { time: "09:00 JST", activity: "Morning Heats & Field Qualifications", description: "Long jump, discus & 400m preliminary rounds" },
      { time: "19:45 JST", activity: "100m World Finals & Medal Ceremonies", description: "Peak stadium occupancy and global telecast" },
    ],
  },
  {
    id: "nova-echoes-stadium-tour",
    name: "Nova Echoes World Stadium Tour 2026",
    category: "Concerts",
    date: "November 08, 2026",
    time: "17:30 - 23:00 GMT",
    location: "London, United Kingdom",
    venue: "Wembley Stadium Concourse & Arena Bowl",
    district: "Brent",
    state: "Greater London",
    country: "United Kingdom",
    latitude: 51.556,
    longitude: -0.2795,
    capacity: "90,000",
    expectedAttendance: "88,500",
    description:
      "Multi-platinum electro-symphonic concert experience featuring kinetic aerial lighting, 360-degree spatial surround acoustics, and coordinated rapid transit egress dispatch across London Underground lines.",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    ],
    agePolicy: "14+ for Standing Pitch GA. All ages seated with adult.",
    language: "English",
    duration: "4 Hours",
    highlights: [
      "90,000 Wembley Stadium Bowl Atmosphere",
      "360° Spatial Acoustic Surround Sound Arrays",
      "Kinetic Sky Laser & Confetti Canopy",
      "Olympic Way Synchronized Pedestrian Flow",
      "Automated London Tube Wave Metering",
    ],
    accentColor: "indigo",
    statusBadge: "Sold Out Stadium",
    highlightStat: "90,000 Singing Voices",
    organizerInfo: {
      name: "Live Nation UK & Wembley Stadium",
      verified: true,
      supportContact: "+44 (0)20 8795 9000",
      licenseNo: "UK-WEM-2026-NE",
    },
    guidelines: {
      permitted: [
        "Small clutch bags or clear bags up to A4 size",
        "Mobile phones and small battery power banks",
      ],
      prohibited: [
        "Bags larger than A4 paper size",
        "Professional zoom lens cameras and tripods",
        "Glass bottles and metal cans",
      ],
      bagPolicy: "Strict A4 max bag size rule strictly enforced at Wembley turnstiles.",
      entryRules: "Color-coded ingress zones marked clearly on Olympic Way approach.",
    },
    faqs: [
      {
        question: "How do I exit smoothly toward London Underground after the gig?",
        answer: "EventFlow pedestrian zones meter ingress into Wembley Park station (Jubilee and Metropolitan lines) in steady 2-minute intervals.",
      },
    ],
    gates: [
      { id: "wem-gate-a", name: "Olympic Way Turnstile Bank A", type: "Main Pedestrian Approach", status: "optimal", avgWaitMins: 3 },
    ],
    zones: [
      { id: "zone-pitch", name: "Floor GA & Front Circle", capacity: "26,000", description: "Immersive field access with direct stage perimeter line" },
      { id: "zone-lower", name: "Level 1 Concourse Seating", capacity: "64,000", description: "Unobstructed elevation view with easy amenity access" },
    ],
    transport: [
      { type: "metro", title: "London Underground (Jubilee & Metropolitan)", detail: "Wembley Park Station via Olympic Way pedestrian boulevard", frequency: "Every 2 mins" },
      { type: "train", title: "Chiltern Railways Overground", detail: "Wembley Stadium Station direct to London Marylebone", frequency: "Every 5 mins" },
    ],
    parking: [
      { id: "wem-park-red", name: "Red Parking Deck Multi-Storey", capacity: "3,000 Bays", occupied: "2,750 Bays", fee: "£40 / day", status: "filling_fast", shuttleAvailable: false },
    ],
    hospitality: [
      { type: "f&b", title: "Concourse Street Food Kitchens", location: "Level 1 & Level 5 Concourses", details: "Gourmet loaded fries, smash burgers & vegan specialties", mobileOrdering: true },
    ],
    schedule: [
      { time: "17:30 GMT", activity: "Outer Stadium Gates & Concourse Open", description: "Early ingress for Golden Circle and Pitch GA ticket holders" },
      { time: "20:30 GMT", activity: "Nova Echoes Headline Set", description: "2.5-hour complete multi-sensory live performance" },
    ],
  },
];
