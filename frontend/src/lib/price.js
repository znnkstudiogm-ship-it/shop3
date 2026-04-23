// Shopify variant.price is { amount, currencyCode }
// We display Shopify price as the *discounted* price (-25%), and show
// the inflated "original" (shopifyPrice / 0.75) as crossed-out.

const CURRENCY_SYMBOLS = { USD: "$", EUR: "€", PLN: "zł", GBP: "£", JPY: "¥" };

export function formatMoney(amount, currencyCode = "USD") {
  const num = typeof amount === "string" ? parseFloat(amount) : Number(amount || 0);
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode + " ";
  const isSuffix = currencyCode === "PLN";
  const formatted = num.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isSuffix ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
}

export function getDiscountedPair(priceObj) {
  if (!priceObj) return null;
  const amount = typeof priceObj.amount === "string" ? parseFloat(priceObj.amount) : Number(priceObj.amount || 0);
  const currency = priceObj.currencyCode || "USD";
  const discounted = amount;
  const original = amount / 0.75; // -25% visual uplift
  return {
    original: formatMoney(original, currency),
    discounted: formatMoney(discounted, currency),
    currency,
  };
}
