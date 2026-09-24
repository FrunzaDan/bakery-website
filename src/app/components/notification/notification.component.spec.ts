import { TestBed } from '@angular/core/testing';
import { NotificationService } from '../../services/notification.service';
import { NotificationComponent } from './notification.component';

describe('NotificationComponent', () => {
  const render = () => {
    const fixture = TestBed.createComponent(NotificationComponent);
    fixture.detectChanges();
    return fixture;
  };

  it('keeps an empty live region on the page so new messages are announced', () => {
    const el: HTMLElement = render().nativeElement;

    expect(el.querySelector('[aria-live="polite"]')).not.toBeNull();
    expect(el.querySelector('.notification')).toBeNull();
  });

  it('shows the message as a status', () => {
    TestBed.inject(NotificationService).show('"Croissant" a fost adăugat!');
    const el: HTMLElement = render().nativeElement;

    const toast = el.querySelector('.notification');
    expect(toast?.getAttribute('role')).toBe('status');
    expect(toast?.textContent).toContain('"Croissant" a fost adăugat!');
  });

  it('removes the notification when Ok is clicked', async () => {
    TestBed.inject(NotificationService).show('Coșul a fost golit!');
    const fixture = render();
    const el: HTMLElement = fixture.nativeElement;

    el.querySelector<HTMLButtonElement>('.notification button')!.click();
    await fixture.whenStable();

    expect(el.querySelector('.notification')).toBeNull();
  });
});
