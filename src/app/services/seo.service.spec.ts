import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { SeoService, SITE_URL } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;

  const metaContent = (selector: string) =>
    document.head.querySelector(`meta[${selector}]`)?.getAttribute('content');
  const canonicalLinks = () =>
    document.head.querySelectorAll('link[rel="canonical"]');

  beforeEach(() => {
    document.head
      .querySelectorAll('link[rel="canonical"], meta[name], meta[property]')
      .forEach((element) => element.remove());

    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoService);
  });

  it('sets the description and the social tags from the page title', () => {
    TestBed.inject(Title).setTitle('Produse - TestBakery Sibiu');
    service.updateMetaTags({
      description: 'Toate produsele',
      path: '/products',
    });

    expect(metaContent('name="description"')).toBe('Toate produsele');
    expect(metaContent('property="og:title"')).toBe(
      'Produse - TestBakery Sibiu',
    );
    expect(metaContent('property="og:description"')).toBe('Toate produsele');
    expect(metaContent('property="og:url"')).toBe(`${SITE_URL}/products`);
    expect(metaContent('name="twitter:title"')).toBe(
      'Produse - TestBakery Sibiu',
    );
  });

  it('keeps every page out of search engines while the site is a demo', () => {
    service.updateMetaTags({ description: 'Acasă', path: '/' });

    expect(metaContent('name="robots"')).toBe('noindex, nofollow');
  });

  it('reuses one canonical link and drops the trailing slash for the home page', () => {
    service.updateMetaTags({ description: 'Produse', path: '/products' });
    service.updateMetaTags({ description: 'Acasă', path: '/' });

    expect(canonicalLinks().length).toBe(1);
    expect(canonicalLinks()[0].getAttribute('href')).toBe(SITE_URL);
  });

  it('sets a preview image only for pages that have one', () => {
    service.updateMetaTags({
      description: 'Pâine',
      path: '/products/1',
      image: '/assets/a.webp',
    });

    expect(metaContent('property="og:image"')).toBe(
      `${SITE_URL}/assets/a.webp`,
    );
    expect(metaContent('name="twitter:image"')).toBe(
      `${SITE_URL}/assets/a.webp`,
    );

    service.updateMetaTags({ description: 'Contact', path: '/contact' });

    expect(metaContent('property="og:image"')).toBeUndefined();
    expect(metaContent('name="twitter:image"')).toBeUndefined();
  });
});
