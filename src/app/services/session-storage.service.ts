import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CheckoutForm } from '../interfaces/checkout-form';
import { Product } from '../interfaces/product';
import { parseCheckoutDraft, parseProducts } from '../shared/parsers';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  private readonly productsSessionKey = 'productsSession';
  // Session storage, not local storage: the draft survives a refresh or a trip
  // to the cart, but personal details are gone once the tab is closed.
  private readonly checkoutDraftKey = 'checkoutDraft';
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

  /** The saved checkout draft on top of `defaults`, or `defaults` when there is none. */
  getCheckoutDraft(defaults: CheckoutForm): CheckoutForm {
    if (!this.isBrowser) {
      return defaults;
    }
    try {
      const draftJson = sessionStorage.getItem(this.checkoutDraftKey);
      return draftJson ? parseCheckoutDraft(JSON.parse(draftJson), defaults) : defaults;
    } catch (parseError: unknown) {
      console.error('Error parsing the checkout draft from session storage:', parseError);
      return defaults;
    }
  }

  setCheckoutDraft(draft: CheckoutForm): void {
    if (!this.isBrowser) {
      return;
    }
    // Terms acceptance is left out on purpose: consent is given per order.
    const { acceptTerms: _, ...savedDraft } = draft;
    try {
      sessionStorage.setItem(this.checkoutDraftKey, JSON.stringify(savedDraft));
    } catch (storageError: unknown) {
      console.error('Error saving the checkout draft to session storage:', storageError);
    }
  }

  clearCheckoutDraft(): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      sessionStorage.removeItem(this.checkoutDraftKey);
    } catch (storageError: unknown) {
      console.error('Error clearing the checkout draft from session storage:', storageError);
    }
  }
}
