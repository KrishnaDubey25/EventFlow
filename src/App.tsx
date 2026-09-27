import React, { lazy, Suspense } from "react";
const LiveVenuePage = lazy(() => import("./pages/live/LiveVenuePage"));
const Venue3DPage = lazy(() => import("./pages/venue3d/Venue3DPage"));
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { EventProvider } from "./context/EventContext";
import { TicketProvider } from "./context/TicketContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { HomePage } from "./pages/HomePage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { EventsPage } from "./pages/EventsPage";
import { EventDetailsPage } from "./pages/EventDetailsPage";
import { BookingPage } from "./pages/BookingPage";
import { TicketPage } from "./pages/TicketPage";
import { MyEventsPage } from "./pages/MyEventsPage";
import { EventHubPage } from "./pages/EventHubPage";
import { AttendeeOverviewPage } from "./pages/AttendeeOverviewPage";
import { AttendeeProfilePage } from "./pages/AttendeeProfilePage";
import { OrganizerOverviewPage } from "./pages/organizer/OrganizerOverviewPage";
import { OrganizerEventsPage } from "./pages/organizer/OrganizerEventsPage";
import { OrganizerEventConfigPage } from "./pages/organizer/OrganizerEventConfigPage";
import { OrganizerWeatherTwinPage } from "./pages/organizer/OrganizerWeatherTwinPage";
import { OrganizerIntelligencePage } from "./pages/organizer/OrganizerIntelligencePage";
import { OrganizerCrowdPage } from "./pages/organizer/OrganizerCrowdPage";
import { OrganizerTransportPage } from "./pages/organizer/OrganizerTransportPage";
import { OrganizerParkingPage } from "./pages/organizer/OrganizerParkingPage";
import { OrganizerHospitalityPage } from "./pages/organizer/OrganizerHospitalityPage";
import { OrganizerProfilePage } from "./pages/organizer/OrganizerProfilePage";
import { OperatorOverviewPage } from "./pages/operator/OperatorOverviewPage";
import { OperatorEventsPage } from "./pages/operator/OperatorEventsPage";
import { OperatorEventDetailPage } from "./pages/operator/OperatorEventDetailPage";
import { OperatorResourcesPage } from "./pages/operator/OperatorResourcesPage";
import { OperatorResourceDetailPage } from "./pages/operator/OperatorResourceDetailPage";
import { OperatorAlertsPage } from "./pages/operator/OperatorAlertsPage";
import { OperatorProfilePage } from "./pages/operator/OperatorProfilePage";
import { OperatorBookingsPage } from "./pages/operator/OperatorBookingsPage";
import { OperatorRoutesPage } from "./pages/operator/OperatorRoutesPage";
import { OperatorOccupancyPage } from "./pages/operator/OperatorOccupancyPage";
import { OperatorEntryExitPage } from "./pages/operator/OperatorEntryExitPage";
import { OperatorIncidentsPage } from "./pages/operator/OperatorIncidentsPage";
import { OperatorIssuesPage } from "./pages/operator/OperatorIssuesPage";
import { OperatorCapacityPage } from "./pages/operator/OperatorCapacityPage";
import { OperatorAvailabilityPage } from "./pages/operator/OperatorAvailabilityPage";
import { OperatorDemandPage } from "./pages/operator/OperatorDemandPage";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <EventProvider>
          <TicketProvider>
            <Routes>
              <Route path="/live-venue" element={<Suspense fallback={<div className="min-h-screen bg-[#f5f6f2] flex items-center justify-center text-sm text-[#4A4236]">Opening your live venue…</div>}><LiveVenuePage /></Suspense>} />
              <Route path="/venue-3d" element={<Suspense fallback={<div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center text-sm">Opening indoor floor map…</div>}><Venue3DPage /></Suspense>} />
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />

              {/* Protected Role-Based Routes: Attendee */}
              <Route
                path="/overview"
                element={
                  <ProtectedRoute allowedRoles={["attendee"]}>
                    <AttendeeOverviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={["attendee"]}>
                    <AttendeeProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events"
                element={
                  <ProtectedRoute allowedRoles={["attendee"]}>
                    <EventsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:eventId"
                element={
                  <ProtectedRoute allowedRoles={["attendee"]}>
                    <EventDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:eventId/book"
                element={
                  <ProtectedRoute allowedRoles={["attendee"]}>
                    <BookingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ticket"
                element={
                  <ProtectedRoute allowedRoles={["attendee"]}>
                    <TicketPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-event"
                element={
                  <ProtectedRoute allowedRoles={["attendee"]}>
                    <MyEventsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-event/:eventId"
                element={
                  <ProtectedRoute allowedRoles={["attendee"]}>
                    <EventHubPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-event/:eventId/venue-map"
                element={
                  <ProtectedRoute allowedRoles={["attendee"]}>
                    <Suspense fallback={<div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center text-sm">Opening indoor map…</div>}><Venue3DPage /></Suspense>
                  </ProtectedRoute>
                }
              />
              {/* Protected Role-Based Routes: Organizer Platform */}
              <Route
                path="/operations"
                element={
                  <ProtectedRoute allowedRoles={["organizer"]}>
                    <OrganizerOverviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operations/events"
                element={
                  <ProtectedRoute allowedRoles={["organizer"]}>
                    <OrganizerEventsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operations/events/:eventId"
                element={
                  <ProtectedRoute allowedRoles={["organizer"]}>
                    <OrganizerEventConfigPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operations/events/:eventId/3d-venue"
                element={
                  <ProtectedRoute allowedRoles={["organizer"]}>
                    <Suspense fallback={<div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center text-sm">Opening indoor floor map…</div>}><Venue3DPage /></Suspense>
                  </ProtectedRoute>
                }
              />
              <Route path="/operations/events/:eventId/ecosystem" element={<Navigate to="/operations" replace />} />
              <Route path="/operations/ecosystem" element={<Navigate to="/operations" replace />} />
              <Route
                path="/operations/events/:eventId/intelligence"
                element={
                  <ProtectedRoute allowedRoles={["organizer"]}>
                    <OrganizerIntelligencePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operations/intelligence"
                element={
                  <ProtectedRoute allowedRoles={["organizer"]}>
                    <OrganizerIntelligencePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operations/events/:eventId/weather-twin"
                element={
                  <ProtectedRoute allowedRoles={["organizer"]}>
                    <OrganizerWeatherTwinPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operations/weather-twin"
                element={
                  <ProtectedRoute allowedRoles={["organizer"]}>
                    <OrganizerWeatherTwinPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operations/events/:eventId/live"
                element={
                  <ProtectedRoute allowedRoles={["organizer"]}>
                    <OrganizerIntelligencePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operations/live"
                element={
                  <ProtectedRoute allowedRoles={["organizer"]}>
                    <OrganizerIntelligencePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operations/events/:eventId/crowd"
                element={
                  <ProtectedRoute allowedRoles={["organizer"]}>
                    <OrganizerCrowdPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operations/crowd"
                element={
                  <ProtectedRoute allowedRoles={["organizer"]}>
                    <OrganizerCrowdPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operations/events/:eventId/transport"
                element={
                  <ProtectedRoute allowedRoles={["organizer"]}>
                    <OrganizerTransportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operations/transport"
                element={
                  <ProtectedRoute allowedRoles={["organizer"]}>
                    <OrganizerTransportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operations/events/:eventId/parking"
                element={
                  <ProtectedRoute allowedRoles={["organizer"]}>
                    <OrganizerParkingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operations/parking"
                element={
                  <ProtectedRoute allowedRoles={["organizer"]}>
                    <OrganizerParkingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operations/events/:eventId/hospitality"
                element={
                  <ProtectedRoute allowedRoles={["organizer"]}>
                    <OrganizerHospitalityPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operations/hospitality"
                element={
                  <ProtectedRoute allowedRoles={["organizer"]}>
                    <OrganizerHospitalityPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/operations/events/:eventId/alerts" element={<Navigate to="/operations" replace />} />
              <Route path="/operations/alerts" element={<Navigate to="/operations" replace />} />
              <Route
                path="/operations/profile"
                element={
                  <ProtectedRoute allowedRoles={["organizer"]}>
                    <OrganizerProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Role-Based Routes: Operator */}
              <Route
                path="/operators"
                element={
                  <ProtectedRoute allowedRoles={["operator"]}>
                    <OperatorOverviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operators/events"
                element={
                  <ProtectedRoute allowedRoles={["operator"]}>
                    <OperatorEventsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operators/events/:eventId"
                element={
                  <ProtectedRoute allowedRoles={["operator"]}>
                    <OperatorEventDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operators/events/:eventId/venue-map"
                element={
                  <ProtectedRoute allowedRoles={["operator"]}>
                    <Suspense fallback={<div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center text-sm">Opening indoor map…</div>}><Venue3DPage /></Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operators/events/:eventId/resources/:resourceId"
                element={
                  <ProtectedRoute allowedRoles={["operator"]}>
                    <OperatorResourceDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operators/resources"
                element={
                  <ProtectedRoute allowedRoles={["operator"]}>
                    <OperatorResourcesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operators/resources/:resourceId"
                element={
                  <ProtectedRoute allowedRoles={["operator"]}>
                    <OperatorResourceDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operators/capacity"
                element={
                  <ProtectedRoute allowedRoles={["operator"]}>
                    <OperatorCapacityPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operators/availability"
                element={
                  <ProtectedRoute allowedRoles={["operator"]}>
                    <OperatorAvailabilityPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operators/demand"
                element={
                  <ProtectedRoute
                    allowedRoles={["operator"]}
                    allowedOperatorTypes={["Accommodation", "Transport", "Food & Dining"]}
                  >
                    <OperatorDemandPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operators/bookings"
                element={
                  <ProtectedRoute
                    allowedRoles={["operator"]}
                    allowedOperatorTypes={["Accommodation"]}
                  >
                    <OperatorBookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operators/routes"
                element={
                  <ProtectedRoute
                    allowedRoles={["operator"]}
                    allowedOperatorTypes={["Transport"]}
                  >
                    <OperatorRoutesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operators/occupancy"
                element={
                  <ProtectedRoute
                    allowedRoles={["operator"]}
                    allowedOperatorTypes={["Parking"]}
                  >
                    <OperatorOccupancyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operators/entry-exit"
                element={
                  <ProtectedRoute
                    allowedRoles={["operator"]}
                    allowedOperatorTypes={["Parking"]}
                  >
                    <OperatorEntryExitPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operators/incidents"
                element={
                  <ProtectedRoute
                    allowedRoles={["operator"]}
                    allowedOperatorTypes={["Medical & Assistance"]}
                  >
                    <OperatorIncidentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operators/issues"
                element={
                  <ProtectedRoute
                    allowedRoles={["operator"]}
                    allowedOperatorTypes={["Venue Services"]}
                  >
                    <OperatorIssuesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operators/live"
                element={<Navigate to="/operators" replace />}
              />
              <Route
                path="/operators/alerts"
                element={
                  <ProtectedRoute allowedRoles={["operator"]}>
                    <OperatorAlertsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operators/profile"
                element={
                  <ProtectedRoute allowedRoles={["operator"]}>
                    <OperatorProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </TicketProvider>
        </EventProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
