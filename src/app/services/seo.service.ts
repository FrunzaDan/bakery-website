import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class SEOService {
  private readonly doc = inject(DOCUMENT);
  private readonly meta = inject(Meta);

  updateMetaDescription(metaDescription: string): void {
    this.meta.updateTag({
      name: 'description',
      content: metaDescription,
    });
  }

  createLinkForCanonicalURL(href?: string): void {
    this.removeExistingCanonicalLink();
    const link = this.doc.createElement('link');
    link.setAttribute('rel', 'canonical');
    this.doc.head.appendChild(link);

    link.setAttribute('href', href ?? this.urlWithoutQuery());
  }

  /** The current page URL without its query string or fragment, so filtered views share one canonical page. */
  private urlWithoutQuery(): string {
    const url = new URL(this.doc.URL);
    url.search = '';
    url.hash = '';
    return url.href;
  }

  private removeExistingCanonicalLink(): void {
    this.doc.head.querySelectorAll('link[rel="canonical"]').forEach((link) => link.remove());
  }
}
