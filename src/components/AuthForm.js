import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

const AuthForm = ({ onAuthSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const toggleForm = () => {
    setIsSignup(!isSignup);
    setError('');
    setInfo('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    try {
      if (isSignup) {
        // Signup flow: create account and send verification email
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          await sendEmailVerification(userCredential.user);
          setInfo('Account created! Please check your email for a verification link before logging in.');
        }
      } else {
        // Login flow: only allow login if email is verified
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user && !userCredential.user.emailVerified) {
          setError('Please verify your email before logging in. Check your inbox for a verification link.');
          // Optionally, resend the verification email here if you want
          await auth.signOut();
        } else {
          onAuthSuccess(); // Tell App we're logged in
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-form">
      <h2>{isSignup ? 'Create Account' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {info && <p style={{ color: 'green' }}>{info}</p>}
        <button type="submit">{isSignup ? 'Sign Up' : 'Login'}</button>
      </form>
      <p>
        {isSignup ? 'Already have an account?' : 'New here?'}{' '}
        <button type="button" onClick={toggleForm} style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>
          {isSignup ? 'Login' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;
