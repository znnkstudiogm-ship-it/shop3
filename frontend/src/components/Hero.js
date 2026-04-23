import { ArrowRight } from "lucide-react";
import { useLocale } from "../context/LocaleContext";

const HERO_BG =
  "https://images.pexels.com/photos/1510610/pexels-photo-1510610.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=1920";

const scrollToProducts = () => {
  const el = document.getElementById("kolekcja");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

export const Hero = () => {
  const { t } = useLocale();
  return (
    <section
      data-testid="hero-section"
      className="relative min-h-[100vh] pt-16 flex items-center justify-center overflow-hidden"
    >
      <img
        src={HERO_BG}
        alt="Tokyo neon night"
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/70 via-[#050505]/50 to-[#050505]" />
      <div className="absolute inset-0 cyber-grid opacity-40" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        <span
          data-testid="hero-overline"
          className="rise text-[11px] tracking-[0.45em] uppercase text-[#00f0ff] font-body font-semibold mb-6 border border-[#00f0ff]/30 px-4 py-1"
        >
          {t("brand.tagline")}
        </span>

        <h1
          data-testid="hero-title"
          className="rise rise-d1 font-heading font-black tracking-tighter text-white text-5xl sm:text-6xl lg:text-7xl leading-[0.95] mb-6"
        >
          {t("hero.titleA")} <span className="text-[#ff007f] neon-text-pink">{t("hero.titleB")}</span>
          <br />
          {t("hero.titleC")} <span className="text-[#00f0ff] neon-text-cyan">{t("hero.titleD")}</span>
        </h1>

        <p
          data-testid="hero-subtitle"
          className="rise rise-d2 max-w-2xl text-zinc-300 text-base sm:text-lg font-body leading-relaxed mb-10"
        >
          {t("hero.subtitle")}
        </p>

        <div className="rise rise-d3 flex flex-col sm:flex-row items-center gap-4">
          <button
            type="button"
            data-testid="hero-shop-now-btn"
            onClick={scrollToProducts}
            className="sheen relative overflow-hidden inline-flex items-center gap-3 px-10 py-4 font-heading font-bold uppercase tracking-[0.25em] text-sm text-white bg-[#ff007f] cta-pulse hover:bg-[#ff1a8c] transition-colors"
          >
            {t("hero.cta")}
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#o-nas"
            data-testid="hero-learn-more"
            className="inline-flex items-center gap-3 px-8 py-4 font-heading font-semibold uppercase tracking-[0.25em] text-xs text-white/90 border border-white/20 hover:border-[#00f0ff] hover:text-[#00f0ff] hover:shadow-[0_0_20px_rgba(0,240,255,.25)] transition-all"
          >
            {t("hero.learnMore")}
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-white/40 font-body">
        {t("hero.scroll")} ↓
      </div>
    </section>
  );
};
