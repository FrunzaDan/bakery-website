import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { CartItem, CartLine } from '../interfaces/cart-item';
import { Product } from '../interfaces/product';
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

  addProductToCart(product: Product): void {
    this.loadStoredCart();
    const cartItems = this.cartItems();
    const isInCart = cartItems.some((item) => item.productId === product.id);
    this.updateCartItems(
      isInCart
        ? cartItems.map((item) =>
            item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item,
          )
        : [...cartItems, { productId: product.id, quantity: 1 }],
    );
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

  removeProductsFromCart(product: Product): void {
    this.loadStoredCart();
    this.updateCartItems(this.cartItems().filter((item) => item.productId !== product.id));
  }

  removeAllCart(): void {
    this.loadStoredCart();
    this.updateCartItems([]);
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
