import React, { useMemo, useState } from "react";
import { Menu, X, Sofa, ArrowRight, Search, ShoppingCart, Plus, Minus, Trash2, LogIn } from "lucide-react";
import { useProducts, getMediaConfig } from "./productsStore";
import { recordSale } from "./salesStore";
import { getUserSession, useUserSession, loginUser, registerUser, loginWithGoogle, updateUser, logoutUser } from "./authStore";

const colors = {
  walnut950: "#221609", walnut900: "#2B1B0D", walnut800: "#3E2814", oak600: "#A66B36", oak500: "#C2884E", oak300: "#DDB07E",
  linen50: "#FBF6EE", linen100: "#F3E9D7", linen200: "#E9DAC0", ink900: "#241B12", ink600: "#6E5D48", ink400: "#9C8B74", sage600: "#69784F"
};
const fontVoice = `"Fraunces", "Georgia", serif`;
const fontBody = `"Inter", "Helvetica Neue", sans-serif`;
const currency = (n) => Number(n || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80";

function ProductImage({ src, alt, className = "", style = {} }) {
  const [currentSrc, setCurrentSrc] = useState(src || FALLBACK_IMAGE);

  React.useEffect(() => {
    setCurrentSrc(src || FALLBACK_IMAGE);
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      decoding="async"
      onError={(event) => {
        if (event.currentTarget.src !== FALLBACK_IMAGE) {
          event.currentTarget.src = FALLBACK_IMAGE;
        }
      }}
    />
  );
}

function GrainMark({ size = 120, stroke = colors.oak500, opacity = 1 }) {
  const rings = [0.98, 0.82, 0.64, 0.46, 0.3, 0.16], cx = size / 2, cy = size / 2;
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ opacity }}>{rings.map((r, i) => <circle key={i} cx={cx + (i % 2 === 0 ? 1 : -1) * 1.5} cy={cy} r={(size / 2) * r} fill="none" stroke={stroke} strokeWidth={i === rings.length - 1 ? 3 : 1.1} opacity={1 - i * 0.09} />)}</svg>;
}

function Header({ onNavigateAdmin, navOpen, setNavOpen, search, setSearch, cartCount, onCart, onLogin, onAccount, user, products, onProductClick }) {
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const normalizedSearch = (search || "").trim().toLowerCase();
  const searchResults = normalizedSearch ? products.filter(p => 
    p.name.toLowerCase().includes(normalizedSearch) || 
    p.category.toLowerCase().includes(normalizedSearch) ||
    p.description.toLowerCase().includes(normalizedSearch)
  ).slice(0, 8) : [];

  return <header className="site-header"><div className="site-header-inner">
    <a href="#top" className="brand" onClick={() => setNavOpen(false)}><div className="brand-mark"><img src="/logo/shukrwaar logo-4.svg" alt="Shukarwaar logo" /></div><span>SHUKARWAAR</span></a>
    <div className="header-actions">
      <div className="header-search-desktop" style={{position:"relative"}}>
        <div className="search-box" style={{position:"relative"}}><Search size={15} /><input aria-label="Search furniture" value={search} onChange={e => {setSearch(e.target.value); setShowSearchDropdown(true);}} onFocus={() => setShowSearchDropdown(true)} placeholder="Search furniture..." /></div>
        {showSearchDropdown && normalizedSearch && searchResults.length > 0 && (
          <div style={{position:"absolute",top:"100%",left:0,right:0,background:colors.linen50,border:`1px solid ${colors.linen200}`,borderRadius:"4px",marginTop:"4px",maxHeight:"400px",overflowY:"auto",zIndex:1000,boxShadow:"0 8px 16px rgba(0,0,0,0.15)"}}>
            {searchResults.map(product => (
              <button 
                key={product.id}
                onClick={() => {
                  onProductClick(product.id);
                  setSearch("");
                  setShowSearchDropdown(false);
                }}
                style={{
                  display:"flex",
                  alignItems:"center",
                  gap:"12px",
                  width:"100%",
                  padding:"10px 12px",
                  background:"transparent",
                  border:"none",
                  borderBottom:`1px solid ${colors.linen200}`,
                  cursor:"pointer",
                  textAlign:"left",
                  transition:"background .2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = colors.linen100}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <img src={product.image} alt={product.name} style={{width:"40px",height:"40px",objectFit:"cover",borderRadius:"3px"}} onError={(e) => e.currentTarget.src = FALLBACK_IMAGE}/>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{margin:0,fontSize:"12.5px",fontWeight:600,color:colors.ink900,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{product.name}</p>
                  <p style={{margin:"2px 0 0",fontSize:"11px",color:colors.ink600}}>{product.category}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <button className="cart-button" onClick={onCart} aria-label={`Cart with ${cartCount} items`}><ShoppingCart size={17} /><span className="cart-label">Cart</span>{cartCount > 0 && <b>{cartCount}</b>}</button>
      <button className="login-button" onClick={user ? onAccount : onLogin}><LogIn size={15}/><span>{user?.name || "Login"}</span></button>
      <nav className={`site-nav ${navOpen ? "open" : ""}`}>
        <div className="mobile-nav-search-wrap"><div className="mobile-nav-search"><Search size={15}/><input aria-label="Search furniture" value={search} onChange={e => setSearch(e.target.value)} onFocus={() => setShowSearchDropdown(true)} placeholder="Search furniture..." /></div>{showSearchDropdown && normalizedSearch && searchResults.length > 0 && <div className="mobile-search-results">{searchResults.map(product => <button key={product.id} onClick={() => { onProductClick(product.id); setSearch(""); setShowSearchDropdown(false); setNavOpen(false); }}><img src={product.image} alt={product.name} onError={e => e.currentTarget.src = FALLBACK_IMAGE}/><span><strong>{product.name}</strong><small>{product.category}</small></span></button>)}</div>}</div>
        <a href="#shop" onClick={() => setNavOpen(false)}>Shop</a><a href="#about" onClick={() => setNavOpen(false)}>About</a><a href="#footer" onClick={() => setNavOpen(false)}>Contact</a>
      </nav>
      <button className="menu-btn" aria-label="Toggle menu" onClick={() => setNavOpen(v => !v)}>{navOpen ? <X size={20} color={colors.linen50}/> : <Menu size={20} color={colors.linen50}/>}</button>
    </div>
  </div></header>;
}

function Hero({ heroImage, heroMediaType }) { return <section className="hero" id="top"><div className="hero-copy"><p className="hero-eyebrow">Handcrafted furniture</p><h1 className="hero-title">Furniture that grows with your home.</h1><p className="hero-sub">Solid wood pieces, finished by hand and built to age well — from dining tables to reading chairs.</p><a href="#shop" className="hero-cta">Shop the collection <ArrowRight size={15}/></a></div><div className="hero-media">{heroMediaType === "video" ? <video src={heroImage} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} controls autoPlay muted /> : <img src={heroImage} alt="Featured furniture piece"/>}<div className="hero-grain"><GrainMark size={140} stroke={colors.linen50} opacity={0.5}/></div></div></section>; }

function ProductCard({ product, onOpen, onAdd }) { return <article className="p-card"><button className="p-card-main" onClick={() => onOpen(product)}><div className="p-image"><img src={product.image} alt={product.name}/></div><div className="p-body"><p className="p-category">{product.category}</p><p className="p-name">{product.name}</p><p className="p-price">{currency(product.price)}</p></div></button><button className="add-cart" onClick={() => onAdd(product)}><Plus size={15}/> Add to cart</button></article>; }

function QuickView({ product, onClose, onAdd }) { if (!product) return null; return <div className="modal-backdrop" onClick={onClose}><div className="modal-card" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={onClose} aria-label="Close"><X size={18}/></button><div className="modal-image"><img src={product.image} alt={product.name}/></div><div className="modal-body"><p className="modal-category">{product.category}</p><h3 className="modal-name">{product.name}</h3><p className="modal-price">{currency(product.price)}</p><p className="modal-desc">{product.description}</p><button className="hero-cta" onClick={() => onAdd(product)}>Add to cart <ShoppingCart size={15}/></button></div></div></div>; }

function CartDrawer({ cart, onClose, onChange, onCheckout }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  return <div className="cart-backdrop" onClick={onClose}><aside className="cart-drawer" onClick={e => e.stopPropagation()}><div className="cart-head"><h2>Your cart</h2><button onClick={onClose}><X size={19}/></button></div>{cart.length === 0 ? <div className="empty-cart"><ShoppingCart size={34}/><p>Your cart is empty.</p><span>Add furniture from the collection to get started.</span></div> : <><div className="cart-items">{cart.map(item => <div className="cart-item" key={item.id}><img src={item.image} alt={item.name}/><div className="cart-item-info"><strong>{item.name}</strong><span>{currency(item.price)}</span><div className="qty"><button onClick={() => onChange(item.id, -1)}><Minus size={13}/></button><b>{item.qty}</b><button onClick={() => onChange(item.id, 1)}><Plus size={13}/></button><button className="remove" onClick={() => onChange(item.id, -item.qty)}><Trash2 size={13}/></button></div></div></div>)}</div><div className="cart-total"><span>Total</span><strong>{currency(total)}</strong></div><button className="checkout-btn" onClick={onCheckout}>Record sale (demo)</button></>}</aside></div>;
}

function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = mode === "login" ? await loginUser({ identifier: email, password }) : await registerUser({ name, email, phone, password });
      if (mode === "register") {
        setSuccess(`Account created. You are signed in as ${user.name}.`);
        window.setTimeout(() => onSuccess(user), 900);
      } else {
        onSuccess(user);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const googleSignIn = () => {
    if (!googleClientId || !window.google?.accounts?.id) {
      setError("Google login is not configured yet. Use email login or add VITE_GOOGLE_CLIENT_ID.");
      return;
    }
    window.google.accounts.id.initialize({ client_id: googleClientId, callback: async ({ credential }) => {
      setBusy(true);
      setError("");
      try { onSuccess(await loginWithGoogle(credential)); } catch (requestError) { setError(requestError.message); } finally { setBusy(false); }
    }});
    window.google.accounts.id.prompt();
  };

  React.useEffect(() => {
    if (window.google?.accounts?.id) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {};
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  return <div className="modal-backdrop" onClick={onClose}><div className="auth-card" onClick={event => event.stopPropagation()}>
    <button className="modal-close" onClick={onClose} aria-label="Close"><X size={18}/></button>
    <p className="modal-category">{mode === "login" ? "Sign in" : "Create account"}</p>
    <h2 style={{fontFamily:fontVoice,margin:"0 0 8px",fontSize:28}}>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
    <p style={{fontSize:13,color:colors.ink600,margin:"0 0 20px"}}>Sign in to finish your order. Your account details are saved securely in the store spreadsheet.</p>
    <button type="button" className="google-btn" onClick={googleSignIn} disabled={busy}><span className="google-mark">G</span> Continue with Google</button>
    <div className="auth-divider"><span>or use email</span></div>
    <form onSubmit={submit}>
      {mode === "register" && <label className="auth-label">Full name<input className="auth-input" value={name} onChange={event => setName(event.target.value)} required /></label>}
      <label className="auth-label">{mode === "login" ? "Email or phone number" : "Email address (optional)"}<input className="auth-input" type={mode === "login" ? "text" : "email"} value={email} onChange={event => setEmail(event.target.value)} required={mode === "login"} /></label>
      {mode === "register" && <label className="auth-label">Phone number<input className="auth-input" type="tel" value={phone} onChange={event => setPhone(event.target.value)} /></label>}
      <label className="auth-label">Password<input className="auth-input" type="password" minLength={6} value={password} onChange={event => setPassword(event.target.value)} required /></label>
      {error && <p className="auth-error">{error}</p>}
      {success && <p className="auth-success">{success}</p>}
      <button className="hero-cta auth-submit" type="submit" disabled={busy || Boolean(success)}>{busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</button>
    </form>
    <button className="auth-switch" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}</button>
  </div></div>;
}

function AccountModal({ user, onClose, inline = false }) {
  const [section, setSection] = useState("details");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [addresses, setAddresses] = useState(user?.addresses?.length ? user.addresses : (user?.address ? [{ label: "Home", value: user.address }] : [{ label: "Home", value: "" }]));
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const profile = section === "details"
        ? { name, email, phone }
        : section === "address"
          ? { addresses: addresses.filter(item => item.value.trim()) }
          : { password };
      const next = await updateUser({ id: user.id, ...profile });
      setName(next.name || "");
      setEmail(next.email || "");
      setPhone(next.phone || "");
      setAddresses(next.addresses?.length ? next.addresses : (next.address ? [{ label: "Home", value: next.address }] : [{ label: "Home", value: "" }]));
      setPassword("");
      setMessage("Changes saved.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await logoutUser();
    onClose();
  };

  return <div className={inline ? "account-page-panel" : "modal-backdrop"} onClick={inline ? undefined : onClose}><div className={inline ? "account-page-card" : "account-card"} onClick={event => event.stopPropagation()}>
    <button className="modal-close" onClick={onClose} aria-label="Close"><X size={18}/></button>
    <p className="modal-category">My account</p>
    <h2 className="account-title">{user.name}</h2>
    <div className="account-tabs"><button type="button" className={section === "details" ? "active" : ""} onClick={() => { setSection("details"); setMessage(""); setError(""); }}>Details</button><button type="button" className={section === "address" ? "active" : ""} onClick={() => { setSection("address"); setMessage(""); setError(""); }}>Address</button><button type="button" className={section === "security" ? "active" : ""} onClick={() => { setSection("security"); setMessage(""); setError(""); }}>Security</button></div>
    <form onSubmit={save}>
      {section === "details" && <><label className="auth-label">Full name<input className="auth-input" value={name} onChange={event => setName(event.target.value)} required /></label><label className="auth-label">Email address<input className="auth-input" type="email" value={email} onChange={event => setEmail(event.target.value)} /></label><label className="auth-label">Phone number<input className="auth-input" type="tel" value={phone} onChange={event => setPhone(event.target.value)} /></label></>}
      {section === "address" && <div className="address-editor"><p className="account-note">Save more than one delivery address for faster checkout.</p>{addresses.map((item, index) => <div className="address-row" key={index}><label className="auth-label"><span>Address name</span><input className="auth-input" value={item.label} onChange={event => setAddresses(current => current.map((entry, entryIndex) => entryIndex === index ? {...entry, label: event.target.value} : entry))} placeholder="Home, Work..." /></label><label className="auth-label"><span>Full address</span><textarea className="auth-input account-textarea" value={item.value} onChange={event => setAddresses(current => current.map((entry, entryIndex) => entryIndex === index ? {...entry, value: event.target.value} : entry))} rows="3" placeholder="House, street, city, state and postal code" /></label>{addresses.length > 1 && <button type="button" className="address-remove" onClick={() => setAddresses(current => current.filter((_, entryIndex) => entryIndex !== index))}>Remove</button>}</div>)}<button type="button" className="address-add" onClick={() => setAddresses(current => [...current, { label: `Address ${current.length + 1}`, value: "" }])}>+ Add another address</button></div>}
      {section === "security" && <><p className="account-note">Choose a new password for email or phone login.</p><label className="auth-label">New password<input className="auth-input" type="password" minLength={6} value={password} onChange={event => setPassword(event.target.value)} required /></label></>}
      {error && <p className="auth-error">{error}</p>}
      {message && <p className="auth-success">{message}</p>}
      <button className="hero-cta auth-submit" type="submit" disabled={busy}>{busy ? "Saving..." : "Save changes"}</button>
    </form>
    <button className="account-signout" onClick={signOut}>Sign out</button>
  </div></div>;
}

export function UserAccountPage({ onNavigateHome }) {
  const user = useUserSession();
  if (!user) {
    return <div className="account-page-shell"><main className="account-empty"><h1>Sign in to view your account</h1><button className="hero-cta" onClick={onNavigateHome}>Return to store</button></main></div>;
  }
  return <div className="account-page-shell"><aside className="account-page-sidebar"><div className="account-sidebar-brand"><div className="brand-mark"><img src="/logo/shukrwaar logo-4.svg" alt="Shukarwaar logo" /></div><span>SHUKARWAAR</span></div><p className="account-sidebar-label">Account</p><div className="account-sidebar-user"><strong>{user.name}</strong><span>{user.email || user.phone || "Customer"}</span></div><button className="account-back" onClick={onNavigateHome}>Back to store</button></aside><main className="account-page-main"><div className="account-page-heading"><p className="modal-category">Customer area</p><h1>My account</h1><p>Manage your details, delivery address, and sign-in security.</p></div><AccountModal user={user} inline onClose={onNavigateHome} /></main></div>;
}

export default function FurnitureStore({ onNavigateAdmin, onNavigateHome, onNavigateAccount, onNavigateProduct, onNavigateCategory, selectedProductId, selectedCategoryName }) {
  const products = useProducts();
  const [navOpen, setNavOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedCategoryLocal, setSelectedCategoryLocal] = useState(selectedCategoryName || null);
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [detailId, setDetailId] = useState(selectedProductId || null);
  const [cartNotice, setCartNotice] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authForCheckout, setAuthForCheckout] = useState(false);
  const user = useUserSession();

  React.useEffect(() => {
    setSelectedCategoryLocal(selectedCategoryName || null);
    if (!selectedCategoryName) {
      setDetailId(null);
      setActiveCategory("All");
    }
  }, [selectedCategoryName]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.category)))], [products]);
  const categoryCards = useMemo(() => {
    const map = new Map();
    products.forEach((product) => {
      const current = map.get(product.category) || [];
      current.push(product);
      map.set(product.category, current);
    });
    return Array.from(map.entries()).map(([name, items]) => ({
      name,
      image: items.find((item) => item?.image)?.image || FALLBACK_IMAGE,
      count: items.length,
      items,
    }));
  }, [products]);
  const normalizedSearch = (search || "").trim().toLowerCase();
  const searchMatches = (value = "") => String(value).toLowerCase().includes(normalizedSearch);
  const filteredCategoryCards = useMemo(() => {
    if (!normalizedSearch) return categoryCards;
    return categoryCards.filter((category) => {
      return searchMatches(category.name) || category.items.some((item) => searchMatches(item.name) || searchMatches(item.description) || searchMatches(item.category));
    });
  }, [categoryCards, normalizedSearch]);
  const mediaConfig = getMediaConfig();
  const heroImage = mediaConfig.heroMedia || products[0]?.image;
  const activeProductId = selectedProductId || detailId;
  const selectedProduct = products.find(p => p.id === activeProductId) || null;
  const selectedCategory = selectedCategoryName || selectedCategoryLocal;
  const categoryProducts = useMemo(
    () => products.filter(p => p.category === selectedCategory),
    [products, selectedCategory]
  );
  const filteredCategoryProducts = useMemo(() => {
    if (!normalizedSearch) return categoryProducts;
    return categoryProducts.filter((product) =>
      searchMatches(product.name) || searchMatches(product.category) || searchMatches(product.description)
    );
  }, [categoryProducts, normalizedSearch]);

  const addToCart = (product) => {
    setCart(prev => prev.some(x => x.id === product.id) ? prev.map(x => x.id === product.id ? {...x, qty: x.qty + 1} : x) : [...prev, {...product, qty: 1}]);
    setCartOpen(true);
    setCartNotice(`${product.name} added to cart`);
    window.clearTimeout(addToCart.timer);
    addToCart.timer = window.setTimeout(() => setCartNotice(""), 1800);
  };
  const changeQty = (id, delta) => setCart(prev => prev.map(x => x.id === id ? {...x, qty: x.qty + delta} : x).filter(x => x.qty > 0));
  const cartCount = cart.reduce((s, x) => s + x.qty, 0);
  const completeCheckout = async (user) => {
    if (!cart.length) return;
    const date = new Date().toISOString().slice(0,10);
    for (const item of cart) {
      await recordSale({ id:`s-${Date.now()}-${item.id}`, date, customer:user.name, customerEmail:user.email, productId:item.id, productName:item.name, category:item.category, quantity:item.qty, unitPrice:Number(item.price), total:Number(item.price) * item.qty, status:"Paid" });
    }
    setCart([]); setCartOpen(false); setAuthOpen(false); window.alert("Sale recorded. It is now included in the Sales Overview.");
  };
  const checkout = async () => {
    if (!cart.length) return;
    const session = getUserSession();
    if (!session) { openCheckoutLogin(); return; }
    await completeCheckout(session);
  };
  const openLogin = () => {
    setNavOpen(false);
    setAuthForCheckout(false);
    setAuthOpen(true);
  };
  const openCheckoutLogin = () => {
    setAuthForCheckout(true);
    setAuthOpen(true);
  };
  const handleAuthSuccess = async (authenticatedUser) => {
    setAuthOpen(false);
    if (authForCheckout) await completeCheckout(authenticatedUser);
    else if (onNavigateAccount) onNavigateAccount();
    setAuthForCheckout(false);
  };

  const openCategory = (categoryName) => {
    if (onNavigateCategory) {
      onNavigateCategory(categoryName);
      return;
    }
    setSelectedCategoryLocal(categoryName);
    setDetailId(null);
    setActiveCategory(categoryName);
  };

  const openProduct = (productId) => {
    if (onNavigateProduct) {
      onNavigateProduct(productId);
      return;
    }
    setDetailId(productId);
  };

  const openHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
      return;
    }
    setSelectedCategoryLocal(null);
    setDetailId(null);
    setActiveCategory("All");
  };

  if (selectedCategory) {
    return <div className="store-app" style={{fontFamily: fontBody}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        *{box-sizing:border-box} a,button,input{font-family:inherit}.store-app{min-height:100vh;background:${colors.linen100};color:${colors.ink900};width:100%;overflow-x:hidden}
        .site-header{background:${colors.walnut950};position:sticky;top:0;z-index:30}.site-header-inner{width:100%;padding:14px clamp(16px,4vw,48px);display:flex;align-items:center;justify-content:space-between;gap:18px}.brand{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0}.brand-mark{width:34px;height:34px;border-radius:50%;background:${colors.walnut800};display:flex;align-items:center;justify-content:center;overflow:hidden}.brand-mark img{width:100%;height:100%;object-fit:cover;display:block}.brand span{font-family:${fontVoice};font-size:18px;font-weight:600;color:${colors.linen50}}.header-actions{display:flex;align-items:center;gap:12px}.search-box{display:flex;align-items:center;gap:8px;background:${colors.linen50};border-radius:4px;padding:8px 11px;width:min(280px,28vw);color:${colors.ink400}}.search-box input{border:0;outline:0;background:transparent;width:100%;font-size:12.5px;color:${colors.ink900}}.cart-button{position:relative;display:flex;align-items:center;gap:6px;background:transparent;border:1px solid ${colors.walnut800};color:${colors.oak300};padding:8px 11px;border-radius:4px;cursor:pointer}.cart-button b{position:absolute;top:-7px;right:-7px;background:${colors.oak500};color:white;border-radius:99px;min-width:18px;height:18px;font-size:10px;display:grid;place-items:center}.site-nav{display:flex;align-items:center;gap:22px}.site-nav a{color:${colors.oak300};text-decoration:none;font-size:13px}.menu-btn{display:none;background:none;border:0;padding:4px}.category-page{max-width:1200px;margin:auto;padding:clamp(28px,5vw,64px) clamp(18px,5vw,64px) 80px}.category-hero{display:flex;align-items:end;justify-content:space-between;gap:18px;margin-bottom:26px}.category-title{font-family:${fontVoice};font-size:clamp(28px,3vw,44px);margin:0}.category-sub{margin:4px 0 0;color:${colors.ink600}}.back-link{background:transparent;border:1px solid ${colors.walnut800};padding:10px 14px;border-radius:4px;color:${colors.walnut900};cursor:pointer}.p-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}.p-card{background:${colors.linen50};border:1px solid ${colors.linen200};border-radius:6px;overflow:hidden;display:flex;flex-direction:column;min-width:0}.p-card-main{border:0;background:transparent;text-align:left;padding:0;cursor:pointer}.p-image{width:100%;height:clamp(190px,18vw,260px);background:${colors.linen200};overflow:hidden}.p-image img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s}.p-card:hover .p-image img{transform:scale(1.04)}.p-body{padding:14px 16px 10px}.p-category{margin:0 0 4px;font-size:10.5px;letter-spacing:.7px;text-transform:uppercase;color:${colors.oak600}}.p-name{margin:0 0 6px;font-family:${fontVoice};font-size:16px;font-weight:600}.p-price{margin:0;font-size:14px;color:${colors.ink900};font-weight:600}.add-cart{margin:0 16px 16px;border:0;background:${colors.walnut900};color:${colors.linen50};padding:10px 12px;border-radius:4px;cursor:pointer;font-weight:600}.empty-state{padding:50px 0;text-align:center;color:${colors.ink600}}.cart-toast{position:fixed;right:22px;bottom:22px;background:${colors.walnut950};color:${colors.linen50};padding:12px 16px;border-radius:6px;box-shadow:0 20px 40px rgba(0,0,0,.16);z-index:60}.cart-backdrop{position:fixed;inset:0;background:rgba(16,12,8,.35);display:flex;justify-content:flex-end;z-index:50}.cart-drawer{width:min(420px,100%);background:${colors.linen50};height:100vh;padding:20px 18px;overflow:auto}.cart-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px}.cart-head h2{margin:0;font-family:${fontVoice};font-size:28px}.cart-head button{background:transparent;border:0;cursor:pointer}.cart-item{display:flex;gap:12px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid ${colors.linen200}}.cart-item img{width:80px;height:80px;object-fit:cover;border-radius:6px}.cart-item-info{flex:1}.cart-item-info strong{display:block;margin-bottom:4px;font-size:15px}.cart-item-info span{display:block;color:${colors.ink600};font-size:12px;margin-bottom:8px}.qty{display:flex;align-items:center;gap:8px}.qty button{width:26px;height:26px;border:1px solid ${colors.linen200};background:white;border-radius:50%;cursor:pointer;display:grid;place-items:center}.qty b{min-width:20px;text-align:center;font-size:14px}.remove{border:0 !important;color:${colors.oak600};font-size:12px}.empty-cart{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:50px 0;color:${colors.ink600};text-align:center}.empty-cart p{margin:0;font-size:18px;color:${colors.ink900}}.cart-total{display:flex;align-items:center;justify-content:space-between;margin:18px 0 14px;font-size:18px}.checkout-btn{width:100%;border:0;background:${colors.walnut900};color:${colors.linen50};padding:12px 16px;border-radius:4px;cursor:pointer;font-weight:600}.@media(max-width:1100px){.p-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.site-nav{gap:14px}.search-box{width:220px}}@media(max-width:850px){.category-page{padding-top:30px}.p-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.site-nav{display:none;position:absolute;top:62px;left:0;right:0;background:${colors.walnut950};padding:12px 22px 18px;flex-direction:column;align-items:stretch}.site-nav.open{display:flex}.menu-btn{display:block}.header-actions{margin-left:auto}.search-box{width:min(240px,45vw)}}@media(max-width:560px){.cart-label{display:none}.search-box{width:42vw}.site-header-inner{gap:8px}.category-hero{flex-direction:column;align-items:flex-start}.p-grid{grid-template-columns:1fr}}`}</style>
      <header className="site-header"><div className="site-header-inner">
        <a href="#top" className="brand" onClick={(e) => { e.preventDefault(); openHome(); }}><div className="brand-mark"><img src="/logo/shukrwaar logo-4.svg" alt="Shukarwaar logo" /></div><span>SHUKARWAAR</span></a>
        <div className="header-actions">
          <div className="search-box"><Search size={15} /><input aria-label="Search furniture" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search furniture..." /></div>
          <button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`Cart with ${cartCount} items`}><ShoppingCart size={17} /><span className="cart-label">Cart</span>{cartCount > 0 && <b>{cartCount}</b>}</button>
          <button className="login-button" onClick={user ? onNavigateAccount : openLogin}><LogIn size={15}/><span>{user?.name || "Login"}</span></button>
          <nav className={`site-nav ${navOpen ? "open" : ""}`}><div className="mobile-nav-search"><Search size={15}/><input aria-label="Search furniture" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search furniture..." /></div><a href="#shop" onClick={e => { e.preventDefault(); openHome(); }}>Shop</a><a href="#about" onClick={e => e.preventDefault()}>About</a><a href="#footer" onClick={e => e.preventDefault()}>Contact</a></nav>
          <button className="menu-btn" aria-label="Toggle menu" onClick={() => setNavOpen(v => !v)}>{navOpen ? <X size={20} color={colors.linen50}/> : <Menu size={20} color={colors.linen50}/>}</button>
        </div>
      </div></header>
      <div className="category-page">
        <div className="category-hero">
          <div>
            <p className="shop-sub">Collection</p>
            <h1 className="category-title">{selectedCategory}</h1>
            <p className="category-sub">{categoryProducts.length} items in this category</p>
          </div>
          <button className="back-link" onClick={openHome}>Back to categories</button>
        </div>
        {filteredCategoryProducts.length ? <div className="p-grid">{filteredCategoryProducts.map(p => <article key={p.id} className="p-card"><button className="p-card-main" onClick={() => openProduct(p.id)}><div className="p-image"><ProductImage src={p.image} alt={p.name} /></div><div className="p-body"><p className="p-category">{p.category}</p><p className="p-name">{p.name}</p><p className="p-price">{currency(p.price)}</p></div></button><button className="add-cart" onClick={() => addToCart(p)}><Plus size={15}/> Add to cart</button></article>)}</div> : <div className="empty-state">No items found in this category.</div>}
      </div>
      {cartNotice && <div className="cart-toast">{cartNotice}</div>}
      {cartOpen && <div className="cart-backdrop" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={e => e.stopPropagation()}><div className="cart-head"><h2>Your cart</h2><button onClick={() => setCartOpen(false)}><X size={19}/></button></div>{cart.length === 0 ? <div className="empty-cart"><ShoppingCart size={34}/><p>Your cart is empty.</p><span>Add furniture from the collection to get started.</span></div> : <><div className="cart-items">{cart.map(item => <div className="cart-item" key={item.id}><img src={item.image} alt={item.name}/><div className="cart-item-info"><strong>{item.name}</strong><span>{currency(item.price)}</span><div className="qty"><button onClick={() => changeQty(item.id, -1)}><Minus size={13}/></button><b>{item.qty}</b><button onClick={() => changeQty(item.id, 1)}><Plus size={13}/></button><button className="remove" onClick={() => changeQty(item.id, -item.qty)}><Trash2 size={13}/></button></div></div></div>)}</div><div className="cart-total"><span>Total</span><strong>{currency(cart.reduce((sum, item) => sum + item.price * item.qty, 0))}</strong></div><button className="checkout-btn" onClick={checkout}>Continue to checkout</button></>}</aside></div>}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />}
    </div>;
  }

  if (selectedProduct) {
    return <div className="store-app" style={{fontFamily: fontBody}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        *{box-sizing:border-box} a,button,input{font-family:inherit}.store-app{min-height:100vh;background:${colors.linen100};color:${colors.ink900};width:100%;overflow-x:hidden}
        .site-header{background:${colors.walnut950};position:sticky;top:0;z-index:30}.site-header-inner{width:100%;padding:14px clamp(16px,4vw,48px);display:flex;align-items:center;justify-content:space-between;gap:18px}.brand{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0}.brand-mark{width:34px;height:34px;border-radius:50%;background:${colors.walnut800};display:flex;align-items:center;justify-content:center;overflow:hidden}.brand-mark img{width:100%;height:100%;object-fit:cover;display:block}.brand span{font-family:${fontVoice};font-size:18px;font-weight:600;color:${colors.linen50}}.header-actions{display:flex;align-items:center;gap:12px}.search-box{display:flex;align-items:center;gap:8px;background:${colors.linen50};border-radius:4px;padding:8px 11px;width:min(280px,28vw);color:${colors.ink400}}.search-box input{border:0;outline:0;background:transparent;width:100%;font-size:12.5px;color:${colors.ink900}}.cart-button{position:relative;display:flex;align-items:center;gap:6px;background:transparent;border:1px solid ${colors.walnut800};color:${colors.oak300};padding:8px 11px;border-radius:4px;cursor:pointer}.cart-button b{position:absolute;top:-7px;right:-7px;background:${colors.oak500};color:white;border-radius:99px;min-width:18px;height:18px;font-size:10px;display:grid;place-items:center}.site-nav{display:flex;align-items:center;gap:22px}.site-nav a{color:${colors.oak300};text-decoration:none;font-size:13px}.menu-btn{display:none;background:none;border:0;padding:4px}.product-page{max-width:1200px;margin:auto;padding:clamp(28px,5vw,64px) clamp(18px,5vw,64px) 80px}.product-layout{display:grid;grid-template-columns:1.1fr .9fr;gap:32px}.product-image-wrap{background:${colors.linen200};border-radius:10px;overflow:hidden;min-height:440px}.product-image-wrap img{display:block;width:100%;height:100%;object-fit:cover}.product-meta{padding-top:10px}.crumbs{display:flex;align-items:center;gap:8px;color:${colors.ink600};font-size:12px;margin-bottom:14px}.crumbs button{border:0;background:transparent;color:${colors.ink600};padding:0;cursor:pointer}.product-category{margin:0 0 8px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${colors.oak600}}.product-title{font-family:${fontVoice};font-size:clamp(30px,4vw,52px);margin:0 0 12px}.product-price{font-size:28px;font-weight:700;margin:0 0 18px}.product-desc{color:${colors.ink600};line-height:1.8;font-size:15px;margin:0 0 24px}.product-actions{display:flex;gap:12px;flex-wrap:wrap}.btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:${colors.walnut900};color:${colors.linen50};border:0;border-radius:4px;padding:13px 18px;font-weight:600;cursor:pointer}.btn-secondary{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:transparent;border:1px solid ${colors.linen200};color:${colors.walnut900};border-radius:4px;padding:13px 18px;font-weight:600;cursor:pointer}.detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:24px}.detail-box{background:${colors.linen50};border:1px solid ${colors.linen200};border-radius:6px;padding:16px}.detail-box h3{margin:0 0 8px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${colors.oak600}}.detail-box p{margin:0;color:${colors.ink600};line-height:1.7;font-size:13.5px}.related{margin-top:36px}.related-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.related-card{background:${colors.linen50};border:1px solid ${colors.linen200};border-radius:6px;overflow:hidden}.related-card button{border:0;background:transparent;padding:0;text-align:left;cursor:pointer;width:100%}.related-card img{display:block;width:100%;height:170px;object-fit:cover}.related-card .body{padding:12px 14px}.related-card .body p{margin:0}.related-card .name{font-family:${fontVoice};font-size:16px;margin:0 0 4px}.related-card .price{font-weight:600}.cart-backdrop{position:fixed;inset:0;background:rgba(34,22,9,.55);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px}.cart-drawer{margin-left:auto;width:min(440px,100%);height:100%;background:${colors.linen50};padding:22px;display:flex;flex-direction:column}.cart-head{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid ${colors.linen200};padding-bottom:16px}.cart-head h2{font-family:${fontVoice};margin:0;font-size:24px}.cart-head button{border:0;background:transparent;cursor:pointer}.cart-items{overflow:auto;flex:1;padding:14px 0}.cart-item{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid ${colors.linen200}}.cart-item img{width:72px;height:72px;object-fit:cover;border-radius:4px}.cart-item-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}.cart-item-info strong{font-family:${fontVoice};font-size:14px}.cart-item-info span{font-size:12px}.qty{display:flex;align-items:center;gap:8px;margin-top:5px}.qty button{width:27px;height:27px;border:1px solid ${colors.linen200};background:white;border-radius:4px;display:grid;place-items:center;cursor:pointer}.qty .remove{margin-left:auto;border:0;background:transparent}.cart-total{display:flex;justify-content:space-between;border-top:1px solid ${colors.linen200};padding:18px 0;font-size:16px}.checkout-btn{width:100%;padding:13px;border:0;border-radius:4px;background:${colors.walnut900};color:white;font-weight:600}.empty-cart{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:${colors.ink600};gap:8px}.empty-cart p{font-family:${fontVoice};font-size:20px;color:${colors.ink900}}.cart-toast{position:fixed;right:24px;bottom:24px;background:${colors.walnut900};color:${colors.linen50};padding:10px 14px;border-radius:999px;font-size:12.5px;box-shadow:0 12px 30px rgba(0,0,0,.22);z-index:120}.cart-toast.hidden{display:none}
      @media(max-width:850px){.product-layout{grid-template-columns:1fr}.related-grid{grid-template-columns:1fr}.site-nav{display:none;position:absolute;top:62px;left:0;right:0;background:${colors.walnut950};padding:12px 22px 18px;flex-direction:column;align-items:stretch}.site-nav.open{display:flex}.menu-btn{display:block}.header-actions{margin-left:auto}.search-box{width:min(240px,45vw)}}
      @media(max-width:560px){.cart-label{display:none}.search-box{width:42vw}.site-header-inner{gap:8px}.related-grid{grid-template-columns:1fr}.detail-grid{grid-template-columns:1fr}}
    `}</style>
      <header className="site-header"><div className="site-header-inner">
        <a href="#top" className="brand" onClick={(e) => { e.preventDefault(); openHome(); }}><div className="brand-mark"><img src="/logo/shukrwaar logo-4.svg" alt="Shukarwaar logo" /></div><span>SHUKARWAAR</span></a>
        <div className="header-actions">
          <div className="search-box"><Search size={15} /><input aria-label="Search furniture" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search furniture..." /></div>
          <button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`Cart with ${cartCount} items`}><ShoppingCart size={17} /><span className="cart-label">Cart</span>{cartCount > 0 && <b>{cartCount}</b>}</button>
          <button className="login-button" onClick={user ? onNavigateAccount : openLogin}><LogIn size={15}/><span>{user?.name || "Login"}</span></button>
          <nav className={`site-nav ${navOpen ? "open" : ""}`}><div className="mobile-nav-search"><Search size={15}/><input aria-label="Search furniture" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search furniture..." /></div><a href="#shop" onClick={e => { e.preventDefault(); openHome(); }}>Shop</a><a href="#about" onClick={e => e.preventDefault()}>About</a><a href="#footer" onClick={e => e.preventDefault()}>Contact</a></nav>
          <button className="menu-btn" aria-label="Toggle menu" onClick={() => setNavOpen(v => !v)}>{navOpen ? <X size={20} color={colors.linen50}/> : <Menu size={20} color={colors.linen50}/>}</button>
        </div>
      </div></header>
      <div className="product-page">
        <div className="product-layout">
          <div className="product-image-wrap"><ProductImage src={selectedProduct.image} alt={selectedProduct.name} /></div>
          <div className="product-meta">
            <div className="crumbs"><button onClick={openHome}>Home</button><span>/</span><span>{selectedProduct.category}</span></div>
            <p className="product-category">{selectedProduct.category}</p>
            <h1 className="product-title">{selectedProduct.name}</h1>
            <p className="product-price">{currency(selectedProduct.price)}</p>
            <p className="product-desc">{selectedProduct.description}</p>
            <div className="product-actions">
              <button className="btn-primary" onClick={() => addToCart(selectedProduct)}><ShoppingCart size={16}/> Add to cart</button>
              <button className="btn-secondary" onClick={openHome}>Continue shopping</button>
            </div>
            <div className="detail-grid">
              <div className="detail-box"><h3>Crafted for</h3><p>Designed for everyday living with enduring materials and a clean, architectural silhouette.</p></div>
              <div className="detail-box"><h3>Finish</h3><p>Expertly finished in warm natural tones to complement modern homes and heirloom interiors.</p></div>
            </div>
          </div>
        </div>

        <div className="related">
          <h2 style={{fontFamily:fontVoice,fontSize:28,margin:"0 0 16px"}}>More in {selectedProduct.category}</h2>
          <div className="related-grid">{products.filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id).slice(0,3).map(item => <div className="related-card" key={item.id}><button onClick={() => openProduct(item.id)}><ProductImage src={item.image} alt={item.name} /><div className="body"><p className="name">{item.name}</p><p className="price">{currency(item.price)}</p></div></button></div>)}</div>
        </div>
      </div>
      {cartNotice && <div className="cart-toast">{cartNotice}</div>}
      {cartOpen && <div className="cart-backdrop" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={e => e.stopPropagation()}><div className="cart-head"><h2>Your cart</h2><button onClick={() => setCartOpen(false)}><X size={19}/></button></div>{cart.length === 0 ? <div className="empty-cart"><ShoppingCart size={34}/><p>Your cart is empty.</p><span>Add furniture from the collection to get started.</span></div> : <><div className="cart-items">{cart.map(item => <div className="cart-item" key={item.id}><img src={item.image} alt={item.name}/><div className="cart-item-info"><strong>{item.name}</strong><span>{currency(item.price)}</span><div className="qty"><button onClick={() => changeQty(item.id, -1)}><Minus size={13}/></button><b>{item.qty}</b><button onClick={() => changeQty(item.id, 1)}><Plus size={13}/></button><button className="remove" onClick={() => changeQty(item.id, -item.qty)}><Trash2 size={13}/></button></div></div></div>)}</div><div className="cart-total"><span>Total</span><strong>{currency(cart.reduce((sum, item) => sum + item.price * item.qty, 0))}</strong></div><button className="checkout-btn" onClick={checkout}>Continue to checkout</button></>}</aside></div>}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />}
    </div>;
  }

  return <div className="store-app" style={{fontFamily: fontBody}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
      *{box-sizing:border-box} a,button,input{font-family:inherit}.store-app{min-height:100vh;background:${colors.linen100};color:${colors.ink900};width:100%;overflow-x:hidden}
      .site-header{background:${colors.walnut950};position:sticky;top:0;z-index:30}.site-header-inner{width:100%;padding:14px clamp(16px,4vw,48px);display:flex;align-items:center;justify-content:space-between;gap:18px}.brand{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0}.brand-mark{width:34px;height:34px;border-radius:50%;background:${colors.walnut800};display:flex;align-items:center;justify-content:center;overflow:hidden}.brand-mark img{width:100%;height:100%;object-fit:cover;display:block}.brand span{font-family:${fontVoice};font-size:18px;font-weight:600;color:${colors.linen50}}.header-actions{display:flex;align-items:center;gap:12px}.search-box{display:flex;align-items:center;gap:8px;background:${colors.linen50};border-radius:4px;padding:8px 11px;width:min(280px,28vw);color:${colors.ink400}}.search-box input{border:0;outline:0;background:transparent;width:100%;font-size:12.5px;color:${colors.ink900}}.cart-button{position:relative;display:flex;align-items:center;gap:6px;background:transparent;border:1px solid ${colors.walnut800};color:${colors.oak300};padding:8px 11px;border-radius:4px;cursor:pointer}.cart-button b{position:absolute;top:-7px;right:-7px;background:${colors.oak500};color:white;border-radius:99px;min-width:18px;height:18px;font-size:10px;display:grid;place-items:center}.site-nav{display:flex;align-items:center;gap:22px}.site-nav a{color:${colors.oak300};text-decoration:none;font-size:13px}.menu-btn{display:none;background:none;border:0;padding:4px}
      .hero{width:100%;max-width:1440px;margin:auto;padding:clamp(34px,6vw,76px) clamp(18px,5vw,70px);display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,72px);align-items:center}.hero-title{font-family:${fontVoice};font-size:clamp(34px,4.2vw,62px);line-height:1.08;margin:0 0 18px;color:${colors.ink900}}.hero-eyebrow{font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${colors.oak600};margin:0 0 14px;font-weight:600}.hero-sub{font-size:15px;line-height:1.7;color:${colors.ink600};margin:0 0 26px;max-width:540px}.hero-cta{display:inline-flex;align-items:center;gap:8px;background:${colors.walnut900};color:${colors.linen50};border:0;border-radius:4px;padding:13px 20px;font-size:13.5px;font-weight:600;cursor:pointer;text-decoration:none}.hero-media{position:relative;border-radius:8px;overflow:hidden;aspect-ratio:4/3;background:${colors.linen200};min-width:0}.hero-media img{width:100%;height:100%;object-fit:cover;display:block}.hero-grain{position:absolute;bottom:-30px;right:-30px}
      .shop-section{width:100%;max-width:1440px;margin:auto;padding:10px clamp(18px,5vw,70px) 80px}.shop-head{display:flex;justify-content:space-between;align-items:end;gap:16px;margin-bottom:18px}.shop-title{font-family:${fontVoice};font-size:clamp(24px,3vw,34px);font-weight:600;margin:0 0 4px}.shop-sub{font-size:13.5px;color:${colors.ink600};margin:0}.category-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:28px}.category-card{position:relative;background:${colors.linen50};border:1px solid ${colors.linen200};border-radius:8px;overflow:hidden;cursor:pointer;transition:transform .15s ease, box-shadow .15s ease}.category-card:hover{transform:translateY(-2px);box-shadow:0 12px 24px rgba(34,22,9,.08)}.category-card img{width:100%;height:200px;object-fit:cover;display:block}.category-card .overlay{position:absolute;inset:0;background:linear-gradient(180deg, rgba(34,22,9,.05), rgba(34,22,9,.62));display:flex;align-items:flex-end;padding:16px}.category-card .meta{display:flex;align-items:flex-end;justify-content:space-between;gap:8px;width:100%;color:${colors.linen50}}.category-card strong{font-size:18px;font-family:${fontVoice}}.category-card span{font-size:12px;opacity:.9}.p-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}.p-card{background:${colors.linen50};border:1px solid ${colors.linen200};border-radius:6px;overflow:hidden;display:flex;flex-direction:column;min-width:0}.p-card-main{border:0;background:transparent;text-align:left;padding:0;cursor:pointer}.p-image{width:100%;height:clamp(180px,18vw,260px);background:${colors.linen200};overflow:hidden}.p-image img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s}.p-card:hover .p-image img{transform:scale(1.04)}.p-body{padding:14px 16px 10px}.p-category{margin:0 0 4px;font-size:10.5px;letter-spacing:.7px;text-transform:uppercase;color:${colors.oak600}}.p-name{margin:0 0 6px;font-family:${fontVoice};font-size:16px;font-weight:600;color:${colors.ink900}}.p-price{margin:0;font-size:13.5px;font-weight:600}.add-cart{margin:0 16px 16px;display:flex;align-items:center;justify-content:center;gap:7px;background:${colors.walnut900};color:${colors.linen50};border:0;border-radius:4px;padding:10px;cursor:pointer;font-weight:600;font-size:12.5px}.site-footer{background:${colors.walnut950};color:${colors.oak300};padding:34px 20px;text-align:center;font-size:12.5px}.cart-backdrop{position:fixed;inset:0;background:rgba(34,22,9,.55);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px}.cart-drawer{margin-left:auto;width:min(440px,100%);height:100%;background:${colors.linen50};padding:22px;display:flex;flex-direction:column}.cart-head{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid ${colors.linen200};padding-bottom:16px}.cart-head h2{font-family:${fontVoice};margin:0;font-size:24px}.cart-head button{border:0;background:transparent;cursor:pointer}.cart-items{overflow:auto;flex:1;padding:14px 0}.cart-item{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid ${colors.linen200}}.cart-item img{width:72px;height:72px;object-fit:cover;border-radius:4px}.cart-item-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}.cart-item-info strong{font-family:${fontVoice};font-size:14px}.cart-item-info span{font-size:12px}.qty{display:flex;align-items:center;gap:8px;margin-top:5px}.qty button{width:27px;height:27px;border:1px solid ${colors.linen200};background:white;border-radius:4px;display:grid;place-items:center;cursor:pointer}.qty .remove{margin-left:auto;border:0;background:transparent}.cart-total{display:flex;justify-content:space-between;border-top:1px solid ${colors.linen200};padding:18px 0;font-size:16px}.checkout-btn{width:100%;padding:13px;border:0;border-radius:4px;background:${colors.walnut900};color:white;font-weight:600}.empty-cart{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:${colors.ink600};gap:8px}.empty-cart p{font-family:${fontVoice};font-size:20px;color:${colors.ink900}}.cart-toast{position:fixed;right:24px;bottom:24px;background:${colors.walnut900};color:${colors.linen50};padding:10px 14px;border-radius:999px;font-size:12.5px;box-shadow:0 12px 30px rgba(0,0,0,.22);z-index:120}
      @media(max-width:1100px){.p-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.category-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.site-nav{gap:14px}.search-box{width:220px}}
      @media(max-width:850px){.hero{grid-template-columns:1fr}.hero-media{order:-1}.p-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.category-grid{grid-template-columns:1fr}.site-nav{display:none;position:absolute;top:62px;left:0;right:0;background:${colors.walnut950};padding:12px 22px 18px;flex-direction:column;align-items:stretch}.site-nav.open{display:flex}.menu-btn{display:block}.header-actions{margin-left:auto}.search-box{width:min(240px,45vw)}}
      @media(max-width:560px){.cart-label{display:none}.search-box{width:42vw}.site-header-inner{gap:8px}.hero{padding-top:30px}.hero-media{aspect-ratio:16/11}.p-grid{grid-template-columns:1fr}.shop-section{padding-bottom:55px}}
    `}</style>
    <Header onNavigateAdmin={onNavigateAdmin} navOpen={navOpen} setNavOpen={setNavOpen} search={search} setSearch={setSearch} cartCount={cartCount} onCart={() => setCartOpen(true)} onLogin={openLogin} onAccount={onNavigateAccount} user={user} products={products} onProductClick={openProduct}/>
    <Hero heroImage={heroImage} heroMediaType={mediaConfig.heroMediaType}/>
    <section className="shop-section" id="shop">
      <div className="shop-head">
        <div>
          <p className="shop-title">Shop the collection</p>
          <p className="shop-sub">Browse by category.</p>
        </div>
      </div>
      <div className="category-grid">{filteredCategoryCards.map(category => <button key={category.name} className="category-card" onClick={() => openCategory(category.name)}><ProductImage src={category.image || FALLBACK_IMAGE} alt={category.name} /><div className="overlay"><div className="meta"><strong>{category.name}</strong><span>{category.count} items</span></div></div></button>)}</div>
      {filteredCategoryCards.length === 0 && <div style={{padding:"50px 0",textAlign:"center",color:colors.ink600}}>{normalizedSearch ? "No results match your search." : "No categories available."}</div>}
    </section>

    <section className="featured-section" style={{width:"100%",maxWidth:"1440px",margin:"auto",padding:"60px clamp(18px,5vw,70px) 80px"}}>
      <div className="featured-head" style={{marginBottom:"48px"}}>
        <p className="shop-title" style={{fontFamily:fontVoice,fontSize:"clamp(24px,3vw,34px)",fontWeight:600,margin:"0 0 4px"}}>Featured Collections</p>
        <p className="shop-sub" style={{fontSize:"13.5px",color:colors.ink600,margin:0}}>Explore our curated selections by category.</p>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:"72px"}}>
        {filteredCategoryCards.map((category) => {
          const categoryItems = category.items;
          const featuredItem = categoryItems[0];
          const relatedItems = categoryItems.slice(1);
          return (
            <div key={category.name} id={`category-${category.name}`} style={{display:"flex",flexDirection:"column"}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px",margin:"0 0 20px",justifyContent:"flex-start"}}>
                <p style={{fontSize:"clamp(18px,2.5vw,28px)",fontFamily:fontVoice,color:colors.oak600,textTransform:"uppercase",letterSpacing:"2px",fontWeight:700,margin:0,whiteSpace:"nowrap"}}>
                  {category.name}
                </p>
                <div style={{flex:1,height:"1px",background:colors.oak300}}></div>
              </div>
              
              <button 
                onClick={() => openCategory(category.name)}
                style={{border:"none",background:"transparent",padding:0,cursor:"pointer",marginBottom:"28px"}}
              >
                <div style={{width:"100%",height:"480px",background:colors.linen200,borderRadius:"8px",overflow:"hidden",marginBottom:"18px"}}>
                  {(mediaConfig.featuredMediaTypes?.[category.name] || "image") === "video" && mediaConfig.featuredImages[category.name] ? (
                    <video src={mediaConfig.featuredImages[category.name]} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} controls />
                  ) : (
                    <ProductImage src={mediaConfig.featuredImages[category.name] || featuredItem?.image || FALLBACK_IMAGE} alt={featuredItem?.name || category.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block",transition:"transform .3s"}}/>
                  )}
                </div>
                <p style={{fontSize:"14px",fontFamily:fontVoice,fontWeight:600,color:colors.ink900,margin:"0 0 6px",textAlign:"left"}}>
                  {featuredItem?.name || "Featured Item"}
                </p>
              </button>

              {relatedItems.length > 0 && (
                <div className="featured-related-grid">
                  {relatedItems.slice(0,16).map((item,i) => (
                    <button 
                      key={i}
                      onClick={() => openProduct(item.id)}
                      style={{border:"none",background:"transparent",padding:0,cursor:"pointer",textAlign:"left"}}
                    >
                      <div style={{width:"100%",height:"280px",background:colors.linen200,borderRadius:"6px",overflow:"hidden",marginBottom:"10px"}}>
                        <ProductImage src={item?.image || FALLBACK_IMAGE} alt={item?.name || "Item"} style={{width:"100%",height:"100%",objectFit:"cover",display:"block",transition:"transform .3s"}}/>
                      </div>
                      <p style={{fontSize:"13px",color:colors.ink900,margin:0,fontWeight:500,wordBreak:"break-word"}}>
                        {item?.name || "Item"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>

    <footer className="site-footer" id="footer"><p style={{margin:0}}>Grain House — handcrafted furniture. © 2026</p></footer>
    {cartNotice && <div className="cart-toast">{cartNotice}</div>}
    {cartOpen && <div className="cart-backdrop" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={e => e.stopPropagation()}><div className="cart-head"><h2>Your cart</h2><button onClick={() => setCartOpen(false)}><X size={19}/></button></div>{cart.length === 0 ? <div className="empty-cart"><ShoppingCart size={34}/><p>Your cart is empty.</p><span>Add furniture from the collection to get started.</span></div> : <><div className="cart-items">{cart.map(item => <div className="cart-item" key={item.id}><img src={item.image} alt={item.name}/><div className="cart-item-info"><strong>{item.name}</strong><span>{currency(item.price)}</span><div className="qty"><button onClick={() => changeQty(item.id, -1)}><Minus size={13}/></button><b>{item.qty}</b><button onClick={() => changeQty(item.id, 1)}><Plus size={13}/></button><button className="remove" onClick={() => changeQty(item.id, -item.qty)}><Trash2 size={13}/></button></div></div></div>)}</div><div className="cart-total"><span>Total</span><strong>{currency(cart.reduce((sum, item) => sum + item.price * item.qty, 0))}</strong></div><button className="checkout-btn" onClick={checkout}>Continue to checkout</button></>}</aside></div>}
    {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />}
  </div>;
}
