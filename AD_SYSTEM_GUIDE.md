# Verified Revenue SaaS - Advertising System

This project now includes a fully functional Advertising System that allows users to book "Side Slots" on the leaderboard page.

## Features

1.  **Dynamic Ad Slots**: 
    - 5 Slots on the Left Sidebar (`left_1` to `left_5`)
    - 5 Slots on the Right Sidebar (`right_1` to `right_5`)
    - Slots automatically show "Available" or "Booked" based on the current date.

2.  **Booking System**:
    - Users can click any "Advertise Here" slot to open the booking modal.
    - Users can upload an image, set a title, description, and target URL.
    - Users can select a date range.
    - The system prevents double-booking for the same slot on overlapping dates.

3.  **Future Booking**:
    - Even if a slot is currently booked (displaying an ad), users can click "Book this slot for future" to schedule their ad for a later date.

4.  **Monetization**:
    - Integrated logic for Razorpay payments (currently simulated for easy testing).
    - Default price is set to ₹5,000.

## How to Test

1.  **Login**: You must be logged in to book an ad.
2.  **Navigate to Leaderboard**: Go to the home page.
3.  **Click a Slot**: Click any empty "Advertise Here" box.
4.  **Fill Form**: Enter details (e.g., "My SaaS", "https://mysaas.com", select dates).
5.  **Pay**: Click "Pay & Book Now".
6.  **Verify**: The slot will immediately update to show your Ad (if the start date is today).

## Technical Details

- **Model**: `Advertisement` in `backend/revenue/models.py`.
- **API**: 
    - `GET /api/revenue/ads/slots/` (Fetch status)
    - `POST /api/revenue/ads/book/` (Book ad)
- **Frontend**: `AdSlot.jsx` and `BookAdModal.jsx`.

## Indian Context
- Pricing is displayed in INR (₹).
- Categories include "Indian Startup" and "Business in India".
- Razorpay integration ready.
