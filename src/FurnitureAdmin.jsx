import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import {
  LayoutDashboard,
  Package,
  LogOut,
  TrendingUp,
  Wallet,
  ShoppingBag,
  Pencil,
  Save,
  X,
  ImagePlus,
  CheckCircle2,
  Plus,
  Trash2,
  Lock,
  User,
  Sofa,
  ChevronRight,
  Menu,
  ExternalLink,
  Users,
  MapPin,
} from "lucide-react";
import { useProducts, saveProducts, normalizeImageUrl, getProductsConfig, saveProductsConfig, fetchProductsFromSheet, clearProductsLocal, getMediaConfig, saveMediaConfig } from "./productsStore";
import { useSales, getSalesConfig, saveSalesConfig, clearDemoSales, syncSalesFromSheet } from "./salesStore";
import { fetchUsers, updateUser, deleteUser, getUsersConfig, saveUsersConfig } from "./authStore";

/* ---------------------------------------------------------
   DESIGN TOKENS — "Grain" theme, inspired by walnut, oak
   and raw linen
--------------------------------------------------------- */
const colors = {
  walnut950: "#221609",
  walnut900: "#2B1B0D",
  walnut800: "#3E2814",
  walnut700: "#54371C",
  oak600: "#A66B36",
  oak500: "#C2884E",
  oak300: "#DDB07E",
  linen50: "#FBF6EE",
  linen100: "#F3E9D7",
  linen200: "#E9DAC0",
  ink900: "#241B12",
  ink600: "#6E5D48",
  ink400: "#9C8B74",
  sage600: "#69784F",
  sage100: "#E5EAD9",
  rust600: "#A6482C",
  rust100: "#F3E0D8",
};

const fontVoice = `"Fraunces", "Georgia", serif`;
const fontBody = `"Inter", "Helvetica Neue", sans-serif`;

const monthlyRevenue = [
  { month: "Jan", revenue: 182 },
  { month: "Feb", revenue: 165 },
  { month: "Mar", revenue: 210 },
  { month: "Apr", revenue: 198 },
  { month: "May", revenue: 240 },
  { month: "Jun", revenue: 265 },
  { month: "Jul", revenue: 252 },
  { month: "Aug", revenue: 289 },
];

const currency = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function GrainMark({ size = 120, stroke = colors.oak500, opacity = 1 }) {
  const rings = [0.98, 0.82, 0.64, 0.46, 0.3, 0.16];
  const cx = size / 2;
  const cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ opacity }}>
      {rings.map((r, i) => (
        <circle
          key={i}
          cx={cx + (i % 2 === 0 ? 1 : -1) * 1.5}
          cy={cy}
          r={(size / 2) * r}
          fill="none"
          stroke={stroke}
          strokeWidth={i === rings.length - 1 ? 3 : 1.1}
          opacity={1 - i * 0.09}
        />
      ))}
    </svg>
  );
}

/* ---------------------------------------------------------
   LOGIN PAGE
--------------------------------------------------------- */
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (username.trim() === "admin" && password === "admin123") {
      setError("");
      onLogin();
    } else {
      setError("Incorrect username or password. Please try again.");
    }
  };

  return (
    <div className="login-screen">
      <div style={{ position: "absolute", top: -40, right: -40 }}>
        <GrainMark size={280} stroke={colors.oak600} opacity={0.35} />
      </div>
      <div style={{ position: "absolute", bottom: -60, left: -60 }}>
        <GrainMark size={220} stroke={colors.oak600} opacity={0.25} />
      </div>

      <div className="login-card">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: colors.walnut900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <img src="/logo/shukrwaar logo-4.svg" alt="Shukarwaar logo" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
          </div>
          <div>
            <p style={{ margin: 0, fontFamily: fontVoice, fontSize: 21, fontWeight: 600, color: colors.ink900 }}>
              SHUKARWAAR
            </p>
            <p style={{ margin: 0, fontSize: 11, letterSpacing: 2, color: colors.ink400, textTransform: "uppercase" }}>
              Admin panel
            </p>
          </div>
        </div>

        <p style={{ marginTop: 24, marginBottom: 28, fontSize: 14, color: colors.ink600, lineHeight: 1.6 }}>
          Sign in to manage products and track furniture sales on the main website.
        </p>

        <form onSubmit={submit}>
          <label style={{ display: "block", fontSize: 12, color: colors.ink600, marginBottom: 6 }}>Username</label>
          <div className="input-row">
            <User size={16} color={colors.ink400} />
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
          </div>

          <label style={{ display: "block", fontSize: 12, color: colors.ink600, marginBottom: 6 }}>Password</label>
          <div className="input-row" style={{ marginBottom: 8 }}>
            <Lock size={16} color={colors.ink400} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          {error && <p style={{ color: colors.rust600, fontSize: 12.5, margin: "10px 0 0" }}>{error}</p>}

          <button type="submit" className="btn-primary" style={{ marginTop: 22, width: "100%", justifyContent: "center" }}>
            Sign in <ChevronRight size={15} />
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 11.5, color: colors.ink400, textAlign: "center" }}>
          Demo account: <strong style={{ color: colors.ink600 }}>admin</strong> / password{" "}
          <strong style={{ color: colors.ink600 }}>admin123</strong>
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="stat-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: colors.ink600, textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            background: colors.linen100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={15} color={colors.oak600} />
        </div>
      </div>
      <p style={{ margin: 0, fontFamily: fontVoice, fontSize: 24, fontWeight: 600, color: colors.ink900, wordBreak: "break-word" }}>
        {value}
      </p>
      {sub && <p style={{ margin: "4px 0 0", fontSize: 12, color: colors.sage600 }}>{sub}</p>}
    </div>
  );
}

function Dashboard({ products, sales }) {
  const totalUnits = sales.reduce((s, x) => s + Number(x.quantity || 0), 0);
  const totalRevenue = sales.reduce((s, x) => s + Number(x.total || 0), 0);
  const categorySales = useMemo(() => {
    const map = {};
    sales.forEach(x => { map[x.category] = (map[x.category] || 0) + Number(x.total || 0); });
    return Object.entries(map).map(([category, revenue]) => ({ category, revenue }));
  }, [sales]);
  const monthly = useMemo(() => {
    const map = {};
    sales.forEach(x => { const m = new Date(x.date).toLocaleDateString("en-US", { month:"short" }); map[m] = (map[m] || 0) + Number(x.total || 0); });
    return ["Jun","Jul","Aug"].map(month => ({ month, revenue: map[month] || 0 }));
  }, [sales]);
  const bestSeller = useMemo(() => {
    const map = {};
    sales.forEach(x => { map[x.productName] = (map[x.productName] || 0) + Number(x.quantity || 0); });
    return Object.entries(map).sort((a,b) => b[1]-a[1])[0] || ["—", 0];
  }, [sales]);
  const [config, setConfig] = useState(getSalesConfig());
  const [saved, setSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [productsConfig, setProductsConfig] = useState(getProductsConfig());
  const [productsSaved, setProductsSaved] = useState(false);
  const [productsSyncing, setProductsSyncing] = useState(false);
  const [productsSyncMessage, setProductsSyncMessage] = useState("");
  const saveConfig = async () => { saveSalesConfig(config); setSaved(true); setTimeout(() => setSaved(false), 2200); if (config.webhookUrl) { setSyncing(true); try { await syncSalesFromSheet(); setSyncMessage("Connected — sales loaded from Google Sheets."); } catch { setSyncMessage("Saved, but the Sheet could not be reached. Check the deployment URL."); } finally { setSyncing(false); } } };
  const saveProductConfig = async () => {
    saveProductsConfig(productsConfig);
    setProductsSaved(true);
    setTimeout(() => setProductsSaved(false), 2200);
    if (productsConfig.sheetUrl) {
      setProductsSyncing(true);
      try {
        const next = await fetchProductsFromSheet(productsConfig.sheetUrl);
        setProductsSyncMessage(`Connected — ${next.length} products loaded from Google Sheets.`);
      } catch {
        setProductsSyncMessage("Saved, but the product feed could not be reached. Check the Apps Script URL.");
      } finally {
        setProductsSyncing(false);
      }
    }
  };
  const clearProductsFeed = () => {
    if (window.confirm("Clear the locally loaded product feed from this browser?")) {
      clearProductsLocal();
      setProductsSyncMessage("Local product feed cleared.");
    }
  };

  return <div>
    <h1 style={{ fontFamily: fontVoice, fontSize:24, fontWeight:600, color:colors.ink900, margin:"0 0 4px" }}>Sales overview</h1>
    <p style={{ fontSize:13.5, color:colors.ink600, margin:"0 0 24px" }}>Live dashboard from recorded website sales. The included numbers are rough demo data.</p>
    <div className="stat-grid">
      <StatCard icon={ShoppingBag} label="Units sold" value={totalUnits.toLocaleString("en-IN")} sub={`${sales.length} sales recorded`} />
      <StatCard icon={Wallet} label="Total revenue" value={currency(totalRevenue)} sub="From recorded sales" />
      <StatCard icon={TrendingUp} label="Best seller" value={bestSeller[0]} sub={`${bestSeller[1]} units`} />
      <StatCard icon={Package} label="Products live" value={products.length} sub="Currently shown on the homepage" />
    </div>
    <div className="chart-grid">
      <div className="chart-card"><p className="chart-title">Revenue by month</p><ResponsiveContainer width="100%" height={240}><LineChart data={monthly}><CartesianGrid vertical={false} stroke={colors.linen200}/><XAxis dataKey="month" tick={{fontSize:11,fill:colors.ink600}} axisLine={{stroke:colors.linen200}} tickLine={false}/><YAxis tick={{fontSize:11,fill:colors.ink600}} axisLine={false} tickLine={false}/><Tooltip formatter={v => [currency(v),"Revenue"]}/><Line type="monotone" dataKey="revenue" stroke={colors.sage600} strokeWidth={2.4} dot={{r:3}}/></LineChart></ResponsiveContainer></div>
      <div className="chart-card"><p className="chart-title">Revenue by category</p><ResponsiveContainer width="100%" height={240}><BarChart data={categorySales} margin={{left:-18}}><CartesianGrid vertical={false} stroke={colors.linen200}/><XAxis dataKey="category" tick={{fontSize:10,fill:colors.ink600}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11,fill:colors.ink600}} axisLine={false} tickLine={false}/><Tooltip formatter={v => [currency(v),"Revenue"]}/><Bar dataKey="revenue" fill={colors.oak500} radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></div>
    </div>
    <div className="chart-card" style={{marginTop:18}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}><div><p className="chart-title" style={{marginBottom:5}}>Google Sheets connection</p><p style={{fontSize:12.5,color:colors.ink600,margin:0}}>Paste your deployed Google Apps Script web-app URL. Every new website sale will be sent to the spreadsheet.</p></div>{saved && <span style={{fontSize:12,color:colors.sage600}}>Saved</span>}</div>
      <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}><input className="text-input" style={{flex:1,minWidth:260}} placeholder="https://script.google.com/macros/s/.../exec" value={config.webhookUrl} onChange={e=>setConfig({...config,webhookUrl:e.target.value})}/><button className="btn-primary" onClick={saveConfig}><Save size={13}/> Save & sync</button><button className="btn-outline" disabled={syncing} onClick={async()=>{setSyncing(true);try{await syncSalesFromSheet();setSyncMessage("Synced from Google Sheets.")}catch{setSyncMessage("Sync failed — check the Web App URL and access setting.")}finally{setSyncing(false)}}}>{syncing ? "Syncing…" : "Sync now"}</button><button className="btn-outline" onClick={()=>{if(confirm("Clear the rough demo sales from this browser?")){clearDemoSales();}}}>Clear local demo</button></div>{syncMessage && <p style={{fontSize:12,color:colors.sage600,margin:"10px 0 0"}}>{syncMessage}</p>}
    </div>

    <div className="chart-card" style={{marginTop:18}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}><div><p className="chart-title" style={{marginBottom:5}}>Products feed URL</p><p style={{fontSize:12.5,color:colors.ink600,margin:0}}>Use your Apps Script URL here to load categories, listing price, descriptions, and product images from a Google Sheet.</p></div>{productsSaved && <span style={{fontSize:12,color:colors.sage600}}>Saved</span>}</div>
      <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}><input className="text-input" style={{flex:1,minWidth:260}} placeholder="https://script.google.com/macros/s/.../exec?type=products" value={productsConfig.sheetUrl} onChange={e=>setProductsConfig({sheetUrl:e.target.value})}/><button className="btn-primary" onClick={saveProductConfig} disabled={productsSyncing}><Save size={13}/> Save & sync</button><button className="btn-outline" disabled={productsSyncing} onClick={async()=>{setProductsSyncing(true); try { const next = await fetchProductsFromSheet(productsConfig.sheetUrl); setProductsSyncMessage(`Synced — ${next.length} products loaded from Google Sheets.`); } catch { setProductsSyncMessage("Sync failed — check the Apps Script URL and access setting."); } finally { setProductsSyncing(false); }}}>{productsSyncing ? "Syncing…" : "Sync now"}</button><button className="btn-outline" onClick={clearProductsFeed}>Clear local feed</button></div>{productsSyncMessage && <p style={{fontSize:12,color:colors.sage600,margin:"10px 0 0"}}>{productsSyncMessage}</p>}
    </div>
  </div>;
}

function ProductsPage({ products }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: "", price: "", image: "", description: "" });
  const [toast, setToast] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", category: "Sofas", price: "", image: "", description: "" });

  const startEdit = (p) => {
    setEditingId(p.id);
    setDraft({ name: p.name, price: p.price, image: p.image, description: p.description });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ name: "", price: "", image: "", description: "" });
  };

  const saveEdit = (id) => {
    saveProducts(products.map((p) => (p.id === id ? { ...p, name: draft.name.trim() || p.name, price: Math.max(0, Number(draft.price) || 0), image: normalizeImageUrl(draft.image.trim()) || p.image, description: draft.description } : p)));
    setEditingId(null);
    setToast("Updated on the homepage.");
    window.clearTimeout(saveEdit._t);
    saveEdit._t = window.setTimeout(() => setToast(""), 2600);
  };

  const addProduct = () => {
    if (!newProduct.name.trim() || !newProduct.price || !newProduct.image.trim()) return;
    const product = { id: `p-${Date.now()}`, name: newProduct.name.trim(), category: newProduct.category.trim() || "Other", price: Number(newProduct.price), sold: 0, image: normalizeImageUrl(newProduct.image.trim()), description: newProduct.description.trim() || "Beautiful furniture piece made for everyday living." };
    saveProducts([...products, product]);
    setNewProduct({ name: "", category: "Sofas", price: "", image: "", description: "" });
    setShowAdd(false);
    setToast("Furniture added and published.");
    window.setTimeout(() => setToast(""), 2600);
  };

  const removeProduct = (id) => {
    if (window.confirm("Remove this furniture from the website?")) { saveProducts(products.filter(p => p.id !== id)); setToast("Furniture removed."); }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 style={{ fontFamily: fontVoice, fontSize: 24, fontWeight: 600, color: colors.ink900, margin: "0 0 4px" }}>
            Manage products
          </h1>
          <p style={{ fontSize: 13.5, color: colors.ink600, margin: 0 }}>
            Add furniture and edit the name, INR price, image and description. Changes appear on the homepage instantly.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(v => !v)}><Plus size={14}/> Add furniture</button>
        {toast && (
          <div className="toast">
            <CheckCircle2 size={16} /> {toast}
          </div>
        )}
      </div>


      {showAdd && <div className="add-product-panel">
        <h3>Add new furniture</h3>
        <div className="form-grid">
          <input className="text-input" placeholder="Furniture name" value={newProduct.name} onChange={e => setNewProduct(d => ({...d,name:e.target.value}))}/>
          <input className="text-input" placeholder="Category" value={newProduct.category} onChange={e => setNewProduct(d => ({...d,category:e.target.value}))}/>
          <input className="text-input" type="number" min="0" placeholder="Price in INR" value={newProduct.price} onChange={e => setNewProduct(d => ({...d,price:e.target.value}))}/>
          <input className="text-input" placeholder="Google Drive link or image URL" value={newProduct.image} onChange={e => setNewProduct(d => ({...d,image:e.target.value}))}/>
          <p style={{ gridColumn: "1 / -1", margin: "-2px 0 0", fontSize: 11.5, color: colors.ink600 }}>Google Drive: set the image to <b>Anyone with the link → Viewer</b>, then paste the normal sharing link. The site converts it automatically.</p>
          <textarea className="text-input" rows="3" placeholder="Description" value={newProduct.description} onChange={e => setNewProduct(d => ({...d,description:e.target.value}))}/>
        </div>
        <div style={{display:"flex",gap:8,marginTop:12}}><button className="btn-primary" onClick={addProduct}>Save & publish</button><button className="btn-outline" onClick={() => setShowAdd(false)}>Cancel</button></div>
      </div>}

      <div className="product-grid">
        {products.map((p) => {
          const isEditing = editingId === p.id;
          return (
            <div key={p.id} className="product-card">
              <div style={{ width: "100%", height: 170, background: colors.linen100, overflow: "hidden" }}>
                <img
                  src={isEditing ? draft.image || p.image : p.image}
                  alt={p.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={(e) => {
                    e.currentTarget.style.opacity = 0.3;
                  }}
                />
              </div>

              <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <p style={{ margin: 0, fontFamily: fontVoice, fontSize: 15.5, fontWeight: 600, color: colors.ink900 }}>{p.name}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 11.5, color: colors.oak600, textTransform: "uppercase", letterSpacing: 0.6 }}>
                      {p.category} · {p.sold} sold
                    </p>
                  </div>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: colors.ink900, whiteSpace: "nowrap" }}>
                    {currency(p.price)}
                  </p>
                </div>

                {!isEditing ? (
                  <>
                    <p style={{ fontSize: 12.5, color: colors.ink600, lineHeight: 1.6, margin: "10px 0 14px", flex: 1 }}>
                      {p.description}
                    </p>
                    <button onClick={() => startEdit(p)} className="btn-outline" style={{ alignSelf: "flex-start" }}>
                      <Pencil size={13} /> Edit
                    </button>
                  </>
                ) : (
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11.5, color: colors.ink600, marginBottom: 5 }}>Furniture name</label>
                      <input className="text-input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11.5, color: colors.ink600, marginBottom: 5 }}>Price (INR)</label>
                      <input className="text-input" type="number" min="0" value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: colors.ink600, marginBottom: 5 }}>
                        <ImagePlus size={13} /> Image URL
                      </label>
                      <p style={{ margin: "-2px 0 6px", fontSize: 11.5, color: colors.ink600 }}>Google Drive sharing links are supported and converted automatically.</p>
                      <input
                        className="text-input"
                        value={draft.image}
                        onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))}
                        placeholder="Google Drive link or direct image URL"
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11.5, color: colors.ink600, marginBottom: 5 }}>Description</label>
                      <textarea
                        className="text-input"
                        value={draft.description}
                        onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                        rows={3}
                        style={{ resize: "vertical" }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                      <button onClick={() => saveEdit(p.id)} className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                        <Save size={13} /> Save &amp; publish
                      </button>
                      <button onClick={cancelEdit} className="btn-outline"><X size={13} /></button>
                      <button onClick={() => removeProduct(p.id)} className="btn-outline" title="Remove furniture"><Trash2 size={13} /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [config, setConfig] = useState(getUsersConfig());
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sync = async () => {
    setLoading(true);
    try { setUsers(await fetchUsers()); setMessage("Users synced from Google Sheets."); }
    catch (error) { setMessage(error.message); }
    finally { setLoading(false); }
  };
  const saveConfigAndSync = async () => { saveUsersConfig(config); await sync(); };
  const editUser = async (user, field, value) => {
    try { const next = await updateUser({ id: user.id, [field]: value }); setUsers(current => current.map(item => item.id === next.id ? next : item)); setMessage("User updated."); }
    catch (error) { setMessage(error.message); }
  };
  const changePassword = async (user) => {
    const password = window.prompt(`New password for ${user.email}`);
    if (!password) return;
    await editUser(user, "password", password);
  };
  const removeUser = async (user) => {
    if (!window.confirm(`Delete ${user.email}?`)) return;
    try { await deleteUser(user.id); setUsers(current => current.filter(item => item.id !== user.id)); setMessage("User deleted."); }
    catch (error) { setMessage(error.message); }
  };

  React.useEffect(() => {
    sync();
  }, []);

  return <div>
    <div className="page-head"><div><h1 style={{fontFamily:fontVoice,fontSize:24,fontWeight:600,color:colors.ink900,margin:"0 0 4px"}}>User login data</h1><p style={{fontSize:13.5,color:colors.ink600,margin:0}}>Manage customer accounts created at checkout.</p></div><button className="btn-outline" disabled={loading} onClick={sync}>{loading ? "Syncing..." : "Sync users"}</button></div>
    <div className="chart-card" style={{marginBottom:18}}><p className="chart-title">Users Google Sheets URL</p><p style={{fontSize:12.5,color:colors.ink600,margin:"0 0 12px"}}>Use the same deployed Apps Script URL configured for user registration and checkout login.</p><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><input className="text-input" style={{flex:1,minWidth:260}} placeholder="https://script.google.com/macros/s/.../exec" value={config.webhookUrl} onChange={event => setConfig({webhookUrl:event.target.value})}/><button className="btn-primary" onClick={saveConfigAndSync}><Save size={13}/> Save & sync</button></div>{message && <p style={{fontSize:12,color:message.includes("failed") || message.includes("configured") ? colors.rust600 : colors.sage600,margin:"10px 0 0"}}>{message}</p>}</div>
    <div className="chart-card" style={{padding:0,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}><thead><tr style={{textAlign:"left",color:colors.ink600,background:colors.linen100}}>{["Name","Email","Phone","Addresses","Provider","Status","Created","Actions"].map(label => <th key={label} style={{padding:"12px 14px",fontWeight:600,whiteSpace:"nowrap"}}>{label}</th>)}</tr></thead><tbody>{users.length ? users.map(user => <tr key={user.id} style={{borderTop:`1px solid ${colors.linen200}`}}><td style={{padding:"12px 14px",minWidth:140}}>{user.name}</td><td style={{padding:"12px 14px"}}>{user.email || "-"}</td><td style={{padding:"12px 14px",whiteSpace:"nowrap"}}>{user.phone || "-"}</td><td style={{padding:"12px 14px",minWidth:220,maxWidth:320,whiteSpace:"pre-wrap"}}>{(user.addresses?.length ? user.addresses.map(item => `${item.label}: ${item.value}`).join("\n") : user.address) || "No address saved"}</td><td style={{padding:"12px 14px"}}>{user.provider}</td><td style={{padding:"12px 14px"}}><select className="text-input" value={user.status} onChange={event => editUser(user,"status",event.target.value)}><option value="active">Active</option><option value="blocked">Blocked</option></select></td><td style={{padding:"12px 14px",whiteSpace:"nowrap"}}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</td><td style={{padding:"12px 14px",whiteSpace:"nowrap"}}><button className="btn-outline" onClick={() => changePassword(user)} style={{marginRight:6}}><Lock size={13}/> Password</button><button className="btn-outline" onClick={() => removeUser(user)} style={{color:colors.rust600}}><Trash2 size={13}/> Delete</button></td></tr>) : <tr><td colSpan="8" style={{padding:24,textAlign:"center",color:colors.ink600}}>Save the Apps Script URL and sync to load users.</td></tr>}</tbody></table></div>
  </div>;
}

function AddressPage() {
  const [users, setUsers] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sync = async () => {
    setLoading(true);
    try {
      const nextUsers = await fetchUsers();
      setUsers(nextUsers);
      setDrafts(Object.fromEntries(nextUsers.map(user => {
        const addresses = user.addresses?.length ? user.addresses : (user.address ? [{ label: "Home", value: user.address }] : [{ label: "Home", value: "" }]);
        return [user.id, addresses];
      })));
      setMessage("Addresses loaded from Google Sheets.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    sync();
  }, []);

  const saveAddress = async (user) => {
    try {
      const next = await updateUser({ id: user.id, addresses: drafts[user.id] || [] });
      setUsers(current => current.map(item => item.id === next.id ? next : item));
      setDrafts(current => ({ ...current, [user.id]: next.addresses?.length ? next.addresses : [{label:"Home", value:next.address || ""}] }));
      setMessage(`Address saved for ${next.name}.`);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return <div>
    <div className="page-head"><div><h1 style={{fontFamily:fontVoice,fontSize:24,fontWeight:600,color:colors.ink900,margin:"0 0 4px"}}>Customer addresses</h1><p style={{fontSize:13.5,color:colors.ink600,margin:0}}>Edit delivery addresses and save them directly to Google Sheets.</p></div><button className="btn-outline" disabled={loading} onClick={sync}>{loading ? "Loading..." : "Refresh addresses"}</button></div>
    {message && <p style={{fontSize:12,color:message.includes("failed") || message.includes("configured") ? colors.rust600 : colors.sage600,margin:"0 0 14px"}}>{message}</p>}
    <div style={{display:"grid",gap:14}}>{users.length ? users.map(user => <div className="chart-card" key={user.id} style={{margin:0}}><div style={{display:"grid",gridTemplateColumns:"minmax(180px,.7fr) minmax(260px,1.3fr) auto",gap:14,alignItems:"start"}}><div><p className="chart-title" style={{marginBottom:5}}>{user.name}</p><p style={{fontSize:12,color:colors.ink600,margin:0}}>{user.email || "No email"} · {user.phone || "No phone"}</p></div><div className="admin-address-list">{(drafts[user.id] || []).map((item,index) => <div className="admin-address-row" key={index}><input className="text-input" value={item.label} onChange={event => setDrafts(current => ({...current,[user.id]:current[user.id].map((entry,entryIndex)=>entryIndex === index ? {...entry,label:event.target.value} : entry)}))} placeholder="Label" /><textarea className="text-input" rows="2" value={item.value} onChange={event => setDrafts(current => ({...current,[user.id]:current[user.id].map((entry,entryIndex)=>entryIndex === index ? {...entry,value:event.target.value} : entry)}))} placeholder="Address" />{(drafts[user.id] || []).length > 1 && <button className="address-remove" onClick={() => setDrafts(current => ({...current,[user.id]:current[user.id].filter((_,entryIndex)=>entryIndex !== index)}))}>Remove</button>}</div>)}<button className="address-add" onClick={() => setDrafts(current => ({...current,[user.id]:[...(current[user.id] || []),{label:`Address ${(current[user.id] || []).length + 1}`,value:""}]}))}>+ Add address</button></div><button className="btn-primary" onClick={() => saveAddress(user)}><Save size={13}/> Save</button></div></div>) : <div className="chart-card"><p style={{margin:0,color:colors.ink600}}>No users found. Configure the Users Apps Script URL in the Users section.</p></div>}</div>
  </div>;
}

function MediaPage({ products }) {
  const [mediaConfig, setMediaConfig] = useState(getMediaConfig());
  const [saved, setSaved] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const categories = Array.from(new Set(products.map(p => p.category)));

  const saveMediaSettings = () => {
    saveMediaConfig(mediaConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2600);
  };

  const uploadHeroImage = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
      });
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return data.secure_url || data.url || "";
  };

  const updateHeroMedia = (url, type) => {
    setMediaConfig({ ...mediaConfig, heroMedia: url, heroMediaType: type });
  };

  const handleHeroImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    try {
      const uploadedUrl = await uploadHeroImage(file);
      setMediaConfig({ ...mediaConfig, heroMedia: uploadedUrl, heroMediaType: "image" });
      saveMediaConfig({ ...mediaConfig, heroMedia: uploadedUrl, heroMediaType: "image" });
    } catch {
      setMediaConfig({ ...mediaConfig, heroMedia: "", heroMediaType: "image" });
    } finally {
      setUploadingHero(false);
      event.target.value = "";
    }
  };

  const updateFeaturedImage = (category, url, type) => {
    setMediaConfig({
      ...mediaConfig,
      featuredImages: { ...mediaConfig.featuredImages, [category]: url },
      featuredMediaTypes: { ...mediaConfig.featuredMediaTypes, [category]: type }
    });
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 style={{ fontFamily: fontVoice, fontSize: 24, fontWeight: 600, color: colors.ink900, margin: "0 0 4px" }}>
            Media Management
          </h1>
          <p style={{ fontSize: 13.5, color: colors.ink600, margin: 0 }}>
            Manage hero section media and featured category images/videos.
          </p>
        </div>
        <button className="btn-primary" onClick={saveMediaSettings}><Save size={14}/> Save media</button>
        {saved && (
          <div className="toast">
            <CheckCircle2 size={16} /> Saved
          </div>
        )}
      </div>

      <div className="chart-card" style={{marginBottom:18}}>
        <p className="chart-title">Hero Section Image</p>
        <p style={{fontSize:12.5,color:colors.ink600,margin:"0 0 14px"}}>Upload the homepage hero image. This is image-only and not URL-based.</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12,alignItems:"center"}}>
          <input
            type="file"
            accept="image/*"
            onChange={handleHeroImageUpload}
            className="text-input"
            style={{flex:1,minWidth:260,padding:"10px 12px"}}
          />
          {uploadingHero && (
            <span style={{fontSize:12.5,color:colors.ink600}}>Uploading...</span>
          )}
        </div>
        {mediaConfig.heroMedia && (
          <div style={{width:"100%",height:"240px",background:colors.linen200,borderRadius:"4px",overflow:"hidden",marginBottom:12}}>
            <img src={mediaConfig.heroMedia} alt="Hero preview" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={(e) => e.currentTarget.style.opacity = 0.3}/>
          </div>
        )}
      </div>

      <div className="chart-card">
        <p className="chart-title">Featured Category Images</p>
        <p style={{fontSize:12.5,color:colors.ink600,margin:"0 0 14px"}}>Upload an image or video URL for each category's featured section.</p>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {categories.map(category => (
            <div key={category} style={{borderBottom:`1px solid ${colors.linen200}`,paddingBottom:14}}>
              <label style={{display:"block",fontSize:12.5,fontWeight:600,color:colors.ink900,marginBottom:6}}>{category}</label>
              <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
                <input 
                  className="text-input" 
                  placeholder="URL (image or video)" 
                  value={mediaConfig.featuredImages[category] || ""}
                  onChange={e => updateFeaturedImage(category, e.target.value, mediaConfig.featuredMediaTypes[category] || "image")}
                  style={{flex:"1 1 260px",minWidth:260}}
                />
                <select 
                  className="text-input"
                  value={mediaConfig.featuredMediaTypes[category] || "image"}
                  onChange={e => updateFeaturedImage(category, mediaConfig.featuredImages[category] || "", e.target.value)}
                  style={{minWidth:120,flexShrink:0}}
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              {mediaConfig.featuredImages[category] && (
                <div style={{width:"100%",height:"160px",background:colors.linen200,borderRadius:"4px",overflow:"hidden",marginTop:8}}>
                  {(mediaConfig.featuredMediaTypes[category] || "image") === "video" ? (
                    <video src={mediaConfig.featuredImages[category]} style={{width:"100%",height:"100%",objectFit:"cover"}} controls />
                  ) : (
                    <img src={mediaConfig.featuredImages[category]} alt={`${category} featured`} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={(e) => e.currentTarget.style.opacity = 0.3}/>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ page, setPage, onLogout, onViewSite, navOpen, setNavOpen }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "media", label: "Media", icon: ImagePlus },
    { id: "users", label: "Users", icon: Users },
    { id: "addresses", label: "Addresses", icon: MapPin },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              background: colors.walnut800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <img src="/logo/shukrwaar logo-4.svg" alt="Shukarwaar logo" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
          </div>
          <div>
            <p style={{ margin: 0, fontFamily: fontVoice, fontSize: 16, fontWeight: 600, color: colors.linen50 }}>SHUKARWAAR</p>
            <p style={{ margin: 0, fontSize: 10, letterSpacing: 1.5, color: colors.oak300, textTransform: "uppercase" }}>Admin</p>
          </div>
        </div>
        <button className="hamburger-btn" onClick={() => setNavOpen((v) => !v)} aria-label="Toggle menu">
          <Menu size={20} color={colors.linen50} />
        </button>
      </div>

      <div className={`nav-list ${navOpen ? "open" : ""}`}>
        {items.map((it) => {
          const active = page === it.id;
          const Icon = it.icon;
          return (
            <button
              key={it.id}
              onClick={() => {
                setPage(it.id);
                setNavOpen(false);
              }}
              className="nav-item"
              style={{
                background: active ? colors.walnut800 : "transparent",
                color: active ? colors.linen50 : colors.oak300,
                fontWeight: active ? 600 : 500,
              }}
            >
              <Icon size={16} />
              {it.label}
            </button>
          );
        })}

        <button onClick={onViewSite} className="nav-item" style={{ background: "transparent", color: colors.oak300, fontWeight: 500 }}>
          <ExternalLink size={16} /> View site
        </button>

        <div className="sidebar-footer">
          <button onClick={onLogout} className="nav-item" style={{ background: "transparent", color: colors.rust600, fontWeight: 500 }}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FurnitureAdminApp({ onNavigateHome }) {
  const [loggedIn, setLoggedIn] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("grainhouse_admin_logged_in") === "true";
  });
  const [page, setPage] = useState(() => {
    if (typeof window === "undefined") return "dashboard";
    return window.localStorage.getItem("grainhouse_admin_page") || "dashboard";
  });
  const [navOpen, setNavOpen] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("grainhouse_admin_page", page);
    }
  }, [page]);
  const products = useProducts();
  const sales = useSales();

  const handleLogin = () => {
    setLoggedIn(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("grainhouse_admin_logged_in", "true");
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("grainhouse_admin_logged_in");
      window.localStorage.removeItem("grainhouse_admin_page");
    }
  };

  return (
    <div style={{ fontFamily: fontBody }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        button { font-family: inherit; cursor: pointer; }
        input, textarea { font-family: inherit; }

        .login-screen {
          min-height: 100vh; width: 100%; display: flex; align-items: center; justify-content: center;
          background: ${colors.walnut950}; font-family: ${fontBody}; position: relative; overflow: hidden; padding: 24px;
        }
        .login-card {
          width: 100%; max-width: 400px; background: ${colors.linen50}; border-radius: 4px;
          padding: 44px 40px; position: relative; z-index: 1; box-shadow: 0 30px 60px rgba(0,0,0,0.35);
        }
        @media (max-width: 480px) { .login-card { padding: 32px 24px; } }

        .input-row {
          display: flex; align-items: center; gap: 10px; border: 1px solid ${colors.linen200};
          border-radius: 3px; padding: 11px 14px; margin-bottom: 18px; background: #fff;
        }
        .input-row input {
          border: none; outline: none; font-size: 14px; width: 100%; color: ${colors.ink900}; background: transparent;
        }
        .input-row:focus-within { border-color: ${colors.oak500}; }

        .btn-primary {
          display: flex; align-items: center; gap: 8px; background: ${colors.walnut900}; color: ${colors.linen50};
          border: none; border-radius: 3px; padding: 12px 18px; font-size: 13.5px; font-weight: 600; letter-spacing: 0.3px;
        }
        .btn-outline {
          display: flex; align-items: center; gap: 6px; background: transparent; border: 1px solid ${colors.linen200};
          color: ${colors.walnut900}; border-radius: 3px; padding: 8px 14px; font-size: 12.5px; font-weight: 500;
        }
        .text-input {
          width: 100%; font-size: 12.5px; padding: 8px 10px; border: 1px solid ${colors.linen200};
          border-radius: 3px; outline: none; color: ${colors.ink900};
        }
        .text-input:focus { border-color: ${colors.oak500}; }

        .app-shell { display: flex; min-height: 100vh; background: ${colors.linen100}; }

        .sidebar { width: 230px; flex-shrink: 0; background: ${colors.walnut950}; min-height: 100vh; padding: 22px 16px; box-sizing: border-box; }
        .sidebar-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; padding: 0 8px; }
        .hamburger-btn { display: none; background: none; border: none; padding: 4px; }
        .nav-list { display: flex; flex-direction: column; gap: 3px; }
        .nav-item {
          display: flex; align-items: center; gap: 11px; padding: 10px 12px; border-radius: 3px; border: none;
          font-size: 13.5px; text-align: left; width: 100%;
        }
        .sidebar-footer { margin-top: auto; padding-top: 18px; border-top: 1px solid ${colors.walnut800}; }

        .main-content { flex: 1; padding: 30px 34px; min-width: 0; }

        .stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; margin-bottom: 26px; }
        .stat-card { background: ${colors.linen50}; border: 1px solid ${colors.linen200}; border-radius: 4px; padding: 18px 20px; min-width: 0; }

        .chart-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px; }
        .chart-card { background: ${colors.linen50}; border: 1px solid ${colors.linen200}; border-radius: 4px; padding: 18px 18px 6px; min-width: 0; }
        .chart-title { font-family: ${fontVoice}; font-size: 15px; font-weight: 600; color: ${colors.ink900}; margin: 0 0 12px; }

        .page-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
        .toast { display: flex; align-items: center; gap: 8px; background: ${colors.sage100}; color: ${colors.sage600}; padding: 9px 14px; border-radius: 3px; font-size: 13px; font-weight: 500; }

        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .product-card { background: ${colors.linen50}; border: 1px solid ${colors.linen200}; border-radius: 4px; overflow: hidden; display: flex; flex-direction: column; transition: box-shadow .15s ease, transform .15s ease; }
        .product-card:hover { box-shadow: 0 10px 24px rgba(34,22,9,0.1); transform: translateY(-2px); }
        .add-product-panel { background: ${colors.linen50}; border: 1px solid ${colors.linen200}; border-radius: 4px; padding: 18px; margin-bottom: 18px; }
        .add-product-panel h3 { margin: 0 0 14px; font-family: ${fontVoice}; color: ${colors.ink900}; }
        .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .form-grid textarea { grid-column: 1 / -1; }
        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } .form-grid textarea { grid-column: auto; } }


        @media (max-width: 900px) {
          .stat-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
          .chart-grid { grid-template-columns: minmax(0,1fr); }
          .main-content { padding: 26px 22px; }
        }

        @media (max-width: 768px) {
          .app-shell { flex-direction: column; }
          .sidebar { width: 100%; min-height: auto; position: relative; z-index: 40; }
          .sidebar-top { margin-bottom: 0; }
          .hamburger-btn { display: flex; align-items: center; justify-content: center; }
          .nav-list {
            display: none; position: absolute; top: 62px; left: 0; right: 0; background: ${colors.walnut950};
            padding: 8px 16px 16px; box-shadow: 0 12px 24px rgba(0,0,0,0.25);
          }
          .nav-list.open { display: flex; }
          .sidebar-footer { margin-top: 8px; padding-top: 8px; }
        }

        @media (max-width: 520px) {
          .stat-grid { grid-template-columns: minmax(0,1fr); }
          .main-content { padding: 20px 16px; }
        }
      `}</style>

      {!loggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <div className="app-shell">
          <Sidebar
            page={page}
            setPage={setPage}
            onLogout={handleLogout}
            onViewSite={() => onNavigateHome && onNavigateHome()}
            navOpen={navOpen}
            setNavOpen={setNavOpen}
          />
          <div className="main-content">
            {page === "dashboard" && <Dashboard products={products} sales={sales} />}
            {page === "products" && <ProductsPage products={products} />}
            {page === "media" && <MediaPage products={products} />}
            {page === "users" && <UsersPage />}
            {page === "addresses" && <AddressPage />}
          </div>
        </div>
      )}
    </div>
  );
}
