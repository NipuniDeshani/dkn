# DKN - Functionality to File & REST API Mapping

---

## Authentication

| Functionality | File | REST API |
|---------------|------|----------|
| User Login | `authController.js`, `authRoutes.js` | `loginUser()` POST `/api/auth/login` |
| User Registration | `authController.js`, `authRoutes.js` | `registerUser()` POST `/api/auth/register` |
| Get Current User | `authController.js`, `authRoutes.js` | `getMe()` GET `/api/auth/me` |

---

## Knowledge Management

| Functionality | File | REST API |
|---------------|------|----------|
| Upload Knowledge Item | `knowledgeController.js`, `knowledgeRoutes.js` | `uploadKnowledge()` POST `/api/knowledge` |
| Get All Knowledge Items | `knowledgeController.js`, `knowledgeRoutes.js` | `getKnowledgeItems()` GET `/api/knowledge` |
| Get Single Knowledge Item | `knowledgeController.js`, `knowledgeRoutes.js` | `getKnowledgeById()` GET `/api/knowledge/:id` |
| Update Knowledge Item | `knowledgeController.js`, `knowledgeRoutes.js` | `updateKnowledge()` PUT `/api/knowledge/:id` |
| Review Knowledge | `knowledgeController.js`, `knowledgeRoutes.js` | `reviewKnowledge()` PUT `/api/knowledge/:id/review` |
| Approve Knowledge Item | `knowledgeController.js`, `knowledgeRoutes.js` | `reviewKnowledge()` PUT `/api/knowledge/:id/approve` |
| Manage Quality | `knowledgeController.js`, `knowledgeRoutes.js` | `manageQuality()` PUT `/api/knowledge/:id/quality` |
| Archive Knowledge Item | `knowledgeController.js`, `knowledgeRoutes.js` | `archiveKnowledge()` PUT `/api/knowledge/:id/archive` |

---

## Validation Workflow

| Functionality | File | REST API |
|---------------|------|----------|
| Create Validation Request | `validationController.js`, `validationRoutes.js` | `createValidation()` POST `/api/validations` |
| Get All Validations | `validationController.js`, `validationRoutes.js` | `getValidations()` GET `/api/validations` |
| Update Validation Status | `validationController.js`, `validationRoutes.js` | `updateValidation()` PUT `/api/validations/:id` |
| Reassign Validation | `validationController.js`, `validationRoutes.js` | `reassignValidation()` PUT `/api/validations/:id/reassign` |

---

## Leaderboard & Gamification

| Functionality | File | REST API |
|---------------|------|----------|
| Get Leaderboard Rankings | `leaderboardController.js`, `leaderboardRoutes.js` | `getLeaderboard()` GET `/api/leaderboard` |
| Get My Stats | `leaderboardController.js`, `leaderboardRoutes.js` | `getMyStats()` GET `/api/leaderboard/me` |
| Get Top By Category | `leaderboardController.js`, `leaderboardRoutes.js` | `getTopByCategory()` GET `/api/leaderboard/top/:category` |

---

## Recommendations

| Functionality | File | REST API |
|---------------|------|----------|
| Get Personalized Recommendations | `recommendationController.js`, `recommendationRoutes.js` | `getRecommendations()` GET `/api/recommendations` |
| Record User Interaction | `recommendationController.js`, `recommendationRoutes.js` | `recordInteraction()` POST `/api/recommendations/interaction` |
| Get Trending Content | `recommendationController.js`, `recommendationRoutes.js` | `getTrending()` GET `/api/recommendations/trending` |

---

## Data Migration

| Functionality | File | REST API |
|---------------|------|----------|
| Get All Migrations | `migrationController.js`, `migrationRoutes.js` | `getMigrations()` GET `/api/migration` |
| Get Single Migration | `migrationController.js`, `migrationRoutes.js` | `getMigrationById()` GET `/api/migration/:id` |
| Create Migration | `migrationController.js`, `migrationRoutes.js` | `createMigration()` POST `/api/migration` |
| Start Migration | `migrationController.js`, `migrationRoutes.js` | `startMigration()` POST `/api/migration/:id/start` |
| Cancel Migration | `migrationController.js`, `migrationRoutes.js` | `cancelMigration()` POST `/api/migration/:id/cancel` |

---

## Mentorship

| Functionality | File | REST API |
|---------------|------|----------|
| Get Available Mentors | `mentorshipController.js`, `mentorshipRoutes.js` | `getAvailableMentors()` GET `/api/mentorship/mentors` |
| Get My Mentorships | `mentorshipController.js`, `mentorshipRoutes.js` | `getMentorships()` GET `/api/mentorship` |
| Request Mentorship | `mentorshipController.js`, `mentorshipRoutes.js` | `createMentorship()` POST `/api/mentorship` |
| Update Mentorship | `mentorshipController.js`, `mentorshipRoutes.js` | `updateMentorship()` PUT `/api/mentorship/:id` |
| Schedule Session | `mentorshipController.js`, `mentorshipRoutes.js` | `addSession()` POST `/api/mentorship/:id/sessions` |
| Add Feedback | `mentorshipController.js`, `mentorshipRoutes.js` | `addFeedback()` POST `/api/mentorship/:id/feedback` |

---

## Training

| Functionality | File | REST API |
|---------------|------|----------|
| Get My Progress | `trainingController.js`, `trainingRoutes.js` | `getMyProgress()` GET `/api/training/my-progress` |
| Get Training Sessions | `trainingController.js`, `trainingRoutes.js` | `getSessions()` GET `/api/training/sessions` |
| Create Training Session | `trainingController.js`, `trainingRoutes.js` | `createSession()` POST `/api/training/sessions` |
| Register For Session | `trainingController.js`, `trainingRoutes.js` | `registerForSession()` POST `/api/training/sessions/:id/register` |
| Mark Attendance | `trainingController.js`, `trainingRoutes.js` | `markAttendance()` PUT `/api/training/sessions/:id/attendance` |
| Get All Training Modules | `trainingController.js`, `trainingRoutes.js` | `getModules()` GET `/api/training` |
| Create Training Module | `trainingController.js`, `trainingRoutes.js` | `createModule()` POST `/api/training` |
| Get Single Training Module | `trainingController.js`, `trainingRoutes.js` | `getModuleById()` GET `/api/training/:id` |
| Enroll In Module | `trainingController.js`, `trainingRoutes.js` | `enrollInModule()` POST `/api/training/:id/enroll` |
| Update Progress | `trainingController.js`, `trainingRoutes.js` | `updateProgress()` PUT `/api/training/:id/progress` |
| Rate Module | `trainingController.js`, `trainingRoutes.js` | `rateModule()` POST `/api/training/:id/rate` |

---

## Audit Logging

| Functionality | File | REST API |
|---------------|------|----------|
| Get Content Audit Logs | `auditController.js`, `auditRoutes.js` | `getContentAuditLogs()` GET `/api/audit/content` |
| Get Item Audit Trail | `auditController.js`, `auditRoutes.js` | `getItemAuditTrail()` GET `/api/audit/content/:id` |
| Get Audit Summary | `auditController.js`, `auditRoutes.js` | `getAuditSummary()` GET `/api/audit/summary` |
| Create Audit Entry | `auditController.js`, `auditRoutes.js` | `createAuditEntry()` POST `/api/audit` |

---

## Administration

| Functionality | File | REST API |
|---------------|------|----------|
| Get Audit Logs (Admin) | `adminController.js`, `adminRoutes.js` | `getAuditLogs()` GET `/api/admin/audit-logs` |
| Get System Stats | `adminController.js`, `adminRoutes.js` | `getSystemStats()` GET `/api/admin/stats` |
| Get All Users | `adminController.js`, `adminRoutes.js` | `getUsers()` GET `/api/admin/users` |
| Create User | `adminController.js`, `adminRoutes.js` | `createUser()` POST `/api/admin/users` |
| Update User | `adminController.js`, `adminRoutes.js` | `updateUser()` PUT `/api/admin/users/:id` |
| Delete User | `adminController.js`, `adminRoutes.js` | `deleteUser()` DELETE `/api/admin/users/:id` |
| Update User Role | `adminController.js`, `adminRoutes.js` | `updateUserRole()` PUT `/api/admin/users/:id/role` |
| Get Migrations (Admin) | `adminController.js`, `adminRoutes.js` | `getMigrations()` GET `/api/admin/migrations` |
| Get Configurations | `adminController.js`, `adminRoutes.js` | `getConfigurations()` GET `/api/admin/config` |
| Update Configuration | `adminController.js`, `adminRoutes.js` | `updateConfiguration()` PUT `/api/admin/config/:key` |

---

## Dashboard

| Functionality | File | REST API |
|---------------|------|----------|
| Get Dashboard Stats | `dashboardController.js`, `dashboardRoutes.js` | `getDashboardStats()` GET `/api/dashboard/stats` |
| Get Manager Stats | `dashboardController.js`, `dashboardRoutes.js` | `getManagerStats()` GET `/api/dashboard/manager` |
| Get Governance Stats | `dashboardController.js`, `dashboardRoutes.js` | `getGovernanceStats()` GET `/api/dashboard/governance` |

---

## AI Chatbot

| Functionality | File | REST API |
|---------------|------|----------|
| Send Message to AI | `chatbotController.js`, `chatbotRoutes.js` | `sendMessage()` POST `/api/chatbot/message` |

---

## Services (Business Logic)

| Functionality | File | Method |
|---------------|------|--------|
| AI Tag Generation | `aiService.js` | `generateTags(text)` |
| AI Similarity Check | `aiService.js` | `checkSimilarity(text, excludeId)` |
| AI Recommendations | `aiService.js` | `getRecommendations(userId)` |
| AI Expertise Mapping | `aiService.js` | `mapExpertise(userId)` |
| AI Skill Gap Identification | `aiService.js` | `identifySkillGaps(userId)` |
| AI Outdated Content Detection | `aiService.js` | `detectOutdatedContent()` |
| AI Redundant Content Detection | `aiService.js` | `detectRedundantContent()` |
| AI Summary Generation | `aiService.js` | `generateSummary(text)` |
| **AI Chatbot** | `chatbotService.js` | `chat(message, user, history)` |
| Recommendation Engine | `RecommendationEngine.js` | `getRecommendations(userId)` |
| Content Validation | `ValidationService.js` | `validateContent(content)` |
| Data Migration Import | `MigrationHandler.js` | `importData(sourcePath)` |
| Data Migration Export | `MigrationHandler.js` | `exportData(targetSystem, query)` |
| Governance Policy Enforcement | `GovernanceService.js` | `enforcePolicy(item)` |
| Governance Audit Action | `GovernanceService.js` | `auditAction(actionData)` |

---

## Models (Database Schemas)

| Functionality | File | Schema Fields |
|---------------|------|---------------|
| User Data | `User.js` | username, email, password, role, skills, region |
| Knowledge Item Data | `KnowledgeItem.js` | title, description, category, tags, author, status |
| Validation Data | `Validation.js` | knowledgeItem, assignedReviewer, status, priority |
| Leaderboard Data | `Leaderboard.js` | user, scores, totalScore, rank, badges, streaks |
| Recommendation Data | `Recommendation.js` | user, type, recommendations, skillGaps |
| Migration Data | `Migration.js`, `MigrationHandler.js` | batchId, source, status, statistics, progress |
| Mentorship Data | `Mentorship.js` | mentor, mentee, status, goals, sessions, feedback |
| Training Data | `TrainingModule.js` | title, description, category, content, enrollments |
| Audit Log Data | `AuditLog.js` | action, actor, target, targetModel, details |
| Configuration Data | `Configuration.js` | key, value, category, description, isEditable |
| Repository Data | `Repository.js` | name, description, owner, type, items, accessControl |

---

## React Components (Frontend)

### Pages

| Functionality | File | Description |
|---------------|------|-------------|
| Login Page | `Login.jsx` | User authentication form with email/password |
| Main Dashboard | `Dashboard.jsx` | Routes to role-specific dashboards |
| User Profile | `Profile.jsx` | View and edit user profile, settings |
| Governance Review | `GovernanceReview.jsx` | Policy compliance review workflow |
| Migration Management | `MigrationPage.jsx` | Full migration management interface |

### Role-Specific Dashboards

| Functionality | File | Description |
|---------------|------|-------------|
| Admin Dashboard | `AdminDashboard.jsx` | System stats, user management, config |
| Consultant Dashboard | `ConsultantDashboard.jsx` | Knowledge uploads, recommendations |
| Champion Dashboard | `ChampionDashboard.jsx` | Validation queue, content review |
| Manager Dashboard | `ManagerDashboard.jsx` | Team performance, analytics |
| Governance Dashboard | `GovernanceDashboard.jsx` | Policy compliance, audit logs |

### Knowledge Components

| Functionality | File | Description |
|---------------|------|-------------|
| Upload Form | `UploadForm.jsx` | Knowledge upload with file attachments |
| Knowledge Detail | `KnowledgeDetail.jsx` | View single knowledge item with AI insights |
| Search Bar | `SearchBar.jsx` | Search knowledge base with filters |
| Validation Queue | `ValidationQueue.jsx` | Pending items for review/approval |
| Quality Review Panel | `QualityReviewPanel.jsx` | Quality scoring and flagging |

### Gamification Components

| Functionality | File | Description |
|---------------|------|-------------|
| Leaderboard | `Leaderboard.jsx` | Rankings, scores, AI predictions |
| Recommendations | `Recommendations.jsx` | Personalized content suggestions |

### Management Components

| Functionality | File | Description |
|---------------|------|-------------|
| Migration Panel | `MigrationPanel.jsx` | Migration job management |
| Mentorship Panel | `MentorshipPanel.jsx` | Mentor matching, sessions, goals |
| Training Management | `TrainingManagementPanel.jsx` | Course management, enrollments |
| Audit Log Viewer | `AuditLogViewer.jsx` | View and filter audit logs |
| System Health Panel | `SystemHealthPanel.jsx` | AI/NLP/Indexing service status |
| Performance Detail | `PerformanceDetailPanel.jsx` | Team analytics and performance |

### Utility Components

| Functionality | File | Description |
|---------------|------|-------------|
| Navigation Bar | `Navbar.jsx` | Role-based navigation menu |
| Protected Route | `ProtectedRoute.jsx` | Route authentication guard |
| Error Boundary | `ErrorBoundary.jsx` | Graceful error handling with recovery |
| **AI Chat Widget** | `ChatWidget.jsx` | Floating AI chatbot powered by Gemini |

---

## Context & Services (Frontend)

| Functionality | File | Description |
|---------------|------|-------------|
| Auth Context | `AuthContext.jsx` | Authentication state management |
| API Service | `api.js` | Axios HTTP client for backend calls |
