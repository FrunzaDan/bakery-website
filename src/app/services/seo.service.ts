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

    link.setAttribute('href', href ? href : this.doc.URL + '/');
  }

  private removeExistingCanonicalLink(): void {
    this.doc.head.querySelectorAll('link[rel="canonical"]').forEach((link) => link.remove());
  }
}
