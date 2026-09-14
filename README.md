# TestBakery

SSR/prerendered storefront for TestBakery, a bakery in Sibiu, Romania — browse products by category, build a cart, and place an order through a contact form. There's no payment/checkout processing; orders and inquiries go out by email.

## Tech Stack & Architecture

- **Framework:** Angular 21.2, fully standalone (no `NgModule`s anywhere), zoneless change detection, SSR + prerendering via `@angular/ssr` and Express
- **UI & Styling:** Bootstrap 5 + Bootstrap Icons, per-component CSS — no Tailwind, no Material, no design-system layer
- **State & Data:** Angular Signals for local/UI state, `rxResource` to bridge RxJS (HTTP + Firebase) streams into signals — no NgRx, no global store
- **Data & Services:** Firebase Realtime Database (product catalog) + Firebase Analytics via `@angular/fire`, EmailJS for the contact form — no custom backend API beyond the SSR server itself
- **Tooling:** Angular CLI / `@angular/build` (esbuild), Vitest for unit tests, Firebase Hosting for deploys

Everything bootstraps from `main.ts` — there's no root module, just `bootstrapApplication`. `app.config.ts` wires up the router (view transitions + scroll restoration), `provideZonelessChangeDetection`, client hydration with event replay, and the Firebase providers; `app.config.server.ts` merges in `provideServerRendering()` for the SSR/prerender build. `src/server.ts` is a small Express app that both the Angular CLI's dev/prerender pipeline and the built Node server (`dist/testbakery-website/server/server.mjs`) run through.

Routing (`app.routes.ts`) is flat — one path, one component, no nesting, no lazy chunks, no guards. That's a deliberate fit for the app's size, not an oversight. State lives in a handful of root-provided (`providedIn: 'root'`) services built on `signal`/`computed`, not a store library: `CartService` owns the cart and persists it to `localStorage`, deferred to `afterNextRender` so SSR and the first client render agree on initial state (the server has no `localStorage`); `NotificationService` drives the single-slot toast in `app.html`; `CategoryService` holds the selected product category. `FetchProductsService` layers three tiers for the catalog — `sessionStorage` cache → Firebase Realtime DB (5s timeout) → static `assets/products.json` fallback — so the storefront still works if Firebase is slow or down. `ProductsComponent` consumes that as an `rxResource`, exposing `.value()` / `.isLoading()` as signals, and the template is pure modern control flow (`@if` / `@for`, no `*ngIf`/`*ngFor`, no `async` pipe).

## Project Structure

```text
src/
├── app/
│   ├── components/    # Every routed page + shared UI (navbar, footer, notification toast) — flat, standalone components
│   ├── services/      # providedIn: 'root' signal-based services: cart, notifications, category, product fetch, storage, SEO, email
│   ├── interfaces/    # Plain TS interfaces (Product, Notification, form shapes)
│   ├── shared/         # FilterPipe — the one cross-cutting pipe
│   ├── app.config.ts        # Browser providers: router, hydration, HttpClient, Firebase
│   ├── app.config.server.ts # Adds provideServerRendering() for SSR
│   └── app.routes.ts        # Flat route table, one component per page
├── environments/
│   └── environment.ts  # Firebase + EmailJS config, single file for all builds
├── main.ts / main.server.ts / server.ts  # Browser bootstrap, SSR bootstrap, Express SSR server
└── index.html
public/
└── assets/              # Images, fonts, and products.json (offline fallback catalog)
```

There's no `core/` + `features/` + `shared/` split — the app is small enough that flat `components/` + `services/` stays easy to navigate. If the route count or team grows, that's the point to introduce feature folders, route-level guards, and lazy loading — not before.

## Environment & Setup

`src/environments/environment.ts` holds the Firebase project config (API key, DB URL, etc.) and EmailJS service/template/public keys. There's no `.env`, no `environment.prod.ts` split — one file, used for every build. The Firebase web config is safe to have client-side (it's not a secret), but the EmailJS keys checked into the repo are placeholders (`'test'`) — swap in real values before the contact form can actually send anything. No Docker setup; the deploy target is Firebase Hosting, configured by `firebase.json` (SPA rewrite to `index.html`, serves `dist/testbakery-website/browser`) and `.firebaserc` (the Firebase backend wasn't renamed alongside the app, see note below).

## Getting Started

```bash
npm install
npm start          # ng serve — http://localhost:4203 (non-default port, see angular.json)
npm test           # unit tests via Vitest (@angular/build:unit-test), not Karma
npm run build       # production build + SSR bundle → dist/testbakery-website
npm run watch       # dev-config build in watch mode
npm run serve:ssr:TestBakery_Website   # run the built SSR server directly (node dist/testbakery-website/server/server.mjs)
```

Worth knowing:

- Dev server runs on **4203**, not Angular's default 4200 (`angular.json` → `serve.options.port`).
- `ng build` prerenders every route (`prerender: true`) on top of producing the SSR server bundle — most pages ship as static HTML in production, with SSR as the fallback/hydration path rather than the primary rendering mode.
- Production bundle budgets are tight: 1.5MB warning / 2MB error initial, 2KB/4KB per component style. Check these after adding dependencies or large images.
- Tests run on Angular's newer Vitest-based unit-test builder (`@angular/build:unit-test`), not Karma/Jasmine.
