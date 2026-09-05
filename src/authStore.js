import { useEffect, useState } from "react";

const CONFIG_KEY = "shukarwaar_users_config_v1";
const SESSION_KEY = "shukarwaar_user_session_v1";
const EVENT_NAME = "shukarwaar-user-updated";

function normalizeUsersUrl(value) {
  return String(value || "").trim().replace(/\/dev(?:\?.*)?$/, "/exec");
}

function read(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function getUsersConfig() {
  if (import.meta.env.VITE_USERS_WEBHOOK_URL) {
    return { webhookUrl: import.meta.env.VITE_USERS_WEBHOOK_URL };
  }
  return read(CONFIG_KEY, { webhookUrl: "" });
}

export function saveUsersConfig(config) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CONFIG_KEY, JSON.stringify({ webhookUrl: String(config?.webhookUrl || "").trim() }));
  }
}

export function getUserSession() {
  return read(SESSION_KEY, null);
}

function setSession(user) {
  if (typeof window !== "undefined") {
    if (user) window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }
  return user;
}

async function request(action, payload = {}) {
  const url = normalizeUsersUrl(getUsersConfig().webhookUrl);
  if (!url) throw new Error("Users Google Apps Script URL is not configured.");
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, ...payload }),
    });
  } catch {
    throw new Error("Could not reach the Users Apps Script. Check that its Web App deployment is set to Anyone and that the URL is correct.");
  }
  if (response.status === 401 || response.status === 403) {
    throw new Error(`Users Apps Script returned ${response.status}. Deploy the Users script as a Web app with Execute as Me and Who has access set to Anyone, then use the /exec URL.`);
  }
  const body = await response.text();
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    throw new Error("The Users Apps Script did not return JSON. Redeploy it as a Web app and use the /exec URL, not /dev.");
  }
  if (!data.ok) throw new Error(data.error || "Authentication request failed.");
  return data;
}

export async function registerUser({ name, email, phone, address = "", password }) {
  const data = await request("register", { name, email, phone, address, password });
  return setSession(data.user);
}

export async function loginUser({ identifier, password }) {
  const data = await request("login", { identifier, password });
  return setSession(data.user);
}

export async function loginWithGoogle(credential) {
  const data = await request("googleLogin", { credential });
  return setSession(data.user);
}

export async function fetchUsers() {
  const data = await request("list");
  return data.users || [];
}

export async function updateUser(user) {
  const data = await request("update", user);
  return setSession(data.user);
}

export async function deleteUser(id) {
  return request("delete", { id });
}

export async function logoutUser() {
  return setSession(null);
}

export function useUserSession() {
  const [session, setSessionState] = useState(getUserSession());
  useEffect(() => {
    const refresh = () => setSessionState(getUserSession());
    window.addEventListener(EVENT_NAME, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT_NAME, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return session;
}
