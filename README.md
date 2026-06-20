# StudySync

StudySync is a collaborative academic group management platform designed to help university students work together more effectively. The platform enables students to create study groups, assign tasks, track progress, monitor contributions, and generate performance reports in real time.

## Problem Statement

Students often rely on fragmented tools such as WhatsApp, shared documents, and spreadsheets to coordinate group assignments. These tools make it difficult to track accountability, task completion, and individual contributions.

StudySync solves this problem by providing a centralized platform for group collaboration, task management, and contribution tracking.

## Features

### Authentication
- User registration and login
- Secure authentication using Firebase Authentication
- Session management

### Dashboard
- Overview of user activity
- Recent login monitoring
- Group statistics
- Task statistics
- Progress insights

### Study Groups
- Create study groups
- Join groups using unique group codes
- Leave groups
- Manage group membership

### Task Management
- Create tasks
- Assign tasks to group members
- Set deadlines
- Track task status
- Mark tasks as completed or pending

### Reports & Analytics
- Task completion metrics
- Progress tracking
- Contribution analysis
- Group performance insights
- Real-time reporting dashboard

### Real-Time Updates
- Live synchronization using Firebase Firestore
- Instant updates across users and groups

## Tech Stack

### Frontend
- React.js
- React Router
- Tailwind CSS

### Backend & Database
- Firebase Firestore
- Firebase Authentication

### Development Tools
- Git
- GitHub
- Visual Studio Code


## Installation

### Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/studysync.git
```

### Navigate to Project Directory

```bash
cd studysync
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file and add your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Run Development Server

```bash
npm run dev
```

## Usage

1. Register a new account.
2. Login to the platform.
3. Create a study group or join an existing group using a group code.
4. Create and assign tasks.
5. Track task completion progress.
6. View contribution reports and analytics.


## Author

Esther Waikwa

Bachelor of Science in Software Engineering

## License

This project is for educational and portfolio purposes.
