import { computed, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Product } from '../interfaces/product';
import { FetchProductsService } from './fetch-products.service';

/** The product catalog, loaded once and shared by the products page and the cart. */
@Injectable({
  providedIn: 'root',
})
export class ProductCatalogService {
  private readonly fetchProductsService = inject(FetchProductsService);

  private readonly productsResource = rxResource({
    stream: () => this.fetchProductsService.fetchProducts(),
  });

  readonly products = computed((): readonly Product[] => this.productsResource.value() ?? []);
  readonly isLoading = this.productsResource.isLoading;

  readonly productsById = computed(
    () => new Map(this.products().map((product) => [product.id, product])),
  );
}
