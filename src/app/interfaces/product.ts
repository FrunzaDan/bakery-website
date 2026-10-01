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
 * A catalog product. Prices are in RON, `gramaj` (weight) is in grams and
 * `calories` is in kcal per 100 g, as on EU nutrition labels.
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
  readonly calories?: number;
  readonly ingredients?: string;
  readonly allergens?: readonly string[];
}

/** Kcal in one piece, when both the weight and the energy value are known. */
export function caloriesPerPiece(product: Product): number | undefined {
  if (!product.gramaj || !product.calories) return undefined;
  return Math.round((product.gramaj * product.calories) / 100);
}
