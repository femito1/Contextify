import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { MainComponent } from './app/main/main.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(MainComponent, {
  providers: [
    provideRouter(routes),
    ...appConfig.providers,
    provideHttpClient()
  ]
}).catch((err) => console.error(err));
