# Car Dealership Inventory System

A full-stack car dealership inventory management application with JWT-based authentication, 
role-based access control (customer/admin), and complete vehicle CRUD + inventory operations.

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Atlas) with Mongoose, JWT authentication, bcrypt password hashing
**Testing:** Jest, Supertest (tests run against a real MongoDB Atlas database, not an in-memory substitute)

## Project Structure
car-dealership/
└── backend/
├── src/
│ ├── config/ # JWT config
│ ├── controllers/ # Route handler logic
│ ├── middleware/ # Auth (protect/adminOnly), error handling, 404
│ ├── models/ # Mongoose schemas (User, Vehicle)
│ ├── routes/ # Express route definitions
│ ├── utils/ # AppError class
│ ├── app.js # Express app config (no listen — used by tests)
│ └── server.js # Real entrypoint (connects DB, starts server)
└── tests/ # Jest + Supertest test suites

## Backend Setup & Local Run Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- A MongoDB Atlas account with a cluster set up ([mongodb.com/atlas](https://www.mongodb.com/atlas))

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/car-dealership.git
cd car-dealership/backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Copy the example file and fill in your own values:
```bash
cp .env.example .env
```

Edit `.env` with your actual MongoDB Atlas connection string and a JWT secret:
MONGO_URI=mongodb+srv://<username>:<password>@yourcluster.mongodb.net/car-dealership?retryWrites=true&w=majority
JWT_SECRET=your-own-long-random-secret-string
JWT_EXPIRES_IN=7d
PORT=5000

> **Note:** Make sure your current IP address is allowed under Atlas → Network Access, 
> or temporarily allow `0.0.0.0/0` for local development.

### 4. Run the server
```bash
node src/server.js
```
The API will be running at `http://localhost:5000`.

### 5. Run the test suite
```bash
npm test
```
This runs all backend tests sequentially (`--runInBand`) against your configured Atlas database, 
since the project intentionally avoids in-memory/mocked databases for testing.

To generate a coverage report:
```bash
npm test -- --coverage
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |

### Vehicles (Protected — requires `Authorization: Bearer <token>`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/vehicles` | Add a new vehicle | Any logged-in user |
| GET | `/api/vehicles` | List all vehicles | Any logged-in user |
| GET | `/api/vehicles/search` | Search by make, model, category, or price range | Any logged-in user |
| PUT | `/api/vehicles/:id` | Update vehicle details | Any logged-in user |
| DELETE | `/api/vehicles/:id` | Delete a vehicle | Admin only |
| POST | `/api/vehicles/:id/purchase` | Purchase a vehicle (decreases quantity) | Any logged-in user |
| POST | `/api/vehicles/:id/restock` | Restock a vehicle (increases quantity) | Admin only |

## Test Report

_(Paste your latest `npm test -- --coverage` output table here once finalized)_

## My AI Usage

_(To be completed — see instructions in the kata brief)_