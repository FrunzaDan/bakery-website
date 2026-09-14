import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from '../../services/cathegory.service';

@Component({
    selector: 'app-home',
    imports: [],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly categoryService = inject(CategoryService);

  onCategoryCardClick(clickedCathegory: string): void {
    this.categoryService.setSelectedCategory(clickedCathegory);
    this.router.navigate(['/products']);
  }
}
