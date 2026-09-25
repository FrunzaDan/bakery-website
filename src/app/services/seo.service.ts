import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';

/** Where the site is published; canonical links and social previews point here. */
export const SITE_URL = 'https://testbakery-sibiu.web.app';

export interface SeoMetaConfig {
  description: string;
  /** The page's path, such as `/products/3`. */
  path: string;
  /** A picture for link previews, such as `/assets/images/products/a.webp`. */
  image?: string;
  robots?: string;
}

/**
 * The site is a demo for now, so every page tells search engines not to index it,
 * whatever it asks for. Set to `true` at launch, and drop the `X-Robots-Tag`
 * header in `firebase.json` too.
 */
const ALLOW_INDEXING = false;

const DEFAULT_ROBOTS = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

@Injectable({
  providedIn: 'root',
})
export class SEOService {
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  /** Call after the page title is set, since the social title is copied from it. */
  updateMetaTags(config: SeoMetaConfig): void {
    const title = this.document.title;
    const url = SITE_URL + (config.path === '/' ? '' : config.path);

    this.meta.updateTag({ name: 'description', content: config.description });
    this.meta.updateTag({
      name: 'robots',
      content: ALLOW_INDEXING ? (config.robots ?? DEFAULT_ROBOTS) : 'noindex, nofollow',
    });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:locale', content: 'ro_RO' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });

    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: SITE_URL + config.image });
      this.meta.updateTag({ name: 'twitter:image', content: SITE_URL + config.image });
    } else {
      this.meta.removeTag("property='og:image'");
      this.meta.removeTag("name='twitter:image'");
    }

    this.updateCanonicalUrl(url);
  }

  private updateCanonicalUrl(url: string): void {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
