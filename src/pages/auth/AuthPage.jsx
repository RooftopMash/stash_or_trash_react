import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, signInWithFacebook, signUpWithEmail, signInWithEmail } from '../../services/authService';
import socialPlatforms from '../../config/socialPlatforms';
import colors from '../../config/colors';
import Loading from '../../components/Loading';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  });

  const handleSocialLogin = async (platform) => {
    setLoading(true);
    setError(null);
    try {
      if (platform === 'google') {
        await signInWithGoogle();
      } else if (platform === 'facebook') {
        await signInWithFacebook();
      }
      navigate('/dashboard/user');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmail(formData.email, formData.password);
      } else {
        if (!formData.displayName) {
          throw new Error('Please enter your name');
        }
        await signUpWithEmail(formData.email, formData.password, formData.displayName);
      }
      navigate('/dashboard/user');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div style={{ background: colors.neutral.black, minHeight: '100vh' }} className="flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: colors.gold.primary }}>Stash or Trash</h1>
          <p style={{ color: colors.neutral.gray400 }}>Silicon Valley Surpassing</p>
        </div>

        {/* Social Auth */}
        <div className="mb-8">
          <h2 className="text-center mb-4" style={{ color: colors.neutral.white }}>Verify Your Identity</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialLogin('google')}
              className="p-3 rounded-lg font-bold transition transform hover:scale-105"
              style={{
                background: colors.neutral.gray600,
                color: colors.neutral.white,
                border: `2px solid ${colors.gold.primary}`,
              }}
            >
              {socialPlatforms.google.icon} Google
            </button>
            <button
              onClick={() => handleSocialLogin('facebook')}
              className="p-3 rounded-lg font-bold transition transform hover:scale-105"
              style={{
                background: colors.neutral.gray600,
                color: colors.neutral.white,
                border: `2px solid ${colors.gold.primary}`,
              }}
            >
              {socialPlatforms.facebook.icon} Facebook
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center mb-6">
          <div className="flex-1" style={{ borderTop: `1px solid ${colors.gold.primary}` }}></div>
          <span style={{ color: colors.neutral.gray400, margin: '0 1rem' }}>OR</span>
          <div className="flex-1" style={{ borderTop: `1px solid ${colors.gold.primary}` }}></div>
        </div>

        {/* Email Auth */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full p-3 rounded-lg"
              style={{ background: colors.neutral.gray600, color: colors.neutral.white }}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-3 rounded-lg"
            style={{ background: colors.neutral.gray600, color: colors.neutral.white }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full p-3 rounded-lg"
            style={{ background: colors.neutral.gray600, color: colors.neutral.white }}
            required
          />

          {error && (
            <p style={{ color: colors.accent.red }} className="text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full p-3 rounded-lg font-bold text-lg transition"
            style={{
              background: `linear-gradient(135deg, ${colors.gold.primary} 0%, ${colors.accent.red} 100%)`,
              color: colors.neutral.black,
            }}
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Auth Mode */}
        <p className="text-center mt-6" style={{ color: colors.neutral.gray400 }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: colors.gold.primary }}
            className="font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
