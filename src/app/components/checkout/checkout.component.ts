import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormField, FormRoot, form } from '@angular/forms/signals';
import { Router, RouterModule } from '@angular/router';
import {
  CheckoutForm,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
} from '../../interfaces/checkout-form';
import { CartService } from '../../services/cart.service';
import { NewOrder, OrderService } from '../../services/order.service';
import { SessionStorageService } from '../../services/session-storage.service';
import { SeoService } from '../../services/seo.service';
import { reportInvalidFields } from '../../shared/invalid-summary';
import { RonPipe } from '../../shared/ron.pipe';
import {
  checkoutFormSchema,
  emptyCheckoutForm,
  toOrderCustomer,
} from './checkout-form';

const PAYMENT_METHOD_HINTS = {
  cash: 'Plătești curierului, cash, când primești comanda.',
  transfer: 'Primești datele de plată după plasarea comenzii.',
} as const;

@Component({
  selector: 'app-checkout',
  imports: [RouterModule, FormField, FormRoot, RonPipe],
  providers: [RonPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly sessionStorageService = inject(SessionStorageService);
  private readonly router = inject(Router);
  private readonly ron = inject(RonPipe);

  readonly paymentMethods = PAYMENT_METHODS.map((value) => ({
    value,
    label: PAYMENT_METHOD_LABELS[value],
    hint: PAYMENT_METHOD_HINTS[value],
  }));

  readonly totalNumberOfCartProducts = this.cartService.totalNumberOfProducts;
  readonly totalPrice = this.cartService.totalPrice;
  /** The order text awaiting confirmation; the confirmation dialog is open while it is set. */
  readonly order = signal<string | null>(null);
  readonly showConfirmCheckout = computed(() => this.order() !== null);
  readonly invalidSummary = signal<string | null>(null);
  readonly isPlacingOrder = signal(false);
  readonly placeOrderError = signal<string | null>(null);

  /**
   * The order exactly as shown in the confirmation dialog, so what is placed is
   * what the customer confirmed even if the cart changes in another tab meanwhile.
   */
  private pendingOrder: NewOrder | null = null;

  // The draft is read right away, not after hydration: it only fills in input
  // values, which leaves the server-rendered page structure unchanged.
  readonly model = signal<CheckoutForm>(
    this.sessionStorageService.getCheckoutDraft(emptyCheckoutForm()),
  );
  readonly checkoutForm = form(this.model, checkoutFormSchema, {
    submission: {
      action: async () => {
        const lines = this.cartService.cartLines();
        if (lines.length === 0) {
          this.invalidSummary.set(
            'Coșul tău este gol. Adaugă produse înainte de a plasa comanda.',
          );
          return;
        }
        this.invalidSummary.set(null);
        this.placeOrderError.set(null);
        const checkoutForm = this.model();
        this.pendingOrder = {
          lines,
          customer: toOrderCustomer(checkoutForm),
          paymentMethod: checkoutForm.paymentMethod,
        };
        this.order.set(this.buildOrder(checkoutForm));
      },
      onInvalid: (field) => this.invalidSummary.set(reportInvalidFields(field)),
    },
  });

  constructor() {
    effect(() => this.sessionStorageService.setCheckoutDraft(this.model()));
  }

  closeConfirmCheckout(): void {
    if (this.isPlacingOrder()) {
      return;
    }
    this.order.set(null);
    this.pendingOrder = null;
  }

  async confirmOrder(): Promise<void> {
    const pendingOrder = this.pendingOrder;
    if (!pendingOrder || this.isPlacingOrder()) {
      return;
    }
    this.isPlacingOrder.set(true);
    this.placeOrderError.set(null);
    try {
      const placedOrder = await this.orderService.placeOrder(pendingOrder);
      this.cartService.removeAllCart();
      this.sessionStorageService.clearCheckoutDraft();
      this.pendingOrder = null;
      await this.router.navigate(['/order', placedOrder.id]);
    } catch (error: unknown) {
      console.error('Error placing the order:', error);
      this.placeOrderError.set(
        'Comanda nu a putut fi plasată. Te rugăm să încerci din nou.',
      );
    } finally {
      this.isPlacingOrder.set(false);
    }
  }

  buildOrder(checkoutForm: CheckoutForm): string {
    const customer = toOrderCustomer(checkoutForm);
    const customerContactInfo = [
      `Nume client: ${customer.name}`,
      `E-mail client: ${customer.email}`,
      `Telefon client: ${customer.phone}`,
      'Adresă livrare client: ',
      `Localitate: ${customer.town}`,
      `Stradă: ${customer.street}`,
      `Număr: ${customer.streetNumber}`,
      `Cod poștal: ${customer.zip}`,
      `Metodă de plată: ${PAYMENT_METHOD_LABELS[checkoutForm.paymentMethod]}`,
      '--------------------',
    ].join('\n');

    let productString = 'Produse: ';
    const cartLines = this.cartService.cartLines();
    if (cartLines.length !== 0) {
      for (const { product, quantity } of cartLines) {
        productString += `\n${product.title}: ${this.ron.transform(product.price)} x ${quantity} buc.`;
      }
      productString +=
        '\n--------------------' +
        `\nNumăr produse: ${this.totalNumberOfCartProducts()} buc.` +
        `\nPreț total: ${this.ron.transform(this.totalPrice())}`;
    }

    return `Comanda: \n\n${customerContactInfo}\n${productString}`.trim();
  }

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      description: 'Finalizează comanda la TestBakery Sibiu.',
      path: '/checkout',
      robots: 'noindex, follow',
    });
  }
}
