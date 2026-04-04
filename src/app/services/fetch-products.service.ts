import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { map } from 'rxjs/internal/operators/map';
import { tap } from 'rxjs/internal/operators/tap';
import { Product } from '../interfaces/product';
import { SessionStorageService } from './session-storage.service';
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable({
  providedIn: 'root',
})
export class FetchProductsService {
  constructor(
    private http: HttpClient,
    private firebaseRealtimeDB: AngularFireDatabase,
    private sessionStorageService: SessionStorageService,
  ) {}

  fetchProducts(): Observable<Product[]> {
    let sessionProductsList: Product[] =
      this.sessionStorageService.getProductsSession();

    if (sessionProductsList.length !== 0) {
      return of(sessionProductsList);
    }

    return this.fetchProductsFromFirebaseRealtimeDB().pipe(
      catchError((error) => {
        console.error('Firebase DB error!', error);
        return this.fetchProductsFromNG(); // 👈 fallback
      }),
    );
  }

  fetchProductsFromFirebaseRealtimeDB(): Observable<Product[]> {
    return new Observable<Product[]>((subscriber) => {
      try {
        this.firebaseRealtimeDB
          .list<Product>('products')
          .valueChanges()
          .pipe(
            tap({
              next: (products: Product[]) => {
                try {
                  this.sessionStorageService.setProductsSession(products);
                } catch {
                  console.error('Session storage error!');
                }
              },
            }),
          )
          .subscribe(subscriber); // 👈 forward to outer subscriber
      } catch (error) {
        subscriber.error(error); // 👈 turn the sync throw into a stream error
      }
    });
  }

  fetchProductsFromNG(): Observable<Product[]> {
    try {
      console.log('Fetching sample products from NG...');
      return this.http
        .get<{ products: Product[] }>('/assets/products.json')
        .pipe(map((data: { products: Product[] }): Product[] => data.products));
    } catch {
      console.error('NG storage error!');
      return of([]);
    }
  }
}
