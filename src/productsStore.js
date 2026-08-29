import { useEffect, useState } from "react";

/* ---------------------------------------------------------
   SHARED PRODUCT STORE
   Both the admin panel and the public storefront read from
   here, so an edit made in the admin panel appears on the
   main website immediately (and across browser tabs).
--------------------------------------------------------- */

const STORAGE_KEY = "grainhouse_products_v1";
const CONFIG_KEY = "grainhouse_products_config_v1";
const EVENT_NAME = "grainhouse-products-updated";

export function getProductsConfig() {
  if (typeof window === "undefined") return { sheetUrl: "" };
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    return raw ? JSON.parse(raw) : { sheetUrl: "" };
  } catch {
    return { sheetUrl: "" };
  }
}

export function saveProductsConfig(config) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONFIG_KEY, JSON.stringify({ sheetUrl: config?.sheetUrl || "" }));
  } catch {
    // ignore storage failures
  }
}

/** Convert common Google Drive sharing links into browser-friendly image URLs.
 * Direct image URLs are returned unchanged.
 */
export function normalizeImageUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";

  try {
    const parsed = new URL(url);
    if (parsed.hostname === "drive.google.com" || parsed.hostname === "www.drive.google.com") {
      const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
      const id = fileMatch?.[1] || parsed.searchParams.get("id");
      if (id) return `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1600`;
    }
  } catch (e) {
    // Keep non-URL text unchanged so validation can report it normally.
  }
  return url;
}

export const initialProducts = [
  {
    id: "p1",
    name: "Milano Leather Corner Sofa",
    category: "Sofas",
    price: 24500000,
    sold: 42,
    image:
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80",
    description:
      "Genuine leather corner sofa on a solid oak frame, with plush D40 foam cushioning — a refined centerpiece for a modern living room.",
  },
  {
    id: "p2",
    name: "Nordic Oak Dining Table",
    category: "Tables",
    price: 8900000,
    sold: 65,
    image:
      "https://images.unsplash.com/photo-1617104551722-3b2d51366400?w=1200&q=80",
    description:
      "Solid, single-slab oak tabletop with minimalist Scandinavian-style legs, comfortably seating 4 to 6 people.",
  },
  {
    id: "p3",
    name: "Oslo Lounge Armchair",
    category: "Chairs",
    price: 5200000,
    sold: 118,
    image:
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&q=80",
    description:
      "Premium fabric-upholstered armchair with an ergonomic backrest and a soft accent pillow — ideal for a reading nook.",
  },
  {
    id: "p4",
    name: "Haru Natural Wood Bed",
    category: "Beds",
    price: 15800000,
    sold: 29,
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80",
    description:
      "Natural ash-wood bed frame with a padded headboard and a clean, understated silhouette inspired by Japanese design.",
  },
  {
    id: "p5",
    name: "Bergen 4-Door Wardrobe",
    category: "Cabinets",
    price: 11200000,
    sold: 33,
    image:
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80",
    description:
      "Spacious 4-door wardrobe with smooth-gliding rails, finished in an elegant walnut wood grain.",
  },
  {
    id: "p6",
    name: "Aalto Walnut TV Console",
    category: "TV units",
    price: 6700000,
    sold: 57,
    image:
      "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1200&q=80",
    description:
      "TV console with a richly grained walnut top, a handy drawer for accessories, and powder-coated metal legs.",
  },
  {
    id: "p7",
    name: "Luna Accent Side Table",
    category: "Tables",
    price: 349900,
    sold: 18,
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80",
    description: "Compact solid-wood side table with a rounded top, perfect beside a sofa or reading chair.",
  },
  {
    id: "p8",
    name: "Aria 3-Seater Sofa",
    category: "Sofas",
    price: 3299900,
    sold: 24,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80",
    description: "Comfortable three-seater sofa with deep cushions and a clean modern silhouette for everyday living.",
  },
  {
    id: "p9",
    name: "Mira Cane Lounge Chair",
    category: "Chairs",
    price: 1299900,
    sold: 16,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
    description: "Lightweight lounge chair combining a natural wood frame with woven cane detailing.",
  },
  {
    id: "p10",
    name: "Kanso 2-Door Cabinet",
    category: "Cabinets",
    price: 2199900,
    sold: 12,
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80",
    description: "Minimal two-door storage cabinet with generous shelving and a warm walnut-inspired finish.",
  },
  {
    id: "p11",
    name: "Nora Bedside Cabinet",
    category: "Bedroom",
    price: 799900,
    sold: 21,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80",
    description: "Small bedside cabinet with a drawer and open shelf for books, lamps and everyday essentials.",
  },
  {
    id: "p12",
    name: "Atlas Bookshelf",
    category: "Storage",
    price: 1899900,
    sold: 9,
    image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=1200&q=80",
    description: "Tall open bookshelf designed to display books, plants and decorative objects without feeling bulky.",
  },
];

function sanitizeProducts(list) {
  return list.map((p) => ({
    id: String(p.id ?? p.productId ?? p.slug ?? ""),
    name: String(p.name ?? p.productName ?? "Untitled product"),
    category: String(p.category ?? "Uncategorized"),
    price: Number(p.price ?? p.unitPrice ?? 0),
    sold: Number(p.sold ?? 0),
    image: normalizeImageUrl(p.image),
    description: String(p.description ?? ""),
  }));
}

export async function fetchProductsFromSheet(url) {
  if (!url) return getProducts();
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) throw new Error("Could not load products from Google Sheets");
  const data = await res.json();
  const list = Array.isArray(data?.products) ? data.products : Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
  const normalized = sanitizeProducts(list).filter((p) => p.name || p.category || p.image);
  if (!normalized.length) throw new Error("No products found in the Google Sheet response");
  saveProducts(normalized);
  return normalized;
}

function readFromStorage() {
  if (typeof window === "undefined") return sanitizeProducts(initialProducts);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        const existingIds = new Set(parsed.map((p) => p.id));
        const missingDefaults = initialProducts.filter((p) => !existingIds.has(p.id));
        return sanitizeProducts([...parsed, ...missingDefaults]);
      }
    }
  } catch (e) {
    /* fall through to defaults */
  }
  return sanitizeProducts(initialProducts);
}

let products = readFromStorage();
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn(products));
}

export function getProducts() {
  return products;
}

export function saveProducts(next) {
  products = next;
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  } catch (e) {
    /* storage unavailable — keep working in-memory */
  }
  notify();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }
}

export function updateProduct(id, patch) {
  saveProducts(products.map((p) => (p.id === id ? { ...p, ...patch } : p)));
}

export function clearProductsLocal() {
  const next = sanitizeProducts(initialProducts);
  products = next;
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    // ignore storage failures
  }
  notify();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }
  return next;
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      products = readFromStorage();
      notify();
    }
  });
}

/** React hook — re-renders whenever the shared product list changes. */
export function useProducts() {
  const [state, setState] = useState(products);
  useEffect(() => {
    const config = getProductsConfig();
    const refresh = () => setState(products);
    listeners.add(refresh);
    setState(products);

    if (config.sheetUrl) {
      fetchProductsFromSheet(config.sheetUrl)
        .then((next) => setState(next))
        .catch(() => setState(products));
    }

    return () => listeners.delete(refresh);
  }, []);
  return state;
}