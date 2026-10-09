import { getToken, clearAuth } from "./auth.js";

const getBaseUrl = () => {
  const envUrl = import.meta.env?.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, "");
  }
  return "http://localhost:5000/api";
};

const BASE_URL = getBaseUrl();

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      // Session expired or invalid
      if (!endpoint.includes("/crm/auth/login")) {
        clearAuth();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = "/login?expired=1";
        }
      }
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

// Auth API
export const loginApi = (username, password, role) =>
  request("/crm/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password, role })
  });

export const verifySessionApi = () =>
  request("/crm/auth/verify", { method: "GET" });

// Leads API
export const fetchLeadsApi = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      query.append(key, value);
    }
  });
  const queryString = query.toString();
  return request(`/crm/leads${queryString ? `?${queryString}` : ""}`, { method: "GET" });
};

export const fetchLeadByIdApi = (id) =>
  request(`/crm/leads/${id}`, { method: "GET" });

export const createLeadApi = (leadData) =>
  request("/crm/leads", {
    method: "POST",
    body: JSON.stringify(leadData)
  });

export const updateLeadApi = (id, data) =>
  request(`/crm/leads/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });

export const updateLeadStatusApi = (id, payload) =>
  request(`/crm/leads/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });

export const addLeadNoteApi = (id, text, author) =>
  request(`/crm/leads/${id}/notes`, {
    method: "POST",
    body: JSON.stringify({ text, author })
  });

export const scheduleFollowupApi = (id, payload) =>
  request(`/crm/leads/${id}/followup`, {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const deleteLeadApi = (id) =>
  request(`/crm/leads/${id}`, { method: "DELETE" });

export const syncLeadsApi = () =>
  request("/crm/leads/sync", { method: "POST" });

export const fetchAnalyticsApi = () =>
  request("/crm/leads/analytics", { method: "GET" });

export const fetchPermissionsApi = () =>
  request("/crm/leads/permissions", { method: "GET" });

export const updatePermissionsApi = (permissions) =>
  request("/crm/leads/permissions", {
    method: "PUT",
    body: JSON.stringify({ permissions })
  });
