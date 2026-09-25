import { inject, Injectable } from '@angular/core';
import { CartLine } from '../interfaces/cart-item';
import { OrderCustomer, PaymentMethod } from '../interfaces/checkout-form';
import { Order, OrderLine } from '../interfaces/order';
import { LocalStorageService } from './local-storage.service';

/** How long the pretend backend takes to accept an order, so the UI's pending state is real. */
export const SIMULATED_LATENCY_MS = 800;

export interface NewOrder {
  readonly lines: readonly CartLine[];
  readonly customer: OrderCustomer;
  readonly paymentMethod: PaymentMethod;
}

function roundToBani(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** `20260925` for 25 September 2026, in the customer's local time. */
function datePart(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}${month}${day}`;
}

/**
 * Places and looks up orders. This is a stand-in for a backend: orders are
 * saved in this browser's local storage after a short simulated delay. The
 * public methods are what a real API client would expose, so swapping in one
 * only changes this file.
 */
@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly localStorageService = inject(LocalStorageService);

  /** Resolves with the saved order, or rejects when it could not be saved. */
  async placeOrder(newOrder: NewOrder): Promise<Order> {
    if (newOrder.lines.length === 0) {
      throw new Error('An order needs at least one product.');
    }
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));

    const existingOrders = this.localStorageService.getOrders();
    const placedAt = new Date();
    const lines = newOrder.lines.map(({ product, quantity }): OrderLine => ({
      productId: product.id,
      title: product.title,
      unitPrice: product.price,
      quantity,
      lineTotal: roundToBani(product.price * quantity),
    }));
    const order: Order = {
      id: this.newOrderId(placedAt, existingOrders),
      placedAt: placedAt.toISOString(),
      lines,
      totalQuantity: lines.reduce((total, line) => total + line.quantity, 0),
      totalPrice: roundToBani(
        lines.reduce((total, line) => total + line.lineTotal, 0),
      ),
      customer: newOrder.customer,
      paymentMethod: newOrder.paymentMethod,
    };

    this.localStorageService.setOrders([...existingOrders, order]);
    return order;
  }

  getOrder(id: string): Order | undefined {
    return this.localStorageService
      .getOrders()
      .find((order) => order.id === id);
  }

  private newOrderId(placedAt: Date, existingOrders: readonly Order[]): string {
    const takenIds = new Set(existingOrders.map((order) => order.id));
    let id: string;
    do {
      const suffix = String(Math.floor(Math.random() * 10_000)).padStart(
        4,
        '0',
      );
      id = `TB-${datePart(placedAt)}-${suffix}`;
    } while (takenIds.has(id));
    return id;
  }
}
