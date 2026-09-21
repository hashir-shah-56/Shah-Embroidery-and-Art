# Shah Embroidery & Art — Complete Project Reference & Documentation

Welcome to the official repository for **Shah Embroidery & Art**. This document serves as the single source of truth for the codebase, design system, file organization, interactive features, and future development roadmap.

> [!IMPORTANT]
> **STANDING RULE FOR ALL DEVELOPERS & AI ASSISTANTS**
> Maintaining this `README.md` is a **REQUIRED STEP** for every task. Any time you add a feature, refactor code, change file structures, update styling rules, or fix bugs, you **MUST update the relevant sections** (File Structure, Feature List, Page Functionality, Known Limitations, and Change Log) before considering the work complete.

---

## 1. Project Overview

- **Business Name:** Shah Embroidery & Art
- **Founder & Master Artisan:** Syeda Tauseefa Abrar (16 years of artisanal craftsmanship in handmade embroidery, hoop art, and bespoke textile creations)
- **Brand Vision:** Combining traditional needlework heritage with contemporary artistic elegance. Specializing in handmade floral embroidery, custom bridal hoops, Islamic calligraphic threadwork, and personalized portrait embroidery.
- **Site Purpose:** High-end business and service website showcasing past works, accepting custom order requests, providing itemized artwork exploration, and executing a complete front-end e-commerce shopping cart & multi-step checkout workflow.
- **Tech Stack:**
  - **Customer backend:** Supabase Auth, persistent customer profiles, saved addresses, orders, order items, and custom order requests linked to `auth.users.id`. Guest custom requests have no user ID. Profile names/phones come from `public.profiles`; email/password changes use Auth. Wishlist uses UUID-owned Supabase rows; cart remains browser-local; `shah_last_order` remains a receipt cache.
  - **Core:** HTML5, Modular Vanilla CSS3, Vanilla JavaScript (ES6+)
  - **Typography & Icons:** Google Fonts (`Cormorant Garamond` & `Plus Jakarta Sans`), Font Awesome 6 Free
  - **Tooling & Build System:** Google Antigravity Agentic IDE
  - **Deployment:** Netlify
- **Live URL:** [https://shah-embroidery-and-art.netlify.app/](https://shah-embroidery-and-art.netlify.app/)

---

## 2. Design System Reference

### Color Palette

| Color Name | Hex Code | CSS Variable | Intended Usage |
| :--- | :--- | :--- | :--- |
| **Main Background** | `#FAF6F0` | `--bg-main` | Primary warm parchment body background |
| **Secondary Background**| `#F3ECE1` | `--bg-secondary` | Soft warm beige section contrast & card headers |
| **Card Background** | `#FFFFFF` | `--bg-card` | Pure white background for product cards & modals |
| **Elevated Surface** | `#F8F3EC` | `--bg-surface` | Soft tint background for inner elements & steppers |
| **Dark Theme / Footer**| `#1E1A17` | `--bg-dark` | Deep dark espresso background for footer & high-contrast elements |
| **Primary Text** | `#2A2421` | `--text-primary` | Dark charcoal for primary titles, headings, and body text |
| **Secondary Text** | `#6E655F` | `--text-secondary` | Muted charcoal for descriptions & subtitles |
| **Muted Text** | `#7A7069` | `--text-muted` | Dimmed taupe for secondary metadata, dates & placeholders |
| **Light Text** | `#FAF6F0` | `--text-light` | Parchment white text used over dark backgrounds |
| **Artisan Gold** | `#C5A059` | `--accent-gold` | Core luxury brand accent for buttons, borders & highlights |
| **Gold Hover** | `#B08B44` | `--accent-gold-hover` | Deepened gold state for button hovers & active links |
| **Gold Light Tint** | `#F7F1E5` | `--accent-gold-light` | Subtle champagne tint background for badges & alert boxes |
| **Earth Taupe** | `#8C7E72` | `--accent-taupe` | Secondary earthy taupe accent for subtle highlights |
| **Border Color** | `#E8DFD3` | `--border-color` | Warm divider lines, card borders, and input outlines |
| **Light Border** | `#F2ECE3` | `--border-light` | Subtle secondary borders inside cards & tables |

### Typography

- **Loading:** All 11 HTML pages load Google Fonts through a stylesheet `<link>` in `<head>`, before other stylesheets, with preconnects to `fonts.googleapis.com` and `fonts.gstatic.com` (the latter uses `crossorigin`). The shared request includes Cormorant Garamond normal 400/500/600/700 and italic 400, Plus Jakarta Sans 300/400/500/600/700, and `display=swap`. No CSS font `@import` remains. Existing family declarations, sizes, and weights are unchanged; fallback stacks still cover loading or network failures.

- **Heading Font:** `'Cormorant Garamond', Georgia, serif`
  - Used for section titles (`.section-title`), hero heading (`.hero-title`), modal headers, and brand logos.
  - Font weights utilized: `400` (Regular), `500` (Medium), `600` (Semi-Bold), `700` (Bold).
- **Body Font:** `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif`
  - Used for body text, navigation links, buttons, inputs, form labels, badges, and metadata.
  - Font weights utilized: `300` (Light), `400` (Regular), `500` (Medium), `600` (Semi-Bold), `700` (Bold).

### Spacing, Radii & Elevation Scale

- **Section Spacing:** Fluid padding `.section-padding` set to `clamp(50px, 7vw, 90px) 0`.
- **Max Container Width:** `.container` width is `90%`, max-width `1280px` centered.
- **Border Radii Scale:**
  - `--radius-sm`: `8px` (Small buttons, input fields, badges)
  - `--radius-md`: `16px` (Cards, product thumbs, search dropdowns)
  - `--radius-lg`: `24px` (Large cards, feature grids, hero wrapper)
  - `--radius-xl`: `32px` (Modal containers, prominent banners)
  - `--radius-full`: `9999px` (Pill buttons, badges)
- **Shadow Scale:**
  - `--shadow-sm`: `0 4px 12px rgba(42, 36, 33, 0.03)` (Subtle card rest state)
  - `--shadow-md`: `0 10px 30px rgba(42, 36, 33, 0.06)` (Card hover state & dropdowns)
  - `--shadow-lg`: `10px 10px 15px 2px rgba(0, 0, 0, 0.274)` (Modal drawer depth)
  - `--shadow-gold`: `0 10px 25px rgba(197, 160, 89, 0.25)` (Primary gold button glow)

### Button System & UX Guidelines

- **`.btn-primary`**: Gold fill (`var(--accent-gold)`), white bold text, gold shadow.
  - **CRITICAL UI/UX RULE:** Only **ONE** `.btn-primary` should be visible per viewport view to maintain strong call-to-action hierarchy!
- **`.btn-secondary`**: Dark espresso fill (`var(--text-primary)`), white text. Used for strong secondary actions.
- **`.btn-outline`**: Dark outline (`1.5px solid var(--text-primary)`), transparent background. Switches to dark fill on hover.
- **`.btn-outline-gold`**: Gold outline (`1.5px solid var(--accent-gold)`), transparent background, gold text. Switches to gold fill on hover.
- **`.btn-danger`**: Warm red fill (`#C4453A`) with a darker hover state, reserved for destructive confirmation actions such as cancelling an order.

### Notification Component (Single Source of Truth)

All ephemeral success/error notices funnel through **one** reusable toast exposed as `window.showToast(message, type)` and powered by `css/toast.css`:

- **Structure:** A single fixed-position `.site-toast` element (`#siteToast`) is created on demand and appended to `<body>`, so it floats above every page/modifier independently of any re-rendered subtree.
- **Styling:** White card (`--bg-card`), rounded corners (`--radius-md`), soft lift (`--shadow-md`), thin neutral border, and a signature **gold left-accent rail** (`border-left: 4px solid var(--accent-gold)`) signalling positive feedback; the rail turns warm red (`#C0392B`) for the error variant (`.site-toast-error`).
- **Iconography:** Leading ✓ (success) or ⚠ (warning/error) glyph in a coloured `.toast-icon` chip reinforces the tonal cue at a glance.
- **Lifecycle:** Appears centre-bottom, animates in/out via opacity + translate, and auto-dismisses after ~3 seconds; successive calls safely restart the dismissal timer.
- **Coverage:** Drives newsletter subscriptions, cart-save failures, order-placing storage errors, custom-order save failures, address add/edit/delete/default updates, settings saves, and order cancellations — replacing the fragmented legacy `accountToast`, `settingsSuccessMessage`, and scattered `alert()` calls so every notice looks and behaves alike.
- **Contextual exceptions retained deliberately:** the long custom-order form and the contact form keep their **inline** confirmation panels anchored beneath the form (better suited to tall forms than a fleeting corner toast).

### Skeleton Loading Component

The shared `css/skeleton.css` component provides warm beige shimmer placeholders that reuse the site's `--bg-secondary`, `--border-light`, `--bg-card`, and radius tokens. It includes card, circular, gallery, testimonial, banner, cart-row, summary, profile-list, and form-choice primitives. Skeletons are used for homepage artwork/gallery/testimonial/banner surfaces, cart localStorage summaries, every profile data tab (orders, custom orders, wishlist, and saved addresses), custom-order choices, and order confirmation recap content. Dynamic containers expose `aria-busy` during their minimum 380ms loading state, image slots remain skeletonized until `load`/`error`, and `prefers-reduced-motion` disables shimmer animation.

---

## 3. File Structure

```
Shah Embroidery/
├── shop.html                            # Full in-stock Supabase catalog with dynamic filters and pagination
├── css/shop.css                         # Shop filter, status and pagination layout
├── js/shop.js                           # Shop queries, dynamic categories, URL state and page rendering
├── index.html                           # Single-page application entry point
├── cart.html                            # Standalone shopping cart page
├── checkout.html                        # Standalone checkout page
├── order-confirmation.html              # Standalone order confirmation page
├── profile.html                         # Authenticated account profile page
├── reset-password.html                  # Recovery-event-gated password reset page with standard navbar/footer
├── custom-order.html                    # Standalone custom order request page
├── 404.html                             # Custom "page not found" error page (root level ⇒ auto-served by Netlify)
├── README.md                            # Comprehensive project documentation (This file)
├── WhatsApp Image 2026-08-20 at 1.53.56 PM.jpeg  # Legacy asset sample
├── Images/                              # Visual assets & artwork portfolio
│   ├── Logo.png                         # Official brand logo mark
│   ├── hero_embroidery.jpg              # Main hero banner imagery
│   ├── brand_artisan.jpg                # Syeda Tauseefa Abrar profile photo
│   ├── art_*.jpg                        # Featured artwork card thumbnails
│   ├── banner_*.jpg                     # Full-width promotion banner backgrounds
│   ├── gallery_*.jpg                    # Filterable gallery portfolio photos
│   ├── hf_*.png                         # High-fidelity artwork graphics
│   └── favicon/                         # Generated favicon assets
│       ├── favicon-16x16.png            # 16×16 browser tab favicon
│       ├── favicon-32x32.png            # 32×32 high-DPI tab / bookmark favicon
│       ├── apple-touch-icon.png         # 180×180 iOS home-screen icon
│       └── favicon-192x192.png          # 192×192 Android / PWA icon
├── css/                                 # Modular Vanilla CSS Architecture
│   ├── style.css                        # Master CSS aggregator file (@import manifest)
│   ├── base.css                         # Custom properties, resets, body defaults, container & header utilities
│   ├── buttons.css                      # Button system (.btn-primary, .btn-secondary, outline) & badge styling
│   ├── navbar.css                       # Sticky header, logo, nav links, inline search & cart badge
│   ├── hero.css                         # Hero section dual-column layout, typography & floating badge
│   ├── artwork.css                      # Artwork card grid, price labels, quick view trigger overlay
│   ├── banners.css                      # Promotional callout banners & overlay gradient masks
│   ├── features.css                     # Value proposition feature cards grid (4-column)
│   ├── story.css                        # Brand story / artisan profile layout
│   ├── custom-cta.css                   # Bespoke order banner strip layout
│   ├── custom-order.css                 # Standalone custom order page layout
│   ├── gallery.css                      # Portfolio grid, tab filter pill navigation & hover effects
│   ├── trust-strip.css                  # Trust indicators strip styling
│   ├── testimonials.css                 # Client reviews card grid & star ratings
│   ├── contact.css                      # Contact info & message form grid
│   ├── footer.css                       # Dark theme footer, multi-column navigation & copyright bar
│   ├── toast.css                        # Site-wide unified toast component (& cart badge bounce keyframes)
│   ├── skeleton.css                     # Shared warm skeleton loading states and responsive primitives
│   ├── cart.css                         # Shopping cart modal drawer, empty state & item rows
│   ├── checkout.css                     # Multi-step checkout modal, payment cards & summary sidebar
│   ├── confirmation.css                 # Order confirmation modal, success check badge & receipt card
│   ├── forms.css                        # Input fields, select boxes, labels & validation error states
│   ├── modals.css                       # Base modal backdrop overlays, container scale & close buttons
│   ├── responsive.css                   # Media queries for 1024px, 768px, and 480px breakpoints
└── js/
    ├── script.js                        # Master JavaScript bundle handling shared site interactivity
    ├── supabase-client.js               # Shared Supabase client configuration & initialization
    ├── auth.js                          # Validated identity, cached profiles, self-healing, saves and contact prefill
    ├── address-service.js               # Own-customer address queries, transactional CRUD/default RPC, memory cache
    ├── order-service.js                 # Validated customer/owner order queries, inserts, retries and status changes
    ├── admin-orders.js                  # Isolated admin order table, details, status controls and pagination
    ├── admin-custom-orders.js           # Owner custom requests, reference images, status updates and pagination
    ├── product-loader.js                # Shared product card renderer & Supabase catalog loader
    ├── shop.js                          # Shop queries, URL state, skeleton loading & pagination controls
    └── custom-order.js                  # Custom request validation, Storage uploads and Supabase submission
```

---

Additional migration files: `supabase/customer-auth.sql` supplies the existing customer table/RLS setup, reused unchanged for Phase 2. `tests/customer-auth-browser.cjs` provides auth regressions and the shared test fixture; `tests/customer-profiles-browser.cjs` covers profile/settings, prefill, and responsive behavior; `tests/customer-profiles-sql.cjs` executes the actual setup SQL and authorization checks in a temporary local PostgreSQL engine. No duplicate profile migration or creation trigger is needed.

Phase 3 adds `supabase/customer-addresses.sql`, `tests/customer-addresses-browser.cjs`, and `tests/customer-addresses-sql.cjs`. The shared address service is loaded only by `profile.html` and `checkout.html`; UI bindings remain in `js/script.js`, with scoped address styling in `css/profile.css`.

Order migration adds `supabase/order-cancellation.sql`, `tests/orders-browser.cjs`, and `tests/orders-sql.cjs`. `js/order-service.js` is loaded by checkout, profile, and admin; `js/admin-orders.js` is loaded only by admin. Existing order tables are reused without recreation. Product cards pass their database ID into new cart entries when available.

Password recovery uses the existing `js/auth.js` service/listener, modal and validation bindings in `js/script.js`, scoped token-based styles in `css/modals.css`, and `tests/password-recovery-browser.cjs`. No password table, SQL migration, or additional Auth listener is introduced.

## 4. Page-by-Page / Section-by-Section Functionality

### 1. Announcement Bar
- **Description:** A top notification bar displaying brand highlights (*Handcrafted with Passion • Custom Orders Available • Worldwide Delivery*).
- **Behavior:** Static top bar with gold bullet dividers.

### 2. Navbar & Mobile Navigation Drawer
- **Account state:** The guest icon/avatar uses the verified session and first letter of `profiles.full_name`, falling back to the authenticated email initial when the name is unavailable. One shared listener updates it after saves; profile and checkout wait for validation before granting access.
- **Description:** Sticky navigation header (`.navbar`) containing the brand logo, desktop link menu, expanding search trigger, cart bag icon with live badge, and mobile hamburger button.
- **Interactive Behavior:**
  - On scroll past `40px`, `.scrolled` class is added, attaching a soft shadow and subtle background blur.
  - Hamburger toggle opens the sliding mobile drawer (`.mobile-drawer`) with a black semi-transparent overlay and locks body scrolling (`overflow: hidden`).
  - Active section link highlights automatically based on scroll position via JavaScript `IntersectionObserver` / scroll calculation.

### 3. Inline Expanding Search Bar & Live Suggestions
- **Description:** A modern header search component located inside the navbar actions.
- **Interactive Behavior:**
  - At 768px and above, clicking search icon smoothly expands the search input container inline (`.nav-search-wrapper.is-active`). Below 768px, it becomes a full-width navbar takeover: the close button and search field replace the logo, hamburger, cart, and account controls without changing the navbar's 80px height; suggestions span the viewport below it.
  - Performs **debounced searching (250ms)** against a dynamically generated catalog dataset extracted from DOM elements (Artwork Cards, Gallery Items, Collections).
  - Displays a live dropdown menu (`.search-suggestions-dropdown`) grouping results by category (*HAND EMBROIDERY, HOOP ART, COLLECTIONS*).
  - Uses Regex matching to highlight search queries inside titles and categories (`.search-highlight`).
  - Supports full **Keyboard Navigation**: `ArrowDown`, `ArrowUp`, `Enter` to select, and `Escape` to close.
  - Clicking any result closes search and smoothly auto-scrolls to the target card with a gold highlight pulse effect or triggers quick view modal.

### 4. Hero Section (`#home`)
- **Description:** High-impact introduction highlighting Syeda Tauseefa Abrar's 16-year legacy.
- **Elements:** Headline, brand introduction text, Primary CTA (*Explore Our Work*), Secondary CTA (*Custom Order*), hero image, and floating *Artisanal Excellence* badge.

### 5. Latest Work Grid (`#featured`)

- Powered by the Supabase `products` table through `js/product-loader.js`, with refreshed shopping, wishlist, search, and reveal bindings.
- **Description:** Shows the six most recently added in-stock products from Supabase, with no curation or featured flag involved. Each card displays title, category tag, price tag, quick view trigger, and detail links.
- **Interactive Behavior:**
  - Hovering card displays overlay actions (*Quick View* button).
  - Double-clicking an artwork card automatically adds the item to the cart (desktop).
  - On touch devices, a single tap on the card adds the item to the cart and shows a success toast.

### 6. Shop All Artwork (`shop.html`)

- Reuses the standard navbar/footer, shared styles, the exact `createProductCardHTML()` renderer from `js/product-loader.js`, and `window.refreshDynamicProductBindings()` for Quick View, Add to Cart, wishlist, and search on each rendered page.
- Displays all **in-stock** Supabase products, including non-featured artwork, 12 per page using exact counts and server-side ranges. Category filters are dynamically populated from real category names present in the Supabase catalog, deduplicated case-insensitively, and sorted alphabetically (Hick's Law). When no products have categories yet, only the 'All Artwork' tab is rendered.
- Category changes reset to page 1. Numbered pagination includes Previous/Next boundary states and a truncated page list for large catalogs. Page changes scroll to the product results; filter tabs scroll horizontally on mobile.
- `?category=Hoop%20Art&page=2` links restore the requested view (matching case-insensitively per Postel's / Tesler's Law). Back/forward navigation restores filter/page state, invalid parameters normalize safely, and out-of-range pages resolve to the last available page.
- Shows artwork skeletons during fetching, an empty-category state with a View All Artwork button, and a retryable error state. Stale responses cannot overwrite newer filter choices.
- The homepage's **View All Artwork** and **Explore Full Gallery** links point to `shop.html`. The homepage gallery is a live Supabase showcase of up to 12 newest in-stock products and shares the catalog's dynamic category names.

### Dynamic Product Category Architecture & Admin Management

Product categories are fully dynamic and driven entirely by real category names created by the admin in the database, replacing the previous hardcoded 6-category system.

- **Jakob's Law (Familiar Dropdown Pattern):** In the Admin Dashboard (`admin.html`), the category field uses the familiar "select existing OR add new" dropdown pattern. Existing distinct categories are fetched on load and presented in the select dropdown.
- **Von Restorff Effect (Visual Distinctiveness):** The "+ Add New Category" option is styled prominently at the bottom of the dropdown with `--accent-gold` and bold typography (`.category-add-new-option`) so it never gets lost as the list expands. Selecting it reveals an inline text input and a Cancel control.
- **Postel's Law (Forgiving Input):** When the admin types a category name, whitespace is trimmed and compared case-insensitively against existing categories (`.toLowerCase().trim()`). If a match exists (e.g. typing "hoop art" when "Hoop Art" is already present), the system silently reuses the existing canonical casing, preventing category fragmentation and near-duplicates.
- **Tesler's Law (Automated Complexity):** The system automatically normalizes and standardizes category casing; the admin never needs to memorize exact previous capitalization.
- **Hick's Law (Scannability):** Categories fetched from the catalog are sorted alphabetically so the list remains rapid and effortless to scan as inventory scales.
- **Dynamic Category Filter Tabs (`shop.html`):** On page load, `js/product-loader.js` (`fetchCategories()`) dynamically queries distinct categories from the Supabase `products` table, renders one `.tab-btn` per unique category, and preserves "All Artwork" as the primary tab. Deep-linking (`?category=...`) resolves case-insensitively against dynamic categories.

### 7. Promotional Banners
- **Description:** Dual promotional cards emphasizing bespoke custom orders and latest artisan collections with gold outlined buttons.

### 8. Value Proposition / Features Section
- **Description:** 4-column card grid detailing core business pillars (*100% Handmade, Custom Personalized Designs, Worldwide Express Delivery, Premium Thread & Fabric Materials*).

### 9. Brand Story / Artisan Section (`#about`)
- **Description:** Profile of Syeda Tauseefa Abrar detailing 16 years of expertise, artistic inspiration, and commitment to preserving handmade embroidery traditions.

### 10. Custom Order CTA Banner (`#custom-orders`)
- **Description:** Prominent full-width banner calling users to request personalized embroidery projects (portraits, names, wedding dates). Links open the standalone `custom-order.html` request page.

### 11. Interactive Gallery with Filter Tabs (`#gallery`)
- **Description:** Fully dynamic masonry portfolio grid loaded from the Supabase `products` table, showing up to 12 newest in-stock products with the shared, alphabetically sorted category list.
- **Interactive Behavior:** Category tabs filter the live results by their exact database names. Clicking or keyboard-activating any gallery item opens a dedicated view-only Gallery modal with the product image, description, category, and informational price. The modal links softly to `shop.html` without exposing Add to Cart. Loading skeletons and productive empty states cover slow, empty, and category-specific results.

### 12. Trust Strip & Testimonials (`#testimonials`)
- **Description:** Client feedback cards featuring star ratings, review text, customer names, and trust indicators (*Secure Packaging, Quality Guarantee*).

### 13. Contact Section & Form (`#contact`)
- **Description:** Dual-column layout containing business contact information (Phone, Email, Location, Social Links) and an inquiry form.
- **Interactive Behavior:** Submitting contact form displays instant feedback notice and resets form fields.

### 14. Footer
- **Description:** Dark-themed footer (`--bg-dark`) with brand logo summary, quick navigation links, customer service links, newsletter subscription input, and copyright notice.

### 15. Custom 404 Error Page (`404.html`)
- **Purpose:** Friendly, on-brand fallback for visitors who land on a mistyped or retired URL.
- **Discovery:** Sitting at the **repository root**, `404.html` is picked up automatically by Netlify for any unmatched route — no proxy/config rules required. (During local `python -m http.server` development the built-in server prints its own sparse "File not found" page instead; the branded page is exercised by visiting `/404.html` directly.)
- **Layout & Tone:** Mirrors the site chrome (shared sticky navbar, mobile drawer, full footer) layered over a centred confirmation-style stage carrying a warm, artisanal voice — eyebrow *“404 — Lost Thread,”* headline *“This page seems to have wandered off — like a stray thread.”*, and a gentle explanatory subtitle.
- **Wayfinding (Postel's Law):** Offers two unmistakable escapes — a primary **Return to Homepage** button (`index.html`) and a supporting **Browse the Gallery** outline button (`index.html#gallery`) — so stranded visitors recover in one click.
- **Behaviour:** Inherits all shared scripting (`js/script.js`), so the cart badge, account avatar, mobile drawer, and footer newsletter toast stay fully alive on the error page. Verified responsive with zero horizontal scroll at desktop and mobile widths.

### 16. Custom Order Page (`custom-order.html`)
- **Description:** A dedicated request workflow organized into Contact Information, Order Details, Reference Images, Budget & Timeline, and Submit sections. After session/profile loading, empty name/phone fields use `public.profiles` and email uses the authenticated address. Text entered while loading is preserved. Requests persist in `public.custom_order_requests`.
- **Order details:** Order Type cards reuse `fetchCategories()` from `js/product-loader.js`, the same catalog category helper used by Shop/Admin. Categories are deduplicated case-insensitively and sorted alphabetically. A single permanent `Other` card appears last, including when the catalog has no categories or the shared helper cannot fetch them. Reloading reflects newly added catalog categories. Cards retain the existing grid, radio interaction and gold selected state; submission preserves the shared helper's canonical category name, or exactly `Other`. Dimensions, palette, occasion, budget, timeline, and the specific date field are unchanged.
- **Reference images:** The existing optional drag-and-drop/browse preview uploads files to `custom-order-images` before inserting the request with `reference_image_urls`. Completed uploads are reused during same-page retries for the same authenticated identity.
- **Budget Range:** Optional choices are Under Rs. 2,000, Rs. 2,000 - 5,000, Rs. 5,000 - 10,000, and Rs. 10,000+. Labels and submitted `budget_range` values match exactly; admin details display the stored range unchanged.
- **Behavior:** Server-validated customers submit their Auth UUID; guests submit null `user_id` and their entered `guest_email`. Successful customers return to `profile.html#custom-orders`; guests receive inline confirmation and cannot later query their request. INSERT does not request returned rows, preserving guest INSERT-only RLS. Loading prevents duplicate clicks; upload/insert failures retain all form data and selected files for retry.

### 17. Artwork Quick View Modal (`#quickViewModal`)
- **Description:** Modal displaying enlarged artwork image, category badge, detailed price, and a prominent *Add to Cart* button.
- **Product entry points:** Latest Work and Shop images, titles and dedicated Quick View buttons share the same modal handler. Images/titles support a single desktop click or touch tap, Enter/Space keyboard activation, pointer cursors and visible focus. The separate + control only adds to cart. Dynamic catalog refreshes rebind safely; Gallery retains its independent view-only modal.
- **Delivery estimate:** Quick View, Cart shipping summary and Checkout shipping summary display exactly “Estimated delivery: 5-7 business days within Pakistan”. The checkout line is hidden when country is not Pakistan and restored when Pakistan is selected. **5-7 business days is a placeholder supplied for this change, pending confirmation by the owner; it is not a verified delivery commitment.**

### 18. Shopping Cart Modal Drawer (`#cartModal`)
- **Description:** Slide-over modal displaying current cart items stored in `localStorage`.
- **Access rule:** Guests can add items, view the cart, and adjust quantities without an account. Login/signup is required only when they select Proceed to Checkout.
- **Elements:**
  - Itemized rows with artwork image, title, category, single price, item total.
  - Quantity stepper (`-` / `+`) and item removal (`×`) button.
  - Order summary card displaying Subtotal, Estimated Shipping (*FREE in Pakistan*), and Total.
  - *Proceed to Checkout* button and *Continue Shopping* button.
  - Empty cart state with shopping bag icon and call-to-action to browse collections.

### 19. Multi-Step Checkout Modal (`#checkoutModal`)
- **Description:** Responsive multi-step order placement modal.
- **Access rule:** Checkout is available only to logged-in users. The cart's Proceed to Checkout action opens the existing login/signup modal for guests; after successful authentication, the unchanged cart is carried into `checkout.html`. Direct visits or form submissions from `checkout.html` redirect to the cart login flow.
- **Form Sections:**
  1. **Contact Information:** Full Name, Phone Number, Email Address.
  2. **Delivery Address:** Street Address, City, Postal Code, Country Selector.
  3. **Payment Method:**
     - **Cash on Delivery (COD):** The sole supported payment method. Rendered as a non-interactive informational line in the order summary, applying Hick's Law to eliminate cognitive friction when there is only one choice.
  4. **Read-Only Order Summary Sidebar:** Live itemized recap, shipping status, payment method line, and estimated total price.
- **Validation:** Validates required fields, phone numbers, and email format before processing.
- **Contact/address prefill:** Restores pending checkout data first, then fills empty name/email/phone fields from Supabase profile/Auth state. A single shared query loads the current customer's Supabase addresses and fills empty delivery fields from the default. Address line 2 and province join the existing street field. Typed values, explicitly cleared fields, and restored country values are preserved during slow loading. Country defaults to Pakistan only when no saved/restored/typed country applies. Load failures offer Retry and leave manual entry usable.
- **Saved-address selection:** The audited checkout has no address selector or “Save this address” checkbox; Phase 3 preserves that UI. Change the default under Profile → Saved Addresses before opening checkout, or enter a one-time delivery address directly. Checkout never saves/updates an address implicitly. Cart persistence remains local.
- **Summary initialization:** After Auth readiness and synchronous pending-form restoration, checkout renders `shah_cart` items/totals before revealing the page. This local summary does not wait for an artificial skeleton timer or the independent saved-address fetch; later country changes still refresh shipping labels.
- **Order placement:** Revalidates the customer through `auth.getUser()`, inserts an own-UUID `Processing` order with `SE-XXXXX` number and shipping/contact totals, then inserts every cart item against the returned order ID. `Placing Order...` and a disabled submit prevent duplicate submissions. Only after both steps succeed does it cache the existing receipt shape in `shah_last_order`, clear `shah_cart`, and redirect to the unchanged confirmation page. A failure shows a toast and retains the cart. Same-tab retries use stable request IDs, including after refresh; see the two-request limitation below.

### 20. Order Confirmation Modal (`#confirmationModal`)
- **Description:** Post-checkout modal featuring a green success checkmark badge, generated Order ID (`#SE-XXXXX`), full receipt breakdown card, customer shipping address, payment method instructions, email confirmation notice, and a *Return to Homepage* CTA button.

---

### 21. Customer Profile (`profile.html`)
- Wishlist loads the signed-in UUID's database rows joined to current products, preserving the existing grid, skeleton, empty state and controls. Failed loads offer Retry; removal uses product ID and updates only after successful DELETE. Add to Cart uses the fetched current price/details and leaves the saved wishlist entry intact.
- Shows a neutral loading status/skeleton before protected account content. The shared helper verifies the session, fetches the current UUID's profile, and safely creates a missing row from Auth metadata/email. Legacy account values are never displayed or imported.
- Account Settings loads database name/phone and the Auth email. Failed profile loads show a retry action. Saving validates all settings fields, displays `Saving...` with `aria-busy`, prevents duplicate writes, and retains entries on failure. Success refreshes the cache, header, avatar, and saved values without replacing the form.
- Saved Addresses fetches the signed-in customer's database rows, default first then newest updated, with loading skeletons, retry, and the existing empty state. Add/Edit retains the form/card design and supports an optional label, second address line, province, and default checkbox. Country suggestions accept other country names. Delete uses the site's custom confirmation pattern. All actions show progress and unified feedback; failed edits retain entered values. Sidebar/mobile tabs remain intact; Wishlist now loads current product details from Supabase.
- Custom Order Tracking queries `custom_order_requests` for the verified customer's UUID, newest first, retaining skeletons, empty state, request cards and reference thumbnails. Failures offer Retry. The real status drives the four steps: Inquiry Received, In Progress, Ready for Review, Completed. Reload/reopen the tab to see owner updates.
- Order History queries `orders` with nested `order_items`, filtered by the validated customer's UUID, newest first. Existing cards, thumbnails, expandable details, status badges, and empty state are preserved. The existing skeleton covers loading; failures offer Try Again. Cancel Order updates only the current customer's still-Processing row; stale status changes are rejected and failures leave the confirmation recoverable. No legacy orders are read or automatically imported.

### 22. Password Recovery (`reset-password.html`)

- Standard navbar, mobile drawer, footer, and a centered card using the existing background/radius/shadow tokens. Password fields, strength meter, inline validation, and accessible status messages reuse customer auth styling.
- Starts with a link-checking state, shows the form only for a verified recovery event, and otherwise offers a new-link request. Successful updates show confirmation and a return-to-login action. Admin routes/auth and commerce persistence are unchanged.

## 5. Functionality & Feature List

- [x] **Forgot Password:** Same-modal email reset request, generic confirmation, standalone recovery page, shared password validation/strength meter, error recovery, and return to login. Requires the manual recovery redirect allowlist and working Auth email delivery.

- [x] **Supabase Orders and Admin Management:** Database order/item creation, customer history and cancellation, owner-only order details/status management with 25-row pagination. Confirmation continues using its existing local receipt cache. Requires the supplied table policies and the cancellation supplement below.

- [x] **Persistent Saved Addresses (Phase 3):** Supabase UUID ownership, own-row CRUD/RLS, transactional default handling, first-address default, deletion promotion, profile management, and non-overwriting checkout prefill. Requires the new SQL setup below.

- [x] **Persistent Customer Profiles (Phase 2):** Database-backed account details/settings, missing-profile recovery, cached display state, Auth email/password changes, and non-overwriting checkout/custom-order contact prefill.

- [x] **Supabase Customer Authentication (Phase 1):** Real signup/login, persistent SDK sessions, validated users, own-row profiles, verification feedback, account updates, and checkout continuity. Requires the documented SQL/dashboard setup.

- [x] **Shopping Cart Persistence:** Cart state saved automatically in `localStorage` under `shah_cart`.
- [x] **Dynamic Quantity Steppers:** Increment, decrement, or remove items with automatic subtotal updates.
- [x] **Cart Badge Counter:** Real-time badge counter on navbar with bounce animation on item updates.
- [x] **Inline Expanding Search:** Search input with 250ms debounce, live suggestions dropdown, regex query highlighting, and smooth scroll to target artwork.
- [x] **Search Keyboard Navigation:** Navigate suggestions using `ArrowUp`, `ArrowDown`, select with `Enter`, or dismiss with `Escape`.
- [x] **Quick View Modal:** Inspect artwork details in modal overlay and add directly to cart.
- [x] **Guest Cart Access:** Guests can add items from artwork cards and Quick View, adjust quantities and view the cart without authentication. Wishlist hearts now require login; cart behavior is unchanged.
- [x] **Supabase Wishlist:** Product-ID-based own-customer saves/removals, shared in-memory heart state, current product details in profile, skeletons/retry and failure-safe feedback. Guests see the existing login/signup modal and must click the heart again after signing in; nothing is automatically added.
- [x] **Double-Click Add to Cart:** Quick shortcut to add artwork cards directly to cart (desktop double-click; single tap on touch devices, with success toast).
- [x] **Gallery Category Filtering:** Animated tab filter for portfolio items.
- [x] **Standalone Custom Order Form:** Existing category/budget/timeline choices and reference previews, with Storage uploads and Supabase-backed customer/guest submission, profile tracking and owner status management.
- [x] **Checkout Form Validation:** Real-time client-side validation for required fields, email format, and phone inputs.
- [x] **Cash on Delivery Checkout:** Simplified checkout offering Cash on Delivery exclusively, eliminating unnecessary selector friction.
- [x] **Order Receipt Generation:** Automatic generation of order ID `#SE-XXXXX`, receipt card breakdown, and date stamping in `localStorage` (`shah_last_order`).
- [x] **Scroll Reveal Animations:** `IntersectionObserver`-powered fade-in-up animations for cards and sections.
- [x] **Standalone Cart, Checkout & Confirmation:** Dedicated pages use a local cart, Supabase order persistence, and the existing local confirmation receipt cache.
- [x] **Checkout Authentication:** Only Proceed to Checkout, checkout submission, and direct checkout visits require an active login session; the guest cart remains intact through authentication.
- [x] **Order Cancellation:** Processing orders can be cancelled from expanded Order History details after confirmation; cancelled orders are persisted and no longer show the action.
- [x] **Profile Wishlist Navigation:** Empty wishlist, order, and custom-order states link back to `index.html#gallery` with the label `Browse Collections`.
- [x] **Custom Order Request Page:** The custom-order page validates required contact/order details, supports optional reference image previews, and shares request records with profile tracking.
- [x] **Skeleton Loading States:** Shared warm skeletons cover dynamic/localStorage content and slow-loading images across homepage, cart, checkout, profile, custom-order, and confirmation pages with accessible busy states and reduced-motion support.

---

## 6. Known Limitations / Not Yet Implemented

> [!WARNING]
> **CURRENT FRONT-END SCOPE & GAPS**
> 1. **Partial Database Integration:** Supabase powers the catalog, customer authentication, profiles, saved addresses, orders, order items, and custom requests. Wishlist is now Supabase-backed; cart still requires database migration. Legacy local orders/custom requests are ignored and retained; `shah_last_order` is only a receipt cache. Local tests do not prove live schema, grants or RLS deployment.
> 2. **No Order Email Dispatch:** The receipt notification remains a simulation. Supabase Auth confirmation emails are separate and depend on dashboard/email-provider configuration.
> 3. **Inventory Limits:** Featured products are filtered by Supabase `in_stock`; checkout does not reserve or decrement stock.
> 4. **Custom Request Recovery:** Reference images persist in Storage. Uploads abandoned after a failed insert may require manual cleanup. Same-page retries reuse completed uploads, but a lost response after a committed request can cause a duplicate on retry; this schema has no submission idempotency key. Guest requests are not readable by guests.
> 5. **Social Profiles Point to Handle Slugs:** Footer social icons link to `instagram.com/shah-embroidery`, `facebook.com/shah-embroidery`, and `pinterest.com/shah-embroidery`. Confirm these slugs map to the studio's live profiles (handles assumed from owner-provided slug).
> 6. **Product Loading Fallback:** Featured cards retain their hardcoded content if the Supabase query fails or returns no rows.
> 7. **Currency Display:** Prices now display as PKR (`Rs.`) without exchange-rate conversion. Historical order records retain the currency-formatted string stored when each order was created.
> 8. **Two-request order creation:** The requested header-then-items API flow is not an atomic database transaction. An item failure can leave an unfinished Processing header. A tab-local `sessionStorage` retry journal reuses order/item UUIDs after failures, lost responses, and refreshes. Changed cart/contact details require retrying the original details or cancelling that unfinished order first. Closing the tab can discard this journal; unfinished headers then need review. Admin details warn against fulfilling rows without items. A transactional server-side order RPC is future work.
> 9. **Order validation and payment:** Ownership is enforced by RLS, but the supplied insert policies accept customer-provided prices, totals, and item snapshots. They do not prove catalog pricing, payment, or stock availability. Treat totals as unverified until server-side pricing/inventory/payment validation is implemented.
> 10. **Password recovery deployment:** Add the production/local `reset-password.html` URLs to Supabase's redirect allowlist and deploy the page before sending reset emails. Email delivery, provider limits, and expiry depend on Auth configuration. Local mocked tests do not establish actual delivery or successful login with a changed live password.

---

## 7. User Accounts, Login / Signup & Profile System

### Supabase Customer Auth Flow
- **Identity:** `js/auth.js` is the single customer auth source. It uses `getSession()` followed by server-validated `getUser()`, with one `onAuthStateChange()` listener. Protected access waits for validation; session loss removes access. SDK persistence restores sessions on refresh/reopen; visibility and restored-history events revalidate them. Network validation failures fail closed.
- **Signup:** The existing fields, modal design, and validation remain. Names/emails are trimmed, emails lowercased, and passwords sent unchanged exclusively to Auth. Buttons show loading and prevent repeated submissions. Friendly inline live-region messages cover credentials, network errors, verification, and service failures. Duplicate-email responses remain generic.
- **Email confirmation:** Confirm Email is currently disabled, as reported by the project owner; Phase 2 does not change it. Signup can return an immediate session. The confirmation-enabled path remains supported: signup without a session shows an inbox/verification message and retains checkout intent, granting no avatar or protected access. `js/auth.js` explicitly sets `options.emailRedirectTo` to `${window.location.origin}/` for HTTP(S) pages, so production signups return to the production homepage and local signups return to that local origin. Supabase processes the confirmation URL normally; the existing `getSession()`/`getUser()` initialization and single auth listener refresh the navbar. Confirmed users stay on the homepage unless a saved checkout intent resumes `checkout.html`; the intent is consumed once, and cart/shipping data remain intact. An already authenticated visitor does not reopen login/signup because of an old `?login=1` or `#login`. Immediate-session signup remains supported if confirmation is disabled by configuration, but disabling verification is not a redirect fix. Existing demo accounts must register again; old hashes are never imported.
- **Profiles:** After the first validated session, fetch the caller's `public.profiles` row and insert missing details using own-row RLS. Signup metadata carries the name until then. No `auth.users` signup trigger is installed: a profile outage cannot roll back registration. Profile failures show a refresh/retry notice; validated identity stays usable and missing profiles are retried on subsequent validation. Confirmation-enabled signup creates the profile only once verification establishes a session.
- **Navigation:** The existing guest icon, first-letter avatar, and default profile destination remain. Checkout intent takes priority and returns to `checkout.html` with unchanged cart and saved shipping fields. Closing the modal no longer erases pending checkout data. Redirect destinations are fixed local pages.
- **Logout:** Uses `supabase.auth.signOut()` and preserves all local commerce data. Customer and admin pages share the existing SDK session, so signing out also ends that shared login. Admin privileges still require owner UUID validation and RLS.
- **Legacy storage:** Application code neither reads nor writes `shah_users` or `shah_current_user` for identity. Existing keys remain inert and may be manually removed without removing commerce data. Application code no longer hashes or stores passwords.

#### Forgot Password

The customer login modal includes **Forgot password?** directly below the password field. It switches the same modal to a single-email request form with **Send Reset Link** and **Back to Login**, preserving checkout intent and cart data. Email is trimmed/lowercased and validated with the shared rules. The shared helper calls `auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password.html' })`. Pending requests disable the submit button and show `Sending...`; service/network failures permit retry. Every successful request shows exactly: “If an account exists for this email, a password reset link has been sent. Please check your inbox.”

The existing single Auth listener captures `PASSWORD_RECOVERY` on the reset page; its in-memory recovery identity must match a server-validated `getUser()` result before the form becomes usable. A normal login session or a URL fragment alone does not unlock this UI. Direct visits, expired links, and session changes show an invalid/expired state with a homepage link that opens the reset-request view (`index.html?reset=1`). Recovery state is not stored by the application: refreshing after the SDK consumes a link requires requesting a fresh link. Supabase remains the authority for password updates; this page gate is not a replacement for Auth security.

New passwords use the same 8-character/uppercase/lowercase/number rules, live strength meter, and matching confirmation as signup/settings. Submit revalidates identity and calls `auth.updateUser({ password })`; no old password is needed and no password/hash is written to profiles or browser storage. Failures retain the user's typed fields in the current form without programmatically refilling them. Success clears them and shows “Your password has been reset successfully.” **Return to Homepage & Log In** signs out the current browser session (`scope: local`) and opens the existing login modal. A sign-out failure is distinguished from a failed password update and can be retried. Cart and pending checkout fields remain intact.

**Required manual configuration:** Supabase Dashboard → **Authentication → URL Configuration → Redirect URLs**:

- Add `https://shah-embroidery-and-art.netlify.app/reset-password.html`.
- For the documented local server, add `http://127.0.0.1:4173/reset-password.html`. If using another hostname/port, add that actual origin plus `/reset-password.html`; localhost and 127.0.0.1 are distinct origins.
- Deploy `reset-password.html` and keep the development server running for local links. Leave existing signup-confirmation settings unchanged. In **Email Templates → Reset Password**, retain a verification link based on `{{ .ConfirmationURL }}`; a plain SiteURL/RedirectTo link does not verify a recovery token. Auth email delivery must be configured. No dashboard settings or email templates were changed by this task. See [Supabase password recovery](https://supabase.com/docs/guides/auth/passwords).

After setup, request a fresh link for a test account you control, verify its inbox delivery, follow it to the reset form, change the password, return to login, and verify the new password works. Also test expired links and a direct visit in a fresh browser session. These live email/password steps require account/inbox access; the isolated browser suite tests SDK contracts and UI states without sending emails.

### Profile Page Structure
- **Source of truth and caching:** `public.profiles` owns full_name, phone, and profile timestamps. Email is authoritative in Auth and mirrored to the row; passwords never enter the profile table. `js/auth.js` holds one in-memory profile, returns copies to consumers, and reuses it for up to 60 seconds during routine identity checks. Reload, explicit retry, restored browser history, and Auth user updates refresh the row. A failed fetch clears display data and uses the Auth email initial, never legacy storage or stale metadata for the navbar.
- **Five sections:** Order History, Custom Order Tracking, Wishlist, Saved Addresses, and Account Settings.
- **Saved Addresses:** `public.addresses.user_id` references the authenticated UUID independently of email/profile changes. `js/address-service.js` centralizes queries and saves, keeps only a per-page memory cache, refreshes when the tab opens, and replaces the list from each successful transaction. Session changes discard the cache and reject stale responses. It uses the existing customer-auth event, with no additional SDK auth listener. Legacy `shah_saved_addresses` is neither read, written, imported, nor deleted.
- **Section switching:** All tabs are JavaScript-driven and keep a single active section visible without page reloads.
- **Responsive pattern:** On desktop the page uses a left sidebar; below `768px` the tabs become a scrollable horizontal row.
- **Account management:** The shared `updateProfile()` derives ownership from the validated session, updates only full_name/phone on that row, and refreshes the cache/header/avatar immediately. There is no second profile write to Auth metadata. All settings fields, including optional phone and password controls, validate before saving. Failure retains form entries; success clears password inputs and preserves the form/focus.
- **Email changes:** Uses `auth.updateUser({ email })`, then revalidates Auth and synchronizes the row's email. Immediate changes show success; pending changes retain the active email and explicitly ask the customer to check their inbox. Signup Confirm Email being disabled does not imply email changes never require confirmation.
- **Password changes:** Keeps the existing 8-character/uppercase/lowercase/number rule and verifies the current password with `signInWithPassword()` before `auth.updateUser({ password })`. Supabase handles credentials exclusively; no client hash/storage or profile password columns exist. If the project requires additional reauthentication and rejects the request, the customer is asked to sign in again and retry; no OTP-entry UI is added in this phase.
- **Partial saves:** Name/phone and Auth changes are separate requests. If Auth rejects the later email/password change, saved profile details stay saved, entered values remain available, and actionable feedback explains the failure. Retrying does not create another profile.
- **Order cancellation:** Orders with `Processing` status expose the existing `Cancel Order` modal with `Go Back` and `Confirm Cancellation`. Confirmation updates Supabase using order UUID, authenticated user UUID, and `status = Processing`. Success changes the cached card to `Cancelled`, hides the action, and shows the existing toast. The SQL supplement limits customers to that transition and prevents editing other order columns. Owner status changes use separate authorization.

### Standalone Commerce Pages
- **Cart:** `cart.html` renders the shared `shah_cart` items, quantity controls, totals, and empty state for guests and logged-in users. Its Proceed to Checkout action requires login before opening `checkout.html`.
- **Checkout:** `checkout.html` requires an active login session before rendering the checkout flow. Guests are redirected to `cart.html`, where the existing login/signup modal opens; successful authentication returns them to checkout with the same `shah_cart` contents.
- **Confirmation:** `order-confirmation.html` renders the latest `shah_last_order`; placing an order clears `shah_cart` before redirecting there. Orders remain associated with the authenticated customer session.

## Form Validation

All forms validate fields on blur first, then validate on each keystroke after an error is shown. Invalid fields receive a red border and specific inline guidance; corrected fields receive a muted green valid state. Submit buttons remain muted until required fields are valid, and submit attempts recheck every field and focus the first invalid field.

- **Names:** Required where used, at least 2 characters, and limited to letters, spaces, hyphens, and apostrophes.
- **Email:** Required where used and checked against a complete `name@domain.tld` pattern; values are trimmed and compared case-insensitively. Signup delegates registration checks to Auth and uses generic responses instead of exposing account existence.
- **Passwords:** Signup and password changes require at least 8 characters, one uppercase letter, one lowercase letter, and one number. Live Weak/Medium/Strong strength meters and exact confirmation matching are provided.
- **Phone:** Accepts common spaces, dashes, parentheses, and a leading plus sign, with 10 to 15 underlying digits.
- **Addresses:** Street addresses require at least 5 characters and cities at least 2. Names and 10–15 digit formatted phone numbers retain the existing rules. Label is optional (40 characters maximum); address lines allow common punctuation. Country is required and accepts international names. Pakistan requires a 5-digit postal code; elsewhere postal codes may contain letters/numbers/spaces/hyphens (up to 20 characters), or be omitted for countries without postal codes. The same postal rules apply at checkout.
- **Order and contact text:** Custom order descriptions and contact messages require 10 to 500 characters and show live counters.
- **Newsletter:** Requires a valid email address with the same inline feedback and disabled-submit behavior.

### Stored Data Notes
- **Profile persistence:** Full name and phone are never cached in application localStorage; the database row and per-page in-memory cache supply them. Auth metadata is used only to seed a missing row. The existing email-bucket compatibility map remains solely for the unmigrated local datasets.
- **Supabase:** Auth owns credentials/sessions; `public.profiles.id` references `auth.users.id`, the canonical customer UUID. Profile values are escaped/text-rendered. The SDK may persist its own tokens in browser storage; these are unrelated to the removed mock session.
- **Legacy compatibility:** No customer feature reads or writes the former email-bucket mapping `shah_customer_data_keys`. Legacy wishlist/map keys are left untouched, ignored and not automatically imported.
- **Cart:** `shah_cart` remains guest-accessible and unchanged by authentication.
- **Orders:** Supabase `orders.user_id` references Auth UUID; `order_items.order_id` references the order. Order History never trusts `shah_orders` or `shah_last_order`. The latter caches only the most recent successfully saved receipt for confirmation. `sessionStorage` temporarily holds stable IDs and the checkout snapshot for retry; it contains no credentials and is cleared after successful checkout.
- **Custom requests:** Supabase `public.custom_order_requests` is the sole source of truth, keyed by Auth UUID for customers or null `user_id` plus `guest_email` for guests. Legacy `shah_custom_order_requests` is ignored, retained, and never automatically imported.
- **Wishlist:** `public.wishlist_items` stores Auth UUID `user_id` and bigint `product_id`, with unique `(user_id, product_id)` and product/Auth deletion cascades. `shah_wishlist` is no longer read or written by application code. Profile joins current product title/category/price/image; Add to Cart uses that current snapshot. Cart remains in `shah_cart`.
- **Saved addresses:** Supabase `public.addresses` is the sole source of truth, owned by `auth.users.id` through `user_id`. Existing `shah_saved_addresses` contents remain inert; no automatic import of browser/mock data occurs. Customers can deliberately re-enter addresses using the validated form.

---

## 8. Responsive Behavior Notes

### Breakpoints

- **`1024px` (Desktops / Laptops):** Full layout with multi-column grids (4 columns for features, 3 columns for artwork, dual-column hero).
- **`768px` (Tablets / Mobile):**
  - Main desktop navigation links hidden; mobile hamburger menu and drawer enabled.
  - Multi-column grids stack into single or dual columns.
  - Cart modal and checkout modal scale to `95%` viewport width with scrollable content containers.
- **`480px` (Mobile Phones):**
  - Section paddings scaled down via `clamp()`.
  - Cart items re-orient vertically for optimal mobile readability.
  - Checkout form inputs adjust to 100% full width stack.

---

## 9. SEO & Metadata

### Page Titles

| Page | `<title>` tag |
| :--- | :--- |
| `index.html` | Shah Embroidery & Art \| Handmade Embroidery & Custom Textile Art |
| `cart.html` | Your Cart \| Shah Embroidery & Art |
| `checkout.html` | Checkout \| Shah Embroidery & Art |
| `order-confirmation.html` | Order Confirmed \| Shah Embroidery & Art |
| `profile.html` | My Account \| Shah Embroidery & Art |
| `custom-order.html` | Request a Custom Order \| Shah Embroidery & Art |

### Meta Descriptions

Each page carries a unique `<meta name="description">` written for both users and search engines. Descriptions are kept under 160 characters and are page-specific (not duplicated from other pages).

### Favicon

All favicon assets are generated from `Images/Logo.png` (699×699 px) using the System.Drawing API and stored under `Images/favicon/`. Each HTML page links the following assets in `<head>`:

```html
<!-- Favicon -->
<link rel="icon" type="image/png" sizes="32x32" href="Images/favicon/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="Images/favicon/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="Images/favicon/apple-touch-icon.png">
```

> [!NOTE]
> `Images/favicon/favicon-192x192.png` is also generated for future PWA manifest use, but is not yet referenced in any `<link>` tag — add it to `manifest.json` when a PWA manifest is created.

---

## 10. Planned / Future Work

1. **Payment Gateway Integration:**
   - Integrate local Pakistani payment gateways (JazzCash, Easypaisa, PayFast) and international credit card processors (Stripe / PayPal API).
2. **Customer Backend Migration:**
   - Customer Auth, profiles, saved addresses, orders, order items, and custom requests are implemented with Supabase. Wishlist persistence is complete; cart persistence and transactional checkout remain future work.
   - Add transactional order submission with server-side pricing/cart/inventory verification, reference uploads, and payment webhooks.
3. **Admin Dashboard Extensions:**
   - Product, order/status, and custom request management are implemented in the unlisted Supabase admin pages. Future work: tracking details and fulfillment notifications.
4. **Transactional Email Service:**
   - Integrate PHPMailer / SendGrid API to automatically send order confirmation receipts and tracking links to customer emails.
5. **WhatsApp One-Click Order Direct Link:**
   - Add a button allowing customers to send pre-formatted order details directly to Shah Embroidery's official WhatsApp number.

---

## Database (Supabase)

### Wishlist schema and verification

The owner's existing `public.wishlist_items` schema is reused: UUID primary key `id`, required UUID `user_id` referencing `auth.users(id) ON DELETE CASCADE`, required bigint `product_id` referencing `products(id) ON DELETE CASCADE`, `created_at TIMESTAMPTZ DEFAULT now()`, and unique `(user_id, product_id)`. Its `customer_wishlist_select`, `customer_wishlist_insert`, and `customer_wishlist_delete` policies grant authenticated own-row operations using `auth.uid() = user_id`. There is no guest or admin-wide access policy. No new migration or policy changes are required if the supplied schema/policies and authenticated SELECT/INSERT/DELETE grants are already applied.

`js/script.js` coalesces product-ID list reads per authenticated page session and shares state across dynamic card rebinding. Mutations verify the actual Auth user, serialize duplicate clicks per product, accept unique-conflict adds as already saved, and update hearts only after success. Changing account resets the in-memory cache; old responses cannot populate another account's state. Profile uses `product_id, products(*)` and real product IDs for remove/Add to Cart. Missing joined products are skipped defensively; product deletion cascades remove the underlying wishlist rows. Legacy static cards without real product IDs cannot be persisted and show a browse-Shop message.

Verification: `tests/wishlist-browser.cjs` uses mocked SDK responses for guest gating/no automatic add, one shared ID query, reload/cross-page state, current-price cart addition, removal, duplicate conflicts, failure retention, two accounts and query retry. `tests/wishlist-sql.cjs` executes the supplied schema/policies in local PGlite, including both users' rows cascading after product deletion. Live RLS, grants and cascade deployment remain unverified: check them in the configured project's Database → Policies/Table Editor and repeat with two real customer sessions. Neither test modifies the remote database.

The `products` table powers the Latest Work section on `index.html`. `js/product-loader.js` fetches up to six rows with `in_stock=true`, newest first. The legacy `is_featured` column remains in Supabase for compatibility but is not used by the homepage, shop, or admin UI.

The project URL and public anon key in `js/supabase-client.js` are intentionally browser-visible. Never commit service-role keys, passwords, or privileged credentials.

### Custom order requests: existing schema and verification

**2026-09-17 live upload diagnosis:** The configured project's upload endpoint for `custom-order-images` returned HTTP 400 with `{"statusCode":"404","error":"Bucket not found","message":"Bucket not found","code":"NoSuchBucket"}`. Guest database inserts without images returned HTTP 201, both with `specific_date: null` and with a valid date. The confirmed failure is Storage bucket provisioning, before INSERT; no insert-column, date or guest RLS error was observed. Authenticated submissions remain unverified. Two diagnostic guest requests use `diagnostic@example.com` and descriptions marked “do not fulfill.”

**Required manual repair:** In the Supabase project configured in `js/supabase-client.js`, run `supabase/custom-order-storage.sql` in SQL Editor. It creates the missing public `custom-order-images` bucket used by existing reference URLs, adds INSERT policies limited to guest `guests/` paths or the authenticated user's UUID folder, and leaves product/table policies unchanged. Public reference URLs are readable by anyone who has the URL, matching the current rendering design. The script preserves an existing bucket and refuses to change a private bucket's visibility implicitly. It is safe to rerun and has **not been applied remotely**. See [Supabase bucket setup](https://supabase.com/docs/guides/storage/quickstart) and [Storage access policies](https://supabase.com/docs/guides/storage/security/access-control).

Temporary diagnostics in `js/custom-order.js` log the full returned INSERT error as `Custom order insert failed:` and name/code/status/message for session or upload failures with their stage. They do not log the submitted payload, session or tokens. Remove these temporary logs after the affected browser and live customer/guest image/date paths are verified. Do not infer a database error from the generic toast alone.

The owner's existing `public.custom_order_requests` table is reused without schema or policy changes. It stores UUID `id`, nullable Auth `user_id`, guest_email, full_name, email, phone, order_type, dimensions, color_palette, occasion, description, budget_range, timeline, nullable date specific_date, text-array reference_image_urls, status, created_at and updated_at. The owner panel advances updated_at when saving a status.

The supplied RLS policies allow authenticated customer SELECT/INSERT only where `auth.uid() = user_id`, anonymous INSERT only with null user_id, and owner SELECT/UPDATE across all rows using the UUID in `js/admin-config.js`. Guests have no SELECT and customers have no UPDATE policy. Client checks supplement these database policies; they do not replace them. **No new SQL file or remote configuration change is required if the supplied table, policies and table grants are already deployed.** Verify RLS and these five policies in Database → Policies, and verify anon INSERT and authenticated SELECT/INSERT/UPDATE grants as appropriate; grants alone do not bypass RLS. Existing `custom-order-images` upload/public-read configuration is reused unchanged.

`tests/custom-orders-browser.cjs` covers guest/customer inserts, upload-before-insert, retained data on failures, upload reuse, repeated-click protection, two customer histories, retries, reference URL safety, owner details/status/pagination and profile widths 1440/1024/900/768/480/393/360px. `tests/custom-orders-sql.cjs` runs the supplied schema/policy fixture in local PostgreSQL (the same temporary PGlite dependency described below), checking guest INSERT without RETURNING, anonymous read denial, two-customer isolation, denied customer updates and owner access/status changes. Both passed on 2026-09-17, as did unchanged admin product regressions and the order browser suite. These tests mock browser SDK responses or use local SQL; they do not verify the deployed database or actual Storage delivery.

Live verification remains required: submit identifiable requests with images as customer A, customer B and a guest; inspect stored URLs and guest ownership fields, reload each customer history, verify cross-customer reads/updates are denied, then open all three as the owner and change a status. Reload the affected customer's history to verify persistence. No signed-in live browser was available for these checks.

### Customer profile setup details

Phase 2 uses the existing schema unchanged: `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`, `full_name TEXT`, `email TEXT`, `phone TEXT`, `created_at TIMESTAMPTZ DEFAULT now()`, and `updated_at TIMESTAMPTZ DEFAULT now()`. There are no password columns. **No new SQL migration is required if Phase 1 setup is already applied.** The existing `supabase/customer-auth.sql` is safe to rerun for this schema: it preserves rows and replaces its named policies/function/trigger.

### Orders: existing schema and cancellation setup

The owner supplied the already-created `public.orders` and `public.order_items` schema and policies. This migration reuses them without recreating tables. Orders contain UUID `id`/`user_id`, unique `order_number`, status/payment method, numeric subtotal/shipping_cost/total, shipping_name/phone/email/address/city/postal/country, and timestamps. Items contain UUID `id`/`order_id`, nullable bigint `product_id`, title/category, numeric price, is_custom_quote, quantity, image_url, and created_at. `orders.user_id` references Auth; `order_items.order_id` references orders; deleting a catalog product sets the item's product reference to null while retaining its snapshot.

The supplied customer SELECT/INSERT policies enforce `auth.uid() = orders.user_id`; item access requires an owned parent. Owner SELECT policies expose all orders/items, and the existing owner UPDATE policy uses the UUID in `js/admin-config.js`. Customer authentication alone grants no admin access. The original policies **do not permit customer cancellation**.

**Manual step:** in the Supabase project configured in `js/supabase-client.js`, open **SQL Editor → New query** and run **`supabase/order-cancellation.sql`** after the supplied tables/policies exist. It is safe to rerun against that schema and preserves rows. It enables RLS, grants the required authenticated table operations, adds `customer_orders_cancel`, and adds `guard_order_update` to restrict non-owner customer updates to their own Processing → Cancelled transition without changing other order data. The trigger maintains updated_at; trusted SQL Editor/server roles retain maintenance access. Existing owner, product, profile, address, and storage policies are not replaced. No Auth settings changes are required. **The file has not been applied remotely by this task.**

UPDATE needs both row visibility and a valid update policy; the trigger additionally limits changed columns because row policies alone do not do so. References: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [PostgreSQL policy checks](https://www.postgresql.org/docs/17/sql-createpolicy.html).

After deployment, verify the two tables have RLS enabled and the original customer/owner policies plus `customer_orders_cancel` are present. Use two actual non-owner test sessions, not the privileged SQL Editor, to place separate test orders. Check matching header/item IDs and totals, reload each customer's history, verify A cannot select/update B's order or insert B's items, and cancel A's Processing order. Verify anonymous access is denied. Then sign in as the owner: both orders should appear; open their details, change a status, and reload to confirm persistence. Keep tests identifiable and do not fulfill them. Test a failed item request/retry, unchanged guest cart through login, and the existing product add/edit/logout flow.

Local checks: `node tests/orders-browser.cjs` exercises the UI with mocked SDK responses, including two customers, owner management, retry recovery, receipt compatibility, and layouts. `node tests/orders-sql.cjs` executes the supplied schema/policy fixture and the actual supplement twice in local PostgreSQL using the existing temporary PGlite dependency. These tests do not establish live deployment. The read-only live API schema request returned HTTP 401; schema mapping therefore uses the owner's supplied SQL. Signed-in browser access is still unavailable, so real order/customer/owner verification remains pending.

### Saved addresses: Phase 3 schema, integrity, and setup

`supabase/customer-addresses.sql` adds `public.addresses` with `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`, `label`, `full_name`, `phone`, `address_line_1`, `address_line_2`, `city`, `state_province`, `postal_code`, `country`, `is_default BOOLEAN NOT NULL DEFAULT false`, and `created_at`/`updated_at` timestamps. Address ownership references Auth directly, so missing/recovered profile rows and email changes do not change ownership. No passwords or credentials are stored here.

RLS permits authenticated SELECT/INSERT/UPDATE/DELETE only where `auth.uid() = user_id`, with both USING and WITH CHECK on updates. A restrictive owner guard also constrains any pre-existing permissive policy; anon has no table privileges. A trigger prevents changes to address ID/owner and maintains timestamps. These policies are isolated from profiles, products, and admin access. See [Supabase's RLS model](https://supabase.com/docs/guides/database/postgres/row-level-security).

The shared service invokes `customer_address_mutate(action, address_id, details)` for every save, default change, and delete. It accepts no customer ID: the function derives ownership from `auth.uid()`, runs as SECURITY INVOKER under RLS, and rejects foreign/missing address IDs. A per-customer transaction advisory lock serializes these operations, including simultaneous first inserts. A partial unique index on `user_id WHERE is_default` independently enforces **at most one default**, including direct table requests. First saved addresses become default; deleting/unchecking the default promotes the most recently updated other address (UUID breaks ties), or retains the sole remaining address. Zero addresses need no default. Failed writes roll back all changes. Direct table CRUD remains owner-restricted, but callers should use the RPC to obtain automatic first/default promotion behavior. See [PostgreSQL transaction advisory locks](https://www.postgresql.org/docs/17/explicit-locking.html).

The RPC returns the refreshed list in the same request, ordered by default first, `updated_at DESC`, then ID. The frontend discards stale reads after saves/session changes and coalesces simultaneous reads. It performs no automatic legacy import. The form's owner marker only detects a changed UI session; it is never database authorization. Address text is escaped or assigned through form values/textContent.

**Manual deployment required:**

1. Open the Supabase Dashboard project configured in `js/supabase-client.js` → **SQL Editor → New query**.
2. Paste and run **`supabase/customer-addresses.sql`**. It is safe to rerun against its expected schema and preserves existing rows. It creates the table, indexes, five named policies, timestamp trigger, and authenticated-only mutation RPC. It does not alter Auth settings, profile/product/admin policies, or storage buckets. **This task has not applied it to the remote database.**
3. Verify `public.addresses` exists and RLS is enabled. In Database → Policies, inspect `customer_address_select`, `customer_address_insert`, `customer_address_update`, `customer_address_delete`, and `customer_address_owner_guard`. Inspect `addresses_one_default` and the RPC's authenticated-only EXECUTE grant.
4. Deploy the frontend files. Using a test customer, add the first address, reload, edit, add a second, switch defaults, and delete the default. Verify the same Auth UUID owns each row, exactly one default remains when appropriate, and checkout prefills without replacing typed fields.
5. Using two non-owner test sessions, query/update/delete B's address with A's JWT: SELECT/UPDATE/DELETE must return no rows; foreign inserts, ownership changes, and RPC requests must fail. Anonymous requests must be denied. Use actual customer sessions rather than the SQL Editor's privileged role to verify deployed RLS.
6. Check owner admin login/dashboard/product management and non-owner denial. Keep Confirm Email disabled as currently configured; no Auth configuration changes are required for addresses.

Pre-edit dependency audit:

| Consumer | Existing behavior found | Phase 3 replacement |
| --- | --- | --- |
| `js/script.js` storage helpers | `shah_saved_addresses`, keyed through email compatibility map | Shared UUID-scoped service, no legacy reads/writes |
| Profile Saved Addresses | Synchronous local cards and array-index edit/delete/default actions | Async skeleton/retry/cards, stable address IDs, RPC saves and confirmation-protected deletion |
| `profile.html` address modal | Name/street/city/postal/country/phone, limited country dropdown | Same form styling, optional label/line 2/province, country suggestions accepting any country, default checkbox |
| Validation and `css/profile.css` | Pakistan/global numeric-only postal rules, card actions and modal | International postal validation, scrollable dynamic-height modal, focus handling and 44px+ actions |
| Checkout init/modal helper | Local default prefill; no selector or save-address control | Shared address query, default prefill only into untouched empty fields; manual entry retained |
| Auth/profile/custom-order/admin | No other saved-address consumer found | Existing Auth listener, profile data, custom requests, and admin authorization retained |

Run `node tests/customer-addresses-browser.cjs` for mocked SDK/UI regressions and `node tests/customer-addresses-sql.cjs` for the actual SQL/RPC/RLS in local PostgreSQL. The SQL suite reuses the temporary PGlite test dependency described below; it does not connect to Supabase. Real deployed policies, multiple simultaneous live browser sessions, and physical mobile keyboards require manual verification.

### Existing profile/Auth setup (Phases 1–2)

Profile creation has one owner: the shared frontend helper after session validation. A missing row is seeded only with that authenticated UUID and safe Auth metadata/email, using an insert-only upsert (`ignoreDuplicates`) and a reread. No `auth.users` creation trigger is installed. The existing profile-table trigger is solely for timestamps and Auth-email mirroring, not a second creation mechanism. Every profile operation is protected by own-row SELECT/INSERT/UPDATE policies plus a restrictive `auth.uid() = id` guard. Admin/product policies are unchanged.

1. In the project's **Supabase SQL Editor**, run `supabase/customer-auth.sql`. Creating this file does not apply it remotely. It creates `public.profiles` (UUID FK to Auth, full_name, email, phone, created_at, updated_at), enables RLS, grants authenticated SELECT/INSERT/UPDATE, and installs own-row policies plus a restrictive own-row guard. Anonymous access and customer DELETE are not granted. A profile-table trigger maintains timestamps and copies email from Auth; it does not run during signup or change product/admin policies.
2. Verify the existing `supabase/admin-security.sql` owner-only guards and `supabase/admin-storage-cleanup.sql` permissions are already applied. The original admin-security script is not idempotent: inspect existing policies before rerunning it. Verify a normal customer cannot write products or upload/delete product images before enabling public signup.
3. In **Authentication**, enable email/password and **Allow new users to sign up**. Keep anonymous sign-ins disabled. **Confirm email** is currently disabled per the owner; preserve that configuration. Both modes remain supported, and email-address changes may still require their own confirmation. Configure Auth email delivery/SMTP for customer use and retain secure email-change confirmation.
4. In **Authentication → URL Configuration**, set **Site URL** to `https://shah-embroidery-and-art.netlify.app/`. In **Redirect URLs**, include the exact root `https://shah-embroidery-and-art.netlify.app/` and the requested site pattern `https://shah-embroidery-and-art.netlify.app/**`. For the repository's documented live-test server, include `http://127.0.0.1:4173/` and `http://127.0.0.1:4173/**`. `tests/admin-live.cjs` explicitly uses this origin; there is no package dev command, `.vscode` Live Server port setting, or Supabase local config fixing another port. Automated browser tests use ephemeral ports with mocked Auth. If you run a different local server, copy its actual address-bar origin and add `<origin>/` and `<origin>/**`; `localhost` and `127.0.0.1` are different origins, so add `http://localhost:4173/**` only if you actually use that hostname/port. Do not assume port 5500. Serve the repository root over HTTP(S), and keep the local server running when following local confirmation links. A link opened on another device cannot transfer browser-local carts.
5. After setup, use two real non-owner test accounts to verify each can SELECT/INSERT/UPDATE only its own profile. With A's JWT, querying B's ID must return no rows, updating B must change no rows, and inserting B must fail. Anonymous reads must return no records. Verify real confirmation links, refresh/reopen, email/password changes, and logout, plus owner login/add/edit/logout and non-owner denial. Remove only your test fixtures afterward.

### Confirmation email template and localhost redirect diagnosis

The previous code already passed `emailRedirectTo`, but constructed a page-specific profile/checkout URL in the UI. The previous setup instructions also named the old `shah-embroidery.netlify.app` hostname. Neither hardcoded localhost. A missing/mismatched redirect allowlist or a localhost Site URL fallback can still override the requested destination; a custom template can also force Site URL. The live dashboard/template was not inspected or modified, so the precise remote cause is unverified. See [Supabase redirect troubleshooting](https://supabase.com/docs/guides/troubleshooting/why-am-i-being-redirected-to-the-wrong-url-when-using-auth-redirectto-option-_vqIeO).

In **Authentication → Email Templates → Confirm signup** (or the dashboard's Emails/Templates screen), use this actual confirmation link:

```html
<a href="{{ .ConfirmationURL }}">Confirm Email</a>
```

`ConfirmationURL` performs verification and includes the requested redirect. If your custom verification link hardcodes `redirect_to={{ .SiteURL }}`, restore the link above; a custom verification URL must preserve the token/type and use `{{ .RedirectTo }}` for its redirect destination. Do not link the confirmation button directly to `{{ .SiteURL }}` or just `{{ .RedirectTo }}`: this static site has no custom OTP verification endpoint, and those bare destinations do not verify the email. The current remote template is unknown; this is the exact manual adjustment if that override is present. See [Supabase email-template variables](https://supabase.com/docs/guides/auth/auth-email-templates).

After deploying these files and saving URL/template settings, request a fresh confirmation email from the production site using an account you control. Verify the actual email button, production landing, logged-in navbar, refresh, logout, and unchanged guest cart. Previously issued links can retain old destinations or be expired/used. Repeat locally with the server running. Real email delivery/clicks and live dashboard configuration cannot be proven by mocked browser tests.

### Customer authentication verification

Phase 2 dependency map (audited before implementation):

| Consumer | Identity/profile source and behavior |
| --- | --- |
| `js/auth.js` | Validated Auth UUID/email; one cached database profile; centralized creation/read/update and error mapping |
| Navbar and account header | Cached full_name; Auth email initial if unavailable; safe text rendering |
| Account Settings in `js/script.js` | Database name/phone; Auth email/password APIs; retries and unified toast |
| Checkout | Restored current checkout values, empty-field profile contact prefill, then Supabase default-address fields (Phase 3) |
| `js/custom-order.js` | Shared empty-field contact prefill; validated identity, Storage uploads then database insert |
| Orders | Shared database service; UUID ownership and nested order items; local confirmation cache only |
| Wishlist | Supabase wishlist_items by Auth UUID, with current joined product details |
| Custom requests | Supabase UUID-owned history and real status; guests INSERT only; owner sees all |
| Saved addresses (Phase 3) | Shared database service keyed by authenticated UUID; no email-bucket storage |
| Admin | Existing independent owner validation and RLS; no customer role grants |

Run `node tests/customer-profiles-browser.cjs` for profile/settings/prefill/responsive regressions with mocked SDK responses. For database enforcement, install test-only `@electric-sql/pglite` into a temporary directory and run `node tests/customer-profiles-sql.cjs`; set `PGLITE_MODULE` to that installed package path if needed. The default path is the OS temp directory's `shah-profile-sql-tests/node_modules/@electric-sql/pglite`. This is a test dependency, not an application dependency. The test runs the repository SQL twice in local PostgreSQL with minimal Auth roles/UUID context, checks data preservation, and exercises own-row access, foreign-row/ID denial, anonymous denial, and email/timestamp behavior. It does not contact the live project.

For live verification, use the SQL Editor of the **same Supabase project configured in `js/supabase-client.js`**, and run the existing setup file only if needed. Inspect Database → Policies for RLS enabled and the four `customer_profile_*` policies. Register/sign in as a test customer and verify a single row with the matching Auth UUID appears; reload and edit name/phone to verify persistence. With two real non-owner sessions, verify cross-customer reads return no rows, foreign writes fail/change zero rows, and anonymous reads are denied. Test real email/password updates under the current settings. Local tests do not establish live policy deployment or actual mobile-keyboard behavior.

Run `node tests/customer-auth-browser.cjs` and the unchanged `node tests/admin-browser.cjs` (Chrome/Playwright; optional `PLAYWRIGHT_MODULE` path). Customer tests mock the SDK boundary and make no remote writes. They cover signup/session variants, validation/errors, profile failures, forged mock sessions, checkout cart/form preservation, refresh/reopen, logout, settings, and modal geometry at 1440/1024/900/768/480/393/360px plus a shortened mobile viewport. These are not proof of live RLS, SMTP delivery, physical mobile keyboard behavior, or dashboard configuration. Live customer and two-account RLS verification remains required after manual setup. The admin browser regression suite passed unchanged; this task did not perform new live admin mutations.

Validation on 2026-09-14: customer, admin, shop, and gallery browser suites passed with no JavaScript runtime errors. Customer checks also covered repeated-submit protection, keyboard focus wrapping, the mobile drawer, and the real shared-client bootstrap with the SDK unavailable. Desktop/mobile signup screenshots were visually inspected. JavaScript syntax checks passed. SQL has been reviewed in the repository but has not been applied or tested against the live database.

## Admin Dashboard

- `admin-login.html` and `admin.html` are unlisted pages accessed directly by URL, never linked in public navigation. Layout lives in `css/admin.css`; behavior is isolated in `js/admin.js`.
- Uses real Supabase email/password Auth and the shared SDK session, with independent owner-only authorization. Customer Supabase users do not automatically receive admin authorization. No admin signup form exists. The dashboard stays hidden until the session and server-validated owner identity pass. `js/admin-config.js` holds only the owner's public Auth UUID.
- Supports adding, editing, cancelling edits, and confirmation-protected deletion. All products, including out-of-stock rows, are accessible in a compact table with 25 rows per page. New in-stock products appear in Latest Work on the homepage's next load.
- Images upload to the public `product-images` Storage bucket under unique owner-scoped paths. JPG/PNG/WebP extension, MIME type, file signature, and a 5 MB maximum are checked before upload. Editing without a new image retains its URL. Failed saves retain data and reuse completed uploads on retry.
- Apply `supabase/admin-security.sql` once in the Supabase SQL Editor. It adds owner-only restrictive write policies alongside existing product policies, a Storage upload policy, and bucket file limits. Public product SELECT remains unchanged. **The SQL is supplied for setup; creating this file does not apply it to Supabase.** Existing authenticated-only policies do not enforce owner-only API access.
- Customer registration requires **Allow new users to sign up** enabled after verifying owner-only product/Storage RLS guards are applied. Keep anonymous sign-ins disabled. Owner UUID validation remains unchanged. Never put passwords or service-role keys in frontend files or this README.
- After a successful product row deletion, the dashboard removes its associated image from this project's `product-images` Storage bucket. Empty, malformed, external, or other-project URLs are skipped. Storage errors are logged to the console without changing the successful product deletion or toast. Add/Edit flows are unchanged; replaced or abandoned uploads and failed cleanup may still require manual review.
- Apply `supabase/admin-storage-cleanup.sql` in the Supabase SQL Editor to grant the owner Storage SELECT and DELETE permissions. Existing restrictive guards remain in force. This supplement is safe to rerun and does not change product or public-read policies.
- Client checks control page visibility; Supabase RLS enforces data authorization. Keep catalog data trusted and protect the shared site origin against XSS.
- Verification: `node tests/admin-browser.cjs` runs isolated browser checks with mocked Supabase responses for authentication, CRUD, file validation, failure recovery, pagination, and layout. It requires Playwright and Chrome; set `PLAYWRIGHT_MODULE` if Playwright is installed outside this project. `tests/admin-live.cjs` is an opt-in live test requiring a local server at port 4173, applied policies, and manual owner sign-in; it creates/edits/deletes a uniquely named test product. The test verifies the uploaded object exists before deletion and is absent afterwards, and checks deletion of rows with empty or external image URLs.
- Validation on 2026-09-10: live login, upload, product creation, public homepage visibility, price update, deletion, and logout passed. The test confirmed the uploaded Storage object existed before deletion and was absent afterwards, and the product row disappeared from the dashboard and public query. Empty-image and external-image test rows deleted without Storage removal requests. The previous interrupted test row was also removed. The mocked suite passed cleanup URL parsing, null/malformed/foreign URLs, Storage error/exception handling, and stale-image checks. No JavaScript runtime errors occurred. Server-side rejection of other authenticated accounts has not been independently verified.
- Validation on 2026-09-14: admin browser regression passed with no Is Featured form control. The live homepage request was `in_stock=eq.true&order=created_at.desc&limit=6`, contained no `is_featured` filter, rendered without runtime errors, and returned the current newest in-stock catalog result.

### Order Management

`admin.html` now has an Order Management panel alongside product management. `js/admin-orders.js` initializes only after the existing owner check passes; every service request validates that owner again. The panel queries all customers' orders with nested items, newest first, and uses exact counts plus 25-row Previous/Next pagination. Order number, shipping name, date, total, quantity count, and current status appear in the table. View details expands items, delivery address, contact information, payment method, and totals. Missing items show an explicit unfinished-save warning.

The status selector supports Processing, Shipped, Delivered, and Cancelled. Save uses the row ID and previously displayed status to reject stale changes, shows progress, and confirms success using the existing admin toast. Failed loads/saves show an inline explanation and Refresh Orders retry. Customer-owned order filters are confined to customer history; the owner panel deliberately has no user_id filter. All database text is escaped, and image URLs permit only HTTP(S). Existing product management and owner authentication behavior remain intact; no new session listener is introduced.

### Custom Order Management

`admin.html` includes an isolated `js/admin-custom-orders.js` panel initialized after the existing owner gate; each load/save revalidates the owner. It lists all customer and guest requests newest first with 25-row pagination, name/email/type/date/account/image count and status. Expand details to inspect the full brief, contact fields and reference thumbnails. Four status options match customer tracking; Save checks the previously displayed status, disables duplicate actions, updates the timestamp, and shows the existing admin toast. Failed loads/saves retain actionable Refresh/retry guidance. Database text is escaped and image links accept only HTTP(S). Product/order management and admin authorization remain unchanged.

## 11. Change Log

### [2026-09-21] - PKR Custom Budget Conversion Follow-up

- Corrected the hardcoded Custom Order Budget Range labels and radio values missed by the original PKR conversion: Under Rs. 2,000; Rs. 2,000 - 5,000; Rs. 5,000 - 10,000; Rs. 10,000+. These brackets reflect the owner's stated Rs. 1,200–3,500 standard-piece pricing. The selected value passes unchanged into `custom_order_requests.budget_range` and the existing admin details view.
- Replaced the remaining two dollar-denominated initial checkout total placeholders with `Rs. 0`. No option styling or other contact/order fields changed. Historical submitted budget strings remain unchanged; no exchange-rate conversion or remote record rewrite is performed.

### [2026-09-21] - Supabase Wishlist and Login Requirement

- Replaced local wishlist/email buckets with UUID-owned `wishlist_items`, reusing existing real product IDs and card/profile styling. Guest hearts open the existing auth modal with context; no pending wishlist action is replayed after login. Cart remains guest-accessible and local.
- Added shared cached heart state, duplicate-click/unique-conflict handling, failure feedback, current joined profile details, retry and database removal. Removed obsolete local wishlist helpers and the Auth email-bucket mapping; legacy stored data is not deleted/imported.
- Added browser and local SQL tests, including isolation and product deletion cascade. Updated the existing Shop guest-heart assertion to expect login rather than a local save; documented remaining live verification.
- Validation: wishlist browser/SQL tests, Shop regressions and customer-profile regressions all passed, along with JavaScript syntax and diff checks. Supabase production policies and account sessions were not modified or live-tested.

### [2026-09-21] - Business Contact Email Updated

- Updated the public contact email and mailto recipient to `toseefa_abrar@yahoo.com`, including documentation references. Preserved the existing inquiry subject, link markup/styling, phone, WhatsApp and location details.

### [2026-09-21] - Product Image/Title Quick View and Delivery Estimate

- Made Latest Work/Shop product images and titles additional triggers for the existing Quick View handler, including keyboard and single-tap access. Preserved separate + Add to Cart behavior and Gallery interaction. Shared renderer/event wiring handles refreshed catalog cards and static fallback cards.
- Added one consistent delivery estimate near the Quick View price and below shipping costs in Cart/Checkout, using shared muted-text styling. Checkout hides the Pakistan estimate for other countries. The 5-7-business-day timeframe remains a placeholder requiring owner confirmation.
- Added `tests/product-browsing-browser.cjs` for both catalog pages on desktop/touch, keyboard activation, + button isolation, estimate consistency and international-country behavior. Tests use mocked SDK responses and make no live purchases or catalog changes.

### [2026-09-20] - Checkout Summary First-Render Sequencing

- **Confirmed cause:** Checkout revealed its empty HTML summary/zero totals before a 380ms skeleton timer rendered the synchronous local cart. Restored country values suppress the country-change event that otherwise renders the summary early, making the flash dependent on form state. Browser baseline captured 23–25 incorrect visible frames with restored country while `shah_cart` remained intact. Auth readiness was already awaited; pending form restoration and cart reads are synchronous, and no Supabase cart query exists.
- **Fix:** Render items and totals after Auth readiness/form restoration, before revealing checkout. Remove only this summary's artificial loading timer; asynchronous address prefill and its country-change updates continue unchanged. Cart, shipping form, payment and order placement behavior are preserved.
- **Regression:** `tests/checkout-summary-browser.cjs` samples visible frames for checkout-gated signup/login and already-authenticated navigation, with normal and throttled network/delayed Auth/profile responses. It also checks cart preservation and restored fields. This reproduces a transient placeholder flash, not an indefinitely blank summary; the original live session was not available for inspection.
- **Validation:** All six scenarios passed after the fix with zero incorrect visible frames; the existing `tests/orders-browser.cjs` suite and JavaScript syntax/diff checks passed. Auth/database responses were mocked, with Chrome network throttling enabled for the slow cases. No remote accounts or orders were changed.

### [2026-09-17] - Dynamic Custom Order Categories

- Replaced the hardcoded Order Type list with the existing shared catalog category fetcher. Retained card styling and added exactly one permanent Other option at the end, with Other-only fallback for an empty/unavailable catalog.
- Loaded `js/product-loader.js` on `custom-order.html` and bound selection validation to dynamically rendered radios. Category text uses safe DOM values/textContent; Shop/Admin category logic is unchanged.
- Extended the custom-request browser suite to check sorting/deduplication, a category added before reload, Other normalization, empty catalog and exact submitted order_type values. These are mocked SDK checks; no live catalog was altered.

### [2026-09-17] - Custom Request Upload Failure Diagnosis and Storage Setup

- Captured live `NoSuchBucket` / `Bucket not found` from the reference upload endpoint; verified guest no-image INSERT succeeds with and without a date. This failure occurs before request INSERT, outside the proposed payload/type/identity causes.
- Added temporary stage/INSERT console diagnostics and `supabase/custom-order-storage.sql` to provision the expected bucket and scoped upload permissions. No submission flow or table policy was rewritten. Remote application and authenticated/image success checks remain pending; this is not a claim that production is repaired.

### [2026-09-17] - Supabase Custom Requests and Owner Management

- Replaced custom-request localStorage submission/history with the existing Supabase table; legacy data remains untouched and is not imported. Validated customer identity and guest ownership use the supplied schema/RLS.
- Preserved form/profile presentation and Storage upload paths. Fixed the shared-client binding, removed guest-incompatible INSERT returning queries, wait for every image upload, retain failed submissions and reuse completed uploads on same-page retry.
- Added real four-stage tracking, query retry states, and owner request details/images/status controls with 25-row pagination. Added browser and SQL policy tests and documented live verification requirements and recovery limits.

### [2026-09-17] - Google Fonts Loaded from Every HTML Head

- **Audit/root-cause finding:** The font import was not lost or illegally positioned: it remained on line 4 of `css/base.css`, preceded only by a valid CSS comment. Baseline Chrome requests to Google Fonts and its font-file host returned HTTP 200, and rendered-font inspection identified Cormorant Garamond on `.hero-title` and Plus Jakarta Sans on `.hero-description`. The reported fallback was not reproduced in this checkout; attributing it to the modular split or comments would be unsupported. The previous Known Limitations entry was inaccurate. See [CSS import ordering](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@import).
- **Change:** Added both preconnects and the requested Google Fonts stylesheet link before other stylesheets in index, cart, checkout, order-confirmation, profile, custom-order, shop, admin, admin-login, 404, and reset-password HTML heads. Removed the single font import from `css/base.css`, eliminating the nested stylesheet dependency. No font-family declarations, typography styling, or application behavior changed.
- **Verified:** Fresh local Chrome contexts for all 11 pages fetched the live Google stylesheet and font files with HTTP 200 and loaded both families. JavaScript was disabled to inspect each page's own head without authentication redirects; font requests were not mocked. Rendered-font inspection confirmed the intended homepage heading/body fonts before and after, so no typography difference was expected locally. Homepage screenshots were compared; all heads have exactly one font stylesheet before site CSS, no Google Fonts CSS import remains, and the diff check passed. This does not verify the currently deployed Netlify build or browser-specific blocking on the originally affected device.

### [2026-09-17] - Customer Forgot Password Flow

- Added a subtle Forgot password? control below the login password field and a third view in the existing modal for validated email reset requests, generic confirmation, loading, failure recovery, and Back to Login.
- Added `reset-password.html` with standard site chrome and a token-styled centered card. Extended the existing auth listener with recovery-event state and server identity checks; reused password rules, matching confirmation, strength meter, and inline status components. Success clears password inputs and offers local sign-out plus homepage login; cart/checkout intent remain untouched.
- Added a dedicated browser regression suite. Documented recovery behavior, invalid/direct visits, file/page/feature inventory, email-provider limitations, required production/local redirect URLs, and live verification steps. No SQL or remote Supabase configuration was changed.
- Validation: `node tests/password-recovery-browser.cjs`, `node tests/customer-auth-browser.cjs`, and the unchanged `node tests/admin-browser.cjs` passed, along with syntax/diff checks. Recovery checks cover same-modal switching, generic feedback, duplicate-submit/network recovery, seven viewport widths and a shortened mobile viewport, direct/ordinary-session/expired-link rejection, a recovery event before page bindings, password strength/matching, retained retry entries, successful update, return-to-login sign-out, cart preservation, and expiry before submission. SDK/email responses are mocked; real inbox delivery, email clicks, and login with the changed live password remain unverified because no test inbox or signed-in browser is accessible.

### [2026-09-17] - Supabase Orders and Owner Order Management

- Replaced local order creation/history/cancellation with `orders` and nested `order_items` queries through `js/order-service.js`, using the server-validated Auth UUID. Legacy `shah_orders` is ignored and retained without import. Guest cart/login behavior and the confirmation receipt UI remain unchanged.
- Checkout saves the header and all item snapshots before clearing the cart or redirecting, retains `shah_last_order` in its existing receipt shape, prevents repeated submits, and uses stable order/item UUIDs for same-tab failure/reload retries. Documented unfinished headers from the requested two-request flow and the need for future transactional/server-validated submission.
- Added the isolated owner order panel, expandable details, status saves with stale-update checks, error/retry states, and 25-row pagination using existing admin styles. Product cards now retain their database product ID in new cart entries when available.
- Added the idempotent cancellation policy/column-guard supplement, required because the supplied policies permit only owner updates. Local PostgreSQL checks passed for two-customer isolation, item ownership, cancellation-only updates, owner visibility/status changes, anonymous denial, and safe reruns. Existing admin and customer-auth browser regressions passed; live Supabase setup and signed-in testing remain pending.
- Order browser checks passed for header/item failures, cart continuity through login, reload/repeated-submit/lost-response retries without duplicate records, unchanged confirmation cache, ignored legacy history, cancellation persistence, history retry, two-customer filtering, owner status persistence, safe rendering, and 25-row pagination. Profile and admin order layouts had no document overflow at 1440/1024/900/768/480/393/360px. Saved-address regressions, JavaScript syntax, and diff checks also passed. Browser SDK responses were mocked; actual RLS was exercised separately in local PostgreSQL. The connected-browser inventory remained empty after retry/reset, so no live-account result is claimed.
- Updated overview, file inventory, checkout/profile behavior, features, storage notes, limitations, database deployment/verification, admin documentation, and roadmap. No remote SQL, Auth configuration, or deployment was changed.

### [2026-09-16] - Phase 3 — Supabase Saved Address Migration
- Replaced all application `shah_saved_addresses` reads/writes with a shared Supabase address service. UUID ownership and per-page memory state replace email-keyed local address arrays; legacy data is ignored and retained without importing it.
- Added idempotent address schema/RLS/RPC setup with immutable ownership, timestamps, a one-default unique index, transaction locking, first-address defaults, and deterministic promotion after default deletion/unchecking. Existing customer Auth/profiles and admin policies remain unchanged.
- Preserved profile cards and form styling, adding the requested optional address fields/default control, custom delete confirmation, accessible loading/saving/retry/focus behavior, international postal validation, and mobile form sizing. Checkout loads the cloud default into untouched empty fields; no new checkout selector or save checkbox was introduced because neither existed.
- Updated overview, files, features, page behavior, storage notes, security/database setup, dependency map, limitations, and future phases. Added browser and local PostgreSQL regression suites; live SQL deployment remains a documented manual step.
- Validation: address browser and local PostgreSQL suites passed, along with customer-auth, customer-profile, and the unchanged admin browser regressions. Coverage includes CRUD/default/delete recovery, ignored legacy data, escaped address text, UUID/RLS isolation for two local test users, anonymous denial, rollback and unique-default enforcement, checkout/cart continuity, and 1440/1024/900/768/480/393/360px layouts plus a shortened mobile viewport. Desktop/mobile screenshots were inspected. Syntax and diff checks passed. The auth test cart now uses a valid local image to avoid an unrelated blocked-image fallback loop during navigation; authentication assertions are unchanged. Live Supabase policies, real concurrent sessions, and physical mobile keyboards have not been verified.

### [2026-09-14] - Persistent Customer Profiles, Phase 2
- Completed profile-data integration using the existing Supabase profiles table/RLS and shared frontend creation path. Removed Auth-metadata display fallback; added an email-initial navbar fallback, bounded in-memory caching, loading/retry states, and immediate profile/header/avatar refresh after saving.
- Hardened account settings validation, duplicate-save handling, current-password reauthentication, email synchronization/confirmation messaging, and partial-save recovery. No profile/password data is imported from legacy mock storage.
- Added non-overwriting profile contact prefill for checkout/custom orders, preserving pending checkout values/country and local commerce datasets. Confirm Email remains disabled per the owner; no admin or remote configuration was changed.
- Added profile browser and local PostgreSQL RLS regression suites; reused the existing idempotent `supabase/customer-auth.sql` without schema changes. Documented the dependency map, source of truth, manual verification, and remaining backend phases.
- Validation: profile and customer-auth browser suites passed, as did the unchanged admin suite and JavaScript syntax/diff checks. Profile coverage includes all seven requested widths, shortened mobile viewport, delayed loading, edit persistence, email modes, password API contracts, cache/fallback/retry, safe rendering, and contact/country restoration. Desktop/mobile screenshots were inspected. The SQL suite passed in local PostgreSQL, including reruns, own-row access, cross-row/ID rejection under a broad permissive policy, anonymous denial, and email/timestamp enforcement. Live Supabase configuration, real Auth email/password changes, and physical mobile keyboards were not exercised.

### [2026-09-14] - Customer Confirmation Redirect Fix
- Centralized signup `emailRedirectTo` in `js/auth.js` using the current HTTP(S) origin plus `/`, replacing the UI's page-specific callback argument.
- Resume saved checkout intent only after a validated session, consume that intent once, and suppress unnecessary login/signup reopening. Retained the existing SDK session handling, single auth listener, guest cart, UI, and admin authentication.
- Corrected the production URL to `https://shah-embroidery-and-art.netlify.app/`; documented exact/wildcard production redirects, the inspected `127.0.0.1:4173` live-test origin, and confirmation-template repair. Remote configuration and real email verification remain manual.
- Verification: `node tests/customer-auth-browser.cjs` passed local and production-hostname simulations for signup callback URLs, session/navbar restoration, closed auth modal, refresh, checkout intent, cart preservation, and logout. Auth/email delivery are mocked, so this is not a real confirmation-email test. The unchanged `node tests/admin-browser.cjs` suite, JavaScript syntax checks, and `git diff --check` passed.

### [2026-09-14] - Customer Supabase Authentication, Phase 1
- Replaced mock customer signup/login/session and settings password hashing with shared Supabase Auth and own-row customer profiles. Added SQL setup, lazy profile recovery, generic errors, duplicate-submit prevention, and verification-aware redirects.
- Hardened shared client initialization and the homepage product loader for an unavailable SDK, keeping customer error feedback and guest navigation operational.
- Preserved guest cart/checkout intent, shipping restoration, local profile datasets, and independent owner-only admin authorization. Added accessible auth status/focus handling and dynamic viewport sizing without redesigning the modal.
- Added customer browser regressions and documented manual SQL/Auth URL/email configuration, security boundaries, remaining migrations, and live verification requirements.

### [2026-09-14] - PKR Price Display
- Updated product cards, Gallery, admin tables, cart, checkout, and order confirmation to display numeric prices as `Rs. X,XXX`. Stored numeric values remain unchanged, and historical order totals retain their original stored formatting.

### [2026-09-14] - Quick View Descriptions and Description Search
- Quick View now displays each product's description with a fallback for missing text, and site search matches product descriptions while keeping suggestions compact. Confirmed `Images/hero_embroidery.jpg` exists at the referenced path.

### [2026-09-14] - View-Only Gallery Modal
- Gallery items now open a dedicated informational modal with a prominent image, description, category, and price, leaving transactional Quick View behavior unchanged for Latest Work and Shop.

### [2026-09-14] - Fixed Gallery Grid Sizing
- Updated Gallery sizing to use `auto-fill` with 260px minimum tracks, left alignment, and a 320px item maximum. Tall items retain their 580px height across responsive breakpoints.

### [2026-09-14] - Gallery Supabase Client Initialization Fix
- Corrected the Gallery loader to use the shared top-level `supabaseClient` binding. The previous image-rendering diagnosis was superseded: the loader was returning before its query because `window.supabaseClient` is not populated by the shared client script.

### [2026-09-14] - Supabase Dynamic Homepage Gallery
- Replaced the static homepage gallery with a live Supabase view of the newest in-stock products, shared dynamic category tabs, loading/empty states, and whole-item Quick View interactions.

### [2026-09-14] — Latest Work Recency Feed
- Removed the homepage `is_featured` filter so Latest Work always shows the six newest in-stock products.
- Renamed the homepage heading to “Latest Work,” removed the admin Is Featured control and table column, and left the legacy database column untouched.

### [2026-09-10] — Dynamic Product Category System & Homepage Cleanup
- **Homepage Circular Categories Removal:** Completely removed the circular category section (`.categories-grid` cards) from `index.html`, removed `@import 'categories.css'` from `css/style.css`, and updated all "Collections" nav (desktop + mobile drawer) and footer quick links to point directly to `shop.html`.
- **Dynamic Category Architecture & Admin Dashboard (`admin.html`):** Replaced hardcoded category selects with a dynamic system driven by real categories from the Supabase `products` table.
  - **Jakob's Law:** Implemented the familiar "select existing OR add new" dropdown pattern for adding and editing products.
  - **Von Restorff Effect:** Distinctly styled the "+ Add New Category" option in `--accent-gold` and bold font at the bottom of the select menu. Selecting it reveals an inline text input with a Cancel button to revert back.
  - **Postel's Law & Tesler's Law:** Forgiving input normalization compares typed category names case-insensitively against existing categories (`.toLowerCase().trim()`) and automatically standardizes to the existing canonical casing, preventing category fragmentation and duplicate options.
  - **Hick's Law:** Automatically sorts categories alphabetically so the list remains easily scannable as new categories are created.
- **Dynamic Shop Filter Tabs (`shop.html`):** Replaced hardcoded category tabs with dynamic `.tab-btn` elements rendered from distinct catalog categories via `js/product-loader.js` (`fetchCategories()`), keeping "All Artwork" as the primary tab and handling URL queries (`?category=...`) case-insensitively with full history preservation.
- **Automated Verification:** Added Playwright automated tests verifying dynamic category fetching, adding new categories on the fly, case-insensitive normalization, cancellation, and shop dynamic filtering.

### [2026-09-10] — Full Shop Collection
- Added `shop.html`, `js/shop.js`, and `css/shop.css` for category-filtered browsing of all in-stock Supabase products with 12-item numbered pagination and shareable URL/history state.
- Reused the shared card renderer and bindings, and changed only the two requested homepage catalog links. Admin, cart, checkout, profile, and the static gallery remain unchanged.

### [2026-09-10] ? Product Image Cleanup on Delete
- Added best-effort Storage image removal after successful row deletion, using the deleted row's current image URL. Invalid or external URLs are skipped; Storage failures never undo or block the product deletion result.
- Added owner-only Storage cleanup policy setup and browser tests for URL parsing, failure recovery, and live object removal.


### [2026-09-09] — Owner Admin Dashboard
- Added isolated Supabase admin login, protected product CRUD, image validation/upload, pagination, deletion confirmation, and error handling that retains form data.
- Added owner UUID configuration and a SQL setup script for owner-only product/Storage writes and upload limits.

### [2026-09-09] ? Supabase Featured Products (Phase 1)
- Added the Featured product loader and its script tag on `index.html`.
- Added reusable Add to Cart and Quick View wiring plus a global refresh hook for dynamically loaded product cards, wishlist hearts, search, and reveal animations.


### [2026-09-08] — Checkout Authentication Data-Preservation Fix
- **Fixed:** Logging in or creating an account from `checkout.html` now saves the entered shipping fields, returns the customer to `checkout.html` instead of `profile.html`, and restores the saved fields after authentication. The temporary redirect and form-data keys are cleared after use; cart data remains untouched.

### [2026-09-08] — Mobile Full-Width Search Takeover
- **Changed:** On screens below 768px, opening navbar search now temporarily replaces the normal navbar controls with a 44px close button and full-width search field. Suggestions use the full viewport width below the fixed-height navbar; Escape, close, and suggestion selection restore the normal controls.
- **Preserved:** Desktop and tablet inline search behavior remains unchanged at 768px and above.

### [2026-09-08] — Shared Skeleton Loading States
- **Added:** Introduced `css/skeleton.css` with warm token-based shimmer, card/row/summary primitives, responsive sizing, fade transitions, and a reduced-motion fallback.
- **Coverage:** Added loading states for homepage artwork, categories, gallery, testimonials, banners, and image slots; cart and checkout summaries; all profile data tabs; custom-order choices; and order confirmation recap content.
- **Behavior:** Dynamic content keeps `aria-busy="true"` until its minimum 380ms loading state completes, while individual image placeholders remain until each image loads or errors.

### [2026-09-08] — Checkout-Only Login Requirement
- **Guest cart restored:** Removed the earlier add-to-cart-level login gate. Guests can add artwork, use Quick View, adjust cart quantities, and use wishlist hearts without authentication.
- **Checkout gate:** Proceed to Checkout, checkout form submission, and direct `checkout.html` visits require an active login session. Guests are redirected to `cart.html` with the existing auth modal and a contextual message.
- **Cart continuity:** Successful login or signup from the checkout gate redirects to `checkout.html` without clearing or re-adding the existing `shah_cart` items.

### [2026-09-07] — Homepage Layout Stability Fix
- **Root Cause:** The page had `overflow-anchor: none` on `body`, but the document root is the effective scrolling container in Chromium and still reported scroll anchoring as enabled. The remaining top-of-page image stability gap was also missing intrinsic dimensions on the navbar logo and hero image. The custom fonts use Google Fonts `display=swap`, but no font-specific height shift was observed in the tested page load.
- **Fix:** Added `overflow-anchor: none` to both `html` and `body`, plus matching intrinsic `width`/`height` attributes to the top logo and hero image in `index.html`. Existing manual scroll restoration remains scoped to homepage stability.
- **Verified:** Direct and cross-page desktop/mobile loads remain at `scrollY === 0` after rendering, while intentional section anchors continue to navigate normally.

### [2026-09-07] — Plain Homepage Scroll Restoration Fix
- **Initial finding:** Plain `index.html` navigations had no unintended section hash, autofocus, or load-time scroll call. Browser history restoration could retain a previous nonzero position on a homepage landing.
- **Current behavior:** `js/script.js` uses manual history restoration and resets plain homepage navigation on `pageshow`; the later login-state fix below handles the non-section `#login` fragment separately while real section anchors remain intact.

### [2026-09-07] — Homepage Navigation Scroll Position Fix
- **Root Cause (verified in code):** The login modal flow redirected to `index.html#login`. The `#login` fragment is application state, not a page section anchor, and allowed browser/history scroll restoration to preserve a small offset on that navigation.
- **Fix (`js/script.js`):** Auth redirects now use `index.html?login=1`, so the modal state is carried without a scroll-producing hash. The legacy `#login` state is still recognized and reset to the top, while real section anchors such as `#gallery` continue to use normal browser anchor scrolling.
- **Verified:** Plain homepage navigation from the cart and 404 page lands at `scrollY === 0`; the `?login=1` flow opens the login modal at the top; section navigation still targets its requested section.

### [2026-09-07] — Touch-Device Add to Cart Fix
- **Root Cause (verified in code):** The artwork-card Add to Cart path was wired to a `dblclick` handler. Its single-tap fallback was gated only by `matchMedia('(hover: none)')`, which remains false on some touch-capable or hybrid devices, so the first tap only activated the device's hover state and the second tap triggered `dblclick`. There was no `pointer-events` blocker, overlapping Add to Cart sibling, touch event cancellation, or pointer-events transition involved.
- **Fix (`js/script.js`):** The artwork-card handler now binds a **single-tap** `click` listener when the device reports touch capability through `matchMedia('(hover: none)')`, `ontouchstart`, or `navigator.maxTouchPoints`, while retaining desktop `dblclick` behavior. Taps on inner interactive controls (buttons/links, e.g. Quick View) are ignored so they don't double-fire.
- **CSS finding:** `.artwork-quick-view-btn` is the only hover-hidden card control (`opacity: 0` plus a translate transform), and it was already covered by the existing `@media (hover: none)` override. The gallery cards do not contain a separate hover-hidden Add to Cart button or `pointer-events: none` rule.
- **Success Toast Added:** The card add-to-cart path now calls the unified `showToast` ("Added [title] to your cart."). Previously `addToCart` only called `openCartModal()`, which is a no-op on `index.html` (no `#cartModal` element there), leaving the badge as the only feedback.
- **Quick View Toast Consistency:** The Quick View modal Add to Cart handler now calls the same unified `showToast` after adding the artwork, so this entry point also gives immediate success feedback.
- **Verified:** With browser touch-capability simulation, a single tap on multiple cards updates the cart badge and shows the success toast, including after switching a gallery filter tab; tapping the Quick View button does not add to cart.

### [2026-09-17] — Cash on Delivery (COD) Checkout Simplification
- **Streamlined Payment Experience:** Simplified the checkout flow to offer Cash on Delivery (COD) exclusively, applying Hick's Law to eliminate cognitive friction and decision fatigue when only one payment method is supported.
- **Removed Multi-Payment UI:** Removed interactive payment method selector cards, Meezan Bank transfer details box (`#bankTransferDetails`), and mock credit/debit card gateway inputs (`#cardMockDetails`) from `checkout.html` and `css/checkout.css`.
- **Informational Payment Summary:** Replaced selector cards with an accessible, non-interactive "Payment Method: Cash on Delivery" summary row within the order summary block.
- **Simplified Client Logic & Confirmation:** Updated `js/script.js` to use a constant `selectedPaymentMethod = 'cod'`, cleanly passing it through order persistence without branching. Simplified `order-confirmation.html` modal rendering to directly display Cash on Delivery and removed bank-transfer WhatsApp receipt notes.
- **Documentation & Limitations:** Cleaned up `README.md` to remove obsolete references to simulated card gateways, manual bank verification, and off-invoice routing numbers.
- **Historical orders:** Profile and admin retain readable labels for previously stored bank/card methods; new checkout submissions always send `cod`. The `payment_method` text field and database schema remain unchanged. The confirmation receipt displays Cash on Delivery directly.
- **Verification:** `node tests/orders-browser.cjs` passed checks for absent payment selectors/details, the informational COD row, the persisted `payment_method: 'cod'` request, confirmation without bank/WhatsApp notes, readable COD and historical payment labels in profile/admin, cart continuity, retries, cancellation, pagination, and responsive layouts. Syntax and diff checks passed. Supabase responses were mocked; no live database order was created during this verification.

### [2026-09-10] — Product Card "+" Add-to-Cart Button Decoupling
- **Decoupled '+' Add to Cart Button from Quick View:** Removed the duplicate `trigger-quick-view` class from the `.artwork-detail-btn` "+" icon button across all hardcoded featured cards in `index.html` and dynamic card templates in `js/product-loader.js` (inherited by `shop.html`). Clicking the "+" button now exclusively adds the item to the cart and shows the success toast without simultaneously triggering the Quick View modal.
- **Preserved Dedicated Quick View Button:** Confirmed that the dedicated `.artwork-quick-view-btn.trigger-quick-view` button retains its modal trigger behavior across desktop (hover) and touch/mobile viewports on both `index.html` and `shop.html`.

### [2026-09-10] — Fixed & Consistent Product Card Grid Sizing
- **Consistent Product Card Sizing (`.artwork-grid` & `.artwork-card`):** Replaced `repeat(auto-fit, ...)` and fixed 3-column definitions with `repeat(auto-fill, minmax(260px, 1fr))` alongside `justify-content: start; gap: 30px;` in `css/artwork.css`, paired with `max-width: 320px; width: 100%;` on `.artwork-card` and `.skeleton-card`.
- **Eliminated Item Stretching on Few Products:** Ensured cards never stretch to fill an entire row when only 1–2 items are present in a category on `shop.html` or in `#featured` on `index.html`. Unused grid tracks remain empty and cards anchor to the left.
- **Removed Breakpoint Column Overrides:** Removed `.artwork-grid` from `css/responsive.css` so the auto-fill minmax rule governs column wrapping naturally across 1280px (4 columns), 1024px (3 columns), 768px (2 columns), and 480px (1 column) without conflicting rules. Preserved `.categories-grid` and `.gallery-grid` untouched.

### [2026-09-10] — Dedicated Shop Page with Supabase Filtering & Numbered Pagination
- **Dedicated Shop Catalog (`shop.html`):** Created a dedicated, full-collection catalog browsing page powered by Supabase (`products` table) to display all in-stock artwork (`in_stock = true`), supporting 12 products per page with server-side pagination via Supabase's `range()`.
- **Reusable Card Rendering & Event Bindings:** Reused `createProductCardHTML()` from `js/product-loader.js` and called `window.refreshDynamicProductBindings()` from `js/script.js` on every render, ensuring Quick View modal, double-click/single-tap Add to Cart, wishlist toggling, and search indexing work identically to the homepage.
- **Category Filtering:** Added filter tabs adhering to `.gallery-tabs` / `.tab-btn` styling for *All Artwork* plus dynamic database categories. Filter selection resets pagination to page 1 and updates the active pill state.
- **Numbered Pagination:** Built accessible numbered pagination controls (`.shop-pagination`) with Previous/Next boundary disablement, dynamic window truncation (rendering up to 7 page buttons or current page + neighbors with ellipsis gaps for large catalogs), and smooth upward scrolling to `#shopResults`.
- **Deep-Linking & History Navigation:** Full URL synchronization using `?category=...&page=...` query parameters with `pushState`/`replaceState` and `popstate` listening, supporting bookmarks, browser back/forward buttons, safe bounds clamping for out-of-range pages, and query normalization.
- **Asynchronous Feedback & Empty State:** Shows 12 warm shimmer skeleton cards during fetch transitions, an empty state panel with a "View All Artwork" reset button when a category returns 0 items, and a retryable error state when network requests fail.
- **Homepage Links Updated:** Retargeted the homepage's **View All Artwork** (`.view-all-link`) and **Explore Full Gallery** buttons from `#gallery` to `shop.html` while preserving the static portfolio gallery showcase.
- **Responsive Styling (`css/shop.css`):** Formatted horizontally scrollable filter tabs on viewports <= 768px, flexible product grid collapse adhering to shared breakpoints, and minimum 44px touch targets across all pagination buttons.

### [2026-09-07] — Feedback Audit, Unification & 404 Page
- **Custom 404 Error Page (`404.html`):** Added a polished, on-brand "page not found" page at the repository root so Netlify auto-serves it for any unmatched route (standard behaviour, no config needed). Shares the full navbar, mobile drawer, and footer, speaks in the house's warm artisanal voice, offers twin wayfinding CTAs (**Return to Homepage** + **Browse the Gallery**) per Postel's law, inherits all shared scripting, and measures zero horizontal scroll at desktop and mobile widths.
- **Audit Outcome — Existing Feedback Left Untouched:** Systematic browser verification confirmed the majority of the site already tells users clearly whether actions succeed or fail, so no changes were warranted there: signup duplicate-email rejection, checkout blocking (progressively disabling **Place Order** until valid, plus inline-field fallback), custom-order progressive validation, guest/logged-in custom-order confirmations, add-to-cart (drawer + bouncing badge), wishlist add/remove, contact-form inline acknowledgement, cart-stepper-only quantities, and safe `getFromStorage`/`getCart` readers.
- **Notification Consolidation (single source of truth):** Introduced one unified toast component (`css/toast.css` + `window.showToast`) and migrated every disparate notice onto it —
  - simplified the brittle legacy `accountToast` fallback to always route through the unified component,
  - swapped the broken `settingsSuccessMessage` (annihilated by an immediate re-render) for a durable toast,
  - converted the five footer **newsletter `alert()`** pop-ups (cart, checkout, custom-order, index, profile) into themed toasts,
  - surfaced **address** add/edit/delete/set-default successes, **settings** saves, **cart-save** failures, **order-place** storage failures, and **custom-order** save failures as consistent toasts.
- **Security-hardened Generic Credentials Error:** Collapsed the login modal's distinguishable "no account found" / "incorrect password" responses into a single ambiguous **"Incorrect email or password."** so attackers cannot harvest which accounts exist.
- **Defensive Storage Safety:** Wrapped risky `localStorage` mutations (general saves, cart saves, order placement, custom-order saves) in try/catch with graceful error toasts instead of silent crashes.
- **🚨 Critical Global Regression Fixed:** A corrupt Unicode character-range in the `nameRegex` constant raised *"Range out of order in character class"* on **every** page load, throwing inside the master IIFE and silently disabling virtually all site JavaScript (validation, cart, auth, menus, toasts). Rewritten as a Unicode-letters expression (`/^[\p{L}]+(?:[ '\\-][\p{L}]+)*$/u`), restoring full interactivity site-wide.
- **Polish:** Restored the missing `.bounce` keyframe so the cart badge pulses on updates; consciously skipped a decorative "welcome" toast on login/signup because the hard redirect to the personalised profile greeting plus the avatar-badge flip already supply clearer, less flaky confirmation.

### [2026-09-07] — Site-Wide Quality Assurance & Optimization Pass
- **Site-Wide Quality Assurance & Optimization Pass:** Audited all six pages (`index.html`, `cart.html`, `checkout.html`, `order-confirmation.html`, `profile.html`, `custom-order.html`) for responsiveness, usability, and link health.
  - **Zero Horizontal Scroll:** Empirically measured every page at widths 1440 / 1320 / 1130 / 980 / 860 / 780 / 720 / 640 / 540 / 475 / 414 / 393 / 360 / 334 / 322 / 319 px and eliminated all horizontal overflow. Root-cause fix: relocated `@import 'responsive.css'` to the **last** position in `css/style.css` so its cascading overrides are no longer beaten by component sheets loaded afterwards.
  - **Overflow Hardening:** Applied `minmax(0, 1fr)` grid tracks and `min-width: 0` on flexible children wherever `auto` minimums blew layouts outward (checkout summary, cart rows, contact grid, account shell, newsletter join row, art-work titles).
  - **Navbar Overlap Band Eliminated:** Raised the mobile hamburger/drawer breakpoint from `768px` to `900px` in `css/responsive.css`, closing the ~760–899px band where the seven-link desktop nav overflowed horizontally.
  - **Touch Target Compliance:** Enlarged `.wishlist-toggle-btn` (previously an unstyled 16×21px hotspot) to a styled 44×44px circle and bumped `.stepper-btn` to 448px, meeting WCAG AA 44px tap-area guidance.
  - **Broken Cross-Page Footer Links Repaired:** Subpage footers pointed Quick Links / Categories fragments (`#home`, `#collections`, …, `#gallery`) at elements absent from those pages. Retargeted all fourteen footer links on `cart.html`, `checkout.html`, `profile.html`, and `custom-order.html` to `index.html#anchor` equivalents.
  - **Missing Mobile Menu Repair:** `order-confirmation.html` shipped a hamburger button with no backing drawer; added the missing `.mobile-drawer` markup so its menu now opens and navigates.
  - **Asset Path Consistency:** Unified stray lower-case `images/logo.png` references to the canonical capitalised `Images/logo.png` so builds hosted on case-sensitive servers resolve correctly.
  - **Accessibility Labels:** Ensured icon-only controls (search, cart, account, wishlist, drawers) carry descriptive `aria-label`s.
- **Clickable Business Contacts:** Documented that the business email (`toseefa_abrar@yahoo.com`) and phone (+92 300 1234567) are live `mailto:` / `tel:` links site-wide (sole, consistent instances).
  - **Dead Social-Icon Targets Populated:** Routed the three formerly-`#` footer social icons to `instagram.com/shah-embroidery`, `facebook.com/shah-embroidery`, and `pinterest.com/shah-embroidery` (each opening in a new tab with `rel="noopener noreferrer"`).
  - **Bank Routing Disclosure Tightened:** Swapped the speculative account/IBAN figures in the checkout *Bank Transfer* pane for an explicit "provided on your emailed invoice" disclosure, so no bystander mistakes demo numbers for routable funds.

### [2026-09-04]
- **Account Icon Navigation Bug Fix:** Resolved a regression where the navbar account/profile icon failed to redirect logged-in users to `profile.html`. Root cause was mixed use of `<button>` and `<a>` tags across pages causing inconsistent event binding. Standardized all six pages (`index.html`, `cart.html`, `checkout.html`, `order-confirmation.html`, `profile.html`, `custom-order.html`) to use `<a href="profile.html">` and refactored `js/script.js` to delegate navigation through a unified `openProfilePage()` function.
- **SEO Metadata Pass:** Added unique, page-specific `<title>` and `<meta name="description">` tags to all six HTML pages. Removed duplicate generic `<meta name="keywords">` entries. Corrected the home page title to match the specified brand format.
- **Favicon Implementation:** Generated four favicon PNG assets (`favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `favicon-192x192.png`) from `Images/Logo.png` using PowerShell's `System.Drawing` API. Added `<link rel="icon">` and `<link rel="apple-touch-icon">` references in the `<head>` of all six pages.
- **Documentation:** Updated `README.md` with the new `Images/favicon/` directory in the file tree, a new "SEO & Metadata" section (Section 9), and this change log entry.

### [2026-09-03]
- **Standalone Custom Orders:** Migrated the custom request flow from homepage/profile dialogs to `custom-order.html`, added structured request sections, category and budget choices, optional client-side reference previews, logged-in prefill, guest confirmation, and profile tracking redirect.
- **Comprehensive Form Validation:** Added field-specific validation, blur-first/live correction feedback, valid states, disabled submit buttons, password strength meters, and character counters across authentication, account, address, checkout, custom order, contact, and newsletter forms.
- **Cancellation Confirmation Modal:** Replaced native browser confirmation and alert dialogs with the site's modal overlay pattern, added the scoped `.btn-danger` style, and added responsive Go Back/Confirm Cancellation controls with success feedback.
- **User Profile & Account System:** Added mock login/signup flow, account avatar badge in navbar, authenticated profile page with five sections, localStorage persistence for users, wishlist, addresses, and account updates, and protected access logic for logged-out users.
- **Standalone Profile Page Migration:** Moved the profile experience into a dedicated [profile.html](profile.html) page, removed the duplicate homepage profile section, and updated account navigation to route logged-in users to the real page instead of toggling an in-page section.
- **Profile Management UX:** Added wishlist actions across artwork cards, saved-address management with default-address selection, order tracking cards, custom order progress views, and account settings with inline validation and confirmation messaging.
- **Checkout Integration:** Added default saved-address autofill for the checkout form when a logged-in user has a default shipping address from their account profile.
- **Documentation:** Updated the project README to document the account flow, profile sections, localStorage data model, and this feature addition in the change log.
- **Commerce Page Migration:** Moved cart, checkout, and order confirmation from homepage dialogs to `cart.html`, `checkout.html`, and `order-confirmation.html`, with shared navbar links and localStorage continuity.
- **Order History Cancellation:** Added confirmation-protected cancellation for Processing orders and persisted the Cancelled status.
- **Wishlist Navigation:** Fixed profile empty-state browse links to cross-page `index.html#gallery` navigation and renamed them to Browse Collections.

### [2026-09-02]
- **Documentation:** Created comprehensive `README.md` file establishing design system standards, component listings, file trees, functionality summaries, and developer standing rules.
- **CSS Architecture Refactoring:** Modularized monolithic stylesheet into 22 clean, single-responsibility CSS files under `css/` (`base.css`, `navbar.css`, `hero.css`, `cart.css`, `checkout.css`, `confirmation.css`, `forms.css`, `buttons.css`, etc.) imported via `style.css`.
- **Search System Enhancement:** Implemented inline expanding search bar inside header with debounced autocomplete suggestions, category grouping, regex query highlighting, keyboard navigation (`ArrowUp`/`ArrowDown`/`Enter`/`Esc`), and smooth scroll result jumping.
- **Full E-Commerce Cart & Checkout Flow:** Built modal-based shopping cart drawer, localStorage state persistence, dynamic quantity steppers, free shipping calculation, multi-step checkout form validation, payment method selector, and generated receipt confirmation modal.
- **Responsive Pass:** Fine-tuned fluid typography `clamp()`, border radius scale, shadow tokens, and mobile drawer transitions.

---
*Maintained by the Shah Embroidery & Art Development Team.*
