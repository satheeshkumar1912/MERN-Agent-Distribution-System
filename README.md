# MERN Agent Distribution System

This project is a lightweight MERN stack app designed for managing agents and distributing uploaded contact lists evenly among them. It includes a clean React-based admin dashboard and a Node.js + Express backend that interacts with MongoDB for data storage.


🚀 Tech Stack

- Frontend: React
- Backend: Node.js + Express
- Database: MongoDB


🧠 What It Does

- Provides admin login with JWT authentication (a default admin user is created automatically).
- Lets admins add, list, and delete agents easily.
- Allows uploading CSV or Excel files containing contact data.
- Automatically distributes contacts evenly among available agents.
- Stores all details securely in MongoDB.
- Displays per-agent assignments on a simple, user-friendly dashboard.


📂 Project Structure

- backend/ → Server code, database models, uploads directory
- frontend/ → React-based admin UI (includes login, dashboard, agent management, file upload, etc.)


⚙️ Getting Started (Local Setup)

1. Start MongoDB:

You can use a local MongoDB instance or connect to a MongoDB Atlas cluster.

2. Run the Backend:

cd backend
npm install

# Create an .env file inside the backend folder (see below)

npm start

3. Run the Frontend

cd frontend
npm install
npm start

Once both are running, open your browser and visit:
👉 http://localhost:3000


🔑 Environment Variables (backend/.env)

Create a file named .env inside the backend directory with the following values:

PORT=5000
MONGODB_URI=mongodb://localhost:27017/cstechmk
JWT_SECRET=your_secure_jwt_secret_here

To generate a strong JWT secret:

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"


👨‍💻 Default Admin Credentials

Use these for the first login (development mode):

- Email: admin@example.com
- Password: admin123

The system automatically creates this default user the first time the backend connects to MongoDB.


📤 File Upload Requirements

- Supported formats: .csv, .xlsx, .xls
- Required columns:
  - firstName (or FirstName)
  - phone (or Phone)
  - notes (or Notes)

Maximum upload size: 10 MB (configured via multer in the backend)


🔒 Security & Deployment Notes

- The .env file is excluded from version control (.gitignore).
- Keep your JWT_SECRET safe and rotate it periodically.
- After changing the secret, restart the backend — previous tokens will no longer be valid.
- Suitable for local development and can be deployed to any Node.js-supported environment.


💡 Summary:

This app makes it simple to manage agents and distribute contact lists fairly and automatically. It’s a solid base for any system that requires data assignment, team distribution, or lead management.
