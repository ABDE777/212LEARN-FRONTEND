# 📊 212Learn — Frontend Progression

> **Last updated:** 2026-07-13  
> Ce fichier récapitule tout ce qui est déjà implémenté côté frontend.  
> Il permet au développeur backend de savoir quels endpoints sont **déjà consommés**, quels features sont **visibles**, et ce qui **manque encore** côté API.

---

## 🌐 Base URL & Authentification

| Propriété | Valeur |
|---|---|
| **Base URL** | `https://backend-212learn.vercel.app/api/v1` |
| **Auth type** | Bearer JWT Token (`Authorization: Bearer <token>`) |
| **Token storage** | In-memory (`window.__AUTH_TOKEN__`) |
| **API client** | `axios` via `src/services/api.js` |

---

## 🗺️ Routes Frontend

| Route | Accès | Page | Description |
|---|---|---|---|
| `/` | Public | `Home.jsx` | Page d'accueil avec hero, catégories, features |
| `/about` | Public | `About.jsx` | À propos avec cards et statistiques |
| `/login` | Public | `Login.jsx` | Connexion utilisateur |
| `/signup` | Public | `Signup.jsx` | Inscription utilisateur |
| `/courses` | Public | `Catalog.jsx` | Catalogue des cours avec filtres |
| `/courses/:id` | Public | `CourseDetails.jsx` | Détail d'un cours + curriculum |
| `/courses/:id/checkout` | Public | `Checkout.jsx` | Page de paiement |
| `/student/dashboard` | 🔒 Student | `StudentDashboard.jsx` | Tableau de bord étudiant |
| `/instructor/dashboard` | 🔒 Instructor | `InstructorDashboard.jsx` | Tableau de bord instructeur |
| `/admin/dashboard` | 🔒 Admin | `AdminDashboard.jsx` | Tableau de bord admin |
| `/learn/:courseId/lesson/:lessonId` | 🔒 Student | `ClassroomPlayer.jsx` | Lecteur de leçon vidéo |
| `/learn/:courseId/quiz/:quizId` | 🔒 Student | `QuizPlayer.jsx` | Lecteur de quiz interactif |
| `/learn/:courseId/assignment/:assignmentId` | 🔒 Student | `AssignmentSubmit.jsx` | Soumission de devoir |

---

## 🔌 API Endpoints Consommés

### 🔐 Authentification — `AuthContext.jsx`

| Méthode | Endpoint | Utilisé dans | Status |
|---|---|---|---|
| `POST` | `/auth/login` | `Login.jsx` | ✅ Connecté |
| `POST` | `/auth/signup` | `Signup.jsx` | ✅ Connecté |
| `GET` | `/auth/me` | `AuthContext` (init) | ✅ Connecté |
| `PATCH` | `/users/me` | `ProfileEditForm.jsx` | ✅ Connecté |

### 👥 Utilisateurs — `useAdminData.jsx`

| Méthode | Endpoint | Utilisé dans | Status |
|---|---|---|---|
| `GET` | `/users` | `AdminDashboard` → Users tab | ✅ Connecté |

### 📚 Cours — `useCourses.jsx`, `useInstructorCourses.jsx`, `useAdminData.jsx`

| Méthode | Endpoint | Utilisé dans | Status |
|---|---|---|---|
| `GET` | `/courses` | `Catalog.jsx`, `AdminDashboard`, `InstructorDashboard` | ✅ Connecté |
| `GET` | `/courses?category=&level=&search=` | `Catalog.jsx` (filtres) | ✅ Connecté |
| `GET` | `/courses/:id` | `CourseDetails.jsx` | ✅ Connecté |
| `GET` | `/courses/:id/curriculum` | `CourseDetails.jsx`, `ClassroomPlayer.jsx` | ✅ Connecté |
| `POST` | `/courses` | `useCreateCourse` (Instructor) | ✅ Connecté |
| `POST` | `/courses/:id/publish` | `AdminDashboard` → Courses tab | ✅ Connecté |

### 🗂️ Catégories — `useCategories.jsx`

| Méthode | Endpoint | Utilisé dans | Status |
|---|---|---|---|
| `GET` | `/categories` | `Home.jsx`, `Catalog.jsx`, `AdminDashboard` | ✅ Connecté |

### 📝 Inscriptions — `useStudentDashboard.jsx`

| Méthode | Endpoint | Utilisé dans | Status |
|---|---|---|---|
| `GET` | `/enrollments` | `StudentDashboard` (stats de progression) | ✅ Connecté |

### 📈 Progression — `useProgress.jsx`

| Méthode | Endpoint | Utilisé dans | Status |
|---|---|---|---|
| `POST` | `/lessons/:lessonId/progress` | `ClassroomPlayer.jsx` | ✅ Connecté |

### 🧠 Quiz — `useProgress.jsx`

| Méthode | Endpoint | Utilisé dans | Status |
|---|---|---|---|
| `POST` | `/quizzes/:quizId/attempts` | `QuizPlayer.jsx` | ✅ Connecté |

### 📄 Devoirs — `useProgress.jsx`

| Méthode | Endpoint | Utilisé dans | Status |
|---|---|---|---|
| `POST` | `/assignments/:assignmentId/submissions` | `AssignmentSubmit.jsx` | ✅ Connecté |

### 💳 Paiements — `usePayments.jsx`

| Méthode | Endpoint | Utilisé dans | Status |
|---|---|---|---|
| `POST` | `/payments/checkout-session` | `Checkout.jsx` | ✅ Connecté |

---

## 🧩 Hooks Disponibles

| Hook | Fichier | Description |
|---|---|---|
| `useCourses(filters)` | `useCourses.jsx` | Liste de cours avec filtres (catégorie, niveau, recherche) |
| `useCourse(courseId)` | `useCourses.jsx` | Détail d'un cours |
| `useCourseCurriculum(courseId)` | `useCourses.jsx` | Sections et leçons d'un cours |
| `useCategories()` | `useCategories.jsx` | Liste de toutes les catégories |
| `useInstructorCourses()` | `useInstructorCourses.jsx` | Cours de l'instructeur connecté |
| `useCreateCourse()` | `useInstructorCourses.jsx` | Création d'un nouveau cours |
| `useAdminUsers()` | `useAdminData.jsx` | Liste de tous les utilisateurs (admin) |
| `useAdminCourses()` | `useAdminData.jsx` | Liste de tous les cours (admin) |
| `usePublishCourse()` | `useAdminData.jsx` | Publier un cours en draft (admin) |
| `useLessonProgress()` | `useProgress.jsx` | Marquer une leçon comme terminée |
| `useQuizAttempts()` | `useProgress.jsx` | Soumettre une tentative de quiz |
| `useAssignmentSubmissions()` | `useProgress.jsx` | Soumettre un devoir (multipart/form-data) |
| `useStudentAchievements(userId)` | `useStudentDashboard.jsx` | Stats de progression de l'étudiant |
| `useCheckout()` | `usePayments.jsx` | Créer une session de paiement |

---

## 🖥️ Dashboards & Fonctionnalités

### 👨‍🎓 Student Dashboard (`/student/dashboard`)
- Sidebar verticale avec avatar, nom, rôle "Étudiant"
- **Tableau de bord** : Points, streak, cours complétés, heures d'apprentissage
- **Mon Profil** : Voir et modifier prénom, nom, avatar (URL), bio via `PATCH /users/me`
- Déconnexion depuis la sidebar

### 👨‍🏫 Instructor Dashboard (`/instructor/dashboard`)
- Sidebar verticale avec avatar, nom, rôle "Instructeur"
- **My Courses** : Liste des cours avec statut et nombre d'inscrits
- **Create Course** : Placeholder (formulaire à venir)
- **Meetings** : Placeholder (réunions à venir)
- **Students** : Placeholder (liste des étudiants à venir)
- **Mon Profil** : Voir et modifier ses informations personnelles via `PATCH /users/me`
- Déconnexion depuis la sidebar

### 🛡️ Admin Dashboard (`/admin/dashboard`)
- Sidebar verticale avec avatar, nom, rôle "Admin"
- **Users** : Grille de tous les utilisateurs (nom, email, rôle)
- **Courses** : Grille de tous les cours avec bouton "Publish" pour les drafts
- **Categories** : Liste des catégories avec sous-catégories
- **Settings** : Placeholder (paramètres à venir)
- **Mon Profil** : Voir et modifier ses informations personnelles via `PATCH /users/me`
- Déconnexion depuis la sidebar

---

## 🎓 Classroom Player (`/learn/:courseId/lesson/:lessonId`)
- Affichage de la vidéo de la leçon
- Navigation entre les sections et leçons du curriculum
- Marquage de la progression via `POST /lessons/:lessonId/progress`
- Accès aux Quiz et Devoirs liés

## 🧠 Quiz Player (`/learn/:courseId/quiz/:quizId`)
- Affichage des questions une par une
- Soumission de toutes les réponses via `POST /quizzes/:quizId/attempts`
- Affichage du score et des résultats

## 📄 Assignment Submit (`/learn/:courseId/assignment/:assignmentId`)
- Upload de fichier de devoir
- Soumission via `POST /assignments/:assignmentId/submissions` (multipart/form-data)

---

## ⚠️ Ce qui manque / À implémenter côté Backend

| Feature | Endpoint suggéré | Priorité |
|---|---|---|
| Achievements de l'étudiant | `GET /users/me/achievements` | 🔴 Haute |
| Cours de l'instructeur seulement | `GET /courses/mine` ou `GET /instructor/courses` | 🔴 Haute |
| Liste des étudiants inscrits à un cours | `GET /courses/:id/students` | 🟡 Moyenne |
| Réunions (meetings/visio) | `GET /meetings`, `POST /meetings` | 🟡 Moyenne |
| Statistiques globales admin | `GET /admin/stats` | 🟡 Moyenne |
| Paramètres de plateforme | `GET /settings`, `PATCH /settings` | 🟢 Faible |
| Refresh token | `POST /auth/refresh` | 🔴 Haute (sécurité) |
| Upload avatar (fichier) | `POST /users/me/avatar` (multipart) | 🟡 Moyenne |

---

## 🧰 Stack Technique Frontend

| Outil | Version | Usage |
|---|---|---|
| React | 19 | UI Framework |
| Vite | 8 | Build tool |
| React Router | v7 | Routing |
| Axios | latest | HTTP Client |
| Lucide React | latest | Icônes |
| Lottie Web | latest | Animations |

---

> **Note pour le backend :** Tous les endpoints retournent des erreurs gérées côté frontend avec des données de fallback pour éviter les écrans blancs. Cependant, les vraies données sont prioritaires dès que les endpoints sont opérationnels.
