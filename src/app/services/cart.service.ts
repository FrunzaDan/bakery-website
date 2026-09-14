import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { Product } from '../interfaces/product';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly localStorageService = inject(LocalStorageService);

  // Starts empty so server and client render the same initial state; the
  // client-only cart stored in localStorage is applied after hydration to
  // avoid an SSR/CSR content mismatch (localStorage doesn't exist on the server).
  private readonly cartProductsSignal = signal<Product[]>([]);

  readonly cartProducts = this.cartProductsSignal.asReadonly();

  constructor() {
    afterNextRender((): void => {
      const storedCartProducts: Product[] | null =
        this.localStorageService.getCartProductsLocal();
      if (storedCartProducts) {
        this.cartProductsSignal.set(storedCartProducts);
      }
    });
  }

  readonly totalNumberOfProducts = computed((): number =>
    this.cartProductsSignal().reduce(
      (totalQuantity: number, product: Product): number =>
        totalQuantity + product.quantity,
      0
    )
  );

  readonly totalPrice = computed((): number => {
    const total: number = this.cartProductsSignal().reduce(
      (acc: number, product: Product): number =>
        acc + product.price * product.quantity,
      0
    );
    return Math.round(total * 100) / 100;
  });

  addProductToCart(product: Product): boolean {
    const cartProducts: Product[] = this.cartProductsSignal();
    const existingProductIndex: number = cartProducts.findIndex(
      (item: Product): boolean => item.id === product.id
    );

    const updatedCartProducts: Product[] =
      existingProductIndex !== -1
        ? cartProducts.map((item: Product, index: number): Product =>
            index === existingProductIndex
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...cartProducts, { ...product, quantity: 1 }];

    this.updateCartStateAndStorage(updatedCartProducts);
    return true;
  }

  removeProductFromCart(product: Product): boolean {
    const cartProducts: Product[] = this.cartProductsSignal();
    const productIndex: number = cartProducts.findIndex(
      (item: Product): boolean => item.id === product.id
    );

    if (productIndex === -1) {
      console.warn(`Product with id ${product.id} not found in cart`);
      return false;
    }

    const existingProduct: Product = cartProducts[productIndex];
    const updatedCartProducts: Product[] =
      existingProduct.quantity - 1 <= 0
        ? cartProducts.filter((_, index: number): boolean => index !== productIndex)
        : cartProducts.map((item: Product, index: number): Product =>
            index === productIndex
              ? { ...item, quantity: item.quantity - 1 }
              : item
          );

    this.updateCartStateAndStorage(updatedCartProducts);
    return true;
  }

  removeProductsFromCart(product: Product): boolean {
    const cartProducts: Product[] = this.cartProductsSignal();
    const productIndex: number = cartProducts.findIndex(
      (item: Product): boolean => item.id === product.id
    );

    if (productIndex === -1) {
      return false;
    }

    const updatedCartProducts: Product[] = cartProducts.filter(
      (_, index: number): boolean => index !== productIndex
    );
    this.updateCartStateAndStorage(updatedCartProducts);
    return true;
  }

  removeAllCart(): boolean {
    this.updateCartStateAndStorage([]);
    return true;
  }

  private updateCartStateAndStorage(cartProducts: Product[]): void {
    this.cartProductsSignal.set(cartProducts);
    this.localStorageService.setCartProductsLocal(cartProducts);
  }
}
