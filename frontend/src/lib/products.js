// Unique Shopify product IDs (duplicates removed). Order matches the client-provided embed list.
export const SHOPIFY_DOMAIN = "mharuw-id.myshopify.com";
export const SHOPIFY_STOREFRONT_TOKEN = "e46cc398c54d20784f2c236cd471f4aa";

export const PRODUCT_IDS = [
  "15316700234114",
  "15309964706178",
  "15308442632578",
  "15308441747842",
  "15308440994178",
  "15308439552386",
  "15308442403202",
  "15308442960258",
  "15308439847298",
];

// Convert legacy numeric ID to Storefront GID used by Shopify JS Buy SDK
export const toGid = (id) => btoa(`gid://shopify/Product/${id}`);
