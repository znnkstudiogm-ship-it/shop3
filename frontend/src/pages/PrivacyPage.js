import { Link } from "react-router-dom";
import { useLocale } from "../context/LocaleContext";

export default function PrivacyPage() {
  const { t } = useLocale();
  const sections = [
    ["privacy.h1", "privacy.p1"],
    ["privacy.h2", "privacy.p2"],
    ["privacy.h3", "privacy.p3"],
    ["privacy.h4", "privacy.p4"],
    ["privacy.h5", "privacy.p5"],
  ];
  return (
    <main data-testid="privacy-page" className="pt-24 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        <Link
          to="/"
          className="text-xs uppercase tracking-[0.3em] text-[#00f0ff] hover:text-white font-body font-semibold"
        >
          ← {t("legal.back")}
        </Link>
        <h1 className="mt-6 font-heading font-black text-4xl sm:text-5xl tracking-tighter text-white">
          {t("privacy.title")}
        </h1>
        <div className="mt-10 space-y-6 text-zinc-300 font-body leading-relaxed">
          {sections.map(([h, p]) => (
            <section key={h}>
              <h2 className="font-heading font-bold text-xl text-white mb-3">{t(h)}</h2>
              <p>{t(p)}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
