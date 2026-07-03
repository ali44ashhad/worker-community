import { slugifyCategoryName } from './slug';

/** Paths where breadcrumb should not render */
export const BREADCRUMB_HIDDEN_PATHS = new Set(['/', '/login', '/forgot-password', '/pending-approval']);

export function shouldShowBreadcrumb(pathname) {
  if (!pathname) return false;
  if (BREADCRUMB_HIDDEN_PATHS.has(pathname)) return false;
  if (pathname.startsWith('/reset-password')) return false;
  if (pathname.startsWith('/admin')) return false;
  if (pathname.startsWith('/secretary')) return false;
  if (pathname.startsWith('/provider/dashboard')) return false;
  if (pathname.startsWith('/provider/manage-services')) return false;
  if (pathname.startsWith('/provider/update-profile')) return false;
  if (pathname.startsWith('/community/')) return false;
  return true;
}

function humanizeSlug(slug) {
  const raw = String(slug || '').trim();
  if (!raw) return '';

  try {
    return decodeURIComponent(raw)
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return raw.replace(/-/g, ' ');
  }
}

function findServiceById(allProviders, serviceId) {
  for (const provider of allProviders || []) {
    const offerings = provider?.serviceOfferings;
    if (!Array.isArray(offerings)) continue;
    const found = offerings.find((s) => s._id === serviceId);
    if (found) {
      return {
        ...found,
        provider,
      };
    }
  }
  return null;
}

function findProviderById(allProviders, providerId) {
  return (allProviders || []).find((p) => p._id === providerId) || null;
}

function resolveCategoryName(activeCategories, slug) {
  const categorySlug = String(slug || '').toLowerCase();
  const match = (activeCategories || []).find((c) => slugifyCategoryName(c.name) === categorySlug);
  return match?.name || humanizeSlug(slug);
}

/**
 * @returns {{ to?: string, label: string }[] | null}
 */
export function buildBreadcrumbs(pathname, { allProviders = [], activeCategories = [], overrides = null } = {}) {
  if (!shouldShowBreadcrumb(pathname)) return null;

  if (overrides?.length) {
    return [{ to: '/', label: 'Home' }, ...overrides];
  }

  const crumbs = [{ to: '/', label: 'Home' }];

  const staticMap = {
    '/about': 'About Us',
    '/faq': 'FAQ',
    '/testimonials': 'Testimonials',
    '/terms': 'Terms & Conditions',
    '/privacy-policy': 'Privacy Policy',
    '/contact': 'Contact',
    '/service': 'Services',
    '/category': 'Categories',
    '/cart': 'Wishlist',
    '/top-services': 'Top Services',
    '/top-categories': 'Top Categories',
    '/become-provider': 'Become a Provider',
    '/update-profile': 'Update Profile',
    '/provider': 'Providers',
    '/know-more/providers': 'For Providers',
    '/know-more/seekers': 'For Seekers',
  };

  if (staticMap[pathname]) {
    crumbs.push({ label: staticMap[pathname] });
    return crumbs;
  }

  const serviceMatch = pathname.match(/^\/service\/([^/]+)$/);
  if (serviceMatch) {
    const serviceId = serviceMatch[1];
    const service = findServiceById(allProviders, serviceId);
    const category = service?.serviceCategory;
    const name = service?.servicename || service?.serviceCategory || humanizeSlug(serviceId);

    if (category) {
      crumbs.push({
        to: `/category/${slugifyCategoryName(category)}`,
        label: category,
      });
    }
    crumbs.push({ label: name });
    return crumbs;
  }

  const providerMatch = pathname.match(/^\/provider\/([^/]+)$/);
  if (providerMatch) {
    const providerId = providerMatch[1];
    const provider = findProviderById(allProviders, providerId);
    const firstName = provider?.user?.firstName || '';
    const lastName = provider?.user?.lastName || '';
    const name = `${firstName} ${lastName}`.trim() || humanizeSlug(providerId);

    crumbs.push({ to: '/provider', label: 'Providers' });
    crumbs.push({ label: name });
    return crumbs;
  }

  const categoryMatch = pathname.match(/^\/category\/([^/]+)$/);
  if (categoryMatch) {
    const slug = categoryMatch[1];
    const name = resolveCategoryName(activeCategories, slug);

    crumbs.push({ to: '/category', label: 'Categories' });
    crumbs.push({ label: name });
    return crumbs;
  }

  // Fallback: build from path segments
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  let path = '';
  segments.forEach((segment, index) => {
    path += `/${segment}`;
    const isLast = index === segments.length - 1;
    crumbs.push({
      to: isLast ? undefined : path,
      label: humanizeSlug(segment),
    });
  });

  return crumbs;
}
