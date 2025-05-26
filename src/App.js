import React, { useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

function App() {
  useEffect(() => {
    const testFirestore = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "test"));
        querySnapshot.forEach((doc) => {
          console.log(`${doc.id} =>`, doc.data());
        });
        alert("✅ Firebase Firestore is working!");
      } catch (error) {
        console.error("❌ Firebase Firestore error:", error);
        alert("❌ Firebase Firestore connection failed!");
      }
    };

    testFirestore();
  }, []);

  return (
    <div>
      <h1>🔥 Stash or Trash??? Firebase Test</h1>
      <p>Check the alert message and browser console.</p>
    </div>
  );
}

export default App;
