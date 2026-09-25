import { Component, inject, OnInit } from '@angular/core';
import { SEOService } from '../../services/seo.service';

@Component({
    selector: 'app-delivery-info',
    imports: [],
    templateUrl: './delivery-info.component.html',
    styleUrl: './delivery-info.component.css',
})
export class DeliveryInfoComponent implements OnInit {
  private readonly seoService = inject(SEOService);

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      description:
        'Cum plătești și cum primești comanda de la TestBakery: plata la livrare sau prin transfer bancar și livrare în Sibiu.',
      path: '/delivery',
    });
  }
}
