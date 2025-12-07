const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

async function request(path, opts = {}){
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) },
    ...opts,
  });
  const text = await res.text();
  try{ return JSON.parse(text); } catch(e){ return text; }
}

export async function login(username, password){
  const data = await request('/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  if (!data || (data && data.access === undefined && data.token === undefined && !('error' in data))) {
    throw new Error(data?.detail || data?.error || 'Invalid login response');
  }
  // normalize token field
  return { access: data.access || data.token };
}

export async function signup(username, email, password){
  const data = await request('/signup/', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  });
  if (!data || ('error' in data)) {
    throw new Error(data?.detail || data?.error || 'Signup failed');
  }
  return data;
}

export default { login, signup };
