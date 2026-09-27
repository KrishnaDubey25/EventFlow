import { spawn } from 'node:child_process';
const server=spawn(process.execPath,['--import','tsx','server.ts'],{stdio:['ignore','pipe','pipe']});
server.stdout.on('data',d=>process.stdout.write(d));server.stderr.on('data',d=>process.stderr.write(d));
let ready=false;for(let i=0;i<40;i++){try{await fetch('http://127.0.0.1:3000/api/health');ready=true;break;}catch{await new Promise(r=>setTimeout(r,250));}}
if(!ready){server.kill();throw new Error('Server did not start');}
try{await import(process.env.API_ONLY ? './api.mjs' : './live-venue.mjs');}finally{server.kill();}
