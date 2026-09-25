import { Component, inject, OnInit, signal } from '@angular/core';
import { FormField, FormRoot, form } from '@angular/forms/signals';
import { RouterModule } from '@angular/router';
import { ContactMeForm } from '../../interfaces/contact-me-form';
import { NotificationService } from '../../services/notification.service';
import { SendEmailService } from '../../services/send-email.service';
import { SEOService } from '../../services/seo.service';
import { reportInvalidFields } from '../../shared/invalid-summary';
import { contactFormSchema, emptyContactForm } from './contact-form';

@Component({
    selector: 'app-contact',
    imports: [RouterModule, FormField, FormRoot],
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.css',
})
export class ContactComponent implements OnInit {
  private readonly seoService = inject(SEOService);
  private readonly sendEmailService = inject(SendEmailService);
  private readonly notificationService = inject(NotificationService);

  readonly invalidSummary = signal<string | null>(null);
  readonly sendError = signal<string | null>(null);

  readonly model = signal<ContactMeForm>(emptyContactForm());
  readonly contactForm = form(this.model, contactFormSchema, {
    submission: {
      action: () => this.send(),
      onInvalid: (field) => this.invalidSummary.set(reportInvalidFields(field)),
    },
  });

  private async send(): Promise<void> {
    this.invalidSummary.set(null);
    this.sendError.set(null);
    try {
      await this.sendEmailService.sendEmailJS(this.model());
      this.contactForm().reset(emptyContactForm());
      this.notificationService.show('Mesajul a fost trimis!');
    } catch (error: unknown) {
      console.error('Error sending the contact message:', error);
      this.sendError.set('Mesajul nu a putut fi trimis. Te rugăm să încerci din nou.');
    }
  }

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      description:
        'Contactează TestBakery din Sibiu: telefon, e-mail, adresa de pe Calea Dumbrăvii și formularul de contact.',
      path: '/contact',
    });
  }
}
