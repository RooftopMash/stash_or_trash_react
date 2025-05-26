const fs = require('fs');
const path = require('path');

// Add all your language codes here
const codes = [
  "en", "ps", "sv", "sq", "ar", "sm", "ca", "pt", "hy", "nl", "de", "az", "bn", "be", "es", "fr", "dz",
  "bs", "tn", "no", "ms", "bg", "rn", "km", "zh", "rar", "hr", "el", "cs", "da", "aa", "ti", "et", "am",
  "fo", "fj", "fi", "wo", "ka", "ak", "kl", "ch", "gu", "ht", "is", "hi", "id", "fa", "ga", "gv", "he",
  "jam", "ja", "kk", "sw", "gil", "ko", "ky", "lo", "lv", "st", "kpe", "lb", "mg", "ny", "dv", "bm",
  "mt", "mh", "ro", "mn", "sr", "my", "af", "na", "ne", "mi", "niu", "mk", "ur", "pau", "tpi", "gn",
  "tl", "pl", "lg", "uk", "cy", "bem", "sn", "si", "ss", "sk", "sl", "pis", "so", "zu", "tet", "tk",
  "tvl", "bi", "vi", "crs", "men", "kea", "kwy", "srl"
];

// Starter translation keys
const starterKeys = {
  "welcome": "Welcome to Stash or Trash???",
  "choose_country": "Choose your country",
  "choose_language": "Choose your language",
  "brands": "Brands",
  "suggest_brand": "Suggest a Brand",
  "admin_panel": "Admin Panel"
};

const outDir = path.join(__dirname, '..', 'public', 'locales');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

codes.forEach(code => {
  const file = path.join(outDir, `${code}.json`);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(starterKeys, null, 2), 'utf8');
    console.log(`Created: ${file}`);
  } else {
    console.log(`Already exists: ${file}`);
  }
});
