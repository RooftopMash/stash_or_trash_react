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
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Set debug logging for Firebase
setLogLevel('debug');

// 1. Use try/catch blocks to safely access environment variables
let firebaseConfig = {};
let initialAuthToken = null;
let appId = "default-app-id";

try {
  firebaseConfig = JSON.parse(__firebase_config);
} catch (e) {
  console.error("Firebase config not available.", e);
}

try {
  initialAuthToken = __initial_auth_token;
} catch (e) {
  console.error("Auth token not available.", e);
}

try {
  appId = __app_id;
} catch (e) {
  console.error("App ID not available.", e);
}

// 2. Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Mocked UI components with Tailwind CSS for single file
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

const SubmissionForm = ({ user }) => {
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
      setFormError("A description is required.");
      return;
    }
    if (!rating) {
      setFormError("Please select either Stash or Trash.");
      return;
    }
    if (!db || !storage) {
      setFormError("Firebase services not available. Cannot submit.");
      return;
    }
    setFormError("");
    setIsUploading(true);
    let mediaUrl = null;

    try {
      if (mediaFile) {
        const fileName = mediaFile.name || `media_${Date.now()}.webm`;
        const storageRef = ref(storage, `stash-or-trash/${user?.uid}/${fileName}`);
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
        userId: user?.uid,
        description: description,
        rating: rating,
        mediaUrl: mediaUrl,
        timestamp: serverTimestamp(),
      });

      console.log("Submission successful!");
      setDescription("");
      setRating(null);
      setMediaFile(null);
    } catch (error) {
      console.error("Error submitting item:", error);
      setFormError("Error submitting item. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-xl">
        <CardContent>
          <h2 className="text-2xl font-bold mb-4">Stash Or Trash?</h2>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <textarea
              className="flex w-full min-h-[100px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe your item to stash or trash..."
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
                className={`flex-1 text-4xl ${rating === "Stash"
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
              >
                <span role="img" aria-label="stash">
                  💰
                </span>
              </Button>
              <Button
                type="button"
                onClick={() => setRating("Trash")}
                className={`flex-1 text-4xl ${rating === "Trash"
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
              >
                <span role="img" aria-label="trash">
                  🚮
                </span>
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
                  {isCapturing ? "Stop Capture" : "Camera"}
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

const StashOrTrashList = ({ authReady }) => {
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
        }));
        allItems.sort((a, b) => (b.timestamp?.toDate()?.getTime() || 0) - (a.timestamp?.toDate()?.getTime() || 0));
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
        <div className="text-xl font-bold text-gray-800">Loading items...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start p-4 mt-8">
      {items.length === 0 ? (
        <div className="p-4 bg-white rounded-lg shadow-md">
          <p className="text-lg text-gray-600">
            No items have been submitted yet. Be the first!
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
                    {item.rating === "Stash" ? "Stash 💰" : "Trash 🚮"}
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
                  <p>User ID:</p>
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

const UserWall = ({ user, authReady }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !user || !authReady) {
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
        }));
        const userItems = allItems
          .filter(item => item.userId === user.uid)
          .sort((a, b) => (b.timestamp?.toDate()?.getTime() || 0) - (a.timestamp?.toDate()?.getTime() || 0));
        
        setItems(userItems);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching user's items:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authReady]);

  if (loading) {
    return (
      <div className="flex items-center justify-center my-8">
        <div className="text-xl font-bold text-gray-800">
          Loading your submissions...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start p-4 mt-8 w-full">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">My Submissions</h3>
      {items.length === 0 ? (
        <div className="p-4 bg-white rounded-lg shadow-md w-full max-w-xl text-center">
          <p className="text-lg text-gray-600">
            You haven't stashed or trashed anything yet!
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
                    {item.rating === "Stash" ? "Stash 💰" : "Trash 🚮"}
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
                    Share on LinkedIn
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      typeof window !== "undefined" ? window.location.href : ""
                    )}&quote=${encodeURIComponent(item.description)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 px-4 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium"
                  >
                    Share on Facebook
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

const HomePage = ({ user, authReady }) => {
  const [activeTab, setActiveTab] = useState("all");
  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-md p-4 sticky top-0 z-10">
        <nav className="flex justify-between items-center w-full max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">Stash or Trash</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setActiveTab("all")}
              className={`text-xl font-semibold ${
                activeTab === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-transparent text-gray-800 hover:bg-gray-200"
              }`}
            >
              <span role="img" aria-label="all submissions">🌍</span>
            </Button>
            <Button
              onClick={() => setActiveTab("my-wall")}
              className={`text-xl font-semibold ${
                activeTab === "my-wall"
                  ? "bg-blue-600 text-white"
                  : "bg-transparent text-gray-800 hover:bg-gray-200"
              }`}
            >
              <span role="img" aria-label="my submissions">👤</span>
            </Button>
          </div>
        </nav>
      </header>
      <main className="w-full max-w-7xl mx-auto p-4">
        {activeTab === "all" ? (
          <StashOrTrashList authReady={authReady} />
        ) : (
          <UserWall user={user} authReady={authReady} />
        )}
      </main>
      <footer className="bg-white shadow-inner p-6 mt-8">
        <SubmissionForm user={user} />
      </footer>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};
    if (db && auth) {
      const initializeAuth = async () => {
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
      initializeAuth().then(() => {
        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setAuthReady(true);
        });
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <div className="font-sans antialiased text-gray-900 bg-gray-100">
      <style>{`
        body { font-family: 'Inter', sans-serif; }
      `}</style>
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://unpkg.com/lucide-react@0.320.0"></script>
      {authReady && user ? (
        <HomePage
          user={user}
          authReady={authReady}
        />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="p-8 rounded-xl shadow-md bg-white">
            <p className="text-center text-lg font-semibold text-gray-800">
              Loading app...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
