import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { LocalStorageService } from './local-storage.service';
import { ProductCatalogService } from './product-catalog.service';
import { Product } from '../interfaces/product';

describe('CartService', () => {
  let service: CartService;
  let catalogProducts: ReturnType<typeof signal<Product[]>>;
  let localStorageServiceSpy: {
    getCartItems: ReturnType<typeof vi.fn>;
    setCartItems: ReturnType<typeof vi.fn>;
  };

  const makeProduct = (overrides: Partial<Product> = {}): Product => ({
    id: 1,
    title: 'Widget',
    price: 9.99,
    description: '',
    image: '',
    category: 'pastry',
    ...overrides,
  });

  const productA = makeProduct({ id: 1, price: 10 });
  const productB = makeProduct({ id: 2, price: 5 });

  beforeEach(() => {
    catalogProducts = signal([productA, productB]);
    localStorageServiceSpy = {
      getCartItems: vi.fn().mockReturnValue([]),
      setCartItems: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        CartService,
        { provide: LocalStorageService, useValue: localStorageServiceSpy },
        {
          provide: ProductCatalogService,
          useValue: {
            productsById: computed(() => new Map(catalogProducts().map((p) => [p.id, p]))),
          },
        },
      ],
    });

    service = TestBed.inject(CartService);
  });

  it('starts with an empty cart', () => {
    expect(service.cartLines()).toEqual([]);
    expect(service.totalNumberOfProducts()).toBe(0);
    expect(service.totalPrice()).toBe(0);
  });

  it('adds a new product to the cart with quantity 1 and stores only its id', () => {
    service.addProductToCart(productA);

    expect(service.cartLines()).toEqual([{ product: productA, quantity: 1 }]);
    expect(localStorageServiceSpy.setCartItems).toHaveBeenCalledWith([
      { productId: 1, quantity: 1 },
    ]);
  });

  it('increments the quantity when adding the same product again', () => {
    service.addProductToCart(productA);
    service.addProductToCart(productA);

    expect(service.cartLines()).toEqual([{ product: productA, quantity: 2 }]);
    expect(service.totalNumberOfProducts()).toBe(2);
  });

  it('keeps distinct products separate in the cart', () => {
    service.addProductToCart(productA);
    service.addProductToCart(productB);

    expect(service.cartLines().map((line) => line.product.id)).toEqual([1, 2]);
    expect(service.totalNumberOfProducts()).toBe(2);
    expect(service.totalPrice()).toBe(15);
  });

  it('rounds the total price to two decimals', () => {
    const product = makeProduct({ id: 3, price: 10.005 });
    catalogProducts.set([product]);

    service.addProductToCart(product);
    service.addProductToCart(product);
    service.addProductToCart(product);

    expect(service.totalPrice()).toBe(30.02);
  });

  it('takes titles and prices from the current catalog, not from when the product was added', () => {
    service.addProductToCart(productA);
    catalogProducts.set([{ ...productA, title: 'Renamed', price: 12 }, productB]);

    expect(service.cartLines()[0].product.title).toBe('Renamed');
    expect(service.totalPrice()).toBe(12);
  });

  it('leaves out items whose product is no longer in the catalog', () => {
    service.addProductToCart(productA);
    service.addProductToCart(productB);
    catalogProducts.set([productB]);

    expect(service.cartLines()).toEqual([{ product: productB, quantity: 1 }]);
    expect(service.totalNumberOfProducts()).toBe(1);
  });

  it('decrements the quantity when removing a product with quantity > 1', () => {
    service.addProductToCart(productA);
    service.addProductToCart(productA);

    service.removeProductFromCart(productA);

    expect(service.cartLines()).toEqual([{ product: productA, quantity: 1 }]);
  });

  it('removes the product entirely when its quantity drops to 0', () => {
    service.addProductToCart(productA);

    service.removeProductFromCart(productA);

    expect(service.cartLines()).toEqual([]);
  });

  it('removeProductsFromCart deletes the entire line regardless of quantity', () => {
    service.addProductToCart(productA);
    service.addProductToCart(productA);
    service.addProductToCart(productB);

    service.removeProductsFromCart(productA);

    expect(service.cartLines()).toEqual([{ product: productB, quantity: 1 }]);
  });

  it('removeAllCart empties the cart and persists it', () => {
    service.addProductToCart(productA);
    service.addProductToCart(productB);

    service.removeAllCart();

    expect(service.cartLines()).toEqual([]);
    expect(localStorageServiceSpy.setCartItems).toHaveBeenLastCalledWith([]);
  });
});
