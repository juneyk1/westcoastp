# West Coast Physicians Association

## Overview

This project is a full-stack e-store built to help private practice doctors access medical devices at reduced costs by pooling purchasing power. The platform provides a secure, scalable, and user-friendly interface for browsing and purchasing medical devices.

## Tech Stack
**Frontend:** React, JavaScript, Custom UI/UX
**Backend:** API Routes, Node.js/Express (if applicable)
**Database:** PostgreSQL (via Supabase)
**Authentication:** Supabase Auth
**Payments:** Stripe API

## Installation and Setup
Follow these steps to run the code:
1. Add an .env to root:
  `STRIPE_SECRET_KEY=sk_test_*************
    VITE_STRIPE_PUBLISHABLE_KEY=pk_test_*************
    VITE_STRIPE_PRICE_ID=price_*************
    VITE_SUPABASE_URL=https://xxxx.supabase.co
    VITE_SUPABASE_ANON_KEY=******...`
2. Run `node src/server/stripeServer.js`.
3. Install dependencies:
   `npm install`
4. Start frontend:
   `npm run dev`
5. Ensure Stripe is logged into and events are listening.
