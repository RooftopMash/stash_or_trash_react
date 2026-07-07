import React from 'react';
import colors from '../config/colors';

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: colors.neutral.black }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4" style={{
          borderColor: colors.gold.primary,
          borderTopColor: colors.accent.red,
          margin: '0 auto 1rem',
        }}></div>
        <p className="text-xl font-bold" style={{ color: colors.gold.primary }}>
          Silicon Valley Surpassing
        </p>
        <p style={{ color: colors.neutral.gray400 }}>Loading the revolution...</p>
      </div>
    </div>
  );
};

export default Loading;
