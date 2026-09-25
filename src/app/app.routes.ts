import { Routes } from '@angular/router';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ContactComponent } from './components/contact/contact.component';
import { DeliveryInfoComponent } from './components/delivery-info/delivery-info.component';
import { HomeComponent } from './components/home/home.component';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductsComponent } from './components/products/products.component';
import { ReturnInfoComponent } from './components/return-info/return-info.component';
import { TermsInfoComponent } from './components/terms-info/terms-info.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    title: 'TestBakery - Cofetărie și patiserie în Sibiu',
  },
  {
    path: '',
    component: HomeComponent,
    title: 'TestBakery - Cofetărie și patiserie în Sibiu',
  },
  {
    path: 'products',
    component: ProductsComponent,
    title: 'Produse - TestBakery Sibiu',
  },
  {
    // The component replaces this with the product's name once it has loaded.
    path: 'products/:id',
    component: ProductDetailComponent,
    title: 'Produs - TestBakery Sibiu',
  },
  {
    path: 'contact',
    component: ContactComponent,
    title: 'Contact - TestBakery Sibiu',
  },
  {
    path: 'cart',
    component: CartComponent,
    title: 'Coș - TestBakery Sibiu',
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    title: 'Finalizează comanda - TestBakery Sibiu',
  },
  {
    path: 'order/:id',
    component: OrderConfirmationComponent,
    title: 'Comanda ta - TestBakery Sibiu',
  },
  {
    path: 'delivery',
    component: DeliveryInfoComponent,
    title: 'Plată și livrare - TestBakery Sibiu',
  },
  {
    path: 'return',
    component: ReturnInfoComponent,
    title: 'Retur - TestBakery Sibiu',
  },
  {
    path: 'terms',
    component: TermsInfoComponent,
    title: 'Termeni și condiții - TestBakery Sibiu',
  },
  {
    path: '**',
    pathMatch: 'full',
    component: PageNotFoundComponent,
    title: '404 - TestBakery Sibiu',
  },
];
