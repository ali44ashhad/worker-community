import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const BreadcrumbContext = createContext(null);

export function BreadcrumbProvider({ children }) {
  const [overrides, setOverridesState] = useState(null);

  const setBreadcrumbs = useCallback((items) => {
    setOverridesState(items);
  }, []);

  const clearBreadcrumbs = useCallback(() => {
    setOverridesState(null);
  }, []);

  const value = useMemo(
    () => ({ overrides, setBreadcrumbs, clearBreadcrumbs }),
    [overrides, setBreadcrumbs, clearBreadcrumbs]
  );

  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>;
}

export function useBreadcrumbContext() {
  return useContext(BreadcrumbContext);
}

/** Optional: pages can override breadcrumb trail (without Home — it is added automatically). */
export function usePageBreadcrumbs(items) {
  const ctx = useBreadcrumbContext();

  React.useEffect(() => {
    if (!ctx) return undefined;
    if (!items?.length) {
      ctx.clearBreadcrumbs();
      return undefined;
    }
    ctx.setBreadcrumbs(items);
    return () => ctx.clearBreadcrumbs();
  }, [ctx, items]);
}
