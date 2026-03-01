# 🎓 School Lane - Next-Generation School Management System

Welcome to **School Lane**, an advanced, fully modular School Management ERP system. Built with cutting-edge technologies, it provides a seamless, glassmorphic, and dynamic user experience across three distinct roles: Admins, Teachers, and Students.

![School Lane Banner](https://images.unsplash.com/photo-1577896851225-b873f752f9bc?auto=format&fit=crop&q=80&w=2000)

## 🌟 Key Features

### 🏛️ 1. Multi-Role Dashboards
Three isolated, role-based dashboards tailored for precise educational needs:
- **Admin Dashboard:** Complete bird's-eye view. Manage users, classes, finances, and system settings.
- **Teacher Dashboard:** Focused on classroom orchestration. Manage attendance, submit exam marks, and view class schedules.
- **Student Dashboard:** Dedicated student portal. View grades, check attendance records, and read announcements.

### 📚 2. Core Academic Tracking
- **User Management:** Create, update, and manage student, teacher, and administrative accounts synced with Firebase Auth.
- **Class & Subject Routing:** Link teachers to specific grades and subjects dynamically.
- **Attendance Ledger:** Real-time roll-call system for teachers.

### 📝 3. Exams & Grading
- Secure portals for teachers to enter marks out of 100 with automated grade calculation and teacher remarks.
- Global analytics for Admins to visualize pass rates and subject averages.
- Built-in dynamic **Report Cards** for students.

### 🚌 4. Complete Operations Lifecycle
- **Library Inventory:** Manage library books, track total copies, issue checkouts to students, and oversee returns.
- **Transport & Fleet:** Configure bus routes, track capacity limits, and assign waypoints/pricing across student zones.

### 📢 5. Communications & Scheduling
- **Academic Calendar:** A beautifully structured timeline of school events, exams, sports, and holidays.
- **Digital Noticeboards:** Post global announcements targeted dynamically at Students, Parents, or Staff.
- **Urgent Alerts:** Send out Twilio (SMS) and SendGrid (Email) emergency alerts directly from the UI.

### 💳 6. Finance & Administration
- **Fees Management:** Generate digital tuition invoices, monitor outstanding balances, and track payment receipts.
- **System Settings:** Control Global Configuration, Two-Factor Authentication overrides, and Maintenance Modes.
- **API Vaults:** Securely manage and update secret keys for 3rd-party integrations (Stripe, Google Maps, Twilio).

---

## 🛠️ Technology Stack

**Frontend Architecture:**
- **Framework:** React 18 (Vite Bundler)
- **Styling:** Tailwind CSS with custom Glassmorphism/Neumorphism utilities
- **Animations:** Framer Motion for liquid-smooth transitions and micro-interactions
- **Icons:** Lucide React

**Backend Infrastructure:**
- **Server:** Node.js, Express.js REST API
- **Database & Auth:** Google Firebase SDK (Firestore JSON-like NoSQL database + Firebase Authentication)
- **Security:** Cors, Dotenv

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed along with a [Firebase Project](https://console.firebase.google.com/) configured with an active Firestore database.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/school-lane.git
cd school-lane
```

### 2. Configure Firebase Secrets
In your `v2/server` directory, create a `serviceAccountKey.json` containing your Firebase Admin SDK secret payload.

In `v2/client/src/firebase.js`, update the config variables with your web app Firebase config.

### 3. Server Setup (Backend)
Navigate into the server folder, install node modules, and start running the Express API:
```bash
cd v2/server
npm install
npm run dev
```
*(The backend runs on `http://localhost:5000`)*

### 4. Client Setup (Frontend)
Open a new terminal, navigate to the client folder, and boot the developmental React server:
```bash
cd v2/client
npm install
npm run dev
```

### 5. Accessing the Admin Panel
Once the frontend and backend are running, navigate to `http://localhost:5173/admin/dashboard` in your browser. 
Log in using the default administrator credentials created in your Firebase:
- **Email:** `admin@school-lane.com`
- **Password:** `admin123` (or the password configured in your Firebase Auth dashboard)

---

## 🛡️ Directory Structure

```plaintext
school-lane/
│
├── v2/client/                 # React Frontend
│   ├── src/
│   │   ├── components/        # Layout, Sidebar, Modals
│   │   ├── contexts/          # Auth Context (Firebase Wrapper)
│   │   ├── pages/             # Admin, Teacher, Student screens
│   │   ├── App.jsx            # React Router protected bounds
│   │   └── index.css          # Tailwind and Glassmorphism definitions
│
├── v2/server/                 # Express API
│   ├── config/                # Firebase admin initialization
│   ├── routes/                # Endpoint controllers (auth, users, fees, library...)
│   └── index.js               # Main CORS setup and route registration
```

---

## 📸 Interface Previews

**Modern Aesthetics:** The system is built rejecting flat, uninspired colors. Utilizing custom deep hues, blurry glass cards (`glass-card` class), layered transparent borders, and interactive metric carousels guarantees an absolute premium, 'Wow' factor.

> *School Lane is an ongoing initiative pushing boundaries in modern educational software design.* For contribution guidelines or licensing requests, please contact the repository administrator.
