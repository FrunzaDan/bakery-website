import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { App } from './app';
import { FetchProductsService } from './services/fetch-products.service';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: FetchProductsService, useValue: { fetchProducts: () => of([]) } },
      ],
    });
  });

  it('moves focus to the main content from the skip link without leaving the page', async () => {
    const fixture = TestBed.createComponent(App);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    const skipLink = el.querySelector<HTMLAnchorElement>('.skip-link')!;
    const click = new MouseEvent('click', { cancelable: true });
    skipLink.dispatchEvent(click);

    expect(click.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(el.querySelector('main'));
    fixture.nativeElement.remove();
  });

  it('hides the decorative background pictures from screen readers', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const backgrounds = fixture.nativeElement.querySelectorAll('[class^="background-image"]');
    expect(backgrounds.length).toBe(2);
    backgrounds.forEach((image: HTMLImageElement) => expect(image.getAttribute('alt')).toBe(''));
  });
});
