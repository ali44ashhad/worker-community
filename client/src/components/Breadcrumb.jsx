import React, { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronRight } from 'lucide-react';
import { getAllProviders } from '../features/providerSlice';
import { getActiveCategories } from '../features/adminSlice';
import { buildBreadcrumbs, shouldShowBreadcrumb } from '../utils/breadcrumbs';
import { useBreadcrumbContext } from '../context/BreadcrumbContext';

const Breadcrumb = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const { overrides } = useBreadcrumbContext() || {};
  const { allProviders } = useSelector((state) => state.provider);
  const { activeCategories } = useSelector((state) => state.admin);

  const needsProviders =
    shouldShowBreadcrumb(pathname) && (pathname.startsWith('/service/') || pathname.startsWith('/provider/'));
  const needsCategories = shouldShowBreadcrumb(pathname) && pathname.startsWith('/category/');

  useEffect(() => {
    if (needsProviders && allProviders.length === 0) {
      dispatch(getAllProviders());
    }
  }, [dispatch, needsProviders, allProviders.length]);

  useEffect(() => {
    if (needsCategories && (!activeCategories || activeCategories.length === 0)) {
      dispatch(getActiveCategories());
    }
  }, [dispatch, needsCategories, activeCategories?.length]);

  const crumbs = useMemo(
    () =>
      buildBreadcrumbs(pathname, {
        allProviders,
        activeCategories,
        overrides,
      }),
    [pathname, allProviders, activeCategories, overrides]
  );

  if (!crumbs || crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="mt-20 bg-white/90 backdrop-blur-sm border-b border-purple-100/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--text-secondary)]">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;

            return (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5 min-w-0">
                {index > 0 && <ChevronRight className="w-4 h-4 shrink-0 text-purple-200" aria-hidden />}
                {crumb.to && !isLast ? (
                  <Link
                    to={crumb.to}
                    className="hover:text-[var(--purple-primary)] transition-colors truncate max-w-[12rem] sm:max-w-none"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={`truncate max-w-[14rem] sm:max-w-xs ${
                      isLast ? 'text-[var(--text-primary)] font-medium' : ''
                    }`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;
