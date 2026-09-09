const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";

let cachedToken = null;
let tokenExpiresAt = 0;

async function shiprocketRequest(path, options = {}) {
  const response = await fetch(`${SHIPROCKET_BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || `Shiprocket returned ${response.status}.`);
  return data;
}

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;
  if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
    throw new Error("Shiprocket credentials are not configured on the server.");
  }
  const data = await shiprocketRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: process.env.SHIPROCKET_EMAIL, password: process.env.SHIPROCKET_PASSWORD }),
  });
  cachedToken = data.token;
  tokenExpiresAt = Date.now() + 23 * 60 * 60 * 1000;
  return cachedToken;
}

async function authenticatedRequest(path, options = {}) {
  const token = await getToken();
  return shiprocketRequest(path, { ...options, headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
}

export default async function handler(request, response) {
  response.setHeader("Content-Type", "application/json");
  if (request.method !== "POST") return response.status(405).json({ ok: false, error: "POST is required." });
  try {
    const data = typeof request.body === "string" ? JSON.parse(request.body) : request.body || {};
    if (data.action === "createOrder") {
      const order = data.order || {};
      const address = order.address || {};
      const result = await authenticatedRequest("/orders/create/adhoc", {
        method: "POST",
        body: JSON.stringify({
          order_id: order.orderId,
          order_date: order.orderDate,
          pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
          billing_customer_name: order.customerName,
          billing_last_name: order.lastName || "",
          billing_address: [address.house, address.street].filter(Boolean).join(", "),
          billing_city: address.city,
          billing_pincode: address.pincode,
          billing_state: address.state,
          billing_country: address.country || "India",
          billing_email: order.email,
          billing_phone: order.phone,
          shipping_is_billing: true,
          order_items: order.items,
          payment_method: order.paymentMethod || "COD",
          sub_total: Number(order.subTotal || 0),
          length: Number(order.length || 10),
          breadth: Number(order.breadth || 10),
          height: Number(order.height || 10),
          weight: Number(order.weight || 1),
        }),
      });
      return response.status(200).json({ ok: true, shipment: result });
    }
    if (data.action === "track") {
      const result = await authenticatedRequest(`/courier/track/awb/${encodeURIComponent(data.awb)}`);
      return response.status(200).json({ ok: true, tracking: result });
    }
    return response.status(400).json({ ok: false, error: "Unknown Shiprocket action." });
  } catch (error) {
    return response.status(500).json({ ok: false, error: error.message || "Shiprocket request failed." });
  }
}
