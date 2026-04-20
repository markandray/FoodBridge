# 🌉 FoodBridge

> Connecting restaurants with surplus food to NGOs who distribute it to people in need — in real time, in your city.

FoodBridge is a full-stack React web application built to reduce food waste and strengthen community food distribution across Indian cities.

---

## 📸 Screenshots

| Landing Page | Restaurant Dashboard | NGO Browse Listings |
|---|---|---|
| *(add screenshot)* | *(add screenshot)* | *(add screenshot)* |

| Post Food Form | Claimed Pickups | Donation History |
|---|---|---|
| *(add screenshot)* | *(add screenshot)* | *(add screenshot)* |

---

## 🎯 The Problem

India wastes approximately **68.8 million tonnes** of food every year while **189 million people** face hunger. Most of this waste happens at the last mile — restaurants with unsold cooked food, no easy way to donate it, and NGOs with no visibility into what's available nearby.

FoodBridge solves the coordination problem with a real-time, two-sided platform.

---

## ✨ Features

### For Restaurants
- Post surplus food listings with quantity, expiry time, and pickup window
- Upload photos to attract NGOs faster
- See which NGOs have claimed listings in real time
- Mark pickups as complete to confirm food delivery
- Track cumulative donation history and impact stats
- Dashboard showing live listing status breakdown

### For NGOs
- Browse available food listings filtered by city in real time
- Claim listings with one click — restaurant is notified instantly
- View active claimed pickups with live countdown timers
- Cancel claims if needed (listing returns to available pool)
- Track pickup history (completed and cancelled) in tabbed view
- Dashboard with city-matched food availability snapshot

### Both Roles
- Animated impact counters (kg donated, meals served, pickups completed)
- Activity feed with relative timestamps
- Role-based routing — NGOs can never access restaurant pages, and vice versa
- Toast notifications for every action
- Fully responsive — mobile, tablet, desktop

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 |
| Build tool | Vite |
| Routing | React Router v6 (`createBrowserRouter`) |
| Styling | Tailwind CSS |
| Backend / Database | Firebase Firestore (real-time) |
| Authentication | Firebase Auth (email/password) |
| File storage | Firebase Storage (listing photos) |
| Icons | Lucide React |
| Deployment | Vercel |

---

## ⚛️ React Concepts Used

This project demonstrates every major React concept:

**Core**
- `useState` — form fields, filter state, modal toggles, tab state
- `useEffect` — Firestore real-time listeners with cleanup, auto-dismiss timers, scroll restoration
- Props and component composition — ListingCard, StatsCard, Badge, etc.
- Conditional rendering — loading/error/empty states, role-based UI
- Lists and keys — listing grids, history tables, activity feeds

**Intermediate**
- Lifting state up — filter state in BrowseListings, lifted from ListingFilters
- Controlled components — every form in the app
- React Router v6 — all routing, nested routes, redirects, `useLocation`, `useNavigate`
- Context API — `AuthContext` (auth state), `ToastContext` (notifications)

**Advanced**
- `useReducer` — listing state machine in `useListings.js`
- `useMemo` — filtered listings, computed stats, activity feed merge+sort
- `useCallback` — stable handler references for memoized children
- `useRef` — form focus management, scroll restoration, countdown timer
- `React.lazy + Suspense` — every page component is code-split
- `React.memo` — ListingCard, StatsCard, ListingGrid, ImpactCounter
- Class component — ErrorBoundary (only place a class component is justified)

---

## 📁 Project Structure

```
src/
├── components/
│   ├── common/        # Button, Input, Badge, Spinner, Toast, Modal, EmptyState,
│   │                  # SkeletonCard, ErrorBoundary
│   ├── listings/      # ListingCard, ListingForm, ListingGrid, ListingFilters
│   ├── dashboard/     # StatsCard, ActivityFeed, ImpactCounter
│   └── layout/        # Navbar, Sidebar, Footer, ProtectedRoute
├── pages/
│   ├── Landing, Login, Signup, NotFound
│   ├── restaurant/    # Dashboard, PostFood, ManageListings, DonationHistory
│   └── ngo/           # Dashboard, BrowseListings, ClaimedPickups, PickupHistory
├── hooks/             # useAuth, useListings, usePickups, useImpact,
│                      # useDebounce, useToast, useScrollRestoration
├── context/           # AuthContext, ToastContext
├── services/          # firebase, auth.service, listings.service,
│                      # pickups.service, impact.service
└── utils/             # constants, validators, dateHelpers
```

---

### Required Firestore Indexes
Create these composite indexes in Firestore → Indexes:

| Collection | Fields | Order |
|---|---|---|
| `listings` | `restaurantId`, `createdAt` | ASC, DESC |
| `pickups` | `ngoId`, `claimedAt` | ASC, DESC |
| `pickups` | `restaurantId`, `claimedAt` | ASC, DESC |
| `pickups` | `listingId`, `status` | ASC, ASC |

---



## 🔒 Security

- Firebase Auth for identity management
- Firestore security rules enforce role-based access at the database level
- Environment variables for all sensitive keys
- Security headers via `vercel.json` (X-Frame-Options, X-Content-Type-Options)
- `.env` excluded from Git via `.gitignore`

---

## 👨‍💻 Author : markandray

Built as a portfolio project demonstrating production-grade React architecture.
