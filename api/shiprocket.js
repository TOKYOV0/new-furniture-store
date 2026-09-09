const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";

let cachedToken = null;
let tokenExpiresAt = 0;

async function shiprocketRequest(path, options = {}) {
  const response = await fetch(`${SHIPROCKET_BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = data.errors ? ` ${JSON.stringify(data.errors)}` : "";
    const message = data.message || data.error || data.error_message || `Shiprocket returned ${response.status}.`;
    const error = new Error(`${message}${details}`);
    error.status = response.status;
    throw error;
  }
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
      const phone = String(order.phone || "").replace(/\D/g, "").slice(-10);
      const pincode = String(address.pincode || "").replace(/\D/g, "").slice(0, 6);
      const items = Array.isArray(order.items) ? order.items.map(item => ({
        name: String(item.name || "Product").slice(0, 100),
        sku: String(item.sku || "SKU").slice(0, 50),
        units: Math.max(1, Number(item.units || 1)),
        selling_price: Number(item.selling_price || 0),
      })) : [];
      if (!phone || phone.length !== 10) throw new Error("Shiprocket requires a valid 10-digit customer phone number.");
      if (!pincode || pincode.length !== 6) throw new Error("Shiprocket requires a valid 6-digit delivery PIN code.");
      if (!items.length || items.some(item => item.selling_price <= 0)) throw new Error("Shiprocket requires at least one item with a price greater than zero.");
      const result = await authenticatedRequest("/orders/create/adhoc", {
        method: "POST",
        body: JSON.stringify({
          order_id: order.orderId,
          order_date: order.orderDate,
          pickup_location: String(process.env.SHIPROCKET_PICKUP_LOCATION || "Primary").trim(),
          billing_customer_name: order.customerName,
          billing_last_name: order.lastName || "",
          billing_address: [address.house, address.street].filter(Boolean).join(", "),
          billing_city: address.city,
          billing_pincode: pincode,
          billing_state: address.state,
          billing_country: address.country || "India",
          billing_email: order.email,
          billing_phone: phone,
          shipping_is_billing: true,
          order_items: items,
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
    if (data.action === "orderStatus") {
      const result = await authenticatedRequest(`/orders/show/${encodeURIComponent(data.orderId)}`);
      return response.status(200).json({ ok: true, order: result });
    }
    return response.status(400).json({ ok: false, error: "Unknown Shiprocket action." });
  } catch (error) {
    return response.status(error.status || 500).json({ ok: false, error: error.message || "Shiprocket request failed." });
  }
}
