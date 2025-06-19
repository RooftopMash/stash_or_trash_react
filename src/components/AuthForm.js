import React, { useState } from 'react';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  OAuthProvider,
  signInWithCustomToken
} from 'firebase/auth';

const AuthForm = ({ onAuthSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetInfo, setResetInfo] = useState('');
  const [resetError, setResetError] = useState('');
  const [resent, setResent] = useState(false);

  // Listen for LinkedIn popup message
  React.useEffect(() => {
    const handler = async (event) => {
      // Only accept messages from your own frontend origin!
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.type === 'LINKEDIN_TOKEN' && event.data.token) {
        try {
          await signInWithCustomToken(auth, event.data.token);
          onAuthSuccess();
        } catch (err) {
          setError(err.message);
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
    // eslint-disable-next-line
  }, []);

  const toggleForm = () => {
    setIsSignup(!isSignup);
    setError('');
    setInfo('');
    setResent(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setResent(false);
    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          await sendEmailVerification(userCredential.user);
          setInfo('Account created! Please check your email for a verification link before logging in.');
        }
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user && !userCredential.user.emailVerified) {
          setError('Please verify your email before logging in. Check your inbox for a verification link.');
          setResent(false);
          await auth.signOut();
        } else {
          onAuthSuccess();
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetInfo('');
    setResetError('');
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetInfo('Password reset email sent! Check your inbox.');
    } catch (err) {
      setResetError(err.message);
    }
  };

  const handleResendVerification = async () => {
    setError('');
    setInfo('');
    setResent(false);
    try {
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await sendEmailVerification(auth.currentUser);
        setResent(true);
        setInfo('Verification email resent! Check your inbox.');
      } else {
        setError('Please log in first to resend verification.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // SOCIAL AUTH PROVIDERS
  const handleSocialAuth = async (providerName) => {
    setError('');
    setInfo('');
    try {
      let provider;
      switch (providerName) {
        case 'google':
          provider = new GoogleAuthProvider();
          break;
        case 'facebook':
          provider = new FacebookAuthProvider();
          break;
        case 'twitter':
          provider = new TwitterAuthProvider();
          break;
        case 'apple':
          provider = new OAuthProvider('apple.com');
          break;
        // The following will use custom OAuth (LinkedIn only, see below)
        default:
          setError('Provider not supported here.');
          return;
      }
      await signInWithPopup(auth, provider);
      onAuthSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLinkedInAuth = () => {
    setError('');
    setInfo('');
    const width = 600, height = 600;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    // IMPORTANT: Update the below URL to your backend endpoint in production!
    window.open(
      'http://localhost:4000/auth/linkedin',
      'LinkedIn Login',
      `width=${width},height=${height},top=${top},left=${left}`
    );
    // The popup will send a message back with type: 'LINKEDIN_TOKEN'
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
      {/* Social Logins */}
      <div style={{ margin: '1rem 0' }}>
        <p style={{ marginBottom: 8 }}>Or continue with:</p>
        <button onClick={() => handleSocialAuth('google')}>Google</button>{' '}
        <button onClick={() => handleSocialAuth('facebook')}>Facebook</button>{' '}
        <button onClick={() => handleSocialAuth('twitter')}>Twitter</button>{' '}
        <button onClick={handleLinkedInAuth}>LinkedIn</button>{' '}
        <button
          onClick={() => setError('Instagram login is via Facebook. Use the Facebook button.')}
        >Instagram</button>{' '}
        <button
          onClick={() => setError('TikTok login is not supported yet.')}
        >TikTok</button>{' '}
        <button onClick={() => handleSocialAuth('apple')}>Apple</button>
      </div>
      {/* Reset and resend links */}
      {!isSignup && (
        <>
          <p>
            <button
              type="button"
              onClick={() => setShowReset(!showReset)}
              style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Forgot password?
            </button>
          </p>
          <p>
            <button
              type="button"
              onClick={handleResendVerification}
              style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
              disabled={resent}
            >
              {resent ? 'Verification Email Sent!' : 'Resend Verification Email'}
            </button>
          </p>
        </>
      )}
      {showReset && (
        <form onSubmit={handleResetPassword}>
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          <button type="submit">Send Password Reset Email</button>
          {resetInfo && <p style={{ color: 'green' }}>{resetInfo}</p>}
          {resetError && <p style={{ color: 'red' }}>{resetError}</p>}
        </form>
      )}
      {/* Toggle login/signup */}
      <p>
        {isSignup ? 'Already have an account?' : 'New here?'}{' '}
        <button
          type="button"
          onClick={toggleForm}
          style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
        >
          {isSignup ? 'Login' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;
