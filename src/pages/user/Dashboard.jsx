import React from 'react';
import colors from '../../config/colors';
import useAuth from '../../hooks/useAuth';

const UserDashboard = () => {
  const { user, profile, trustScore } = useAuth();

  return (
    <div style={{ background: colors.neutral.black, minHeight: '100vh' }}>
      {/* Header */}
      <header className="border-b p-6" style={{ borderColor: colors.gold.primary }}>
        <h1 style={{ color: colors.gold.primary }} className="text-3xl font-bold">
          Welcome, {user?.displayName}
        </h1>
        <p style={{ color: colors.neutral.gray400 }}>Trust Score: {trustScore}/100</p>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <p style={{ color: colors.neutral.gray300 }}>User Dashboard - Coming Soon</p>
      </main>
    </div>
  );
};

export default UserDashboard;
