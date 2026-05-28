const https = require('https');
const fs = require('fs');

const url = 'https://upload.wikimedia.org/wikipedia/commons/9/93/Foot_Locker_logo.svg';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('public/footlocker-clean.svg', data);
    console.log('Downloaded SVG successfully, length:', data.length);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
