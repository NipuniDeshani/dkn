# DKN - Digital Knowledge Network

<div align="center">

![DKN Logo](https://img.shields.io/badge/DKN-Enterprise-blue?style=for-the-badge&logo=bookopen)

**A Modern Knowledge Management Platform for Enterprise Teams**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue?logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green?logo=mongodb)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3+-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📤 **Knowledge Upload** | Submit documents, presentations, and templates with AI-powered tagging |
| ✅ **Validation Workflow** | Multi-stage review process with Knowledge Champions |
| 🏆 **Gamification** | Leaderboard with points system to encourage contributions |
| 🧠 **AI Rank Prediction** | Predict future rankings with personalized improvement tips |
| 🤖 **AI Chatbot** | Gemini-powered assistant for instant help and platform navigation |
| 👥 **User Management** | Full CRUD operations for administrators |
| 📊 **Audit Logs** | Track all system activities with detailed timestamps |
| 🔐 **Role-Based Access** | 5 distinct roles with granular permissions |
| 🛡️ **Governance Review** | Policy compliance verification by Governance Council |
| 💾 **Data Migrations** | Import legacy data from external systems |
| 💡 **AI Recommendations** | Personalized content suggestions with trending insights |
| 🎓 **Mentorship** | Find mentors, schedule sessions, and track growth |
| 📚 **Training** | Enroll in courses, take quizzes, and earn certifications |
| 🖥️ **System Health** | Monitor AI Engine, NLP, and Indexing service status |
| 🛡️ **Error Handling** | Graceful error boundaries prevent white-screen crashes |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **MongoDB** (local or Atlas cloud)
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/dkn.git
cd dkn

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Configuration

Create a `.env` file in the `/server` folder:

```env
MONGO_URI=mongodb://localhost:27017/dkn
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note:** Get a free Gemini API key at https://aistudio.google.com/apikey for the AI Chatbot feature.

### Database Setup

#### Option 1: MongoDB Compass (Recommended for Beginners)

1. **Download & Install MongoDB Compass**
   - Download from: https://www.mongodb.com/try/download/compass
   - Install and launch MongoDB Compass

2. **Connect to MongoDB**
   - Open MongoDB Compass
   - In the connection string field, enter:
     ```
     mongodb://localhost:27017
     ```
   - Click **"Connect"**

3. **Create the Database**
   - Once connected, click **"Create Database"**
   - Database Name: `dkn`
   - Collection Name: `users`
   - Click **"Create Database"**

4. **Verify Connection**
   - You should see the `dkn` database in the left sidebar
   - The seeder will automatically create all required collections

> **Note:** Make sure MongoDB service is running on your machine before connecting. On Windows, check Services for "MongoDB Server".

#### Option 2: Command Line

```bash
cd server
node seeder.js    # Creates sample users and data
```

The seeder will automatically:
- Connect to MongoDB at `mongodb://localhost:27017/dkn`
- Create all required collections
- Populate with sample data and test users

After seeding, you can view the data in MongoDB Compass by refreshing the database.

### Run the Application

**Terminal 1 - Backend:**
```bash
cd server
node app.js
# ✅ Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# ✅ Client running on http://localhost:5173
```

---

## � API Documentation (Swagger)

DKN includes interactive API documentation powered by **Swagger/OpenAPI 3.0**.

### Accessing Swagger UI

Once the server is running, open your browser and navigate to:

```
http://localhost:5000/api-docs
```

### Features

| Feature | Description |
|---------|-------------|
| 📋 **Interactive Docs** | Browse all 50+ API endpoints with detailed descriptions |
| 🔐 **Authentication** | Test protected routes using JWT Bearer tokens |
| 🧪 **Try It Out** | Execute API calls directly from the browser |
| 📝 **Request/Response Schemas** | View expected payloads and responses |

### How to Authenticate in Swagger

1. First, call `POST /api/auth/login` with your credentials
2. Copy the `token` from the response
3. Click the **Authorize** button (top right)
4. Enter: `Bearer <your-token>`
5. Click **Authorize** - now all protected endpoints will work!

### API Categories

- **Authentication** - Login, Register, Get Current User
- **Knowledge** - CRUD operations, Review, Archive
- **Dashboard** - Statistics for different roles
- **Validation** - Content approval workflow
- **Leaderboard** - Rankings and gamification
- **Admin** - User management, System config
- **Recommendations** - AI-powered suggestions
- **Audit** - Activity logging
- **Migration** - Data import/export
- **Mentorship** - Mentor matching and sessions
- **Training** - Courses and progress tracking
- **Chatbot** - AI-powered assistant

---

## �👤 User Accounts

| Role | Email | Password |
|------|-------|----------|
| 👨‍💼 Consultant | consultant@dkn.com | password123 |
| 🏅 Knowledge Champion | champion@dkn.com | password123 |
| 📋 Project Manager | manager@dkn.com | password123 |
| ⚙️ **Administrator** | **admin@dkn.com** | **123456** |
| 🛡️ Governance Council | governance@dkn.com | password123 |

---

## 🎭 Role Permissions Matrix

| Permission | Consultant | KC | PM | Admin | GC |
|------------|:----------:|:--:|:--:|:-----:|:--:|
| View Knowledge Base | ✅ | ✅ | ✅ | ✅ | ✅ |
| Upload Knowledge | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Own Uploads | ✅ | ✅ | ✅ | ✅ | ✅ |
| Review/Approve Items | ❌ | ✅ | ❌ | ✅ | ✅ |
| Access Validation Queue | ❌ | ✅ | ❌ | ✅ | ✅ |
| View Team Performance | ❌ | ❌ | ✅ | ✅ | ❌ |
| Manage Users | ❌ | ❌ | ❌ | ✅ | ❌ |
| View Audit Logs | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage Migrations | ❌ | ❌ | ❌ | ✅ | ✅ |
| Governance Review | ❌ | ❌ | ❌ | ✅ | ✅ |
| System Configuration | ❌ | ❌ | ❌ | ✅ | ❌ |
| Manage Mentorships | ✅ | ✅ | ✅ | ✅ | ❌ |
| Access Training | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage Training Content | ❌ | ✅ | ❌ | ✅ | ❌ |

*KC = Knowledge Champion, PM = Project Manager, GC = Governance Council*

---

## 📁 Project Structure

```
dkn/
├── 📂 client/                    # React Frontend
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── dashboards/       # Role-specific dashboards
│   │   │   ├── ChatWidget.jsx    # AI Chatbot floating widget
│   │   │   ├── Navbar.jsx        # Navigation with role-based links
│   │   │   ├── UploadForm.jsx    # Knowledge upload form
│   │   │   ├── MigrationPanel.jsx # Data migration management
│   │   │   └── ...
│   │   ├── pages/                # Page components
│   │   │   ├── Login.jsx         # Authentication page
│   │   │   ├── Dashboard.jsx     # Main dashboard router
│   │   │   ├── GovernanceReview.jsx  # Governance review workflow
│   │   │   └── MigrationPage.jsx     # Migration management
│   │   ├── services/             # API service layer
│   │   └── context/              # React context (Auth)
│   └── package.json
│
├── 📂 server/                    # Express Backend
│   ├── controllers/              # Route handlers
│   │   ├── knowledgeController.js
│   │   ├── validationController.js
│   │   ├── migrationController.js
│   │   └── ...
│   ├── models/                   # MongoDB schemas
│   │   ├── User.js
│   │   ├── KnowledgeItem.js
│   │   ├── MigrationHandler.js
│   │   └── ...
│   ├── routes/                   # API route definitions
│   ├── middleware/               # Auth & RBAC middleware
│   ├── services/                 # Business logic (AI, Migration, Chatbot)
│   ├── seeder.js                 # Database seeder
│   └── app.js                    # Server entry point
│
└── README.md                     # This file
```

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| GET | `/api/auth/me` | Get current user |

### Knowledge
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/knowledge` | List all knowledge items |
| POST | `/api/knowledge` | Upload new knowledge |
| GET | `/api/knowledge/:id` | Get single item |
| PUT | `/api/knowledge/:id` | Update item |
| POST | `/api/knowledge/:id/review` | Review item |

### Migrations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/migration` | List all migrations |
| POST | `/api/migration` | Create new migration |
| POST | `/api/migration/:id/start` | Start migration |
| POST | `/api/migration/:id/cancel` | Cancel migration |

### Mentorship
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mentorship` | List mentorships |
| POST | `/api/mentorship` | Request mentorship |
| POST | `/api/mentorship/:id/sessions` | Schedule session |

### Training
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/training` | List training modules |
| POST | `/api/training` | Create module |
| POST | `/api/training/:id/enroll` | Enroll in course |

### AI Chatbot
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/message` | Send message to AI assistant |

---

## 🔧 Quick Commands

```bash
# Stop all Node processes (PowerShell)
Get-Process -Name "node" | Stop-Process -Force

# Restart backend
cd server && node app.js

# Restart frontend
cd client && npm run dev

# Re-seed database
cd server && node seeder.js

# Seed sample migrations
cd server && node seed-migration.js
```

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| **Port already in use** | Run `Get-Process -Name "node" | Stop-Process -Force` |
| **MongoDB not connecting** | Ensure MongoDB is running; check `MONGO_URI` in `.env` |
| **Login not working** | Run `node seeder.js` to reset users |
| **403 Forbidden** | Check user role permissions for the route |
| **Migrations not loading** | Run `node seed-migration.js` to create sample data |

---

## 📚 Business Rules Implemented

1. ✅ **No Duplicate Uploads** - AI similarity check prevents near-duplicate content
2. ✅ **Default Pending State** - New uploads start as "Pending" for review
3. ✅ **KC Validation Required** - Only Knowledge Champions can approve content
4. ✅ **Comprehensive Audit Logging** - All actions are tracked
5. ✅ **Auto-Calculated Leaderboard** - Points system cannot be manually edited
6. ✅ **NLP Suggestions Require Approval** - AI tags need human review
7. ✅ **Legacy Imports Start Pending** - Migrated data requires validation

---

## 🎨 UI/UX Features

- **Modern Design** - Gradient accents, smooth animations, glassmorphism effects
- **Premium Dashboard Cards** - Hover effects with accent corners
- **Pill Navigation** - Modern tab switching with visual feedback
- **Responsive Layout** - Works on desktop and mobile
- **Role-Based Navigation** - Different menus per user role
- **Quick Action Cards** - Fast access to common tasks
- **Real-time Feedback** - Loading states, error messages
- **Error Boundary Protection** - Graceful error handling with recovery options

---

## 🤖 AI Features

| Feature | Location | Description |
|---------|----------|-------------|
| **AI Chatbot** | Floating Widget | Gemini-powered assistant for platform navigation and help |
| **AI Rank Prediction** | Leaderboard | Predicts your rank next week based on activity |
| **Growth Trend Analysis** | Leaderboard | Shows if you're Rising, Stable, or Declining |
| **Points to Next Rank** | Leaderboard | Calculates how many points needed to climb |
| **AI Improvement Tips** | Leaderboard | Personalized recommendations to boost ranking |
| **AI Insights** | Knowledge Detail | Sentiment analysis, readability scores, keywords |
| **Trending Analysis** | Recommendations | AI score, keywords, and engagement summaries |
| **Duplicate Detection** | Upload | Flags content with >80% similarity |
| **Auto-Tag Suggestions** | Upload | NLP-powered tag recommendations |

---



</div>
