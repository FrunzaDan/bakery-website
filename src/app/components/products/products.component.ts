import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Product } from '../../interfaces/product';
import { CartService } from '../../services/cart.service';
import { CategoryService } from '../../services/cathegory.service';
import { FetchProductsService } from '../../services/fetch-products.service';
import { NotificationService } from '../../services/notification.service';
import { FilterPipe } from '../../shared/filter.pipe';

type SortOption = 'title-asc' | 'title-desc' | 'price-asc' | 'price-desc';

@Component({
  imports: [RouterModule, FormsModule],
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent {
  private readonly fetchProductsService = inject(FetchProductsService);
  private readonly cartService = inject(CartService);
  private readonly filter = inject(FilterPipe);
  private readonly notificationService = inject(NotificationService);
  private readonly categoryService = inject(CategoryService);

  readonly totalNumberOfCartProducts = this.cartService.totalNumberOfProducts;

  private readonly productsResource = rxResource({
    stream: () => this.fetchProductsService.fetchProducts(),
  });
  readonly productsList = computed((): Product[] => this.productsResource.value() ?? []);
  readonly isLoadingProducts = this.productsResource.isLoading;

  readonly selectedCategory = signal<string | undefined>(
    this.categoryService.selectedCategory()
  );
  readonly searchString = signal('');
  readonly sortOption = signal<SortOption | undefined>(undefined);

  readonly searchFilterProductsList = computed((): Product[] => {
    const searchString: string = this.searchString();
    const filteredProducts: Product[] = searchString
      ? this.filter.transform(this.productsList(), searchString, 'title')
      : this.filterByCategory();

    return this.sortProducts(filteredProducts);
  });

  displayProductsContent(category?: string): void {
    this.selectedCategory.set(category);
  }

  setSortOption(sortOption: SortOption): void {
    this.sortOption.set(sortOption);
  }

  private filterByCategory(): Product[] {
    const category: string | undefined = this.selectedCategory();
    return category
      ? this.productsList().filter((product: Product): boolean => product.category === category)
      : this.productsList();
  }

  private sortProducts(products: Product[]): Product[] {
    const sortOption: SortOption | undefined = this.sortOption();
    if (!sortOption) {
      return products;
    }

    const sortedProducts: Product[] = [...products];
    switch (sortOption) {
      case 'title-asc':
        return sortedProducts.sort((a: Product, b: Product): number => a.title.localeCompare(b.title));
      case 'title-desc':
        return sortedProducts.sort((a: Product, b: Product): number => b.title.localeCompare(a.title));
      case 'price-asc':
        return sortedProducts.sort((a: Product, b: Product): number => a.price - b.price);
      case 'price-desc':
        return sortedProducts.sort((a: Product, b: Product): number => b.price - a.price);
    }
  }

  addToCart(product: Product): void {
    const isSuccessful: boolean = this.cartService.addProductToCart(product);
    if (isSuccessful) {
      this.notificationService.addNotification({
        message: `"${product.title}" a fost adăugat!`,
      });
    }
  }

  search(keyboardEvent: Event): void {
    this.selectedCategory.set(undefined);
    this.searchString.set((keyboardEvent.target as HTMLInputElement).value);
  }
}
