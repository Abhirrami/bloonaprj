# Bloona - Blood Donation App

A blood donation platform connecting hospitals and donors.

## Features

- Hospital registration and login
- Donor registration and login
- Health report upload for donors
- Secure authentication
- MySQL database integration

## Tech Stack

- Frontend: React.js
- Backend: Node.js, Express.js
- Database: MySQL
- File Upload: Multer
- Authentication: JWT

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### Backend Setup

1. Navigate to the project root directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=bloona
   PORT=5000
   JWT_SECRET=your-secret-key
   ```
4. Import the database schema:
   ```bash
   mysql -u your_username -p < schema.sql
   ```
5. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Project Structure

```
bloona/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   └── App.js         # Main App component
├── server.js              # Backend server
├── schema.sql            # Database schema
└── package.json          # Backend dependencies
```

## API Endpoints

### Hospital
- POST /api/hospital/signup - Register a new hospital
- POST /api/hospital/login - Hospital login

### Donor
- POST /api/donor/signup - Register a new donor
- POST /api/donor/login - Donor login

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 