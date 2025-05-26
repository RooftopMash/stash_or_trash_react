import React, { useEffect, useState } from "react";
import { db } from "./firebase"; // your Firestore instance
import { collection, getDocs } from "firebase/firestore";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

function App() {
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState(null);

  // Fetch brands on mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "brands"));
        const brandsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBrands(brandsList);
      } catch (err) {
        // For developers
        console.error("❌ Firestore error while fetching brands:", err);

        // For users
        setError("Failed to load brands. Please check your connection or contact support.");
      }
    };

    fetchBrands();
  }, []);

  return (
    <div>
      <h1>StashOrTrash Brands</h1>
      <ul>
        {brands.map(brand => (
          <li key={brand.id}>{brand.name}</li>
        ))}
      </ul>

      {/* Error Snackbar for users */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
