import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ContactComponent } from './contact.component';
import { SendEmailService } from '../../services/send-email.service';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;
  let sendEmailServiceSpy: { sendEmailJS: ReturnType<typeof vi.fn> };

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('is invalid when all fields are empty', () => {
    expect(component.contactMeForm.valid).toBe(false);
    expect(component.f.name.errors?.['required']).toBe(true);
    expect(component.f.email.errors?.['required']).toBe(true);
    expect(component.f.from_tel.errors?.['required']).toBe(true);
    expect(component.f.from_message.errors?.['required']).toBe(true);
  });

  it('flags an email without an @ as invalid', () => {
    component.f.email.setValue('not-an-email');
    expect(component.f.email.errors?.['email']).toBe(true);
  });

  it('accepts a well-formed email', () => {
    component.f.email.setValue('someone@example.com');
    expect(component.f.email.errors).toBeNull();
  });

  it.each(['12345678', '1234567890123', 'abcdefghi'])(
    'rejects a phone number that does not match the pattern: %s',
    (phone) => {
      component.f.from_tel.setValue(phone);
      expect(component.f.from_tel.errors?.['pattern']).toBeTruthy();
    },
  );

  it.each(['123456789', '123456789012'])(
    'accepts a 9-to-12-digit phone number: %s',
    (phone) => {
      component.f.from_tel.setValue(phone);
      expect(component.f.from_tel.errors).toBeNull();
    },
  );

  it('marks submitted but does not call the email service when the form is invalid', () => {
    component.onSubmit();

    expect(component.submitted()).toBe(true);
    expect(sendEmailServiceSpy.sendEmailJS).not.toHaveBeenCalled();
  });

  function fillValidForm(): void {
    component.f.name.setValue('Jane Doe');
    component.f.email.setValue('jane@example.com');
    component.f.from_tel.setValue('123456789');
    component.f.from_message.setValue('Hello there');
  }

  it('sends the email with the form values when the form is valid', () => {
    fillValidForm();
    sendEmailServiceSpy.sendEmailJS.mockReturnValue(new Promise(() => {}));

    component.onSubmit();

    expect(sendEmailServiceSpy.sendEmailJS).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      from_tel: '123456789',
      from_message: 'Hello there',
    });
  });

  it('resets the form after a successful (200) response', async () => {
    fillValidForm();
    sendEmailServiceSpy.sendEmailJS.mockResolvedValue(200);

    component.onSubmit();
    await fixture.whenStable();

    expect(component.f.name.value).toBeNull();
    expect(component.f.email.value).toBeNull();
    expect(component.f.from_tel.value).toBeNull();
    expect(component.f.from_message.value).toBeNull();
  });

  it('leaves the form filled in when the send fails', async () => {
    fillValidForm();
    sendEmailServiceSpy.sendEmailJS.mockResolvedValue(500);

    component.onSubmit();
    await fixture.whenStable();

    expect(component.f.name.value).toBe('Jane Doe');
  });
});
