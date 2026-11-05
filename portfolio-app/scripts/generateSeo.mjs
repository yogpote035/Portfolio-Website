import fs from 'node:fs';
import path from 'node:path';

const envFile = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
const envSiteUrl = envFile.match(/^VITE_SITE_URL\s*=\s*(.+)$/m)?.[1]?.trim();
const siteUrl = (process.env.VITE_SITE_URL || envSiteUrl || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || 'localhost:5173')
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '');
const origin = siteUrl === 'localhost:5173' ? `http://${siteUrl}` : `https://${siteUrl}`;
const publicDir = path.resolve('public');

const routes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/projects', priority: '0.9', changefreq: 'weekly' },
  { path: '/projects/cab-management-erp', priority: '0.8', changefreq: 'monthly' },
  { path: '/projects/manufacturing-erp', priority: '0.8', changefreq: 'monthly' },
  { path: '/projects/click2hire', priority: '0.8', changefreq: 'monthly' },
  { path: '/projects/rentbox', priority: '0.8', changefreq: 'monthly' },
  { path: '/projects/tripup', priority: '0.8', changefreq: 'monthly' },
];

const lastmod = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(({ path: route, priority, changefreq }) => `  <url><loc>${origin}${route}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`).join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${origin}/sitemap.xml
`;

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots);
