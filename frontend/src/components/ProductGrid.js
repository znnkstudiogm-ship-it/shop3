import { useState } from "react";
import { useShopify } from "../context/ShopifyContext";
import { useLocale } from "../context/LocaleContext";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";

export const ProductGrid = () => {
  const { products, loading } = useShopify();
  const { t } = useLocale();
  const [active, setActive] = useState(null);

  return (
    <section
      id="kolekcja"
      data-testid="product-grid-section"
      className="relative py-24 sm:py-32 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[11px] tracking-[0.45em] uppercase text-[#00f0ff] font-body font-semibold">
            {t("grid.overline")}
          </span>
          <h2 className="mt-4 font-heading font-black tracking-tighter text-4xl sm:text-5xl text-white">
            {t("grid.title")} <span className="text-[#ff007f] neon-text-pink">{t("grid.titleAccent")}</span>
          </h2>
          <p className="mt-4 text-zinc-400 font-body max-w-xl mx-auto">{t("grid.subtitle")}</p>
        </div>

        {loading && (
          <div
            data-testid="products-loading"
            className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 max-w-6xl mx-auto"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] bg-[#0d0d12] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div
            data-testid="products-empty"
            className="text-center text-zinc-400 py-16 border border-white/10"
          >
            {t("grid.empty")}
          </div>
        )}

        {!loading && products.length > 0 && (
          <div
            data-testid="product-grid"
            className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 max-w-6xl mx-auto justify-items-stretch"
          >
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={setActive} />
            ))}
          </div>
        )}
      </div>

      <ProductModal product={active} onClose={() => setActive(null)} />
    </section>
  );
};
