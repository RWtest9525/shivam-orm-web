import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const input = (req.query.package_name || req.query.package || req.query.id || '').toString().trim();
  if (!input) {
    return res.status(400).json({ success: false, error: 'Package name or Play Store URL is required.' });
  }

  let pkg = input;
  if (pkg.includes('id=')) {
    try {
      pkg = new URL(pkg).searchParams.get('id') || pkg;
    } catch {
      const match = pkg.match(/[?&]id=([a-zA-Z0-9_.]+)/);
      if (match) pkg = match[1];
    }
  }

  const pkgMatch = pkg.match(/([a-zA-Z][a-zA-Z0-9_]*\.[a-zA-Z0-9_.]+)/);
  if (pkgMatch) pkg = pkgMatch[1];

  if (!pkg || !pkg.includes('.')) {
    return res.status(400).json({ success: false, error: 'Invalid Play Store Package Name format.' });
  }

  try {
    const playUrl = `https://play.google.com/store/apps/details?id=${encodeURIComponent(pkg)}&hl=en`;
    const resp = await fetch(playUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    }).catch(() => null);

    if (!resp || !resp.ok) {
      return res.status(404).json({ success: false, error: 'Unable to fetch app details.' });
    }

    const html = await resp.text();
    if (!html || html.length < 500) {
      return res.status(404).json({ success: false, error: 'Unable to fetch app details.' });
    }

    let appName = '';
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      appName = titleMatch[1]
        .replace(/\s*[-–]\s*Apps on Google Play.*$/i, '')
        .replace(/\s*[-–]\s*Google Play.*$/i, '')
        .replace(/\s*[-–]\s*Android Apps on Google Play.*$/i, '')
        .replace(/\s*\|.*$/, '')
        .trim();
    }

    if (!appName) {
      const ogTitle = html.match(/property=["']og:title["']\s+content=["']([^"']+)["']/i) || html.match(/content=["']([^"']+)["']\s+property=["']og:title["']/i);
      if (ogTitle) {
        appName = ogTitle[1].replace(/\s*[-–]\s*Apps on Google Play.*$/i, '').trim();
      }
    }

    let appIcon = '';
    const ogImg = html.match(/property=["']og:image["']\s+content=["'](https:\/\/play-lh\.googleusercontent\.com\/[^"']+)["']/i) || html.match(/content=["'](https:\/\/play-lh\.googleusercontent\.com\/[^"']+)["']\s+property=["']og:image["']/i);
    if (ogImg) {
      appIcon = ogImg[1];
    }

    if (!appIcon) {
      const allIcons = html.match(/src=["'](https:\/\/play-lh\.googleusercontent\.com\/[^"']+)["']/gi);
      if (allIcons && allIcons.length > 0) {
        const firstMatch = allIcons[0].match(/src=["'](https:\/\/play-lh\.googleusercontent\.com\/[^"']+)["']/i);
        if (firstMatch) appIcon = firstMatch[1];
      }
    }

    let developer = '';
    const devMatch = html.match(/itemprop=["']author["'][^>]*>([^<]+)</i) || html.match(/class=["'][^"']*dev-link[^"']*["'][^>]*>([^<]+)</i);
    if (devMatch) developer = devMatch[1].trim();

    let category = '';
    const catMatch = html.match(/itemprop=["']genre["'][^>]*>([^<]+)</i);
    if (catMatch) category = catMatch[1].trim();

    if (!appName || !appIcon) {
      return res.status(404).json({ success: false, error: 'Unable to fetch app details.' });
    }

    return res.status(200).json({
      success: true,
      package_name: pkg,
      app_name: appName,
      app_icon_url: appIcon,
      play_link: `https://play.google.com/store/apps/details?id=${pkg}`,
      developer: developer || undefined,
      category: category || undefined,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Unable to fetch app details.' });
  }
}
