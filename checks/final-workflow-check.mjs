import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const checks = [];
const must = (ok, label) => {
  checks.push({ ok: Boolean(ok), label });
  if (!ok) process.exitCode = 1;
};

const app = read('src/App.tsx');
const overview = read('src/pages/AttendeeOverviewPage.tsx');
const venue = read('src/pages/venue3d/Venue3DPage.tsx');
const floor = read('src/components/venue3d/VideoFloorMap.tsx');
const storage = read('src/services/spatialTwinStorage.ts');
const crowd = read('src/pages/organizer/OrganizerCrowdPage.tsx');
const operatorDetail = read('src/pages/operator/OperatorEventDetailPage.tsx');
const operatorCapacity = read('src/pages/operator/OperatorCapacityPage.tsx');
const weather = read('src/pages/organizer/OrganizerWeatherTwinPage.tsx');
const nugen = read('src/components/ai/NugenRoleAssistant.tsx');
const server = read('server.ts');
const api = read('api/[...path].ts');
const organizerLayout = read('src/components/organizer/OrganizerLayout.tsx');
const operatorLayout = read('src/components/operator/OperatorLayout.tsx');
const attendeeLayout = read('src/components/layout/AppLayout.tsx');

// 1. Attendee overview is compact and pass-connection block removed.
must(!overview.includes('AttendeeJourney'), 'Attendee overview no longer renders Connect/Add Pass journey block');
must(overview.includes('/venue-map'), 'Attendee overview links directly to indoor navigation');

// 2. One published indoor map shared across roles.
must(app.includes('/my-event/:eventId/venue-map'), 'Attendee indoor-map route exists');
must(app.includes('/operators/events/:eventId/venue-map'), 'Operator indoor-map route exists');
must(app.includes('/operations/events/:eventId/3d-venue'), 'Organizer indoor-map route remains available');
must(storage.includes('loadPublishedSpatialTwin') && storage.includes('publishSpatialTwin'), 'Draft/publish storage workflow exists');
must(venue.includes("role === 'organizer'") && venue.includes('loadPublishedSpatialTwin'), 'Attendee/operator load published map while organizer can edit draft');
must(floor.includes('onInsideEvent') && floor.includes('onSourceChange'), 'Attendee inside-event presence and route-source callbacks exist');
must(floor.includes('onVolunteerMoved'), 'Organizer volunteer drag/reassignment callback exists');
must(crowd.includes('CrowdPresenceMiniMap') && crowd.includes('getEventPresence'), 'Organizer crowd page visualizes inside-event attendee positions');
must(operatorDetail.includes('Field checklist') && operatorDetail.includes('updateFieldAssignment'), 'Operator field checklist can acknowledge/complete volunteer tasks');

// 3. Nugen is a separate, role-scoped chatbot in all authenticated shells.
must(attendeeLayout.includes('<NugenRoleAssistant'), 'Nugen assistant mounted for attendee');
must(organizerLayout.includes('<NugenRoleAssistant'), 'Nugen assistant mounted for organizer');
must(operatorLayout.includes('<NugenRoleAssistant'), 'Nugen assistant mounted for operator');
must(nugen.includes("role: 'attendee'") && nugen.includes("role: 'organizer'") && nugen.includes("role: 'operator'"), 'Nugen context is role-specific');
must(server.includes("app.post('/api/nugen/chat'") && api.includes("app.post('/api/nugen/chat'"), 'Nugen role-chat endpoint exists locally and on Vercel');
must(!server.includes('/api/nugen/weather-advisor') && !api.includes('/api/nugen/weather-advisor'), 'Weather/Nugen combined advisor endpoint removed');

// 4. Weather remains its own compact Digital Twin feature.
must(weather.includes('fetchLiveWeather') && weather.includes('fetchSocialSignals'), 'Weather Twin uses live weather + public/social signals');
must(weather.includes('Leaflet') || weather.includes("from 'leaflet'"), 'Weather Twin includes geospatial map visualization');
must(weather.includes('What-if') && weather.includes('Rain') && weather.includes('Flood'), 'Weather Twin provides interactive what-if controls');
must(weather.includes('Suggested shifts') && weather.includes('p90Risk'), 'Weather Twin provides operational shifts + uncertainty');
must(!weather.includes('Nugen'), 'Weather page is not combined with Nugen UI');

// 5. Resource capacity uses system calculation + persistent trend registry.
must(operatorCapacity.includes('calculateResourceCapacity') && operatorCapacity.includes('recordCapacitySnapshot'), 'Resource capacity derives system calculations from resource/live-demand data');
must(operatorCapacity.includes('Trend registry') && operatorCapacity.includes('getCapacityHistory'), 'Capacity trend registry is persisted and visualized');

console.log('\nEventFlow final workflow audit');
for (const c of checks) console.log(`${c.ok ? 'PASS' : 'FAIL'}  ${c.label}`);
const passed = checks.filter(c => c.ok).length;
console.log(`\n${passed}/${checks.length} checks passed.`);
if (process.exitCode) process.exit(process.exitCode);
