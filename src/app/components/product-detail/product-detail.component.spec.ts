import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CartLine } from '../../interfaces/cart-item';
import { Product } from '../../interfaces/product';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { ProductCatalogService } from '../../services/product-catalog.service';
import { ProductDetailComponent } from './product-detail.component';

describe('ProductDetailComponent', () => {
  const croissant: Product = {
    id: 2,
    title: 'Croissant cu Unt',
    price: 8.99,
    description: 'Fraged și crocant.',
    image: '/croissant.webp',
    category: 'pastry',
    gramaj: 90,
    ingredients: 'făină de grâu, unt, lapte',
    allergens: ['gluten', 'lapte'],
  };
  const baguette: Product = {
    id: 10,
    title: 'Baghetă',
    price: 5,
    description: '',
    image: '',
    category: 'bakeries',
  };

  const productsById = signal(new Map<number, Product>());
  const isLoading = signal(false);
  const loadError = signal<string | null>(null);
  const cartLines = signal<readonly CartLine[]>([]);
  const addProductToCart = vi.fn(() => true);

  let harness: RouterTestingHarness;

  const open = async (url: string): Promise<{ el: HTMLElement; component: ProductDetailComponent }> => {
    const component = await harness.navigateByUrl(url, ProductDetailComponent);
    await harness.fixture.whenStable();
    return { el: harness.routeNativeElement!, component };
  };

  beforeEach(async () => {
    productsById.set(new Map([[croissant.id, croissant], [baguette.id, baguette]]));
    isLoading.set(false);
    loadError.set(null);
    cartLines.set([]);
    addProductToCart.mockClear();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'products/:id', component: ProductDetailComponent }], withComponentInputBinding()),
        { provide: ProductCatalogService, useValue: { productsById, isLoading, loadError, reload: vi.fn() } },
        { provide: CartService, useValue: { cartLines, addProductToCart } },
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  it('shows the product with its weight, price and food information', async () => {
    const { el } = await open('/products/2');

    expect(el.querySelector('h1')?.textContent).toContain('Croissant cu Unt');
    expect(el.textContent).toContain('90 g');
    expect(el.textContent).toContain('8,99 RON');
    expect(el.textContent).toContain('făină de grâu, unt, lapte');
    expect(el.textContent).toContain('Conține: gluten, lapte.');
    expect(TestBed.inject(Title).getTitle()).toBe('Croissant cu Unt - TestBakery Sibiu');
  });

  it('says where to ask when the food information is missing', async () => {
    const { el } = await open('/products/10');

    expect(el.textContent).toContain('Lista de ingrediente este disponibilă la cerere');
    expect(el.textContent).toContain('Informațiile despre alergeni sunt disponibile la cerere');
  });

  it('adds the chosen quantity to the cart and starts again from 1', async () => {
    const { el, component } = await open('/products/2');

    const input = el.querySelector<HTMLInputElement>('input[type="number"]')!;
    input.value = '4';
    input.dispatchEvent(new Event('change'));
    expect(component.subtotal()).toBeCloseTo(35.96);

    component.addToCart();

    expect(addProductToCart).toHaveBeenCalledWith(croissant, 4);
    expect(TestBed.inject(NotificationService).notifications()[0].message).toBe(
      '4 buc. din "Croissant cu Unt" au fost adăugate!',
    );
    expect(component.quantity()).toBe(1);
  });

  it('tells the customer when the cart already holds the maximum', async () => {
    addProductToCart.mockReturnValue(false);
    const { component } = await open('/products/2');

    component.addToCart();

    expect(TestBed.inject(NotificationService).notifications()[0].message).toContain(
      'cantitatea maximă de 99 buc.',
    );
  });

  it('shows a skeleton while the catalog loads', async () => {
    productsById.set(new Map());
    isLoading.set(true);

    const { el } = await open('/products/2');

    expect(el.querySelector('.skeleton')).not.toBeNull();
    expect(el.querySelector('[role="status"]')?.textContent).toContain('Se încarcă produsul');
  });

  it('says the product was not found for an unknown or non-numeric id', async () => {
    expect((await open('/products/999')).el.textContent).toContain('Produsul nu a fost găsit');
    expect((await open('/products/abc')).el.textContent).toContain('Produsul nu a fost găsit');
  });
});
