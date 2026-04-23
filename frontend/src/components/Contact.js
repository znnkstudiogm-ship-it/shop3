import { Mail } from "lucide-react";
import { useLocale } from "../context/LocaleContext";

export const Contact = () => {
  const { t } = useLocale();
  const email = "znnkstudio.gm@gmail.com";
  return (
    <section
      id="kontakt"
      data-testid="contact-section"
      className="py-24 sm:py-32 border-t border-white/10 scroll-mt-20"
    >
      <div className="max-w-3xl mx-auto px-6 text-center flex flex-col items-center">
        <span className="text-[11px] tracking-[0.45em] uppercase text-[#00f0ff] font-body font-semibold mb-6">
          {t("contact.overline")}
        </span>
        <h2 className="font-heading font-black tracking-tighter text-3xl sm:text-5xl text-white mb-8">
          {t("contact.title")}
        </h2>
        <p className="text-zinc-400 font-body max-w-xl mb-10 leading-relaxed">
          {t("contact.lead")}
        </p>

        <a
          href={`mailto:${email}`}
          data-testid="contact-mailto-btn"
          className="group inline-flex items-center gap-3 font-heading font-black text-xl sm:text-3xl tracking-tight text-[#00f0ff] hover:text-white hover:drop-shadow-[0_0_20px_rgba(0,240,255,.8)] transition-all break-all"
        >
          <Mail className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform flex-shrink-0" />
          {email}
        </a>
      </div>
    </section>
  );
};
