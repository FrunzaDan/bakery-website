import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  ProductCategory,
} from '../../interfaces/product';
import { SeoService } from '../../services/seo.service';

const CATEGORY_IMAGES: Readonly<Record<ProductCategory, string>> = {
  bakeries: '/assets/images/cofetarie.svg',
  pastry: '/assets/images/patiserie.svg',
  sweets: '/assets/images/torturi.svg',
  basic_products: '/assets/images/prod-baza.svg',
};

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  readonly categoryCards = PRODUCT_CATEGORIES.map((category) => ({
    category,
    label: PRODUCT_CATEGORY_LABELS[category],
    image: CATEGORY_IMAGES[category],
  }));

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      description:
        'Cofetărie și patiserie în Sibiu: torturi pentru orice ocazie, prăjituri, patiserie proaspătă și produse de bază, cu comandă online și livrare.',
      path: '/',
    });
  }
}
