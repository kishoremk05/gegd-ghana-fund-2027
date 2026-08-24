# GEGD 2027 Exhibition Marketplace - Implementation Phases

This document outlines the detailed step-by-step implementation phases to transition the current frontend mockups into a fully functional, production-ready digital marketplace platform for the **Ghana Economic Growth & Development Week (GEGD 2027)**.

---

## 📋 Phase 1: Database Setup & Infrastructure (Supabase Backend)
Setting up the backend infrastructure and database schema using Supabase to manage the state of the 480 stands and register bookings, payments, and users.

### Tasks:
1. **Initialize Supabase Project**: Set up database instances and configure local environment variables (`.env.local`).
2. **Design Database Schema**:
   * `stands`: Real-time state of each stand (ID, block, status, area, price, coordinates `x, y, w, h`, industry, exhibitor_id).
   * `bookings`: Application data containing Company Info, Authorized Contact details, and Stand selection.
   * `payments`: Tracking records of $1,000 reservation fees and final balances (status, amount, gateway_reference, transaction_type).
   * `visitors`: Registrations for general visitors.
   * `buyers`: Profiles for the B2B buyer programme, including matchmaking tags.
3. **Database Security & Policies (RLS)**:
   * Write Row Level Security (RLS) policies allowing public reads for available stands.
   * Restrict booking and payment creation/viewing to the respective users or admin staff.

---

## 🔌 Phase 2: Floor Plan Real-Time Synchronization
Transition the interactive floor plan from reading static mock data in `stands.ts` to fetching real-time database state from Supabase, enabling multi-user concurrency.

### Tasks:
1. **Supabase Client Setup**: Create a centralized Supabase configuration helper `src/lib/supabase.ts`.
2. **Fetch Dynamic Stand Data**:
   * Refactor [stands.ts](file:///c:/fiverr%20projects/gegd-ghana-fund-main/src/data/stands.ts) and [FloorPlan.tsx](file:///c:/fiverr%20projects/gegd-ghana-fund-main/src/components/sections/FloorPlan.tsx) to query the Supabase database.
3. **Implement Real-Time Subscriptions**:
   * Add active Supabase database channel subscriptions to listen for `UPDATE` events on the `stands` table.
   * Instantly update stand color indicators on the floor plan when another user reserves or confirms a stand, preventing double-booking conflicts.

---

## 📝 Phase 3: Interactive Booking Pipeline Integration
Turn the visual stepper in `BookingPreview.tsx` into a functional wizard that validates inputs and securely inserts applications into the database.

### Tasks:
1. **State & Validation Management**:
   * Upgrade [BookingPreview.tsx](file:///c:/fiverr%20projects/gegd-ghana-fund-main/src/components/sections/BookingPreview.tsx) with a form state library (e.g., React Hook Form) and validation schema (e.g., Zod).
   * Ensure user inputs for all 4 steps (Company Info, Authorized Contact, Exhibition Info, Stand Selection) are validated.
2. **Stand Lock & Reserve Workflow**:
   * When a stand is selected and booking is submitted, create a database transaction:
     * Check if the stand is still `available`.
     * If yes, insert a new record into `bookings` and temporarily update the stand status to `reserved` (locked with a 15-minute expiration timer).
     * If no, prompt the user to choose another stand.

---

## 💳 Phase 4: Payment Gateways & Automated Invoicing
Incorporate secure online and offline payment collection flows to verify reservation fees and manage invoice balances.

### Tasks:
1. **Online Payment Gateways**:
   * Integrate payment providers focused on Ghana and international transactions (e.g., **Paystack** or **Flutterwave** API hooks).
   * Accept Mobile Money (MTN, Telecel, AT), Cards (Visa, Mastercard), and Bank Transfers.
2. **Offline Payment Tracking**:
   * Allow users opting for SWIFT/Wire transfer to upload proof of payment in the checkout screen.
3. **Automated PDF Invoice Generation**:
   * Generate an automated PDF invoice detailing the stand selection, total price, $1,000 deposit paid, and outstanding balance due before 1 November 2026.
   * Deliver invoices automatically to the authorized contact via integration with an email API (e.g., Resend or SendGrid).

---

## 🤝 Phase 5: Buyer Programme & B2B Matchmaking
Build matching systems to connect registered buyers/investors directly with corresponding manufacturers and technology exhibitors.

### Tasks:
1. **Expand Registrations**:
   * Connect [VisitorRegistration.tsx](file:///c:/fiverr%20projects/gegd-ghana-fund-main/src/components/sections/VisitorRegistration.tsx) to save data to the `visitors` and `buyers` tables.
2. **Matchmaking Engine**:
   * Build a lightweight backend matching engine that compares buyer interest tags with exhibitor industry sectors.
   * Provide buyers with pre-recommended exhibitor checklists in their dashboard.

---

## 🔑 Phase 6: Administrator Dashboard (GEGD Secretariat Portal)
Develop a secure back-office admin area for the GEGD Secretariat to monitor metrics, approve payments, and manage reservations.

### Tasks:
1. **Secretariat Auth Setup**: Set up admin role verification in Supabase Auth.
2. **Management Controls**:
   * **Stands Dashboard**: Toggle stand statuses manually (e.g., set to `sponsor` or override bookings).
   * **Payment Approval Queue**: List all uploads of SWIFT/Wire transfer receipts, with "Approve" or "Reject" actions.
   * **B2B Analytics**: View aggregate stats (total sales target progress, active registrations).
   * **Export Utility**: Download spreadsheets of exhibitor contacts, stands, and buyer matches.

---

## 🧪 Phase 7: Verification, Security Auditing, & Deployment
Rigorous testing, validation, and launching of the digital exhibition marketplace.

### Tasks:
1. **Concurrency Load Testing**:
   * Simulate multiple users attempting to reserve the same stand simultaneously to ensure transaction logic prevents double-bookings.
2. **Security Audits**:
   * Sanitize inputs to prevent XSS/SQL injection.
   * Restrict access to database tables to enforce privacy.
3. **CI/CD Build & Deployment**:
   * Run automated type-checks (`npm run typecheck`) and lints (`npm run lint`).
   * Deploy the Vite application to a fast hosting platform (e.g., Vercel, Netlify, or AWS Amplify).
