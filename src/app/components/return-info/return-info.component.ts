import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-return-info',
  imports: [],
  templateUrl: './return-info.component.html',
  styleUrl: './return-info.component.css',
})
export class ReturnInfoComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      description:
        'Condițiile de retur pentru produsele comandate de la TestBakery Sibiu.',
      path: '/return',
    });
  }
}
