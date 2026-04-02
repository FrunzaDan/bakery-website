
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Notification } from '../../interfaces/notification';
import { Product } from '../../interfaces/product';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-cart',
    imports: [RouterModule],
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  public cartProducts: Product[] = [];
  public totalNumberOfCartProducts!: number;
  public totalPrice!: number;
  public currentNotifications: Notification | null = null;
  public notifications: Notification[] = [];

  constructor(
    private cartService: CartService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.displayCartContent();
    this.displayTotalNumberOfCartProducts();
    this.displayTotalPrice();
  }

  displayCartContent(): void {
    this.cartService
      .getProductsForCartObservable()
      .subscribe((response: Product[]): void => {
        this.cartProducts = response;
      });
  }

  displayTotalPrice(): void {
    this.cartService
      .getTotalPrice()
      .subscribe((totalPriceCalculated: number): void => {
        this.totalPrice = totalPriceCalculated;
      });
  }

  displayTotalNumberOfCartProducts(): void {
    this.cartService
      .getNumberOfProductsForCart()
      .subscribe((totalNumberOfProducts: number): void => {
        this.totalNumberOfCartProducts = totalNumberOfProducts;
      });
  }

  removeOneProduct(product: Product): void {
    let isSuccesful: boolean = this.cartService.removeProductFromCart(product);
    if (isSuccesful) {
      let notification: Notification = {
        message: `"${product.title}" - 1`,
      };
      this.notificationService.addNotification(notification);
    }
    this.cartService
      .getTotalPrice()
      .subscribe((totalPriceCalculated: number): void => {
        this.totalPrice = totalPriceCalculated;
      });
  }

  addOneProduct(product: Product): void {
    let isSuccesful: boolean = this.cartService.addProductToCart(product);
    if (isSuccesful) {
      let notification: Notification = {
        message: `"${product.title}" + 1`,
      };
      this.notificationService.addNotification(notification);
    }
    this.cartService
      .getTotalPrice()
      .subscribe((totalPriceCalculated: number): void => {
        this.totalPrice = totalPriceCalculated;
      });
  }

  removeFromCart(product: Product): void {
    let isSuccesful: boolean = this.cartService.removeProductsFromCart(product);
    if (isSuccesful) {
      let notification: Notification = {
        message: `"${product.title}" a fost șters!`,
      };
      this.notificationService.addNotification(notification);
    }
    this.cartService
      .getTotalPrice()
      .subscribe((totalPriceCalculated: number): void => {
        this.totalPrice = totalPriceCalculated;
      });
  }

  emptyCart(): void {
    let isSuccesful: boolean = this.cartService.removeAllCart();
    if (isSuccesful) {
      let notification: Notification = {
        message: `Coșul a fost golit!`,
      };
      this.notificationService.addNotification(notification);
    }
  }
}
