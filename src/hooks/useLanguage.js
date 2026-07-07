import { useState, useContext } from 'react';
import { LocalizationContext } from '../context/LocalizationContext';

const useLanguage = () => {
  const context = useContext(LocalizationContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within a LocalizationProvider');
  }
  
  return context;
};

export default useLanguage;
