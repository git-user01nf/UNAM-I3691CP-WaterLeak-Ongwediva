# UNAM I3691CP - Ongwediva Water Leak & Infrastructure Reporter

## Group Information
- **Group Name:** Ongwediva Water Leak & Infrastructure Reporter
- **Group Number:** 13
- **Engineering Domain:** Civil Engineering
- **Course:** Computer Programming I (I3691CP)
- **Semester:** 1, 2026

## Group Members and Roles

| # | Name | Student Number | Engineering Field | Role |
|---|------|----------------|-------------------|------|
| 1 | N Martin | 225041243 | Electrical Engineering | **Project Manager** |
| 2 | MN Fulayi | 224122754 | Electronics and Computer Engineering | **Lead Developer** |
| 3 | LS Lamek | 225141639 | Civil Engineering | App Features Developer |
| 4 | EI Onesmus | 218202150 | Mining Engineering | App Features Developer |
| 5 | AM Haufiku | 225130866 | Electrical Engineering | App Features Developer |
| 6 | LK Kakololo | 225061732 | Metallurgical Engineering | UI/UX Design |
| 7 | RP Hitilavali | 225159511 | Mining Engineering | UI/UX Design |
| 8 | SS Haiduwa | 225142546 | Electrical Engineering | UI/UX Design |
| 9 | M Muyoba | 225003708 | Electrical Engineering | Coder |
| 10 | MN Ngesheya | 225042738 | Mechanical Engineering | Coder |
| 11 | ENT Kalola | 221119019 | Mining Engineering | Testing and Development |
| 12 | EWT Angula | 225043491 | Mechanical Engineering | Testing and Development |
| 13 | EVE Wapota | 225044307 | Mechanical Engineering | Testing and Development |
| 14 | N Martin | 225041243 | Electrical Engineering | Documentation |
| 15 | SN Kakolo | 225044072 | Electrical Engineering | Documentation |
| 16 | RP Frans | 224122479 | Mining Engineering | Documentation |

## Team Breakdown by Role

### Project Management
| Name | Student Number | Role |
|------|----------------|------|
| N Martin | 225041243 | Project Manager |

### Development Team
| Name | Student Number | Role |
|------|----------------|------|
| MN Fulayi | 224122754 | Lead Developer |
| LS Lamek | 225141639 | App Features Developer |
| EI Onesmus | 218202150 | App Features Developer |
| AM Haufiku | 225130866 | App Features Developer |
| M Muyoba | 225003708 | Coder |
| MN Ngesheya | 225042738 | Coder |

### UI/UX Design Team
| Name | Student Number | Role |
|------|----------------|------|
| LK Kakololo | 225061732 | UI/UX Design |
| RP Hitilavali | 225159511 | UI/UX Design |
| SS Haiduwa | 225142546 | UI/UX Design |

### Testing and Quality Assurance
| Name | Student Number | Role |
|------|----------------|------|
| ENT Kalola | 221119019 | Testing and Development |
| EWT Angula | 225043491 | Testing and Development |
| EVE Wapota | 225044307 | Testing and Development |

### Documentation Team
| Name | Student Number | Role |
|------|----------------|------|
| N Martin | 225041243 | Documentation |
| SN Kakolo | 225044072 | Documentation |
| RP Frans | 224122479 | Documentation |

## Project Description

The Ongwediva Water Leak & Infrastructure Reporter is a mobile application that allows residents of Ongwediva to report infrastructure issues such as water leaks, potholes, broken street lights, sanitation problems, public safety concerns, and environmental issues. The app verifies the user's location to ensure they are within 15km of Ongwediva, allows image uploads via Cloudinary, and provides real-time updates on report status. Town council administrators can manage reports, update statuses, and post public announcements.

## Technology Stack

- **Frontend:** React Native with Expo
- **Backend:** Firebase (Authentication, Firestore)
- **Image Storage:** Cloudinary
- **Navigation:** React Navigation
- **Styling:** StyleSheet API + Expo Linear Gradient
- **Location:** Expo Location API
- **Camera/Gallery:** Expo Image Picker

## Features

- User registration and login with Firebase Auth
- Location verification (within 15km of Ongwediva)
- Report issues with images (water leaks, roads, sanitation, safety, environment)
- Real-time feed with category filters
- Like and comment on reports
- Admin panel for town council
- Public announcements
- Report status tracking (Pending → In Progress → Resolved)

## Setup Instructions

### Prerequisites
- Node.js 18 or higher
- Expo Go app on your phone
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/GIFTMATT/UNAM-I3691CP-WaterLeak-Ongwediva.git
