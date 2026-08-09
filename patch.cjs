const fs = require('fs');
const content = fs.readFileSync('src/components/ads/NativeAdCard.tsx', 'utf8');
const newContent = content.replace(
  '{/* Ad duration style badge */}',
  '<div className="absolute top-2 right-2 bg-black/80 text-white px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase z-10 pointer-events-none">Ad</div>\n        {/* Ad duration style badge */}'
);
fs.writeFileSync('src/components/ads/NativeAdCard.tsx', newContent);
