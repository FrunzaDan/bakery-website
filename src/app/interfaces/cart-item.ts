import { Product } from './product';

/** What the cart stores: a reference to a catalog product, never a copy of it. */
export interface CartItem {
  readonly productId: number;
  readonly quantity: number;
}

/** A cart item resolved against the current catalog, for display and ordering. */
export interface CartLine {
  readonly product: Product;
  readonly quantity: number;
}
