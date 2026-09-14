# TestBakery

An SSR/prerendered storefront for fictional TestBakery, a baker in Sibiu, Romania — browse products by category, build a cart, and place an order via a contact form. No checkout payment processing; orders and inquiries go out through email.

## Tech Stack & Architecture

- **Framework:** Angular 21 (standalone, zoneless change detection, no `NgModule`s), SSR + prerendering via `@angular/ssr` and Express
- **UI & Styling:** Bootstrap 5 + Bootstrap Icons, per-component CSS (no Tailwind/Material/design-system layer)
- **State & Data:** Angular Signals for local/UI state (cart, notifications, selected category), `rxResource` bridging RxJS HTTP/Firebase streams into signals — no NgRx or global store
- **Data & Services:** Firebase Realtime Database (product catalog) + Firebase Analytics via `@angular/fire`, EmailJS for the contact form (no backend API beyond the SSR server)
- **Tooling:** Angular CLI / `@angular/build` (esbuild), Vitest for unit tests, Firebase Hosting for deployment

The app is 100% standalone components bootstrapped from `main.ts` — there's no root module. `app.config.ts` wires up the router (view transitions + scroll restoration), `provideZonelessChangeDetection`, client hydration with event replay, and the Firebase providers; `app.config.server.ts` layers `provideServerRendering()` on top for the SSR/prerender build (`src/server.ts`, an Express app used both by the Angular CLI dev/prerender pipeline and as the Node entry point in `dist/.../server/server.mjs`).

Routing is flat (`app.routes.ts`) — one path per page, no lazy-loaded feature routes or route guards, which fits the size of the app. State lives in a handful of root-provided (`providedIn: 'root'`) services built on `signal`/`computed` rather than a store library: `CartService` owns cart contents and persists them to `localStorage` (deferred to `afterNextRender` to avoid SSR/CSR hydration mismatches, since `localStorage` doesn't exist on the server), `NotificationService` drives the single-slot toast in `app.html`, and `CategoryService` holds the selected product category. `FetchProductsService` layers three tiers for the product catalog: `sessionStorage` cache → Firebase Realtime DB (5s timeout) → static `assets/products.json` fallback — so the storefront stays usable even if Firebase is slow or unreachable. `ProductsComponent` consumes that Observable through `rxResource`, exposing `.value()`/`.isLoading()` as signals and driving the template with `@if`/`@for` control flow (no `*ngIf`/`*ngFor`, no `async` pipe).

## Project Structure

```text
src/
├── app/
│   ├── components/    # All routed pages + shared UI (navbar, footer, notification toast) — flat, standalone components
│   ├── services/      # providedIn: 'root' signal-based services: cart, notifications, category, product fetch, storage, SEO, email
│   ├── interfaces/     # Plain TS interfaces (Product, Notification, form shapes)
│   ├── shared/         # FilterPipe (search filtering) — the one cross-cutting pipe
│   ├── app.config.ts        # Browser providers: router, hydration, HttpClient, Firebase
│   ├── app.config.server.ts # Adds provideServerRendering() for SSR
│   └── app.routes.ts        # Flat route table, one component per page
├── environments/
│   └── environment.ts  # Firebase + EmailJS config (see note below)
├── main.ts / main.server.ts / server.ts  # Browser bootstrap, SSR bootstrap, Express SSR server
└── index.html
public/
└── assets/              # Images, fonts, and products.json (offline fallback catalog)
```

There's no `core/`+`features/`+`shared/` split here — the app is small enough that a flat `components/` + `services/` layout stays readable. If the product surface grows (more routes, route-level guards, lazy chunks), that's the natural point to introduce feature folders and lazy-loaded routes.

## Environment & Setup

`src/environments/environment.ts` holds the Firebase project config (API key, DB URL, etc.) and EmailJS service/template/public keys — there's no `.env` or `environment.prod.ts` split; the same file is used for all builds. The Firebase web config here is safe to expose client-side (it's not a secret), but the EmailJS keys in the repo are placeholders (`'test'`) — swap in real values before wiring up the contact form.

## Getting Started

```bash
npm install
npm start          # ng serve — http://localhost:4203 (non-default port, see angular.json)
npm test           # unit tests via Vitest (@angular/build:unit-test), not Karma
npm run build       # production build + SSR bundle
npm run watch       # dev-config build in watch mode
npm run serve:ssr:Misam_Website   # run the built SSR server directly
```

A few things worth knowing:

- The dev server runs on **4203**, not Angular's default 4200 (`angular.json` → `serve.options.port`).
- `ng build` prerenders all routes (`prerender: true` in `angular.json`) in addition to producing the SSR server bundle — most pages are actually served as static HTML in production, with SSR as the fallback/hydration path.
- Production bundle budgets are tight (1.5MB warning / 2MB error initial; 2KB/4KB per component style) — worth checking after adding new dependencies or large images.
- Tests use Angular's newer Vitest-based unit-test builder, not Karma/Jasmine — despite what older Angular docs or muscle memory might suggest.
