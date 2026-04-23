import { useState } from "react";
import { toast } from "sonner";
import { useLocale } from "../context/LocaleContext";

export const Newsletter = () => {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error(t("newsletter.error"));
      return;
    }
    setSending(true);
    setTimeout(() => {
      toast.success(t("newsletter.success"));
      setEmail("");
      setSending(false);
    }, 600);
  };

  return (
    <section
      data-testid="newsletter-section"
      className="py-24 border-t border-white/10"
    >
      <div className="max-w-xl mx-auto px-6 text-center">
        <span className="text-[11px] tracking-[0.45em] uppercase text-[#ff007f] font-body font-semibold">
          {t("newsletter.overline")}
        </span>
        <h3 className="mt-4 font-heading font-black text-2xl sm:text-3xl tracking-tight">
          {t("newsletter.titleA")} <span className="text-[#b026ff] neon-text-pink">{t("newsletter.titleB")}</span>
        </h3>
        <p className="mt-3 text-zinc-400 font-body">{t("newsletter.subtitle")}</p>

        <form
          onSubmit={onSubmit}
          data-testid="newsletter-form"
          className="mt-8 flex flex-col sm:flex-row gap-3"
        >
          <input
            type="email"
            required
            data-testid="newsletter-email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("newsletter.placeholder")}
            className="flex-1 bg-transparent border border-white/15 px-4 py-3 font-body text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#ff007f] focus:shadow-[0_0_18px_rgba(255,0,127,.25)] transition-all"
          />
          <button
            type="submit"
            data-testid="newsletter-submit-btn"
            disabled={sending}
            className="sheen relative overflow-hidden px-6 py-3 bg-[#b026ff] text-white font-heading font-bold uppercase tracking-[0.25em] text-xs hover:bg-[#c04cff] disabled:opacity-50"
          >
            {sending ? "..." : t("newsletter.submit")}
          </button>
        </form>
      </div>
    </section>
  );
};
