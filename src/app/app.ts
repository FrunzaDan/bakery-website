import { Component, ElementRef, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NotificationComponent } from './components/notification/notification.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [NavbarComponent, FooterComponent, RouterOutlet, NotificationComponent],
})
export class App {
  readonly title = 'TestBakery';

  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  /** `#main-content` would resolve against `<base href="/">` and open the home page, so move focus here instead. */
  skipToContent(event: Event): void {
    event.preventDefault();
    this.main().nativeElement.focus();
  }
}
