import React from 'react';
import colors from '../../config/colors';
import useAuth from '../../hooks/useAuth';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div style={{ background: colors.neutral.black, minHeight: '100vh' }}>
      {/* Header */}
      <header className="border-b p-6" style={{ borderColor: colors.silver.primary }}>
        <h1 style={{ color: colors.silver.primary }} className="text-3xl font-bold">
          Admin Dashboard
        </h1>
        <p style={{ color: colors.neutral.gray400 }}>Administrator: {user?.displayName}</p>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <p style={{ color: colors.neutral.gray300 }}>Admin Dashboard - Coming Soon</p>
      </main>
    </div>
  );
};

export default AdminDashboard;
