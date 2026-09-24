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

  constructor() {
    afterNextRender((): void => {
      const storedCartItems = this.localStorageService.getCartItems();
      if (storedCartItems.length > 0) {
        this.cartItems.set(storedCartItems);
      }
    });
  }

  /**
   * The cart only stores product ids and quantities; title, image and price
   * always come from the current catalog, so they can't go stale or be edited
   * in localStorage. Items whose product is no longer sold are left out.
   */
  readonly cartLines = computed((): CartLine[] => {
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
    this.updateCartItems(
      this.cartItems().flatMap((item) => {
        if (item.productId !== product.id) return [item];
        return item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [];
      }),
    );
  }

  removeProductsFromCart(product: Product): void {
    this.updateCartItems(this.cartItems().filter((item) => item.productId !== product.id));
  }

  removeAllCart(): void {
    this.updateCartItems([]);
  }

  private updateCartItems(cartItems: readonly CartItem[]): void {
    this.cartItems.set(cartItems);
    this.localStorageService.setCartItems(cartItems);
  }
}
