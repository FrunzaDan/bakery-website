import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Analytics } from '@angular/fire/analytics';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NotificationComponent } from './components/notification/notification.component';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [NavbarComponent, FooterComponent, RouterOutlet, NotificationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly notificationService = inject(NotificationService);
  // Keeps Firebase Analytics active for the app's lifetime.
  private readonly analytics = inject(Analytics);

  readonly title = 'Misam';
  readonly notifications = this.notificationService.notifications;
}
