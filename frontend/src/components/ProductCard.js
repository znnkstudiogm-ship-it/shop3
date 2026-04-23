import { useEffect, useState } from "react";
import { useLocale } from "../context/LocaleContext";
import { translatePlain } from "../lib/translate";

export const ProductCard = ({ product, onOpen }) => {
  const { formatDiscountPair, lang, sourceLang, t } = useLocale();
  const [title, setTitle] = useState(product.title);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!lang || lang === sourceLang) {
        setTitle(product.title);
        return;
      }
      const tr = await translatePlain(product.title, sourceLang, lang);
      if (!cancelled) setTitle(tr);
    })();
    return () => { cancelled = true; };
  }, [product.title, lang, sourceLang]);

  const firstVariant = product?.variants?.[0];
  const pair = formatDiscountPair(firstVariant?.price);
  const img = product?.images?.[0]?.src;

  return (
    <button
      type="button"
      data-testid={`product-card-${product.id}`}
      onClick={() => onOpen(product)}
      className="group relative flex flex-col text-left bg-[#0d0d12] border border-white/5 overflow-hidden transition-all duration-500 hover:border-[#b026ff] hover:shadow-[0_0_32px_rgba(176,38,255,.28)] focus:outline-none focus:border-[#ff007f]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
        {img ? (
          <img
            src={img}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs tracking-widest">
            NO IMAGE
          </div>
        )}
        <span className="absolute top-3 left-3 bg-[#ff007f] text-black text-[10px] font-heading font-bold px-2 py-1 uppercase tracking-[0.2em] neon-border-pink">
          {t("modal.discountBadge")}
        </span>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-3 inset-x-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <span className="inline-flex items-center justify-center w-full py-2 text-[11px] font-heading font-bold uppercase tracking-[0.3em] text-white bg-black/60 backdrop-blur border border-white/20">
            {t("grid.viewProduct")}
          </span>
        </div>
      </div>
      <div className="p-5 text-center">
        <h3 className="font-heading font-bold text-[15px] text-white mb-2 line-clamp-2 min-h-[44px]">
          {title}
        </h3>
        {pair && (
          <div className="flex items-center justify-center gap-3">
            <span className="text-zinc-500 line-through text-xs font-body">{pair.original}</span>
            <span className="text-[#ff007f] font-heading font-bold text-base neon-text-pink">
              {pair.discounted}
            </span>
          </div>
        )}
      </div>
    </button>
  );
};
