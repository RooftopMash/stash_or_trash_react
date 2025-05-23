// src/components/SuggestBrandForm.js
import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function SuggestBrandForm({ selectedCountry }) {
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!brand.trim() || !category.trim()) {
      setMessage("Please fill in both fields.");
      return;
    }

    try {
      await addDoc(collection(db, "brandSuggestions"), {
        country: selectedCountry,
        brand,
        category,
        timestamp: serverTimestamp()
      });
      setBrand("");
      setCategory("");
      setMessage("Thank you! Suggestion submitted.");
    } catch (error) {
      console.error("Error adding suggestion:", error);
      setMessage("Failed to submit suggestion.");
    }
  };

  return (
    <div>
      <h3>Suggest a Brand We Missed</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Brand name"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category (e.g., Food, Bank, Clothing)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
