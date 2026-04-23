import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { STRINGS, SOURCE_LANG } from "../i18n/translations";
import { COUNTRY_MAP, RTL_LANGS, CURRENCY_SYMBOLS } from "../i18n/countries";
import { translateUiDict } from "../lib/translate";

const LocaleCtx = createContext(null);

export const useLocale = () => {
  const ctx = useContext(LocaleCtx);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
};

const LS_PREFS = "znnk_locale_prefs";

// Shopify prices from this store are in USD (store default currency). We convert client-side.
const SHOPIFY_BASE_CURRENCY = "USD";

function getStoredPrefs() {
  try { return JSON.parse(localStorage.getItem(LS_PREFS) || "{}"); } catch { return {}; }
}
function setStoredPrefs(p) {
  try { localStorage.setItem(LS_PREFS, JSON.stringify(p)); } catch { /* ignore */ }
}

async function fetchIpLocation() {
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 3500);
    const r = await fetch("https://ipapi.co/json/", { signal: c.signal });
    clearTimeout(t);
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

async function fetchRates(base = "USD") {
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 5000);
    const r = await fetch(`https://open.er-api.com/v6/latest/${base}`, { signal: c.signal });
    clearTimeout(t);
    if (!r.ok) return null;
    const j = await r.json();
    if (j?.result === "success" && j.rates) return j.rates;
    return null;
  } catch {
    return null;
  }
}

export function LocaleProvider({ children }) {
  const prefs = useRef(getStoredPrefs());
  const [lang, setLangState] = useState(prefs.current.lang || null);
  const [currency, setCurrencyState] = useState(prefs.current.currency || null);
  const [autoLang, setAutoLang] = useState(!prefs.current.lang);
  const [autoCurrency, setAutoCurrency] = useState(!prefs.current.currency);
  const [country, setCountry] = useState(null);
  const [rates, setRates] = useState(null);
  const [uiDict, setUiDict] = useState(STRINGS[SOURCE_LANG]);
  const [translating, setTranslating] = useState(false);

  // Auto-detect locale
  useEffect(() => {
    (async () => {
      let detectedLang = null, detectedCurrency = null, detectedCountry = null;
      const loc = await fetchIpLocation();
      if (loc && loc.country_code) {
        detectedCountry = loc.country_code;
        const m = COUNTRY_MAP[loc.country_code];
        if (m) { detectedLang = m.lang; detectedCurrency = m.currency; }
        if (loc.currency && !detectedCurrency) detectedCurrency = loc.currency;
        if (loc.languages && !detectedLang) detectedLang = String(loc.languages).split(",")[0].split("-")[0];
      }
      if (!detectedLang) {
        const nav = (navigator.language || "en").split("-");
        detectedLang = nav[0];
        const region = nav[1];
        if (region && COUNTRY_MAP[region]) {
          if (!detectedCurrency) detectedCurrency = COUNTRY_MAP[region].currency;
          if (!detectedCountry) detectedCountry = region;
        }
      }
      if (!detectedCurrency) detectedCurrency = "USD";
      setCountry(detectedCountry);

      const stored = getStoredPrefs();
      const finalLang = stored.lang || detectedLang || "en";
      const finalCurrency = stored.currency || detectedCurrency;
      setLangState(finalLang);
      setCurrencyState(finalCurrency);
    })();
  }, []);

  // Fetch rates
  useEffect(() => {
    (async () => {
      const r = await fetchRates(SHOPIFY_BASE_CURRENCY);
      if (r) setRates(r);
    })();
  }, []);

  // Load / translate UI dictionary for current lang
  useEffect(() => {
    if (!lang) return;
    let cancelled = false;
    (async () => {
      if (STRINGS[lang]) {
        if (!cancelled) setUiDict(STRINGS[lang]);
        return;
      }
      setTranslating(true);
      try {
        const dict = await translateUiDict(STRINGS.en, "en", lang);
        if (!cancelled) setUiDict(dict);
      } finally {
        if (!cancelled) setTranslating(false);
      }
    })();
    return () => { cancelled = true; };
  }, [lang]);

  // Apply dir + lang on <html>
  useEffect(() => {
    if (!lang) return;
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.has(lang) ? "rtl" : "ltr";
  }, [lang]);

  const t = useCallback(
    (key) => (uiDict && uiDict[key]) || STRINGS[SOURCE_LANG][key] || key,
    [uiDict]
  );

  const setLang = useCallback((newLang) => {
    if (newLang === null) {
      // switch to auto
      setAutoLang(true);
      const p = getStoredPrefs(); delete p.lang; setStoredPrefs(p);
      (async () => {
        const loc = await fetchIpLocation();
        const nav = (navigator.language || "en").split("-")[0];
        const det = (loc && loc.country_code && COUNTRY_MAP[loc.country_code]?.lang) || nav;
        setLangState(det);
      })();
    } else {
      setAutoLang(false);
      setLangState(newLang);
      setStoredPrefs({ ...getStoredPrefs(), lang: newLang });
    }
  }, []);

  const setCurrency = useCallback((newCur) => {
    if (newCur === null) {
      setAutoCurrency(true);
      const p = getStoredPrefs(); delete p.currency; setStoredPrefs(p);
      (async () => {
        const loc = await fetchIpLocation();
        const det = (loc && loc.country_code && COUNTRY_MAP[loc.country_code]?.currency) || loc?.currency || "USD";
        setCurrencyState(det);
      })();
    } else {
      setAutoCurrency(false);
      setCurrencyState(newCur);
      setStoredPrefs({ ...getStoredPrefs(), currency: newCur });
    }
  }, []);

  // Convert amount from Shopify base -> target currency
  const convert = useCallback(
    (amount, fromCur = SHOPIFY_BASE_CURRENCY) => {
      const n = typeof amount === "string" ? parseFloat(amount) : Number(amount || 0);
      if (!currency || !rates) return { amount: n, currency: fromCur };
      if (currency === fromCur) return { amount: n, currency };
      const rateTarget = rates[currency];
      const rateFrom = fromCur === SHOPIFY_BASE_CURRENCY ? 1 : rates[fromCur];
      if (!rateTarget || !rateFrom) return { amount: n, currency: fromCur };
      const usd = n / rateFrom;
      return { amount: usd * rateTarget, currency };
    },
    [currency, rates]
  );

  const formatPrice = useCallback(
    (amount, fromCur = SHOPIFY_BASE_CURRENCY) => {
      const { amount: a, currency: cur } = convert(amount, fromCur);
      const zeroDecimal = ["JPY", "KRW", "VND", "IDR", "HUF", "CLP", "ISK"].includes(cur);
      try {
        return new Intl.NumberFormat(lang || "en", {
          style: "currency",
          currency: cur,
          minimumFractionDigits: zeroDecimal ? 0 : 2,
          maximumFractionDigits: zeroDecimal ? 0 : 2,
        }).format(a);
      } catch {
        const symbol = CURRENCY_SYMBOLS[cur] || cur + " ";
        const n = a.toLocaleString(lang || "en", {
          minimumFractionDigits: zeroDecimal ? 0 : 2,
          maximumFractionDigits: zeroDecimal ? 0 : 2,
        });
        return `${symbol}${n}`;
      }
    },
    [convert, lang]
  );

  const formatDiscountPair = useCallback(
    (priceObj) => {
      if (!priceObj) return null;
      const amt = typeof priceObj.amount === "string" ? parseFloat(priceObj.amount) : Number(priceObj.amount || 0);
      const fromCur = priceObj.currencyCode || SHOPIFY_BASE_CURRENCY;
      const original = formatPrice(amt / 0.75, fromCur);
      const discounted = formatPrice(amt, fromCur);
      return { original, discounted };
    },
    [formatPrice]
  );

  const value = useMemo(
    () => ({
      lang,
      currency,
      country,
      autoLang,
      autoCurrency,
      translating,
      setLang,
      setCurrency,
      t,
      formatPrice,
      formatDiscountPair,
      isRtl: RTL_LANGS.has(lang),
      sourceLang: SOURCE_LANG,
    }),
    [lang, currency, country, autoLang, autoCurrency, translating, setLang, setCurrency, t, formatPrice, formatDiscountPair]
  );

  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}
