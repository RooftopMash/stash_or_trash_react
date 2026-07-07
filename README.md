# Stash or Trash - Community Brand Rating Platform

A community-driven web application that lets users rate global brands as either worth keeping ("Stash") or discarding ("Trash"), with multimedia support, multilingual accessibility, and real-time sharing.

## What It Does

**Stash or Trash** is a two-sided engagement platform where:

- **Users submit ratings** on brands with descriptions and media (photos/videos)
- **Users choose**: 💰 **Stash** (keep/recommend) or 🚮 **Trash** (discard/avoid)
- **Users upload media**: Optional image or video to support their opinion
- **Users share socially**: Post submissions to LinkedIn or Facebook
- **Community views**: All users see a live feed of all submissions
- **User profiles**: Track your own submissions and opinions
- **Multilingual**: Auto-detects user location via IP and sets language accordingly (EN, FR, ES, DE, IT, JA, KO)

## Stack

- **Frontend**: React 18.2 + Create React App
- **Styling**: Tailwind CSS (PostCSS)
- **Backend**: Firebase (Authentication, Firestore Database, Storage)
- **Internationalization**: i18next
- **Charts**: Recharts

## Quick Start

### Prerequisites
- Node.js 14+
- npm

### Installation

```bash
# Clone and install
git clone https://github.com/RooftopMash/stash_or_trash_react.git
cd stash_or_trash_react
npm install
```

### Configuration

Update `.env` with your Firebase credentials:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
REACT_APP_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"...","measurementId":"..."}
REACT_APP_APP_ID=stash-or-trash
```

### Running

```bash
# Development
npm start

# Production build
npm build

# Tests
npm test
```

The app runs on `http://localhost:3000` by default.

## Features

✅ **Anonymous authentication** (Firebase Auth)  
✅ **Real-time database** (Firestore with live listeners)  
✅ **Media uploads** (Firebase Storage for images/videos)  
✅ **Live brand feed** (all submissions visible globally)  
✅ **User submissions dashboard** (personal "My Submissions" page)  
✅ **Camera capture** (record video directly in browser)  
✅ **Social sharing** (LinkedIn & Facebook buttons)  
✅ **Responsive UI** (mobile-first Tailwind design)  
✅ **Auto language detection** (IP geolocation)  
✅ **Toast notifications** (user feedback on actions)  

## Project Structure

```
src/
  App.js        - Main app logic, all components, pages (1 file)
  index.js      - React root render
  index.css     - Tailwind CSS directives
  firebase.js   - Firebase SDK exports (unused; init in App.js)
  
public/
  index.html    - HTML entry point
  manifest.json - PWA metadata
  icons/        - Favicon & app icons (to be added)
  
Config:
  .env          - Environment variables (Firebase config)
  package.json  - Dependencies
  tailwind.config.js - Tailwind configuration
  postcss.config.js  - PostCSS + Autoprefixer
```

## How It Works

1. **User lands on app** → Firebase auth initializes (anonymous login)
2. **Language auto-detects** via IP geolocation API
3. **Home page loads**:
   - **Top**: Submission form (description + rating + optional media)
   - **Bottom**: Live feed of all brand submissions (sorted by newest first)
4. **User submits** → Media uploads to Firebase Storage → Entry saved to Firestore
5. **Profile page**: User sees their own submissions + can share to social media
6. **Real-time sync**: All changes reflect instantly across all users

## Firebase Firestore Structure

Submissions are stored in:
```
/artifacts/{appId}/public/data/submissions/
  - userId: string (user's Firebase UID)
  - description: string (brand opinion)
  - rating: string ("Stash" or "Trash")
  - mediaUrl: string (null or Firebase Storage download URL)
  - timestamp: Firestore server timestamp
```

## Deployment

This app is deployed on **Vercel** ([https://stash-or-trash-react.vercel.app](https://stash-or-trash-react.vercel.app))

Deploy with:
```bash
npm install -g vercel
vercel
```

## Known Limitations

- No user authentication beyond anonymous login
- No content moderation
- No rating aggregation or analytics
- All submissions visible to all users (public by default)
- i18n translations only stub (English implemented)

## Future Enhancements

- User accounts & authentication
- Brand pages with aggregated ratings
- Search & filtering
- Leaderboards / trending brands
- Admin moderation panel
- Multi-language full support
- Brand partnerships & ads

## License

ISC - See package.json

## Author

King Rooftop (@RooftopMash)

---

**Status**: 🟢 Functional  
**Last Updated**: July 2026  
**Live URL**: https://stash-or-trash-react.vercel.app
