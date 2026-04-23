import { useEffect } from "react";
import { X, Minus, Plus, Trash2, ArrowRight, Info } from "lucide-react";
import { useShopify } from "../context/ShopifyContext";
import { useLocale } from "../context/LocaleContext";

export const CartDrawer = () => {
  const { cartOpen, setCartOpen, checkout, updateLineItem, removeLineItem } = useShopify();
  const { t, formatPrice } = useLocale();

  useEffect(() => {
    if (cartOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  const items = checkout?.lineItems || [];
  const subtotal = checkout?.subtotalPrice
    ? formatPrice(checkout.subtotalPrice.amount, checkout.subtotalPrice.currencyCode)
    : formatPrice(0, "USD");

  const handleCheckout = () => {
    if (checkout?.webUrl) window.location.href = checkout.webUrl;
  };

  return (
    <>
      <div
        data-testid="cart-backdrop"
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity ${
          cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setCartOpen(false)}
      />
      <aside
        data-testid="cart-drawer"
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#050505]/98 backdrop-blur-2xl border-l border-[#00f0ff]/30 shadow-[-20px_0_50px_rgba(0,240,255,.15)] flex flex-col transition-transform duration-500 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
          <h2 className="font-heading font-black text-lg tracking-[0.25em] text-white neon-text-white">
            {t("cart.title")}
          </h2>
          <button
            type="button"
            data-testid="cart-close-btn"
            onClick={() => setCartOpen(false)}
            aria-label={t("cart.close")}
            className="w-10 h-10 inline-flex items-center justify-center border border-white/15 hover:border-[#ff007f] hover:text-[#ff007f] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div
              data-testid="cart-empty"
              className="flex flex-col items-center justify-center text-center h-full gap-3"
            >
              <div className="w-14 h-14 border border-white/15 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-zinc-500" />
              </div>
              <p className="text-zinc-400 font-body">{t("cart.empty")}</p>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="mt-2 px-5 py-2 border border-white/20 text-xs uppercase tracking-widest font-heading font-bold hover:border-[#00f0ff] hover:text-[#00f0ff]"
              >
                {t("cart.backToShop")}
              </button>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((li) => {
                const img = li.variant?.image?.src;
                const price = li.variant?.price;
                const lineTotal = price
                  ? formatPrice(parseFloat(price.amount) * li.quantity, price.currencyCode)
                  : "";
                return (
                  <li
                    key={li.id}
                    data-testid={`cart-line-${li.id}`}
                    className="flex gap-4 border border-white/5 p-3"
                  >
                    <div className="w-20 h-24 bg-zinc-900 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {img && <img src={img} alt="" className="max-w-full max-h-full object-contain" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-bold text-sm text-white truncate">
                        {li.title}
                      </h4>
                      <p className="text-xs text-zinc-500 truncate mb-2">
                        {li.variant?.title !== "Default Title" ? li.variant?.title : ""}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center border border-white/15">
                          <button
                            type="button"
                            data-testid={`cart-dec-${li.id}`}
                            onClick={() => updateLineItem(li.id, Math.max(1, li.quantity - 1))}
                            className="w-7 h-8 inline-flex items-center justify-center text-zinc-300 hover:text-[#ff007f]"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold">{li.quantity}</span>
                          <button
                            type="button"
                            data-testid={`cart-inc-${li.id}`}
                            onClick={() => updateLineItem(li.id, li.quantity + 1)}
                            className="w-7 h-8 inline-flex items-center justify-center text-zinc-300 hover:text-[#00f0ff]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-heading font-bold text-[#ff007f] text-sm neon-text-pink">
                          {lineTotal}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      data-testid={`cart-remove-${li.id}`}
                      onClick={() => removeLineItem(li.id)}
                      aria-label={t("cart.remove")}
                      className="w-8 h-8 inline-flex items-center justify-center text-zinc-500 hover:text-[#ff007f]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.3em] text-zinc-400 font-body">
                {t("cart.subtotal")}
              </span>
              <span
                data-testid="cart-subtotal"
                className="font-heading font-black text-2xl text-white neon-text-white"
              >
                {subtotal}
              </span>
            </div>
            <button
              type="button"
              data-testid="cart-checkout-btn"
              onClick={handleCheckout}
              className="sheen relative overflow-hidden w-full inline-flex items-center justify-center gap-2 h-12 bg-[#00f0ff] text-black font-heading font-black uppercase tracking-[0.3em] text-xs hover:bg-[#5ef7ff] hover:shadow-[0_0_30px_rgba(0,240,255,.6)] transition-all"
            >
              {t("cart.checkout")}
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-zinc-500 text-center tracking-wider">
              {t("cart.taxesNote")}
            </p>
            <div
              data-testid="cart-fx-note"
              className="flex items-start gap-2 text-[10px] text-zinc-500 leading-relaxed border-t border-white/5 pt-3 mt-1"
            >
              <Info className="w-3 h-3 flex-shrink-0 mt-[1px] text-[#00f0ff]/60" />
              <span>{t("cart.fxNote")}</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
