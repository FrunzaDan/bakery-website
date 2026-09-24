import { Component, inject } from '@angular/core';
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
})
export class App {
  private readonly notificationService = inject(NotificationService);

  readonly title = 'TestBakery';
  readonly notifications = this.notificationService.notifications;
}
