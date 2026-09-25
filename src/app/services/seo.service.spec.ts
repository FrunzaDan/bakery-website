import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { SEOService } from './seo.service';

describe('SEOService', () => {
  let service: SEOService;

  beforeEach(() => {
    document.head
      .querySelectorAll('link[rel="canonical"]')
      .forEach((link) => link.remove());

    TestBed.configureTestingModule({});
    service = TestBed.inject(SEOService);
  });

  it('updates the meta description tag', () => {
    const meta = TestBed.inject(Meta);
    const updateTagSpy = vi.spyOn(meta, 'updateTag');

    service.updateMetaDescription('My description');

    expect(updateTagSpy).toHaveBeenCalledWith({
      name: 'description',
      content: 'My description',
    });
  });

  it('creates a canonical link with the given href', () => {
    service.createLinkForCanonicalURL('https://example.com/page');

    const links = document.head.querySelectorAll('link[rel="canonical"]');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('href')).toBe('https://example.com/page');
  });

  it('falls back to the current page URL without its query string or fragment', () => {
    history.replaceState(null, '', '/products?q=tort&categorie=prajituri#rezultate');

    service.createLinkForCanonicalURL();

    const link = document.head.querySelector('link[rel="canonical"]');
    expect(link?.getAttribute('href')).toBe(`${location.origin}/products`);
  });

  it('replaces any existing canonical link instead of duplicating it', () => {
    service.createLinkForCanonicalURL('https://example.com/first');
    service.createLinkForCanonicalURL('https://example.com/second');

    const links = document.head.querySelectorAll('link[rel="canonical"]');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('href')).toBe('https://example.com/second');
  });
});
