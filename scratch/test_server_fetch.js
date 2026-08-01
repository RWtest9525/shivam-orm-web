async function testServerEndpoint(pkg) {
  const target = `https://play.google.com/store/apps/details?id=${pkg}&hl=en`;
  try {
    const resp = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (!resp.ok) {
      console.log(`Failed for ${pkg}: HTTP ${resp.status}`);
      return;
    }

    const html = await resp.text();
    let appName = '';
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      appName = titleMatch[1]
        .replace(/\s*[-–]\s*Apps on Google Play.*$/i, '')
        .replace(/\s*[-–]\s*Google Play.*$/i, '')
        .replace(/\s*\|.*$/, '')
        .trim();
    }

    let appIcon = '';
    const ogImg = html.match(/property="og:image"\s+content="([^"]+)"/i) || html.match(/content="([^"]+)"\s+property="og:image"/i);
    if (ogImg) {
      appIcon = ogImg[1];
    }

    console.log(`Package: ${pkg}`);
    console.log(`  App Name: ${appName}`);
    console.log(`  App Icon: ${appIcon}`);
  } catch (err) {
    console.error(`Error for ${pkg}:`, err.message);
  }
}

async function run() {
  await testServerEndpoint('lbindia.android.app');
  await testServerEndpoint('com.whatsapp');
  await testServerEndpoint('com.flipkart.android');
  await testServerEndpoint('com.hoora.customer');
}

run();
