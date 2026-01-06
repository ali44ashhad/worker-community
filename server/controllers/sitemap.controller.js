import { SERVICE_RULES } from '../models/serviceOffering.model.js';

const BASE_URL = 'https://www.commun.in';

/**
 * Generate XML sitemap for the website
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const generateSitemap = (req, res) => {
  try {
    // Get current date in ISO 8601 format (YYYY-MM-DD)
    const currentDate = new Date().toISOString().split('T')[0];

    // Start building XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static routes with priority 0.9
    const staticRoutes = [
      { path: '/', priority: '1.0', changefreq: 'weekly' },
      { path: '/about', priority: '0.9', changefreq: 'weekly' },
      { path: '/testimonials', priority: '0.9', changefreq: 'weekly' },
      { path: '/faq', priority: '0.9', changefreq: 'weekly' },
      { path: '/contact', priority: '0.9', changefreq: 'weekly' },
      { path: '/category', priority: '0.9', changefreq: 'weekly' }
    ];

    // Add static routes to XML
    staticRoutes.forEach(route => {
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}${route.path}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    // Add category routes from SERVICE_RULES
    const categories = Object.keys(SERVICE_RULES);
    categories.forEach(categoryName => {
      const encodedCategory = encodeURIComponent(categoryName);
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}/category/${encodedCategory}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    // Close urlset tag
    xml += '</urlset>';

    // Set proper Content-Type header
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating sitemap'
    });
  }
};

/**
 * Generate robots.txt for the website
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const generateRobots = (req, res) => {
  try {
    const robotsTxt = `User-agent: *
Allow: /

# Disallow admin and protected routes
Disallow: /admin/
Disallow: /provider/dashboard
Disallow: /provider/manage-services
Disallow: /provider/update-profile
Disallow: /update-profile
Disallow: /update-services
Disallow: /become-provider
Disallow: /login
Disallow: /cart/

# Sitemap location
Sitemap: ${BASE_URL}/sitemap.xml
`;

    // Set proper Content-Type header
    res.set('Content-Type', 'text/plain');
    res.send(robotsTxt);
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating robots.txt'
    });
  }
};

