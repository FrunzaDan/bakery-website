# TestBakery Website

TestBakery Website is a demo online shop for a bakery in Sibiu, Romania. Customers can browse products by category, search and sort them, build a cart and place an order through a full checkout flow. There's no custom backend: the product catalog comes from Firebase Realtime Database with a bundled JSON fallback, and orders are simulated and saved in the browser, with no payment taken. Pages are prerendered at build time and served as static files from Firebase Hosting; product and order pages render in the browser. I built it to practise a realistic shop flow in modern Angular (signals, signal forms and resources), and wrote the order service so it can be swapped for a real API later.

---

## Key Features

- **Product catalog:** Products can be filtered by category, searched by name and sorted by name or price. The filters live in the URL query string (for example `?category=sweets&q=tort&sort=price-asc`), so a filtered view can be bookmarked or shared, and each product has its own detail page.
- **Resilient data loading:** The catalog is read first from a session cache, then from Firebase Realtime Database (its REST API, through `HttpClient`) with a 5-second timeout, and finally from a bundled `products.json`. The shop keeps working even if Firebase is slow or down, and the response fetched while prerendering is handed to the browser instead of being fetched again.
- **Cart:** The cart is built on signals, with quantity pickers and running totals in RON. It's saved to `localStorage`, and it's restored after hydration so the server-rendered page and the browser agree.
- **Checkout:** The checkout form is built with Angular signal forms and validates contact and delivery details, with a summary of any invalid fields. The draft is kept while you browse, you choose cash on delivery or bank transfer, and a confirmation dialog shows the exact order before it's placed.
- **Order confirmation:** Each order gets an ID like `TB-20260925-0421` and its own confirmation page. A stand-in `OrderService` saves orders to `localStorage` after a short simulated delay, behind the same methods a real API client would expose.
- **Contact form and info pages:** A contact form sends messages through EmailJS, and there are pages for delivery and payment, returns, and terms. Every page sets its own title, meta description and social sharing tags.

---

## Tech Stack

- **Frontend:** Angular 22.2 (standalone components, signals, signal forms, zoneless), TypeScript, Bootstrap Icons, per-component CSS
- **Backend:** N/A. Build-time prerendering via `@angular/ssr` (`outputMode: "static"`), no server
- **Database / Storage:** Firebase Realtime Database (read-only product catalog), browser `localStorage` and `sessionStorage`
- **Tooling & Other:** Firebase JS SDK (Analytics only, loaded after startup), EmailJS, Vitest + jsdom, Prettier, Firebase Hosting

---

## Prerequisites

Before running this project, ensure you have the following installed:

- Node.js `^22.22.3`, `^24.15.0` or `>=26` with npm
- Firebase CLI (`npm install -g firebase-tools`), only if you want to deploy

---

## Local Setup & Running

### 1. Clone the repository

```bash
git clone https://github.com/FrunzaDan/bakery-website.git
cd bakery-website
```

### 2. Configuration

All runtime config is in `src/environments/environment.ts`:

- `firebaseConfig`: the Firebase web config, including the Realtime Database URL. This is public client config, not a secret.
- `emailJSConfig`: the EmailJS service ID, template ID and public key. These are placeholders (`'test'`), so replace them with real values before the contact form can send anything.

There is a single environment file used for every build.

### 3. Installation & Run

The scripts in the repo root do the usual steps for you:

```bash
./build.sh               # npm ci, format check, lint, build, unit tests (--skip-tests to skip them)
./run.sh                 # dev server (runs npm ci first if node_modules is missing)
```

Or run the npm scripts yourself:

```bash
npm install
npm start              # dev server on http://localhost:4207
npm test               # Vitest unit tests
npm run build          # prerendered static build → dist/testbakery-website/browser
```

The dev server uses port 4207 (set in `angular.json`) instead of Angular's default 4200.

---

## Database & Migrations

There's no schema or migrations. The catalog is read from the `products` node of the Firebase Realtime Database. `public/assets/products.json` is a full offline copy that the app falls back to, and it's the easiest way to see the expected product shape.

---

## API / App Usage

Main routes: `/` (home), `/products` (catalog with `?category=&q=&sort=`), `/products/:id`, `/cart`, `/checkout`, `/order/:id` (confirmation), `/contact`, `/delivery`, `/return` and `/terms`. Unknown URLs show a 404 page.

To deploy to Firebase Hosting (project in `.firebaserc`):

```bash
npm run build
firebase deploy
```

`firebase.json` serves `dist/testbakery-website/browser`, adds long-lived cache headers for hashed bundles, and sends `X-Robots-Tag: noindex` because this is a demo shop. `/products/*` and `/order/*` are rewritten to `index.csr.html`, since those pages render in the browser; any other unknown URL gets the prerendered `404.html` with a real 404 status (`npm run build` copies it from `404/index.html`).

---

## License & Notes

Personal project with no license file.

- The UI text is in Romanian and prices are in RON.
- Orders only live in the browser that placed them. Replacing `OrderService` with a real API client is the intended next step if this ever needs a backend.
