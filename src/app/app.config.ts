import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  provideZonelessChangeDetection,
} from '@angular/core';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { AngularFireModule } from '@angular/fire/compat';
import { provideDatabase } from '@angular/fire/database';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { getDatabase } from 'firebase/database';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { FilterPipe } from './shared/filter.pipe';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
      withViewTransitions(),
    ),

    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    FilterPipe,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAnalytics(() => getAnalytics()),
    provideDatabase(() => getDatabase()),
    importProvidersFrom([
      AngularFireModule.initializeApp(environment.firebaseConfig),
    ]),
    provideZonelessChangeDetection(),
  ],
};
