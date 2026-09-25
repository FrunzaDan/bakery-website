import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';
import { CartItem } from '../interfaces/cart-item';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  const cartItem: CartItem = { productId: 1, quantity: 2 };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
    service = TestBed.inject(LocalStorageService);
  });

  it('returns an empty cart when nothing has been stored', () => {
    expect(service.getCartItems()).toEqual([]);
  });

  it('round-trips cart items through storage', () => {
    service.setCartItems([cartItem]);

    expect(service.getCartItems()).toEqual([cartItem]);
  });

  it('reads a cart saved as full product copies by the previous version', () => {
    localStorage.setItem(
      'cartProductsLocal',
      JSON.stringify([{ id: 7, title: 'Widget', price: 10, quantity: 3 }]),
    );

    expect(service.getCartItems()).toEqual([{ productId: 7, quantity: 3 }]);
  });

  it('returns an empty cart when the stored value is not valid JSON', () => {
    localStorage.setItem('cartProductsLocal', '{not valid json');

    expect(service.getCartItems()).toEqual([]);
  });

  it('does not touch storage when not running in a browser', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    const serverService = TestBed.inject(LocalStorageService);

    serverService.setCartItems([cartItem]);

    expect(localStorage.getItem('cartProductsLocal')).toBeNull();
    expect(serverService.getCartItems()).toEqual([]);
  });

  it('reports cart changes made in another tab', () => {
    const onChange = vi.fn();
    service.onCartItemsChangedInOtherTab(onChange);

    localStorage.setItem('cartProductsLocal', JSON.stringify([cartItem]));
    window.dispatchEvent(new StorageEvent('storage', { key: 'cartProductsLocal' }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'somethingElse' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([cartItem]);
  });
});
