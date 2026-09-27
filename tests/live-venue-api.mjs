import assert from 'node:assert/strict';
const base=(process.env.TEST_BASE_URL || 'http://127.0.0.1:3000')+'/api/live-venue';
async function call(route, body, headers={}){const r=await fetch(base+route,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...headers},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json()};}
const r=(await call('/rooms',{name:'API validation',eventId:'test-linked-event',center:{lat:18.94,lng:72.82},radius:500})).data;
const route='/rooms/'+r.code; const staff={'X-Venue-Token':r.staffToken};
const guest=(await call(route+'/join',{})).data; const guestHeader={'X-Guest-Token':guest.secret};
assert.equal((await call(route+'/position',{id:guest.id,position:{lat:18.94,lng:72.82,accuracy:12}})).status,403);
await call(route+'/position',{id:guest.id,position:{lat:18.94,lng:72.82,accuracy:12}},guestHeader);
assert.equal((await call(route)).data.active,1);
await call(route+'/position',{id:guest.id,position:{lat:19,lng:73,accuracy:12}},guestHeader);
assert.equal((await call(route)).data.active,0);
await call(route+'/position',{id:guest.id,position:{lat:18.94,lng:72.82,accuracy:150}},guestHeader);
assert.equal((await call(route)).data.active,0);
await call(route+'/position',{id:guest.id,stop:true},guestHeader);
assert.equal((await call(route)).data.active,0);
assert.equal((await call(route+'/zones',{name:'Gate A',lat:18.94,lng:72.82,kind:'gate',status:'crowded'})).status,403);
assert.equal((await call(route+'/zones',{name:'Gate A',lat:18.94,lng:72.82,kind:'gate',status:'crowded'},staff)).status,200);
assert.equal((await call(route)).data.zones[0].status,'crowded');
assert.equal((await call(route+'/scan',{pass:guest.pass,direction:'entry'},staff)).status,200);
assert.equal((await call(route+'/scan',{pass:guest.pass,direction:'entry'},staff)).status,409);
assert.equal((await call(route)).data.inside,1);
assert.equal((await call(route+'/scan',{pass:guest.pass,direction:'exit'},staff)).status,200);
assert.equal((await call(route)).data.inside,0);
assert.equal((await call(route+'/scan',{pass:guest.pass,direction:'exit'},staff)).status,409);
assert.equal((await call(route+'/scan',{pass:'invalid',direction:'entry'},staff)).status,404);
const publicData=(await call(route)).data;assert.equal(publicData.guests,undefined);assert.equal(publicData.staffHash,undefined);assert.equal(publicData.staff,false);assert.equal((await call(route,undefined,staff)).data.staff,true);
assert.equal((await call(route+'/zones',{name:'Invalid',lat:999,lng:10,kind:'gate',status:'normal'},staff)).status,400);
console.log('PASS: 18 live API assertions: permissions, accuracy, proximity, stop, observations, entry/exit deduplication, invalid passes and public privacy.');

assert.equal((await call('/events/test-linked-event/room')).data.code,r.code);
assert.equal((await call('/events/no-such-event/room')).data.code,null);
assert.equal((await call('/nearby?lat=999&lng=10')).status,400);
for(const kind of ['hotel','stay','restaurant','booth','stall','security','exit','help','transport']) {
 assert.equal((await call(route+'/zones',{name:kind,lat:18.94,lng:72.82,kind,status:'normal',capacity:20,used:7,unit:'rooms'},staff)).status,200);
}
assert.equal((await call(route+'/zones',{name:'Bad count',lat:18.94,lng:72.82,kind:'hotel',status:'normal',capacity:10,used:11},staff)).status,400);
assert.equal((await call(route+'/zones',{name:'Unknown usage',lat:18.94,lng:72.82,kind:'parking',status:'normal',capacity:10},staff)).status,400);
console.log('PASS: linked event lookup, extended facilities, numeric availability validation and invalid nearby request.');
