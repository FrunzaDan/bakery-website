
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { fadeIn, fadeOut, transformIn, transformOut } from '../../animations';
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
    animations: [transformIn, transformOut, fadeIn, fadeOut]
})
export class CheckoutComponent implements OnInit {
  public totalNumberOfCartProducts!: number;
  public totalPrice!: number;
  public showConfirmCheckout: boolean = false;
  public order?: string;

  constructor(
    private cartService: CartService,
    private router: Router,
    private sendEmailService: SendEmailService,
    private localStorageService: LocalStorageService
  ) {}

  submitted: boolean = false;

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

  ngOnInit(): void {
    this.displayTotalNumberOfCartProducts();
    this.displayTotalPrice();
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

  handleBackToCartClick(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/cart']);
  }

  handleCloseConfirmCheckoutClick(event: Event): void {
    event.preventDefault();
    this.showConfirmCheckout = false;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.checkOutForm.invalid) {
      return;
    }

    let checkOutFormData: CheckOutForm = this.checkOutForm
      .value as CheckOutForm;
    this.order = this.buildOrder(checkOutFormData);

    if (this.order) {
      this.showConfirmCheckout = true;
    }
    // this.resetForm(checkOutFormData);
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
        this.totalNumberOfCartProducts +
        ' buc.' +
        '\n' +
        'Preț total: ' +
        this.totalPrice +
        ' RON';
    }

    let order: string = orderString + productString;
    return order.trim();
  }

  resetForm(checkOutForm: CheckOutForm): void {
    this.checkOutForm.reset();
    this.checkOutForm.controls.name.setErrors(null);
    this.checkOutForm.controls.email.setErrors(null);
    this.checkOutForm.controls.phone.setErrors(null);
    this.checkOutForm.controls.town.setErrors(null);
    this.checkOutForm.controls.address_line1.setErrors(null);
    this.checkOutForm.controls.address_line2.setErrors(null);
    this.checkOutForm.controls.zip.setErrors(null);
  }
}
