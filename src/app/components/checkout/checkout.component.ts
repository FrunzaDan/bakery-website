import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CheckOutForm } from '../../interfaces/check-out-form';
import { Product } from '../../interfaces/product';
import { CartService } from '../../services/cart.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { SendEmailService } from '../../services/send-email.service';

@Component({
  selector: 'app-checkout',
  imports: [RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly sendEmailService = inject(SendEmailService);
  private readonly localStorageService = inject(LocalStorageService);

  readonly totalNumberOfCartProducts = this.cartService.totalNumberOfProducts;
  readonly totalPrice = this.cartService.totalPrice;
  readonly showConfirmCheckout = signal(false);
  readonly order = signal<string | undefined>(undefined);
  readonly submitted = signal(false);

  checkOutForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{9,12}$'),
    ]),
    town: new FormControl('', [Validators.required]),
    address_line1: new FormControl('', [Validators.required]),
    address_line2: new FormControl('', [Validators.required]),
    zip: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.checkOutForm.controls;
  }

  handleBackToCartClick(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/cart']);
  }

  handleCloseConfirmCheckoutClick(event: Event): void {
    event.preventDefault();
    this.showConfirmCheckout.set(false);
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.checkOutForm.invalid) {
      return;
    }

    const checkOutFormData: CheckOutForm = this.checkOutForm.value as CheckOutForm;
    const order: string = this.buildOrder(checkOutFormData);

    if (order) {
      this.order.set(order);
      this.showConfirmCheckout.set(true);
    }
  }

  buildOrder(checkOutForm: CheckOutForm): string {
    let orderString: string = 'Comanda: \n';
    let customer_contact_info: string =
      'Nume client: ' +
      checkOutForm.name +
      '\n' +
      'E-mail client: ' +
      checkOutForm.email +
      '\n' +
      'Telefon client: ' +
      checkOutForm.phone +
      '\n' +
      'Adresă livrare client: \n' +
      'Localitate: ' +
      checkOutForm.town +
      '\n' +
      'Stradă: ' +
      checkOutForm.address_line1 +
      '\n' +
      'Număr: ' +
      checkOutForm.address_line2 +
      '\n' +
      'Cod poștal: ' +
      checkOutForm.zip +
      '\n' +
      '--------------------' +
      '\n';

    orderString += '\n' + customer_contact_info;

    let productString: string = 'Produse: ';
    let customer_ordered_products: Product[] | null =
      this.localStorageService.getCartProductsLocal();
    if (customer_ordered_products) {
      for (let product of customer_ordered_products) {
        productString +=
          '\n' +
          product.title +
          ': ' +
          product.price +
          ' RON x ' +
          product.quantity +
          ' buc.';
      }
      productString +=
        '\n' +
        '--------------------' +
        '\n' +
        'Număr produse: ' +
        this.totalNumberOfCartProducts() +
        ' buc.' +
        '\n' +
        'Preț total: ' +
        this.totalPrice() +
        ' RON';
    }

    let order: string = orderString + productString;
    return order.trim();
  }
}
