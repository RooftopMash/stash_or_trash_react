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
