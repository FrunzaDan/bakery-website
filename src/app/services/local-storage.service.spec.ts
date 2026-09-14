import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';
import { Product } from '../interfaces/product';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  const product: Product = {
    id: 1,
    title: 'Widget',
    price: 10,
    description: '',
    image: '',
    category: 'widgets',
    quantity: 2,
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
    service = TestBed.inject(LocalStorageService);
  });

  it('returns null when nothing has been stored', () => {
    expect(service.getCartProductsLocal()).toBeNull();
  });

  it('round-trips products through storage', () => {
    service.setCartProductsLocal([product]);

    expect(service.getCartProductsLocal()).toEqual([product]);
  });

  it('returns null when the stored value is not valid JSON', () => {
    localStorage.setItem('cartProductsLocal', '{not valid json');

    expect(service.getCartProductsLocal()).toBeNull();
  });

  it('does not touch storage when not running in a browser', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    const serverService = TestBed.inject(LocalStorageService);

    serverService.setCartProductsLocal([product]);

    expect(localStorage.getItem('cartProductsLocal')).toBeNull();
    expect(serverService.getCartProductsLocal()).toBeNull();
  });
});
