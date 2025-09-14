import React, { useState, useRef, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  setLogLevel,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import i18n from "./i18n";
import { countryLanguageMap } from "./i18n/countryLanguageMap";

setLogLevel('debug');

// 1. Use environment variables instead of undefined globals
const firebaseConfig = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG || "{}");
const initialAuthToken = process.env.REACT_APP_INITIAL_AUTH_TOKEN || null;
const rawAppId = process.env.REACT_APP_APP_ID || "default-app-id";
const appId = rawAppId.match(/^c_[a-z0-9]+/)?.[0] || "default-app-id";

// 2. Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const initializeFirebaseCanvasAuth = async () => {
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
  <div className={`rounded-xl border bg-white text-gray-900 shadow ${className || ""}`}>{children}</div>
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
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 py-2 px-4 ${className || ""}`}
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

const SubmissionForm = ({ userId }) => {
  // ... (unchanged logic from your original file)
  // ... (keep everything as you had it)
};

const StashOrTrashList = ({ userId, authReady }) => {
  // ... (unchanged logic from your original file)
};

const UserWall = ({ userId, authReady }) => {
  // ... (unchanged logic from your original file)
};

const HomePage = ({ user, authReady }) => (
  // ... (unchanged logic from your original file)
);

const ProfilePage = ({ user, authReady }) => (
  // ... (unchanged logic from your original file)
);

const App = () => {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [authReady, setAuthReady] = useState(false);

  // ======= NEW: Automatic Language Selection =======
  useEffect(() => {
    if (!localStorage.getItem("i18nextLng")) {
      fetch("https://ipapi.co/json/")
        .then((res) => res.json())
        .then((data) => {
          const countryCode = data.country_code;
          const mappedLanguage = countryLanguageMap[countryCode];
          if (mappedLanguage) {
            i18n.changeLanguage(mappedLanguage);
            // Optional: Show toast "We've set your language to X. Change anytime!"
          }
        })
        .catch((err) => {
          // If API fails, fallback is browser detection via i18next
          console.error("Could not detect country for language selection.", err);
        });
    }
  }, []);
  // ================================================

  useEffect(() => {
    let unsubscribe = () => {};
    initializeFirebaseCanvasAuth().then(() => {
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthReady(true);
      });
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-bold text-gray-800">Loading...</div>
      </div>
    );
  }

  return (
    <div className="font-sans">
      <div className="bg-gray-800 text-white py-4 px-6 flex justify-between items-center rounded-b-lg shadow-lg">
        <h1 className="text-xl font-bold">Stash or Trash</h1>
        <div className="space-x-4">
          <Button
            onClick={() => setCurrentPage("home")}
            className={`${currentPage === "home"
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-600 hover:bg-gray-700 text-gray-300"
              }`}
          >
            Home
          </Button>
          <Button
            onClick={() => setCurrentPage("profile")}
            className={`${currentPage === "profile"
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-600 hover:bg-gray-700 text-gray-300"
              }`}
          >
            Profile
          </Button>
        </div>
      </div>
      {currentPage === "home" && <HomePage user={user} authReady={authReady} />}
      {currentPage === "profile" && <ProfilePage user={user} authReady={authReady} />}
    </div>
  );
};

export default App;
