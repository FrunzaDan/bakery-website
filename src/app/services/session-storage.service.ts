import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  private readonly productsSessionKey = 'productsSession';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  getProductsSession(): Product[] {
    if (!this.isBrowser) {
      return [];
    }
    try {
      const cartProductsJson = sessionStorage.getItem(
        this.productsSessionKey
      );
      if (!cartProductsJson) {
        return [];
      }
      return JSON.parse(cartProductsJson) as Product[];
    } catch (parseError: unknown) {
      console.error(
        'Error parsing products from session storage:',
        parseError
      );
      return [];
    }
  }

  setProductsSession(products: Product[]): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      sessionStorage.setItem(
        this.productsSessionKey,
        JSON.stringify(products)
      );
    } catch (parseError: unknown) {
      console.error('Error setting products to session storage:', parseError);
    }
  }
}
