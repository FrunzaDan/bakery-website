import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
    title: 'TestBakery - Cofetărie și patiserie în Sibiu',
  },
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
    title: 'TestBakery - Cofetărie și patiserie în Sibiu',
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./components/products/products.component').then(
        (m) => m.ProductsComponent,
      ),
    title: 'Produse - TestBakery Sibiu',
  },
  {
    // The component replaces this with the product's name once it has loaded.
    path: 'products/:id',
    loadComponent: () =>
      import('./components/product-detail/product-detail.component').then(
        (m) => m.ProductDetailComponent,
      ),
    title: 'Produs - TestBakery Sibiu',
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./components/contact/contact.component').then(
        (m) => m.ContactComponent,
      ),
    title: 'Contact - TestBakery Sibiu',
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./components/cart/cart.component').then((m) => m.CartComponent),
    title: 'Coș - TestBakery Sibiu',
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./components/checkout/checkout.component').then(
        (m) => m.CheckoutComponent,
      ),
    title: 'Finalizează comanda - TestBakery Sibiu',
  },
  {
    path: 'order/:id',
    loadComponent: () =>
      import('./components/order-confirmation/order-confirmation.component').then(
        (m) => m.OrderConfirmationComponent,
      ),
    title: 'Comanda ta - TestBakery Sibiu',
  },
  {
    path: 'delivery',
    loadComponent: () =>
      import('./components/delivery-info/delivery-info.component').then(
        (m) => m.DeliveryInfoComponent,
      ),
    title: 'Plată și livrare - TestBakery Sibiu',
  },
  {
    path: 'return',
    loadComponent: () =>
      import('./components/return-info/return-info.component').then(
        (m) => m.ReturnInfoComponent,
      ),
    title: 'Retur - TestBakery Sibiu',
  },
  {
    path: 'terms',
    loadComponent: () =>
      import('./components/terms-info/terms-info.component').then(
        (m) => m.TermsInfoComponent,
      ),
    title: 'Termeni și condiții - TestBakery Sibiu',
  },
  {
    path: '**',
    pathMatch: 'full',
    loadComponent: () =>
      import('./components/page-not-found/page-not-found.component').then(
        (m) => m.PageNotFoundComponent,
      ),
    title: '404 - TestBakery Sibiu',
  },
];
