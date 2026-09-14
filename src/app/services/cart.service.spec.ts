import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { LocalStorageService } from './local-storage.service';
import { Product } from '../interfaces/product';

describe('CartService', () => {
  let service: CartService;
  let localStorageServiceSpy: {
    getCartProductsLocal: ReturnType<typeof vi.fn>;
    setCartProductsLocal: ReturnType<typeof vi.fn>;
  };

  const makeProduct = (overrides: Partial<Product> = {}): Product => ({
    id: 1,
    title: 'Widget',
    price: 9.99,
    description: '',
    image: '',
    category: 'widgets',
    quantity: 1,
    ...overrides,
  });

  beforeEach(() => {
    localStorageServiceSpy = {
      getCartProductsLocal: vi.fn().mockReturnValue(null),
      setCartProductsLocal: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        CartService,
        { provide: LocalStorageService, useValue: localStorageServiceSpy },
      ],
    });

    service = TestBed.inject(CartService);
  });

  it('starts with an empty cart', () => {
    expect(service.cartProducts()).toEqual([]);
    expect(service.totalNumberOfProducts()).toBe(0);
    expect(service.totalPrice()).toBe(0);
  });

  it('adds a new product to the cart with quantity 1', () => {
    const product = makeProduct();

    const result = service.addProductToCart(product);

    expect(result).toBe(true);
    expect(service.cartProducts()).toEqual([{ ...product, quantity: 1 }]);
    expect(localStorageServiceSpy.setCartProductsLocal).toHaveBeenCalledWith([
      { ...product, quantity: 1 },
    ]);
  });

  it('increments the quantity when adding the same product again', () => {
    const product = makeProduct();

    service.addProductToCart(product);
    service.addProductToCart(product);

    expect(service.cartProducts()).toEqual([{ ...product, quantity: 2 }]);
    expect(service.totalNumberOfProducts()).toBe(2);
  });

  it('keeps distinct products separate in the cart', () => {
    const productA = makeProduct({ id: 1, price: 10 });
    const productB = makeProduct({ id: 2, price: 5 });

    service.addProductToCart(productA);
    service.addProductToCart(productB);

    expect(service.cartProducts().map((p) => p.id)).toEqual([1, 2]);
    expect(service.totalNumberOfProducts()).toBe(2);
    expect(service.totalPrice()).toBe(15);
  });

  it('rounds the total price to two decimals', () => {
    const product = makeProduct({ price: 10.005 });

    service.addProductToCart(product);
    service.addProductToCart(product);
    service.addProductToCart(product);

    expect(service.totalPrice()).toBe(30.02);
  });

  it('decrements the quantity when removing a product with quantity > 1', () => {
    const product = makeProduct();
    service.addProductToCart(product);
    service.addProductToCart(product);

    const result = service.removeProductFromCart(product);

    expect(result).toBe(true);
    expect(service.cartProducts()).toEqual([{ ...product, quantity: 1 }]);
  });

  it('removes the product entirely when its quantity drops to 0', () => {
    const product = makeProduct();
    service.addProductToCart(product);

    const result = service.removeProductFromCart(product);

    expect(result).toBe(true);
    expect(service.cartProducts()).toEqual([]);
  });

  it('returns false when trying to remove a product not in the cart', () => {
    const product = makeProduct();

    const result = service.removeProductFromCart(product);

    expect(result).toBe(false);
    expect(localStorageServiceSpy.setCartProductsLocal).not.toHaveBeenCalled();
  });

  it('removeProductsFromCart deletes the entire line regardless of quantity', () => {
    const product = makeProduct();
    service.addProductToCart(product);
    service.addProductToCart(product);

    const result = service.removeProductsFromCart(product);

    expect(result).toBe(true);
    expect(service.cartProducts()).toEqual([]);
  });

  it('removeProductsFromCart returns false for a product not in the cart', () => {
    const product = makeProduct();

    expect(service.removeProductsFromCart(product)).toBe(false);
  });

  it('removeAllCart empties the cart and persists it', () => {
    service.addProductToCart(makeProduct({ id: 1 }));
    service.addProductToCart(makeProduct({ id: 2 }));

    const result = service.removeAllCart();

    expect(result).toBe(true);
    expect(service.cartProducts()).toEqual([]);
    expect(localStorageServiceSpy.setCartProductsLocal).toHaveBeenLastCalledWith([]);
  });
});
