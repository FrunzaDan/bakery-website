import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CartItem } from '../interfaces/cart-item';
import { Order } from '../interfaces/order';
import { parseCartItems, parseOrders } from '../shared/parsers';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  // The key predates carts holding only product references; `parseCartItems`
  // still reads carts saved in the old shape.
  private readonly cartItemsKey = 'cartProductsLocal';
  private readonly ordersKey = 'orders';
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

  getOrders(): Order[] {
    if (!this.isBrowser) {
      return [];
    }
    try {
      const ordersJson = localStorage.getItem(this.ordersKey);
      return ordersJson ? parseOrders(JSON.parse(ordersJson)) : [];
    } catch (parseError: unknown) {
      console.error('Error parsing orders from local storage:', parseError);
      return [];
    }
  }

  /**
   * Unlike the cart, a failed save is not swallowed: an order that could not be
   * saved must be reported to the customer instead of silently lost.
   */
  setOrders(orders: readonly Order[]): void {
    if (!this.isBrowser) {
      throw new Error('Orders can only be saved in the browser.');
    }
    localStorage.setItem(this.ordersKey, JSON.stringify(orders));
  }
}
