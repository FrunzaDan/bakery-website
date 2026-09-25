import { OrderCustomer, PaymentMethod } from './checkout-form';

/**
 * A product as it was ordered. Title and price are copied, not referenced:
 * the order must keep what the customer agreed to even if the catalog changes.
 */
export interface OrderLine {
  readonly productId: number;
  readonly title: string;
  readonly unitPrice: number;
  readonly quantity: number;
  readonly lineTotal: number;
}

export interface Order {
  /** Readable id such as `TB-20260925-4821`, quoted by the customer and on bank transfers. */
  readonly id: string;
  /** ISO 8601 timestamp. */
  readonly placedAt: string;
  readonly lines: readonly OrderLine[];
  readonly totalQuantity: number;
  readonly totalPrice: number;
  readonly customer: OrderCustomer;
  readonly paymentMethod: PaymentMethod;
}
