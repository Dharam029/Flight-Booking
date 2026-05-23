# SkyBook — Flight Management System

A full-stack flight booking web application for searching, booking, and managing flights across **India**, **China**, **Malaysia**, and regional hubs. Built with **React** and **Node.js**, using a local **SQLite** database.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)

---


## Features

### For travellers
- Register and sign in with JWT authentication
- Search flights by departure and/or destination (partial city names supported)
- Browse **300+** scheduled routes with popular city shortcuts
- Book flights with multiple passengers and travel class (Economy / Business / First)
- View booking history and request cancellations
- Display prices in **USD**, **INR (₹)**, or **CNY (¥)**

### For administrators
- Dashboard with flights, bookings, and cancellation requests
- Add, cancel, and delete flights
- Approve or reject user cancellation requests

---

## Tech stack

| Layer      | Technology                          |
|-----------|--------------------------------------|
| Frontend  | React 19, Vite, React Router         |
| Backend   | Node.js, Express 5                   |
| Database  | SQLite (`sql.js`) — file-based      |
| Auth      | JWT, bcrypt password hashing         |

---

## Project structure

```
Flight-Management-System/
├── backend/
│   ├── server.js              # API entry point
│   ├── setup-db.js            # Create tables & admin user
│   ├── seed-flights.js        # Regional route seed data
│   ├── seed-bulk-flights.js   # Bulk flights per city
│   ├── flight_booking.db      # SQLite database (created on setup)
│   └── src/
│       ├── config/            # DB & app config
│       ├── controllers/       # Route handlers
│       ├── middleware/        # JWT auth
│       └── routes/            # API routes
├── frontend/
│   └── src/
│       ├── pages/             # Login, Register, Dashboards
│       ├── components/        # Navbar, currency selector
│       ├── context/           # Auth & currency state
│       └── services/          # API client
└── .env.example
```

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm

### 1. Clone the repository

```bash
git clone https://github.com/Dharam029/Flight-Management-System.git
cd Flight-Management-System
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env` (or copy from root `.env.example`):

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
PORT=3000
FRONTEND_URL=http://localhost:5173
```

Initialize the database and sample flights:

```bash
npm run setup-db
npm run seed-flights
npm run seed-bulk
```

Start the API:

```bash
npm start
```

Server runs at **http://localhost:3000**

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the dev server:

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Default admin account

Created automatically by `npm run setup-db`:

| Field    | Value                 |
|----------|------------------------|
| Email    | `admin@skybook.com`    |
| Password | `admin123`             |

Use this to access the **Admin** dashboard. Register a new account for the user (traveller) experience.

---

## API overview

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Create user account |
| `POST` | `/auth/login` | Login, returns JWT |
| `GET`  | `/flights` | List all scheduled flights |
| `GET`  | `/flights/search?source=&destination=` | Search flights |
| `POST` | `/bookings` | Book a flight (auth required) |
| `GET`  | `/bookings/my` | User bookings (auth required) |
| `GET`  | `/admin/bookings` | All bookings (admin) |

Protected routes require header: `Authorization: Bearer <token>`

---

## npm scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm start` | Start API server |
| `npm run setup-db` | Create DB, tables, admin user |
| `npm run seed-flights` | Add India / China / Malaysia routes |
| `npm run seed-bulk` | Top up flights per city |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

---

## Supported regions

**India:** Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Kolkata, Goa, Kochi, Jaipur, Ahmedabad  

**China:** Beijing, Shanghai, Guangzhou, Shenzhen, Chengdu, Hong Kong, Xi'an, Hangzhou  

**Malaysia:** Kuala Lumpur, Penang, Langkawi, Kota Kinabalu, Johor Bahru, Kuching  

**Hubs:** Singapore, Bangkok, Dubai, Tokyo  

Prices are stored in **USD**; the UI converts to INR or CNY using fixed demo exchange rates.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Only a few flights showing | Restart backend after seeding: `cd backend && npm start` |
| Login fails | Run `npm run setup-db` in `backend/` |
| CORS errors | Set `FRONTEND_URL=http://localhost:5173` in `backend/.env` |
| Port in use | Change `PORT` in `backend/.env` and update `VITE_API_URL` |

---

## Author

**Dharam029** — [GitHub](https://github.com/Dharam029)

---

## License

This project is open source and available for educational use.
