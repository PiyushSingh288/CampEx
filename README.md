# Project Title

A brief description of what this project does and who it's for

<div align="center">

# SOET ERP Portal

**A Modern, Role-Based University Enterprise Resource Planning System**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38BDF8?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

*Digitizing campus operations through a unified, intuitive, and enterprise-grade platform for students, faculty, and administrators.*

[Overview](#overview) • [Features](#core-features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [Structure](#project-structure) • [Roadmap](#roadmap) • [Contributing](#contributing)

</div>

---

## Overview

**SOET ERP Portal** is a full-featured University Enterprise Resource Planning system built to streamline academic, administrative, and faculty workflows within a single cohesive platform. It replaces fragmented, paper-based campus processes with a centralized digital experience that scales from individual student use to institution-wide administration.

The platform is organized into three purpose-built portals, each tailored to the needs of its users:

| Portal | Audience | Purpose |
|---|---|---|
| **Student Portal** | Students | Academic tracking, planning, and self-service |
| **Faculty Portal** | Teaching staff | Class management, analytics, and reporting |
| **Admin Portal** | Administration | Institution-wide oversight and operations |

Built on a modern React + TypeScript architecture with a component-driven design system, the codebase is structured for maintainability, reusability, and production-scale deployment.

---

## Core Features

### Student Portal

- Personalized academic dashboard
- Attendance tracking with forecasting
- Grade analysis and predictive scoring
- Fee details and payment history
- AI-assisted academic planner and exam preparation goals
- Digital document wallet
- Gate pass request workflow
- Grievance submission and tracking
- Real-time notification center
- Timetable and course progress viewer
- Secure profile management and authentication

### Faculty Portal

- Centralized faculty dashboard
- Attendance management and student performance monitoring
- Student directory with search and filtering
- Grievance handling tools
- Research profile and academic responsibilities tracker
- Lecture scheduling and leave management
- PDF report generation
- Student analytics and performance insights

### Admin Portal

- Institution-wide administrative dashboard
- Student and faculty record management
- Grievance resolution center
- Fee management and financial oversight
- Notification broadcasting and email center
- Gate pass approvals and audit logging
- Faculty leave approvals
- Reports, analytics, and live system monitoring

---

## Academic Planner

The Academic Planner is the platform's flagship module, designed to give students actionable, forward-looking insight into their academic standing.

| Capability | Description |
|---|---|
| Attendance Forecasting | Projects attendance trajectory and required class attendance to stay compliant |
| Status Classification | Flags attendance as Safe, Warning, or Critical |
| Grade Prediction | Estimates final outcomes from current performance |
| Internal Marks Calculator | Computes assignment, quiz, and mid-semester weightage |
| Practical & Final Exam Modeling | Supports lab components and final exam target planning |
| Performance Estimation | Aggregates all inputs into an overall academic performance projection |

This module is designed to surface academic risk early — before it becomes a transcript problem.

---

## Authentication & Security

- Role-based login for Students, Faculty, and Admins
- Supabase Auth as the primary identity provider
- Google and Microsoft OAuth (integration-ready)
- "Remember Me" and secure password visibility controls
- Mock authentication layer for local development and testing without a live backend

---

## Platform Capabilities

<table>
<tr>
<td valign="top" width="33%">

**Notifications**
- Real-time delivery
- Unread counters
- Category filtering
- Notice board & broadcasts

</td>
<td valign="top" width="33%">

**Student Services**
- Digital document wallet
- Fee receipts & grade reports
- ID cards & hostel gate pass
- Academic records archive

</td>
<td valign="top" width="33%">

**Analytics**
- Attendance & performance trends
- Grievance statistics
- Fee & service request tracking
- Course progress dashboards

</td>
</tr>
</table>

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, Motion, Lucide React |
| **Backend** | Supabase, REST APIs, local mock backend for offline development |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth, Google OAuth, Microsoft OAuth |
| **Documents** | jsPDF for report and document generation |

---

## Project Structure

```
src/
├── components/
│   ├── StudentPortal.tsx       # Student dashboard & modules
│   ├── FacultyPortal.tsx       # Faculty dashboard & modules
│   ├── AdminPortal.tsx         # Admin dashboard & modules
│   ├── AcademicPlanner.tsx     # Predictive academic planning engine
│   ├── FacultyStudents.tsx     # Student directory for faculty
│   ├── SecureLogin.tsx         # Authentication flows
│   ├── Header.tsx              # Shared navigation
│   ├── Skeletons.tsx           # Loading state components
│   └── PortalLanding.tsx       # Landing / portal selection page
│
├── lib/
│   └── supabase.ts             # Supabase client configuration
│
├── types.ts                    # Shared TypeScript types
├── main.tsx                    # Application entry point
└── index.css                   # Global styles
```

---

## Design System

- Modern, glassmorphism-inspired dashboard UI
- Fully responsive across desktop, tablet, and mobile
- Skeleton loading states for perceived performance
- Consistent, professional color palette and typography
- Interactive cards, dynamic tables, and smooth transitions
- Component-based architecture for design consistency at scale

---

## Installation

**Prerequisites:** Node.js 18+ and npm

```bash
# Clone the repository
git clone https://github.com/yourusername/SOET-ERP-Portal.git

# Navigate into the project
cd SOET-ERP-Portal

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Roles & Permissions

| Role | Access & Capabilities |
|---|---|
| **Student** | Attendance, grades, academic planner, fees, gate pass, documents, grievances |
| **Faculty** | Attendance management, student oversight, research profile, leave requests, reports |
| **Admin** | Full student/faculty management, service administration, fee oversight, broadcasts, reports |

---

## Project Objectives

- Digitize and centralize university operations
- Reduce dependency on paper-based processes
- Enable proactive, data-driven academic monitoring
- Improve administrative efficiency and turnaround time
- Strengthen communication across students, faculty, and administration
- Increase student engagement through self-service tools
- Support analytics-driven institutional decision-making

---

## Roadmap

Planned enhancements for future releases:

- AI-powered academic assistant and chatbot
- Face recognition and QR-code based attendance
- Hostel management and transport tracking
- Online examination module
- Placement and library management portals
- Dedicated parent portal
- Automated timetable generation
- Full Learning Management System (LMS)
- Video meeting integration and push notifications
- Native mobile application
- AI-driven performance and attendance prediction

---

## Screenshots

> Screenshots will be added following the next deployment cycle.

```
screenshots/
├── landing-page.png
├── student-dashboard.png
├── faculty-dashboard.png
├── admin-dashboard.png
├── academic-planner.png
├── attendance.png
├── grievance.png
└── notifications.png
```

---

## Contributing

Contributions are welcome and appreciated. To contribute:

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/NewFeature
   ```
3. Commit your changes
   ```bash
   git commit -m "Add New Feature"
   ```
4. Push to your branch
   ```bash
   git push origin feature/NewFeature
   ```
5. Open a Pull Request

Please ensure your code follows the existing style conventions and includes relevant documentation for new features.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

