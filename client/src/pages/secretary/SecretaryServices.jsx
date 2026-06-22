import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { ToggleRight, Wrench } from 'lucide-react';
import {
  fetchCategoryToggles,
  updateCategoryToggle,
} from '../../features/secretarySlice';
import ToggleSwitch from '../../components/ToggleSwitch';
import { formatCommunDisplayName } from '../../utils/communName';
import Services from '../Services';

const cardClass =
  'rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6';

const SecretaryServices = () => {
  const dispatch = useDispatch();
  const {
    categoryToggles,
    categoryTogglesLoading,
    categoryTogglesSaving,
    categoryTogglesError,
    categoryTogglesMeta,
  } = useSelector((state) => state.secretary);

  useEffect(() => {
    dispatch(fetchCategoryToggles());
  }, [dispatch]);

  return (
    <motion.div
      className="min-h-screen bg-[var(--background-subtle)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <section className="border-b border-purple-100/60 bg-gradient-to-br from-purple-50/30 via-white to-fuchsia-50/20 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--purple-primary)]">
            Secretary
          </p>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">Services</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Choose which service categories members can browse in your Commun community
            {categoryTogglesMeta.communityCommunName ? (
              <span className="font-medium text-[var(--purple-primary)]">
                {' '}
                ({formatCommunDisplayName(categoryTogglesMeta.communityCommunName)})
              </span>
            ) : null}
            .
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cardClass}
        >
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
              <ToggleRight className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] sm:text-base">
                Service category toggles
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                Only categories with active providers in your community appear here. Disabled categories are hidden from customer and provider panels.
              </p>
            </div>
          </div>

          {categoryTogglesError && (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {categoryTogglesError}
            </p>
          )}

          {categoryTogglesLoading ? (
            <p className="text-sm text-[var(--text-secondary)]">Loading categories…</p>
          ) : categoryTogglesMeta.needsCommunName ? (
            <p className="text-sm text-[var(--text-secondary)]">Set your Commun name to manage services.</p>
          ) : categoryToggles.length === 0 ? (
            <div className="flex items-start gap-3 rounded-xl border border-purple-100 bg-purple-50/40 px-4 py-4">
              <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-[var(--purple-primary)]" />
              <p className="text-sm text-[var(--text-secondary)]">
                No provider services in your community yet. Categories will appear here once providers add services.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {categoryToggles.map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col gap-3 rounded-xl border border-purple-100/70 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--text-primary)]">{item.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {item.serviceCount} {item.serviceCount === 1 ? 'service' : 'services'} in your community
                    </p>
                  </div>
                  <ToggleSwitch
                    enabled={Boolean(item.enabled)}
                    label={`${item.name} ${item.enabled ? 'on' : 'off'}`}
                    disabled={categoryTogglesLoading || categoryTogglesSaving}
                    onToggle={() =>
                      dispatch(
                        updateCategoryToggle({
                          categoryName: item.name,
                          enabled: !item.enabled,
                        })
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <Services communityScope embedded />
      </div>
    </motion.div>
  );
};

export default SecretaryServices;
