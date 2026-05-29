# Audia: A Music Social Platform

> **Audia** connects music lovers by transforming personal Spotify data into meaningful social experiences. Share your taste in music, discover like-minded listeners, and engage in community discussions—all while staying connected to the music you love.

## Table of Contents

- [Project Description](#project-description)
- [Features](#features)
- [Installation](#installation)
- [External Setup](#external-setup)
  - [Spotify API Configuration](#spotify-api-configuration)
  - [Firebase Configuration](#firebase-configuration)
- [How to Use](#how-to-use)
- [Project Structure](#project-structure)
- [Feature Status](#feature-status)
- [Credits](#credits)
- [Project Resources](#project-resources)

---

## Project Description

Audia is a full-stack web application built with **React**, **Express**, and **Firebase** that extends Spotify's functionality into the social realm. The platform enables users to:

- **View personalized music data**: Access your top artists, top songs, and liked tracks from Spotify with beautifully designed visualizations
- **Build a music identity**: Create and customize a public profile showcasing your favorite artists and songs
- **Connect with music fans**: Discover other users and view their music profiles
- **Communicate directly**: Send private messages to other users through an intuitive inbox
- **Participate in discussions**: Create and engage in music-related forums / discussion boards
- **Like and engage**: Show support for forum posts and build community connections

---

## Features

### Core Functionality

**User Authentication & Profiles**
- Spotify OAuth login integration
- Public/private profile visibility settings
- Profile customization with display preferences

**Spotify Integration**
- Real-time Spotify data retrieval
- Top Artists (All Time, Last 6 Months, Last Month)
- Top Songs (All Time, Last Year, Last Month)
- Liked Songs display with album artwork

**Social Features**
- **Messaging System**: Direct messaging between users with real-time updates via Socket.io
- **Forum System**: Discussion boards with nested replies, rich test editing, and attached Spotify tracks
- **Forum Search**: Client-side substring search filtering forums by title
- **Like System**: Like forum posts and comments to show support
- **Comment Count**: Forum cards display comment counts at a glance

**Discovery**
- Discover page listing all public user profiles
- View other users' music collections
- Browse user profiles to understand music preferences

**Design & UX**
- Light and dark mode toggle
- Fully responsive design (mobile, tablet, desktop)
- Clean, professional UI with custom design using Tailwind
- Smooth transitions and animations

---

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git
- A Spotify Developer account
- A Firebase project

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/serenren13/spotifyclone.git
   cd spotifyclone
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Return to root directory**
   ```bash
   cd ..
   ```

---

## External Setup

### Spotify API Configuration

1. **Create a Spotify Developer Account**
   - Visit [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Log in or create an account
> Note: you must have a Spotify Premium account for this.

2. **Register Your Application**
   - Click "Create an App"
   - Accept the terms and create
   - You'll receive a **Client ID** and **Client Secret**

3. **Configure Redirect URIs**
   - In your app settings, add Redirect URIs:
     - `http://127.0.0.1:5001/api/spotify/auth/callback` (for development)
     - Your production URL callback

4. **Set Environment Variables** (see step below)

### Firebase Configuration

1. **Create a Firebase Project**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enable Realtime Database and Authentication

2. **Get Firebase Credentials**
   - Go to Project Settings → Service Accounts
   - Generate a new private key (JSON file)

3. **Store Credentials**
   - Save the JSON file securely
   - Reference in your backend environment variables

### Environment Variables

#### Backend (`backend/.env`)
```
PORT=5001
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:5001/api/spotify/auth/callback
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
```

#### Frontend (`frontend/.env.local`)
```
VITE_BACKEND_URL=http://127.0.0.1:5001
VITE_FRONTEND_URL=http://127.0.0.1:5173
```

---

## How to Use

### Development Mode

1. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   ```
   Server runs on `http://localhost:5001`

2. **Start the Frontend Development Server** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   Application runs on `http://localhost:5173`

3. **Access the Application**
   - Open your browser and navigate to `http://localhost:5173`
   - Log in with your Spotify account
   - Explore the app features

---

## Project Structure

```
spotifyclone/
├── backend/
│   ├── routes/
│   │   ├── SpotifyRouter.js        # Spotify API endpoints
│   │   ├── UsersRouter.js          # User profile management
│   │   ├── ConversationsRouter.js  # Messaging endpoints
│   │   └── ForumsRouter.js         # Forum management
│   ├── db/
│   │   ├── UsersService.js         # User database operations
│   │   ├── ConversationsService.js # Message database operations
│   │   └── ForumsService.js        # Forum database operations
│   ├── tests/
│   │   └── forum.test.js           # Forum functionality tests
│   ├── app.js                      # Express app configuration
│   ├── server.js                   # Server entry point with Socket.io
│   ├── firebase.js                 # Firebase configuration
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   │   ├── ThemeToggle.jsx      # Light/dark mode toggle
│   │   │   ├── forums/              # Forum discussion components
│   │   │   │   ├── ForumCard.jsx    # Forum card with comment count
│   │   │   │   ├── ForumList.jsx    # Forum list view w/ search/create
│   │   │   │   ├── ForumDetail.jsx  # Forum detail view w/ comment thread
│   │   │   │   ├── Comment.jsx      # Recursive nested comment
│   │   │   │   ├── LikeButton.jsx   # Reusable like button
│   │   │   │   ├── RichTextEditor.jsx # TipTap editor
│   │   │   │   ├── useForum.jsx     # Forum CRUD, sort, and search
│   │   │   │   ├── useComments.jsx  # Comment CRUD and reply state
│   │   │   │   └── useTrackSearch.jsx # Spotify track search
│   │   │   ├── inbox/              # Messaging components
│   │   │   │   ├── ChatPanel.jsx
│   │   │   │   ├── ConversationList.jsx
│   │   │   │   ├── ConversationItem.jsx
│   │   │   │   ├── MessageBubble.jsx
│   │   │   │   ├── MessageInput.jsx
│   │   │   │   └── NewConversationModal.jsx
│   │   │   └── top-artists/        # Top artists display components
│   │   │       └── ArtistAvatar.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx         # Landing/home page
│   │   │   ├── Discover.jsx        # Browse user profiles
│   │   │   ├── Forums.jsx          # Discussion boards
│   │   │   ├── Inbox.jsx           # Messaging interface
│   │   │   ├── Profile.jsx         # User profile page
│   │   │   ├── PublicProfile.jsx   # Public user profile view
│   │   │   ├── TopArtists.jsx      # Top artists display
│   │   │   ├── TopSongs.jsx        # Top songs display
│   │   │   └── LikedSongs.jsx      # Liked songs display
│   │   ├── context/
│   │   │   ├── SpotifyContext.jsx  # Spotify data management
│   │   │   └── ThemeContext.jsx    # Theme state management
│   │   ├── lib/
│   │   │   ├── config.js           # Environment-aware URL config
│   │   │   └── buildTree.jsx       # Comment tree builder utility
│   │   ├── styling/
│   │   │   ├── Landing.css         # Landing page styles
│   │   │   ├── Sidebar.css         # Sidebar styles
│   │   │   └── TopArtists.css      # Top artists styles
│   │   ├── App.jsx                 # Root component
│   │   ├── main.jsx                # Route configuration
│   │   └── index.css               # Global styles & CSS variables
│   ├── index.html                  # HTML entry point
│   ├── vite.config.js              # Vite configuration
│   ├── eslint.config.js            # ESLint configuration
│   └── package.json
│
└── README.md
```

---

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| **Spotify Login** | ✅ Complete | OAuth integration functional |
| **Top Artists Display** | ✅ Complete | All time ranges supported |
| **Top Songs Display** | ✅ Complete | All time ranges supported |
| **Liked Songs Display** | ✅ Complete | Album artwork included |
| **User Profiles** | ✅ Complete | Create, edit, public/private toggle |
| **Discover Page** | ✅ Complete | Browse public profiles |
| **View Other Profiles** | ✅ Complete | See other users' music |
| **Direct Messaging** | 🔄 In Progress | Messaging works, just not real time |
| **Inbox Interface** | ✅ Complete | Conversation list and chat panels |
| **Forum System** | ✅ Complete | Create, post, nested replies, attached tracks |
| **Forum Search** | ✅ Complete | Client-side substring filter |
| **Comment Count** | ✅ Complete | Displayed on forum cards |
| **Light/Dark Theme** | ✅ Complete | Fully functional toggle |
| **Responsive Design** | ✅ Complete | Mobile, tablet, desktop optimized |
| **Real-time Updates** | ✅ Complete | Socket.io integration |
| **Database Integration** | ✅ Complete | Firebase Firestore |

---

## Credits

**Development Team**
- Built as part of Forge's Internship Program - Week 2 Mini Project
- Crystal Low, Serenity Phillips, Ashish Sunkarapalli, Shrihan Vijay, and Lulu Wilson

**Technologies & Libraries**
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [Firebase](https://firebase.google.com/)
- [React](https://react.dev/)
- [Express.js](https://expressjs.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.io](https://socket.io/)
- [Vite](https://vitejs.dev/)
- [TipTap](https://tiptap.dev/)

**Design Resources**
- [Figma Design System](https://www.figma.com/design/Hq5LtyFPXHw7gBlKTJfusT/Project-Layout)
- [Project Trello Board](https://trello.com/invite/b/6a14923e6caf97179b847447/ATTI71932dc964fc19079502bdbf6c0b45f93EEE945D/launch-week-2-project)
- [Full Assignment Details](https://docs.google.com/document/d/1G1j7hIby7OWzMTbx4_auER4fxZb3ikT-_5ZsOtzgpZA/edit?usp=sharing)
---

## License

This project is part of the Forge Internship Program and is provided as-is for educational and demonstration purposes.
