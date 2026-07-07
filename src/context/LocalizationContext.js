import React, { createContext, useState, useEffect } from 'react';
import { initialLanguages } from '../config/languages';

export const LocalizationContext = createContext();

export const LocalizationProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Check localStorage
    const saved = localStorage.getItem('language');
    if (saved) return saved;
    
    // Default to English UK
    return 'en-GB';
  });
  
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('currency');
    return saved || 'USD';
  });
  
  const [region, setRegion] = useState(() => {
    const saved = localStorage.getItem('region');
    return saved || 'ZA'; // Default to South Africa (primary market)
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('region', region);
  }, [region]);

  const value = {
    language,
    setLanguage,
    currency,
    setCurrency,
    region,
    setRegion,
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export default LocalizationContext;
