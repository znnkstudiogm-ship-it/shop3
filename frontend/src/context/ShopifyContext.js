import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import Client from "shopify-buy";
import { SHOPIFY_DOMAIN, SHOPIFY_STOREFRONT_TOKEN, PRODUCT_IDS, toGid } from "../lib/products";

const ShopifyCtx = createContext(null);

export const useShopify = () => {
  const ctx = useContext(ShopifyCtx);
  if (!ctx) throw new Error("useShopify must be used inside ShopifyProvider");
  return ctx;
};

export function ShopifyProvider({ children }) {
  const client = useMemo(
    () =>
      Client.buildClient({
        domain: SHOPIFY_DOMAIN,
        storefrontAccessToken: SHOPIFY_STOREFRONT_TOKEN,
        apiVersion: "2024-07",
      }),
    []
  );

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  // Fetch products
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const results = await Promise.all(
          PRODUCT_IDS.map(async (id) => {
            try {
              const p = await client.product.fetch(toGid(id));
              return p;
            } catch (e) {
              console.warn("Product fetch failed", id, e);
              return null;
            }
          })
        );
        if (!cancelled) {
          setProducts(results.filter(Boolean));
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  // Create/restore checkout (cart)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const existing = localStorage.getItem("znnk_checkout_id");
        let co = null;
        if (existing) {
          try {
            co = await client.checkout.fetch(existing);
            if (co && co.completedAt) co = null;
          } catch {
            co = null;
          }
        }
        if (!co) {
          co = await client.checkout.create();
        }
        if (!cancelled && co) {
          localStorage.setItem("znnk_checkout_id", co.id);
          setCheckout(co);
        }
      } catch (e) {
        console.error("Checkout init error", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client]);

  const addLineItem = useCallback(
    async (variantId, quantity = 1) => {
      if (!checkout) return;
      const updated = await client.checkout.addLineItems(checkout.id, [
        { variantId, quantity },
      ]);
      setCheckout(updated);
      setCartOpen(true);
    },
    [checkout, client]
  );

  const updateLineItem = useCallback(
    async (lineItemId, quantity) => {
      if (!checkout) return;
      const updated = await client.checkout.updateLineItems(checkout.id, [
        { id: lineItemId, quantity },
      ]);
      setCheckout(updated);
    },
    [checkout, client]
  );

  const removeLineItem = useCallback(
    async (lineItemId) => {
      if (!checkout) return;
      const updated = await client.checkout.removeLineItems(checkout.id, [lineItemId]);
      setCheckout(updated);
    },
    [checkout, client]
  );

  const value = useMemo(
    () => ({
      client,
      products,
      loading,
      error,
      checkout,
      cartOpen,
      setCartOpen,
      addLineItem,
      updateLineItem,
      removeLineItem,
    }),
    [client, products, loading, error, checkout, cartOpen, addLineItem, updateLineItem, removeLineItem]
  );

  return <ShopifyCtx.Provider value={value}>{children}</ShopifyCtx.Provider>;
}
