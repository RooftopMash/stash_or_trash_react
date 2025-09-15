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

// --- SVG brand logo everywhere for Silicon Valley Surpassing Standard! ---
const svgLogo = "/icons/logo.svg"; // Use SVG logo for crispness everywhere
const pngLogo = require("./assets/app-logo.png"); // fallback for legacy or image-only use

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
    stashOrTrash: "Stash Or Trash?",
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
    notificationSuccess: "Your action was successful!",
    notificationError: "Something went wrong.",
    notificationTitle: "Notification",
  },
  // ...other translations from your file
};

// Firebase initialization
setLogLevel('debug');
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

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

// UI components
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
  ariaLabel
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className={`inline-flex items-center justify-center rounded-md text-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-12 w-12 ${className || ""}`}
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

// Modal (brand-saturated)
const Modal = ({ show, onClose, title, message, isSuccess }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center border-2 border-gray-200">
        <img src={svgLogo} alt="Brand Logo" className="h-16 w-16 mb-4" />
        <h2 className={`text-2xl font-bold mb-2 ${isSuccess ? "text-green-600" : "text-red-600"}`}>{title}</h2>
        <p className="text-gray-700 mb-4">{message}</p>
        <Button onClick={onClose} ariaLabel="Close modal" className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold">
          <span role="img" aria-label="close">✔️</span>
        </Button>
      </div>
    </div>
  );
};

// Toast/snackbar notification (brand-saturated)
const Toast = ({ show, message, isSuccess, onClose }) => {
  if (!show) return null;
  return (
    <div className={`fixed bottom-6 right-6 bg-white border shadow-lg rounded-lg px-6 py-4 flex items-center space-x-3 z-50 ${isSuccess ? "border-green-400" : "border-red-400"}`}>
      <img src={svgLogo} alt="Brand Logo" className="h-8 w-8" />
      <span className={`text-lg font-semibold ${isSuccess ? "text-green-700" : "text-red-700"}`}>{message}</span>
      <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-800 font-bold text-xl" aria-label="close toast">✕</button>
    </div>
  );
};

const SubmissionForm = ({ userId, t, onNotify }) => {
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setMediaFile(file);
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    setFormError("");
  };

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsCapturing(true);

      mediaRecorderRef.current = new window.MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        blob.name = `capture_${Date.now()}.webm`;
        setMediaFile(blob);
        chunksRef.current = [];
        stopCapture();
      };
      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Error accessing the camera:", err);
      setIsCapturing(false);
    }
  };

  const stopCapture = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsCapturing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description) {
      setFormError(t('descriptionRequired'));
      onNotify(t('descriptionRequired'), false);
      return;
    }
    if (!rating) {
      setFormError(t('selectRating'));
      onNotify(t('selectRating'), false);
      return;
    }
    if (!db || !storage) {
      setFormError(t('firebaseNotAvailable'));
      onNotify(t('firebaseNotAvailable'), false);
      return;
    }
    setFormError("");
    setIsUploading(true);
    let mediaUrl = null;

    try {
      if (mediaFile) {
        const fileName = mediaFile.name || `media_${Date.now()}.webm`;
        const storageRef = ref(storage, `stash-or-trash/${userId}/${fileName}`);
        const uploadTask = await uploadBytes(storageRef, mediaFile);
        mediaUrl = await getDownloadURL(uploadTask.ref);
        console.log("Media uploaded successfully:", mediaUrl);
      }
      const submissionCollectionRef = collection(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "submissions"
      );
      await addDoc(submissionCollectionRef, {
        userId: userId,
        description: description,
        rating: rating,
        mediaUrl: mediaUrl,
        timestamp: serverTimestamp(),
      });

      setDescription("");
      setRating(null);
      setMediaFile(null);
      onNotify(t('submissionSuccessful'), true);
    } catch (error) {
      console.error("Error submitting item:", error);
      setFormError(t('errorSubmitting'));
      onNotify(t('errorSubmitting'), false);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-xl">
        <CardContent>
          <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-900 tracking-tight">{t('stashOrTrash')}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <textarea
              className="flex w-full min-h-[100px] rounded-md border border-gray-300 bg-white px-3 py-2 text-lg placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={t('describeItem')}
              value={description}
              onChange={handleDescriptionChange}
            />
            {formError && (
              <p className="text-red-500 text-sm mt-1">{formError}</p>
            )}

            <div className="flex justify-center items-center space-x-8 mt-4">
              <Button
                type="button"
                ariaLabel="Stash"
                onClick={() => setRating("Stash")}
                className={`bg-gray-200 text-green-600 hover:bg-green-50 border-2 border-green-300 ${rating === "Stash" ? "scale-125 bg-green-500 text-white border-green-500 shadow-lg" : ""}`}
              >
                <span role="img" aria-label="stash" className="text-3xl">💰</span>
              </Button>
              <Button
                type="button"
                ariaLabel="Trash"
                onClick={() => setRating("Trash")}
                className={`bg-gray-200 text-red-600 hover:bg-red-50 border-2 border-red-300 ${rating === "Trash" ? "scale-125 bg-red-500 text-white border-red-500 shadow-lg" : ""}`}
              >
                <span role="img" aria-label="trash" className="text-3xl">🚮</span>
              </Button>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="image/*,video/*"
                  onChangeFile={handleFileChange}
                  className="flex-grow"
                />
                <Button type="button" onClick={isCapturing ? stopCapture : startCapture} ariaLabel={isCapturing ? t('stopCapture') : t('camera')}>
                  {isCapturing ? <span role="img" aria-label="stop">⏹️</span> : <span role="img" aria-label="camera">📷</span>}
                </Button>
              </div>
              {isCapturing && (
                <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-md" />
              )}
              {mediaFile && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected file: {mediaFile.name || "Recorded media"}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isUploading || !rating || !description}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-md text-lg"
              ariaLabel={t('submit')}
            >
              {isUploading ? <span role="img" aria-label="submitting">⏳</span> : <span role="img" aria-label="submit">🚀</span>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const StashOrTrashList = ({ t, authReady }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !authReady) {
      setLoading(false);
      return;
    }
    const submissionsCollectionRef = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "submissions"
    );
    const q = query(submissionsCollectionRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })).sort((a, b) => (b.timestamp?.toDate()?.getTime() || 0) - (a.timestamp?.toDate()?.getTime() || 0));
        setItems(allItems);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching items:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authReady]);

  if (loading) {
    return (
      <div className="flex items-center justify-center my-8">
        <div className="text-xl font-bold text-gray-800">{t('loadingItems')}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start p-4 mt-8">
      {items.length === 0 ? (
        <div className="p-4 bg-white rounded-lg shadow-md">
          <p className="text-lg text-gray-600">
            {t('noItemsSubmitted')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${item.rating === "Stash"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                      }`}
                  >
                    {item.rating === "Stash" ? "💰" : "🚮"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {item.timestamp?.toDate
                      ? item.timestamp.toDate().toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <p className="text-gray-700 mb-4 break-words">{item.description}</p>
                {item.mediaUrl && (
                  <div className="mb-4">
                    {item.mediaUrl.match(/\.(mp4|webm)$/)
                      ? (
                        <video
                          controls
                          src={item.mediaUrl}
                          className="w-full rounded-lg"
                          onError={(e) =>
                            console.error("Video failed to load:", e)
                          }
                        />
                      )
                      : (
                        <img
                          src={item.mediaUrl}
                          alt="Submitted media"
                          className="w-full h-auto rounded-lg"
                          onError={(e) =>
                            (e.target.src =
                              "https://placehold.co/400x300/e5e7eb/4b5563?text=Image+Failed+to+Load")
                          }
                        />
                      )}
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  <p>{t('userId')}</p>
                  <p className="font-mono break-all">{item.userId}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const UserWall = ({ userId, authReady, t }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !userId || !authReady) {
      setLoading(false);
      return;
    }
    const submissionsCollectionRef = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "submissions"
    );
    const q = query(
      submissionsCollectionRef,
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })).sort((a, b) => (b.timestamp?.toDate()?.getTime() || 0) - (a.timestamp?.toDate()?.getTime() || 0));
        setItems(allItems);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching user's items:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, authReady]);

  if (loading) {
    return (
      <div className="flex items-center justify-center my-8">
        <div className="text-xl font-bold text-gray-800">
          {t('loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start p-4 mt-8 w-full">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">{t('mySubmissions')}</h3>
      {items.length === 0 ? (
        <div className="p-4 bg-white rounded-lg shadow-md w-full max-w-xl text-center">
          <p className="text-lg text-gray-600">
            {t('youHaveNotSubmitted')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${item.rating === "Stash"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                      }`}
                  >
                    {item.rating === "Stash" ? "💰" : "🚮"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {item.timestamp?.toDate
                      ? item.timestamp.toDate().toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <p className="text-gray-700 mb-4 break-words">{item.description}</p>
                {item.mediaUrl && (
                  <div className="mb-4">
                    {item.mediaUrl.match(/\.(mp4|webm)$/)
                      ? (
                        <video
                          controls
                          src={item.mediaUrl}
                          className="w-full rounded-lg"
                          onError={(e) =>
                            console.error("Video failed to load:", e)
                          }
                        />
                      )
                      : (
                        <img
                          src={item.mediaUrl}
                          alt="Submitted media"
                          className="w-full h-auto rounded-lg"
                          onError={(e) =>
                            (e.target.src =
                              "https://placehold.co/400x300/e5e7eb/4b5563?text=Image+Failed+to+Load")
                          }
                        />
                      )}
                  </div>
                )}
                <div className="flex space-x-2 mt-4">
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      typeof window !== "undefined" ? window.location.href : ""
                    )}&summary=${encodeURIComponent(item.description)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 px-4 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium"
                  >
                    {t('shareOnLinkedin')}
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      typeof window !== "undefined" ? window.location.href : ""
                    )}&quote=${encodeURIComponent(item.description)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 px-4 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium"
                  >
                    {t('shareOnFacebook')}
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const HomePage = ({ user, authReady, t, onNotify }) => (
  <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
    <SubmissionForm userId={user?.uid} t={t} onNotify={onNotify} />
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

  // Notification/modal/toast state
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalSuccess, setModalSuccess] = useState(true);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastSuccess, setToastSuccess] = useState(true);

  const t = (key) => translations[language][key] || key;

  // Hyperlocal language selection
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

  // Notification handler for form, can trigger modal or toast
  const handleNotify = (msg, success = true) => {
    setToastMsg(msg);
    setToastSuccess(success);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-bold text-gray-800">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen">
      <div className="bg-gray-800 text-white py-4 px-6 flex justify-between items-center rounded-b-lg shadow-lg">
        {/* --- LOGO in NAVBAR --- */}
        <div className="flex items-center space-x-3">
          {/* SVG logo for infinite crispness in navbar */}
          <img
            src={svgLogo}
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
            ariaLabel={t('home')}
          >
            <span role="img" aria-label="home">🏠</span>
          </Button>
          <Button
            onClick={() => setCurrentPage("profile")}
            className={`${currentPage === "profile"
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-600 hover:bg-gray-700 text-gray-300"
              }`}
            ariaLabel={t('profile')}
          >
            <span role="img" aria-label="profile">👤</span>
          </Button>
        </div>
      </div>
      {/* Toast notification */}
      <Toast show={showToast} message={toastMsg} isSuccess={toastSuccess} onClose={() => setShowToast(false)} />
      {/* Modal example (can be triggered elsewhere if needed) */}
      <Modal show={showModal} onClose={() => setShowModal(false)} title={modalTitle || t('notificationTitle')} message={modalMsg} isSuccess={modalSuccess} />
      {/* Page content */}
      {currentPage === "home" && <HomePage user={user} authReady={authReady} t={t} onNotify={handleNotify} />}
      {currentPage === "profile" && <ProfilePage user={user} authReady={authReady} t={t} />}
      {/* Brand footer */}
      <footer className="flex items-center justify-center py-8 bg-gray-100 border-t mt-16">
        <img src={svgLogo} alt="footer logo" className="h-8 w-8 mr-2" />
        <span className="text-gray-600 font-light">Stash or Trash &copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
};

export default App;
