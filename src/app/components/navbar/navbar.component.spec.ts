import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  const totalNumberOfProducts = signal(0);

  const createFixture = () => {
    TestBed.configureTestingModule({
      providers: [
        // Any path resolves, so clicking a link finishes navigating inside the test.
        provideRouter([{ path: '**', children: [] }]),
        { provide: CartService, useValue: { totalNumberOfProducts } },
      ],
    });
    const fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    return fixture;
  };

  const render = () => createFixture().nativeElement as HTMLElement;

  const cartLink = (el: HTMLElement) =>
    el.querySelector<HTMLAnchorElement>('a[href="/cart"]');

  beforeEach(() => totalNumberOfProducts.set(0));

  it('links to the cart without a count when the cart is empty', () => {
    const link = cartLink(render());

    expect(link?.textContent?.trim()).toBe('COȘ');
    expect(link?.querySelector('.cart-count')).toBeNull();
  });

  it('shows how many products are in the cart', () => {
    totalNumberOfProducts.set(3);

    const link = cartLink(render());

    expect(link?.querySelector('.cart-count')?.textContent).toBe('3 produse');
  });

  describe('mobile menu', () => {
    const toggler = (el: HTMLElement) =>
      el.querySelector<HTMLButtonElement>('app-hamburger-button button')!;
    const menu = (el: HTMLElement) => el.querySelector('#main-nav')!;

    it('starts closed, with the toggle button pointing at the menu', () => {
      const el = render();

      expect(menu(el).classList).not.toContain('show');
      expect(toggler(el).getAttribute('aria-controls')).toBe('main-nav');
      expect(toggler(el).getAttribute('aria-expanded')).toBe('false');
    });

    it('opens and closes when the toggle button is pressed', () => {
      const fixture = createFixture();
      const el = fixture.nativeElement as HTMLElement;

      toggler(el).click();
      fixture.detectChanges();
      expect(menu(el).classList).toContain('show');
      expect(toggler(el).getAttribute('aria-expanded')).toBe('true');

      toggler(el).click();
      fixture.detectChanges();
      expect(menu(el).classList).not.toContain('show');
    });

    it('closes when a link is chosen', async () => {
      const fixture = createFixture();
      const el = fixture.nativeElement as HTMLElement;
      toggler(el).click();
      fixture.detectChanges();

      cartLink(el)!.click();
      await fixture.whenStable();

      expect(menu(el).classList).not.toContain('show');
    });
  });
});
