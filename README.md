
# School Lane - Education Management System

School Lane is a comprehensive education management system built with React, Vite, and Tailwind CSS. It provides a modern, responsive interface for managing various aspects of educational institutions, including student and teacher management, attendance tracking, assignments, exams, and announcements.

## Features

- **User Authentication**
  - Student/Teacher/Admin login
  - Secure authentication flow
  - Protected routes

- **Dashboard**
  - Overview of important information
  - Quick access to key features
  - Summary statistics

- **Student Management**
  - View student profiles
  - Track student progress
  - Manage student records

- **Teacher Management**
  - View teacher profiles
  - Assign classes/subjects
  - Monitor teacher schedules

- **Attendance System**
  - Mark and track attendance
  - Generate attendance reports
  - View attendance history

- **Assignments**
  - Create and distribute assignments
  - Submit and grade work
  - Track submission status

- **Exams**
  - Schedule and manage exams
  - Record and track grades
  - Generate report cards

- **Timetable**
  - View class schedules
  - Manage time slots
  - Handle room allocations

- **Announcements**
  - Post important notices
  - Broadcast messages to users
  - Archive announcements

## Technology Stack

- **Frontend**
  - React 18
  - React Router v6
  - Vite (Build Tool)
  - Tailwind CSS (Styling)
  - Axios (HTTP Client)

- **Development Tools**
  - ESLint (Code Linting)
  - PostCSS (CSS Processing)
  - Autoprefixer (CSS Compatibility)

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher) or Yarn
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shameemxy/school-lane.git
   cd school-lane/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the client directory with the following variables:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=School Lane
   ```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally

## Project Structure

```
school-lane/
├── client/                      # Frontend application
│   ├── public/                  # Static files
│   ├── src/
│   │   ├── assets/             # Images, fonts, etc.
│   │   ├── components/         # Reusable UI components
│   │   │   └── Layout/         # Layout components
│   │   ├── context/            # React context providers
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── styles/             # Global styles
│   │   ├── App.jsx             # Main application component
│   │   └── main.jsx            # Application entry point
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
```

## Configuration

### Tailwind CSS

The project uses Tailwind CSS for styling. Configuration can be found in `tailwind.config.js`.

### Environment Variables

- `VITE_API_URL`: Base URL for API requests
- `VITE_APP_NAME`: Application name used throughout the app

## Deployment

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

For any inquiries, please contact the project maintainer at [your-email@example.com].
=======
# School-lane

