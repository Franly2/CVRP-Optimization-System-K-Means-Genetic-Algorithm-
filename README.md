# VRP Fleet Management & Delivery Optimization

## 🚀 Project Overview

This project is a **Vehicle Routing Problem (VRP) application** designed for logistics and delivery optimization.  
It helps companies manage fleets of drivers, generate optimized delivery routes, and track driver locations in real-time.  

The backend is built with **NestJS** and **PostgreSQL**, using **Prisma ORM** for database management.  
The frontend will use **React** to display data and provide interactive user interfaces.

---

## 🎯 Key Features (Planned / To Implement)

### 1. User Management
- **Register & Login** with role-based access (`DRIVER` or `ADMIN`)
- Passwords hashed with **bcrypt**
- Authentication using **JWT**

### 2. Driver & Vehicle Management
- Admin can add, edit, and remove drivers and their vehicles
- Track driver’s current location (`lat`, `lng`) in real-time

### 3. Route Management
- Admin can generate optimal delivery routes for drivers
- Routes consider:
  - Traffic conditions
  - Road volume and constraints
  - Vehicle type and capacity
  - Delivery time windows
- Drivers receive assigned routes through the app

### 4. Real-Time Tracking
- Driver positions are updated and monitored in real-time
- Admin can see driver locations on a map

### 5. Reporting & Analytics (Future)
- Delivery time and distance analytics
- Cost and efficiency reports for route optimization

---

## 🛠 Tech Stack

- **Backend:** NestJS, TypeScript, Prisma, PostgreSQL, WebSocket, some of routing and map display Public API there is some option :
    Traffic Data API – To get real-time traffic information.
    Examples: Google Maps Traffic Layer API, TomTom Traffic API, or HERE Traffic API.

    Geocoding API – To convert addresses ↔ coordinates.
    Examples: Google Geocoding API or OpenCage Geocoder.

    Optimization API – To solve VRP (not just shortest path).
    Examples: OpenRouteService Optimization API, Route4Me API, or implement your own algorithm like Clarke-Wright, Genetic Algorithm, or Simulated Annealing.

    Map (Frontend) – To display route results visually.
    Examples: Leaflet.js, Mapbox GL JS, or Google Maps SDK.
  
- **Frontend:** React (to display routes, driver info, and real-time tracking)
- **Authentication:** JWT, bcrypt
- **Version Control:** Git, GitHub


