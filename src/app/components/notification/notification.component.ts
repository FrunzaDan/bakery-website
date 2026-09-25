import { Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationComponent {
  private readonly notificationService = inject(NotificationService);

  readonly notifications = this.notificationService.notifications;

  runAction(id: number): void {
    this.notificationService.runAction(id);
  }

  dismiss(id: number): void {
    this.notificationService.dismiss(id);
  }
}
