import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { get, getDatabase, ref } from 'firebase/database';
import { from } from 'rxjs/internal/observable/from';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { catchError } from 'rxjs/internal/operators/catchError';
import { map } from 'rxjs/internal/operators/map';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { tap } from 'rxjs/internal/operators/tap';
import { timeout } from 'rxjs/internal/operators/timeout';
import { Product } from '../interfaces/product';
import { firebaseApp } from '../firebase';
import { SessionStorageService } from './session-storage.service';

@Injectable({
  providedIn: 'root',
})
export class FetchProductsService {
  private readonly http = inject(HttpClient);
  private readonly database = getDatabase(firebaseApp);
  private readonly sessionStorageService = inject(SessionStorageService);

  fetchProducts(): Observable<Product[]> {
    const sessionProductsList: Product[] =
      this.sessionStorageService.getProductsSession();

    if (sessionProductsList.length !== 0) {
      return of(sessionProductsList);
    }

    return this.fetchProductsFromFirebaseRealtimeDB().pipe(
      switchMap((products: Product[]): Observable<Product[]> => {
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
    return from(get(ref(this.database, 'products'))).pipe(
      map((snapshot): Product[] => {
        const products: Product[] = [];
        snapshot.forEach((child) => {
          products.push(child.val());
        });
        return products;
      }),
      timeout(5000),
      tap((products: Product[]): void => {
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
      .get<{ products: Product[] }>('/assets/products.json')
      .pipe(map((data: { products: Product[] }): Product[] => data.products));
  }
}
