import { Injectable, signal } from '@angular/core';
import { Notification } from '../interfaces/notification';

let nextNotificationId = 0;

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly maxNotifications = 1;
  private readonly notificationsSignal = signal<Notification[]>([]);

  readonly notifications = this.notificationsSignal.asReadonly();

  addNotification(notification: Omit<Notification, 'id'>): void {
    const currentNotifications = this.notificationsSignal().slice(0, this.maxNotifications - 1);
    this.notificationsSignal.set([
      ...currentNotifications,
      { ...notification, id: nextNotificationId++ },
    ]);
  }

  removeNotification(notification: Notification): void {
    this.notificationsSignal.update((notifications) =>
      notifications.filter((n) => n.id !== notification.id),
    );
  }
}
