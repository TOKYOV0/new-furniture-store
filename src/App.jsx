import React, { useEffect, useState } from "react";
import FurnitureAdminApp from "./FurnitureAdmin";
import FurnitureStore from "./FurnitureStore";

export default function App() {
  const [path, setPath] = useState(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (nextPath) => {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  };

  if (path.startsWith("/admin")) {
    return <FurnitureAdminApp onNavigateHome={() => navigate("/")} />;
  }

  if (path.startsWith("/category/")) {
    const categoryName = decodeURIComponent(path.replace("/category/", ""));
    return (
      <FurnitureStore
        onNavigateAdmin={() => navigate("/admin")}
        onNavigateHome={() => navigate("/")}
        onNavigateProduct={(id) => navigate(`/product/${id}`)}
        onNavigateCategory={(name) => navigate(`/category/${encodeURIComponent(name)}`)}
        selectedCategoryName={categoryName}
      />
    );
  }

  if (path.startsWith("/product/")) {
    const productId = path.replace("/product/", "");
    return (
      <FurnitureStore
        onNavigateAdmin={() => navigate("/admin")}
        onNavigateHome={() => navigate("/")}
        onNavigateProduct={(id) => navigate(`/product/${id}`)}
        onNavigateCategory={(name) => navigate(`/category/${encodeURIComponent(name)}`)}
        selectedProductId={productId}
      />
    );
  }

  return (
    <FurnitureStore
      onNavigateAdmin={() => navigate("/admin")}
      onNavigateHome={() => navigate("/")}
      onNavigateProduct={(id) => navigate(`/product/${id}`)}
      onNavigateCategory={(name) => navigate(`/category/${encodeURIComponent(name)}`)}
    />
  );
}
