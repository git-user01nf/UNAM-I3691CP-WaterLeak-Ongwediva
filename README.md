# 🚰 Ongwediva Water Leak & Infrastructure Reporter

> A mobile application enabling residents of Ongwediva to report infrastructure issues directly to the town council in real time.

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Team](#team)
- [Academic Context](#academic-context)

---

## 📖 About the Project

The **Ongwediva Water Leak & Infrastructure Reporter** is a cross-platform mobile app built with React Native and Expo. It empowers residents within Ongwediva to flag infrastructure problems such as water leaks, potholes, broken street lights, sanitation failures, public safety concerns, and environmental hazards directly to the local town council.

The app verifies that users are within **15 km of Ongwediva** before allowing reports to be submitted, ensuring reports are geographically relevant. Town council administrators have access to a dedicated admin panel where they can manage, update, and respond to reports, and post public announcements.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | User registration and login via Firebase Auth |
| 📍 **Location Verification** | Confirms user is within 15 km of Ongwediva before submission |
| 📷 **Image Uploads** | Attach photos to reports via camera or gallery (stored on Cloudinary) |
| 📋 **Issue Reporting** | Report water leaks, road damage, sanitation, safety & environmental issues |
| 📡 **Real-Time Feed** | Live feed of community reports with category filters |
| 👍 **Engagement** | Like and comment on reports |
| 🛠️ **Admin Panel** | Town council dashboard to manage reports and post announcements |
| 🔄 **Status Tracking** | Track report progress: `Pending` → `In Progress` → `Resolved` |

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React Native with Expo |
| **Backend** | Firebase (Authentication + Firestore) |
| **Image Storage** | Cloudinary |
| **Navigation** | React Navigation |
| **Styling** | StyleSheet API + Expo Linear Gradient |
| **Location** | Expo Location API |
| **Camera / Gallery** | Expo Image Picker |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed before proceeding:

- [Node.js](https://nodejs.org/) **v18 or higher**
- [Git](https://git-scm.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) install globally with:
  ```bash
  npm install -g expo-cli
  ```
- **Expo Go** app installed on your Android or iOS device ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/GIFTMATT/UNAM-I3691CP-WaterLeak-Ongwediva.git
   cd UNAM-I3691CP-WaterLeak-Ongwediva
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

---

### Environment Variables

This project uses Firebase and Cloudinary. You must create a `.env` file in the root directory and populate it with your own credentials.

```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

> ⚠️ **Never commit your `.env` file.** Ensure `.env` is listed in your `.gitignore`.

---

### Running the App

Start the Expo development server:

```bash
npx expo start
```

Then:
- **On your phone:** Open the **Expo Go** app and scan the QR code shown in the terminal or browser.
- **On an emulator:** Press `a` for Android emulator or `i` for iOS simulator in the terminal.

---

## 📁 Project Structure

```
UNAM-I3691CP-WaterLeak-Ongwediva/
├── assets/              # Images, icons, and static assets
├── components/          # Reusable UI components
├── screens/             # App screens (Login, Home, Report, Admin, etc.)
├── navigation/          # React Navigation configuration
├── services/            # Firebase and Cloudinary service modules
├── utils/               # Helper functions (e.g. location verification)
├── App.js               # Root entry point
├── app.json             # Expo configuration
├── .env                 # Environment variables (not committed)
└── README.md
```

---

## ⚙️ How It Works

1. **User signs up / logs in** using Firebase Authentication.
2. **Location is checked** — the app uses Expo Location API to confirm the user is within 15 km of Ongwediva Town Centre.
3. **User submits a report** by selecting a category, writing a description, and optionally attaching an image (uploaded to Cloudinary).
4. **Report is saved** to Firestore and appears on the community feed in real time.
5. **Other residents** can view, like, and comment on active reports.
6. **Admin users** (town council) log in to the admin panel, where they can update report statuses and post public announcements visible to all users.

---

## 👥 Team

**Group 13 — Computer Programming I (I3691CP), Semester 1, 2026**
**Engineering Domain:** Civil Engineering | **Institution:** UNAM

### Project Management
| Name | Student No. | Role |
|------|-------------|------|
| N Martin | 225041243 | Project Manager |

### Development Team
| Name | Student No. | Role |
|------|-------------|------|
| MN Fulayi | 224122754 | Lead Developer |
| LS Lamek | 225141639 | App Features Developer |
| EI Onesmus | 218202150 | App Features Developer |
| AM Haufiku | 225130866 | App Features Developer |
| M Muyoba | 225003708 | Coder |
| MN Ngesheya | 225042738 | Coder |

### UI/UX Design Team
| Name | Student No. | Role |
|------|-------------|------|
| LK Kakololo | 225061732 | UI/UX Design |
| RP Hitilavali | 225159511 | UI/UX Design |
| SS Haiduwa | 225142546 | UI/UX Design |

### Testing & Quality Assurance
| Name | Student No. | Role |
|------|-------------|------|
| ENT Kalola | 221119019 | Testing & Development |
| EWT Angula | 225043491 | Testing & Development |
| EVE Wapota | 225044307 | Testing & Development |

### Documentation Team
| Name | Student No. | Role |
|------|-------------|------|
| N Martin | 225041243 | Documentation |
| SN Kakolo | 225044072 | Documentation |
| RP Frans | 224122479 | Documentation |

---

## 🎓 Academic Context

This project was developed as part of the **I3691CP Computer Programming I** module at the **University of Namibia (UNAM)**, under the supervision of **Mr. Abisai**, Semester 1, 2026. It serves as the group's semester-long application development project, covering the full software development lifecycle from concept to implementation.

---

*University of Namibia · I3691CP · Group 13 · 2026*
