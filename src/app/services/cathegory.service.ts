import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly selectedCategorySignal = signal<string | undefined>(undefined);

  readonly selectedCategory = this.selectedCategorySignal.asReadonly();

  setSelectedCategory(category: string): void {
    this.selectedCategorySignal.set(category);
  }
}
