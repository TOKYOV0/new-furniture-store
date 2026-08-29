import { useEffect, useState } from "react";

const STORAGE_KEY = "grainhouse_sales_v1";
const CONFIG_KEY = "grainhouse_sales_config_v1";
const EVENT_NAME = "grainhouse-sales-updated";

const seedSales = [
  { id:"s1", date:"2026-06-03", customer:"Demo Customer 01", productId:"p1", productName:"Milano Leather Corner Sofa", category:"Sofas", quantity:1, unitPrice:245000, total:245000, status:"Paid" },
  { id:"s2", date:"2026-06-08", customer:"Demo Customer 02", productId:"p3", productName:"Oslo Lounge Armchair", category:"Chairs", quantity:2, unitPrice:52000, total:104000, status:"Paid" },
  { id:"s3", date:"2026-06-15", customer:"Demo Customer 03", productId:"p2", productName:"Nordic Oak Dining Table", category:"Tables", quantity:1, unitPrice:89000, total:89000, status:"Paid" },
  { id:"s4", date:"2026-06-23", customer:"Demo Customer 04", productId:"p4", productName:"Haru Natural Wood Bed", category:"Beds", quantity:1, unitPrice:158000, total:158000, status:"Paid" },
  { id:"s5", date:"2026-07-02", customer:"Demo Customer 05", productId:"p5", productName:"Bergen 4-Door Wardrobe", category:"Cabinets", quantity:1, unitPrice:112000, total:112000, status:"Paid" },
  { id:"s6", date:"2026-07-11", customer:"Demo Customer 06", productId:"p3", productName:"Oslo Lounge Armchair", category:"Chairs", quantity:3, unitPrice:52000, total:156000, status:"Paid" },
  { id:"s7", date:"2026-07-19", customer:"Demo Customer 07", productId:"p6", productName:"Aalto Walnut TV Console", category:"TV units", quantity:1, unitPrice:67000, total:67000, status:"Paid" },
  { id:"s8", date:"2026-08-04", customer:"Demo Customer 08", productId:"p2", productName:"Nordic Oak Dining Table", category:"Tables", quantity:2, unitPrice:89000, total:178000, status:"Paid" },
  { id:"s9", date:"2026-08-12", customer:"Demo Customer 09", productId:"p1", productName:"Milano Leather Corner Sofa", category:"Sofas", quantity:1, unitPrice:245000, total:245000, status:"Paid" },
  { id:"s10", date:"2026-08-21", customer:"Demo Customer 10", productId:"p4", productName:"Haru Natural Wood Bed", category:"Beds", quantity:2, unitPrice:158000, total:316000, status:"Paid" },
];

function read(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

export function getSales() { return read(STORAGE_KEY, seedSales); }
export function getSalesConfig() { return read(CONFIG_KEY, { webhookUrl: "" }); }

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
  if (typeof window !== "undefined") localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
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
