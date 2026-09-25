import { Component, inject, OnInit } from '@angular/core';
import { SEOService } from '../../services/seo.service';

@Component({
    selector: 'app-page-not-found',
    imports: [],
    templateUrl: './page-not-found.component.html',
    styleUrl: './page-not-found.component.css',
})
export class PageNotFoundComponent implements OnInit {
  private readonly seoService = inject(SEOService);

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      description: 'Pagina căutată nu există.',
      path: '/404',
      robots: 'noindex, follow',
    });
  }
}
