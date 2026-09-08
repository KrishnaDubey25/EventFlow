(function(){
  const cfg = window.EVENTFLOW_CONFIG || {};
  const base = (cfg.SUPABASE_URL || '').replace(/\/$/, '');
  const key = cfg.SUPABASE_PUBLISHABLE_KEY || '';
  const STORE = 'eventflow.supabase.session';

  function getSession(){
    try { return JSON.parse(localStorage.getItem(STORE) || 'null'); } catch { return null; }
  }
  function setSession(session){
    if(session) localStorage.setItem(STORE, JSON.stringify(session));
    else localStorage.removeItem(STORE);
  }
  function authHeader(){
    const s = getSession();
    return s?.access_token ? { Authorization: `Bearer ${s.access_token}` } : { Authorization: `Bearer ${key}` };
  }
  async function request(path, options={}){
    if(!base || !key) throw new Error('Supabase is not configured.');
    const headers = {
      apikey: key,
      'Content-Type': 'application/json',
      ...authHeader(),
      ...(options.headers || {})
    };
    const res = await fetch(base + path, { ...options, headers });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if(!res.ok){
      const message = data?.msg || data?.message || data?.error_description || data?.hint || `${res.status} ${res.statusText}`;
      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  async function signUp({email,password,name,role}){
    const data = await request('/auth/v1/signup', {
      method:'POST',
      body: JSON.stringify({ email, password, data:{ name, role } })
    });
    if(data?.access_token) setSession(data);
    return data;
  }
  async function signIn({email,password}){
    const data = await request('/auth/v1/token?grant_type=password', {
      method:'POST',
      body: JSON.stringify({ email, password })
    });
    setSession(data);
    return data;
  }
  async function signOut(){
    const s = getSession();
    try {
      if(s?.access_token) await request('/auth/v1/logout', { method:'POST' });
    } catch(e) {}
    setSession(null);
  }
  async function getUser(){
    const s = getSession();
    if(!s?.access_token) return null;
    try { return await request('/auth/v1/user'); } catch { return null; }
  }

  function q(v){ return encodeURIComponent(v); }
  async function select(table, query='select=*'){
    return request(`/rest/v1/${table}?${query}`, { method:'GET', headers:{ Prefer:'return=representation' } });
  }
  async function insert(table, row){
    return request(`/rest/v1/${table}`, { method:'POST', headers:{ Prefer:'return=representation' }, body:JSON.stringify(row) });
  }
  async function update(table, row, filters){
    const suffix = Object.entries(filters || {}).map(([k,v])=>`${k}=eq.${q(v)}`).join('&');
    return request(`/rest/v1/${table}?${suffix}`, { method:'PATCH', headers:{ Prefer:'return=representation' }, body:JSON.stringify(row) });
  }
  async function upsert(table, row, onConflict='id'){
    return request(`/rest/v1/${table}?on_conflict=${q(onConflict)}`, {
      method:'POST', headers:{ Prefer:'resolution=merge-duplicates,return=representation' }, body:JSON.stringify(row)
    });
  }
  async function ping(){
    try {
      const res = await fetch(base + '/auth/v1/settings', { headers:{apikey:key} });
      return res.ok;
    } catch { return false; }
  }

  window.EventFlowSupabase = { getSession,setSession,signUp,signIn,signOut,getUser,select,insert,update,upsert,ping };
})();
