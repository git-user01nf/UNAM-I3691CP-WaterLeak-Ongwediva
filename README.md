

```markdown
# 💧 Ongwediva Water Leak & Infrastructure Reporter


## 👥 Team Members

> **Group 13 · I3691CP Computer Programming I · Semester 1, 2026**

| Role | Name | Student Number |
|------|------|----------------|
| 📋 Project Manager | N Martin | 225041243 |
| 💻 Lead Developer | MN Fulayi | 224122754 |
| ⚙️ App Features Developer | LS Lamek | 225141639 |
| ⚙️ App Features Developer | EI Onesmus | 218202150 |
| ⚙️ App Features Developer | AM Haufiku | 225130866 |
| 🖥️ Coder | M Muyoba | 225003708 |
| 🖥️ Coder | MN Ngesheya | 225042738 |
| 🎨 UI/UX Design | LK Kakololo | 225061732 |
| 🎨 UI/UX Design | RP Hitilavali | 225159511 |
| 🎨 UI/UX Design | SS Haiduwa | 225142546 |
| 🧪 Testing & QA | ENT Kalola | 221119019 |
| 🧪 Testing & QA | EWT Angula | 225043491 |
| 🧪 Testing & QA | EVE Wapota | 225044307 |
| 📄 Documentation | SN Kakolo | 225044072 |
| 📄 Documentation | RP Frans | 224122479 |

---


> **I3691CP Computer Programming I — Semester 1, 2026**
> University of Namibia (UNAM) · School of Engineering and the Built Environment · Supervisor: Mr. Abisai

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Environment Variables](#environment-variables)
   - [Running the App](#running-the-app)
6. [Project Structure](#project-structure)
7. [Firebase Data Model](#firebase-data-model)
8. [How It Works](#how-it-works)
   - [User Workflow](#user-workflow)
   - [Admin Workflow](#admin-workflow)
9. [Testing](#testing)
10. [Team Members](#team-members)
11. [Academic Context](#academic-context)
12. [License](#license)

---

## 📌 Project Overview

The **Ongwediva Water Leak & Infrastructure Reporter** is a mobile application that enables residents of Ongwediva to report infrastructure issues directly to the Town Council. The app provides a centralized platform for reporting, tracking, and managing community infrastructure problems.

### ❗ Problem Statement
Residents currently lack an efficient way to report issues such as water leaks, potholes, broken street lights, and sanitation problems. Reports are often made verbally or through informal channels, leading to lost information, duplicate reporting, and delayed response times.

### ✅ Solution
This app provides a digital platform where residents can report issues with photos and descriptions, track report status, and engage with the community through likes and comments. The Town Council gains an administrative interface to monitor reports, update statuses, and communicate with residents.

---

## ✨ Features

| Category | Feature | Description |
|----------|---------|-------------|
| 🔐 **Authentication** | User Registration | Email and password registration via Firebase Auth |
| | User Login | Secure login with session persistence |
| | Logout | End user session |
| 📍 **Location** | GPS Verification | Verifies user is within 15km of Ongwediva |
| | Distance Calculation | Shows distance from Ongwediva town center |
| 📝 **Reporting** | Issue Submission | Report with title, description, and location |
| | Category Selection | Water Leaks, Roads, Sanitation, Safety, Environment |
| | Image Upload | Attach images from camera or gallery |
| | Video Upload | Record or select video evidence |
| | Voice Notes | Record voice notes for reports |
| 👁️ **Viewing** | Real-time Feed | Live updates of all reports |
| | Category Filtering | Filter reports by category tabs |
| | Status Badges | Visual indicators: Pending, In Progress, Resolved |
| 💬 **Engagement** | Likes | One like per user per report |
| | Comments | Public commenting on reports |
| 🛠️ **Admin** | Admin Panel | Dedicated dashboard for town council |
| | Status Management | Update report status |
| | Report Management | Edit or delete any report |
| | Announcements | Create and manage public announcements |
| 🔔 **Notifications** | Push Notifications | Real-time alerts when new reports are posted |

---

## 🛠️ Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend Framework** | React Native | 0.73.6 |
| **Development Platform** | Expo | 50.0.20 |
| **Navigation** | React Navigation | 6.x |
| **Authentication** | Firebase Auth | 10.7.2 |
| **Database** | Cloud Firestore | 10.7.2 |
| **Media Storage** | Cloudinary | API v1 |
| **Location Services** | Expo Location | 16.5.5 |
| **Image Picker** | Expo Image Picker | 14.7.1 |
| **Image Manipulation** | Expo Image Manipulator | 11.8.0 |
| **Audio/Video** | Expo AV | 13.10.6 |
| **Push Notifications** | Expo Notifications | 0.27.8 |
| **Styling** | StyleSheet + LinearGradient | — |

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Download |
|-------------|---------|----------|
| Node.js | v18 or higher | [nodejs.org](https://nodejs.org/) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |
| Expo CLI | Latest | `npm install -g expo-cli` |
| Expo Go App | Latest | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779) |
| Code Editor | Any | [VS Code](https://code.visualstudio.com/) recommended |

---

### Installation

```bash
# Clone the repository
git clone https://github.com/git-user01nf/UNAM-I3691CP-WaterLeak-Ongwediva.git

# Navigate to project directory
cd UNAM-I3691CP-WaterLeak-Ongwediva

# Install dependencies
npm install
```

---

### Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

> ⚠️ **Security Note:** The `.env` file is listed in `.gitignore` and should **never** be committed to version control.

---

### Running the App

```bash
# Start the development server
npx expo start --tunnel

# On your phone:
# 1. Open Expo Go app
# 2. Scan the QR code shown in the terminal
# 3. The app will load on your device
```

---

## 📁 Project Structure

```
UNAM-I3691CP-WaterLeak-Ongwediva/
│
├── App.js                         # Main entry point
├── app.json                       # Expo configuration
├── package.json                   # Dependencies
├── eas.json                       # EAS Build configuration
├── babel.config.js                # Babel for dotenv
├── .env                           # Environment variables (gitignored)
├── .gitignore                     # Git ignore rules
│
├── src/
│   ├── screens/                   # UI screens
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── HomeScreen.js
│   │   ├── ReportScreen.js
│   │   ├── ReportDetailScreen.js
│   │   ├── AdminPanelScreen.js
│   │   ├── AnnouncementsScreen.js
│   │   └── VerifyLocationScreen.js
│   │
│   ├── services/                  # Backend services
│   │   ├── firebase.js
│   │   ├── cloudinary.js
│   │   ├── locationService.js
│   │   └── notificationService.js
│   │
│   ├── hooks/                     # Custom React hooks
│   │   └── useNotifications.js
│   │
│   ├── navigation/                # Navigation setup
│   │   └── AppNavigator.js
│   │
│   └── utils/                     # Helper functions
│       └── constants.js
│
├── assets/                        # Images and icons
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash.png
│   └── favicon.png
│
├── android/                       # Android native files (generated)
│
└── .github/                       # GitHub Actions workflows
    └── workflows/
        └── build-android.yml
```

---

## 🗄️ Firebase Data Model

### Collection: `users`

| Field | Type | Description |
|-------|------|-------------|
| username | string | User's display name |
| email | string | User's email address |
| phone | string | Optional contact number |
| isAdmin | boolean | Admin privileges flag |
| pushToken | string | Expo push notification token |
| createdAt | timestamp | Account creation date |

---

### Collection: `reports`

| Field | Type | Description |
|-------|------|-------------|
| title | string | Report title (max 100 chars) |
| description | string | Detailed description |
| category | string | water, roads, sanitation, safety, environment |
| imageUrl | string | Cloudinary image URL |
| videoUrl | string | Cloudinary video URL (optional) |
| voiceUrl | string | Cloudinary audio URL (optional) |
| location | string | Text location description |
| userId | string | Reporter's Firebase UID |
| username | string | Reporter's display name |
| status | string | pending, in_progress, resolved |
| likes | number | Total like count |
| comments | number | Total comment count |
| createdAt | timestamp | Creation date |
| updatedAt | timestamp | Last update date |

---

### Subcollection: `reports/{reportId}/likes`

| Field | Type | Description |
|-------|------|-------------|
| userId | string | User who liked |
| likedAt | timestamp | When like was given |

---

### Subcollection: `reports/{reportId}/comments`

| Field | Type | Description |
|-------|------|-------------|
| userId | string | Commenter's UID |
| username | string | Commenter's display name |
| comment | string | Comment text |
| createdAt | timestamp | Comment time |

---

### Collection: `announcements`

| Field | Type | Description |
|-------|------|-------------|
| title | string | Announcement title |
| content | string | Announcement body |
| createdBy | string | Admin user ID |
| createdByName | string | Admin display name |
| createdAt | timestamp | Announcement date |

---

## ⚙️ How It Works

### 👤 User Workflow

```
Register → Verify Location (15km radius) → Login → View Reports → Filter by Category → Submit Report → Like/Comment
```

1. **Registration** — User creates account with email and password
2. **Location Verification** — GPS checks user is within 15km of Ongwediva
3. **Login** — Authenticated user accesses the app
4. **View Reports** — Main feed shows all reports in reverse chronological order
5. **Filter** — Category tabs filter reports (All, Water, Roads, Sanitation, Safety, Environment, Announcements)
6. **Submit Report** — User selects category, enters details, uploads media
7. **Engagement** — Users can like (once per report) and comment on any report

---

### 🛡️ Admin Workflow

```
Login → Admin Panel → View Reports → Update Status → Edit/Delete Reports → Create Announcements
```

1. **Login** — Admin user logs in (`isAdmin` flag in Firestore)
2. **Admin Panel** — Dedicated dashboard with reports and announcements tabs
3. **Manage Reports** — Update status (Pending → In Progress → Resolved), edit, or delete any report
4. **Announcements** — Create and delete public announcements visible to all users

---

### 🔄 Data Flow

1. User submits report with optional image/video/voice note
2. Media uploaded to Cloudinary, returns public URL
3. Report data saved to Firestore
4. Real-time listeners update all connected clients
5. Push notifications sent to all registered devices

---

## 🧪 Testing

```bash
# Run the app
npx expo start --tunnel

# Clear cache and restart
npx expo start -c

# Run Expo Doctor to check for issues
npx expo-doctor

# Build APK locally
npx expo prebuild --clean
cd android
gradlew.bat assembleRelease
```

### 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Regular User | user@example.com | As created during registration |
| Admin User | admin@ongwediva.gov.na | (Configured in Firestore) |

---

|

---

## 🎓 Academic Context

This project was developed as part of the **I3691CP Computer Programming I** module at the **University of Namibia (UNAM), School of Engineering and the Built Environment**, under the supervision of **Mr. Abisai**.

| Detail | Info |
|--------|------|
| **Semester** | 1, 2026 |
| **Engineering Domain** | Civil Engineering |
| **Institution** | University of Namibia, JEDS Campus |

---

## 📜 License

This project is developed for academic purposes as part of the UNAM I3691CP curriculum.

---

## 🙏 Acknowledgments

- **Mr. Abisai** — for project supervision and guidance
- **University of Namibia** — School of Engineering and the Built Environment
- **Ongwediva Town Council** — for providing the problem context

---

<div align="center">

**University of Namibia · I3691CP · Group 13 · 2026**

💧 *Empowering communities through digital infrastructure reporting*

</div>
```

