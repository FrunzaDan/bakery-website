import { Component, input, model } from '@angular/core';
import { MAX_QUANTITY_PER_PRODUCT } from '../../interfaces/product';

/**
 * − / + buttons around a quantity the customer can also type. Typed values
 * are applied on change (blur or Enter), rounded down and kept between `min`
 * and the per-product maximum; anything that isn't a number is undone.
 */
@Component({
  selector: 'app-quantity-picker',
  templateUrl: './quantity-picker.component.html',
  styleUrl: './quantity-picker.component.css',
})
export class QuantityPickerComponent {
  readonly quantity = model.required<number>();
  /** The product name, used in the controls' accessible labels. */
  readonly label = input.required<string>();
  /** The cart uses 0, so going below 1 means "remove". */
  readonly min = input(1);
  readonly max = MAX_QUANTITY_PER_PRODUCT;

  step(delta: number): void {
    this.apply(this.quantity() + delta);
  }

  onTyped(event: Event): void {
    const field = event.target as HTMLInputElement;
    const typed = Number.parseInt(field.value, 10);
    const applied = Number.isNaN(typed) ? this.quantity() : this.apply(typed);
    // The binding doesn't rewrite the field when the quantity didn't change
    // (e.g. "abc" or "150" at the maximum), so show the applied value here.
    field.value = String(applied);
  }

  private apply(quantity: number): number {
    const clamped = Math.min(Math.max(quantity, this.min()), this.max);
    if (clamped !== this.quantity()) {
      this.quantity.set(clamped);
    }
    return clamped;
  }
}
