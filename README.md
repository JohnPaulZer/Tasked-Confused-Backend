# To-Do List Application - Complete Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [Backend Documentation](#backend-documentation)
4. [Frontend Documentation](#frontend-documentation)
5. [Key Features](#key-features)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)
8. [Authentication Flow](#authentication-flow)

---

## 🎯 Project Overview

**To-Do List** is a full-stack task management application built with:

- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + Express + MongoDB + JWT
- **Key Purpose:** Manage tasks with authentication, OTP verification, and password recovery

---

## 📁 Folder Structure

### Backend Structure

```
backend/src/
├── config/              # Configuration files (mail config)
├── controller/          # Route handlers (business logic)
│   ├── auth.ts         # Authentication endpoints
│   └── taskCon.ts      # Task CRUD operations
├── db/                 # Database connections
├── middlewares/        # Express middleware
│   ├── global-error-handler.middleware.ts
│   ├── limiter.middleware.ts
│   └── protectTask.ts  # JWT verification
├── models/             # MongoDB schemas
│   ├── user.ts         # User schema
│   └── task.ts         # Task schema
├── routes/             # API route definitions
│   ├── route.ts        # Auth routes
│   └── taskRoute.ts    # Task routes
├── types/              # TypeScript types/interfaces
├── validators/         # Input validation
├── dtos/               # Data Transfer Objects
├── utils/              # Utility functions
│   ├── error/          # Error handling
│   ├── generateToken.ts    # JWT generation
│   ├── mail.ts             # Email config
│   └── sendEmail.ts        # Send OTP emails
├── constants/          # App constants
└── index.ts            # Server entry point
```

### Frontend Structure

```
frontend/src/
├── components/         # React components organized by feature
│   ├── common/         # Reusable: Button, Input, Checkbox, Modal, Header
│   ├── task/           # Task-related: TaskCard, AddTaskForm, MainPageTaskList
│   ├── auth/           # Auth forms: SignupForm, PasswordChangeSection
│   ├── modals/         # Modal components: SignupModals, ProfileModal, HistoryModal
│   └── profile/        # Profile: Profile, ProfileHeader, ProfileDetailsSection
├── pages/              # Full page components
│   ├── Home.tsx
│   ├── LandPage.tsx
│   ├── Signup.tsx
│   ├── MainPage.tsx
│   ├── AddTask.tsx
│   ├── EditTask.tsx
│   ├── CreateTask.tsx
│   ├── ForgotPass.tsx
│   ├── ResetPass.tsx
│   ├── VerifyCode.tsx
│   └── NotFound.tsx
├── hooks/              # Custom React hooks
│   ├── usePasswordStrength.ts
│   └── useSignupValidation.ts
├── services/           # API services
│   └── api/            # API endpoints
├── axios/              # HTTP client configuration
├── types/              # TypeScript types
├── constants/          # Constants
├── utils/              # Utility functions
│   ├── validation/     # Validation logic
│   └── helpers/        # Helper functions (LegalModals)
├── layouts/            # Layout wrappers (ProtectedLayout)
├── animations/         # Animation files
├── assets/             # Images, fonts
├── App.tsx
├── main.tsx
└── index.css           # Global styles
```

---

## 🔐 Backend Documentation

### Authentication Controller (`controller/auth.ts`)

#### 1. **SIGNUP** - Register a new user

- **Endpoint:** `POST /api/auth/signup`
- **Body:** `{ name, email, password }`
- **Process:**
  1. Check if email already exists
  2. Hash password (salt rounds = 12)
  3. Create new user in MongoDB
  4. Generate JWT token and set HTTP-only cookie
- **Response:** `{ message, signup: { name } }`
- **Status:** 201 Created | 400 User exists | 500 Error

#### 2. **LOGIN** - Authenticate user and create session

- **Endpoint:** `POST /api/auth/login`
- **Body:** `{ email, password, rememberMe }`
- **Process:**
  1. Find user by email
  2. Compare provided password with hashed password
  3. Generate JWT token (expiry depends on rememberMe flag)
  4. Set HTTP-only cookie
- **Response:** `{ message, user: { _id, name, email, gender, mobile, address } }`
- **Status:** 200 Success | 400 Invalid credentials | 500 Error

#### 3. **LOGOUT** - Clear user session

- **Endpoint:** `POST /api/auth/logout`
- **Process:** Clear JWT cookie by setting expiry to past date
- **Response:** `{ message: "Logged out successfully" }`
- **Status:** 200 Success

#### 4. **CHECK EMAIL** - Verify if email exists

- **Endpoint:** `POST /api/auth/check-email`
- **Body:** `{ email }`
- **Purpose:** Prevent duplicate account creation during signup
- **Response:** `{ exists: boolean }`
- **Status:** 200 Success

#### 5. **UPDATE PROFILE** - Modify user account details

- **Endpoint:** `PUT /api/auth/profile`
- **Body:** `{ username?, email?, mobile?, gender?, address?, currentPassword?, newPassword? }`
- **Security:** Requires valid JWT token (protectRoute middleware)
- **Process:**
  1. Verify current password if changing password
  2. Update profile fields
  3. Hash new password if provided
  4. Save to MongoDB
- **Response:** `{ message, user: updated fields }`
- **Status:** 200 Success | 401 Invalid password | 404 User not found | 500 Error

#### 6. **FORGOT PASSWORD** - Initiate password reset

- **Endpoint:** `POST /api/auth/forgot-password`
- **Body:** `{ email }`
- **Process:**
  1. Find user by email
  2. Generate 6-digit OTP
  3. Set OTP expiry (15 minutes)
  4. Save OTP to user document
  5. Send OTP via email
- **Response:** `{ message: "OTP sent successfully" }`
- **Status:** 200 Success | 404 User not found | 500 Error
- **OTP Format:** 6-digit number (100000-999999)

#### 7. **VERIFY OTP** - Validate OTP before password reset

- **Endpoint:** `POST /api/auth/verify-otp`
- **Body:** `{ email, otp }`
- **Process:**
  1. Find user with matching email and valid OTP
  2. Check OTP not expired (must be within 15 minutes)
  3. Clear OTP after verification (prevent reuse)
- **Response:** `{ message: "OTP verified successfully" }`
- **Status:** 200 Success | 400 Invalid/expired OTP | 500 Error
- **Security:** OTP cleared immediately to prevent reuse

#### 8. **RESET PASSWORD** - Update password after OTP verification

- **Endpoint:** `POST /api/auth/reset-password`
- **Body:** `{ email, newPassword }`
- **Process:**
  1. Find user by email
  2. Hash new password (salt rounds = 10)
  3. Update password field
  4. Clear OTP-related fields
  5. Save to MongoDB
- **Response:** `{ message: "Password reset successfully" }`
- **Status:** 200 Success | 404 User not found | 500 Error

---

### Task Controller (`controller/taskCon.ts`)

All task endpoints require valid JWT token (protectRoute middleware).

#### 1. **CREATE TASK** - Create a new task

- **Endpoint:** `POST /api/tasks`
- **Body:** `{ title, time, description, category, date }`
- **Process:**
  1. Extract userId from JWT token
  2. Create new task document
  3. Associate task with user
  4. Save to MongoDB
- **Response:** `{ message, task: Task }`
- **Status:** 201 Created | 500 Error

#### 2. **GET ALL TASKS** - Retrieve all user tasks

- **Endpoint:** `GET /api/tasks`
- **Process:**
  1. Extract userId from JWT token
  2. Fetch all tasks for user
  3. Sort by date (ascending)
- **Response:** `{ tasks: Task[] }`
- **Status:** 200 Success | 500 Error

#### 3. **GET TASK BY ID** - Retrieve specific task

- **Endpoint:** `GET /api/tasks/:id`
- **Security:** Ownership verification (only user's own tasks)
- **Process:**
  1. Extract taskId from params and userId from JWT
  2. Fetch task only if it belongs to authenticated user
- **Response:** `{ task: Task }`
- **Status:** 200 Success | 404 Not found/unauthorized | 500 Error

#### 4. **UPDATE TASK** - Modify existing task

- **Endpoint:** `PUT /api/tasks/:id`
- **Body:** `{ title?, time?, description?, category?, date?, isCompleted? }`
- **Security:** Ownership verification
- **Process:**
  1. Extract taskId and userId
  2. Update task fields
  3. Return updated document
- **Response:** `{ message, task: Task }`
- **Status:** 200 Success | 404 Not found/unauthorized | 500 Error

#### 5. **DELETE TASK** - Permanently delete task

- **Endpoint:** `DELETE /api/tasks/:id`
- **Security:** Ownership verification
- **Process:**
  1. Extract taskId and userId
  2. Delete task from MongoDB
- **Response:** `{ message: "Task deleted successfully" }`
- **Status:** 200 Success | 404 Not found/unauthorized | 500 Error
- **Permanent:** Data cannot be recovered

---

### Models

#### User Schema (`models/user.ts`)

```typescript
{
  _id: ObjectId (auto-generated)
  name: String (required)
  email: String (required, unique)
  password: String (required, hashed)
  mobile: String (default: "")
  gender: String (default: "")
  address: String (default: "")
  resetPasswordOtp: String (temporary, for recovery)
  resetPasswordExpires: Date (OTP expiry)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

#### Task Schema (`models/task.ts`)

```typescript
{
  _id: ObjectId (auto-generated)
  title: String (required)
  time: String (required) - format: "HH:MM"
  description: String (required)
  category: String (required) - e.g., "Work", "Personal"
  date: Date (required)
  isCompleted: Boolean (default: false)
  user: ObjectId (required, reference to User)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```
