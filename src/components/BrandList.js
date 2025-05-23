// ✅ PHASE 1: Categorized + User-Suggested Brands (Stash or Trash???)

// === FILE: src/components/CountrySelector.js ===
import React from "react";

const countries = {
  US: "United States",
  ZA: "South Africa",
  GB: "United Kingdom",
  NG: "Nigeria",
  IN: "India",
  CN: "China",
  BR: "Brazil",
  FR: "France"
};

export default function CountrySelector({ selectedCountry, onChange }) {
  return (
    <select value={selectedCountry} onChange={(e) => onChange(e.target.value)}>
      {Object.entries(countries).map(([code, name]) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  );
}

// === FILE: src/components/BrandList.js ===
import React, { useState } from "react";

const categorizedBrands = {
  ZA: {
    Supermarkets: ["Shoprite", "Pick n Pay", "Spar"],
    Banks: ["Capitec", "FNB", "ABSA"],
    Telecoms: ["MTN", "Vodacom", "Cell C"]
  },
  US: {
    Tech: ["Apple", "Microsoft", "Google"],
    Retail: ["Walmart", "Target", "Amazon"],
    Food: ["Coca-Cola", "Pepsi", "McDonald's"]
  }
  // Extend for more countries
};

export default function BrandList({ selectedCountry }) {
  const [suggestedBrand, setSuggestedBrand] = useState("");
  const [category, setCategory] = useState("");

  const brandsByCategory = categorizedBrands[selectedCountry] || {};

  const handleSuggestionSubmit = () => {
    if (!suggestedBrand || !category) return alert("Fill both fields");
    alert(
      `Suggested brand: ${suggestedBrand} under category: ${category} for ${selectedCountry}`
    );
    setSuggestedBrand("");
    setCategory("");
    // 🔁 Later: send this suggestion to Firestore
  };

  return (
    <div>
      <h2>Brands in {selectedCountry}</h2>
      {Object.entries(brandsByCategory).map(([cat, brands]) => (
        <div key={cat}>
          <h3>{cat}</h3>
          <ul>
            {brands.map((brand) => (
              <li key={brand}>{brand}</li>
            ))}
          </ul>
        </div>
      ))}

      <div>
        <h3>Suggest a Missing Brand</h3>
        <input
          placeholder="Brand name"
          value={suggestedBrand}
          onChange={(e) => setSuggestedBrand(e.target.value)}
        />
        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <button onClick={handleSuggestionSubmit}>Submit</button>
      </div>
    </div>
  );
}

// === FILE: src/App.js ===
import React, { useState } from "react";
import CountrySelector from "./components/CountrySelector";
import BrandList from "./components/BrandList";

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState("ZA");

  return (
    <div>
      <h1>Stash or Trash???</h1>
      <CountrySelector
        selectedCountry={selectedCountry}
        onChange={setSelectedCountry}
      />
      <BrandList selectedCountry={selectedCountry} />
    </div>
  );
}

// === FILE: src/index.js ===
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// === FILE: public/index.html ===
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stash or Trash</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>

// === FILE: .gitignore ===
node_modules/
.env
build/
.DS_Store

// === FILE: package.json ===
{
  "name": "stash-or-trash",
  "version": "1.0.0",
  "description": "Stash or Trash - Product & Brand Feedback WebApp",
  "main": "src/index.js",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "keywords": [],
  "author": "King Rooftop",
  "license": "ISC"
}
