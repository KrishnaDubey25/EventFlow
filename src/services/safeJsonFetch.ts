export async function safeJsonFetch<T = any>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!contentType.includes('application/json')) {
    const looksHtml = /<!doctype|<html/i.test(text);
    const reason = looksHtml
      ? 'Live server endpoint is unavailable in this deployment.'
      : `Live server returned an unsupported response.`;
    throw new Error(reason);
  }

  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; }
  catch { throw new Error('The server returned malformed JSON.'); }

  if (!response.ok) throw new Error(data?.error || data?.message || `Request failed (${response.status})`);
  return data as T;
}
