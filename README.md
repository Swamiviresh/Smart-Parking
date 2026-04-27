# Smart Parking Web Application

A full-stack web application for managing parking slot bookings. Built with Node.js, Express, SQLite, and vanilla HTML/CSS/JavaScript.

## Prerequisites

- Node.js v18 or above
- npm

## Installation

1. Unzip the project (if downloaded as ZIP)

2. Navigate to the backend folder:
   ```
   cd smart-parking/backend
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the server:
   ```
   npm start
   ```
   Server runs on [http://localhost:3000](http://localhost:3000)

5. Open the application:
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Default Admin Account

- **Email:** admin@parking.com
- **Password:** admin123

## Features

- **User Registration & Login** — JWT-based authentication with bcrypt password hashing
- **Parking Slot Dashboard** — View all 2 slots with real-time availability (green = available, red = booked)
- **Slot Booking** — Book available slots with one click
- **Booking Cancellation** — Cancel your active bookings to free up slots
- **Admin Panel** — View stats, all bookings, and slot overview (admin-only access)
- **Auto-refresh** — Admin panel refreshes data every 30 seconds
- **Responsive Design** — Works on desktop and mobile devices

## Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | HTML, CSS, JavaScript   |
| Backend   | Node.js, Express.js     |
| Database  | SQLite (better-sqlite3) |
| Auth      | JWT + bcrypt            |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT token

### Slots (requires JWT)
- `GET /api/slots` — Get all parking slots
- `GET /api/slots/my-bookings` — Get current user's bookings
- `POST /api/slots/book` — Book a slot
- `POST /api/slots/cancel` — Cancel a booking

### Admin (requires JWT + admin role)
- `GET /api/admin/slots` — Get all slots
- `GET /api/admin/bookings` — Get all bookings with user details
- `GET /api/admin/stats` — Get parking statistics

## Notes

- The SQLite database file (`parking.db`) is auto-created on first run
- 2 parking slots (P1–P2) are auto-seeded on first run
- The default admin account is created automatically on first run
- JWT tokens expire after 2 hours
