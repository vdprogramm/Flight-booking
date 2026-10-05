# ✈️ Flight Booking Web

Frontend application for the **Flight Booking System**, built with React, TypeScript, and Vite.

The application provides a user interface for searching flights, selecting seats, managing bookings, making payments, and administering flight-related data.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Recharts
- Lucide React
- REST API

## Main Features

### User

- Register and login
- Search available flights
- View flight details
- View available seats
- Hold/select seats
- Create flight bookings
- View booking history
- View booking details
- Cancel bookings
- Make payments
- Update profile
- Change password

### Admin

- Dashboard
- Manage airlines
- Manage airports
- Manage flights
- Cancel flights
- Manage flight seats
- Generate seats for flights
- Manage customer bookings
- View booking details

## Project Structure

```text
flight-booking-web/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── .env
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

> The exact folders inside `src` may vary as the project evolves.

## Requirements

Before running the project, install:

- Node.js
- npm
- Flight Booking Laravel API

Recommended:

```text
Node.js >= 20
npm >= 10
```

## Installation

Clone the repository:

```bash
git clone https://github.com/vdprogramm/Flight-booking.git
```

Go to the frontend directory:

```bash
cd Flight-booking/flight-booking-web
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in `flight-booking-web`:

```env
VITE_API_URL=http://localhost:8000/api
```

For production, replace the local URL with the deployed Laravel API:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

Do not hard-code the backend URL directly into React components.

## Run Development Server

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

## Build

Create a production build:

```bash
npm run build
```

The generated files will be placed in:

```text
dist/
```

Preview the production build locally:

```bash
npm run preview
```

## Backend API

This frontend communicates with the Laravel backend located in:

```text
flight-booking-api/
```

Main API groups include:

```text
/api/register
/api/login
/api/airports
/api/flights
/api/flights/{id}
/api/flights/{id}/seats

/api/seats/{id}/hold
/api/bookings
/api/my-bookings
/api/bookings/{id}
/api/bookings/{id}/pay

/api/profile
/api/password
/api/logout

/api/admin/*
```

Protected endpoints use Laravel Sanctum authentication.

## Flight Booking Flow

```text
Search Flight
      ↓
Select Flight
      ↓
View Seats
      ↓
Hold Seat
      ↓
Create Booking
      ↓
Payment
      ↓
Booking Confirmed
```

The backend is responsible for concurrency control and prevents multiple users from successfully booking the same seat.

## Deployment

Recommended deployment architecture:

```text
React + Vite
     │
     ▼
   Vercel
     │
     │ HTTPS / REST API
     ▼
Laravel API
     │
     ▼
   Render
     │
     ▼
PostgreSQL
```

### Vercel

Use:

```text
Root Directory:
flight-booking-web

Build Command:
npm run build

Output Directory:
dist
```

Add the following environment variable in Vercel:

```env
VITE_API_URL=https://your-render-api.onrender.com/api
```

After changing an environment variable, redeploy the frontend.

## Available Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Repository

GitHub:

https://github.com/vdprogramm/Flight-booking

## Author

**Đinh Thành Vinh**

Backend / Full-stack Developer

Main technologies:

`PHP` · `Laravel` · `React` · `TypeScript` · `PostgreSQL` · `REST API`

## License

This project is developed for learning, portfolio, and demonstration purposes.