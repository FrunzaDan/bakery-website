import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Firebase Hosting serves only static files, so every page is prerendered at build time. Product and order pages
 * depend on an id only known in the browser, so they render there: Firebase rewrites them to `index.csr.html`.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'products/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'order/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
