import React, { useState, useRef, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  setLogLevel,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// --- Import brand logo assets ---
import appLogo from "./assets/app-logo.png"; // main logo for navbar and background
// You may also use public/icons/favicon[1].svg, etc. if you want SVG logos.

// --- i18n and country language detection ---
const countryLanguageMap = {
  'US': 'en', 'GB': 'en', 'FR': 'fr', 'ES': 'es', 'DE': 'de', 'IT': 'it', 'JP': 'ja', 'KR': 'ko',
};

const translations = {
  'en': {
    welcome: "Welcome to Stash or Trash!",
    submit: "Submit",
    stash: "Stash",
    trash: "Trash",
    whatsTheVerdict: "What's the verdict?",
    describeItem: "Describe your item to stash or trash...",
    descriptionRequired: "A description is required.",
    selectRating: "Please select either Stash or Trash.",
    firebaseNotAvailable: "Firebase services not available.",
    submissionSuccessful: "Submission successful!",
    errorSubmitting: "Error submitting item. Please try again.",
    submitting: "Submitting...",
    mySubmissions: "My Submissions",
    youHaveNotSubmitted: "You haven't stashed or trashed anything yet!",
    loading: "Loading...",
    home: "Home",
    profile: "Profile",
    userProfile: "User Profile",
    userDetails: "User Details:",
    userId: "User ID:",
    email: "Email:",
    isAnonymous: "Is Anonymous:",
    loadingItems: "Loading items...",
    noItemsSubmitted: "No items have been submitted yet. Be the first!",
    shareOnLinkedin: "Share on LinkedIn",
    shareOnFacebook: "Share on Facebook",
    allSubmissions: "All Submissions",
    camera: "Camera",
    stopCapture: "Stop Capture",
  },
  // ...other translations from your file
};

setLogLevel('debug');

// 1. Use environment variables instead of undefined globals
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// 2. Initialize Firebase services
const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;

const initializeFirebaseCanvasAuth = async () => {
  if (!auth) {
    console.error("Firebase Auth is not initialized.");
    return;
  }
  try {
    if (initialAuthToken) {
      await signInWithCustomToken(auth, initialAuthToken);
    } else {
      await signInAnonymously(auth);
    }
    console.log("Firebase authentication successful.");
  } catch (error) {
    console.error("Firebase authentication failed:", error);
  }
};

// UI components (mocked shadcn/ui with Tailwind)
const Card = ({ children, className }) => (
  <div className={`rounded-xl border bg-white text-gray-900 shadow-lg ${className || ""}`}>{children}</div>
);
const CardContent = ({ children }) => <div className="p-6">{children}</div>;
const Button = ({
  children,
  onClick,
  className,
  disabled,
  type = "button",
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 py-2 px-4 ${className || ""}`}
  >
    {children}
  </button>
);
const Input = ({
  type,
  placeholder,
  value,
  onChange,
  className,
  accept,
  onChangeFile,
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange || onChangeFile}
    accept={accept}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
  />
);

const SubmissionForm = ({ userId, t }) => {
  // ...unchanged logic from your original file, use t for translations
  // (copy all your SubmissionForm implementation here)
};

const StashOrTrashList = ({ t, authReady }) => {
  // ...unchanged logic from your original file, use t for translations
};

const UserWall = ({ userId, authReady, t }) => {
  // ...unchanged logic from your original file, use t for translations
};

const HomePage = ({ user, authReady, t }) => (
  <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
    <SubmissionForm userId={user?.uid} t={t} />
    <StashOrTrashList userId={user?.uid} authReady={authReady} t={t} />
  </div>
);

const ProfilePage = ({ user, authReady, t }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 rounded-lg shadow-md">
    <Card className="w-full max-w-xl">
      <CardContent>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('userProfile')}</h2>
        <p className="text-lg text-gray-600 text-center max-w-lg">View and manage your user profile and settings here.</p>
        {user && (
          <div className="mt-6 p-6 bg-white rounded-lg shadow-md w-full max-w-md border-t-4 border-gray-800">
            <h3 className="text-xl font-bold mb-2 text-gray-800">{t('userDetails')}</h3>
            <p className="text-sm text-gray-700">
              <strong>{t('userId')}</strong> <span className="font-mono break-all">{user.uid}</span>
            </p>
            <p className="text-sm text-gray-700">
              <strong>{t('email')}</strong> {user.email || "N/A"}
            </p>
            <p className="text-sm text-gray-700">
              <strong>{t('isAnonymous')}</strong> {user.isAnonymous ? "Yes" : "No"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
    {user && <UserWall userId={user.uid} authReady={authReady} t={t} />}
  </div>
);

const App = () => {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [authReady, setAuthReady] = useState(false);
  const [language, setLanguage] = useState("en");

  const t = (key) => translations[language][key] || key;

  // --- Automatic hyperlocal language selection ---
  useEffect(() => {
    const storedLang = localStorage.getItem("appLanguage");
    if (storedLang) {
      setLanguage(storedLang);
    } else {
      fetch("https://ipapi.co/json/")
        .then((res) => res.json())
        .then((data) => {
          const countryCode = data.country_code;
          const mappedLanguage = countryLanguageMap[countryCode] || 'en';
          setLanguage(mappedLanguage);
          localStorage.setItem("appLanguage", mappedLanguage);
        })
        .catch(() => {
          setLanguage("en");
          localStorage.setItem("appLanguage", "en");
        });
    }
  }, []);
  // ------------------------------------

  useEffect(() => {
    let unsubscribe = () => {};
    if (auth) {
      initializeFirebaseCanvasAuth().then(() => {
        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setAuthReady(true);
        });
      });
    } else {
      setAuthReady(true);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-bold text-gray-800">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div
      className="font-sans min-h-screen"
      style={{
        backgroundImage: `url(${appLogo})`,
        backgroundRepeat: "repeat",
        backgroundSize: "250px",
        opacity: 1,
      }}
    >
      <div className="bg-gray-800 text-white py-4 px-6 flex justify-between items-center rounded-b-lg shadow-lg">
        {/* --- LOGO in NAVBAR --- */}
        <div className="flex items-center space-x-3">
          <img
            src={appLogo}
            alt="Platform Logo"
            className="h-10 w-10 rounded-full shadow"
            style={{ background: "#fff" }}
          />
          <h1 className="text-xl font-bold">{t('welcome')}</h1>
        </div>
        <div className="space-x-4">
          <Button
            onClick={() => setCurrentPage("home")}
            className={`${currentPage === "home"
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-600 hover:bg-gray-700 text-gray-300"
              }`}
          >
            {t('home')}
          </Button>
          <Button
            onClick={() => setCurrentPage("profile")}
            className={`${currentPage === "profile"
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-600 hover:bg-gray-700 text-gray-300"
              }`}
          >
            {t('profile')}
          </Button>
        </div>
      </div>
      {currentPage === "home" && <HomePage user={user} authReady={authReady} t={t} />}
      {currentPage === "profile" && <ProfilePage user={user} authReady={authReady} t={t} />}
    </div>
  );
};

export default App;
