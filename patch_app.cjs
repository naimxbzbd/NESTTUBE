const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('AdBlockDetector')) {
  content = content.replace(
    "import { AdSettingsModal } from './components/ads/AdSettingsModal';",
    "import { AdSettingsModal } from './components/ads/AdSettingsModal';\nimport { AdBlockDetector } from './components/ads/AdBlockDetector';"
  );
  
  content = content.replace(
    "<AdSettingsModal />",
    "<AdSettingsModal />\n              <AdBlockDetector />"
  );
  fs.writeFileSync('src/App.tsx', content);
}
