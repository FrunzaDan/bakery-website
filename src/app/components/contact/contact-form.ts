import {
  email,
  maxLength,
  minLength,
  pattern,
  required,
  schema,
} from '@angular/forms/signals';
import { ContactMeForm } from '../../interfaces/contact-me-form';
import { NOT_BLANK, PHONE_PATTERN } from '../../shared/form-patterns';

export const MESSAGE_MIN_LENGTH = 2;
export const MESSAGE_MAX_LENGTH = 1000;

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
  pattern(p.phone, PHONE_PATTERN, {
    message: 'Un număr de telefon mobil valid este necesar.',
  });

  required(p.message, { message: 'Un mesaj este necesar.' });
  pattern(p.message, NOT_BLANK, { message: 'Un mesaj este necesar.' });
  minLength(p.message, MESSAGE_MIN_LENGTH, {
    message: `Mesajul trebuie să aibă cel puțin ${MESSAGE_MIN_LENGTH} caractere.`,
  });
  maxLength(p.message, MESSAGE_MAX_LENGTH, {
    message: `Mesajul poate avea cel mult ${MESSAGE_MAX_LENGTH} de caractere.`,
  });
});
