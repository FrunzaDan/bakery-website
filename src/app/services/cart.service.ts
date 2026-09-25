import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { CartItem, CartLine } from '../interfaces/cart-item';
import { MAX_QUANTITY_PER_PRODUCT, Product } from '../interfaces/product';
import { LocalStorageService } from './local-storage.service';
import { ProductCatalogService } from './product-catalog.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly localStorageService = inject(LocalStorageService);
  private readonly catalog = inject(ProductCatalogService);

  // Starts empty so server and client render the same initial state; the
  // client-only cart stored in localStorage is applied after hydration to
  // avoid an SSR/CSR content mismatch (localStorage doesn't exist on the server).
  private readonly cartItems = signal<readonly CartItem[]>([]);
  private storedCartLoaded = false;

  constructor() {
    afterNextRender((): void => {
      this.loadStoredCart();
      this.localStorageService.onCartItemsChangedInOtherTab((cartItems) =>
        this.cartItems.set(cartItems),
      );
    });
  }

  /** True when the cart holds items, even before the catalog needed to show them has loaded. */
  readonly hasItems = computed(() => this.cartItems().length > 0);

  /**
   * The cart only stores product ids and quantities; title, image and price
   * always come from the current catalog, so they can't go stale or be edited
   * in localStorage. Items whose product is no longer sold are left out.
   */
  readonly cartLines = computed((): readonly CartLine[] => {
    const productsById = this.catalog.productsById();
    return this.cartItems().flatMap((item) => {
      const product = productsById.get(item.productId);
      return product ? [{ product, quantity: item.quantity }] : [];
    });
  });

  readonly totalNumberOfProducts = computed(() =>
    this.cartLines().reduce((total, line) => total + line.quantity, 0),
  );

  readonly totalPrice = computed(() => {
    const total = this.cartLines().reduce(
      (sum, line) => sum + line.product.price * line.quantity,
      0,
    );
    return Math.round(total * 100) / 100;
  });

  /**
   * Adds `quantity` pieces of the product, up to `MAX_QUANTITY_PER_PRODUCT`.
   * Returns false when nothing could be added because the limit was reached.
   */
  addProductToCart(product: Product, quantity = 1): boolean {
    this.loadStoredCart();
    const current = this.quantityOf(product);
    const next = Math.min(current + quantity, MAX_QUANTITY_PER_PRODUCT);
    if (next === current) {
      return false;
    }
    this.setQuantity(product, next);
    return true;
  }

  /** Sets the product's quantity, clamped to 1..`MAX_QUANTITY_PER_PRODUCT`; use the remove methods to drop it. */
  setProductQuantity(product: Product, quantity: number): void {
    this.loadStoredCart();
    this.setQuantity(product, Math.min(Math.max(Math.floor(quantity), 1), MAX_QUANTITY_PER_PRODUCT));
  }

  removeProductFromCart(product: Product): void {
    this.loadStoredCart();
    this.updateCartItems(
      this.cartItems().flatMap((item) => {
        if (item.productId !== product.id) return [item];
        return item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [];
      }),
    );
  }

  /** Removes the product's whole line and returns a function that puts it back. */
  removeProductsFromCart(product: Product): () => void {
    this.loadStoredCart();
    const cartItems = this.cartItems();
    const index = cartItems.findIndex((item) => item.productId === product.id);
    if (index === -1) {
      return () => undefined;
    }
    const removed = cartItems[index];
    this.updateCartItems(cartItems.filter((item) => item.productId !== product.id));
    return () => this.putBack([{ item: removed, index }]);
  }

  /** Empties the cart and returns a function that puts the removed items back. */
  removeAllCart(): () => void {
    this.loadStoredCart();
    const removed = this.cartItems().map((item, index) => ({ item, index }));
    this.updateCartItems([]);
    return () => this.putBack(removed);
  }

  private quantityOf(product: Product): number {
    return this.cartItems().find((item) => item.productId === product.id)?.quantity ?? 0;
  }

  private setQuantity(product: Product, quantity: number): void {
    const cartItems = this.cartItems();
    const isInCart = cartItems.some((item) => item.productId === product.id);
    this.updateCartItems(
      isInCart
        ? cartItems.map((item) => (item.productId === product.id ? { ...item, quantity } : item))
        : [...cartItems, { productId: product.id, quantity }],
    );
  }

  /**
   * Re-inserts removed items where they were. A product added again in the
   * meantime keeps its place and gets the removed quantity on top.
   */
  private putBack(removed: readonly { item: CartItem; index: number }[]): void {
    this.loadStoredCart();
    const cartItems = [...this.cartItems()];
    for (const { item, index } of removed) {
      const existing = cartItems.findIndex((current) => current.productId === item.productId);
      if (existing === -1) {
        cartItems.splice(Math.min(index, cartItems.length), 0, item);
      } else {
        const quantity = Math.min(
          cartItems[existing].quantity + item.quantity,
          MAX_QUANTITY_PER_PRODUCT,
        );
        cartItems[existing] = { ...cartItems[existing], quantity };
      }
    }
    this.updateCartItems(cartItems);
  }

  // Every change starts from the stored cart. A click replayed before the first
  // render would otherwise change an empty cart and save it over the stored one.
  private loadStoredCart(): void {
    if (this.storedCartLoaded) {
      return;
    }
    this.storedCartLoaded = true;
    const storedCartItems = this.localStorageService.getCartItems();
    if (storedCartItems.length > 0) {
      this.cartItems.set(storedCartItems);
    }
  }

  private updateCartItems(cartItems: readonly CartItem[]): void {
    this.cartItems.set(cartItems);
    this.localStorageService.setCartItems(cartItems);
  }
}
