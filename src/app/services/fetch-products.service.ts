import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { DataSnapshot } from 'firebase/database';
import {
  catchError,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
  timeout,
} from 'rxjs';
import { Product } from '../interfaces/product';
import { parseProducts } from '../shared/parsers';
import { SessionStorageService } from './session-storage.service';

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
    return from(this.readProductsSnapshot()).pipe(
      map((snapshot): Product[] => {
        const values: unknown[] = [];
        snapshot.forEach((child) => {
          values.push(child.val());
        });
        return parseProducts(values);
      }),
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

  // The database SDK is large and only needed here, so it loads in its own chunk on first use.
  private async readProductsSnapshot(): Promise<DataSnapshot> {
    const [{ get, getDatabase, ref }, { firebaseApp }] = await Promise.all([
      import('firebase/database'),
      import('../firebase'),
    ]);
    return get(ref(getDatabase(firebaseApp), 'products'));
  }

  fetchProductsFromNG(): Observable<Product[]> {
    console.log('Fetching sample products from NG...');
    return this.http
      .get<{ products?: unknown } | null>('/assets/products.json')
      .pipe(map((data): Product[] => parseProducts(data?.products)));
  }
}
