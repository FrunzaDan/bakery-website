import { parseCartItems, parseProducts } from './parsers';

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

    it('drops unknown extra fields such as the old catalog quantity', () => {
      expect(parseProducts([{ ...validProduct, quantity: 0, extra: true }])).toEqual([
        validProduct,
      ]);
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
});
