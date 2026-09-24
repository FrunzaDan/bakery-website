import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Product } from '../interfaces/product';
import { parseProducts } from '../shared/parsers';

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
      const productsJson = sessionStorage.getItem(this.productsSessionKey);
      return productsJson ? parseProducts(JSON.parse(productsJson)) : [];
    } catch (parseError: unknown) {
      console.error('Error parsing products from session storage:', parseError);
      return [];
    }
  }

  setProductsSession(products: readonly Product[]): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      sessionStorage.setItem(this.productsSessionKey, JSON.stringify(products));
    } catch (storageError: unknown) {
      console.error('Error setting products to session storage:', storageError);
    }
  }
}
