# MERN Event Ticketing System

A fullstack event ticketing application built with MongoDB, Express, React, Node.js, Vite, and Tailwind CSS. Users can register, log in, browse events, book tickets, view their bookings, and cancel bookings.

## Features

- User authentication with register and login
- JWT-protected booking routes
- Event listing and event details
- Organizer event creation API
- Ticket booking with remaining-ticket validation
- User bookings dashboard
- Cancel booking flow
- Responsive React UI with Tailwind CSS
- Environment-based configuration for local and deployment use

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT, bcryptjs
- Tooling: ESLint, npm

## Screenshots

Add portfolio screenshots here:

- Login page
- Events list
- Event details and booking
- My bookings dashboard

## Project Structure

```text
webapp1/
  backend/
    controllers/
    middleware/
    models/
    routes/
    server.js
  frontend/
    src/
      components/
      context/
      pages/
      services/
```

## Local Setup

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/webapp1
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:3000`.

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## Production Notes

- Set `VITE_API_URL` to the deployed backend URL.
- Set `CLIENT_URL` on the backend to the deployed frontend URL.
- Set a strong `JWT_SECRET` in production.
- Use a production MongoDB connection string in `MONGO_URI`.
- Run `npm run build` in `frontend` before deploying the React app.

## API Endpoints Overview

### Auth

- `POST /api/auth/register` - Register a user
- `POST /api/auth/login` - Log in and receive a JWT
- `GET /api/auth/me` - Get current authenticated user

### Events

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get one event
- `POST /api/events` - Create an event, organizer only
- `PUT /api/events/:id` - Update an event
- `DELETE /api/events/:id` - Delete an event

### Bookings

- `POST /api/bookings` - Create a booking
- `GET /api/bookings/my` - Get current user's bookings
- `PUT /api/bookings/:id/cancel` - Cancel a booking

## Build Commands

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
npm start
```
