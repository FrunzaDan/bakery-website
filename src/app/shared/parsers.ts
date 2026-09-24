import { CartItem } from '../interfaces/cart-item';
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

export function parseProduct(value: unknown): Product | undefined {
  if (!isRecord(value)) return undefined;
  const { id, title, price, description, image, category } = value;
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
  return { id: id as number, title, price, description, image, category };
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
