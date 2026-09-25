import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
    imports: [RouterModule],
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css',
})
export class NavbarComponent {
    private readonly totalNumberOfCartProducts = inject(CartService).totalNumberOfProducts;

    /** The count as a one-item list (empty when the cart is), so the template can re-create the badge when it changes. */
    readonly cartCounts = computed(() => {
        const count = this.totalNumberOfCartProducts();
        return count > 0 ? [count] : [];
    });
}
