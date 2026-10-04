import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError, TimeoutError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../interfaces/product';
import { FetchProductsService } from './fetch-products.service';
import { SessionStorageService } from './session-storage.service';

describe('FetchProductsService', () => {
  const croissant: Product = {
    id: 1,
    title: 'Croissant',
    price: 5,
    description: 'Unt',
    image: 'croissant.jpg',
    category: 'pastry',
  };
  const bread: Product = {
    id: 2,
    title: 'Pâine',
    price: 7.5,
    description: 'Maia',
    image: 'bread.jpg',
    category: 'basic_products',
  };

  let service: FetchProductsService;
  let httpMock: HttpTestingController;
  let getProductsSession: ReturnType<typeof vi.fn>;
  let setProductsSession: ReturnType<typeof vi.fn>;

  const productsUrl = `${environment.firebaseConfig.databaseURL}/products.json`;

  beforeEach(() => {
    getProductsSession = vi.fn().mockReturnValue([]);
    setProductsSession = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: SessionStorageService,
          useValue: { getProductsSession, setProductsSession },
        },
      ],
    });
    service = TestBed.inject(FetchProductsService);
    httpMock = TestBed.inject(HttpTestingController);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('fetchProducts', () => {
    it('serves the products cached in this session without any request', async () => {
      getProductsSession.mockReturnValue([croissant]);
      const firebase = vi.spyOn(service, 'fetchProductsFromFirebaseRealtimeDB');

      expect(await firstValueFrom(service.fetchProducts())).toEqual([
        croissant,
      ]);
      expect(firebase).not.toHaveBeenCalled();
    });

    it('uses the Firebase products when Firebase has some', async () => {
      vi.spyOn(service, 'fetchProductsFromFirebaseRealtimeDB').mockReturnValue(
        of([croissant, bread]),
      );

      expect(await firstValueFrom(service.fetchProducts())).toEqual([
        croissant,
        bread,
      ]);
    });

    it('falls back to the bundled products.json when Firebase has none', async () => {
      vi.spyOn(service, 'fetchProductsFromFirebaseRealtimeDB').mockReturnValue(
        of([]),
      );

      const result = firstValueFrom(service.fetchProducts());
      httpMock.expectOne('/assets/products.json').flush({ products: [bread] });

      expect(await result).toEqual([bread]);
    });

    it('falls back to the bundled products.json when Firebase fails', async () => {
      vi.spyOn(service, 'fetchProductsFromFirebaseRealtimeDB').mockReturnValue(
        throwError(() => new Error('permission denied')),
      );

      const result = firstValueFrom(service.fetchProducts());
      httpMock.expectOne('/assets/products.json').flush({ products: [bread] });

      expect(await result).toEqual([bread]);
    });
  });

  describe('fetchProductsFromFirebaseRealtimeDB', () => {
    it('keeps the valid products and caches them for the session', async () => {
      const result = firstValueFrom(
        service.fetchProductsFromFirebaseRealtimeDB(),
      );
      httpMock
        .expectOne(productsUrl)
        .flush([croissant, { title: 'no id' }, bread]);

      expect(await result).toEqual([croissant, bread]);
      expect(setProductsSession).toHaveBeenCalledWith([croissant, bread]);
    });

    it('reads a node returned as an array with gaps or as an object', async () => {
      const fromArray = firstValueFrom(
        service.fetchProductsFromFirebaseRealtimeDB(),
      );
      httpMock.expectOne(productsUrl).flush([null, croissant, bread]);
      expect(await fromArray).toEqual([croissant, bread]);

      const fromObject = firstValueFrom(
        service.fetchProductsFromFirebaseRealtimeDB(),
      );
      httpMock.expectOne(productsUrl).flush({ croissant, bread });
      expect(await fromObject).toEqual([croissant, bread]);
    });

    it('does not cache an empty catalog', async () => {
      const result = firstValueFrom(
        service.fetchProductsFromFirebaseRealtimeDB(),
      );
      httpMock.expectOne(productsUrl).flush(null);

      expect(await result).toEqual([]);
      expect(setProductsSession).not.toHaveBeenCalled();
    });

    it('gives up after 5 seconds without an answer', async () => {
      vi.useFakeTimers();

      const result = firstValueFrom(
        service.fetchProductsFromFirebaseRealtimeDB(),
      );
      const settled = expect(result).rejects.toBeInstanceOf(TimeoutError);
      const request = httpMock.expectOne(productsUrl);
      await vi.advanceTimersByTimeAsync(5000);

      await settled;
      expect(request.cancelled).toBe(true);
    });
  });

  describe('fetchProductsFromNG', () => {
    it('reads products.json and drops malformed entries', async () => {
      const result = firstValueFrom(service.fetchProductsFromNG());
      httpMock
        .expectOne('/assets/products.json')
        .flush({ products: [croissant, { id: 'x' }] });

      expect(await result).toEqual([croissant]);
    });

    it('returns no products when the file has none', async () => {
      const result = firstValueFrom(service.fetchProductsFromNG());
      httpMock.expectOne('/assets/products.json').flush(null);

      expect(await result).toEqual([]);
    });
  });
});
