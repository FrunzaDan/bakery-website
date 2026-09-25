import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CartLine } from '../../interfaces/cart-item';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { ProductCatalogService } from '../../services/product-catalog.service';
import { CartComponent } from './cart.component';

describe('CartComponent', () => {
  const croissant: CartLine = {
    product: {
      id: 1,
      title: 'Croissant',
      price: 5,
      description: '',
      image: '',
      category: 'pastry',
    },
    quantity: 2,
  };

  const cartLines = signal<readonly CartLine[]>([]);
  const hasItems = signal(false);
  const isLoading = signal(false);
  const loadError = signal<string | null>(null);
  const reload = vi.fn();
  const setProductQuantity = vi.fn();
  const undoRemove = vi.fn();
  const removeProductsFromCart = vi.fn(() => undoRemove);
  const undoEmpty = vi.fn();
  const removeAllCart = vi.fn(() => undoEmpty);

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
            setProductQuantity,
            removeProductsFromCart,
            removeAllCart,
          },
        },
        {
          provide: ProductCatalogService,
          useValue: { isLoading, loadError, reload },
        },
      ],
    });
    const fixture = TestBed.createComponent(CartComponent);
    await fixture.whenStable();
    return fixture.nativeElement;
  };

  const quantityInput = (el: HTMLElement): HTMLInputElement =>
    el.querySelector('.cart-line input[type="number"]')!;

  const typeQuantity = (el: HTMLElement, value: string): void => {
    const input = quantityInput(el);
    input.value = value;
    input.dispatchEvent(new Event('change'));
  };

  const clickUndo = (): void => {
    const notifications = TestBed.inject(NotificationService);
    notifications.runAction(notifications.notifications()[0].id);
  };

  beforeEach(() => {
    cartLines.set([]);
    hasItems.set(false);
    isLoading.set(false);
    loadError.set(null);
    vi.clearAllMocks();
  });

  it('lists the cart lines with their prices', async () => {
    cartLines.set([croissant]);
    hasItems.set(true);

    const el = await render();

    expect(el.querySelector('.cart-lines')?.textContent).toContain('Croissant');
    expect(el.textContent).toContain('5,00 RON');
    expect(el.querySelector('.line-total')?.textContent).toContain('10,00 RON');
  });

  it('sets a typed quantity', async () => {
    cartLines.set([croissant]);
    hasItems.set(true);
    const el = await render();

    typeQuantity(el, '7');

    expect(setProductQuantity).toHaveBeenCalledWith(croissant.product, 7);
  });

  it('keeps a typed quantity within the limit and undoes non-numbers', async () => {
    cartLines.set([croissant]);
    hasItems.set(true);
    const el = await render();

    typeQuantity(el, '500');
    expect(setProductQuantity).toHaveBeenLastCalledWith(croissant.product, 99);

    setProductQuantity.mockClear();
    typeQuantity(el, 'abc');
    expect(setProductQuantity).not.toHaveBeenCalled();
    expect(quantityInput(el).value).toBe('99');
  });

  it('removes the line when 0 is typed, with an undo in the notification', async () => {
    cartLines.set([croissant]);
    hasItems.set(true);
    const el = await render();

    typeQuantity(el, '0');

    expect(removeProductsFromCart).toHaveBeenCalledWith(croissant.product);
    const [notification] = TestBed.inject(NotificationService).notifications();
    expect(notification.message).toBe('"Croissant" a fost șters!');
    expect(notification.action?.label).toBe('Anulează');

    clickUndo();
    expect(undoRemove).toHaveBeenCalled();
  });

  it('can undo emptying the cart', async () => {
    cartLines.set([croissant]);
    hasItems.set(true);
    const el = await render();

    Array.from(el.querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Golește'))!
      .click();
    clickUndo();

    expect(removeAllCart).toHaveBeenCalled();
    expect(undoEmpty).toHaveBeenCalled();
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
