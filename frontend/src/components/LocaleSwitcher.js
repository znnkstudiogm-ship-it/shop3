import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLocale } from "../context/LocaleContext";
import { LANGUAGE_OPTIONS, CURRENCY_OPTIONS } from "../i18n/countries";

export const LocaleSwitcher = () => {
  const { lang, currency, autoLang, autoCurrency, setLang, setCurrency, t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const langLabel = LANGUAGE_OPTIONS.find((l) => l.code === lang)?.label || lang?.toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        data-testid="locale-switcher-btn"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 h-10 px-3 border border-white/15 hover:border-[#00f0ff] hover:text-[#00f0ff] transition-colors text-[11px] font-heading font-bold uppercase tracking-[0.18em]"
        aria-label="Language and currency"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{(lang || "en").toUpperCase()}</span>
        <span className="hidden sm:inline text-zinc-500">·</span>
        <span className="hidden sm:inline">{currency || ""}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          data-testid="locale-switcher-panel"
          className="absolute right-0 mt-2 w-[min(92vw,340px)] bg-[#0a0a10]/98 backdrop-blur-xl border border-[#b026ff]/30 shadow-[0_0_30px_rgba(176,38,255,.25)] z-50 p-4"
        >
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-body font-semibold">
                {t("locale.language")}
              </span>
              <button
                type="button"
                data-testid="locale-auto-lang"
                onClick={() => setLang(null)}
                className={`text-[10px] uppercase tracking-widest font-body font-semibold transition-colors ${
                  autoLang ? "text-[#00f0ff]" : "text-zinc-500 hover:text-[#00f0ff]"
                }`}
              >
                {t("locale.auto")} {autoLang && <Check className="inline w-3 h-3" />}
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto grid grid-cols-2 gap-1">
              {LANGUAGE_OPTIONS.map((o) => (
                <button
                  key={o.code}
                  type="button"
                  data-testid={`locale-lang-${o.code}`}
                  onClick={() => { setLang(o.code); setOpen(false); }}
                  className={`flex items-center gap-2 px-2 py-2 text-xs font-body text-left transition-colors border ${
                    lang === o.code
                      ? "border-[#ff007f] text-white bg-[#ff007f]/10"
                      : "border-transparent text-zinc-300 hover:text-white hover:border-white/20"
                  }`}
                >
                  <span className="text-base leading-none">{o.flag}</span>
                  <span className="truncate">{o.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-body font-semibold">
                {t("locale.currency")}
              </span>
              <button
                type="button"
                data-testid="locale-auto-cur"
                onClick={() => setCurrency(null)}
                className={`text-[10px] uppercase tracking-widest font-body font-semibold transition-colors ${
                  autoCurrency ? "text-[#00f0ff]" : "text-zinc-500 hover:text-[#00f0ff]"
                }`}
              >
                {t("locale.auto")} {autoCurrency && <Check className="inline w-3 h-3" />}
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto grid grid-cols-3 gap-1">
              {CURRENCY_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  data-testid={`locale-cur-${c}`}
                  onClick={() => { setCurrency(c); setOpen(false); }}
                  className={`px-2 py-2 text-[11px] font-heading font-bold tracking-wider transition-colors border ${
                    currency === c
                      ? "border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/5"
                      : "border-transparent text-zinc-300 hover:text-white hover:border-white/20"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
