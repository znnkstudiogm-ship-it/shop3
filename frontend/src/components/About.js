import { useLocale } from "../context/LocaleContext";

const ABOUT_BG =
  "https://images.unsplash.com/photo-1764178952804-92ed1d1957a1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHRvcmlpJTIwZ2F0ZSUyMG5lb258ZW58MHx8fHwxNzc2NzAwMjM2fDA&ixlib=rb-4.1.0&q=85";

export const About = () => {
  const { t } = useLocale();
  return (
    <section
      id="o-nas"
      data-testid="about-section"
      className="relative py-28 sm:py-36 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.18] mix-blend-screen bg-center bg-cover"
        style={{ backgroundImage: `url(${ABOUT_BG})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center flex flex-col items-center">
        <span className="text-[11px] tracking-[0.45em] uppercase text-[#ff007f] font-body font-semibold mb-8">
          {t("about.overline")}
        </span>

        <h2
          data-testid="about-tagline"
          className="font-heading font-black tracking-tighter text-4xl sm:text-5xl lg:text-6xl leading-[0.95] mb-10"
        >
          <span className="bg-gradient-to-r from-[#b026ff] via-[#ff007f] to-[#00f0ff] bg-clip-text text-transparent">
            {t("about.taglineA")}
          </span>
          <br />
          <span className="text-white neon-text-white">{t("about.taglineB")}</span>
        </h2>

        <p className="text-zinc-300 text-base sm:text-lg font-body leading-[1.85] mb-6">
          {t("about.p1")}
        </p>
        <p className="text-zinc-400 text-base sm:text-lg font-body leading-[1.85] mb-10">
          {t("about.p2")}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] tracking-[0.3em] uppercase font-body font-semibold">
          <span className="px-4 py-2 border border-[#b026ff]/50 text-[#b026ff]">{t("about.tag1")}</span>
          <span className="px-4 py-2 border border-[#00f0ff]/50 text-[#00f0ff]">{t("about.tag2")}</span>
          <span className="px-4 py-2 border border-[#ff007f]/50 text-[#ff007f]">{t("about.tag3")}</span>
        </div>
      </div>
    </section>
  );
};
