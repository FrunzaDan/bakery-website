import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap, tap, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../interfaces/product';
import { parseProducts } from '../shared/parsers';
import { SessionStorageService } from './session-storage.service';

// The Realtime Database REST endpoint for the `products` node. Reading it over HTTP instead of through the
// database SDK keeps a websocket out of the prerender, and lets HttpClient's transfer cache hand the
// prerendered response to the browser.
const PRODUCTS_URL = `${environment.firebaseConfig.databaseURL}/products.json`;

@Injectable({
  providedIn: 'root',
})
export class FetchProductsService {
  private readonly http = inject(HttpClient);
  private readonly sessionStorageService = inject(SessionStorageService);

  fetchProducts(): Observable<Product[]> {
    const sessionProductsList = this.sessionStorageService.getProductsSession();

    if (sessionProductsList.length !== 0) {
      return of(sessionProductsList);
    }

    return this.fetchProductsFromFirebaseRealtimeDB().pipe(
      switchMap((products): Observable<Product[]> => {
        if (products.length === 0) {
          return this.fetchProductsFromNG();
        }
        return of(products);
      }),
      catchError((error) => {
        console.error('Firebase DB error!', error);
        return this.fetchProductsFromNG();
      }),
    );
  }

  fetchProductsFromFirebaseRealtimeDB(): Observable<Product[]> {
    return this.http.get<unknown>(PRODUCTS_URL).pipe(
      map((data): Product[] => parseProducts(childValues(data))),
      timeout(5000),
      tap((products): void => {
        if (products.length === 0) {
          return;
        }
        try {
          this.sessionStorageService.setProductsSession(products);
        } catch {
          console.error('Session storage error!');
        }
      }),
    );
  }

  fetchProductsFromNG(): Observable<Product[]> {
    console.log('Fetching sample products from NG...');
    return this.http
      .get<{ products?: unknown } | null>('/assets/products.json')
      .pipe(map((data): Product[] => parseProducts(data?.products)));
  }
}

/**
 * The REST API returns a node's children as a JSON array when their keys are mostly sequential integers (with `null`
 * for any gaps), and as an object keyed by child name otherwise.
 */
function childValues(data: unknown): unknown[] {
  if (Array.isArray(data)) return data.filter((value) => value !== null);
  if (typeof data === 'object' && data !== null) return Object.values(data);
  return [];
}
