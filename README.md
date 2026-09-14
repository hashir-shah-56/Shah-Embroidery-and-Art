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
  - **Core:** HTML5, Modular Vanilla CSS3, Vanilla JavaScript (ES6+)
  - **Typography & Icons:** Google Fonts (`Cormorant Garamond` & `Plus Jakarta Sans`), Font Awesome 6 Free
  - **Tooling & Build System:** Google Antigravity Agentic IDE
  - **Deployment:** Netlify
- **Live URL:** [https://shah-embroidery.netlify.app](https://shah-embroidery.netlify.app) *(or active Netlify deployment)*

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

The shared `css/skeleton.css` component provides warm beige shimmer placeholders that reuse the site's `--bg-secondary`, `--border-light`, `--bg-card`, and radius tokens. It includes card, circular, gallery, testimonial, banner, cart-row, summary, profile-list, and form-choice primitives. Skeletons are used for homepage artwork/gallery/testimonial/banner surfaces, cart and checkout localStorage summaries, every profile data tab (orders, custom orders, wishlist, and saved addresses), custom-order choices, and order confirmation recap content. Dynamic containers expose `aria-busy` during their minimum 380ms loading state, image slots remain skeletonized until `load`/`error`, and `prefers-reduced-motion` disables shimmer animation.

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
    ├── product-loader.js                # Shared product card renderer & Supabase catalog loader
    ├── shop.js                          # Shop queries, URL state, skeleton loading & pagination controls
    └── custom-order.js                  # Standalone custom order form and upload preview flow
```

---

## 4. Page-by-Page / Section-by-Section Functionality

### 1. Announcement Bar
- **Description:** A top notification bar displaying brand highlights (*Handcrafted with Passion • Custom Orders Available • Worldwide Delivery*).
- **Behavior:** Static top bar with gold bullet dividers.

### 2. Navbar & Mobile Navigation Drawer
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
- The homepage's **View All Artwork** and **Explore Full Gallery** links point to `shop.html`. The static portfolio gallery remains unchanged.

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
- **Description:** Portfolio grid featuring filter buttons (*All, Hoop Art, Wall Art, Custom Portraits, Islamic Art*).
- **Interactive Behavior:** Clicking filter pills smoothly filters items using CSS opacity and transform transitions.

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
- **Description:** A dedicated request workflow organized into Contact Information, Order Details, Reference Images, Budget & Timeline, and Submit sections. Contact fields are prefilled from the active account when available.
- **Order details:** Visual choices cover Hoop Art, Wall Art, Bridal/Wedding, Islamic Calligraphy, Portrait Embroidery, and Other. Dimensions, palette, occasion, budget, timeline, and a conditional specific date complete the brief.
- **Reference images:** An optional drag-and-drop or browse zone previews selected image thumbnails locally and permits removal before submission.
- **Behavior:** Logged-in users are redirected to `profile.html#custom-orders` after submission, where the new request appears as `Inquiry Received`. Guests receive an inline confirmation while their request is stored under the guest localStorage bucket.

### 17. Artwork Quick View Modal (`#quickViewModal`)
- **Description:** Modal displaying enlarged artwork image, category badge, detailed price, and a prominent *Add to Cart* button.

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
  3. **Payment Method Selection:**
     - **Cash on Delivery (COD):** Active default for deliveries in Pakistan.
     - **Direct Bank Transfer:** Displays Meezan Bank account title, account number, and IBAN details, instructing user to share receipt on WhatsApp.
     - **Credit / Debit Card (Pay Online):** Simulated gateway interface with card number and CVC fields (placeholder for future gateway SDK).
  4. **Read-Only Order Summary Sidebar:** Live itemized recap, shipping status, and estimated total price.
- **Validation:** Validates required fields, phone numbers, and email format before processing.

### 20. Order Confirmation Modal (`#confirmationModal`)
- **Description:** Post-checkout modal featuring a green success checkmark badge, generated Order ID (`#SE-XXXXX`), full receipt breakdown card, customer shipping address, payment method instructions, email confirmation notice, and a *Return to Homepage* CTA button.

---

## 5. Functionality & Feature List

- [x] **Shopping Cart Persistence:** Cart state saved automatically in `localStorage` under `shah_cart`.
- [x] **Dynamic Quantity Steppers:** Increment, decrement, or remove items with automatic subtotal updates.
- [x] **Cart Badge Counter:** Real-time badge counter on navbar with bounce animation on item updates.
- [x] **Inline Expanding Search:** Search input with 250ms debounce, live suggestions dropdown, regex query highlighting, and smooth scroll to target artwork.
- [x] **Search Keyboard Navigation:** Navigate suggestions using `ArrowUp`, `ArrowDown`, select with `Enter`, or dismiss with `Escape`.
- [x] **Quick View Modal:** Inspect artwork details in modal overlay and add directly to cart.
- [x] **Guest Cart Access:** Guests can add items from artwork cards and Quick View, adjust quantities, view the cart, and use wishlist hearts without authentication.
- [x] **Double-Click Add to Cart:** Quick shortcut to add artwork cards directly to cart (desktop double-click; single tap on touch devices, with success toast).
- [x] **Gallery Category Filtering:** Animated tab filter for portfolio items.
- [x] **Standalone Custom Order Form:** Dedicated custom-order page with category cards, optional budget/timeline choices, client-side reference previews, and localStorage-backed submission.
- [x] **Checkout Form Validation:** Real-time client-side validation for required fields, email format, and phone inputs.
- [x] **Payment Method Toggling:** Interactive selection between COD, Direct Bank Transfer (Meezan Bank details), and Mock Card Online Payment.
- [x] **Order Receipt Generation:** Automatic generation of order ID `#SE-XXXXX`, receipt card breakdown, and date stamping in `localStorage` (`shah_last_order`).
- [x] **Scroll Reveal Animations:** `IntersectionObserver`-powered fade-in-up animations for cards and sections.
- [x] **Standalone Cart, Checkout & Confirmation:** Cart, checkout, and order confirmation now use dedicated pages backed by the shared localStorage flow.
- [x] **Checkout Authentication:** Only Proceed to Checkout, checkout submission, and direct checkout visits require an active login session; the guest cart remains intact through authentication.
- [x] **Order Cancellation:** Processing orders can be cancelled from expanded Order History details after confirmation; cancelled orders are persisted and no longer show the action.
- [x] **Profile Wishlist Navigation:** Empty wishlist, order, and custom-order states link back to `index.html#gallery` with the label `Browse Collections`.
- [x] **Custom Order Request Page:** The custom-order page validates required contact/order details, supports optional reference image previews, and shares request records with profile tracking.
- [x] **Skeleton Loading States:** Shared warm skeletons cover dynamic/localStorage content and slow-loading images across homepage, cart, checkout, profile, custom-order, and confirmation pages with accessible busy states and reduced-motion support.

---

## 6. Known Limitations / Not Yet Implemented

> [!WARNING]
> **CURRENT FRONT-END SCOPE & GAPS**
> 1. **Partial Database Integration:** Supabase powers Featured products. Gallery items remain in HTML, while accounts, carts, and orders still use browser `localStorage`.
> 2. **Simulated Payment Gateway:** The *Pay Online (Credit / Debit Card)* option is currently a mock UI placeholder. Real transaction processing via gateways (e.g., JazzCash, Easypaisa, PayFast, Stripe) is not yet integrated.
> 3. **No Live Email Dispatch:** The email receipt notification notice on the confirmation modal is a client-side simulation. No automated transactional emails (SMTP / SendGrid) are sent.
> 4. **Manual Bank Verification:** Direct Bank Transfer requires manual verification by having the user send their payment screenshot via WhatsApp.
> 5. **Inventory Limits:** Featured products are filtered by Supabase `in_stock`; checkout does not reserve or decrement stock.
> 6. **Reference Image Storage:** Custom-order reference files are previewed locally and only their filenames are stored. Persistent file uploads require backend storage.
> 7. **Routing Numbers Issued Off-Invoice:** The *Bank Transfer* pane discloses the recipient bank/title upfront but defers the account number and IBAN to the emailed invoice (deliberately avoiding broadcasting routable figures publicly). Wire the studio's real collection details into `checkout.html` when ready to automate.
> 8. **Social Profiles Point to Handle Slugs:** Footer social icons link to `instagram.com/shah-embroidery`, `facebook.com/shah-embroidery`, and `pinterest.com/shah-embroidery`. Confirm these slugs map to the studio's live profiles (handles assumed from owner-provided slug).
> 9. **Font Fallbacks in Effect:** Declared webfonts (Cormorant Garamond / Plus Jakarta Sans) are not bundled or hot-linked; browsers silently fall back to Georgia / system sans-serif. Load the families (self-host or Google Fonts) to activate the intended typography.
> 10. **Product Loading Fallback:** Featured cards retain their hardcoded content if the Supabase query fails or returns no rows.

---

## 7. User Accounts, Login / Signup & Profile System

### Mock Auth Flow
- **Navigation access:** A circular account button sits beside the cart icon in the main navbar. When no user is active, it opens the login/signup modal. When a user is logged in, it changes to a first-letter avatar badge and opens the profile page instead.
- **Form UX:** The modal initially presents the login form, with a toggle to switch to the signup form without showing both states simultaneously. Inline validation covers required fields, email format, and password confirmation matching.
- **Storage model:** User records are stored in `localStorage` under `shah_users` and the active session is stored under `shah_current_user`. Passwords are never saved in plain text in the frontend; the mock system hashes them client-side only for demo behavior, and the comment in the code documents that real server-side hashing and authentication must be implemented once the PHP/MySQL backend exists.
- **Session behavior:** Logging out clears the current session only. The saved wishlist, order history, and addresses remain in `localStorage` so the next login restores the same account data.

### Profile Page Structure
- **Five sections:** Order History, Custom Order Tracking, Wishlist, Saved Addresses, and Account Settings.
- **Section switching:** All tabs are JavaScript-driven and keep a single active section visible without page reloads.
- **Responsive pattern:** On desktop the page uses a left sidebar; below `768px` the tabs become a scrollable horizontal row.
- **Account management:** Users can update their name, email, phone, and password in the mock settings form and receive a success toast without reloading the page.
- **Order cancellation:** Orders with `Processing` status expose a `Cancel Order` action. The action opens a custom modal confirmation with `Go Back` and `Confirm Cancellation` controls. Confirmed cancellation is stored under `shah_orders`, immediately changes the status to `Cancelled`, hides the action, and shows a success toast.

### Standalone Commerce Pages
- **Cart:** `cart.html` renders the shared `shah_cart` items, quantity controls, totals, and empty state for guests and logged-in users. Its Proceed to Checkout action requires login before opening `checkout.html`.
- **Checkout:** `checkout.html` requires an active login session before rendering the checkout flow. Guests are redirected to `cart.html`, where the existing login/signup modal opens; successful authentication returns them to checkout with the same `shah_cart` contents.
- **Confirmation:** `order-confirmation.html` renders the latest `shah_last_order`; placing an order clears `shah_cart` before redirecting there. Orders remain associated with the authenticated customer session.

## Form Validation

All forms validate fields on blur first, then validate on each keystroke after an error is shown. Invalid fields receive a red border and specific inline guidance; corrected fields receive a muted green valid state. Submit buttons remain muted until required fields are valid, and submit attempts recheck every field and focus the first invalid field.

- **Names:** Required where used, at least 2 characters, and limited to letters, spaces, hyphens, and apostrophes.
- **Email:** Required where used and checked against a complete `name@domain.tld` pattern; values are trimmed and compared case-insensitively. Signup also rejects registered email addresses.
- **Passwords:** Signup and password changes require at least 8 characters, one uppercase letter, one lowercase letter, and one number. Live Weak/Medium/Strong strength meters and exact confirmation matching are provided.
- **Phone:** Accepts common spaces, dashes, parentheses, and a leading plus sign, with 10 to 15 underlying digits.
- **Addresses:** Street addresses require at least 5 characters, cities at least 2 characters, and postal codes require 5 digits for Pakistan or 4 to 6 digits internationally.
- **Order and contact text:** Custom order descriptions and contact messages require 10 to 500 characters and show live counters.
- **Newsletter:** Requires a valid email address with the same inline feedback and disabled-submit behavior.

### Stored Data Notes
- **Orders:** Order records are stored under `shah_orders` and linked to the active user’s email when available.
- **Custom requests:** Custom order inquiries are stored under `shah_custom_order_requests` keyed by user email.
- **Wishlist:** Each email key stores an array of wishlist items in `shah_wishlist`.
- **Saved addresses:** Address collections are stored under `shah_saved_addresses` keyed by user email, with one default address selectable for reuse in checkout.

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
2. **Backend & Database Migration (PHP / MySQL via XAMPP):**
   - Create dynamic MySQL tables for `products`, `categories`, `orders`, `order_items`, and `customers`.
   - Build a PHP REST API to handle cart verification, order submission, and payment webhooks.
3. **Admin Dashboard Extensions:**
   - Product management is implemented in the unlisted Supabase admin pages. Future work: custom order inquiries and fulfillment status management (*Pending, Processing, Shipped, Completed*).
4. **Transactional Email Service:**
   - Integrate PHPMailer / SendGrid API to automatically send order confirmation receipts and tracking links to customer emails.
5. **WhatsApp One-Click Order Direct Link:**
   - Add a button allowing customers to send pre-formatted order details directly to Shah Embroidery's official WhatsApp number.

---

## Database (Supabase)

The `products` table powers the Latest Work section on `index.html`. `js/product-loader.js` fetches up to six rows with `in_stock=true`, newest first. The legacy `is_featured` column remains in Supabase for compatibility but is not used by the homepage, shop, or admin UI.

Credentials live in `js/supabase-client.js`; real values must not be committed to any public repository.

## Admin Dashboard

- `admin-login.html` and `admin.html` are unlisted pages accessed directly by URL, never linked in public navigation. Layout lives in `css/admin.css`; behavior is isolated in `js/admin.js`.
- Uses real Supabase email/password Auth and the existing shared client, separate from customer mock login. No signup form exists. The dashboard stays hidden until the session and server-validated owner identity pass. `js/admin-config.js` holds only the owner's public Auth UUID.
- Supports adding, editing, cancelling edits, and confirmation-protected deletion. All products, including out-of-stock rows, are accessible in a compact table with 25 rows per page. New in-stock products appear in Latest Work on the homepage's next load.
- Images upload to the public `product-images` Storage bucket under unique owner-scoped paths. JPG/PNG/WebP extension, MIME type, file signature, and a 5 MB maximum are checked before upload. Editing without a new image retains its URL. Failed saves retain data and reuse completed uploads on retry.
- Apply `supabase/admin-security.sql` once in the Supabase SQL Editor. It adds owner-only restrictive write policies alongside existing product policies, a Storage upload policy, and bucket file limits. Public product SELECT remains unchanged. **The SQL is supplied for setup; creating this file does not apply it to Supabase.** Existing authenticated-only policies do not enforce owner-only API access.
- Disable **Allow new users to sign up** in Supabase Auth settings (and anonymous sign-ins if enabled). Existing owner login continues to work. Never put passwords or service-role keys in frontend files or this README.
- After a successful product row deletion, the dashboard removes its associated image from this project's `product-images` Storage bucket. Empty, malformed, external, or other-project URLs are skipped. Storage errors are logged to the console without changing the successful product deletion or toast. Add/Edit flows are unchanged; replaced or abandoned uploads and failed cleanup may still require manual review.
- Apply `supabase/admin-storage-cleanup.sql` in the Supabase SQL Editor to grant the owner Storage SELECT and DELETE permissions. Existing restrictive guards remain in force. This supplement is safe to rerun and does not change product or public-read policies.
- Client checks control page visibility; Supabase RLS enforces data authorization. Keep catalog data trusted and protect the shared site origin against XSS.
- Verification: `node tests/admin-browser.cjs` runs isolated browser checks with mocked Supabase responses for authentication, CRUD, file validation, failure recovery, pagination, and layout. It requires Playwright and Chrome; set `PLAYWRIGHT_MODULE` if Playwright is installed outside this project. `tests/admin-live.cjs` is an opt-in live test requiring a local server at port 4173, applied policies, and manual owner sign-in; it creates/edits/deletes a uniquely named test product. The test verifies the uploaded object exists before deletion and is absent afterwards, and checks deletion of rows with empty or external image URLs.
- Validation on 2026-09-10: live login, upload, product creation, public homepage visibility, price update, deletion, and logout passed. The test confirmed the uploaded Storage object existed before deletion and was absent afterwards, and the product row disappeared from the dashboard and public query. Empty-image and external-image test rows deleted without Storage removal requests. The previous interrupted test row was also removed. The mocked suite passed cleanup URL parsing, null/malformed/foreign URLs, Storage error/exception handling, and stale-image checks. No JavaScript runtime errors occurred. Server-side rejection of other authenticated accounts has not been independently verified.
- Validation on 2026-09-14: admin browser regression passed with no Is Featured form control. The live homepage request was `in_stock=eq.true&order=created_at.desc&limit=6`, contained no `is_featured` filter, rendered without runtime errors, and returned the current newest in-stock catalog result.

## 11. Change Log

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
- **Clickable Business Contacts:** Documented that the business email (`info@shahembroidery.com`) and phone (+92 300 1234567) are live `mailto:` / `tel:` links site-wide (sole, consistent instances).
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
