import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function Brands({ user }) {
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "brands"));
        const brandsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBrands(brandsList);
      } catch (err) {
        console.error("❌ Firestore error while fetching brands:", err);
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
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
}
