import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContactMeForm } from '../../interfaces/contact-me-form';
import { SendEmailService } from '../../services/send-email.service';

@Component({
    selector: 'app-contact',
    imports: [RouterModule, FormsModule, ReactiveFormsModule],
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private readonly sendEmailService = inject(SendEmailService);

  readonly submitted = signal(false);

  contactMeForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    from_tel: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{9,12}$'),
    ]),
    from_message: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.contactMeForm.controls;
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.contactMeForm.invalid) {
      return;
    }
    let responseCodePromise: Promise<number> =
      this.sendEmailService.sendEmailJS(
        this.contactMeForm.value as ContactMeForm
      );
    responseCodePromise.then((responseCode: number): void => {
      if (responseCode === 200) {
        this.contactMeForm.reset();
        this.contactMeForm.controls.name.setErrors(null);
        this.contactMeForm.controls.email.setErrors(null);
        this.contactMeForm.controls.from_tel.setErrors(null);
        this.contactMeForm.controls.from_message.setErrors(null);
      }
    });
  }
}
