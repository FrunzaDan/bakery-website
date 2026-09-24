import { Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, form } from '@angular/forms/signals';
import { RouterModule } from '@angular/router';
import { CheckoutForm } from '../../interfaces/checkout-form';
import { CartService } from '../../services/cart.service';
import { reportInvalidFields } from '../../shared/invalid-summary';
import { RonPipe } from '../../shared/ron.pipe';
import { checkoutFormSchema, emptyCheckoutForm } from './checkout-form';

@Component({
  selector: 'app-checkout',
  imports: [RouterModule, FormField, FormRoot, RonPipe],
  providers: [RonPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent {
  private readonly cartService = inject(CartService);
  private readonly ron = inject(RonPipe);

  readonly totalNumberOfCartProducts = this.cartService.totalNumberOfProducts;
  readonly totalPrice = this.cartService.totalPrice;
  readonly showConfirmCheckout = signal(false);
  readonly order = signal<string | undefined>(undefined);
  readonly invalidSummary = signal<string | null>(null);

  readonly model = signal<CheckoutForm>(emptyCheckoutForm());
  readonly checkoutForm = form(this.model, checkoutFormSchema, {
    submission: {
      action: async () => {
        this.invalidSummary.set(null);
        this.order.set(this.buildOrder(this.model()));
        this.showConfirmCheckout.set(true);
      },
      onInvalid: (field) => this.invalidSummary.set(reportInvalidFields(field)),
    },
  });

  closeConfirmCheckout(): void {
    this.showConfirmCheckout.set(false);
  }

  buildOrder(checkoutForm: CheckoutForm): string {
    const customerContactInfo = [
      `Nume client: ${checkoutForm.name}`,
      `E-mail client: ${checkoutForm.email}`,
      `Telefon client: ${checkoutForm.phone}`,
      'Adresă livrare client: ',
      `Localitate: ${checkoutForm.town}`,
      `Stradă: ${checkoutForm.street}`,
      `Număr: ${checkoutForm.streetNumber}`,
      `Cod poștal: ${checkoutForm.zip}`,
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
}
