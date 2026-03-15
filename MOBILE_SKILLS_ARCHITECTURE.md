# 🎓 STUDIY - Mobile App Development Skills & Architecture Document

## Project Overview
**Studiy** is a comprehensive educational resource sharing platform that facilitates peer-to-peer material sharing, lost & found tracking, and collaborative learning among college students.

---

## 📱 1. TECHNOLOGY STACK

### Frontend (Current Web)
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite 6.2.0
- **CSS Framework**: Tailwind CSS
- **Routing**: React Router v7.13.1
- **Icons**: Lucide React
- **Loading States**: react-loading-skeleton
- **UI Component Library**: Custom built components

### Backend & Services
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Authentication
- **File Storage**: Cloudinary (Image hosting)
- **Cloud Functions**: Firebase Functions (for email verification)
- **Hosting**: Vercel

### Mobile Stack (Recommended)
- **Framework**: React Native / Flutter / Expo
- **State Management**: Redux / Zustand / Context API
- **Local Storage**: AsyncStorage / SQLite
- **Navigation**: React Navigation (React Native) / GetX (Flutter)
- **HTTP Client**: Axios / Dio (Flutter)
- **Firebase**: Firebase Cloud SDK

---

## 🏗️ 2. ARCHITECTURE OVERVIEW

### MVC Pattern Used
```
Models (Types) → Views (Components) → Controllers (Firebase Services)
```

### Key Directories Structure
```
src/
├── pages/
│   ├── landing/        (Public landing page)
│   ├── auth/           (Login, Signup, Password reset)
│   ├── user/           (User dashboard and features)
│   │   └── userlayout/ (User sidebar layout)
│   ├── admin/          (Admin management pages)
│   │   └── adminlayout/(Admin sidebar layout)
│   └── dashboard/      (Alternative dashboard)
├── components/
│   ├── ui/             (Button, Card, Badge, Input, etc.)
│   ├── common/         (Placeholder, Protected routes)
│   └── layout/         (Header, Navbar, Sidebar, Footer)
├── firebase/
│   ├── firebase.ts     (Firebase config)
│   ├── auth.ts         (Authentication logic)
│   ├── data.ts         (Static class material data)
│   ├── materials.ts    (Material CRUD operations)
│   ├── lostAndFinder.ts(Lost & Found operations)
│   ├── adminHelper.ts  (Admin utilities)
│   └── emailTemplates.ts (Email templates)
├── context/
│   └── AuthContext.tsx (Global auth state)
├── hooks/
│   ├── useRouteProtection.ts
│   ├── useMaterialView.ts
│   └── useBackNavigation.ts
├── layouts/
│   ├── MainLayout.tsx
│   ├── AuthLayout.tsx
│   ├── UserLayout.tsx
│   ├── AdminLayout.tsx
│   └── DashboardLayout.tsx
├── types.ts            (TypeScript interfaces)
├── utils/
│   └── cn.ts           (Class name utilities)
└── App.tsx            (Main app component)
```

---

## 🔐 3. AUTHENTICATION SYSTEM

### Features Implemented
1. **Email/Password Authentication**
   - User registration with validation
   - Login with persistence (localStorage)
   - Password reset via email
   - Email verification

2. **Google OAuth Integration**
   - Sign in with Google
   - Automatic user creation in Firestore

3. **Role-Based Access Control (RBAC)**
   - **UserRole.USER**: Regular students
   - **UserRole.ADMIN**: System administrators
   - Protected routes based on roles

4. **Session Management**
   - Firebase persistence (browserLocalPersistence)
   - Auto-restore session on app reload
   - Protected landing page (auto-redirect authenticated users)
   - Back button disabled on protected routes

### Key Components
- `AuthContext.tsx`: Global auth state
- `useRouteProtection.ts`: Route protection hook
- `useBackNavigation.ts`: Prevent back button navigation
- `firebase/auth.ts`: Auth operations

---

## 📚 4. CORE FEATURES & MODULES

### A. MATERIAL MANAGEMENT
**File**: `src/firebase/materials.ts`

Operations:
- Create material with Cloudinary upload
- Read materials (filtered by semester/subject)
- Update material status (pending → approved → rejected)
- Delete materials
- Track view counts

Data Structure:
```typescript
interface Material {
  id: string;
  title: string;
  description: string;
  subject: string;
  semester: string;
  fileUrl: string;  // Cloudinary URL
  uploaderId: string;
  uploaderEmail: string;
  uploaderName: string;
  status: 'pending' | 'approved' | 'rejected';
  views: number;
  savedCount: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}
```

### B. LOST & FINDER (Campus Lost & Found)
**File**: `src/firebase/lostAndFinder.ts`

Features:
- Report lost/found items with image upload (Cloudinary)
- Real-time updates via onSnapshot listeners
- Comment system with subcollections
- Mark items as resolved
- Delete items (uploader only)
- View count tracking

Data Structure:
```typescript
interface LostAndFinderItem {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  category: string;
  color: string;
  size: string;
  location: string;
  dateTime: string;
  imageUrl: string;
  uploaderName: string;
  uploaderEmail: string;
  uploaderPhone: string;
  uploaderProfilePicture: string;
  status: 'active' | 'resolved';
  views: number;
  createdAt: string;
}
```

### C. CLASS MATERIALS
**File**: `src/pages/user/ClassMaterial.tsx`

Features:
- Browse organized study materials
- Semester-based filtering
- Subject selection with search
- Material categories (Notes, Videos, Assignments, PYQs)
- Direct download/preview links
- Expandable category sections

Data Source: `src/firebase/data.ts` (Static data)

### D. COMMENTS & INTERACTIONS
**Features**:
- Comments on materials
- Comments on lost & found items
- Real-time comment count updates
- Nested comment subcollections in Firestore
- User profile pictures in comments
- Comment author validation

### E. USER PROFILES
**Features**:
- User avatar customization (DiceBear avatars)
- Profile information display
- Avatar style selection
- Display name management
- Profile picture from Firebase Auth

---

## 🎯 5. USER PAGES & ROUTES

### Regular User Routes (`/user`)
| Route | Component | Purpose |
|-------|-----------|---------|
| `/user` | UserHomepage | Browse all materials |
| `/user/dashboard` | UserDashboard | Personal dashboard with stats |
| `/user/class-material` | ClassMaterial | Organized class materials |
| `/user/resources` | UserResources | User's uploaded materials |
| `/user/upload` | UserUpload | Upload new material |
| `/user/saved` | UserSaved | Saved/liked materials |
| `/user/pending` | UserPendingMaterial | Pending approval materials |
| `/user/notifications` | UserNotification | User notifications |
| `/user/profile` | UserProfile | User profile management |
| `/user/settings` | UserSetting | User settings |
| `/user/requests` | ResourceRequests | Resource requests list |
| `/user/request/create` | CreateResourceRequest | Create new request |
| `/user/search` | SearchUser | Search other users |
| `/user/lost-and-finder` | CampusLostAndFinder | Lost & found listing |
| `/user/lost-and-finder/create` | CreateLostAndFinderItem | Report lost/found item |
| `/user/lost-and-finder/:itemId` | LostAndFinderDetail | Item details |

### Admin Routes (`/admin`)
| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin` | AdminDashboard | Admin overview & stats |
| `/admin/users` | AdminUsers | Manage users |
| `/admin/resources` | AdminResources | Manage materials |
| `/admin/approvals` | AdminRequests | Approve/reject materials |
| `/admin/reports` | AdminReports | System reports |
| `/admin/profile` | AdminProfile | Admin profile |
| `/admin/settings` | AdminSettings | Admin settings |

### Public Routes
| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | LandingPage | Home page (auto-redirects authenticated users) |
| `/login` | LoginPage | User login |
| `/signup` | SignupPage | User registration |
| `/forgot-password` | ForgotPasswordPage | Password recovery |

---

## 🎨 6. UI COMPONENTS

### Custom Components Built
Located in `src/components/ui/`:
- **Button.tsx**: Customizable button component (variants, sizes)
- **Card.tsx**: Card wrapper with CardHeader, CardTitle, CardContent
- **Input.tsx**: Input field with validation styling
- **Badge.tsx**: Status/tag display component
- **Avatar.tsx**: User avatar display
- **ProtectedRoute.tsx**: Route protection wrapper

### Styling Approach
- **Tailwind CSS**: Utility-first CSS framework
- **Dark Mode Ready**: CSS variables support
- **Responsive**: Mobile-first design
- **Color Scheme**:
  - Primary: Indigo (#667eea)
  - Secondary: Purple (#764ba2)
  - Success: Emerald (#10b981)
  - Warning: Amber (#f59e0b)
  - Danger: Red (#ef4444)

---

## 🔄 7. STATE MANAGEMENT

### Global State (Context API)
```typescript
AuthContext {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  login()
  signup()
  loginGoogle()
  logout()
}
```

### Local Component State
- Material filters and search
- Modal/dialog visibility
- Form inputs
- Loading states
- Expanded sections

### Real-Time Updates
- Firebase onSnapshot listeners for:
  - Materials list
  - Lost & finder items
  - Comments
  - User profile changes

---

## 🔗 8. DATABASE SCHEMA (Firestore)

### Collections
```
/users
  └── {userId}
      ├── email
      ├── role
      ├── displayName
      ├── profile_picture
      ├── username
      └── created_at

/materials
  └── {materialId}
      ├── title
      ├── description
      ├── subject
      ├── semester
      ├── fileUrl
      ├── uploaderId
      ├── status
      ├── views
      ├── savedCount
      ├── createdAt
      └── /comments (subcollection)
          └── {commentId}

/lostAndFinder
  └── {itemId}
      ├── title
      ├── type
      ├── status
      ├── imageUrl
      ├── uploaderEmail
      ├── views
      ├── createdAt
      └── /comments (subcollection)
          └── {commentId}
              ├── authorEmail
              ├── content
              ├── createdAt
              └── authorProfilePicture
```

---

## 📸 9. IMAGE HANDLING

### Cloudinary Integration
- **Cloud Name**: dzed8kurd
- **Upload Preset**: studiy_lostandfinder (for lost & finder)
- **File Size Limit**: 500KB (enforced in UI)
- **Supported Formats**: JPG, PNG, WebP
- **Auto URL Generation**: Cloudinary returns optimized URLs
- **Image Compression Suggestion**: https://imageraft.vercel.app

### Implementation
```typescript
// Upload to Cloudinary
const formData = new FormData();
formData.append('file', file);
formData.append('upload_preset', 'studiy_lostandfinder');

const response = await fetch(
  'https://api.cloudinary.com/v1_1/dzed8kurd/image/upload',
  { method: 'POST', body: formData }
);

const imageUrl = response.secure_url;
```

---

## 📧 10. EMAIL SYSTEM

### Email Templates
Located in `src/firebase/emailTemplates.ts`:

**Types**:
1. HTML Template (default - full design)
2. Plain Text Template
3. Dark Mode Template
4. Minimal/Simple Template

**Usage**:
```typescript
const emailConfig = generateEmailVerificationConfig(
  userName,
  verificationLink
);
// Send via Firebase Admin SDK or SendGrid
```

### Configuration
```typescript
emailConfig = {
  sender: {
    name: 'Studiy',
    email: 'noreply@studiy.app',
  },
  subject: 'Verify your email address - Studiy',
  linkExpiryHours: 24,
}
```

---

## 🔒 11. SECURITY FEATURES

1. **Authentication**
   - Firebase email/password auth
   - Google OAuth 2.0
   - Session persistence
   - Auto-logout on sign out

2. **Authorization**
   - RBAC (User vs Admin)
   - Route protection hooks
   - Firestore security rules
   - User email verification

3. **Data Protection**
   - HTTPS/TLS encryption
   - Cloudinary secure image URLs
   - Password reset via email
   - Secure token storage

4. **Navigation Security**
   - Back button disabled on protected routes
   - Auto-redirect to landing page on logout
   - Session restoration on reload

---

## 📊 12. REAL-TIME FEATURES

### OnSnapshot Listeners (Firestore)
```typescript
// Materials real-time updates
const unsubscribe = onSnapshot(
  query(collection(db, 'materials'), orderBy('createdAt', 'desc')),
  (snapshot) => {
    const materials = snapshot.docs.map(doc => doc.data());
    setMaterials(materials);
  }
);

// Lost & Finder items real-time updates
const unsubscribe = onSnapshot(
  query(collection(db, 'lostAndFinder'), orderBy('createdAt', 'desc')),
  async (snapshot) => {
    const items = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const comments = await fetchComments(doc.id);
        return { ...doc.data(), comments };
      })
    );
    setItems(items);
  }
);
```

### Features
- Live material list updates
- Real-time comment counts
- View count updates
- Item status changes
- Profile updates

---

## 🎮 13. USER INTERACTIONS

### Material Interactions
- View material details
- Like/save materials
- Comment on materials
- Download materials
- Upload new materials
- Search materials by subject/semester

### Lost & Finder Interactions
- Report lost items
- Report found items
- Comment on items
- Mark as resolved
- Delete own items
- View details
- Like items
- Search by type/category

### User Interactions
- Create profile
- Customize avatar
- Send resource requests
- View notifications
- Search other users
- View user profiles
- Manage settings

---

## 🚀 14. PERFORMANCE OPTIMIZATIONS

1. **Lazy Loading**
   - React.lazy() for route components
   - Skeleton loaders for content

2. **Memoization**
   - useMemo() for filtered lists
   - useCallback() for functions

3. **Image Optimization**
   - Cloudinary URL optimization
   - Object-contain for responsive images
   - Lazy loading images

4. **Bundle Size**
   - Tree shaking with Vite
   - Dynamic imports for large components
   - Minimal dependencies

---

## 📱 15. MOBILE APP CONVERSION STRATEGY

### React Native Approach
**Pros**: Code sharing, familiar to React devs
**Cons**: Some platform-specific code needed

Key Changes:
```typescript
// Navigation: React Router → React Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Styling: Tailwind → React Native StyleSheet
import { StyleSheet } from 'react-native';

// Storage: localStorage → AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

// HTTP: No changes (Firebase SDK works)

// Images: Web URLs → React Native Image
import { Image } from 'react-native';
```

### Flutter Approach
**Pros**: Best performance, native feel
**Cons**: Different language (Dart), no code sharing

Key Libraries:
- `firebase_core` & `cloud_firestore`
- `provider` or `getx` for state management
- `image_picker` for image selection
- `cloudinary_flutter` for uploads
- `http` or `dio` for HTTP requests

### Expo vs React Native CLI
**Expo**: Easier setup, managed hosting
**React Native CLI**: More control, better performance

---

## 🔑 16. KEY HOOKS & UTILITIES

### Custom Hooks
1. **useAuth()** - Access global auth state
2. **useRouteProtection()** - Protect routes based on auth
3. **useAdminRouteProtection()** - Admin-specific protection
4. **useBackNavigation()** - Prevent back button in protected routes
5. **useMaterialView()** - Track material views

### Utility Functions
1. **cn()** - Class name utility (classnames alternative)
2. **formatDate()** - Date formatting
3. **generateVerificationLink()** - Create email links

---

## 📋 17. DATA FLOW DIAGRAM

```
User Action
    ↓
React Component
    ↓
Hook/Context
    ↓
Firebase Service (materials.ts, auth.ts, lostAndFinder.ts)
    ↓
Firestore / Firebase Auth / Cloudinary
    ↓
Update State
    ↓
Component Re-render
    ↓
UI Update
```

---

## 🧪 18. TESTING STRUCTURE (Recommended for Mobile)

```
tests/
├── unit/
│   ├── auth.test.ts
│   ├── materials.test.ts
│   └── hooks.test.ts
├── integration/
│   ├── authentication.test.ts
│   ├── materials_flow.test.ts
│   └── lost_finder_flow.test.ts
└── e2e/
    ├── user_journey.test.ts
    └── admin_workflow.test.ts
```

---

## 📚 19. DEPENDENCIES LIST

### Core
- react@19.x
- react-router-dom@7.13.1
- typescript@5.x

### Firebase
- firebase@10.x

### UI & Styling
- tailwindcss@3.x
- lucide-react@latest
- react-icons@latest

### Utilities
- react-loading-skeleton@3.x
- classnames (via cn utility)

### Dev Tools
- vite@6.2.0
- tailwindcss@3.x
- typescript

---

## 🎯 20. MIGRATION CHECKLIST FOR MOBILE

### Phase 1: Setup
- [ ] Choose framework (React Native/Flutter/Expo)
- [ ] Set up project structure
- [ ] Configure Firebase for mobile
- [ ] Set up CI/CD pipeline

### Phase 2: Core Features
- [ ] Authentication flow
- [ ] Navigation structure
- [ ] Material management
- [ ] Lost & Finder module
- [ ] User profiles

### Phase 3: UI/UX
- [ ] Responsive layouts for various screen sizes
- [ ] Touch-optimized components
- [ ] Native platform conventions
- [ ] Bottom tab/drawer navigation

### Phase 4: Features
- [ ] Real-time updates (onSnapshot)
- [ ] Image upload & display
- [ ] Comments system
- [ ] Notifications
- [ ] Search functionality

### Phase 5: Optimization
- [ ] Performance testing
- [ ] Battery optimization
- [ ] Network optimization
- [ ] Storage optimization

### Phase 6: Release
- [ ] App store submission (iOS/Android)
- [ ] Beta testing
- [ ] User feedback integration
- [ ] Maintenance & updates

---

## 📞 21. API ENDPOINTS & SERVICES

### Firebase Services Used
1. **Firebase Authentication**
   - Email/Password: `createUserWithEmailAndPassword()`
   - Google OAuth: `signInWithPopup(provider)`
   - Password Reset: `sendPasswordResetEmail()`

2. **Firestore Database**
   - CRUD operations: `getDoc()`, `setDoc()`, `updateDoc()`, `deleteDoc()`
   - Queries: `query()`, `where()`, `orderBy()`, `limit()`
   - Real-time: `onSnapshot()`

3. **Cloudinary API**
   - Upload: POST to `https://api.cloudinary.com/v1_1/{cloud}/image/upload`
   - Transform: URL parameters for optimization

---

## 🎨 22. DESIGN SYSTEM

### Typography
- **Headings**: 24px (h1), 20px (h2), 16px (h3)
- **Body**: 14px regular, 12px small
- **Font**: Segoe UI / System fonts

### Spacing
- Base unit: 4px
- Common: 8px, 12px, 16px, 20px, 24px

### Border Radius
- Small components: 4px-6px
- Cards/Sections: 8px
- Large elements: 12px

---

## 🔧 23. CONFIGURATION FILES

### Environment Variables (`.env`)
```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
VITE_CLOUDINARY_CLOUD_NAME=dzed8kurd
```

### Vite Config
- Base: `/`
- Target: ES2020+
- Library format: ESM

---

## 📖 24. DOCUMENTATION STRUCTURE

For mobile development, create:
1. **Architecture Guide** - High-level design
2. **Component Library** - All UI components
3. **API Documentation** - Firebase service methods
4. **State Management Guide** - Data flow
5. **Setup Instructions** - Development environment
6. **Deployment Guide** - App store submission

---

## ✅ 25. QUALITY ASSURANCE

### Code Quality
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Pre-commit hooks

### Testing
- Unit tests: 80% coverage
- Integration tests: Critical flows
- E2E tests: User journeys
- Performance tests: Load times

### Monitoring
- Error tracking (Sentry)
- Analytics (Firebase Analytics)
- Crash reporting
- User session tracking

---

## 📚 Resources & References

### Frontend Framework Docs
- React: https://react.dev
- React Router: https://reactrouter.com
- React Native: https://reactnative.dev
- Flutter: https://flutter.dev

### Backend Services
- Firebase: https://firebase.google.com
- Cloudinary: https://cloudinary.com
- Vercel: https://vercel.com

### UI Frameworks
- Tailwind CSS: https://tailwindcss.com
- React Native StyleSheet: React Native docs
- Flutter Material: https://flutter.dev/docs/development/ui/widgets/material

---

**Last Updated**: March 13, 2026
**Project Name**: Studiy
**Status**: Mobile Migration Ready ✅
