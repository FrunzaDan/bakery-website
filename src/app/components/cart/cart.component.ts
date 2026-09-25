import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Product } from '../../interfaces/product';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { ProductCatalogService } from '../../services/product-catalog.service';
import { RonPipe } from '../../shared/ron.pipe';

@Component({
  selector: 'app-cart',
  imports: [RouterModule, RonPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  private readonly cartService = inject(CartService);
  private readonly notificationService = inject(NotificationService);
  private readonly catalog = inject(ProductCatalogService);

  readonly cartLines = this.cartService.cartLines;
  readonly totalNumberOfCartProducts = this.cartService.totalNumberOfProducts;
  readonly totalPrice = this.cartService.totalPrice;
  readonly hasItems = this.cartService.hasItems;
  readonly isLoadingProducts = this.catalog.isLoading;
  readonly loadError = this.catalog.loadError;

  reloadProducts(): void {
    this.catalog.reload();
  }

  removeOneProduct(product: Product): void {
    this.cartService.removeProductFromCart(product);
    this.notificationService.show(`"${product.title}" - 1`);
  }

  addOneProduct(product: Product): void {
    this.cartService.addProductToCart(product);
    this.notificationService.show(`"${product.title}" + 1`);
  }

  removeFromCart(product: Product): void {
    this.cartService.removeProductsFromCart(product);
    this.notificationService.show(`"${product.title}" a fost șters!`);
  }

  emptyCart(): void {
    this.cartService.removeAllCart();
    this.notificationService.show('Coșul a fost golit!');
  }
}
