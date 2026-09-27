import fs from 'node:fs/promises';
import path from 'node:path';

const API = 'https://api.nugen.in/api/v3';
const key = process.env.NUGEN_API_KEY;
if (!key) throw new Error('Set NUGEN_API_KEY before running this script.');
const baseModel = process.env.NUGEN_BASE_MODEL || 'qwen-v2p5-0p5b-instruct';
const corpusPath = path.resolve('nugen/eventflow-role-assistant-corpus.txt');
const corpus = await fs.readFile(corpusPath);
const headers = { Authorization: `Bearer ${key}` };
const alignmentName = process.env.NUGEN_ALIGNMENT_NAME || 'EventFlow Role Assistant Intelligence';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function jsonOrText(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function api(pathname, options = {}) {
  const res = await fetch(`${API}${pathname}`, options);
  if (!res.ok) {
    const body = await jsonOrText(res);
    throw new Error(`${options.method || 'GET'} ${pathname} failed: ${res.status} ${typeof body === 'string' ? body : JSON.stringify(body)}`);
  }
  return jsonOrText(res);
}

async function pollDocument(documentId) {
  for (;;) {
    const body = await api(`/documents/${documentId}/status`, { headers });
    const status = String(body.status || '').toUpperCase();
    process.stdout.write(`  document ${documentId}: ${status || 'PROCESSING'}\n`);
    if (['READY', 'COMPLETED'].includes(status)) return;
    if (['FAILED', 'ERROR'].includes(status)) throw new Error(`Document ${documentId} ended with ${status}`);
    await sleep(5000);
  }
}

async function pollAlignment(alignmentId) {
  for (;;) {
    const body = await api(`/alignment-projects/${alignmentId}/status`, { headers });
    const status = String(body.status || '').toUpperCase();
    const progress = body.progress != null ? ` ${body.progress}%` : '';
    process.stdout.write(`  alignment: ${status || 'PROCESSING'}${progress}\n`);
    if (['READY', 'COMPLETED'].includes(status)) return body;
    if (['FAILED', 'STOPPED', 'ERROR'].includes(status)) throw new Error(`Alignment ended with ${status}`);
    await sleep(15000);
  }
}

async function findAlignedModel(alignmentId) {
  const detail = await api(`/alignment-projects/${alignmentId}`, { headers });
  if (detail?.model_id) return { modelId: detail.model_id, detail };

  const list = await api('/models/aligned?limit=100&offset=0', { headers });
  const models = Array.isArray(list?.domain_aligned_models) ? list.domain_aligned_models : [];
  const preferred = models
    .filter((m) => m.base_model_id === baseModel)
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))[0];
  if (!preferred?.model_id) throw new Error('Alignment completed, but no aligned model ID was returned. Open the Nugen dashboard and inspect the completed alignment.');
  return { modelId: preferred.model_id, detail };
}

async function ensureDeployed(modelId) {
  let current = null;
  try {
    current = await api(`/models/${encodeURIComponent(modelId)}/deployment/status`, { headers });
    if (String(current?.status || '').toUpperCase() === 'DEPLOYED') return current;
  } catch {}

  try {
    await api(`/models/${encodeURIComponent(modelId)}/deployment`, { method: 'POST', headers });
  } catch (err) {
    if (!String(err?.message || err).includes('already deployed')) throw err;
  }

  for (;;) {
    const body = await api(`/models/${encodeURIComponent(modelId)}/deployment/status`, { headers });
    const status = String(body.status || '').toUpperCase();
    process.stdout.write(`  deployment: ${status || 'DEPLOYING'}\n`);
    if (status === 'DEPLOYED') return body;
    if (['FAILED', 'ERROR'].includes(status)) throw new Error(`Deployment ended with ${status}: ${body.error || ''}`);
    await sleep(5000);
  }
}

console.log('0/6 Verifying Nugen account + alignment-ready base model...');
const baseList = await api('/models/base?limit=100&offset=0', { headers });
const base = (baseList.models || []).find((m) => m.model_id === baseModel);
if (!base) throw new Error(`Base model ${baseModel} is not available to this account.`);
if (!base.alignment_ready) throw new Error(`Base model ${baseModel} is not alignment-ready for this account.`);
console.log(`  base model: ${base.model_name || base.model_id}`);

console.log('1/6 Uploading EventFlow domain corpus to Nugen...');
const form = new FormData();
// Nugen's generated docs show both `files` and `files.items`; supplying the actual
// Blob under `files` matches the file[] schema, while `files.items` improves
// compatibility with the generated multipart examples.
const blob = new Blob([corpus], { type: 'text/plain' });
form.append('files', blob, 'eventflow-role-assistant-corpus.txt');
form.append('files.items', blob, 'eventflow-role-assistant-corpus.txt');
form.append('categories', 'eventflow-role-assistant');
form.append('names', 'EventFlow Role Assistant Corpus');
const uploaded = await api('/documents/create', { method: 'POST', headers, body: form });
const documentIds = uploaded.document_ids || uploaded.documents;
if (!Array.isArray(documentIds) || !documentIds.length) throw new Error('Nugen did not return document IDs.');
console.log('  documents:', documentIds.join(', '));

console.log('2/6 Waiting for Nugen to process the domain corpus...');
for (const id of documentIds) await pollDocument(id);

console.log('3/6 Creating domain alignment project...');
const created = await api('/alignment-projects/create', {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    alignment_name: alignmentName,
    base_model_id: baseModel,
    document_ids: documentIds,
    description: 'EventFlow domain alignment for role-scoped attendee, organizer, operator, indoor navigation, volunteer dispatch, resource capacity, weather, and event operations assistance.',
  }),
});
const alignmentId = created.alignment_id;
if (!alignmentId) throw new Error('Nugen did not return alignment_id.');
console.log('  alignment:', alignmentId);

console.log('4/6 Waiting for alignment to complete...');
await pollAlignment(alignmentId);
const { modelId, detail } = await findAlignedModel(alignmentId);
console.log('  aligned model:', modelId);

console.log('5/6 Deploying the aligned model for inference...');
await ensureDeployed(modelId);

console.log('6/6 Running an aligned-model smoke inference...');
const smoke = await api('/inference/chat/completions', {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: modelId,
    messages: [
      { role: 'system', content: 'You are the EventFlow Role Assistant Intelligence model.' },
      { role: 'user', content: 'In one short sentence, explain what operational layer you specialize in.' },
    ],
    max_tokens: 80,
    temperature: 0.1,
    stream: false,
  }),
});
const smokeText = String(smoke?.choices?.[0]?.message?.content || '').trim();
console.log('  inference:', smokeText || '(response received)');
if (smoke?.confidence_score != null) console.log('  Nugen alignment confidence:', smoke.confidence_score);

const envLines = [
  `NUGEN_MODEL_ID=${modelId}`,
  `NUGEN_ALIGNMENT_ID=${alignmentId}`,
  `NUGEN_BASE_MODEL=${baseModel}`,
  `NUGEN_ALIGNMENT_NAME=${alignmentName}`,
].join('\n') + '\n';
await fs.writeFile('.nugen.env.generated', envLines, 'utf8');

console.log('\n✅ Nugen customization + deployment + inference verified.');
console.log('Add these SERVER-SIDE variables to Vercel (also add your private NUGEN_API_KEY):');
console.log(envLines.trim());
if (detail?.performance_metrics) console.log('Alignment metrics:', JSON.stringify(detail.performance_metrics));
console.log('\nSaved non-secret IDs to .nugen.env.generated. Keep NUGEN_API_KEY server-side only; never prefix it with VITE_.');
