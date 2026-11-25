// Vercel 빌드 시 환경변수를 읽어 정적 config.js를 생성한다. (공개 가능한 URL·Publishable Key만 사용)
const fs = require('fs');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error('SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY 환경변수가 필요합니다.');
  process.exit(1);
}

fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist');
['index.html', 'style.css', 'app.js'].forEach((f) => fs.copyFileSync(f, `dist/${f}`));
fs.writeFileSync(
  'dist/config.js',
  `window.APP_CONFIG = ${JSON.stringify({ SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: key })};\n`
);
console.log('dist/ 생성 완료');
