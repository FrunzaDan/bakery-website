import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  untracked,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormField, debounce, form } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Product } from '../../interfaces/product';
import { CartService } from '../../services/cart.service';
import { FetchProductsService } from '../../services/fetch-products.service';
import { NotificationService } from '../../services/notification.service';

type SortOption = 'title-asc' | 'title-desc' | 'price-asc' | 'price-desc';

interface CategoryOption {
  value: string | undefined;
  label: string;
}

interface SortChoice {
  value: SortOption;
  label: string;
}

const CATEGORIES: readonly CategoryOption[] = [
  { value: undefined, label: 'Toate' },
  { value: 'bakeries', label: 'Cofetărie' },
  { value: 'pastry', label: 'Patiserie' },
  { value: 'sweets', label: 'Torturi' },
  { value: 'basic_products', label: 'Produse de bază' },
];

const SORT_CHOICES: readonly SortChoice[] = [
  { value: 'title-asc', label: 'Nume: A - Z' },
  { value: 'title-desc', label: 'Nume: Z - A' },
  { value: 'price-desc', label: 'Preț: mare - mic' },
  { value: 'price-asc', label: 'Preț: mic - mare' },
];

const SEARCH_DEBOUNCE_MS = 300;

const SORT_COMPARATORS: Record<SortOption, (a: Product, b: Product) => number> = {
  'title-asc': (a, b) => a.title.localeCompare(b.title, 'ro'),
  'title-desc': (a, b) => b.title.localeCompare(a.title, 'ro'),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
};

function toCategory(value: string | undefined): string | undefined {
  return CATEGORIES.some((category) => category.value === value) ? value : undefined;
}

function toSortOption(value: string | undefined): SortOption | undefined {
  return value !== undefined && value in SORT_COMPARATORS ? (value as SortOption) : undefined;
}

/**
 * Category, search term and sort order live in the URL query params
 * (`?category=sweets&q=tort&sort=price-asc`) and are bound to inputs via
 * `withComponentInputBinding()`, so filtered views can be shared, bookmarked
 * and restored with the browser's back/forward buttons.
 */
@Component({
  imports: [RouterModule, FormField],
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent {
  private readonly fetchProductsService = inject(FetchProductsService);
  private readonly cartService = inject(CartService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly categories = CATEGORIES;
  readonly sortChoices = SORT_CHOICES;

  readonly totalNumberOfCartProducts = this.cartService.totalNumberOfProducts;

  private readonly productsResource = rxResource({
    stream: () => this.fetchProductsService.fetchProducts(),
  });
  private readonly productsList = computed((): Product[] => this.productsResource.value() ?? []);
  readonly isLoadingProducts = this.productsResource.isLoading;

  readonly category = input<string | undefined, string | undefined>(undefined, {
    transform: toCategory,
  });
  readonly q = input('', { transform: (value: string | undefined) => value?.trim() ?? '' });
  readonly sort = input<SortOption | undefined, string | undefined>(undefined, {
    transform: toSortOption,
  });

  readonly selectedCategoryLabel = computed(
    () => CATEGORIES.find((category) => category.value === this.category())?.label,
  );

  // The search box edits a local copy of `q`, pushed to the URL once typing pauses.
  // It only follows the URL when the URL holds a different term (e.g. back/forward),
  // so the URL echoing our own write never overwrites what the user is typing.
  private readonly searchModel = linkedSignal<string, { term: string }>({
    source: this.q,
    computation: (q, previous) =>
      previous && previous.value.term.trim() === q ? previous.value : { term: q },
  });
  readonly searchForm = form(this.searchModel, (path) => {
    debounce(path.term, SEARCH_DEBOUNCE_MS);
  });

  readonly visibleProducts = computed((): Product[] => {
    const category = this.category();
    const term = this.q().toLowerCase();
    const sortOption = this.sort();

    const filtered = this.productsList().filter(
      (product) =>
        (!category || product.category === category) &&
        (!term || product.title.toLowerCase().includes(term)),
    );

    return sortOption ? [...filtered].sort(SORT_COMPARATORS[sortOption]) : filtered;
  });

  readonly resultsAnnouncement = computed(() => {
    if (this.isLoadingProducts()) return 'Se încarcă produsele';
    const total = this.visibleProducts().length;
    return total === 1 ? '1 produs găsit' : `${total} produse găsite`;
  });

  constructor() {
    effect(() => {
      const term = this.searchModel().term.trim();
      if (term !== untracked(this.q)) {
        untracked(() => this.updateQueryParams({ q: term || null }, { replaceUrl: true }));
      }
    });
  }

  private updateQueryParams(
    queryParams: Record<string, string | null>,
    { replaceUrl = false }: { replaceUrl?: boolean } = {},
  ): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }

  addToCart(product: Product): void {
    const isSuccessful: boolean = this.cartService.addProductToCart(product);
    if (isSuccessful) {
      this.notificationService.addNotification({
        message: `"${product.title}" a fost adăugat!`,
      });
    }
  }
}
