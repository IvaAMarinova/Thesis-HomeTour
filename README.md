# 🏠 Real Estate Virtual Tour Platform
🔴 IN PROGRESS

## 📄 Project Overview
This project is an online platform for virtual apartment tours. It allows buyers and sellers to interact through a web interface, featuring 3D property visualizations and virtual tours. 

🏫 The project is my thesis project in 12th grade at Technological School of Electronic Systems.

## 💻 Technologies Used
- **Frontend**: ⚛️ ReactJS
- **Backend**: 🟢 Node.js, 🛡️ NestJS
- **Database**: 🐘 PostgreSQL
- **3D Engine**: 🎮 Unity

## ⚙️ Functional Requirements
1. **🔐 User Authentication**: Registration and login for buyers and sellers.
2. **🔎 Property Search**: Browse and search properties based on criteria.
3. **🏡 Virtual Tours**: 3D visualization and virtual tours of selected properties.
4. **📊 Seller Dashboard**: Admin panel for sellers to manage listings.
5. **👤 Buyer Profile**: Personalized user profile for buyers.

## 🚀 Setup Instructions

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
   The frontend should now be running on `http://localhost:5173`.

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the backend directory and add necessary environment variables (e.g., database connection string, JWT secret).
4. Start the Docker containers:
   ```
   docker compose up
   ```
   This will start all the necessary services defined in your docker-compose.yml file.
5. Start the backend server:
   ```
   npm run start
   ```
   The backend should now be running on `http://localhost:3001`.


After completing these steps, both the frontend and backend should be running, connected to the database, and ready for development or testing.

