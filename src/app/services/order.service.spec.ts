import { TestBed } from '@angular/core/testing';
import { CartLine } from '../interfaces/cart-item';
import { OrderCustomer } from '../interfaces/checkout-form';
import { Order } from '../interfaces/order';
import { LocalStorageService } from './local-storage.service';
import { NewOrder, OrderService, SIMULATED_LATENCY_MS } from './order.service';

describe('OrderService', () => {
  let service: OrderService;
  let storedOrders: Order[];

  const customer: OrderCustomer = {
    name: 'Ana',
    email: 'ana@example.com',
    phone: '0722111222',
    town: 'Sibiu',
    street: 'Mare',
    streetNumber: '1',
    zip: '550000',
  };

  const line = (id: number, price: number, quantity: number): CartLine => ({
    product: {
      id,
      title: `Produs ${id}`,
      price,
      description: '',
      image: '',
      category: 'pastry',
    },
    quantity,
  });

  const newOrder: NewOrder = {
    lines: [line(1, 8.99, 3), line(2, 12.5, 1)],
    customer,
    paymentMethod: 'transfer',
  };

  const place = async (order: NewOrder = newOrder): Promise<Order> => {
    const placed = service.placeOrder(order);
    await vi.advanceTimersByTimeAsync(SIMULATED_LATENCY_MS);
    return placed;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 25, 10, 30));
    storedOrders = [];
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LocalStorageService,
          useValue: {
            getOrders: () => storedOrders,
            setOrders: (orders: Order[]) => (storedOrders = orders),
          },
        },
      ],
    });
    service = TestBed.inject(OrderService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('only accepts the order after the simulated latency', async () => {
    const placed = service.placeOrder(newOrder);

    await vi.advanceTimersByTimeAsync(SIMULATED_LATENCY_MS - 1);
    expect(storedOrders).toEqual([]);

    await vi.advanceTimersByTimeAsync(1);
    await expect(placed).resolves.toBeDefined();
  });

  it('saves the order with copied prices, rounded totals and a dated id', async () => {
    const order = await place();

    expect(order.id).toMatch(/^TB-20260925-\d{4}$/);
    // Stamped when the backend accepts it, i.e. after the latency.
    expect(order.placedAt).toBe(
      new Date(
        new Date(2026, 8, 25, 10, 30).getTime() + SIMULATED_LATENCY_MS,
      ).toISOString(),
    );
    expect(order.lines).toEqual([
      {
        productId: 1,
        title: 'Produs 1',
        unitPrice: 8.99,
        quantity: 3,
        lineTotal: 26.97,
      },
      {
        productId: 2,
        title: 'Produs 2',
        unitPrice: 12.5,
        quantity: 1,
        lineTotal: 12.5,
      },
    ]);
    expect(order.totalQuantity).toBe(4);
    expect(order.totalPrice).toBe(39.47);
    expect(order.customer).toEqual(customer);
    expect(order.paymentMethod).toBe('transfer');
    expect(storedOrders).toEqual([order]);
  });

  it('keeps earlier orders and never reuses an id', async () => {
    const random = vi.spyOn(Math, 'random');
    random
      .mockReturnValueOnce(0.1234)
      .mockReturnValueOnce(0.1234)
      .mockReturnValueOnce(0.5678);

    const first = await place();
    const second = await place();

    expect(first.id).toBe('TB-20260925-1234');
    expect(second.id).toBe('TB-20260925-5678');
    expect(storedOrders.map((order) => order.id)).toEqual([
      first.id,
      second.id,
    ]);
  });

  it('finds a saved order by id', async () => {
    const order = await place();

    expect(service.getOrder(order.id)).toEqual(order);
    expect(service.getOrder('TB-00000000-0000')).toBeUndefined();
  });

  it('refuses an order without products', async () => {
    await expect(
      service.placeOrder({ ...newOrder, lines: [] }),
    ).rejects.toThrow();
  });
});
