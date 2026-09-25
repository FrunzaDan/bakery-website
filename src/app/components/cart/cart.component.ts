import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Product } from '../../interfaces/product';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { ProductCatalogService } from '../../services/product-catalog.service';
import { SEOService } from '../../services/seo.service';
import { QuantityPickerComponent } from '../../shared/quantity-picker/quantity-picker.component';
import { RonPipe } from '../../shared/ron.pipe';

const SKELETON_LINE_COUNT = 3;

@Component({
  selector: 'app-cart',
  imports: [RouterModule, RonPipe, QuantityPickerComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  private readonly seoService = inject(SEOService);
  private readonly cartService = inject(CartService);
  private readonly notificationService = inject(NotificationService);
  private readonly catalog = inject(ProductCatalogService);

  readonly cartLines = this.cartService.cartLines;
  readonly totalNumberOfCartProducts = this.cartService.totalNumberOfProducts;
  readonly totalPrice = this.cartService.totalPrice;
  readonly hasItems = this.cartService.hasItems;
  readonly isLoadingProducts = this.catalog.isLoading;
  readonly loadError = this.catalog.loadError;
  readonly skeletonLines = Array.from({ length: SKELETON_LINE_COUNT }, (_, index) => index);

  reloadProducts(): void {
    this.catalog.reload();
  }

  /** From the − / + buttons or a typed quantity; 0 removes the line, with undo. */
  changeQuantity(product: Product, quantity: number): void {
    if (quantity < 1) {
      this.removeFromCart(product);
      return;
    }
    this.cartService.setProductQuantity(product, quantity);
  }

  removeFromCart(product: Product): void {
    const undo = this.cartService.removeProductsFromCart(product);
    this.notificationService.show(`"${product.title}" a fost șters!`, {
      action: { label: 'Anulează', run: undo },
    });
  }

  emptyCart(): void {
    const undo = this.cartService.removeAllCart();
    this.notificationService.show('Coșul a fost golit!', {
      action: { label: 'Anulează', run: undo },
    });
  }

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      description: 'Produsele din coșul tău de la TestBakery Sibiu.',
      path: '/cart',
      robots: 'noindex, follow',
    });
  }
}
