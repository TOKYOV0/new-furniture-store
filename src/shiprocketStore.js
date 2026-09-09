const API_PATH = "/api/shiprocket";

async function requestShiprocket(payload, fallbackMessage) {
  let response;
  try {
    response = await fetch(API_PATH, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  } catch {
    throw new Error("Could not reach /api/shiprocket. Start local development with npx vercel dev.");
  }
  const raw = await response.text();
  let data;
  try { data = JSON.parse(raw); } catch { throw new Error(`The local API did not return JSON (${response.status}). Start with npx vercel dev.`); }
  if (!response.ok || !data.ok) throw new Error(data.error || `${fallbackMessage} (HTTP ${response.status})`);
  return data;
}

export async function createShiprocketOrder(order) {
  const data = await requestShiprocket({ action: "createOrder", order }, "Shiprocket order creation failed.");
  return data.shipment;
}

export async function trackShiprocketAwb(awb) {
  const data = await requestShiprocket({ action: "track", awb }, "Tracking lookup failed.");
  return data.tracking;
}

export async function getShiprocketOrder(orderId) {
  const data = await requestShiprocket({ action: "orderStatus", orderId }, "Shiprocket order lookup failed.");
  return data.order;
}
