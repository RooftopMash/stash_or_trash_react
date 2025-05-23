import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import AuthForm from './components/AuthForm';
import CountrySelector from './components/CountrySelector';
import BrandList from './components/BrandList';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  if (!user) {
    return <AuthForm onAuthSuccess={() => {}} />;
  }

  return (
    <div className="App">
      <header>
        <h1>Stash or Trash???</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <CountrySelector />
      <BrandList />
    </div>
  );
}

export default App;
