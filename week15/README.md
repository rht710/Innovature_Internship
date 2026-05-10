# 🚀 Week 15: Routing (React Router v6)

## 📌 Project Overview
Welcome to **Week 15: Routing (React Router v6)**! This week, we focused on implementing dynamic navigation, route parameters, and nested routes for the Innovature Frontend Development program.

The core objective was to build a modern, responsive **Blog Application** that demonstrates the power of `react-router-dom` v6 for managing complex UI states via the URL.

---

## 🛠 Project Features

### 1. Dynamic Routing
- **React Router v6**: Implemented a comprehensive routing system using `<Routes>` and `<Route>`.
- **Nested Routes**: Used a shared `Layout` component with `<Outlet />` to maintain a consistent header and footer across all pages.

### 2. Blog Management
- **Paginated Blog List**: Dynamic pagination logic handled via URL search parameters (`?page=X`).
- **Category Filters**: Real-time filtering system using search parameters (`?category=Tech`).
- **Single Post View**: Detailed article pages powered by dynamic route parameters (`/post/:id`).

### 3. URL-Based State
- **Deep Linking**: All filters and pagination states are reflected in the URL, allowing users to bookmark and share specific views.

### 4. Premium UI/UX
- **Modern Aesthetics**: Built with vanilla CSS using curated color palettes, smooth transitions, and responsive grid layouts.
- **Micro-Animations**: Subtle entrance animations and hover effects for an engaging user experience.

---

## 📑 Tech Stack
- **Framework**: React 19
- **Routing**: React Router v6 (react-router-dom)
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (CSS Variables, Flexbox, CSS Grid)
- **Icons**: Lucide React

---

## 📸 Screenshots

### Home Page (Blog List & Filtering)
![Home Page](./screenshots/home.png)

### Blog Detail Page (Dynamic Routing)
![Detail Page](./screenshots/detail.png)

---

## 💻 Setup & Deployment

### 1. Prerequisites
Install all dependencies for the React application:
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 👤 Author
**Rohit Mohan**  
*Week 15 - Internship to Hire Excellence Program (I2HEP)*
