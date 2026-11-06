# Campus Resource Sharing

A modern, responsive, functional college web application prototype designed for students to share, lend, borrow, and discover essential academic and campus resources (textbooks, scientific calculators, lab equipment, engineering drafters, electronics, and sports gear) within their campus community.

> **Academic Demonstration Prototype**: This project is built as a functional prototype for demonstration and evaluation. It prioritizes reliable functionality, a clean dark-themed user experience, realistic Indian college demo data (with INR ₹ pricing), and an honest prototype implementation.

---

## 1. Key Features

### 🌟 Professional Dark-Themed User Interface
- **Palette**: Deep charcoal/near-black background (`#090d14`), elevated panels (`#101622`), subtle borders (`#1e293b`), crisp white text (`#f8fafc`), and restrained cyan/teal accents (`#06b6d4`).
- **Responsive Layout**: Optimized for desktop, tablet, and mobile viewports.
- **Accessible & Clean**: High-contrast typography, visible focus rings, no distracting animations or excessive glowing gradients.

### 🏠 Landing Page
- **Hero Banner**: *"Share More. Spend Less. Campus Together."* with clear primary (*Explore Resources*) and secondary (*Get Started*) CTAs.
- **Featured Resource Preview**: Curated preview showcasing books, calculators, laptops, and lab gear with live pricing.
- **How It Works**: 3-step structured guide (*Discover*, *Request*, and *Share*).
- **Illustrative Campus Statistics**: Verified showcase metrics (180+ resources, ₹1.4L+ student savings, 450+ exchanges, 14 campus departments).
- **Prototype Disclaimer Footer**: Clearly demarcated demo guidelines and quick links.

### 🔐 Authentication Prototype
- **Demo Student & Admin Logins**: Pre-configured credentials with 1-click demo login buttons.
- **Registration Form**: Student name, college email (`@campus.edu`), password, department selection, and academic year.
- **Protected Views**: Dashboard and activity management require login.
- **Honest Prototype Security**: Clearly documented demo session handling without storing real personal data.

### 📚 Resource Marketplace (Explore Resources)
- **6 Categories**:
  - *Books and Notes*
  - *Electronics*
  - *Lab Equipment*
  - *Stationery*
  - *Sports Equipment*
  - *Other*
- **Search & Filter Controls**:
  - Real-time keyword search across title, description, and lender name.
  - Category pill filter.
  - Availability filter (*All*, *Available Now*, *Free to Borrow*, *Currently Borrowed*).
  - Sorting by *Price: Low to High*, *Price: High to Low*, *Newest Listed*, and *Alphabetical (A-Z)*.
- **Resource Details Modal**:
  - Full item specifications, condition, campus pickup point, and lender profile.
  - Interactive duration slider (1 to 30 days).
  - Real-time INR (₹) rental calculation (`Daily Price × Requested Days`).
  - Validation against requesting own items or unavailable items.

### 🔄 End-to-End Borrowing Workflow
- **Lifecycle Transitions**:
  `Available` → `Request Pending` → `Approved` → `Borrowed` → `Returned`
  *(with Cancellation and Rejection where appropriate)*.
- **Anti-Duplication**: Prevents a student from submitting duplicate active requests for the same item.
- **Automatic Availability Updates**: Approving/borrowing an item updates its status across the marketplace; returning an item automatically resets it to `Available`.

### ➕ List a Resource Form
- Add new items with title, category, condition (*Like New*, *Good*, *Fair*), daily rental price in INR (or checkbox for *Free Sharing*), campus pickup location, description, and borrowing terms.
- Newly listed resources immediately appear in the marketplace and the student's *My Listings* tab.
- Edit and delete listing capabilities (with protection against deleting items with active borrows).

### 📊 Student Dashboard & Activity Management
- Personalized welcome banner with student department and roll email.
- Real-time metrics: Available resources on campus, active borrow requests, listed items, and community savings.
- **Incoming Requests Panel**: Student lenders can directly review, approve, or reject requests made by peers for their items.
- **My Requests Tab**: Track requested items, days, total rental cost in INR, current status, and cancel or mark returned.
- **My Listings Tab**: View listed items, availability, edit details, or remove listings.

### 🛡️ Administrator Console
- Switch to Admin Demo (`Dr. S. K. Raman - Dean of Student Affairs`).
- Overview of all resources, campus-wide borrow requests, and registered student accounts.
- Administrative controls to approve/reject requests and remove damaged/inappropriate listings.
- **One-Click Reset Demo Data**: Instantly resets the prototype back to the 16 original clean seed records.

---

## 2. Technology Stack

- **Frontend**: React 19, Vite 8, Lucide React icons, and a custom dark-themed CSS design system (`index.css`).
- **Backend**: Node.js v24+, Express 4, CORS.
- **Data Persistence**: Safe local JSON storage (`server/src/data/db.json`) initialized from seed data (`server/src/data/seed.json`), with in-memory caching and automatic file sync.
- **Routing**: Clean stateful view manager with URL hash synchronization (`#explore`, `#dashboard`, `#activity`, `#admin`) ensuring direct browser refreshing and back/forward navigation work reliably.

---

## 3. Demo Accounts & Credentials

Use the **"Try Demo"** dropdown in the top navigation bar for 1-click access, or log in manually with the following credentials:

| Role | Name | Department / Title | Email | Password |
|---|---|---|---|---|
| **Student** | Aarav Sharma | Computer Science (3rd Year) | `aarav@campus.edu` | `password123` |
| **Student** | Priya Patel | Electronics & Comm (4th Year) | `priya@campus.edu` | `password123` |
| **Student** | Vikram Malhotra | Mechanical Engg (2nd Year) | `vikram@campus.edu` | `password123` |
| **Student** | Ananya Iyer | Biotechnology (3rd Year) | `ananya@campus.edu` | `password123` |
| **Administrator** | Dr. S. K. Raman | Dean of Student Affairs | `admin@campus.edu` | `adminpassword` |

---

## 4. Setup and Running Instructions (Windows PowerShell)

### Prerequisites
- Node.js (v18 or higher recommended; verified with v24.21.0)
- npm (v9 or higher; verified with v11.19.0)

### Method A: Single Command Start (Recommended)

1. Open PowerShell and navigate to the project directory:
   ```powershell
   cd C:\Users\user121\.gemini\antigravity\scratch\campus-resource-sharing
   ```

2. Run the start-all script:
   ```powershell
   node start-all.js
   ```
   *(Or run `npm start`)*

3. Open your browser and navigate to:
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### Method B: Separate Terminal Windows

If you prefer viewing server and client logs in separate terminal windows:

#### Terminal 1 — Start Backend Server:
```powershell
cd C:\Users\user121\.gemini\antigravity\scratch\campus-resource-sharing\server
node src/server.js
```
The server will start on port `5000`.

#### Terminal 2 — Start Frontend Client:
```powershell
cd C:\Users\user121\.gemini\antigravity\scratch\campus-resource-sharing\client
npm run dev
```
The client will start on port `5173` with Vite's proxy forwarding `/api` calls to port `5000`.

---

## 5. Testing Major Workflows

### Workflow 1: Exploring & Filtering Resources
1. Open [http://localhost:5173](http://localhost:5173) and click **"Explore Resources"** on the landing page or navbar.
2. Type `Casio` in the search box — notice the Casio Scientific Calculator appears instantly.
3. Click the **"Books and Notes"** category pill — only engineering textbooks and GATE materials are displayed.
4. Select **"Free to Borrow"** from the availability dropdown — see free items (such as the Lab Apron and DSA notes).
5. Sort by **"Price: Low to High"** — see listings ordered from free (₹0) to premium items.

### Workflow 2: Requesting to Borrow an Available Resource
1. From the marketplace, click **"Request"** on any available item (e.g. *Higher Engineering Mathematics* at ₹15/day).
2. If not logged in, the login modal will prompt you. Click **"Student: Aarav (CSE)"** for instant login.
3. In the details modal, adjust the duration slider to **5 days**.
4. Observe the automatic live calculation: `₹15 × 5 days = ₹75`.
5. Enter a brief note for the lender and click **"Confirm Request • ₹75"**.
6. The request is submitted in `Request Pending` status and appears in **My Requests**.

### Workflow 3: Lender Approving Incoming Requests
1. Log in as **Priya Patel** (`priya@campus.edu` / `password123`) or **Aarav Sharma**.
2. Go to **Dashboard** (`#dashboard`).
3. Under **"Incoming Requests on My Items"**, locate the pending request.
4. Click **"Approve"**. The status changes to `Approved / Ready` and the item availability is updated.
5. When the student picks up the item on campus, click **"Mark Handed Over"** to transition to `Borrowed`.

### Workflow 4: Returning an Item
1. Go to **My Requests & Listings** (`#activity`).
2. On any borrowed item, click **"Mark Returned"**.
3. The request transitions to `Returned` and the resource availability automatically resets back to `Available` in the campus marketplace.

### Workflow 5: Listing a New Resource
1. Click **"+ List an Item"** in the navigation bar.
2. Enter:
   - Title: `Arduino Sensor Expansion Shield`
   - Category: `Electronics`
   - Condition: `Like New`
   - Daily Rental Rate: `₹30`
   - Pickup Location: `IoT Lab Room 204`
3. Click **"Publish to Marketplace"**.
4. Navigate to **Explore Resources** — the new listing appears immediately at the top of the catalog.

### Workflow 6: Administrative Review & Demo Reset
1. Click **"Try Demo"** → **"Admin Demo"** (or log in with `admin@campus.edu`).
2. Navigate to **Admin Dashboard** (`#admin`).
3. View all campus requests, browse the inventory, and inspect the student directory.
4. Click **"Reset Demo Data"** anytime to restore the 16 clean seed records.

---

## 6. Project Directory Structure

```
campus-resource-sharing/
├── package.json                   # Root package definition & scripts
├── start-all.js                   # Node runner that spawns both server & client
├── README.md                      # Comprehensive project documentation
├── server/
│   ├── package.json               # Backend dependencies (express, cors)
│   ├── test-suite.js              # 21-point automated integration test suite
│   └── src/
│       ├── server.js              # Express app, middleware, & port listener
│       ├── db.js                  # Safe JSON DB engine, query helpers, & transitions
│       ├── data/
│       │   ├── seed.json          # 16 realistic college resources & seed requests
│       │   └── db.json            # Active JSON storage (created on run)
│       └── routes/
│           ├── auth.js            # Login, registration, & demo accounts
│           ├── resources.js       # Marketplace CRUD, filters, & search
│           ├── requests.js        # Borrow request lifecycle & validation
│           └── stats.js           # Campus metrics & reset handler
└── client/
    ├── index.html                 # HTML shell with SVG favicon & meta tags
    ├── package.json               # React 19, Vite 8, Lucide React
    ├── vite.config.js             # Vite config with backend proxy on /api
    └── src/
        ├── main.jsx               # React entry point
        ├── App.jsx                # Main application & hash router
        ├── index.css              # Dark-themed custom design system
        ├── context/
        │   └── AuthContext.jsx    # Session management & demo account switcher
        ├── services/
        │   └── api.js             # Unified REST API client
        ├── components/
        │   ├── Navbar.jsx         # Sticky navigation with quick demo switcher
        │   ├── Footer.jsx         # Prototype disclaimer & navigation links
        │   ├── CategoryIcon.jsx   # Theme-matched SVG icons & status badges
        │   ├── ResourceCard.jsx   # Marketplace item card
        │   ├── ResourceDetailsModal.jsx # Detail view, terms, & INR calculator
        │   ├── ListResourceModal.jsx    # Add / Edit resource form
        │   └── AuthModal.jsx      # Login / Register with demo credentials
        └── views/
            ├── LandingPage.jsx    # Hero, stats, preview, & How It Works
            ├── ExploreResources.jsx # Search, filters, sort, & catalog grid
            ├── StudentDashboard.jsx # KPI tiles, incoming requests, & borrows
            ├── MyActivity.jsx     # Tabbed view for My Requests & My Listings
            └── AdminDashboard.jsx # Admin management & demo reset
```

---

## 7. Automated Test Verification Results

The automated integration test suite (`server/test-suite.js`) executes 21 assertions against the running backend server:

```
--- Starting Campus Resource Sharing Test Suite ---
  [PASS] Backend API health check responds with ok
  [PASS] Demo student login succeeds
  [PASS] Demo admin login succeeds
  [PASS] Invalid password rejected with 401
  [PASS] Seed resources loaded (found 16)
  [PASS] Search filter finds Casio calculator
  [PASS] Category filter correctly isolates Books & Notes
  [PASS] Free availability filter isolates items with dailyPrice 0
  [PASS] Student can list a new resource
  [PASS] New listing appears immediately in marketplace search
  [PASS] Borrow request created in pending state
  [PASS] INR calculation verified: 4 days * ₹25 = ₹100 (expected ₹100)
  [PASS] Duplicate active borrow request correctly rejected with 400
  [PASS] Owner successfully approves pending request
  [PASS] Handover transitions status to borrowed
  [PASS] Attempt to borrow unavailable/borrowed item blocked with 400
  [PASS] Returning item transitions status to returned
  [PASS] Resource availability automatically resets to Available after return
  [PASS] Resource listing removed after test
  [PASS] Stats totalResources count verified
  [PASS] Stats registeredStudents count verified

--- Test Suite Complete: 21 Passed, 0 Failed ---
```

---

## 8. Implemented Features & Known Limitations

### Implemented Features
- [x] High-contrast professional dark-themed interface with cyan accents from the first screen.
- [x] Complete landing page with hero, statistics, featured previews, and 3-step process.
- [x] 16 realistic college demo resources across 6 categories with INR (₹) rates.
- [x] Full search, category filter pills, availability filters, and sorting.
- [x] Full request lifecycle: `Available` → `Pending` → `Approved` → `Borrowed` → `Returned`.
- [x] Direct peer-to-peer lender approval and rejection on the student dashboard.
- [x] Active borrow request prevention on unavailable items and duplicate prevention.
- [x] Resource listing form with validation and edit/delete controls.
- [x] Accurate rental cost calculation (`dailyPrice * days`).
- [x] Administrator console for moderation and data reset.
- [x] Hash navigation preventing page breaks on reload.

### Known Limitations & Intentional Shortcuts
- **Authentication**: Uses a simplified session identifier stored in `localStorage` rather than cryptographic JWT tokens with HTTPS cookie rotation.
- **Payments**: No real payment gateway (Stripe/Razorpay) is integrated; costs are calculated in INR for simulated hand-to-hand student exchange.
- **Notifications**: In-app state notifications and alerts are used instead of external SMTP email or SMS gateways.
- **Data Persistence**: Uses local file-backed JSON (`db.json`) rather than a full cloud database like PostgreSQL or MongoDB to ensure zero external setup friction on standard Windows laptops.
