import assert from 'node:assert/strict';
import { chromium } from '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import QRCode from '../node_modules/qrcode/lib/index.js';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
const dir=mkdtempSync('/tmp/ef-journey-test-');const base='http://127.0.0.1:3000';
const server=spawn(process.execPath,['--import','tsx','server.ts'],{env:{...process.env,LIVE_DATA_DIR:dir,LIVE_SETUP_KEY:''},stdio:['ignore','ignore','inherit']});
for(let i=0;i<50;i++){try{await fetch(base+'/api/health');break;}catch{await new Promise(r=>setTimeout(r,100));}}
const browser=await chromium.launch({headless:true,executablePath:'/tmp/ef-journey-browser/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote'],env:{...process.env,LD_LIBRARY_PATH:'/tmp/ef-journey-browser',FONTCONFIG_PATH:'/etc/fonts'}});
const errors=[];
try{
 const context=await browser.newContext({viewport:{width:1440,height:1100},permissions:['geolocation'],geolocation:{latitude:19.06,longitude:72.8656,accuracy:12}});
 await context.addInitScript(()=>localStorage.setItem('eventflow_session',JSON.stringify({userId:'usr_demo_attendee'})));
 // Deliberate directory fixture verifies rendering/filtering only, not upstream availability.
 await context.route('**/api/live-venue/nearby?*',route=>route.fulfill({json:{places:[{id:'osm-node-test',name:'Test Hotel Fixture',kind:'hotel',lat:19.061,lng:72.866,status:'unknown',note:'Test listing only',updatedAt:0,source:'osm'}],source:'test fixture'}}));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/overview');await page.getByRole('heading',{name:'One pass. Your entire event.'}).waitFor();
 assert.equal(await page.getByRole('heading',{name:'Your place.'}).count(),0);
 await page.waitForTimeout(400);await page.screenshot({path:'checks/journey-pass-desktop.png',fullPage:true});
 assert.ok(await page.getByText('EXAMPLE MODE · LIVE EVENT').count());assert.ok(await page.getByText('CONCEPTUAL · UPCOMING EVENTS').count());
 const ticket=page.locator('.ej-ticket').first();await ticket.click();await page.getByRole('heading',{name:'Are you at the event?'}).waitFor();
 await page.getByRole('button',{name:'Not yet · Plan my visit'}).click();await page.getByRole('heading',{name:'Explore nearby',exact:true}).waitFor();
 assert.equal(await page.getByRole('button',{name:'Stop location',exact:true}).count(),0);
 await page.getByRole('button',{name:'Hotels',exact:true}).click();await page.getByRole('button',{name:'Test Hotel Fixture Hotels'}).waitFor();
 assert.equal(await page.locator('.ej-directory-list .ej-place').count(),1);
 await page.getByRole('button',{name:'Test Hotel Fixture Hotels'}).click();await page.getByRole('link',{name:'Directions',exact:true}).waitFor();
 await page.getByRole('button',{name:'Save place',exact:true}).click();await page.getByRole('button',{name:'Saved',exact:true}).first().click();
 await page.getByRole('button',{name:'Pass & arrival'}).click();await page.getByRole('button',{name:'Yes, I’m at the event'}).click();
 await page.getByText('Your location · accuracy ±12m',{exact:false}).waitFor({timeout:20000});
 await page.getByRole('button',{name:'Stop location',exact:true}).click();
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(400);await page.screenshot({path:'checks/journey-map-mobile.png',fullPage:true});console.log('OVERFLOW',await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1 && getComputedStyle(e).position!=='fixed').map(e=>({tag:e.tagName,cls:e.className,right:e.getBoundingClientRect().right})).slice(0,20)));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.getByRole('button',{name:'Pass & arrival'}).click();await page.getByRole('button',{name:'Change pass'}).click();
 const token='EVENTFLOW::TKT::EF-2026-EXP-AR01::mumbai-tech-ai-expo-2026::usr_demo_attendee::08:30-09:30-IST';await QRCode.toFile('checks/upload-pass.png',token,{width:600});
 await page.locator('.ej-shell input[type=file]').setInputFiles('checks/upload-pass.png');await page.getByRole('heading',{name:'Are you at the event?'}).waitFor();assert.ok(await page.getByText('ACCOUNT PASS SELECTED',{exact:true}).count());
 const created=await fetch(base+'/api/live-venue/rooms',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Connected test event',eventId:'mumbai-tech-ai-expo-2026',center:{lat:19.06,lng:72.8656},radius:500})}).then(r=>r.json());
 await page.reload();await page.getByRole('heading',{name:'Are you at the event?'}).waitFor();await page.getByRole('button',{name:'Yes, I’m at the event'}).click();await page.getByRole('heading',{name:'Find your flow.'}).waitFor({timeout:20000});
 await page.getByText('Within venue proximity area',{exact:true}).waitFor({timeout:20000});
 assert.equal(await page.locator('.ef-topbar').count(),0);assert.equal(await page.locator('.ef-intro').count(),0);
 const opContext=await browser.newContext({viewport:{width:1440,height:1100}});await opContext.addInitScript(()=>localStorage.setItem('eventflow_session',JSON.stringify({userId:'usr_demo_organizer'})));
 const op=await opContext.newPage();op.on('pageerror',e=>errors.push(e.message));await op.goto(base+'/operations/events/mumbai-tech-ai-expo-2026/crowd');await op.getByRole('button',{name:/Venue map & facility operations/}).click();await op.getByRole('button',{name:/Staff controls/}).click();await op.getByLabel('STAFF KEY',{exact:true}).fill(created.staffToken);await op.getByRole('button',{name:'Pair this device'}).click();await op.getByRole('button',{name:'Map a place'}).click();await op.getByLabel('PLACE NAME').fill('Hotel A');await op.getByLabel(/^TYPE/).selectOption('hotel');await op.getByLabel('CURRENT OBSERVATION').selectOption('normal');await op.getByLabel('CAPACITY (OPTIONAL)').fill('20');await op.getByLabel('CURRENTLY USED').fill('7');await op.getByLabel(/^UNIT/).selectOption('rooms');await op.getByRole('button',{name:'Publish observation'}).click();
 await op.getByRole('button',{name:'Map a place'}).click();await op.getByLabel('PLACE NAME').fill('Gate 1 — BKC Grand Ingress');await op.getByLabel(/^TYPE/).selectOption('gate');await op.getByLabel('CURRENT OBSERVATION').selectOption('busy');await op.getByRole('button',{name:'Publish observation'}).click();
 await page.getByText('Gate 1 (BKC Grand Ingress) · busy',{exact:true}).waitFor({timeout:15000});await page.getByLabel('Guidance update interval').selectOption('10');await page.getByText(/Next summary in ~\d+ min/).first().waitFor();assert.equal(await page.getByLabel('Guidance update interval').inputValue(),'10');
 await page.getByRole('button',{name:'Hotel A Hotels · normal'}).waitFor({timeout:15000});await page.getByRole('button',{name:'Hotel A Hotels · normal'}).click();await page.getByText('13 / 20 rooms available',{exact:true}).waitFor();
 assert.equal(await page.locator('.ef-embedded .ef-staff').count(),0);await page.setViewportSize({width:1440,height:1100});await page.waitForTimeout(400);await page.screenshot({path:'checks/journey-connected-desktop.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS: dashboard pass → arrival → map, not-yet without GPS, opt-in GPS under StrictMode, QR upload match, filter/save/directions, mobile overflow, automatic event room, embedded staff hotel capacity and cross-role update. Directory fixture used; external map tiles not asserted.');
}finally{await browser.close();server.kill();rmSync(dir,{recursive:true,force:true});}
