import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with no notifications', () => {
    expect(service.notifications()).toEqual([]);
  });

  it('shows a notification with an assigned id', () => {
    service.show('Hello');

    expect(service.notifications()).toEqual([{ id: expect.any(Number), message: 'Hello' }]);
  });

  it('replaces the notification on screen with the newest one', () => {
    service.show('First');
    service.show('Second');

    expect(service.notifications().map((n) => n.message)).toEqual(['Second']);
  });

  it('hides a notification after 4 seconds', () => {
    service.show('Hello');

    vi.advanceTimersByTime(3999);
    expect(service.notifications().length).toBe(1);

    vi.advanceTimersByTime(1);
    expect(service.notifications()).toEqual([]);
  });

  it('keeps the newest notification when the replaced one times out', () => {
    service.show('First');
    vi.advanceTimersByTime(3000);
    service.show('Second');

    vi.advanceTimersByTime(1000);
    expect(service.notifications().map((n) => n.message)).toEqual(['Second']);
  });

  it('keeps a notification with a zero duration until it is dismissed', () => {
    service.show('Sticky', 0);
    vi.advanceTimersByTime(60_000);
    expect(service.notifications().length).toBe(1);

    service.dismiss(service.notifications()[0].id);
    expect(service.notifications()).toEqual([]);
  });

  it('does nothing when dismissing a notification that is not present', () => {
    service.show('Kept');
    const kept = service.notifications();

    service.dismiss(-1);

    expect(service.notifications()).toEqual(kept);
  });
});
