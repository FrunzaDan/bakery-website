export const PRODUCT_CATEGORIES = ['bakeries', 'pastry', 'sweets', 'basic_products'] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_CATEGORY_LABELS: Readonly<Record<ProductCategory, string>> = {
  bakeries: 'Cofetărie',
  pastry: 'Patiserie',
  sweets: 'Torturi',
  basic_products: 'Produse de bază',
};

/** A catalog product. Prices are in RON. */
export interface Product {
  readonly id: number;
  readonly title: string;
  readonly price: number;
  readonly description: string;
  readonly image: string;
  readonly category: ProductCategory;
}
