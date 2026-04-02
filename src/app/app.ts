import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Analytics } from '@angular/fire/analytics';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NotificationComponent } from './components/notification/notification.component';
import { Notification } from './interfaces/notification';
import { NotificationService } from './services/notification.service';
import { fadeIn, fadeOut } from './animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [
    NavbarComponent,
    FooterComponent,
    CommonModule,
    RouterOutlet,
    NotificationComponent,
  ],
  animations: [fadeIn, fadeOut],
})
export class App implements OnInit {
  title = 'Misam';

  notifications$!: Observable<Notification[]>;

  constructor(
    private notificationService: NotificationService,
    private analytics: Analytics,
  ) {}

  ngOnInit(): void {
    this.notifications$ = this.notificationService.notifications$;
  }
}
