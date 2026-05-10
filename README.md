# GGCS V3 — Next-Generation Cleaning Service Tenant Ecosystem

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Next-Auth](https://img.shields.io/badge/Next--Auth-Secure-764ABC?style=for-the-badge&logo=next.js)](https://next-auth.js.org/)

## 💎 The Vision

**GGCS V3** (Global Green Cleaning Services) is a sophisticated, enterprise-grade multi-tenant platform designed to revolutionize the cleaning service industry. It serves as a comprehensive orchestration layer connecting **Clients**, **Verified Vendors**, and **Platform Administrators** through a high-fidelity, real-time interface.

Built with a "Performance-First" philosophy, the system utilizes the latest advancements in the React ecosystem to deliver a cinematic, ultra-responsive user experience while maintaining rigorous data integrity and operational transparency.

---

## 🚀 Sophisticated Tech Stack

The architecture is built on a modern, scalable foundation:

*   **Framework**: [Next.js 15 (App Router)](https://nextjs.org/) — Utilizing Server Components for zero-bundle-size rendering and Server Actions for secure, type-safe mutations.
*   **Language**: [TypeScript](https://www.typescriptlang.org/) — Strict type-safety across the entire stack, from database models to frontend components, ensuring high maintainability and fewer runtime errors.
*   **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) orchestrated by [Prisma ORM](https://www.prisma.io/) — A robust relational schema designed for complex scheduling, service assignments, and financial tracking.
*   **Authentication**: [Next-Auth (Auth.js)](https://next-auth.js.org/) — Multi-strategy authentication with role-based access control (RBAC) and secure session management.
*   **Design System**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/) — A custom-tailored design system using OKLCH color spaces for vibrant, consistent aesthetics and accessibility.
*   **Animations**: [Framer Motion](https://www.framer.com/motion/) — Implementing cinematic transitions, layout animations, and interactive 3D navigation elements.
*   **Real-time Intelligence**: Custom notification engine and operational monitoring dashboard for live job tracking.

---

## 🌟 Advanced Engineering Features

### 📡 Multi-Channel Communication Matrix
Integrates dynamic messaging capabilities allowing administrators to communicate with vendors and clients via **WhatsApp API**, **Direct Email**, and **Internal System Messaging**, ensuring 100% operational uptime.

### 📸 High-Fidelity Proof-of-Work System
A sophisticated evidence collection engine where vendors upload multi-angle visual proof (Before/After + Additional Context) for every job. Features an interactive proof gallery for administrative auditing.

### 📅 Intelligent Scheduling Engine
Replaces traditional lists with a premium, interactive **Monthly Calendar Orchestrator**. Built with `date-fns`, it allows vendors to manage complex job densities with visual status indicators and date-specific filtering.

### 💱 Global Financial Layer
A custom-built **Dynamic Currency System** that handles real-time currency conversion and formatting across the platform, supporting international scalability.

### 🌓 Adaptive Cinematic UI
Supports **Dynamic Theme Switching** (Light/Dark/System) with smooth hardware-accelerated transitions, integrated into both the standard and 3D-accelerated navigation bars.

---

## 🏗️ Architectural Overview

```mermaid
graph TD
    Client[Client Portal] -->|Request| API[Next.js API Layer]
    Vendor[Vendor Ecosystem] -->|Assignment| API
    Admin[Admin Command Center] -->|Orchestration| API
    API -->|ORM| Prisma[Prisma Engine]
    Prisma -->|Storage| DB[(PostgreSQL)]
    API -->|Auth| NextAuth[Next-Auth RBAC]
    API -->|Proof| Storage[Multi-Image Storage]
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18.17+
- PostgreSQL Instance

### Setup Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/usman1058/Cleaning_Service_Providers_Tenate_System.git
   cd GGCS_V3
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/ggcs_db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Launch Development Server:**
   ```bash
   npm run dev
   ```

---

## 📄 License
Copyright © 2024 Global Green Cleaning Services. All rights reserved.

---

**Engineered with Precision by Usman & Antigravity**
