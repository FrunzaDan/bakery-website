import { FieldTree } from '@angular/forms/signals';

/** Describes how many fields need fixing and moves focus to the first of them. */
export function reportInvalidFields(field: FieldTree<unknown>): string {
  const errors = field().errorSummary();
  errors[0]?.fieldTree().focusBoundControl();
  return errors.length === 1
    ? 'Formularul are o eroare. Te rugăm să corectezi câmpul marcat.'
    : `Formularul are ${errors.length} erori. Te rugăm să corectezi câmpurile marcate.`;
}
