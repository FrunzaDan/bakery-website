import {
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  untracked,
} from '@angular/core';
import { FormField, debounce, form } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  Product,
  ProductCategory,
} from '../../interfaces/product';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { ProductCatalogService } from '../../services/product-catalog.service';
import { RonPipe } from '../../shared/ron.pipe';

type SortOption = 'title-asc' | 'title-desc' | 'price-asc' | 'price-desc';

interface CategoryOption {
  readonly value: ProductCategory | undefined;
  readonly label: string;
}

interface SortChoice {
  readonly value: SortOption;
  readonly label: string;
}

const CATEGORIES: readonly CategoryOption[] = [
  { value: undefined, label: 'Toate' },
  ...PRODUCT_CATEGORIES.map((category) => ({
    value: category,
    label: PRODUCT_CATEGORY_LABELS[category],
  })),
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

/** Lowercases and strips diacritics, so "paine" finds "Pâine" and "ș"/"ş" match. */
function toSearchKey(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function toCategory(value: string | undefined): ProductCategory | undefined {
  return PRODUCT_CATEGORIES.find((category) => category === value);
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
  imports: [RouterModule, FormField, RonPipe],
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  private readonly catalog = inject(ProductCatalogService);
  private readonly cartService = inject(CartService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly categories = CATEGORIES;
  readonly sortChoices = SORT_CHOICES;

  readonly totalNumberOfCartProducts = this.cartService.totalNumberOfProducts;

  readonly isLoadingProducts = this.catalog.isLoading;
  readonly loadError = this.catalog.loadError;

  readonly category = input<ProductCategory | undefined, string | undefined>(undefined, {
    transform: toCategory,
  });
  readonly q = input('', { transform: (value: string | undefined) => value?.trim() ?? '' });
  readonly sort = input<SortOption | undefined, string | undefined>(undefined, {
    transform: toSortOption,
  });

  readonly selectedCategoryLabel = computed(() => {
    const category = this.category();
    return category ? PRODUCT_CATEGORY_LABELS[category] : 'Toate';
  });

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

  readonly visibleProducts = computed((): readonly Product[] => {
    const category = this.category();
    const term = toSearchKey(this.q());
    const sortOption = this.sort();

    const filtered = this.catalog.products().filter(
      (product) =>
        (!category || product.category === category) &&
        (!term || toSearchKey(product.title).includes(term)),
    );

    return sortOption ? [...filtered].sort(SORT_COMPARATORS[sortOption]) : filtered;
  });

  readonly resultsAnnouncement = computed(() => {
    if (this.isLoadingProducts()) return 'Se încarcă produsele';
    if (this.loadError()) return '';
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

  reloadProducts(): void {
    this.catalog.reload();
  }

  addToCart(product: Product): void {
    this.cartService.addProductToCart(product);
    this.notificationService.show(`"${product.title}" a fost adăugat!`);
  }
}
