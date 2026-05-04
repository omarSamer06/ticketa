# 🎟️ Ticketa — Event Ticketing Platform (MERN SaaS)

Ticketa is a full-stack event ticketing platform that simulates a real-world SaaS product. It enables users to discover events, book tickets, and manage bookings, while organizers can create events and track performance, and admins manage approvals and users.

> 🚀 Built with production practices: role-based access, secure auth, scalable APIs, and a modern UI.



---

## ✨ Features

### 👤 Authentication & Roles
- JWT-based authentication
- Role-based access control:
  - **User** – browse & book events
  - **Organizer** – create & manage events
  - **Admin** – approve events & manage users

---

### 🎫 Event System
- Browse approved events
- Event details page (date, location, price, availability)
- Search & filtering

---

### 📅 Booking System
- Book multiple tickets (with availability checks)
- Real-time availability display (Sold Out / Limited tickets)
- Booking history
- Cancel bookings
- Automatic price calculation

---

### 🧑‍💼 Organizer Features
- Create, edit, and delete events
- View event status (Pending / Approved / Rejected)
- Analytics:
  - Tickets sold
  - Percentage booked

---

### 👑 Admin Dashboard
- View all events (including pending)
- Approve or reject events
- Manage users (view, update roles, delete)

---

### 📧 Email Integration
- Welcome email sent on registration
- Production-safe email handling using Nodemailer

---

### 🎨 UI/UX
- Modern SaaS-style dashboard
- Sidebar navigation with role-based sections
- Gradient hero sections & stat cards
- Responsive design (mobile-friendly)
- Clean, consistent Tailwind UI

---

## 🧱 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)

### Other
- JWT Authentication
- Nodemailer (Email)
- REST API Architecture

---

## ⚙️ Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/ticketa.git
cd ticketa
```

---

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env`:
```env
PORT=3000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Run backend:
```bash
npm run dev
```

---

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env`:
```env
VITE_API_URL=http://localhost:3000
```

Run frontend:
```bash
npm run dev
```

---

## 🌍 Deployment

- Frontend: Vercel  
- Backend: Render  
- Database: MongoDB Atlas  

Make sure to configure environment variables on both platforms.

---

## 🧪 Key Functional Tests

- User registration & login  
- Role-based route protection  
- Event creation → pending → admin approval  
- Booking & cancellation  
- Organizer analytics accuracy  
- Email delivery  

---

## 📸 Screenshots

Add screenshots of:
- Dashboard  
- Events page  
- Booking flow  
- Admin panel  
- Organizer panel  

---

## 🧠 What This Project Demonstrates

- Full-stack MERN development  
- Scalable REST API design  
- Role-based system architecture  
- Real-world business logic (booking, approvals)  
- Production deployment workflow  
- Clean UI/UX with Tailwind  

---



## 👨‍💻 Author

Omar  
Full-Stack Developer (MERN)

---

## ⭐ Final Note

Ticketa is built as a production-ready system, designed to reflect real client requirements and scalable architecture.
