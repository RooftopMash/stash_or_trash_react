import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import colors from '../config/colors';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{ background: colors.neutral.black, minHeight: '100vh' }} className="text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 border-b" style={{ borderColor: colors.gold.primary }}>
        <div className="text-2xl font-bold" style={{ color: colors.gold.primary }}>Stash or Trash</div>
        <button
          onClick={() => navigate(user ? '/dashboard/user' : '/auth')}
          className="px-6 py-2 rounded-lg font-bold transition"
          style={{
            background: `linear-gradient(135deg, ${colors.gold.primary} 0%, ${colors.accent.red} 100%)`,
            color: colors.neutral.black,
          }}
        >
          {user ? 'Dashboard' : 'Get Started'}
        </button>
      </nav>

      {/* Hero */}
      <section className="py-24 px-6 text-center">
        <h1 className="text-6xl font-bold mb-6" style={{ color: colors.gold.primary }}>
          Silicon Valley Surpassing
        </h1>
        <p className="text-2xl mb-8" style={{ color: colors.neutral.gray400 }}>
          Where brands meet authenticity.
        </p>
        <p className="text-lg max-w-2xl mx-auto mb-12" style={{ color: colors.neutral.gray300 }}>
          Stash or Trash is a globally localized platform where real users rate real brands. 
          No fake reviews. No gaming. Just authenticity.
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="px-8 py-3 rounded-lg font-bold text-lg transition transform hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${colors.accent.red} 0%, ${colors.gold.primary} 100%)`,
            color: colors.neutral.black,
          }}
        >
          Join the Revolution
        </button>
      </section>

      {/* Features */}
      <section className="py-16 px-6 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="p-8 rounded-xl border-2" style={{ borderColor: colors.gold.primary }}>
          <div className="text-4xl mb-4">💎</div>
          <h3 className="text-xl font-bold mb-3" style={{ color: colors.gold.primary }}>Authenticity First</h3>
          <p style={{ color: colors.neutral.gray400 }}>Verify with your social profile. Your reputation is your currency.</p>
        </div>
        <div className="p-8 rounded-xl border-2" style={{ borderColor: colors.accent.red }}>
          <div className="text-4xl mb-4">🌍</div>
          <h3 className="text-xl font-bold mb-3" style={{ color: colors.accent.red }}>Globally Localized</h3>
          <p style={{ color: colors.neutral.gray400 }}>50+ languages. Local payment methods. Feel at home everywhere.</p>
        </div>
        <div className="p-8 rounded-xl border-2" style={{ borderColor: colors.silver.primary }}>
          <div className="text-4xl mb-4">🤝</div>
          <h3 className="text-xl font-bold mb-3" style={{ color: colors.silver.primary }}>Real Connection</h3>
          <p style={{ color: colors.neutral.gray400 }}>Brands listen. Users matter. Direct dialogue. True innovation.</p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
