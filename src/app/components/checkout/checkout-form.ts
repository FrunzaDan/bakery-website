import { email, pattern, required, schema } from '@angular/forms/signals';
import { CheckoutForm } from '../../interfaces/checkout-form';
import { NOT_BLANK, PHONE_PATTERN } from '../../shared/form-patterns';

export const emptyCheckoutForm = (): CheckoutForm => ({
  name: '',
  email: '',
  phone: '',
  town: '',
  street: '',
  streetNumber: '',
  zip: '',
});

export const checkoutFormSchema = schema<CheckoutForm>((p) => {
  const requiredText = [
    [p.name, 'Numele este necesar.'],
    [p.town, 'Localitatea este necesară.'],
    [p.street, 'Strada este necesară.'],
    [p.streetNumber, 'Numărul străzii este necesar.'],
    [p.zip, 'Codul poștal este necesar.'],
  ] as const;
  for (const [field, message] of requiredText) {
    required(field, { message });
    pattern(field, NOT_BLANK, { message });
  }

  required(p.email, { message: 'E-mail-ul este necesar.' });
  email(p.email, { message: 'Un E-mail valid este necesar.' });

  required(p.phone, { message: 'Numărul de telefon este necesar.' });
  pattern(p.phone, PHONE_PATTERN, { message: 'Un număr de telefon mobil valid este necesar.' });
});
