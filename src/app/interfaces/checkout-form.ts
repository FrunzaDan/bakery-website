export const PAYMENT_METHODS = ['cash', 'transfer'] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Readonly<Record<PaymentMethod, string>> = {
  cash: 'Numerar la livrare',
  transfer: 'Transfer bancar',
};

export interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  town: string;
  street: string;
  streetNumber: string;
  zip: string;
  paymentMethod: PaymentMethod;
  acceptTerms: boolean;
}

/** The customer details an order is delivered to; the checkout form minus its choices. */
export type OrderCustomer = Omit<CheckoutForm, 'paymentMethod' | 'acceptTerms'>;
