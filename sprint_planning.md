# Sprint Planning: 212LEARN (EduTrack) MVP

This document contains a detailed Sprint-by-Sprint development roadmap for **212LEARN**. 
It splits tasks between the **Backend Developer** (you) and the **Frontend Developer** to enable seamless parallel development.

---

## Sprint 1: Foundations & Auth (Duration: 3-4 Weeks)
*Goal: Set up project skeletons, user authentication/authorization, and course categories.*

### 🖥️ Backend Deliverables (Your Work)
- **Database & Architecture**:
  - Initialize the database schema with Prisma (already mapped out).
  - Configure PostgreSQL database index strategies (e.g., unique index on `User(email)`, hierarchy for categories).
- **Authentication API**:
  - `POST /api/v1/auth/signup`: User registration (Student and Instructor roles). Hash passwords using `bcryptjs`.
  - `POST /api/v1/auth/login`: Issue secure JSON Web Tokens (JWT) using the generated 64-byte secret key.
  - Implement authentication middleware to extract and verify the JWT from headers.
  - Implement role-based authorization middleware (Visitor, Student, Instructor, Admin).
- **Category API**:
  - `GET /api/v1/categories`: Retrieve all categories (including parent/child relationships).
  - `POST /api/v1/categories` (Admin only): Create and nest categories.

### 🎨 Frontend Deliverables (Other Dev)
- **Skeleton & Routing**:
  - Setup React project skeleton with Routing structure (public, student, instructor, and admin layouts).
- **Authentication Views**:
  - Implement Login page, Signup page, and Profile page.
  - Implement Token storage (e.g., local storage or secure HTTP-only cookies) and request interceptors to automatically append JWT authorization headers.
- **Category Catalog Navigation**:
  - Build landing/home page showing categories and sub-categories.

---

## Sprint 2: Course Catalog & Instructor Space (Duration: 3 Weeks)
*Goal: Allow instructors to create courses and students to browse details.*

### 🖥️ Backend Deliverables (Your Work)
- **Course API**:
  - `GET /api/v1/courses`: List courses with pagination and simple search filters (title, categoryId).
  - `GET /api/v1/courses/:id`: Get detailed course profile (including instructor details, average reviews, pricing, level).
  - `POST /api/v1/courses` (Instructor only): Create draft course.
  - `PUT /api/v1/courses/:id` (Instructor/Admin): Update course fields.
  - `POST /api/v1/courses/:id/publish` (Admin only): Approve/validate course status from `draft` to `active`.

### 🎨 Frontend Deliverables (Other Dev)
- **Catalog Navigation**:
  - Catalog search/listing page showing grid of courses, with filter sidebar (level, language, category).
  - Detailed Course Landing Page showing outline, price, level, language, and "Enroll/Buy Now" CTA.
- **Instructor Dashboard**:
  - "Create New Course" wizard interface (title, price, level, category).
  - Dashboard panel showing draft vs. published courses.

---

## Sprint 3: Pedagogical Content Hierarchy (Duration: 3-4 Weeks)
*Goal: Build the core learning experience with Sections, Lessons, Resource attachments, and Assignments.*

### 🖥️ Backend Deliverables (Your Work)
- **Hierarchy API (Sections & Lessons)**:
  - `GET /api/v1/courses/:courseId/curriculum`: Returns full structure of Sections -> Lessons.
  - `POST /api/v1/courses/:courseId/sections` & `PUT /api/v1/sections/:id` (Instructor only): Manage sections and positions.
  - `POST /api/v1/sections/:sectionId/lessons` & `PUT /api/v1/lessons/:id` (Instructor only): Manage lessons and positions.
- **Resource Attachments**:
  - Integration with Cloudinary / S3 for video/PDF uploads.
  - `POST /api/v1/lessons/:lessonId/resources` & `DELETE /api/v1/resources/:id`: Attach/remove materials (Video, PDF, Slides, ZIP, External Link).
- **Assignments & Submissions**:
  - `POST /api/v1/lessons/:lessonId/assignments` (Instructor): Create homework task.
  - `POST /api/v1/assignments/:assignmentId/submissions` (Student): Upload homework file/ZIP.
  - `PUT /api/v1/submissions/:id/grade` (Instructor): Grade and leave written feedback.

### 🎨 Frontend Deliverables (Other Dev)
- **Curriculum Builder**:
  - Drag-and-drop or accordion interface for instructors to structure Sections, add Lessons, and attach resource files.
- **Student Classroom Interface**:
  - Split screen player/reader: left sidebar shows course hierarchy checklist (completed indicator); right workspace shows the active Lesson's resource player (video player, PDF viewer, or Code download links).
- **Assignments Workspace**:
  - Interface for students to view assignments and upload submissions.
  - Interface for instructors to view, download, and grade student submissions.

---

## Sprint 4: Stripe Payment & Access Control (Duration: 2-3 Weeks)
*Goal: Integrate Stripe payment gateway and secure access to active curriculum content.*

### 🖥️ Backend Deliverables (Your Work)
- **Stripe Integration**:
  - Implement checkout session creation API: `POST /api/v1/payments/checkout-session`.
  - Handle Stripe Webhook endpoints safely to process transaction statuses (`payment_intent.succeeded` -> update `Payment` table, create `Enrollment` entry).
- **Access Authorization Middleware**:
  - Implement middleware on lesson resources and submission endpoints to verify that the requesting student has an active `Enrollment` for the corresponding course. (Instructors of the course and Admins bypass this check).

### 🎨 Frontend Deliverables (Other Dev)
- **Cart & Checkout Flow**:
  - Implement Shopping Cart UI page.
  - Connect "Enroll" actions to Backend Stripe Session APIs, redirecting users to the Stripe Hosted Checkout window.
  - Create Success/Cancel payment landing pages.
- **Protected UI elements**:
  - Block access to classroom player routes for non-enrolled users, displaying a "Purchase Course" wall.

---

## Sprint 5: Quiz Engine & AI Generation (Duration: 3 Weeks)
*Goal: Implement manual/AI quiz generation and student evaluation attempts.*

### 🖥️ Backend Deliverables (Your Work)
- **Quiz Management**:
  - `POST /api/v1/lessons/:lessonId/quizzes`: Create a quiz manually.
  - `POST /api/v1/quizzes/:quizId/questions`: Add questions (statement, options, correct answer).
- **AI Generation Service**:
  - Integrate OpenAI/Claude API to process text prompts or uploaded lesson files (e.g., PDF notes) and return a structured JSON list of questions.
  - `POST /api/v1/lessons/:lessonId/quizzes/generate-ai`: Invoke AI generator, save quiz in `draft` mode for instructor validation.
- **Evaluations API**:
  - `POST /api/v1/quizzes/:quizId/attempts`: Submit student answers, calculate score dynamically, and store `QuizAttempt`.

### 🎨 Frontend Deliverables (Other Dev)
- **AI Quiz Builder Prompt**:
  - Implement prompt input modal for instructors to generate quizzes automatically (e.g., "Generate 5 multiple-choice questions on React Hooks").
  - Interface for instructors to edit and validate AI-generated draft questions before publishing.
- **Quiz Play View**:
  - Quiz taking interface for students with timers, MCQs selection, and an instantaneous score summary screen upon submission.

---

## Sprint 6: Engagement, Gamification & Reviews (Duration: 2-3 Weeks)
*Goal: Track user progression, awards, notifications, and student reviews.*

### 🖥️ Backend Deliverables (Your Work)
- **Progression System**:
  - `POST /api/v1/lessons/:lessonId/progress`: Log video position timestamp or mark lesson completed/started.
- **Gamification & Badges Engine**:
  - Hook into `QuizAttempt` and `LessonProgress` events to award points and unlock `BadgeDefinition` entries.
  - `GET /api/v1/users/:userId/achievements`: Fetch point totals and badges.
- **Reviews & Notifications**:
  - `POST /api/v1/courses/:courseId/reviews`: Student review submissions.
  - Notification dispatcher (real-time notifications via Socket.io or simple REST polling for achievements, new lessons, or graded assignments).

### 🎨 Frontend Deliverables (Other Dev)
- **Progression UI**:
  - Update curriculum tree dynamically when lessons are marked completed.
- **User Dashboard/Gamification Panel**:
  - Visual points tracker, streak display, and a grid showing locked/unlocked badges.
- **Reviews Panel**:
  - Star-rating submission form on the course page.
- **Notification Center**:
  - Dropdown menu in header with real-time alert notifications.

---

## Sprint 7: Live Meetings & Analytics Dashboards (Duration: 3-4 Weeks)
*Goal: Optional live interactive meetings (Zoom/Meet), Admin portal, and Instructor dashboard statistics.*

### 🖥️ Backend Deliverables (Your Work)
- **Meeting Rooms Manager**:
  - `POST /api/v1/courses/:courseId/meetings`: Instructor posts Zoom/Google Meet link and date.
- **Analytics Engine**:
  - Aggregation endpoints for Instructor Dashboard:
    - Monthly revenue trends.
    - Active students metrics.
    - Average course completion rates (computed from `LessonProgress` records).
- **Admin Portal**:
  - Admin moderation views (Instructor KYC verification endpoints, refund processing, and coarse audit logs).

### 🎨 Frontend Deliverables (Other Dev)
- **Meetings Widget**:
  - Calendar widget on course pages showing scheduled Zoom/Meet session links.
- **Instructor Analytics Dashboard**:
  - Beautiful visual charts (using libraries like Recharts or Chart.js) depicting revenue trends, active student statistics, and quiz success ratios.
- **Admin Dashboard**:
  - Admin management panel to verify instructors, edit course pricing, and process checkout refunds.
