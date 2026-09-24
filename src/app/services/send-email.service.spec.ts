import { TestBed } from '@angular/core/testing';
import emailjs from '@emailjs/browser';
import { SendEmailService } from './send-email.service';
import { ContactMeForm } from '../interfaces/contact-me-form';

describe('SendEmailService', () => {
  let service: SendEmailService;

  const contactMeForm: ContactMeForm = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '123456789',
    message: 'Hello there',
  };

  beforeEach(() => {
    service = TestBed.inject(SendEmailService);
  });

  it('sends the form under the variable names of the EmailJS template', async () => {
    const sendSpy = vi.spyOn(emailjs, 'send').mockResolvedValue({ status: 200, text: 'OK' });

    await service.sendEmailJS(contactMeForm);

    expect(sendSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        from_tel: '123456789',
        from_message: 'Hello there',
      },
      expect.any(String),
    );
  });

  it('rejects when EmailJS fails', async () => {
    vi.spyOn(emailjs, 'send').mockRejectedValue({ status: 400, text: 'Bad request' });

    await expect(service.sendEmailJS(contactMeForm)).rejects.toEqual({
      status: 400,
      text: 'Bad request',
    });
  });
});
