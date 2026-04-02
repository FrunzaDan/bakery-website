
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';
import { Subscription } from 'rxjs/internal/Subscription';
import { Notification } from '../../interfaces/notification';
import { Product } from '../../interfaces/product';
import { CartService } from '../../services/cart.service';
import { CategoryService } from '../../services/cathegory.service';
import { FetchProductsService } from '../../services/fetch-products.service';
import { NotificationService } from '../../services/notification.service';
import { SubscriptionService } from '../../services/subscription.service';
import { FilterPipe } from '../../shared/filter.pipe';

@Component({
  imports: [RouterModule, FormsModule],
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent implements OnInit, OnDestroy {
  public productsList: Product[] = [];
  public totalNumberOfCartProducts: number = 0;
  public totalPrice: number = 0;
  public searchString: string = '';
  public searchFilterProductsList: Product[] = [];
  public selectedCategory: string | undefined;
  public currentNotifications: Notification | null = null;
  public notifications: Notification[] = [];

  private productSubscription?: Subscription;
  private getCathegorySubscription?: Subscription;
  private cartSubscription?: Subscription;

  constructor(
    private fetchProductsService: FetchProductsService,
    private cartService: CartService,
    private filter: FilterPipe,
    private notificationService: NotificationService,
    private categoryService: CategoryService,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    this.getProductCathegory();
    this.displayProductsContent(this.selectedCategory);
    this.displayNumberOfProductsForCart();
  }

  async displayProductsContent(selectedCategory?: string): Promise<void> {
    this.selectedCategory = selectedCategory;
    if (!selectedCategory) {
      this.selectedCategory = undefined;
    }
    if (this.productsList.length == 0) {
      this.productSubscription = this.fetchProductsService
        .fetchProducts()
        .subscribe((productList: Product[]): void => {
          this.productsList = productList;
          this.searchFilterProductsList = this.productsList;
        });
    }

    if (selectedCategory) {
      this.searchFilterProductsList = this.productsList.filter(
        (product: Product): boolean => product.category === selectedCategory
      );
    } else {
      this.searchFilterProductsList = this.productsList;
    }
    this.searchFilterProductsList.forEach((a: Product): void => {
      Object.assign(a, { quantity: a.quantity, total: a.price });
    });
  }

  getProductCathegory(): void {
    this.getCathegorySubscription = this.categoryService
      .getSelectedCategory()
      .pipe(take(1))
      .subscribe((response: string | undefined): void => {
        this.selectedCategory = response;
      });
  }

  displayNumberOfProductsForCart(): void {
    this.cartSubscription = this.cartService
      .getNumberOfProductsForCart()
      .subscribe((totalNumberOfProducts: number): void => {
        this.totalNumberOfCartProducts = totalNumberOfProducts;
      });
  }

  addToCart(product: Product): void {
    let isSuccessful: boolean = this.cartService.addProductToCart(product);
    if (isSuccessful) {
      let notification: Notification = {
        message: `"${product.title}" a fost adăugat!`,
      };
      this.notificationService.addNotification(notification);
    }
  }

  search(keyboardEvent: Event): void {
    this.selectedCategory = undefined;
    const searchString: string = (keyboardEvent.target as HTMLInputElement)
      .value;
    this.searchFilterProductsList = searchString
      ? this.filter.transform(this.productsList, searchString, 'title')
      : this.productsList;
  }

  ngOnDestroy(): void {
    this.subscriptionService.unsubscribeIfActive(this.productSubscription);
    this.subscriptionService.unsubscribeIfActive(this.getCathegorySubscription);
    this.subscriptionService.unsubscribeIfActive(this.cartSubscription);
  }
}
