# 🚀 DocAppoint Server — Backend REST API Engine

> High-performance Node.js & Express.js REST API layer powering the DocAppoint Digital Healthcare & Doctor Appointment Platform. Handles stateless authentication with JWT, real-time doctor search indexings via MongoDB regular expressions, profile persistent updates, and full booking transaction lifecycles.

---

## 🌐 Production API & Repository

🔗 **Live Production API:** [https://assignment-9-server-ybq9.onrender.com/](https://assignment-9-server-ybq9.onrender.com/)  
🔗 **Backend Repository:** [https://github.com/Asmual/docappoint-server](https://github.com/Asmual/docappoint-server)  
🔗 **Frontend Repository:** [https://github.com/Asmual/docappoint-client](https://github.com/Asmual/docappoint-client)

---

## 🛠️ Architecture & Core Dependencies

The server follows a modular router-middleware architectural design, ensuring clean separation of concerns, rapid response execution, and high maintainability across medical booking domains.

| Dependency Package | Version Scope | Technical Core Purpose |
|---|---|---|
| **`express`** | `^4.x` | Primary web framework handling route matrices, dynamic URL parameter matching, and HTTP request lifecycles. |
| **`mongodb`** | `^6.x` | Native MongoDB driver executing atomic CRUD commands, flexible field matching (`$or`, `$regex`), and upsert operations. |
| **`jsonwebtoken`** | `^9.x` | Stateless security layer issuing signed Bearer tokens with a 7-day expiration shelf life for active sessions. |
| **`cors`** | `^2.x` | Configured to safely isolate cross-origin requests between Vercel/Localhost client interfaces and the Render API host. |
| **`cookie-parser`** | `^1.x` | Parses cookie headers to streamline server-side session validations and token checks. |
| **`dotenv`** | `^16.x` | Sandboxes runtime environment keys, isolating MongoDB connection strings and secret keys. |

---

## 🔒 Security & Middleware Matrix

The server employs multi-layered authentication barriers inside `middlewares/verifyJWT.js` to safeguard operational health record logic:

1. **`verifyJWT`:** Decodes incoming `Bearer` authorization headers utilizing cryptographic secret keys. Prevents unsigned or mutated payloads from executing private user actions.
2. **`Email & Token Fallback Validation`:** Verifies user identity via decoded JWT payload or explicit session payload to prevent data loss during third-party client authentication flows.

---

## 📋 Centralized API Endpoints Map

### 🩺 Doctor Discovery & Search Routing (`/api/doctors`)
- `GET /api/doctors` - Retrieves full medical specialists catalog registered in the platform database.
- `GET /api/doctors/search?query=...` - Real-time search engine executing case-insensitive regex pattern queries across doctor `name`, `specialty`, `designation`, and `hospital`.
- `GET /api/doctors/:id` - Extracts detailed metadata for a single doctor including chamber schedules, fees, and qualification details.

### 📅 Appointment Bookings Routing (`/api/bookings`)
- `POST /api/bookings` - Creates and reserves a new doctor appointment slot for an authenticated patient profile.
- `GET /api/bookings?email=...` - Fetches the personal appointment list matching a specific patient email address.
- `DELETE /api/bookings/:id` - Cancels a scheduled booking session permanently from the collection ledger.

### 👤 User Profile Management (`/api/users`)
- `GET /api/users/profile?email=...` - Fetches persistent user profile information (phone, avatar URL, custom preferences) from MongoDB.
- `PATCH /api/users/profile` - Executes an `$set` upsert operation to update or create user metadata records (Image, Phone, Name) linked by user email.

### 🔐 Authentication (`/jwt`)
- `POST /jwt` - Issues a signed 7-day JWT authorization token based on verified user email and payload parameters.

---

## 🗄️ Database Schemas Model Examples

### `bookings` Collection Sample
```json
{
  "_id": "65f3a1b2c4d5e6f7a8b9c0d1",
  "doctorId": "65f3a1b2c4d5e6f7a8b9c0a2",
  "doctorName": "Dr. Sarah Taylor",
  "doctorSpecialty": "Cardiologist",
  "patientName": "Asmual Obaidul Hoque",
  "patientEmail": "user@example.com",
  "patientPhone": "+8801700000000",
  "appointmentDate": "2026-08-15",
  "appointmentTime": "06:00 PM",
  "fee": 1200,
  "status": "Confirmed",
  "createdAt": "2026-08-03T17:30:00.000Z"
}
