# 🚀 Week 16: API Calls & Asynchronous React

## 📌 Project Overview
Welcome to **Week 16: API Calls**! This week, we focused on integrating real-world data into our frontend applications using public APIs. We took the Blog App from Week 15 and connected it to the **DummyJSON API**, replacing mock data with live content.

The core objective was to master asynchronous operations in React, handle different UI states (loading, success, error), and implement advanced data fetching techniques like Infinite Scroll.

---

## 🛠 Project Features

### 1. Live API Integration
- **Axios**: Utilized the `axios` library for making clean, promise-based HTTP requests to the DummyJSON API.
- **Dynamic Content**: Posts, tags, reactions, and views are dynamically fetched and rendered.
- **Single Post View**: The detail page fetches complete post information dynamically based on the URL parameter (`/post/:id`).

### 2. State Management & Effects
- **`useState`**: Managed complex UI states including `posts`, `loading`, `error`, `skip`, and `hasMore`.
- **`useEffect`**: Handled side effects for fetching data when components mount or when dependencies (like the `skip` value) change.

### 3. Advanced UX / Performance
- **Loading States**: Integrated clean loading spinners (`lucide-react`) and animated skeletons to provide user feedback during network requests.
- **Error Handling**: Graceful error boundaries and alert messages display if the API call fails or if a post is not found.
- **Infinite Scroll (Bonus)**: Implemented an `IntersectionObserver` to automatically fetch and append the next batch of posts as the user scrolls to the bottom of the page, eliminating the need for manual pagination clicks.

---

## 📑 Tech Stack
- **Framework**: React 19
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **API**: DummyJSON (`https://dummyjson.com/posts`)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS & Vanilla CSS
- **Icons**: Lucide React

---

## 📸 Screenshots

### Home Page (Live API & Infinite Scroll)
![Home Page](./Screenshots/home.png)

### Loading States
![Loading State](./Screenshots/loading.png)

### Blog Detail Page
![Detail Page](./Screenshots/detail.png)

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
*Week 16 - Internship to Hire Excellence Program (I2HEP)*
