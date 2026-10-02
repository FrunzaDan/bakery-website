# TestBakery Website

A storefront demo for a bakery in Sibiu, Romania: browse products, build a cart and place an order. I built it to practise a realistic Angular shop flow (catalog, cart, checkout, order confirmation) without a custom backend. Orders are simulated in the browser and no payment is taken.

---

## 🚀 Key Features

- **Product catalog:** Category filter, search and sort, all kept in the URL query string so a filtered view can be bookmarked or shared. Each product has its own detail page.
- **Resilient data loading:** Products load from a session cache, then from Firebase Realtime Database (5-second timeout), then from a bundled `products.json`, so the shop still works if Firebase is down.
- **Cart:** Signal-based cart with quantity pickers, persisted to `localStorage`.
- **Checkout:** A signal-forms checkout with validation, a saved draft, cash or bank-transfer payment, and a confirmation dialog before the order is placed.
- **Order confirmation:** Orders get an ID like `TB-20260925-0421` and are saved in `localStorage` by a stand-in `OrderService`, which keeps the same interface a real API client would have.
- **Contact form and info pages:** EmailJS contact form, plus delivery, returns and terms pages, with per-page SEO tags.

---

## 🛠 Tech Stack

- **Frontend:** Angular 22.2 (standalone components, signals, signal forms, zoneless), TypeScript, Bootstrap Icons, per-component CSS
- **Backend:** N/A. Server-side rendering and prerendering via `@angular/ssr` with a small Express server
- **Database / Storage:** Firebase Realtime Database (read-only product catalog), browser `localStorage` and `sessionStorage`
- **Tooling & Other:** Firebase JS SDK (loaded on demand), EmailJS, Vitest + jsdom, Prettier, Firebase Hosting

---

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- Node.js `^22.22.3`, `^24.15.0` or `>=26` with npm
- Firebase CLI (`npm install -g firebase-tools`), only if you want to deploy

---

## ⚙️ Local Setup & Running

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

```bash
npm install
npm start              # dev server on http://localhost:4203
npm test               # Vitest unit tests
npm run build          # production build with prerendering → dist/testbakery-website
npm run serve:ssr:TestBakery_Website   # run the built SSR server
```

The dev server uses port 4203 (set in `angular.json`) instead of Angular's default 4200.

---

## 🗄 Database & Migrations

There's no schema or migrations. The catalog is read from the `products` node of the Firebase Realtime Database. `public/assets/products.json` is a full offline copy that the app falls back to, and it's the easiest way to see the expected product shape.

---

## 🔌 API / App Usage

Main routes: `/` (home), `/products` (catalog with `?category=&q=&sort=`), `/products/:id`, `/cart`, `/checkout`, `/order/:id` (confirmation), `/contact`, `/delivery`, `/return` and `/terms`. Unknown URLs show a 404 page.

To deploy to Firebase Hosting (project in `.firebaserc`):

```bash
npm run build
firebase deploy
```

`firebase.json` serves `dist/testbakery-website/browser`, adds long-lived cache headers for hashed bundles, and sends `X-Robots-Tag: noindex` because this is a demo shop.

---

## 📝 License & Notes

Personal project with no license file.

- The UI text is in Romanian and prices are in RON.
- Orders only live in the browser that placed them. Replacing `OrderService` with a real API client is the intended next step if this ever needs a backend.
