# בית הכנסת (Synagogue Management System)

This is a fullstack application for managing synagogue information, events, and user roles.

## Setup Instructions

### Prerequisites
- Node.js (v14 or newer)
- MongoDB (local or Atlas)

### Server Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file with the following variables:
```
JWT_SECRET=your_super_secret_key_here
MONGODB_URI=mongodb://localhost:27017/synagogue
PORT=3002
```

4. Initialize the database with default data:
```bash
npm run init-db
```

5. Start the server:
```bash
npm start
```

### Client Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the client development server:
```bash
npm run dev
```

## Features

- User authentication with role-based access control
- Synagogue location and opening hours management
- Calendar events and reminders
- Aliyot tracking and debts management
- Mobile-responsive interface

## Default Admin Login

After initializing the database, you can log in with the default admin account:
- Phone: 0500000000
- Password: admin123

## File Structure

- `/client` - React frontend
- `/server` - Express.js backend
  - `/models` - MongoDB schemas
  - `/routes` - API endpoints
  - `/middleware` - Auth and verification middlewares

## Running in Production

1. Build the client:
```bash
cd client && npm run build
```

2. Start the server:
```bash
cd server && npm start
```

## Troubleshooting

If you encounter issues:

1. Ensure MongoDB is running
2. Verify .env variables are set correctly
3. Check the correct port is being used (3002 for server, 5173 for client)
4. For database issues, try running the init-db script again
