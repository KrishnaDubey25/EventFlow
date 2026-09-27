import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
const dir=mkdtempSync(path.join(tmpdir(),'eventflow-tests-'));
const port=String(14000+Math.floor(Math.random()*1000));process.env.TEST_BASE_URL='http://127.0.0.1:'+port;
const server=spawn(process.execPath,['--import','tsx','server.ts'],{env:{...process.env,NODE_ENV:'development',LIVE_SETUP_KEY:'',LIVE_DATA_DIR:dir,PORT:port},stdio:['ignore','ignore','inherit']});
try {
 let ready=false;for(let i=0;i<80;i++){try{await fetch(process.env.TEST_BASE_URL+'/api/health');ready=true;break;}catch{await new Promise(r=>setTimeout(r,100));}}
 if(!ready) throw new Error('Test server did not start');
 await import('./live-venue-api.mjs');
} finally { server.kill(); await new Promise(resolve=>server.once('exit',resolve));rmSync(dir,{recursive:true,force:true}); }
