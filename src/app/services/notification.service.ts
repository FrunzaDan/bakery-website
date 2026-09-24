import { Injectable, signal } from '@angular/core';
import { Notification } from '../interfaces/notification';

const DEFAULT_DURATION_MS = 4000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notifications = signal<readonly Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  private nextId = 0;

  /** Shows a notification, replacing the one on screen, and hides it after `durationMs`. */
  show(message: string, durationMs = DEFAULT_DURATION_MS): void {
    const id = ++this.nextId;
    this._notifications.set([{ id, message }]);

    if (durationMs > 0) {
      setTimeout(() => this.dismiss(id), durationMs);
    }
  }

  dismiss(id: number): void {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }
}
