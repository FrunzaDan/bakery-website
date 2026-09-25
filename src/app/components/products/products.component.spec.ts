import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  Router,
  provideRouter,
  withComponentInputBinding,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { ProductsComponent } from './products.component';
import { Product, ProductCategory } from '../../interfaces/product';
import { CartService } from '../../services/cart.service';
import { FetchProductsService } from '../../services/fetch-products.service';

describe('ProductsComponent', () => {
  let harness: RouterTestingHarness;
  let component: ProductsComponent;
  let router: Router;

  const product = (
    id: number,
    title: string,
    price: number,
    category: ProductCategory,
  ): Product => ({
    id,
    title,
    price,
    category,
    description: '',
    image: '',
  });

  const products: Product[] = [
    product(1, 'Pâine albă', 5, 'basic_products'),
    product(2, 'Tort de ciocolată', 120, 'sweets'),
    product(3, 'Covrig', 3, 'pastry'),
    product(4, 'Tort de fructe', 90, 'sweets'),
  ];

  const titles = (): string[] =>
    component.visibleProducts().map((p) => p.title);

  const queryParams = (): Record<string, string> =>
    router.parseUrl(router.url).queryParams as Record<string, string>;

  const navigate = async (url: string): Promise<void> => {
    component = await harness.navigateByUrl(url, ProductsComponent);
    await harness.fixture.whenStable();
  };

  const element = (selector: string): HTMLElement =>
    harness.routeNativeElement!.querySelector(selector) as HTMLElement;

  const searchInput = (): HTMLInputElement =>
    element('input[type="search"]') as HTMLInputElement;

  const typeInSearch = async (text: string): Promise<void> => {
    const input = searchInput();
    input.value = text;
    input.dispatchEvent(new Event('input'));
    await new Promise((resolve) => setTimeout(resolve, 350));
    await harness.fixture.whenStable();
  };

  const clickLink = async (text: string): Promise<void> => {
    const link = Array.from(
      harness.routeNativeElement!.querySelectorAll('a'),
    ).find((a) => a.textContent?.trim() === text);
    link!.click();
    await harness.fixture.whenStable();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [{ path: 'products', component: ProductsComponent }],
          withComponentInputBinding(),
        ),
        {
          provide: FetchProductsService,
          useValue: { fetchProducts: () => of(products) },
        },
        {
          provide: CartService,
          useValue: {
            totalNumberOfProducts: signal(0),
            addProductToCart: vi.fn(),
          },
        },
      ],
    });

    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  describe('reading filters from the URL', () => {
    it('shows every product when there are no query params', async () => {
      await navigate('/products');
      expect(titles()).toEqual(products.map((p) => p.title));
    });

    it('filters by the category query param', async () => {
      await navigate('/products?category=sweets');
      expect(titles()).toEqual(['Tort de ciocolată', 'Tort de fructe']);
      expect(element('.selected-btn').textContent?.trim()).toBe('Torturi');
    });

    it('filters by the q query param case-insensitively, ignoring surrounding whitespace', async () => {
      await navigate('/products?q=%20TORT%20');
      expect(titles()).toEqual(['Tort de ciocolată', 'Tort de fructe']);
      expect(searchInput().value).toBe('TORT');
    });

    it('combines category and search', async () => {
      await navigate('/products?category=sweets&q=fructe');
      expect(titles()).toEqual(['Tort de fructe']);
    });

    it('sorts by the sort query param without mutating the product list', async () => {
      await navigate('/products?category=sweets&sort=price-asc');
      expect(titles()).toEqual(['Tort de fructe', 'Tort de ciocolată']);

      await navigate('/products?category=sweets');
      expect(titles()).toEqual(['Tort de ciocolată', 'Tort de fructe']);
    });

    it('ignores unknown category and sort values', async () => {
      await navigate('/products?category=nope&sort=nope');
      expect(component.category()).toBeUndefined();
      expect(component.sort()).toBeUndefined();
      expect(titles()).toEqual(products.map((p) => p.title));
    });

    it('follows the URL when it changes, e.g. on back/forward', async () => {
      await navigate('/products?q=tort');
      await navigate('/products?q=covrig');
      expect(searchInput().value).toBe('covrig');
      expect(titles()).toEqual(['Covrig']);
    });
  });

  describe('searching', () => {
    it('ignores diacritics and case in both directions', async () => {
      await navigate('/products?q=paine');
      expect(titles()).toEqual(['Pâine albă']);

      await navigate('/products?q=CIOCOLATĂ');
      expect(titles()).toEqual(['Tort de ciocolată']);

      await navigate('/products?q=ciocolata');
      expect(titles()).toEqual(['Tort de ciocolată']);
    });
  });

  describe('writing filters to the URL', () => {
    it('sets the category and keeps the other params', async () => {
      await navigate('/products?q=tort&sort=price-asc');
      await clickLink('Torturi');
      expect(queryParams()).toEqual({
        q: 'tort',
        sort: 'price-asc',
        category: 'sweets',
      });
    });

    it('removes the category param when "Toate" is chosen', async () => {
      await navigate('/products?category=sweets&q=tort');
      await clickLink('Toate');
      expect(queryParams()).toEqual({ q: 'tort' });
    });

    it('sets the sort param from the sort menu', async () => {
      await navigate('/products?category=sweets');
      await clickLink('Preț: mic - mare');
      expect(queryParams()).toEqual({ category: 'sweets', sort: 'price-asc' });
      expect(titles()).toEqual(['Tort de fructe', 'Tort de ciocolată']);
    });

    it('writes the trimmed search term to the URL once typing pauses', async () => {
      await navigate('/products?category=sweets');
      await typeInSearch('  fructe ');
      expect(queryParams()).toEqual({ category: 'sweets', q: 'fructe' });
      expect(titles()).toEqual(['Tort de fructe']);
      expect(searchInput().value).toBe('  fructe ');
    });

    it('removes the q param when the search box is cleared', async () => {
      await navigate('/products?q=tort');
      await typeInSearch('');
      expect(queryParams()).toEqual({});
    });

    it('replaces the history entry instead of pushing one per search', async () => {
      await navigate('/products');
      const navigateSpy = vi.spyOn(router, 'navigate');
      await typeInSearch('tort');
      expect(navigateSpy).toHaveBeenCalledWith(
        [],
        expect.objectContaining({
          replaceUrl: true,
          queryParams: { q: 'tort' },
        }),
      );
    });
  });

  describe('results feedback', () => {
    it('announces the number of results', async () => {
      await navigate('/products?q=tort');
      expect(component.resultsAnnouncement()).toBe('2 produse găsite');
      await navigate('/products?q=covrig');
      expect(component.resultsAnnouncement()).toBe('1 produs găsit');
    });

    it('mentions the search term when nothing matches', async () => {
      await navigate('/products?q=croissant');
      expect(harness.routeNativeElement!.textContent).toContain('„croissant”');
    });

    it('shows an error instead of an empty list when the catalog fails to load', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      TestBed.inject(FetchProductsService).fetchProducts = () =>
        throwError(() => new Error('offline'));

      await navigate('/products');

      const alert = harness.routeNativeElement!.querySelector('[role="alert"]');
      expect(alert?.textContent).toContain(
        'Produsele nu au putut fi încărcate',
      );
      expect(component.visibleProducts()).toEqual([]);
    });
  });

  describe('sort menu', () => {
    const toggle = (): HTMLButtonElement =>
      element('.dropdown-toggle') as HTMLButtonElement;
    const menu = (): HTMLElement => element('#sort-menu');
    const options = (): HTMLElement[] =>
      Array.from(menu().querySelectorAll<HTMLElement>('.dropdown-item'));

    const press = async (key: string, target: HTMLElement): Promise<void> => {
      target.dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true }),
      );
      await harness.fixture.whenStable();
    };

    const openMenu = async (): Promise<void> => {
      toggle().click();
      await harness.fixture.whenStable();
    };

    beforeEach(() => navigate('/products'));

    it('starts closed', () => {
      expect(menu().classList).not.toContain('show');
      expect(toggle().getAttribute('aria-expanded')).toBe('false');
      expect(toggle().getAttribute('aria-controls')).toBe('sort-menu');
    });

    it('opens and closes from its button', async () => {
      await openMenu();
      expect(menu().classList).toContain('show');
      expect(toggle().getAttribute('aria-expanded')).toBe('true');

      await openMenu();
      expect(menu().classList).not.toContain('show');
    });

    it('closes on a click anywhere else on the page', async () => {
      await openMenu();

      document.body.click();
      await harness.fixture.whenStable();

      expect(menu().classList).not.toContain('show');
    });

    it('closes on Escape and returns focus to its button', async () => {
      await openMenu();
      await press('ArrowDown', toggle());

      await press('Escape', options()[0]);

      expect(menu().classList).not.toContain('show');
      expect(document.activeElement).toBe(toggle());
    });

    it('opens with the arrow keys and moves between the options without wrapping', async () => {
      toggle().focus();

      await press('ArrowDown', toggle());
      expect(menu().classList).toContain('show');
      expect(document.activeElement).toBe(options()[0]);

      await press('ArrowDown', options()[0]);
      expect(document.activeElement).toBe(options()[1]);

      await press('ArrowUp', options()[1]);
      await press('ArrowUp', options()[0]);
      expect(document.activeElement).toBe(options()[0]);
    });

    it('closes once an option is chosen', async () => {
      await openMenu();

      await clickLink('Preț: mic - mare');

      expect(menu().classList).not.toContain('show');
      expect(queryParams()).toEqual({ sort: 'price-asc' });
    });
  });
});
