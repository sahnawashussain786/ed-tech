# LearnHub - MERN Ed-Tech Platform

A full-featured online learning platform (Udemy/Coursera clone) built with the MERN stack. Features instructor course uploads, student purchases, an immersive lesson player, reviews, and more.

## 🚀 Features

### For Students
- **Browse & Discover**: Search and filter courses by category, level, and popularity
- **Course Details**: View comprehensive course information, curriculum, and reviews
- **Secure Checkout**: Mock payment processing for course enrollment
- **Learning Dashboard**: Track enrolled courses and progress
- **Immersive Learning Player**: Dark-themed video player with lesson navigation
- **Reviews & Ratings**: Share feedback on completed courses

### For Instructors
- **Studio Dashboard**: Manage courses, track students and revenue
- **Course Editor**: Create and edit courses with rich content
- **Lesson Management**: Add video lessons with resources
- **Publishing Control**: Draft and publish courses
- **Performance Analytics**: View course statistics

### Platform Features
- **Authentication**: JWT-based auth with role-based access (student/instructor)
- **Responsive Design**: Mobile-first UI with Tailwind CSS v4
- **Modern Stack**: React 19, Vite, Express 5, MongoDB, Mongoose
- **RESTful API**: Clean API architecture with proper error handling
- **Real-time Updates**: Hot module reloading for development

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB (local installation or MongoDB Atlas account)
- Git

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ED-Platform
```

### 2. Install Dependencies

Install root dependencies and subproject dependencies:

```bash
npm run install-all
```

Or manually:

```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Environment Setup

Create environment files:

**Root `.env`** (optional, for reference):
```bash
# Copy the example file
cp .env.example .env
```

**Server `.env`** (required):
```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your configuration:

```bash
# MongoDB connection string
MONGODB_URI=mongodb://127.0.0.1:27017/learnhub
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/learnhub

# JWT secret for authentication
JWT_SECRET=your-long-random-secret-string

# Client URL for CORS
CLIENT_URL=http://localhost:5173

# API port
PORT=5000

# Force seed even if data exists
SEED_FORCE=false
```

**Client `.env`** (optional):
```bash
cd client
cp .env.example .env
```

Edit `client/.env`:

```bash
# API URL (uses relative path in development by default)
VITE_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB

**Local MongoDB:**
```bash
# On Windows
mongod

# On macOS/Linux
sudo mongod
# or using Homebrew
brew services start mongodb-community
```

**MongoDB Atlas:**
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update `MONGODB_URI` in `server/.env`

### 5. Seed the Database

Populate the database with demo courses and users:

```bash
cd server
npm run seed
```

For a fresh database (deletes existing data):
```bash
npm run seed:fresh
```

## 🚀 Running the Application

### Development Mode

Run both API and client with hot reloading:

```bash
npm run dev
```

This starts:
- API server at `http://localhost:5000`
- React dev server at `http://localhost:5173`

Or run separately:

```bash
# Terminal 1 - API
npm run dev:api

# Terminal 2 - Client
npm run dev:web
```

### Production Build

Build the client for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## 📁 Project Structure

```
ED-Platform/
├── api/                    # Vercel API handler (deployment)
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React Context (Auth)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities (API, formatting)
│   │   ├── pages/         # Page components
│   │   └── main.jsx       # React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── scripts/       # Seed script
│   │   ├── utils/         # Utilities
│   │   ├── app.js         # Express app setup
│   │   └── server.js      # Server entry point
│   └── package.json
├── .env.example           # Environment variables template
├── package.json           # Root package.json
├── vercel.json            # Vercel deployment config
└── README.md
```

## 🔑 Demo Accounts

After seeding, the login page shows one-click demo account buttons. You can also use these credentials manually:

**Student** (enrolled in 2 courses, has purchase history):
- Email: `student@learnhub.dev`
- Password: `password123`

**Instructor** (owns 3 courses):
- Email: `instructor@learnhub.dev`
- Password: `password123`

**Instructor** (owns 3 courses):
- Email: `grace@learnhub.dev`
- Password: `password123`

## 🧪 Testing

The application includes API endpoints for all features. Test with:

```bash
# Get all courses
curl http://localhost:5000/api/courses

# Get single course
curl http://localhost:5000/api/courses/<course-id>

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123"}'
```

## 🚢 Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Import your repository on [Vercel](https://vercel.com)
   - Vercel will detect the project automatically
   - Configure environment variables in Vercel dashboard:
     - `MONGODB_URI` - Your MongoDB connection string
     - `JWT_SECRET` - Your JWT secret
     - `CLIENT_URL` - Your Vercel domain (auto-set)
     - `PORT` - Set to `5000` (or Vercel's default)

3. **Seed Production Database**
   - Run the seed script once after deployment:
     ```bash
     # Connect to your production database and run
     node server/src/scripts/seed.js
     ```

### Manual Deployment

**Build Client:**
```bash
cd client
npm run build
```

**Serve with API:**
- The Express app serves static files from `client/dist` in production
- Ensure `client/dist` exists before starting the server

**Using PM2 (Process Manager):**
```bash
npm install -g pm2
pm2 start server/src/server.js --name learnhub
pm2 save
pm2 startup
```

## 🔧 Configuration

### MongoDB Connection

**Local:**
```bash
MONGODB_URI=mongodb://127.0.0.1:27017/learnhub
```

**MongoDB Atlas:**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/learnhub?retryWrites=true&w=majority
```

### CORS Configuration

Update `CLIENT_URL` in `server/.env` to match your frontend domain:

```bash
# Development
CLIENT_URL=http://localhost:5173

# Production
CLIENT_URL=https://your-domain.vercel.app
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**
1. Ensure MongoDB is running: `mongod`
2. Check your `MONGODB_URI` in `server/.env`
3. If using Atlas, whitelist your IP in MongoDB Atlas dashboard
4. Check firewall settings

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find and kill the process using port 5000
# On Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Client Build Errors

**Error:** Module not found or build failures

**Solution:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Loading

**Error:** `MONGODB_URI is not set`

**Solution:**
1. Ensure `.env` file exists in `server/` directory
2. Check file name is exactly `.env` (not `.env.txt`)
3. Restart the server after creating `.env`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List courses (with filters)
- `GET /api/courses/:id` - Get single course
- `GET /api/courses/:id/learn` - Get course for learning (enrolled only)

### Instructor
- `GET /api/instructor/courses` - List instructor's courses
- `POST /api/instructor/courses` - Create course
- `PUT /api/instructor/courses/:id` - Update course
- `DELETE /api/instructor/courses/:id` - Delete course
- `GET /api/instructor/stats` - Get instructor statistics

### Enrollments
- `POST /api/enrollments/:courseId` - Enroll in course
- `GET /api/enrollments` - List user enrollments
- `GET /api/enrollments/stats` - Get enrollment statistics
- `POST /api/enrollments/:courseId/lessons/:lessonId/complete` - Mark lesson complete

### Reviews
- `GET /api/reviews/course/:courseId` - Get course reviews
- `POST /api/reviews/course/:courseId` - Create review

### Users
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Backend with [Express](https://expressjs.com/)
- Database with [MongoDB](https://www.mongodb.com/)
- Icons from [Lucide](https://lucide.dev/)
#   e d - t e c h  
 