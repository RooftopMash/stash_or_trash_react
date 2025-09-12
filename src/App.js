import React, { useEffect, useState, useRef } from "react";
import { initializeApp, setLogLevel } from "firebase/app";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, setDoc, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Global Firebase variables provided by the environment
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const appId = rawAppId.match(/^c_[a-z0-9]+/)?.[0] || 'default-app-id';

// Mocking shadcn/ui components with Tailwind CSS for a professional look.
const Card = ({ children, className }) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}>
    {children}
  </div>
);
const CardContent = ({ children }) => <div className="p-6">{children}</div>;
const Button = ({ children, onClick, className, disabled }) => (
  <button
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
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

// Navbar Component
const Navbar = ({ user, setPage }) => {
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setPage('login');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md p-4 flex justify-between items-center rounded-lg">
      <h1 className="text-xl font-bold">Stash or Trash</h1>
      <div className="space-x-4">
        <button onClick={() => setPage('brands')} className="text-white hover:text-blue-200 font-semibold transition-colors duration-200">Brands</button>
        {user ? (
          <>
            <button onClick={() => setPage('profile')} className="text-white hover:text-blue-200 font-semibold transition-colors duration-200">Profile</button>
            <button onClick={handleLogout} className="text-white hover:text-red-300 font-semibold transition-colors duration-200">Logout</button>
          </>
        ) : (
          <button onClick={() => setPage('login')} className="text-white hover:text-blue-200 font-semibold transition-colors duration-200">Login</button>
        )}
      </div>
    </nav>
  );
};

// AuthForm Component
const AuthForm = ({ setPage, signup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (signup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">{signup ? 'Sign Up' : 'Login'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200" 
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-gray-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200">
            {signup ? 'Sign Up' : 'Login'}
          </button>
        </form>
        {error && <p className="text-red-500 text-center mt-4 text-sm">{error}</p>}
        <div className="mt-4 text-center">
          {signup ? (
            <p className="text-sm text-gray-600">Already have an account? <span onClick={() => setPage('login')} className="text-gray-800 font-semibold cursor-pointer hover:underline">Log in</span></p>
          ) : (
            <p className="text-sm text-gray-600">Don't have an account? <span onClick={() => setPage('signup')} className="text-gray-800 font-semibold cursor-pointer hover:underline">Sign up</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

// Brands Component
const Brands = ({ user }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <h2 className="text-4xl font-bold text-gray-800 mb-4">Brands Page</h2>
    <p className="text-lg text-gray-600 text-center max-w-lg">Welcome to the Brands page! Here you can explore different brands and their sustainability profiles.</p>
    {user && <p className="mt-4 text-sm text-gray-500">Logged in as user: <span className="font-mono text-gray-700 break-all">{user.uid}</span></p>}
  </div>
);

// ProfilePage Component
const ProfilePage = ({ user }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <h2 className="text-4xl font-bold text-gray-800 mb-4">Profile Page</h2>
    <p className="text-lg text-gray-600 text-center max-w-lg">View and manage your user profile and settings here.</p>
    {user && (
      <div className="mt-6 p-6 bg-white rounded-lg shadow-md w-full max-w-md">
        <h3 className="text-xl font-bold mb-2">User Details:</h3>
        <p className="text-sm text-gray-700"><strong>User ID:</strong> <span className="font-mono break-all">{user.uid}</span></p>
        <p className="text-sm text-gray-700"><strong>Email:</strong> {user.email || 'N/A'}</p>
        <p className="text-sm text-gray-700"><strong>Is Anonymous:</strong> {user.isAnonymous ? 'Yes' : 'No'}</p>
      </div>
    )}
  </div>
);

// FeedbackForm Component
const FeedbackForm = ({ userId }) => {
  const db = getFirestore();
  const storage = getStorage();
  const [feedback, setFeedback] = useState("");
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
  
  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
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
    if (!feedback) {
      setFormError("Feedback is required.");
      return;
    }
    if (!rating) {
      setFormError("Please select either Stash or Trash.");
      return;
    }
    setFormError("");
    setIsUploading(true);
    let mediaUrl = null;

    try {
      if (mediaFile) {
        const storageRef = ref(storage, `feedback-media/${userId}/${Date.now()}-${mediaFile.name}`);
        const uploadTask = await uploadBytes(storageRef, mediaFile);
        mediaUrl = await getDownloadURL(uploadTask.ref);
        console.log("Media uploaded successfully:", mediaUrl);
      }

      const feedbackCollectionRef = collection(db, "artifacts", appId, "public", "data", "feedback");
      await addDoc(feedbackCollectionRef, {
        userId: userId,
        feedback: feedback,
        rating: rating,
        mediaUrl: mediaUrl,
        timestamp: new Date(),
      });

      console.log("Feedback submitted successfully!");
      setFeedback("");
      setRating(null);
      setMediaFile(null);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 rounded-lg shadow-md">
      <Card className="w-full max-w-xl">
        <CardContent>
          <h2 className="text-2xl font-bold mb-4">Submit Your Feedback</h2>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <textarea
              className="flex w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="What is your feedback? (Compliment or Complaint)"
              value={feedback}
              onChange={handleFeedbackChange}
            />
            {formError && (
              <p className="text-red-500 text-sm mt-1">{formError}</p>
            )}
            <div className="flex justify-between items-center space-x-2">
              <Button
                type="button"
                onClick={() => setRating("Stash")}
                className={`flex-1 ${rating === "Stash" ? "bg-green-500 hover:bg-green-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
              >
                Stash 💰
              </Button>
              <Button
                type="button"
                onClick={() => setRating("Trash")}
                className={`flex-1 ${rating === "Trash" ? "bg-red-500 hover:bg-red-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
              >
                Trash 🚮
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
              disabled={isUploading || !rating || !feedback}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isUploading ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Fallback UI for any unmatched routes
const NotFound = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <h2 className="text-3xl font-bold text-gray-800">Page Not Found</h2>
  </div>
);

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentPage, setCurrentPage] = useState('loading');
  
  useEffect(() => {
    let auth;
    let unsubscribeAuth;

    try {
      const app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      setLogLevel('debug');

      if (initialAuthToken) {
        signInWithCustomToken(auth, initialAuthToken);
      } else {
        signInAnonymously(auth);
      }
      
      unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setCheckingAuth(false);
        setCurrentPage(user ? 'brands' : 'login');
      });

    } catch (e) {
      console.error("Firebase initialization failed:", e);
      setCheckingAuth(false);
    }
    
    return () => {
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
    };
  }, []);

  const renderPage = () => {
    if (checkingAuth) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 rounded-lg shadow-md">
          <p className="text-lg font-semibold text-gray-700 mb-2">Checking authentication...</p>
        </div>
      );
    }
    
    switch (currentPage) {
      case 'brands':
        return <Brands user={user} />;
      case 'feedback':
        return user ? <FeedbackForm userId={user.uid} /> : <AuthForm setPage={setCurrentPage} />;
      case 'profile':
        return user ? <ProfilePage user={user} /> : <AuthForm setPage={setCurrentPage} />;
      case 'login':
        return user ? <Brands user={user} /> : <AuthForm setPage={setCurrentPage} />;
      case 'signup':
        return <AuthForm setPage={setCurrentPage} signup />;
      default:
        return <NotFound />;
    }
  };

  return (
    <div>
      <Navbar user={user} setPage={setCurrentPage} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
