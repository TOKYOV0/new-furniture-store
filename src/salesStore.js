import { useEffect, useState } from "react";

const STORAGE_KEY = "grainhouse_sales_v1";
const CONFIG_KEY = "grainhouse_sales_config_v1";
const EVENT_NAME = "grainhouse-sales-updated";

function read(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

export function getSales() { return read(STORAGE_KEY, []); }
const defaultSalesConfig = {
  webhookUrl: import.meta.env.VITE_SALES_WEBHOOK_URL || "",
};

export function getSalesConfig() {
  if (import.meta.env.VITE_SALES_WEBHOOK_URL) {
    return { webhookUrl: import.meta.env.VITE_SALES_WEBHOOK_URL };
  }
  return read(CONFIG_KEY, { ...defaultSalesConfig });
}

export async function recordSale(sale) {
  const sales = getSales();
  const next = [sale, ...sales];
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window?.dispatchEvent(new CustomEvent(EVENT_NAME));

  const webhookUrl = getSalesConfig().webhookUrl;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, { method:"POST", mode:"no-cors", headers:{"Content-Type":"text/plain;charset=utf-8"}, body:JSON.stringify(sale) });
    } catch (e) { console.warn("Google Sheets sync failed", e); }
  }
  return sale;
}

export function clearDemoSales() {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  window?.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function saveSalesConfig(config) {
  if (typeof window !== "undefined") {
    const nextConfig = {
      webhookUrl: config?.webhookUrl || import.meta.env.VITE_SALES_WEBHOOK_URL || "",
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(nextConfig));
  }
}

export async function syncSalesFromSheet() {
  const url = getSalesConfig().webhookUrl;
  if (!url) return getSales();
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const data = await res.json();
  if (!data.ok || !Array.isArray(data.sales)) throw new Error("Invalid Google Sheets response");
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(data.sales));
  window?.dispatchEvent(new CustomEvent(EVENT_NAME));
  return data.sales;
}

export function useSales() {
  const [sales, setSales] = useState(getSales());
  useEffect(() => {
    const refresh = () => setSales(getSales());
    const url = getSalesConfig().webhookUrl;
    if (url) syncSalesFromSheet().catch(() => {});
    window.addEventListener(EVENT_NAME, refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(EVENT_NAME, refresh); window.removeEventListener("storage", refresh); };
  }, []);
  return sales;
}
