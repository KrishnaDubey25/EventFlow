import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  X,
  CheckCircle2,
  Compass,
  ArrowRight,
  MapPin,
  Navigation,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  Globe,
  RotateCcw,
} from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { EventCard } from "../components/events/EventCard";
import { useEventSelection } from "../context/EventContext";
import { EventCategory, AppEvent } from "../types/event";
import {
  INDIAN_STATES_DATA,
  calculateDistanceKm,
  reverseGeocodeCoords,
  UserLocationState,
} from "../utils/geoUtils";

const CATEGORIES: EventCategory[] = [
  "All",
  "Sports",
  "Concerts",
  "Conferences",
  "Festivals",
  "Large Gatherings",
];

export const EventsPage: React.FC = () => {
  const { events, selectedEvent, isEventSelected } = useEventSelection();

  // Search & Category
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>("All");

  // State & District filters
  const [selectedState, setSelectedState] = useState<string>("All Locations");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All Districts");

  // Sorting
  const [sortBy, setSortBy] = useState<"recommended" | "distance" | "date" | "capacity">("recommended");

  // Live Location state
  const [userLocation, setUserLocation] = useState<UserLocationState>({
    coords: null,
    district: null,
    state: null,
    city: null,
    country: null,
    loading: false,
    error: null,
    source: null,
  });

  // Filter only nearby toggle
  const [onlyNearby, setOnlyNearby] = useState(false);

  // Request browser geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setUserLocation((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser.",
      }));
      return;
    }

    setUserLocation((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const geoResult = await reverseGeocodeCoords(latitude, longitude);
          setUserLocation({
            coords: { latitude, longitude },
            district: geoResult.district,
            state: geoResult.state,
            city: geoResult.city,
            country: geoResult.country,
            loading: false,
            error: null,
            source: "gps",
          });
          // Auto set state and district to detected location
          setSelectedState(geoResult.state);
          setSelectedDistrict(geoResult.district);
        } catch (err) {
          setUserLocation({
            coords: { latitude, longitude },
            district: "Local District",
            state: "Local State",
            city: "Your Area",
            country: "India",
            loading: false,
            error: null,
            source: "gps",
          });
        }
      },
      (err) => {
        console.warn("Geolocation access notice:", err.message);
        setUserLocation((prev) => ({
          ...prev,
          loading: false,
          error:
            err.code === 1
              ? "Location permission was denied. You can select your state and district manually below!"
              : "Unable to retrieve GPS signal. Please select your location manually.",
        }));
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  // Quick fallback location presets (e.g. for demoing or instant state jumping)
  const handleQuickSelectPreset = (stateName: string, districtName?: string) => {
    const foundState = INDIAN_STATES_DATA.find((s) => s.state === stateName);
    if (foundState) {
      const dist = districtName || foundState.districts[0];
      setSelectedState(foundState.state);
      setSelectedDistrict(dist);
      setUserLocation({
        coords: { latitude: foundState.lat, longitude: foundState.lng },
        district: dist,
        state: foundState.state,
        city: dist,
        country: "India",
        loading: false,
        error: null,
        source: "manual",
      });
    }
  };

  // Available districts for the currently selected state
  const availableDistricts = useMemo(() => {
    if (selectedState === "All Locations" || selectedState === "Global Metro") {
      return [];
    }
    const stateObj = INDIAN_STATES_DATA.find((s) => s.state === selectedState);
    return stateObj ? stateObj.districts : [];
  }, [selectedState]);

  // Compute event distances based on user location coords
  const eventsWithDistances = useMemo(() => {
    return events.map((evt) => {
      let distanceKm: number | undefined = undefined;
      if (userLocation.coords && evt.latitude && evt.longitude) {
        distanceKm = calculateDistanceKm(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          evt.latitude,
          evt.longitude
        );
      }
      return {
        ...evt,
        distanceKm,
      };
    });
  }, [events, userLocation.coords]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let result = eventsWithDistances.filter((evt) => {
      // 1. Category Filter
      const matchesCategory =
        selectedCategory === "All" || evt.category === selectedCategory;

      // 2. Search Query Filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        evt.name.toLowerCase().includes(q) ||
        evt.venue.toLowerCase().includes(q) ||
        evt.location.toLowerCase().includes(q) ||
        (evt.district && evt.district.toLowerCase().includes(q)) ||
        (evt.state && evt.state.toLowerCase().includes(q)) ||
        evt.category.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q);

      // 3. State Filter
      let matchesState = true;
      if (selectedState !== "All Locations") {
        if (selectedState === "Global Metro") {
          matchesState = evt.country !== "India";
        } else {
          matchesState =
            Boolean(evt.state &&
            evt.state.toLowerCase().includes(selectedState.toLowerCase()));
        }
      }

      // 4. District Filter
      let matchesDistrict = true;
      if (selectedDistrict !== "All Districts" && selectedState !== "All Locations") {
        matchesDistrict =
          Boolean(evt.district &&
          evt.district.toLowerCase().includes(selectedDistrict.toLowerCase()));
      }

      // 5. Only Nearby in district / within 80km
      let matchesNearby = true;
      if (onlyNearby) {
        if (userLocation.district && evt.district) {
          matchesNearby =
            evt.district.toLowerCase().includes(userLocation.district.toLowerCase()) ||
            (typeof evt.distanceKm === "number" && evt.distanceKm <= 100);
        } else if (typeof evt.distanceKm === "number") {
          matchesNearby = evt.distanceKm <= 100;
        }
      }

      return (
        matchesCategory &&
        matchesSearch &&
        matchesState &&
        matchesDistrict &&
        matchesNearby
      );
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "distance") {
        const distA = typeof a.distanceKm === "number" ? a.distanceKm : 99999;
        const distB = typeof b.distanceKm === "number" ? b.distanceKm : 99999;
        return distA - distB;
      }
      if (sortBy === "capacity") {
        const capA = parseInt(String(a.capacity).replace(/,/g, ""), 10) || 0;
        const capB = parseInt(String(b.capacity).replace(/,/g, ""), 10) || 0;
        return capB - capA;
      }
      if (sortBy === "date") {
        return a.date.localeCompare(b.date);
      }
      // Default: Recommended (prioritizes closest if location known)
      if (userLocation.coords) {
        const distA = typeof a.distanceKm === "number" ? a.distanceKm : 99999;
        const distB = typeof b.distanceKm === "number" ? b.distanceKm : 99999;
        return distA - distB;
      }
      return 0;
    });

    return result;
  }, [
    eventsWithDistances,
    selectedCategory,
    searchQuery,
    selectedState,
    selectedDistrict,
    onlyNearby,
    sortBy,
    userLocation.district,
    userLocation.coords,
  ]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setSelectedState("All Locations");
    setSelectedDistrict("All Districts");
    setOnlyNearby(false);
    setSortBy("recommended");
  };

  return (
    <AppLayout pageTitle="Discover Mega Events" pageBadge="India & Global">
      <div className="space-y-8 sm:space-y-10 max-w-7xl mx-auto pb-12">
        {/* Header with Live Location Trigger */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7FAFF] border border-[#EDE3CB] text-[#2D5FD2] text-xs font-semibold font-mono">
              <Compass className="w-3.5 h-3.5 text-[#4F7CFF]" />
              <span>LIVE LOCATION & MEGA EVENT DISCOVERY</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0B1120] font-heading leading-tight">
              Events in Your District & States of India
            </h1>

            <p className="text-[#4A4236] text-sm sm:text-base leading-relaxed">
              Detect your live attendee location to find nearby stadium games, concerts, and festivals in your district, or explore events across any Indian state.
            </p>
          </div>

          {/* Live Location Action Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F0E9D6] border border-[#C9D9F7]/90 shadow-xs space-y-3 min-w-[300px] shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#382F27] font-mono">
                <Navigation className="w-4 h-4 text-[#4F7CFF]" />
                <span>ATTENDEE LIVE GPS</span>
              </div>
              {userLocation.source && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {userLocation.source === "gps" ? "GPS Active" : "Location Set"}
                </span>
              )}
            </div>

            {userLocation.district ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-sm font-bold text-[#0B1120]">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    {userLocation.district} District, {userLocation.state}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    id="filter-nearby-district-btn"
                    onClick={() => setOnlyNearby(!onlyNearby)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                      onlyNearby
                        ? "bg-[#4F7CFF] text-white shadow-xs"
                        : "bg-[#F7FAFF] text-[#2D5FD2] hover:bg-[#EDE3CB]"
                    }`}
                  >
                    <span>{onlyNearby ? "Showing In District ✓" : "Filter In District"}</span>
                  </button>

                  <button
                    onClick={handleDetectLocation}
                    disabled={userLocation.loading}
                    className="text-xs font-medium text-[#6B6252] hover:text-[#0B1120] transition-colors p-1.5"
                    title="Refresh GPS"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${userLocation.loading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[#6B6252]">
                  Get instant proximity tags and district-specific mega events nearby.
                </p>
                <button
                  id="detect-live-location-btn"
                  onClick={handleDetectLocation}
                  disabled={userLocation.loading}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#4F7CFF] hover:bg-[#2D5FD2] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {userLocation.loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Detecting Coordinates...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Use My Live Location</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {userLocation.error && (
              <div className="text-[11px] text-blue-700 bg-blue-50 p-2 rounded-lg leading-tight">
                {userLocation.error}
              </div>
            )}
          </div>
        </div>

        {/* Location & Discovery Filter Controls */}
        <div className="space-y-4 p-5 sm:p-6 bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/90 shadow-xs">
          {/* Top Row: Search Bar + State Selector + District Selector */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Search Input */}
            <div className="relative md:col-span-6 lg:col-span-5">
              <Search className="w-4 h-4 text-[#8C8272] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="events-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, cricket finals, concerts, festivals, venues..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7] text-sm font-medium text-[#0B1120] placeholder:text-[#8C8272] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C8272] hover:text-[#382F27]"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Indian State Selector Dropdown */}
            <div className="md:col-span-3 lg:col-span-3">
              <div className="relative">
                <select
                  id="select-state-dropdown"
                  value={selectedState}
                  onChange={(e) => {
                    const st = e.target.value;
                    setSelectedState(st);
                    setSelectedDistrict("All Districts");
                    if (st !== "All Locations" && st !== "Global Metro") {
                      handleQuickSelectPreset(st);
                    }
                  }}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7] text-xs sm:text-sm font-semibold text-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF] transition-all cursor-pointer truncate"
                >
                  <option value="All Locations">🇮🇳 All India & Global</option>
                  <optgroup label="States of India">
                    {INDIAN_STATES_DATA.map((s) => (
                      <option key={s.state} value={s.state}>
                        {s.state}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="International Benchmarks">
                    <option value="Global Metro">Global Metro Venues</option>
                  </optgroup>
                </select>
                <MapPin className="w-4 h-4 text-[#4F7CFF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-4 h-4 text-[#8C8272] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* District Selector Dropdown (Enabled if state has districts) */}
            <div className="md:col-span-3 lg:col-span-2">
              <div className="relative">
                <select
                  id="select-district-dropdown"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={availableDistricts.length === 0}
                  className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7] text-xs sm:text-sm font-semibold text-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed truncate"
                >
                  <option value="All Districts">
                    {selectedState === "All Locations"
                      ? "All Districts"
                      : `All in ${selectedState}`}
                  </option>
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d} District
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#8C8272] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Sort Order Dropdown */}
            <div className="md:col-span-12 lg:col-span-2">
              <div className="relative">
                <select
                  id="sort-by-dropdown"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-[#F4F8FF] border border-[#C9D9F7] text-xs sm:text-sm font-semibold text-[#241E17] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF] transition-all cursor-pointer truncate"
                >
                  <option value="recommended">Sort: Recommended</option>
                  {userLocation.coords && (
                    <option value="distance">Sort: Closest to Me</option>
                  )}
                  <option value="capacity">Sort: Largest Capacity</option>
                  <option value="date">Sort: Upcoming Date</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#8C8272] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Quick State Pills Strip for Fast Exploration */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-[#6B6252]">
              <span className="font-semibold uppercase font-mono text-[11px] text-[#8C8272]">
                Explore by State:
              </span>
              {selectedState !== "All Locations" && (
                <button
                  onClick={() => {
                    setSelectedState("All Locations");
                    setSelectedDistrict("All Districts");
                  }}
                  className="text-[#4F7CFF] hover:text-[#6b5024] font-semibold cursor-pointer"
                >
                  Show All India
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => {
                  setSelectedState("All Locations");
                  setSelectedDistrict("All Districts");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedState === "All Locations"
                    ? "bg-[#0B1120] text-white"
                    : "bg-[#F7FAFF] text-[#382F27] hover:bg-[#C9D9F7]/80"
                }`}
              >
                🇮🇳 All Locations
              </button>

              {INDIAN_STATES_DATA.map((st) => {
                const isActive = selectedState === st.state;
                return (
                  <button
                    key={st.state}
                    onClick={() => {
                      setSelectedState(st.state);
                      setSelectedDistrict("All Districts");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#4F7CFF] text-white shadow-xs"
                        : "bg-[#F7FAFF] text-[#382F27] hover:bg-[#C9D9F7]/80"
                    }`}
                  >
                    {st.state}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Filter Pills Bar */}
          <div className="pt-2 border-t border-[#F7FAFF] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isCatActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isCatActive
                      ? "bg-[#4F7CFF] text-white shadow-xs"
                      : "bg-[#F7FAFF] text-[#4A4236] hover:text-[#0B1120] hover:bg-[#C9D9F7]/70"
                  }`}
                >
                  <span>{cat}</span>
                  {cat !== "All" && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isCatActive
                          ? "bg-[#F0E9D6]/25 text-white"
                          : "bg-[#C9D9F7] text-[#4A4236]"
                      }`}
                    >
                      {events.filter((e) => e.category === cat).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Metadata Counter & Active Filters Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C9D9F7]/80 pb-3 text-xs sm:text-sm text-[#4A4236]">
          <div className="flex items-center gap-2">
            <span>
              Showing{" "}
              <strong className="text-[#0B1120] font-bold">
                {filteredEvents.length}
              </strong>{" "}
              {filteredEvents.length === 1 ? "mega event" : "mega events"}
            </span>

            {selectedState !== "All Locations" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F7FAFF] text-[#2D5FD2] font-semibold text-xs border border-[#EDE3CB]">
                <MapPin className="w-3 h-3" />
                {selectedState}
                {selectedDistrict !== "All Districts" && ` • ${selectedDistrict}`}
              </span>
            )}

            {onlyNearby && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-semibold text-xs border border-blue-200">
                <Navigation className="w-3 h-3" />
                Within District / 100km
              </span>
            )}
          </div>

          {(selectedCategory !== "All" ||
            searchQuery ||
            selectedState !== "All Locations" ||
            onlyNearby) && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-[#4F7CFF] hover:text-[#6b5024] transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all filters</span>
            </button>
          )}
        </div>

        {/* Event Cards Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredEvents.map((event, idx) => (
              <EventCard
                key={event.id}
                event={event}
                index={idx}
                isSelected={isEventSelected(event.id)}
                userDistrict={userLocation.district}
                userState={userLocation.state}
                distanceKm={event.distanceKm}
              />
            ))}
          </div>
        ) : (
          /* Empty Filter State with Helpful Recommendations */
          <div className="p-12 text-center bg-[#F0E9D6] rounded-3xl border border-[#C9D9F7]/80 shadow-xs space-y-4 max-w-md mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-[#F7FAFF] text-[#4F7CFF] flex items-center justify-center mx-auto">
              <Compass className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#0B1120] font-heading">
                No events found in this filter
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6252] leading-relaxed">
                We didn't find any events matching your selected district or category. Try clearing filters or exploring other states of India.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#4F7CFF] hover:bg-[#2D5FD2] transition-colors cursor-pointer shadow-xs"
              >
                Show All Mega Events
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
