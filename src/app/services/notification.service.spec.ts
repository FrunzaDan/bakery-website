import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('starts with no notifications', () => {
    expect(service.notifications()).toEqual([]);
  });

  it('adds a notification with an assigned id', () => {
    service.addNotification({ message: 'Hello' });

    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].message).toBe('Hello');
    expect(notifications[0].id).toBeTypeOf('number');
  });

  it('caps the number of visible notifications at 1', () => {
    service.addNotification({ message: 'First' });
    service.addNotification({ message: 'Second' });

    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].message).toBe('Second');
  });

  it('assigns increasing ids to successive notifications', () => {
    service.addNotification({ message: 'First' });
    const firstId = service.notifications()[0].id;

    service.addNotification({ message: 'Second' });
    const secondId = service.notifications()[0].id;

    expect(secondId).toBeGreaterThan(firstId);
  });

  it('removes a notification by id', () => {
    service.addNotification({ message: 'Only' });
    const notification = service.notifications()[0];

    service.removeNotification(notification);

    expect(service.notifications()).toEqual([]);
  });

  it('does nothing when removing a notification that is not present', () => {
    service.addNotification({ message: 'Kept' });
    const kept = service.notifications()[0];

    service.removeNotification({ id: -1, message: 'Unknown' });

    expect(service.notifications()).toEqual([kept]);
  });
});
