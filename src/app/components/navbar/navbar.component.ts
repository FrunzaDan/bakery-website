import { Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { HamburgerButtonComponent } from '../hamburger-button/hamburger-button.component';

@Component({
  imports: [RouterModule, HamburgerButtonComponent],
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private readonly totalNumberOfCartProducts =
    inject(CartService).totalNumberOfProducts;

  readonly isMenuOpen = signal(false);

  /** The count as a one-item list (empty when the cart is), so the template can re-create the badge when it changes. */
  readonly cartCounts = computed(() => {
    const count = this.totalNumberOfCartProducts();
    return count > 0 ? [count] : [];
  });

  onToggleMenu(isOpen: boolean): void {
    this.isMenuOpen.set(isOpen);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
