/* global __firebase_config, __initial_auth_token, __app_id */
import React, { useState, useRef, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

// Mocking shadcn/ui components with Tailwind CSS for a professional look.
const Card = ({ children, className }) => (
  <div className={`rounded-xl border bg-white text-gray-900 shadow ${className}`}>
    {children}
  </div>
);
const CardContent = ({ children }) => <div className="p-6">{children}</div>;
const Button = ({ children, onClick, className, disabled, type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 py-2 px-4 ${className}`}
  >
    {children}
  </button>
);
const Input = ({ type, placeholder, value, onChange, className, accept, onChangeFile }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange || onChangeFile}
    accept={accept}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

// Global Firebase variables provided by the environment
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const appId = rawAppId.match(/^c_[a-z0-9]+/)?.[0] || 'default-app-id';

// Initialize Firebase services
let app, auth, db, storage;
try {
  if (Object.keys(firebaseConfig).length > 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  }
} catch (e) {
  console.error("Firebase initialization failed:", e);
}

// A simple utility to sign in if a custom token is available, otherwise anonymously.
const initializeFirebaseCanvasAuth = async () => {
  if (!auth) return;
  try {
    if (initialAuthToken) {
      await signInWithCustomToken(auth, initialAuthToken);
      console.log("Signed in with custom token.");
    } else {
      await signInAnonymously(auth);
      console.log("Signed in anonymously.");
    }
  } catch (error) {
    console.error("Firebase authentication failed:", error);
  }
};

const SubmissionForm = ({ userId }) => {
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsCapturing(true);

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description) {
      setFormError("A description is required.");
      return;
    }
    if (!rating) {
      setFormError("Please select either Stash or Trash.");
      return;
    }
    if (!db || !storage) {
        setFormError("Firebase services not available.");
        return;
    }
    setFormError("");
    setIsUploading(true);
    let mediaUrl = null;

    try {
      if (mediaFile) {
        const storageRef = ref(storage, `stash-or-trash/${userId}/${Date.now()}-${mediaFile.name}`);
        const uploadTask = await uploadBytes(storageRef, mediaFile);
        mediaUrl = await getDownloadURL(uploadTask.ref);
        console.log("Media uploaded successfully:", mediaUrl);
      }

      const submissionCollectionRef = collection(db, "artifacts", appId, "public", "data", "submissions");
      await addDoc(submissionCollectionRef, {
        userId: userId,
        description: description,
        rating: rating,
        mediaUrl: mediaUrl,
        timestamp: new Date(),
      });

      console.log("Submission successful!");
      setDescription("");
      setRating(null);
      setMediaFile(null);
    } catch (error) {
      console.error("Error submitting item:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-xl">
        <CardContent>
          <h2 className="text-2xl font-bold mb-4">Stash or Trash</h2>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <textarea
              className="flex w-full min-h-[100px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe what you want to stash or trash..."
              value={description}
              onChange={handleDescriptionChange}
            />
            {formError && (
              <p className="text-red-500 text-sm mt-1">{formError}</p>
            )}

            <div className="flex justify-between items-center space-x-2">
              <Button
                type="button"
                onClick={() => setRating("Stash")}
                className={`flex-1 ${rating === "Stash" ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
              >
                💰
              </Button>
              <Button
                type="button"
                onClick={() => setRating("Trash")}
                className={`flex-1 ${rating === "Trash" ? "bg-red-500 hover:bg-red-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
              >
                🚮
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
                <Button type="button" onClick={isCapturing ? stopCapture : startCapture}>
                  {isCapturing ? "Stop Capture" : "Capture from Camera"}
                </Button>
              </div>
              {isCapturing && (
                <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-md" />
              )}
              {mediaFile && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected file: {mediaFile.name}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isUploading || !rating || !description}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isUploading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const ProfilePage = ({ user }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 rounded-lg shadow-md">
      <Card className="w-full max-w-xl">
        <CardContent>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Profile Page</h2>
          <p className="text-lg text-gray-600 text-center max-w-lg">View and manage your user profile and settings here.</p>
          {user && (
            <div className="mt-6 p-6 bg-white rounded-lg shadow-md w-full max-w-md border-t-4 border-gray-800">
              <h3 className="text-xl font-bold mb-2 text-gray-800">User Details:</h3>
              <p className="text-sm text-gray-700"><strong>User ID:</strong> <span className="font-mono break-all">{user.uid}</span></p>
              <p className="text-sm text-gray-700"><strong>Email:</strong> {user.email || 'N/A'}</p>
              <p className="text-sm text-gray-700"><strong>Is Anonymous:</strong> {user.isAnonymous ? 'Yes' : 'No'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("form");
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (auth) {
      const unsubscribe = auth.onAuthStateChanged(currentUser => {
        setUser(currentUser);
        setAuthReady(true);
      });
      initializeFirebaseCanvasAuth();
      return () => unsubscribe();
    }
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
            onClick={() => setCurrentPage("form")}
            className={`${currentPage === "form" ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-600 hover:bg-gray-700 text-gray-300"}`}
          >
            Submit
          </Button>
          <Button
            onClick={() => setCurrentPage("profile")}
            className={`${currentPage === "profile" ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-600 hover:bg-gray-700 text-gray-300"}`}
          >
            Profile
          </Button>
        </div>
      </div>
      {currentPage === "form" ? <SubmissionForm userId={user?.uid} /> : <ProfilePage user={user} />}
    </div>
  );
};

export default App;
