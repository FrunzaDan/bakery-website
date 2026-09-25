import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-terms-info',
  imports: [],
  templateUrl: './terms-info.component.html',
  styleUrl: './terms-info.component.css',
})
export class TermsInfoComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      description:
        'Termenii și condițiile de utilizare a site-ului și de comandă online la TestBakery.',
      path: '/terms',
    });
  }
}
