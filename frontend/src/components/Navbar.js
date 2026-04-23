import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useShopify } from "../context/ShopifyContext";
import { useLocale } from "../context/LocaleContext";
import { LocaleSwitcher } from "./LocaleSwitcher";

export const Navbar = () => {
  const { checkout, setCartOpen } = useShopify();
  const { t } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);

  const itemCount = checkout?.lineItems?.reduce((n, li) => n + li.quantity, 0) || 0;

  const links = [
    { href: "#kolekcja", label: t("nav.collection") },
    { href: "#o-nas", label: t("nav.about") },
    { href: "#kontakt", label: t("nav.contact") },
  ];

  return (
    <header
      data-testid="navbar"
      className="fixed top-0 inset-x-0 z-40 backdrop-blur-xl bg-[#050505]/75 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          data-testid="brand-link"
          className="font-heading font-black text-xl tracking-[0.18em] text-white neon-text-white"
          onClick={() => setMobileOpen(false)}
        >
          ZNNK<span className="text-[#ff007f]">.</span>STUDIO
        </Link>

        <nav className="hidden md:flex items-center gap-10 font-body text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-300">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-testid={`nav-${l.href.replace("#", "")}`}
              className="hover:text-[#00f0ff] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LocaleSwitcher />
          <button
            type="button"
            data-testid="open-cart-btn"
            onClick={() => setCartOpen(true)}
            className="relative inline-flex items-center justify-center w-10 h-10 border border-white/15 hover:border-[#ff007f] hover:shadow-[0_0_18px_rgba(255,0,127,.45)] transition-all"
            aria-label={t("nav.openCart")}
          >
            <ShoppingBag className="w-4 h-4" />
            {itemCount > 0 && (
              <span
                data-testid="cart-count-badge"
                className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 text-[10px] font-bold bg-[#ff007f] text-black flex items-center justify-center neon-border-pink"
              >
                {itemCount}
              </span>
            )}
          </button>
          <button
            type="button"
            data-testid="mobile-menu-toggle"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 border border-white/15"
            aria-label={t("nav.menu")}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#050505]/95 backdrop-blur-xl">
          <nav className="flex flex-col items-center py-6 gap-4 font-body text-sm uppercase tracking-[0.25em]">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                data-testid={`mobile-nav-${l.href.replace("#", "")}`}
                onClick={() => setMobileOpen(false)}
                className="text-zinc-300 hover:text-[#00f0ff]"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
