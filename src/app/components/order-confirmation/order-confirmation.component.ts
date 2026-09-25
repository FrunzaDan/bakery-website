import { DatePipe } from '@angular/common';
import { afterRenderEffect, Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PAYMENT_METHOD_LABELS } from '../../interfaces/checkout-form';
import { Order } from '../../interfaces/order';
import { OrderService } from '../../services/order.service';
import { RonPipe } from '../../shared/ron.pipe';

/** Demo bank details for paying by transfer; the IBAN is the standard Romanian example. */
export const BANK_DETAILS = {
  beneficiary: 'TestBakery SRL',
  iban: 'RO49 AAAA 1B31 0075 9384 0000',
  bank: 'Banca Exemplu',
  proofEmail: 'test@testbakery.ro',
} as const;

/** `/order/:id`: the thank-you page shown after an order is placed, and a receipt to come back to. */
@Component({
  selector: 'app-order-confirmation',
  imports: [RouterLink, RonPipe, DatePipe],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.css',
})
export class OrderConfirmationComponent {
  private readonly orderService = inject(OrderService);

  readonly id = input.required<string>();
  readonly paymentMethodLabels = PAYMENT_METHOD_LABELS;
  readonly bankDetails = BANK_DETAILS;

  /**
   * `undefined` until read, `null` when there is no such order. Orders live in
   * this browser's storage, so they are read after rendering: the server and
   * the first client render then agree on the loading state.
   */
  readonly order = signal<Order | null | undefined>(undefined);

  constructor() {
    afterRenderEffect(() => {
      this.order.set(this.orderService.getOrder(this.id()) ?? null);
    });
  }
}
