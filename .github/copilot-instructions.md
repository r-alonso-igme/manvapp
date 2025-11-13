# ManvApp - Volleyball Scoreboard Instructions

ManvApp is a real-time volleyball scoreboard web application with Firebase integration for live streaming matches between referees and spectators.

## Architecture Overview

### Core Components
- **Main Scoreboard** (`js/script.js`): Offline volleyball scoring logic with official rules (25 points, win by 2, best of 3/5 sets)
- **Real-time Streaming** (`js/realtime-streaming.js`): Firebase-powered live match sharing system with referee/spectator roles
- **Firebase Integration** (`js/firebase-config.js`): Real-time database configuration for match synchronization

### Key Data Flow
1. **Referee Mode**: Admin starts streaming with password → Creates Firebase match → Shares match ID/QR codes
2. **Spectator Mode**: Users join via match ID → Real-time score updates → Read-only interface
3. **Match State**: Stored in Firebase as `matches/{matchId}` with teamA/teamB objects, sets array, and metadata

## Development Patterns

### Firebase Configuration
- Config stored in `js/firebase-config.js` as ES6 module export
- App gracefully degrades to offline mode if Firebase not configured
- Uses dynamic script loading for Firebase SDK (see `loadFirebaseScripts()` in realtime-streaming.js)

### Admin Authentication
- Password-based referee authentication (see `adminPasswords` array in realtime-streaming.js)
- Current passwords: `admin123`, `referee2024`, `voleibol`
- No user registration - simple password check for match control

### UI State Management
- Dual mode UI: Full controls for referees, read-only for spectators
- State synchronization via `syncMatchFromFirebase()` and `updateFirebaseMatch()`
- Uses `isReferee` flag to show/hide admin controls

### CSS Architecture
- CSS custom properties for theming (`:root` and `[data-theme="dark"]`)
- Mobile-first responsive design with hamburger navigation
- Scoreboard uses CSS Grid for team layouts (`team-section` class)

## Development Workflow

### Local Development
```bash
npm run dev  # Starts live-server on port 3000 with auto-reload
```

### Firebase Setup
- Follow `FIREBASE_SETUP.md` for complete Firebase Realtime Database configuration
- Update `js/firebase-config.js` with your project credentials
- Configure security rules using `SECURITY_RULES.md` templates

### Key File Relationships
- `index.html` loads `script.js` (main functionality) and `realtime-streaming.js` (Firebase features)
- `styles.css` uses CSS Grid for scoreboard layout and CSS custom properties for theming
- Admin passwords and Firebase rules documented in respective `.md` files

## Testing & Debugging
- Use browser dev tools to monitor Firebase connection status
- Check console for "Firebase initialized successfully!" or offline mode messages
- Test both referee and spectator workflows using different browser sessions