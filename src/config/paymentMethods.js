// Premium Payment Methods by Region
// Stripe integration + Regional wallets + Vouchers

export const paymentMethods = {
  // Global
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    type: 'gateway',
    icon: '💳',
    regions: ['global'],
    methods: ['card', 'bank_transfer'],
  },
  
  paypal: {
    id: 'paypal',
    name: 'PayPal',
    type: 'wallet',
    icon: '🅿️',
    regions: ['global'],
    methods: ['wallet', 'card'],
  },
  
  // Africa - South Africa
  sa_eft: {
    id: 'sa_eft',
    name: 'EFT (SA)',
    type: 'bank_transfer',
    icon: '🏦',
    regions: ['ZA'],
    currency: 'ZAR',
  },
  
  sa_instanteft: {
    id: 'sa_instanteft',
    name: 'Instant EFT (SA)',
    type: 'bank_transfer',
    icon: '⚡',
    regions: ['ZA'],
    currency: 'ZAR',
  },
  
  // Africa - Mobile Money
  mpesa: {
    id: 'mpesa',
    name: 'M-Pesa',
    type: 'mobile_money',
    icon: '📱',
    regions: ['KE', 'TZ', 'UG'],
    currency: 'KES',
  },
  
  mtn_money: {
    id: 'mtn_money',
    name: 'MTN Mobile Money',
    type: 'mobile_money',
    icon: '📱',
    regions: ['GH', 'NG', 'CM', 'RW', 'BF'],
  },
  
  airtel_money: {
    id: 'airtel_money',
    name: 'Airtel Money',
    type: 'mobile_money',
    icon: '📱',
    regions: ['ZA', 'UG', 'KE', 'TZ'],
  },
  
  vodacom_mpesa: {
    id: 'vodacom_mpesa',
    name: 'Vodacom M-Pesa',
    type: 'mobile_money',
    icon: '📱',
    regions: ['ZA', 'TZ'],
  },
  
  // Asia
  alipay: {
    id: 'alipay',
    name: 'Alipay',
    type: 'wallet',
    icon: '💰',
    regions: ['CN'],
    currency: 'CNY',
  },
  
  wechat_pay: {
    id: 'wechat_pay',
    name: 'WeChat Pay',
    type: 'wallet',
    icon: '💬',
    regions: ['CN'],
    currency: 'CNY',
  },
  
  gcash: {
    id: 'gcash',
    name: 'GCash',
    type: 'mobile_money',
    icon: '📱',
    regions: ['PH'],
    currency: 'PHP',
  },
  
  // Gaming Vouchers & Gift Cards
  gift_card: {
    id: 'gift_card',
    name: 'Gift Card',
    type: 'voucher',
    icon: '🎁',
    regions: ['global'],
    description: 'Stash or Trash Gift Card',
  },
  
  // Crypto (Optional)
  crypto: {
    id: 'crypto',
    name: 'Cryptocurrency',
    type: 'crypto',
    icon: '₿',
    regions: ['global'],
    methods: ['bitcoin', 'ethereum', 'usdc'],
  },
};

// Regional payment method mapping
export const paymentByRegion = {
  ZA: ['stripe', 'paypal', 'sa_eft', 'sa_instanteft', 'airtel_money', 'vodacom_mpesa', 'gift_card'],
  US: ['stripe', 'paypal', 'gift_card', 'crypto'],
  GB: ['stripe', 'paypal', 'gift_card'],
  DE: ['stripe', 'paypal', 'gift_card'],
  NL: ['stripe', 'paypal', 'gift_card'],
  FR: ['stripe', 'paypal', 'gift_card'],
  KE: ['mpesa', 'stripe', 'paypal', 'gift_card'],
  NG: ['mtn_money', 'stripe', 'paypal', 'gift_card'],
  CN: ['alipay', 'wechat_pay'],
  PH: ['gcash', 'stripe', 'paypal', 'gift_card'],
};

export default paymentMethods;
