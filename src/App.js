import React, { useState } from "react";
import CountrySelector from "./components/CountrySelector";
import BrandList from "./components/BrandList";

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState("ZA");

  return (
    <div>
      <h1>Stash or Trash???</h1>
      <CountrySelector selectedCountry={selectedCountry} onChange={setSelectedCountry} />
      <BrandList selectedCountry={selectedCountry} />
    </div>
  );
}
