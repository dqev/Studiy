# Studiy - Student Resource Hub

<div align="center">
  ![Studiy Preview](public/og-image.svg)
  
  **The ultimate hub for student resources**
  
  Share, discover, and collaborate on study materials with thousands of students worldwide.
</div>

## Quick Start

```bash
# 1. Clone
git clone https://github.com/devchauhann/studiy.git && cd studiy

# 2. Install
npm install

# 3. Setup Firebase (see Firebase Environment Setup section below)
# Create .env.local with your Firebase credentials

# 4. Run
npm run dev
```

Visit `http://localhost:5173` to start developing!

## About Studiy

Studiy is a comprehensive platform designed to empower students to share, discover, and collaborate on study materials. Whether you're looking for notes, summaries, practice exams, or want to connect with fellow learners, Studiy has you covered.

### Key Features

- **📚 Resource Library** - Access millions of notes, summaries, and practice exams uploaded by top students
- **👥 Collaborative Groups** - Join study groups and work together in real-time on shared projects
- **✅ Verified Content** - Moderation ensures all resources are accurate and high-quality
- **🔍 Instant Search** - Find exactly what you need with our AI-powered search engine
- **📱 Offline Access** - Download resources and study anywhere, even without internet
- **📊 Smart Analytics** - Track progress and get personalized recommendations
- **🎓 Public Profiles** - Share your learning journey with the community
- **💾 Lost & Found** - Campus lost and found items marketplace
- **📋 Resource Requests** - Request specific materials from the community

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **Backend:** Firebase (Firestore, Authentication, Storage)
- **Routing:** React Router v7
- **State Management:** React Context API
- **Icons:** Lucide React, React Icons
- **UI Components:** Custom built with Tailwind CSS
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn package manager
- Firebase project (free tier works great)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/devchauhann/studiy.git
   cd studiy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # Optional: Firebase Emulator (for development)
   VITE_USE_FIREBASE_EMULATOR=false
   ```

## Firebase Environment Setup

### Creating a Firebase Project

#### Step 1: Set Up Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click on "Add project"
3. Enter your project name (e.g., "Studiy-Dev")
4. Choose whether to enable Google Analytics (optional for development)
5. Select your country/region
6. Accept the terms and click "Create project"
7. Wait for the project to be created

#### Step 2: Register Your Web Application
1. In your Firebase project dashboard, click on the Web icon (`</>`)
2. Enter an app nickname (e.g., "Studiy-Web")
3. Click "Register app"
4. You'll see your Firebase configuration - **copy this carefully**

#### Step 3: Copy Firebase Configuration
The Firebase config will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDfGh_J8kPqL9mN0oP1qR2sT3uV4wX5yZ6",
  authDomain: "studiy-dev-12345.firebaseapp.com",
  projectId: "studiy-dev-12345",
  storageBucket: "studiy-dev-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

#### Step 4: Map to Environment Variables

| Firebase Config | Environment Variable |
|---|---|
| `apiKey` | `VITE_FIREBASE_API_KEY` |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` |
| `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `VITE_FIREBASE_APP_ID` |

**Example `.env.local`:**
```env
VITE_FIREBASE_API_KEY=AIzaSyDfGh_J8kPqL9mN0oP1qR2sT3uV4wX5yZ6
VITE_FIREBASE_AUTH_DOMAIN=studiy-dev-12345.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=studiy-dev-12345
VITE_FIREBASE_STORAGE_BUCKET=studiy-dev-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### Enabling Firebase Authentication

1. **Go to Authentication**
   - In Firebase Console, click "Authentication" in left sidebar
   - Click "Get started"

2. **Enable Email/Password Provider**
   - Click "Email/Password" in the providers list
   - Toggle "Enable"
   - Click "Save"

3. **Enable Google OAuth**
   - Click on "Google" provider
   - Toggle "Enable"
   - Select your project support email
   - Click "Save"

4. **Configure Authorized Domains**
   - Scroll down to "Authorized domains" section
   - For development: `localhost:5173` is usually auto-added
   - Also add:
     ```
     localhost
     127.0.0.1
     ```
   - For production: Add your domain (e.g., `studiy.com`)

### Setting Up Firestore Database

1. **Create Database**
   - In Firebase Console, go to "Firestore Database" (left sidebar)
   - Click "Create database"
   - Select location: Choose the region closest to your users
   - Select "Start in Test mode" (for development only!)
   - Click "Create"

2. **Configure Security Rules**
   - Click on "Rules" tab
   - Replace the default rules with:

   ```firestore
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // User profiles - public read, user write
       match /users/{userId} {
         allow read: if true;
         allow write: if request.auth.uid == userId;
       }
       
       // Study materials - public read, authenticated write
       match /materials/{materialId} {
         allow read: if true;
         allow create: if request.auth != null;
         allow update: if request.auth.uid == resource.data.uploadedBy;
         allow delete: if request.auth.uid == resource.data.uploadedBy;
       }
       
       // Comments - public read, authenticated create/delete own
       match /comments/{commentId} {
         allow read: if true;
         allow create: if request.auth != null;
         allow update: if request.auth.uid == resource.data.userId;
         allow delete: if request.auth.uid == resource.data.userId;
       }
       
       // Resource requests
       match /resourceRequests/{requestId} {
         allow read: if true;
         allow create: if request.auth != null;
         allow update: if request.auth.uid == resource.data.requestedBy;
         allow delete: if request.auth.uid == resource.data.requestedBy;
       }
       
       // Lost and Found items
       match /lostAndFound/{itemId} {
         allow read: if true;
         allow create: if request.auth != null;
         allow update: if request.auth.uid == resource.data.uploadedBy;
         allow delete: if request.auth.uid == resource.data.uploadedBy;
       }
       
       // Deny everything else
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```
   
   - Click "Publish" to apply rules

### Setting Up Firebase Storage

1. **Create Storage Bucket**
   - In Firebase Console, go to "Storage" (left sidebar)
   - Click "Get started"
   - Select your region
   - Choose "Start in test mode"
   - Click "Create"

2. **Configure Storage Rules**
   - Click on "Rules" tab
   - Replace default rules with:

   ```firestore
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       // Profile pictures
       match /profiles/{userId}/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth.uid == userId;
       }
       
       // Study materials
       match /materials/{userId}/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth.uid == userId;
       }
       
       // Deny everything else
       match /{allPaths=**} {
         allow read, write: if false;
       }
     }
   }
   ```
   
   - Click "Publish"

### Production Deployment

When moving to production:

1. **Create a Production Firebase Project**
   - Follow the same steps above
   - Use a different project ID (e.g., "studiy-prod")

2. **Update Environment Variables**
   - Create `.env.production.local` file with production Firebase config
   - Deploy to your hosting platform with these variables

3. **Update Security Rules**
   - Replace test mode rules with stricter production rules
   - Implement proper authentication checks

4. **Add Your Domain**
   - Add your production domain to "Authorized domains" in Authentication
   - Update CORS headers in Storage if needed

5. **Backup Your Data**
   - Enable automatic backups in Firestore settings
   - Set up monitoring and alerts

### Common Firebase Issues & Solutions

**Issue: "Missing or insufficient permissions"**
- Check your Firestore security rules
- Verify user is authenticated before operations
- Check rule syntax for typos

**Issue: "auth/invalid-api-key"**
- Verify API key in `.env.local` is correct
- Check that the web app is registered in Firebase
- Ensure API key is for the correct project

**Issue: CORS errors when uploading files**
- Update Storage CORS configuration
- Add your domain to authorized domains

### Debugging Firebase

Enable Firebase debug logging:

```typescript
// In your main.tsx
import { enableLogging } from 'firebase/firestore';
enableLogging(true);
```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint code
npm run lint
```

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (placeholders, etc.)
│   ├── layout/         # Layout components (header, footer, navbar)
│   └── ui/             # UI components (Button, Card, Input, etc.)
├── context/            # React Context (Authentication)
├── firebase/           # Firebase services and utilities
├── hooks/              # Custom React hooks
├── layouts/            # Page layouts (MainLayout, AuthLayout, etc.)
├── pages/              # Page components organized by section
│   ├── admin/          # Admin dashboard and pages
│   ├── auth/           # Authentication pages (login, signup)
│   ├── dashboard/      # User dashboard
│   ├── landing/        # Landing page
│   ├── legal/          # Legal pages (terms, privacy)
│   └── user/           # User pages
├── router/             # Route configuration
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Main app component
```

### Theming

The app uses a custom brand color system. Update the brand color in:

1. `src/index.css` - CSS variables
2. `src/utils/brandColor.ts` - Color constants

Current brand color: `#6396fd`

### Adding New Components

All UI components use TypeScript and should follow these patterns:

```typescript
import React from 'react';
import { cn } from '@/src/utils/cn';

export function MyComponent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-xl border border-[#E5E7EB]', className)} {...props} />
  );
}
```

## Firebase Features Used

### Authentication
- Email/Password signup and login
- Google OAuth integration
- Email verification on signup
- Password reset functionality
- Session persistence with localStorage

### Firestore Database
- Real-time data synchronization
- User profiles and settings
- Study materials and resources
- Comments and interactions
- Resource requests
- Lost & Found items

### Firebase Storage
- Study material file uploads
- Profile picture storage
- Resource attachments
- Image optimization

## Deployment

The app is optimized for deployment on Vercel:

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Add environment variables in project settings
   - Deploy

3. **Configure Production Firebase**
   - Add your production domain to Firebase authorized domains
   - Update Firestore security rules for production
   - Set up Firebase Storage CORS headers if needed

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@studiy.com or open an issue in the GitHub repository.

## Acknowledgments

- Built with [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Firebase](https://firebase.google.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Deployed on [Vercel](https://vercel.com/)

---

<div align="center">
  Made with ❤️ by DevChauhan
  
  [Website](https://studiy.com) • [GitHub](https://github.com/devchauhann/studiy) • [Twitter](https://twitter.com/devchauhan)
</div>
