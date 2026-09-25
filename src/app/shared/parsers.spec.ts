import { CheckoutForm } from '../interfaces/checkout-form';
import { Order } from '../interfaces/order';
import {
  parseCartItems,
  parseCheckoutDraft,
  parseOrders,
  parseProducts,
} from './parsers';

describe('parsers', () => {
  const validProduct = {
    id: 1,
    title: 'Croissant',
    price: 8.99,
    description: 'Fraged',
    image: '/assets/images/products/sample_img.webp',
    category: 'pastry',
  };

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  describe('parseProducts', () => {
    it('keeps valid products', () => {
      expect(parseProducts([validProduct])).toEqual([validProduct]);
    });

    it('keeps a valid gramaj', () => {
      expect(parseProducts([{ ...validProduct, gramaj: 90 }])).toEqual([
        { ...validProduct, gramaj: 90 },
      ]);
    });

    it('keeps the product but drops an invalid gramaj', () => {
      expect(parseProducts([{ ...validProduct, gramaj: '90' }])).toEqual([
        validProduct,
      ]);
      expect(parseProducts([{ ...validProduct, gramaj: 0 }])).toEqual([
        validProduct,
      ]);
    });

    it('keeps ingredients and the valid allergens', () => {
      expect(
        parseProducts([
          {
            ...validProduct,
            ingredients: 'făină, unt',
            allergens: ['gluten', '', 3, 'lapte'],
          },
        ]),
      ).toEqual([
        {
          ...validProduct,
          ingredients: 'făină, unt',
          allergens: ['gluten', 'lapte'],
        },
      ]);
    });

    it('leaves out blank ingredients and empty allergen lists', () => {
      expect(
        parseProducts([{ ...validProduct, ingredients: ' ', allergens: [] }]),
      ).toEqual([validProduct]);
      expect(parseProducts([{ ...validProduct, allergens: 'gluten' }])).toEqual(
        [validProduct],
      );
    });

    it('drops unknown extra fields such as the old catalog quantity', () => {
      expect(
        parseProducts([{ ...validProduct, quantity: 0, extra: true }]),
      ).toEqual([validProduct]);
    });

    it.each([
      ['a missing title', { ...validProduct, title: undefined }],
      ['a string price', { ...validProduct, price: '8.99' }],
      ['a negative price', { ...validProduct, price: -1 }],
      ['a fractional id', { ...validProduct, id: 1.5 }],
      ['an unknown category', { ...validProduct, category: 'widgets' }],
      ['a non-object', 'croissant'],
      ['null', null],
    ])('drops a product with %s', (_, product) => {
      expect(parseProducts([product, validProduct])).toEqual([validProduct]);
    });

    it('returns an empty list for anything that is not an array', () => {
      expect(parseProducts(undefined)).toEqual([]);
      expect(parseProducts({ products: [validProduct] })).toEqual([]);
    });
  });

  describe('parseCartItems', () => {
    it('keeps valid cart items', () => {
      expect(parseCartItems([{ productId: 1, quantity: 2 }])).toEqual([
        { productId: 1, quantity: 2 },
      ]);
    });

    it('reads carts saved as full product copies by the previous version', () => {
      expect(parseCartItems([{ ...validProduct, quantity: 3 }])).toEqual([
        { productId: 1, quantity: 3 },
      ]);
    });

    it.each([
      ['a zero quantity', { productId: 1, quantity: 0 }],
      ['a fractional quantity', { productId: 1, quantity: 1.5 }],
      ['a missing product id', { quantity: 1 }],
    ])('drops an item with %s', (_, item) => {
      expect(parseCartItems([item])).toEqual([]);
    });
  });

  describe('parseCheckoutDraft', () => {
    const defaults: CheckoutForm = {
      name: '',
      email: '',
      phone: '',
      town: '',
      street: '',
      streetNumber: '',
      zip: '',
      paymentMethod: 'cash',
      acceptTerms: false,
    };

    it('restores the saved text fields and payment method, never the terms acceptance', () => {
      expect(
        parseCheckoutDraft(
          {
            name: 'Ana',
            town: 'Sibiu',
            paymentMethod: 'transfer',
            acceptTerms: true,
          },
          defaults,
        ),
      ).toEqual({
        ...defaults,
        name: 'Ana',
        town: 'Sibiu',
        paymentMethod: 'transfer',
      });
    });

    it('falls back to the defaults for fields of the wrong type or unknown payment methods', () => {
      expect(
        parseCheckoutDraft({ name: 42, paymentMethod: 'bitcoin' }, defaults),
      ).toEqual(defaults);
      expect(parseCheckoutDraft('nope', defaults)).toEqual(defaults);
    });
  });

  describe('parseOrders', () => {
    const validOrder: Order = {
      id: 'TB-20260925-0001',
      placedAt: '2026-09-25T06:00:00.000Z',
      lines: [
        {
          productId: 1,
          title: 'Croissant',
          unitPrice: 5,
          quantity: 2,
          lineTotal: 10,
        },
      ],
      totalQuantity: 2,
      totalPrice: 10,
      customer: {
        name: 'Ana',
        email: 'ana@example.com',
        phone: '0722111222',
        town: 'Sibiu',
        street: 'Mare',
        streetNumber: '1',
        zip: '550000',
      },
      paymentMethod: 'cash',
    };

    it('keeps valid orders', () => {
      expect(parseOrders([validOrder])).toEqual([validOrder]);
    });

    it.each([
      ['no lines', { ...validOrder, lines: [] }],
      [
        'a malformed line',
        { ...validOrder, lines: [{ ...validOrder.lines[0], quantity: 0 }] },
      ],
      ['an invalid date', { ...validOrder, placedAt: 'yesterday' }],
      [
        'a missing customer field',
        { ...validOrder, customer: { name: 'Ana' } },
      ],
      ['an unknown payment method', { ...validOrder, paymentMethod: 'card' }],
    ])('drops an order with %s', (_, order) => {
      expect(parseOrders([order, validOrder])).toEqual([validOrder]);
    });
  });
});
