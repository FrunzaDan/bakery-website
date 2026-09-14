import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Product } from '../../interfaces/product';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-cart',
  imports: [RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent {
  private readonly cartService = inject(CartService);
  private readonly notificationService = inject(NotificationService);

  readonly cartProducts = this.cartService.cartProducts;
  readonly totalNumberOfCartProducts = this.cartService.totalNumberOfProducts;
  readonly totalPrice = this.cartService.totalPrice;

  removeOneProduct(product: Product): void {
    const isSuccessful: boolean = this.cartService.removeProductFromCart(product);
    if (isSuccessful) {
      this.notificationService.addNotification({
        message: `"${product.title}" - 1`,
      });
    }
  }

  addOneProduct(product: Product): void {
    const isSuccessful: boolean = this.cartService.addProductToCart(product);
    if (isSuccessful) {
      this.notificationService.addNotification({
        message: `"${product.title}" + 1`,
      });
    }
  }

  removeFromCart(product: Product): void {
    const isSuccessful: boolean = this.cartService.removeProductsFromCart(product);
    if (isSuccessful) {
      this.notificationService.addNotification({
        message: `"${product.title}" a fost șters!`,
      });
    }
  }

  emptyCart(): void {
    const isSuccessful: boolean = this.cartService.removeAllCart();
    if (isSuccessful) {
      this.notificationService.addNotification({
        message: `Coșul a fost golit!`,
      });
    }
  }
}
