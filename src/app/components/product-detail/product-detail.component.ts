import {
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import {
  MAX_QUANTITY_PER_PRODUCT,
  PRODUCT_CATEGORY_LABELS,
} from '../../interfaces/product';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { ProductCatalogService } from '../../services/product-catalog.service';
import { SeoService } from '../../services/seo.service';
import { QuantityPickerComponent } from '../../shared/quantity-picker/quantity-picker.component';
import { RonPipe } from '../../shared/ron.pipe';

/** `/products/:id`: one product with its food information and a quantity to order. */
@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, RonPipe, QuantityPickerComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent {
  private readonly catalog = inject(ProductCatalogService);
  private readonly cartService = inject(CartService);
  private readonly notificationService = inject(NotificationService);
  private readonly title = inject(Title);
  private readonly seo = inject(SeoService);

  /** The route's `:id`; anything that isn't a number becomes NaN and matches no product. */
  readonly id = input.required<number, string>({ transform: Number });

  readonly isLoading = this.catalog.isLoading;
  readonly loadError = this.catalog.loadError;
  readonly product = computed(() => this.catalog.productsById().get(this.id()));
  readonly categoryLabel = computed(() => {
    const product = this.product();
    return product ? PRODUCT_CATEGORY_LABELS[product.category] : '';
  });

  /** How many to add while the product isn't in the cart; starts at 1 for each product. */
  readonly quantity = linkedSignal({ source: this.id, computation: () => 1 });
  readonly quantityInCart = computed(
    () =>
      this.cartService.cartLines().find((line) => line.product.id === this.id())
        ?.quantity ?? 0,
  );
  readonly subtotal = computed(
    () =>
      (this.product()?.price ?? 0) * (this.quantityInCart() || this.quantity()),
  );

  constructor() {
    effect(() => {
      const product = this.product();
      const path = `/products/${this.id()}`;
      if (product) {
        const weight = product.gramaj ? ` ${product.gramaj} g.` : '';
        this.title.setTitle(`${product.title} - TestBakery Sibiu`);
        this.seo.updateMetaTags({
          description: `${product.description}${weight} Comandă online de la TestBakery Sibiu.`,
          path,
          image: product.image,
        });
      } else if (!this.isLoading()) {
        this.title.setTitle('Produsul nu a fost găsit - TestBakery Sibiu');
        this.seo.updateMetaTags({
          description: 'Produsul căutat nu există.',
          path,
          robots: 'noindex, follow',
        });
      }
    });
  }

  reloadProducts(): void {
    this.catalog.reload();
  }

  addToCart(): void {
    const product = this.product();
    if (!product) {
      return;
    }
    const before = this.quantityInCart();
    if (!this.cartService.addProductToCart(product, this.quantity())) {
      this.notificationService.show(
        `Ai deja în coș cantitatea maximă de ${MAX_QUANTITY_PER_PRODUCT} buc. din "${product.title}".`,
      );
      return;
    }
    const added = Math.min(this.quantity(), MAX_QUANTITY_PER_PRODUCT - before);
    this.notificationService.show(
      `${added} buc. din "${product.title}" au fost adăugate!`,
    );
    this.quantity.set(1);
  }

  updateCartQuantity(quantity: number): void {
    const product = this.product();
    if (product) {
      this.cartService.setProductQuantity(product, quantity);
    }
  }
}
