import { CartItem } from '../interfaces/cart-item';
import {
  CheckoutForm,
  OrderCustomer,
  PAYMENT_METHODS,
  PaymentMethod,
} from '../interfaces/checkout-form';
import { Order, OrderLine } from '../interfaces/order';
import { PRODUCT_CATEGORIES, Product, ProductCategory } from '../interfaces/product';

// Data from Firebase, products.json and browser storage is only trusted after
// it has been checked here; anything malformed is dropped instead of cast.

type UnknownRecord = Readonly<Record<string, unknown>>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function isProductCategory(value: unknown): value is ProductCategory {
  return PRODUCT_CATEGORIES.some((category) => category === value);
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) > 0;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return PAYMENT_METHODS.some((method) => method === value);
}

export function parseProduct(value: unknown): Product | undefined {
  if (!isRecord(value)) return undefined;
  const { id, title, price, description, image, category, gramaj, ingredients, allergens } =
    value;
  if (
    !Number.isInteger(id) ||
    typeof title !== 'string' ||
    typeof price !== 'number' ||
    !Number.isFinite(price) ||
    price < 0 ||
    typeof description !== 'string' ||
    typeof image !== 'string' ||
    !isProductCategory(category)
  ) {
    return undefined;
  }
  // Rebuilt field by field so that unknown extra fields are not carried along.
  // The food information fields are optional: products saved before they
  // existed are still valid, they just show without them.
  const validAllergens = Array.isArray(allergens) ? allergens.filter(isNonBlankString) : [];
  return {
    id: id as number,
    title,
    price,
    description,
    image,
    category,
    ...(isPositiveNumber(gramaj) && { gramaj }),
    ...(isNonBlankString(ingredients) && { ingredients }),
    ...(validAllergens.length > 0 && { allergens: validAllergens }),
  };
}

export function parseProducts(value: unknown): Product[] {
  return parseList(value, parseProduct);
}

export function parseCartItem(value: unknown): CartItem | undefined {
  if (!isRecord(value)) return undefined;
  // `id` is the shape carts were saved in before they stored only references.
  const productId = value['productId'] ?? value['id'];
  const quantity = value['quantity'];
  if (!Number.isInteger(productId) || !isPositiveInteger(quantity)) return undefined;
  return { productId: productId as number, quantity };
}

export function parseCartItems(value: unknown): CartItem[] {
  return parseList(value, parseCartItem);
}

const CUSTOMER_FIELDS = [
  'name',
  'email',
  'phone',
  'town',
  'street',
  'streetNumber',
  'zip',
] as const satisfies readonly (keyof OrderCustomer)[];

/**
 * Reads a saved checkout draft. Every field is optional, so a partly filled
 * draft restores what it has; anything unusable falls back to `defaults`.
 * Terms acceptance is never restored: consent has to be given for each order.
 */
export function parseCheckoutDraft(value: unknown, defaults: CheckoutForm): CheckoutForm {
  if (!isRecord(value)) return defaults;
  const draft: CheckoutForm = { ...defaults };
  for (const field of CUSTOMER_FIELDS) {
    const fieldValue = value[field];
    if (typeof fieldValue === 'string') draft[field] = fieldValue;
  }
  if (isPaymentMethod(value['paymentMethod'])) draft.paymentMethod = value['paymentMethod'];
  return draft;
}

function parseOrderCustomer(value: unknown): OrderCustomer | undefined {
  if (!isRecord(value)) return undefined;
  const customer: Partial<Record<keyof OrderCustomer, string>> = {};
  for (const field of CUSTOMER_FIELDS) {
    const fieldValue = value[field];
    if (typeof fieldValue !== 'string') return undefined;
    customer[field] = fieldValue;
  }
  return customer as OrderCustomer;
}

function parseOrderLine(value: unknown): OrderLine | undefined {
  if (!isRecord(value)) return undefined;
  const { productId, title, unitPrice, quantity, lineTotal } = value;
  if (
    !Number.isInteger(productId) ||
    typeof title !== 'string' ||
    !isNonNegativeNumber(unitPrice) ||
    !isPositiveInteger(quantity) ||
    !isNonNegativeNumber(lineTotal)
  ) {
    return undefined;
  }
  return { productId: productId as number, title, unitPrice, quantity, lineTotal };
}

export function parseOrder(value: unknown): Order | undefined {
  if (!isRecord(value)) return undefined;
  const { id, placedAt, lines, totalQuantity, totalPrice, customer, paymentMethod } = value;
  const parsedCustomer = parseOrderCustomer(customer);
  const parsedLines = Array.isArray(lines) ? lines.map(parseOrderLine) : [];
  if (
    !isNonBlankString(id) ||
    typeof placedAt !== 'string' ||
    Number.isNaN(Date.parse(placedAt)) ||
    parsedLines.length === 0 ||
    parsedLines.some((line) => line === undefined) ||
    !isPositiveInteger(totalQuantity) ||
    !isNonNegativeNumber(totalPrice) ||
    !parsedCustomer ||
    !isPaymentMethod(paymentMethod)
  ) {
    return undefined;
  }
  return {
    id,
    placedAt,
    lines: parsedLines as OrderLine[],
    totalQuantity,
    totalPrice,
    customer: parsedCustomer,
    paymentMethod,
  };
}

export function parseOrders(value: unknown): Order[] {
  return parseList(value, parseOrder);
}

function parseList<T>(value: unknown, parseItem: (item: unknown) => T | undefined): T[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const parsed = parseItem(item);
    if (parsed === undefined) {
      console.warn('Skipping malformed item:', item);
      return [];
    }
    return [parsed];
  });
}
