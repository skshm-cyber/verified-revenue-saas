export async function connectStripe(token, apiKey) {
  const companyId = localStorage.getItem("companyId");
  const res = await fetch(`http://localhost:8000/api/revenue/integrations/stripe/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ api_key: apiKey, company_id: companyId })
  });
  if (!res.ok) throw new Error("Stripe connection failed");
  return await res.json();
}

export async function connectRazorpay(token, apiKey, apiSecret) {
  const companyId = localStorage.getItem("companyId");
  const res = await fetch(`http://localhost:8000/api/revenue/integrations/razorpay/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ api_key: apiKey, api_secret: apiSecret, company_id: companyId })
  });
  if (!res.ok) throw new Error("Razorpay connection failed");
  return await res.json();
}

export async function connectPaypal(token, clientId, clientSecret) {
  const companyId = localStorage.getItem("companyId");
  const res = await fetch(`http://localhost:8000/api/revenue/integrations/paypal/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, company_id: companyId })
  });
  if (!res.ok) throw new Error("PayPal connection failed");
  return await res.json();
}
// Simple API client for TrustMRR Dashboard

const BASE_URL = "http://localhost:8000/api";

export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error("Login failed");
  return await res.json();
}

export async function signup(username, email, password) {
  const res = await fetch(`${BASE_URL}/signup/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  });
  if (!res.ok) throw new Error("Signup failed");
  return await res.json();
}

export async function getCompanies(token) {
  const res = await fetch(`${BASE_URL}/revenue/companies/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch companies");
  return await res.json();
}

export async function addRevenue(token, companyId, mrr) {
  const res = await fetch(`${BASE_URL}/revenue/add/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ company_id: companyId, mrr })
  });
  if (!res.ok) throw new Error("Failed to add revenue");
  return await res.json();
}

export async function getCompanyMRR(token, companyId) {
  const res = await fetch(`${BASE_URL}/revenue/companies/${companyId}/mrr/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch MRR");
  return await res.json();
}
