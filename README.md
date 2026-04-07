# 🎟️ Online Event Management Platform – Backend

This is the **backend API** for the Online Event Management Platform built using **Node.js, Express.js, and MongoDB**.

The backend handles event management, ticket booking, payment processing, user authentication, and analytics.

---

# 🚀 Features

## Authentication

* User registration
* Secure login using JWT
* Role-based access control

  * Admin
  * Organizer
  * User

---

## Event Management

* Create events
* Update events
* Delete events
* Fetch event listings
* Manage event details

---

## Ticket System

* Create ticket types
* Purchase tickets
* Manage ticket bookings
* Track ticket availability

---

## Payment Integration

* Secure payment gateway
* Transaction validation
* Payment history tracking

---

## Analytics

* Ticket sales reports
* Revenue tracking
* Attendance metrics

---

# 🧑‍💻 Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Payment Gateway Integration
* stripe

---

## 📂 Backend Project Structure

```
MSP-BACKEND
│
├── controllers
│   ├── eventController.js
│   ├── paymentController.js
│   ├── reviewController.js
│   ├── ticketController.js
│   └── userController.js
│
├── middleware
│   ├── adminMiddleware.js
│   └── authMiddleware.js
│
├── models
│   ├── Event.js
│   ├── Payment.js
│   ├── Review.js
│   ├── Ticket.js
│   └── User.js
│
├── routes
│   ├── eventRoutes.js
│   ├── paymentRoutes.js
│   ├── reviewRoutes.js
│   ├── ticketRoutes.js
│   └── userRoutes.js
│
├── Utils
│   └── sendEmail.js
│
├── .env
├── .gitignore
├── index.js
├── package.json
└── package-lock.json
```

          
```

---

 ⚙️ Installation

### Clone the repository

```bash
git clone https://github.com/magesh-Govinthan/MSP-backend.git
```

### Navigate to backend folder

```bash
cd event-management-backend
```

### Install dependencies

```bash
npm install
```

---


```

---

# ▶️ Run the server

```bash
npm run dev
```

Server will start on:

```
http://localhost:4000
```

---

# 📡 API Endpoints (Example)

## Authentication

```
POST /api/user/register
GET /api/user/login
GET /api/user/getallusers
POST /api/user/forgot-password
POST /api/user/forgot-password:token
PUT /api/user/update/:id
DELETE/api/user/delete/:id

```

## Events

```
GET /api/event/
GET /api/event/:id
POST /api/event/create
PUT /api/event/update/:id
DELETE /api/event/delete/:id
```

## Tickets

```
POST /api/ticket/book
GET /api/ticket/mytickets/:user
GET /api/ticket/allTickets
PUT /api/ticket/cancel/:id
POST  /api/ticket/eventIds
PUT  /api/ticket/transfer
DELETE /api/ticket/:id

```
## reviews

```
POST /api/reviews/
GET /api/reviews/
DELETE /api/reviews/:id

````
## payment
```
POST /api/payments/verify-payment
POST /api/payments/checkout
POST /api/payments/store
GET /api/payments/user/:userId
GET /api/payments/getallpayments
DELETE /api/payments/:id


---

# 🚀 Future Improvements

* Real-time notifications
* AI-based event recommendations

---

# 👨‍💻 Author

Magesh G
