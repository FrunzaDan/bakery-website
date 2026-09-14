import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SessionStorageService } from './session-storage.service';
import { Product } from '../interfaces/product';

describe('SessionStorageService', () => {
  let service: SessionStorageService;

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
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
    service = TestBed.inject(SessionStorageService);
  });

  it('returns an empty array when nothing has been stored', () => {
    expect(service.getProductsSession()).toEqual([]);
  });

  it('round-trips products through storage', () => {
    service.setProductsSession([product]);

    expect(service.getProductsSession()).toEqual([product]);
  });

  it('returns an empty array when the stored value is not valid JSON', () => {
    sessionStorage.setItem('productsSession', '{not valid json');

    expect(service.getProductsSession()).toEqual([]);
  });

  it('does not touch storage when not running in a browser', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    const serverService = TestBed.inject(SessionStorageService);

    serverService.setProductsSession([product]);

    expect(sessionStorage.getItem('productsSession')).toBeNull();
    expect(serverService.getProductsSession()).toEqual([]);
  });
});
