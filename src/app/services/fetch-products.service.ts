import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Database, listVal, ref } from '@angular/fire/database';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { catchError } from 'rxjs/internal/operators/catchError';
import { map } from 'rxjs/internal/operators/map';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { tap } from 'rxjs/internal/operators/tap';
import { timeout } from 'rxjs/internal/operators/timeout';
import { Product } from '../interfaces/product';
import { SessionStorageService } from './session-storage.service';

@Injectable({
  providedIn: 'root',
})
export class FetchProductsService {
  private readonly http = inject(HttpClient);
  private readonly database = inject(Database);
  private readonly sessionStorageService = inject(SessionStorageService);
  private readonly injector = inject(Injector);

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
    return runInInjectionContext(this.injector, () =>
      listVal<Product>(ref(this.database, 'products')),
    ).pipe(
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
