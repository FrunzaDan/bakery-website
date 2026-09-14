import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private readonly cartProductsKey = 'cartProductsLocal';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  getCartProductsLocal(): Product[] | null {
    if (!this.isBrowser) {
      return null;
    }
    try {
      const cartProductsJson = localStorage.getItem(this.cartProductsKey);
      if (!cartProductsJson) {
        return null;
      }
      return JSON.parse(cartProductsJson) as Product[];
    } catch (parseError: unknown) {
      console.error(
        'Error parsing cart products from local storage:',
        parseError
      );
      return null;
    }
  }

  setCartProductsLocal(products: Product[]): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.setItem(this.cartProductsKey, JSON.stringify(products));
    } catch (parseError: unknown) {
      console.error('Error setting products to local storage:', parseError);
    }
  }
}
