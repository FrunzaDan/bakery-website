import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CartLine } from '../../interfaces/cart-item';
import { CartService } from '../../services/cart.service';
import { ProductCatalogService } from '../../services/product-catalog.service';
import { CartComponent } from './cart.component';

describe('CartComponent', () => {
  const croissant: CartLine = {
    product: { id: 1, title: 'Croissant', price: 5, description: '', image: '', category: 'pastry' },
    quantity: 2,
  };

  const cartLines = signal<readonly CartLine[]>([]);
  const hasItems = signal(false);
  const isLoading = signal(false);
  const loadError = signal<string | null>(null);
  const reload = vi.fn();

  const render = async (): Promise<HTMLElement> => {
    TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [
        provideRouter([]),
        {
          provide: CartService,
          useValue: {
            cartLines,
            hasItems,
            totalNumberOfProducts: signal(croissant.quantity),
            totalPrice: signal(10),
          },
        },
        { provide: ProductCatalogService, useValue: { isLoading, loadError, reload } },
      ],
    });
    const fixture = TestBed.createComponent(CartComponent);
    await fixture.whenStable();
    return fixture.nativeElement;
  };

  beforeEach(() => {
    cartLines.set([]);
    hasItems.set(false);
    isLoading.set(false);
    loadError.set(null);
    reload.mockClear();
  });

  it('lists the cart lines with their prices', async () => {
    cartLines.set([croissant]);
    hasItems.set(true);

    const el = await render();

    expect(el.querySelector('tbody')?.textContent).toContain('Croissant');
    expect(el.textContent).toContain('5.00 RON');
  });

  it('says the cart is empty when nothing is stored', async () => {
    isLoading.set(true);

    const el = await render();

    expect(el.textContent).toContain('Comanda ta este goală');
  });

  it('shows a loading message, not an empty cart, while the products load', async () => {
    hasItems.set(true);
    isLoading.set(true);

    const el = await render();

    expect(el.textContent).toContain('Se încarcă produsele...');
    expect(el.textContent).not.toContain('Comanda ta este goală');
  });

  it('shows the load error with a retry button when the products fail to load', async () => {
    hasItems.set(true);
    loadError.set('Produsele nu au putut fi încărcate.');

    const el = await render();

    const alert = el.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Produsele nu au putut fi încărcate.');
    expect(el.textContent).not.toContain('Comanda ta este goală');

    alert!.querySelector('button')!.click();
    expect(reload).toHaveBeenCalled();
  });
});
