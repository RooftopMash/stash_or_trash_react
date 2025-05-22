import React from "react";

const allBrands = {
  US: ["Walmart", "Apple", "Coca-Cola"],
  ZA: ["Shoprite", "Pick n Pay", "Capitec"],
  GB: ["Tesco", "HSBC", "BBC"],
  NG: ["Jumia", "GTBank", "Dangote"],
  IN: ["Reliance", "Tata", "Paytm"],
  CN: ["Alibaba", "Huawei", "Tencent"],
  BR: ["Petrobras", "Itaú", "Havaianas"],
  FR: ["Carrefour", "L'Oréal", "Air France"]
};

export default function BrandList({ selectedCountry }) {
  const brands = allBrands[selectedCountry] || [];

  return (
    <div>
      <h2>Brands in {selectedCountry}</h2>
      <ul>
        {brands.map((brand) => (
          <li key={brand}>{brand}</li>
        ))}
      </ul>
    </div>
  );
}
