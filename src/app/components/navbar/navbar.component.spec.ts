import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  const totalNumberOfProducts = signal(0);

  const render = () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: CartService, useValue: { totalNumberOfProducts } },
      ],
    });
    const fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  const cartLink = (el: HTMLElement) => el.querySelector<HTMLAnchorElement>('a[href="/cart"]');

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
});
