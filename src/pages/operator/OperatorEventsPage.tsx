import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Layers,
  ArrowRight,
  Clock,
  Radio,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { OperatorLayout } from "../../components/operator/OperatorLayout";
import { useAuth } from "../../context/AuthContext";
import {
  getOperatorEvents,
  getOperatorAssignedResources,
} from "../../services/operatorAssignmentService";

export const OperatorEventsPage: React.FC = () => {
  const { user } = useAuth();
  const operatorId = user?.id || "";
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setRefreshKey((k) => k + 1);
    window.addEventListener("eventflow_live_state_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("eventflow_live_state_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const assignedEvents = getOperatorEvents(operatorId);
  const allAssignedResources = getOperatorAssignedResources(operatorId);

  const filteredEvents = assignedEvents.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q)
    );
  });

  return (
    <OperatorLayout
      title="My Assigned Events"
      subtitle="Events where you are designated to manage operational resources."
    >
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F0E9D6] p-4 rounded-xl border border-[#C9D9F7] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assigned events by name, venue or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F4F8FF] border border-[#C9D9F7] rounded-lg text-sm text-[#0B1120] placeholder:text-[#8C8272] focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/20 focus:border-[#4F7CFF]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6B6252] font-medium">
          <span>Showing {filteredEvents.length} of {assignedEvents.length} assigned events</span>
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7] p-12 text-center">
          <Calendar className="w-12 h-12 text-[#C9BBA0] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#0B1120] font-heading">No matching events found</h3>
          <p className="text-xs text-[#6B6252] max-w-sm mx-auto mt-1">
            You do not have any operational resources assigned matching the search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const eventResources = allAssignedResources.filter((r) => r.event.id === evt.id);
            const activeCount = eventResources.filter(
              (r) => r.resource.status !== "INACTIVE" && r.resource.status !== "CLOSED"
            ).length;

            return (
              <div
                key={evt.id}
                className="bg-[#F0E9D6] rounded-2xl border border-[#C9D9F7]/90 shadow-xs overflow-hidden hover:border-[#C9BBA0] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Event Thumbnail & Badges */}
                  <div className="relative h-44 w-full bg-[#F7FAFF] overflow-hidden">
                    <img
                      src={evt.image}
                      alt={evt.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/80 via-transparent to-black/30" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#F0E9D6]/90 backdrop-blur-sm text-[#0B1120] shadow-sm">
                        {evt.category}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F0E9D6] animate-ping" />
                        ASSIGNED
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-[#C9D9F7] transition-colors font-heading">
                        {evt.name}
                      </h3>
                      <p className="text-xs text-[#C9BBA0] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#4F7CFF] shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </p>
                    </div>
                  </div>

                  {/* Event Metadata & Assigned Stats */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#4A4236] pb-3 border-b border-[#F7FAFF]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#8C8272]" />
                        <span>{evt.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium text-[#0B1120]">
                        <Clock className="w-4 h-4 text-[#8C8272]" />
                        <span>{evt.time}</span>
                      </div>
                    </div>

                    {/* Resources Count Card */}
                    <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#F7FAFF] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#4F7CFF]" />
                        <span className="text-xs font-semibold text-[#382F27]">Your Assigned Resources</span>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 bg-[#F7FAFF] text-[#2D5FD2] border border-[#C9D9F7]/80 rounded-md">
                        {eventResources.length} Resources
                      </span>
                    </div>

                    {/* Resources list mini pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {eventResources.map((res) => (
                        <span
                          key={res.resource.id}
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F7FAFF] text-[#382F27] border border-[#C9D9F7] truncate max-w-[200px]"
                        >
                          {res.resource.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-[#F4F8FF]/60 border-t border-[#F7FAFF] flex items-center justify-between">
                  <span className="text-xs font-medium text-[#6B6252]">
                    {activeCount} active in live state
                  </span>
                  <Link
                    to={`/operators/events/${evt.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4F7CFF] hover:bg-[#4F7CFF] text-white text-xs font-bold transition-colors shadow-xs shadow-[#4F7CFF]/20"
                  >
                    <span>Open Event</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </OperatorLayout>
  );
};
