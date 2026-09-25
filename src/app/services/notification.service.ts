import { Injectable, signal } from '@angular/core';
import { Notification, NotificationAction } from '../interfaces/notification';

const DEFAULT_DURATION_MS = 4000;
/** Notifications with an action stay longer, so there is time to read them and react. */
const ACTION_DURATION_MS = 7000;

export interface NotificationOptions {
  /** How long the notification stays; 0 keeps it until it is dismissed. */
  readonly durationMs?: number;
  readonly action?: NotificationAction;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notifications = signal<readonly Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  private nextId = 0;

  /** Shows a notification, replacing the one on screen, and hides it after its duration. */
  show(message: string, { action, durationMs }: NotificationOptions = {}): void {
    const id = ++this.nextId;
    this._notifications.set([action ? { id, message, action } : { id, message }]);

    const duration = durationMs ?? (action ? ACTION_DURATION_MS : DEFAULT_DURATION_MS);
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  /** Runs the notification's action once and hides the notification. */
  runAction(id: number): void {
    const notification = this._notifications().find((n) => n.id === id);
    this.dismiss(id);
    notification?.action?.run();
  }

  dismiss(id: number): void {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }
}
