import { email, pattern, required, schema } from '@angular/forms/signals';
import { ContactMeForm } from '../../interfaces/contact-me-form';
import { NOT_BLANK, PHONE_PATTERN } from '../../shared/form-patterns';

export const emptyContactForm = (): ContactMeForm => ({
  name: '',
  email: '',
  phone: '',
  message: '',
});

export const contactFormSchema = schema<ContactMeForm>((p) => {
  required(p.name, { message: 'Numele este necesar.' });
  pattern(p.name, NOT_BLANK, { message: 'Numele este necesar.' });

  required(p.email, { message: 'E-mail-ul este necesar.' });
  email(p.email, { message: 'Un E-mail valid este necesar.' });

  required(p.phone, { message: 'Numărul de telefon este necesar.' });
  pattern(p.phone, PHONE_PATTERN, { message: 'Un număr de telefon mobil valid este necesar.' });

  required(p.message, { message: 'Un mesaj este necesar.' });
  pattern(p.message, NOT_BLANK, { message: 'Un mesaj este necesar.' });
});
