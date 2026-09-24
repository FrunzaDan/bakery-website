import {
  Component,
  inject,
  input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Notification } from '../../interfaces/notification';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  imports: [],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationComponent implements OnInit, OnDestroy {
  private readonly notificationService = inject(NotificationService);

  readonly notification = input.required<Notification>();

  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.startTimeout();
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  private startTimeout(): void {
    this.timeoutId = setTimeout(() => this.dismissNotification(), 4000);
  }

  dismissNotification(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
      this.notificationService.removeNotification(this.notification());
    }
  }
}
