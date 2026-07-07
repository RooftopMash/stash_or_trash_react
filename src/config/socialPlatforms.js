// Social Media Platforms for User Verification
// Authenticity is the user's currency

export const socialPlatforms = {
  google: {
    id: 'google',
    name: 'Google / Gmail',
    icon: '🔍',
    color: '#4285F4',
    trustScore: 95,
    verified: true,
    description: 'Verify with Google Account',
    oauth: true,
  },
  
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    icon: '👥',
    color: '#1877F2',
    trustScore: 90,
    verified: true,
    description: 'Verify with Facebook Profile',
    oauth: true,
  },
  
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    color: '#E4405F',
    trustScore: 85,
    verified: true,
    description: 'Verify with Instagram Account',
    oauth: true,
  },
  
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: '#0A66C2',
    trustScore: 92,
    verified: true,
    description: 'Verify with LinkedIn Profile',
    oauth: true,
  },
  
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: '#000000',
    trustScore: 80,
    verified: true,
    description: 'Verify with TikTok Account',
    oauth: true,
  },
  
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    color: '#FF0000',
    trustScore: 88,
    verified: true,
    description: 'Verify with YouTube Channel',
    oauth: true,
  },
  
  twitter: {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: '𝕏',
    color: '#000000',
    trustScore: 87,
    verified: true,
    description: 'Verify with X Account',
    oauth: true,
  },
  
  apple: {
    id: 'apple',
    name: 'Apple ID',
    icon: '🍎',
    color: '#000000',
    trustScore: 93,
    verified: true,
    description: 'Verify with Apple ID',
    oauth: true,
  },
};

// Minimum platforms required for verification
export const minVerificationPlatforms = 1; // Must verify at least 1
export const recommendedVerificationPlatforms = 2; // 2+ recommended for higher trust

// Trust score calculation
export const getTrustScore = (verifiedPlatforms) => {
  if (!verifiedPlatforms || verifiedPlatforms.length === 0) return 0;
  const totalScore = verifiedPlatforms.reduce((sum, platform) => sum + socialPlatforms[platform].trustScore, 0);
  return Math.round(totalScore / verifiedPlatforms.length);
};

export default socialPlatforms;
