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

  readonly searchFilterProductsList = computed((): Product[] => {
    const searchString: string = this.searchString();
    if (searchString) {
      return this.filter.transform(this.productsList(), searchString, 'title');
    }

    const category: string | undefined = this.selectedCategory();
    return category
      ? this.productsList().filter((product: Product): boolean => product.category === category)
      : this.productsList();
  });

  displayProductsContent(category?: string): void {
    this.selectedCategory.set(category);
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
