import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ContactComponent } from './contact.component';
import { NotificationService } from '../../services/notification.service';
import { SendEmailService } from '../../services/send-email.service';
import { ContactMeForm } from '../../interfaces/contact-me-form';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;
  let sendEmailServiceSpy: { sendEmailJS: ReturnType<typeof vi.fn> };

  const validForm: ContactMeForm = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '123456789',
    message: 'Hello there',
  };

  const submitForm = async (): Promise<void> => {
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    sendEmailServiceSpy = { sendEmailJS: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ContactComponent],
      providers: [
        provideRouter([]),
        { provide: SendEmailService, useValue: sendEmailServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requires every field', () => {
    expect(component.contactForm().invalid()).toBe(true);
    expect(component.contactForm.name().errors()[0].message).toBe(
      'Numele este necesar.',
    );
    expect(component.contactForm.email().errors()[0].message).toBe(
      'E-mail-ul este necesar.',
    );
    expect(component.contactForm.phone().errors()[0].message).toBe(
      'Numărul de telefon este necesar.',
    );
    expect(component.contactForm.message().errors()[0].message).toBe(
      'Un mesaj este necesar.',
    );
  });

  it('flags an email without an @ as invalid', () => {
    component.model.set({ ...validForm, email: 'not-an-email' });
    expect(component.contactForm.email().errors()[0].message).toBe(
      'Un E-mail valid este necesar.',
    );
  });

  it('accepts a well-formed email', () => {
    component.model.set(validForm);
    expect(component.contactForm.email().errors()).toEqual([]);
  });

  it.each(['12345678', '1234567890123', 'abcdefghi'])(
    'rejects a phone number that does not match the pattern: %s',
    (phone) => {
      component.model.set({ ...validForm, phone });
      expect(component.contactForm.phone().invalid()).toBe(true);
    },
  );

  it.each(['123456789', '123456789012'])(
    'accepts a 9-to-12-digit phone number: %s',
    (phone) => {
      component.model.set({ ...validForm, phone });
      expect(component.contactForm.phone().valid()).toBe(true);
    },
  );

  it('writes what is typed into the model', async () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('#name');
    input.value = 'Jane';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(component.model().name).toBe('Jane');
  });

  it('does not call the email service when the form is invalid, and reports why', async () => {
    await submitForm();

    expect(sendEmailServiceSpy.sendEmailJS).not.toHaveBeenCalled();
    expect(component.invalidSummary()).toBe(
      'Formularul are 4 erori. Te rugăm să corectezi câmpurile marcate.',
    );
  });

  it('sends the form values and then resets the form', async () => {
    component.model.set(validForm);
    sendEmailServiceSpy.sendEmailJS.mockResolvedValue(undefined);

    await submitForm();

    expect(sendEmailServiceSpy.sendEmailJS).toHaveBeenCalledWith(validForm);
    expect(component.model()).toEqual({
      name: '',
      email: '',
      phone: '',
      message: '',
    });
    expect(component.contactForm().touched()).toBe(false);
    expect(component.sendError()).toBeNull();
    expect(
      TestBed.inject(NotificationService).notifications()[0]?.message,
    ).toBe('Mesajul a fost trimis!');
  });

  it.each(['0722111222', '0722 111 222', '0722-111-222', '+40 722 111 222'])(
    'accepts the phone number %s',
    (phone) => {
      component.model.set({ ...validForm, phone });
      expect(component.contactForm.phone().invalid()).toBe(false);
    },
  );

  it.each(['07221', '0722 abc 222', '0722  111 222', '+40 722 111 222 333 4'])(
    'rejects the phone number %s',
    (phone) => {
      component.model.set({ ...validForm, phone });
      expect(component.contactForm.phone().invalid()).toBe(true);
    },
  );

  it('keeps the form filled in and shows an error when the send fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    component.model.set(validForm);
    sendEmailServiceSpy.sendEmailJS.mockRejectedValue({ status: 500 });

    await submitForm();

    expect(component.model()).toEqual(validForm);
    expect(component.sendError()).toBe(
      'Mesajul nu a putut fi trimis. Te rugăm să încerci din nou.',
    );
    expect(
      fixture.nativeElement.querySelector('[role="alert"]')?.textContent,
    ).toContain('Mesajul nu a putut fi trimis');
  });
});
