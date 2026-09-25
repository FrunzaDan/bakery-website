export const PRODUCT_CATEGORIES = [
  'bakeries',
  'pastry',
  'sweets',
  'basic_products',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_CATEGORY_LABELS: Readonly<
  Record<ProductCategory, string>
> = {
  bakeries: 'Cofetărie',
  pastry: 'Patiserie',
  sweets: 'Torturi',
  basic_products: 'Produse de bază',
};

/** Most catalog products are sold one at a time; nobody orders 100 croissants online. */
export const MAX_QUANTITY_PER_PRODUCT = 99;

/**
 * A catalog product. Prices are in RON, `gramaj` (weight) is in grams.
 * `ingredients` and `allergens` are the food information EU law requires sellers to show.
 */
export interface Product {
  readonly id: number;
  readonly title: string;
  readonly price: number;
  readonly description: string;
  readonly image: string;
  readonly category: ProductCategory;
  readonly gramaj?: number;
  readonly ingredients?: string;
  readonly allergens?: readonly string[];
}
