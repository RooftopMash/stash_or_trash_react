// src/components/AdminPanel.js
import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function AdminPanel() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const querySnapshot = await getDocs(collection(db, "brandSuggestions"));
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSuggestions(data);
      setLoading(false);
    };
    fetchSuggestions();
  }, []);

  const approveSuggestion = async (suggestion) => {
    const approvedRef = doc(db, "approvedBrands", suggestion.id);
    await setDoc(approvedRef, suggestion);
    await deleteDoc(doc(db, "brandSuggestions", suggestion.id));
    setSuggestions(suggestions.filter((s) => s.id !== suggestion.id));
  };

  const deleteSuggestion = async (id) => {
    await deleteDoc(doc(db, "brandSuggestions", id));
    setSuggestions(suggestions.filter((s) => s.id !== id));
  };

  if (loading) return <p>Loading suggestions...</p>;

  return (
    <div>
      <h2>Admin Panel - Approve Brand Suggestions</h2>
      {suggestions.length === 0 ? (
        <p>No pending suggestions.</p>
      ) : (
        <ul>
          {suggestions.map((s) => (
            <li key={s.id}>
              <strong>{s.brand}</strong> ({s.category}) - {s.country}
              <button onClick={() => approveSuggestion(s)}>Approve</button>
              <button onClick={() => deleteSuggestion(s.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
