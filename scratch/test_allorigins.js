async function testAllOrigins(pkg) {
  const target = `https://play.google.com/store/apps/details?id=${pkg}&hl=en`;
  const url = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;
  try {
    const start = Date.now();
    const resp = await fetch(url);
    const data = await resp.json();
    const elapsed = Date.now() - start;

    const html = data.contents || '';
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogImg = html.match(/property="og:image"\s+content="([^"]+)"/i) || html.match(/content="([^"]+)"\s+property="og:image"/i);

    const title = titleMatch ? titleMatch[1].replace(/\s*[-–]\s*Apps on Google Play.*$/i, '').trim() : 'NO TITLE';
    const icon = ogImg ? ogImg[1] : 'NO ICON';

    console.log(`Package: ${pkg} (${elapsed}ms)`);
    console.log('  Title:', title);
    console.log('  Icon:', icon);
  } catch (err) {
    console.error('AllOrigins Error:', err.message);
  }
}

async function run() {
  await testAllOrigins('lbindia.android.app');
  await testAllOrigins('com.whatsapp');
  await testAllOrigins('com.flipkart.android');
}

run();
