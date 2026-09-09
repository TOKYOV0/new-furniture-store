import { useEffect, useState } from "react";

const STORAGE_KEY = "grainhouse_sales_v1";
const CONFIG_KEY = "grainhouse_sales_config_v1";
const DELETED_KEY = "grainhouse_deleted_orders_v1";
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

export async function updateSaleShipment(shipment) {
  const nextSales = getSales().map(sale => sale.orderId === shipment.orderId ? { ...sale, ...shipment } : sale);
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSales));
  window?.dispatchEvent(new CustomEvent(EVENT_NAME));
  const webhookUrl = getSalesConfig().webhookUrl;
  if (!webhookUrl) return shipment;
  const response = await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "updateShipment", ...shipment }) });
  const raw = await response.text();
  let data;
  try { data = JSON.parse(raw); } catch { throw new Error(`Sales Apps Script did not return JSON (HTTP ${response.status}). Check that VITE_SALES_WEBHOOK_URL uses the deployed /exec URL.`); }
  if (!data.ok) throw new Error(data.error || "Could not save shipment details.");
  return data;
}

export async function deleteSaleOrder(orderId) {
  const nextSales = getSales().filter(sale => sale.orderId !== orderId && sale.id !== orderId);
  const deleted = read(DELETED_KEY, []);
  if (typeof window !== "undefined") localStorage.setItem(DELETED_KEY, JSON.stringify([...new Set([...deleted, orderId])]));
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSales));
  window?.dispatchEvent(new CustomEvent(EVENT_NAME));
  const webhookUrl = getSalesConfig().webhookUrl;
  if (!webhookUrl) return { ok: true };
  const response = await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "deleteOrder", orderId }) });
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || "Could not delete order.");
  return data;
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
  const deleted = new Set(read(DELETED_KEY, []));
  const localSales = getSales();
  const merged = [...data.sales, ...localSales.filter(localSale => !data.sales.some(serverSale => serverSale.id === localSale.id) && !deleted.has(localSale.orderId || localSale.id))].filter(sale => !deleted.has(sale.orderId || sale.id));
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  window?.dispatchEvent(new CustomEvent(EVENT_NAME));
  return merged;
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
