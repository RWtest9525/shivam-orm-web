async function testProxy(pkg) {
  const target = `https://play.google.com/store/apps/details?id=${pkg}&hl=en`;
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(target)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`,
  ];

  for (let i = 0; i < proxies.length; i++) {
    const p = proxies[i];
    try {
      const start = Date.now();
      const resp = await fetch(p, { signal: AbortSignal.timeout(6000) });
      const html = await resp.text();
      const elapsed = Date.now() - start;

      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const ogImgMatch = html.match(/property="og:image"\s+content="([^"]+)"/i) || html.match(/content="([^"]+)"\s+property="og:image"/i);

      const title = titleMatch ? titleMatch[1].replace(/\s*[-–]\s*Apps on Google Play.*$/i, '').trim() : 'NO TITLE';
      const icon = ogImgMatch ? ogImgMatch[1] : 'NO ICON';

      console.log(`Proxy ${i+1} (${elapsed}ms) - Package: ${pkg}`);
      console.log('  Title:', title);
      console.log('  Icon:', icon.slice(0, 80));
      if (title !== 'NO TITLE' && icon !== 'NO ICON') {
        return;
      }
    } catch (err) {
      console.log(`Proxy ${i+1} failed: ${err.message}`);
    }
  }
}

async function run() {
  await testProxy('lbindia.android.app');
  await testProxy('com.whatsapp');
  await testProxy('com.flipkart.android');
}

run();
