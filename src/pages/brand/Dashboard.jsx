import React from 'react';
import colors from '../../config/colors';
import useAuth from '../../hooks/useAuth';

const BrandDashboard = () => {
  const { user, profile } = useAuth();

  return (
    <div style={{ background: colors.neutral.black, minHeight: '100vh' }}>
      {/* Header */}
      <header className="border-b p-6" style={{ borderColor: colors.accent.red }}>
        <h1 style={{ color: colors.accent.red }} className="text-3xl font-bold">
          Brand Dashboard
        </h1>
        <p style={{ color: colors.neutral.gray400 }}>{user?.displayName}</p>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <p style={{ color: colors.neutral.gray300 }}>Brand Dashboard - Coming Soon</p>
      </main>
    </div>
  );
};

export default BrandDashboard;
