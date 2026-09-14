import { Injectable, signal } from '@angular/core';
import { Notification } from '../interfaces/notification';

let nextNotificationId = 0;

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly maxNotifications: number = 1;
  private readonly notificationsSignal = signal<Notification[]>([]);

  readonly notifications = this.notificationsSignal.asReadonly();

  addNotification(notification: Omit<Notification, 'id'>): void {
    const currentNotifications: Notification[] = this.notificationsSignal()
      .slice(0, this.maxNotifications - 1);
    this.notificationsSignal.set([
      ...currentNotifications,
      { ...notification, id: nextNotificationId++ },
    ]);
  }

  removeNotification(notification: Notification): void {
    this.notificationsSignal.update((notifications: Notification[]): Notification[] =>
      notifications.filter((n: Notification): boolean => n.id !== notification.id)
    );
  }
}
