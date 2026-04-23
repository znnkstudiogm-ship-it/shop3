import { useEffect, useMemo, useState } from "react";
import { X, Minus, Plus, ShoppingBag, Loader2 } from "lucide-react";
import { useShopify } from "../context/ShopifyContext";
import { useLocale } from "../context/LocaleContext";
import { translatePlain, translateHtml } from "../lib/translate";

export const ProductModal = ({ product, onClose }) => {
  const { addLineItem } = useShopify();
  const { t, formatDiscountPair, lang, sourceLang } = useLocale();
  const [activeImg, setActiveImg] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState(product?.title || "");
  const [translatedDesc, setTranslatedDesc] = useState(product?.descriptionHtml || "");
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImg(0);
      setQty(1);
      const defaults = {};
      (product.options || []).forEach((o) => {
        defaults[o.name] = o.values?.[0]?.value;
      });
      setSelectedOptions(defaults);
      setTranslatedTitle(product.title);
      setTranslatedDesc(product.descriptionHtml || "");
    }
  }, [product]);

  // Translate title + description
  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    (async () => {
      if (!lang || lang === sourceLang) {
        setTranslatedTitle(product.title);
        setTranslatedDesc(product.descriptionHtml || "");
        return;
      }
      setTranslating(true);
      try {
        const [tt, td] = await Promise.all([
          translatePlain(product.title, sourceLang, lang),
          translateHtml(product.descriptionHtml || "", sourceLang, lang),
        ]);
        if (!cancelled) {
          setTranslatedTitle(tt);
          setTranslatedDesc(td);
        }
      } finally {
        if (!cancelled) setTranslating(false);
      }
    })();
    return () => { cancelled = true; };
  }, [product, lang, sourceLang]);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    if (product) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onEsc);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [product, onClose]);

  const matchedVariant = useMemo(() => {
    if (!product) return null;
    return (
      product.variants.find((v) =>
        v.selectedOptions.every((o) => selectedOptions[o.name] === o.value)
      ) || product.variants[0]
    );
  }, [product, selectedOptions]);

  if (!product) return null;

  const pair = formatDiscountPair(matchedVariant?.price);
  const images = product.images || [];

  const handleAdd = async () => {
    if (!matchedVariant || !matchedVariant.available) return;
    setAdding(true);
    try {
      await addLineItem(matchedVariant.id, qty);
      onClose();
    } finally {
      setAdding(false);
    }
  };

  const labelMap = {
    Color: t("modal.color"), Colour: t("modal.color"), Kolor: t("modal.color"),
    Size: t("modal.size"), Rozmiar: t("modal.size"),
  };

  return (
    <div
      data-testid="product-modal"
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain"
    >
      <div
        data-testid="product-modal-backdrop"
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />
      <button
        type="button"
        data-testid="product-modal-close"
        onClick={onClose}
        aria-label={t("modal.close")}
        className="fixed top-4 right-4 z-[60] w-11 h-11 inline-flex items-center justify-center border border-white/25 bg-black/80 backdrop-blur hover:border-[#ff007f] hover:text-[#ff007f] transition-colors shadow-[0_0_20px_rgba(0,0,0,.6)]"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="relative z-10 w-full max-w-5xl mx-auto my-8 px-3 sm:px-6">
        <div className="bg-[#0a0a10] border border-[#b026ff]/40 shadow-[0_0_40px_rgba(176,38,255,.25)]">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Gallery */}
            <div className="bg-zinc-950 p-4 sm:p-6">
              <div className="w-full max-h-[70vh] min-h-[320px] flex items-center justify-center border border-white/10 bg-zinc-950 overflow-hidden">
                {images[activeImg] ? (
                  <img
                    src={images[activeImg].src}
                    alt={translatedTitle}
                    className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
                    style={{ imageOrientation: "from-image" }}
                  />
                ) : (
                  <div className="text-zinc-700">no image</div>
                )}
              </div>
              {images.length > 1 && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {images.slice(0, 5).map((im, i) => (
                    <button
                      key={im.id || i}
                      type="button"
                      data-testid={`product-thumb-${i}`}
                      onClick={() => setActiveImg(i)}
                      className={`aspect-square overflow-hidden border transition-all bg-zinc-900 flex items-center justify-center ${
                        activeImg === i
                          ? "border-[#ff007f] shadow-[0_0_14px_rgba(255,0,127,.5)]"
                          : "border-white/10 hover:border-white/40"
                      }`}
                    >
                      <img
                        src={im.src}
                        alt=""
                        className="max-w-full max-h-full w-auto h-auto object-contain"
                        style={{ imageOrientation: "from-image" }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6 sm:p-10 flex flex-col">
              <h3
                data-testid="product-modal-title"
                className="font-heading font-black text-2xl sm:text-3xl text-white mb-4 leading-tight"
              >
                {translatedTitle}
              </h3>

              {pair && (
                <div className="flex items-baseline gap-3 mb-6 flex-wrap">
                  <span className="text-zinc-500 line-through font-body">{pair.original}</span>
                  <span
                    data-testid="product-modal-price"
                    className="text-[#ff007f] font-heading font-bold text-2xl neon-text-pink"
                  >
                    {pair.discounted}
                  </span>
                  <span className="text-[10px] font-heading font-bold uppercase tracking-widest bg-[#ff007f] text-black px-2 py-0.5">
                    {t("modal.discountBadge")}
                  </span>
                </div>
              )}

              {translating && (
                <div className="flex items-center gap-2 text-xs text-[#00f0ff] font-body uppercase tracking-wider mb-4">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {t("modal.translating")}
                </div>
              )}

              {translatedDesc ? (
                <div
                  data-testid="product-modal-description"
                  className="prose prose-invert prose-sm max-w-none font-body text-zinc-300 leading-relaxed mb-6 product-desc"
                  dangerouslySetInnerHTML={{ __html: translatedDesc }}
                />
              ) : (
                <p className="text-zinc-400 text-sm mb-6">{product.description}</p>
              )}

              {(product.options || []).map((opt) =>
                opt.values && opt.values.length > 0 && opt.name !== "Title" ? (
                  <div key={opt.name} className="mb-5">
                    <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-400 font-body font-semibold mb-2">
                      {labelMap[opt.name] || opt.name}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((v) => {
                        const val = v.value;
                        const active = selectedOptions[opt.name] === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            data-testid={`option-${opt.name}-${val}`}
                            onClick={() =>
                              setSelectedOptions((s) => ({ ...s, [opt.name]: val }))
                            }
                            className={`px-4 py-2 text-xs font-heading font-bold uppercase tracking-widest border transition-all ${
                              active
                                ? "border-[#00f0ff] text-[#00f0ff] shadow-[0_0_14px_rgba(0,240,255,.4)]"
                                : "border-white/20 text-zinc-300 hover:border-white/60"
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null
              )}

              <div className="flex items-center gap-4 mt-auto pt-4">
                <div className="inline-flex items-center border border-white/15">
                  <button
                    type="button"
                    data-testid="qty-minus"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-12 inline-flex items-center justify-center text-zinc-300 hover:text-[#ff007f]"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span
                    data-testid="qty-value"
                    className="w-10 text-center font-heading font-bold text-white"
                  >
                    {qty}
                  </span>
                  <button
                    type="button"
                    data-testid="qty-plus"
                    onClick={() => setQty((q) => q + 1)}
                    className="w-10 h-12 inline-flex items-center justify-center text-zinc-300 hover:text-[#00f0ff]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  data-testid="product-modal-add-to-cart"
                  onClick={handleAdd}
                  disabled={adding || !matchedVariant?.available}
                  className="flex-1 sheen relative overflow-hidden inline-flex items-center justify-center gap-2 h-12 px-6 bg-[#ff007f] text-white font-heading font-bold uppercase tracking-[0.25em] text-xs hover:bg-[#ff1a8c] disabled:opacity-40 disabled:cursor-not-allowed cta-pulse"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {adding
                    ? t("modal.adding")
                    : matchedVariant?.available
                    ? t("modal.addToCart")
                    : t("modal.unavailable")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
