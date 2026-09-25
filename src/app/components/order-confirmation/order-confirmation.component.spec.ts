import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Order } from '../../interfaces/order';
import { OrderService } from '../../services/order.service';
import { OrderConfirmationComponent } from './order-confirmation.component';

describe('OrderConfirmationComponent', () => {
  const order: Order = {
    id: 'TB-20260925-4821',
    placedAt: '2026-09-25T07:30:00.000Z',
    lines: [{ productId: 2, title: 'Croissant cu Unt', unitPrice: 8.99, quantity: 2, lineTotal: 17.98 }],
    totalQuantity: 2,
    totalPrice: 17.98,
    customer: {
      name: 'Ana Pop',
      email: 'ana@example.com',
      phone: '0722111222',
      town: 'Sibiu',
      street: 'Mare',
      streetNumber: '1',
      zip: '550000',
    },
    paymentMethod: 'cash',
  };

  let orders: Order[];

  const open = async (url: string): Promise<HTMLElement> => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, OrderConfirmationComponent);
    await harness.fixture.whenStable();
    return harness.routeNativeElement!;
  };

  beforeEach(() => {
    orders = [order];
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'order/:id', component: OrderConfirmationComponent }], withComponentInputBinding()),
        { provide: OrderService, useValue: { getOrder: (id: string) => orders.find((o) => o.id === id) } },
      ],
    });
  });

  it('thanks the customer and shows the order number, products and total', async () => {
    const el = await open('/order/TB-20260925-4821');

    expect(el.textContent).toContain('Mulțumim, Ana Pop!');
    expect(el.textContent).toContain('TB-20260925-4821');
    expect(el.textContent).toContain('Croissant cu Unt');
    expect(el.textContent).toContain('17,98 RON');
    expect(el.textContent).toContain('curierului, la livrare');
  });

  it('shows the bank details for a bank transfer, with the order number as reference', async () => {
    orders = [{ ...order, paymentMethod: 'transfer' }];

    const el = await open('/order/TB-20260925-4821');

    expect(el.textContent).toContain('IBAN');
    expect(el.querySelector('.bank-details')?.textContent).toContain('Comanda TB-20260925-4821');
  });

  it('says when the order is not found', async () => {
    const el = await open('/order/TB-00000000-0000');

    expect(el.textContent).toContain('Comanda nu a fost găsită');
  });
});
