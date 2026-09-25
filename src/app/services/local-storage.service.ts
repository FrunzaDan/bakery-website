import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CartItem } from '../interfaces/cart-item';
import { parseCartItems } from '../shared/parsers';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  // The key predates carts holding only product references; `parseCartItems`
  // still reads carts saved in the old shape.
  private readonly cartItemsKey = 'cartProductsLocal';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  getCartItems(): CartItem[] {
    if (!this.isBrowser) {
      return [];
    }
    try {
      const cartItemsJson = localStorage.getItem(this.cartItemsKey);
      return cartItemsJson ? parseCartItems(JSON.parse(cartItemsJson)) : [];
    } catch (parseError: unknown) {
      console.error('Error parsing cart items from local storage:', parseError);
      return [];
    }
  }

  /** Calls `onChange` with the stored cart whenever another tab changes it. */
  onCartItemsChangedInOtherTab(onChange: (cartItems: CartItem[]) => void): void {
    if (!this.isBrowser) {
      return;
    }
    window.addEventListener('storage', (event) => {
      // `key` is null when another tab clears the whole storage.
      if (event.key === this.cartItemsKey || event.key === null) {
        onChange(this.getCartItems());
      }
    });
  }

  setCartItems(cartItems: readonly CartItem[]): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.setItem(this.cartItemsKey, JSON.stringify(cartItems));
    } catch (storageError: unknown) {
      console.error('Error setting cart items to local storage:', storageError);
    }
  }
}
