import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Building2, Check, X } from 'lucide-react';
import {
  createSecretaryLocalBusiness,
  fetchBusinessCategories,
  fetchSecretaryLocalBusinessById,
  updateSecretaryLocalBusiness,
} from '../../features/secretarySlice';

const cardClass =
  'rounded-2xl border border-purple-100/50 bg-white/80 p-5 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-6';
const inputBase =
  'w-full rounded-xl border border-purple-100 bg-white/90 px-3.5 py-2.5 text-sm text-[var(--text-primary)] shadow-sm outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100';
const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90 disabled:opacity-60';
const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition-colors hover:bg-purple-50 disabled:opacity-60';

const Field = ({ label, required, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
      {label}
      {required ? <span className="text-red-500"> *</span> : null}
    </span>
    {children}
  </label>
);

const toDateInput = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

const emptyForm = {
  businessName: '',
  description: '',
  ownerName: '',
  contactNumber: '',
  email: '',
  address: '',
  website: '',
  businessCategories: [],
  discountPercentage: '10',
  discountedCategories: [],
  nonDiscountedCategories: [],
  discountStartDate: '',
  discountEndDate: '',
  status: 'active',
};

const SecretaryLocalBusinessForm = () => {
  const { businessId } = useParams();
  const isEdit = Boolean(businessId);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    businessCategories,
    businessCategoriesLoading,
    localBusinessDetail,
    localBusinessDetailLoading,
    localBusinessSaving,
  } = useSelector((state) => state.secretary);

  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch(fetchBusinessCategories());
  }, [dispatch]);

  useEffect(() => {
    if (isEdit) dispatch(fetchSecretaryLocalBusinessById(businessId));
  }, [dispatch, isEdit, businessId]);

  useEffect(() => {
    if (!isEdit || !localBusinessDetail) return;
    setForm({
      businessName: localBusinessDetail.businessName || '',
      description: localBusinessDetail.description || '',
      ownerName: localBusinessDetail.ownerName || '',
      contactNumber: localBusinessDetail.contactNumber || '',
      email: localBusinessDetail.email || '',
      address: localBusinessDetail.address || '',
      website: localBusinessDetail.website || '',
      businessCategories: localBusinessDetail.businessCategories || [],
      discountPercentage: String(localBusinessDetail.discountPercentage ?? '10'),
      discountedCategories: localBusinessDetail.discountedCategories || [],
      nonDiscountedCategories: localBusinessDetail.nonDiscountedCategories || [],
      discountStartDate: toDateInput(localBusinessDetail.discountStartDate),
      discountEndDate: toDateInput(localBusinessDetail.discountEndDate),
      status: localBusinessDetail.status || 'active',
    });
    setLogoPreview(localBusinessDetail.logoUrl || '');
    setBannerPreview(localBusinessDetail.bannerUrl || '');
  }, [isEdit, localBusinessDetail]);

  const availableServices = useMemo(() => {
    const selected = new Set(form.businessCategories);
    const services = [];
    (businessCategories || []).forEach((cat) => {
      if (!selected.has(cat.name)) return;
      (cat.subCategories || []).forEach((sub) => {
        if (sub && !services.includes(sub)) services.push(sub);
      });
    });
    return services;
  }, [businessCategories, form.businessCategories]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      discountedCategories: prev.discountedCategories.filter((s) => availableServices.includes(s)),
      nonDiscountedCategories: prev.nonDiscountedCategories.filter((s) => availableServices.includes(s)),
    }));
  }, [availableServices]);

  const toggleBusinessCategory = (name) => {
    setForm((prev) => {
      const exists = prev.businessCategories.includes(name);
      return {
        ...prev,
        businessCategories: exists
          ? prev.businessCategories.filter((c) => c !== name)
          : [...prev.businessCategories, name],
      };
    });
  };

  const setServiceDiscount = (serviceName, mode) => {
    setForm((prev) => {
      const discounted = prev.discountedCategories.filter((s) => s !== serviceName);
      const nonDiscounted = prev.nonDiscountedCategories.filter((s) => s !== serviceName);
      if (mode === 'discounted') discounted.push(serviceName);
      if (mode === 'none') nonDiscounted.push(serviceName);
      return { ...prev, discountedCategories: discounted, nonDiscountedCategories: nonDiscounted };
    });
  };

  const onLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const onBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.businessName.trim()) return setFormError('Business name is required.');
    if (!form.ownerName.trim()) return setFormError('Owner name is required.');
    if (!form.contactNumber.trim()) return setFormError('Contact number is required.');
    if (!form.email.trim()) return setFormError('Email address is required.');
    if (!form.address.trim()) return setFormError('Business address is required.');
    if (!form.businessCategories.length) return setFormError('Select at least one business category.');
    if (!form.discountStartDate || !form.discountEndDate) {
      return setFormError('Discount start and end dates are required.');
    }

    const payload = {
      ...form,
      discountPercentage: Number(form.discountPercentage),
      logo: logoFile || undefined,
      banner: bannerFile || undefined,
    };

    const action = isEdit
      ? await dispatch(updateSecretaryLocalBusiness({ businessId, ...payload }))
      : await dispatch(createSecretaryLocalBusiness(payload));

    if (action.meta.requestStatus === 'fulfilled') {
      navigate('/secretary/local-businesses');
    } else {
      setFormError(action.payload || 'Could not save business.');
    }
  };

  if (isEdit && localBusinessDetailLoading) {
    return <div className="p-6 text-sm text-[var(--text-secondary)]">Loading business…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className={`${cardClass} flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-[var(--purple-primary)]">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
              {isEdit ? 'Edit Business' : 'Add Business'}
            </h1>
            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
              Business information and category-level discount configuration.
            </p>
          </div>
        </div>
        <Link to="/secretary/local-businesses" className={btnGhost}>
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Link>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <section className={`${cardClass} space-y-4`}>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Business Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Business Name" required>
              <input
                className={inputBase}
                value={form.businessName}
                onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))}
              />
            </Field>
            <Field label="Owner Name" required>
              <input
                className={inputBase}
                value={form.ownerName}
                onChange={(e) => setForm((p) => ({ ...p, ownerName: e.target.value }))}
              />
            </Field>
            <Field label="Contact Number" required>
              <input
                className={inputBase}
                value={form.contactNumber}
                onChange={(e) => setForm((p) => ({ ...p, contactNumber: e.target.value }))}
              />
            </Field>
            <Field label="Email Address" required>
              <input
                type="email"
                className={inputBase}
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </Field>
            <Field label="Website (Optional)">
              <input
                className={inputBase}
                placeholder="https://"
                value={form.website}
                onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
              />
            </Field>
            <Field label="Status">
              <select
                className={inputBase}
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>
          <Field label="Business Address" required>
            <textarea
              rows={2}
              className={inputBase}
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            />
          </Field>
          <Field label="Business Description">
            <textarea
              rows={3}
              className={inputBase}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Business Logo / Image">
              <input type="file" accept="image/*" onChange={onLogoChange} className="text-sm" />
              {logoPreview ? (
                <img src={logoPreview} alt="" className="mt-2 h-20 w-20 rounded-xl object-cover" />
              ) : null}
            </Field>
            <Field label="Business Banner (Optional)">
              <input type="file" accept="image/*" onChange={onBannerChange} className="text-sm" />
              {bannerPreview ? (
                <img src={bannerPreview} alt="" className="mt-2 h-20 w-full rounded-xl object-cover" />
              ) : null}
            </Field>
          </div>
        </section>

        <section className={`${cardClass} space-y-4`}>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Business Category</h2>
          <p className="text-xs text-[var(--text-secondary)]">Choose one or more categories.</p>
          {businessCategoriesLoading ? (
            <p className="text-sm text-[var(--text-secondary)]">Loading categories…</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(businessCategories || []).map((cat) => {
                const selected = form.businessCategories.includes(cat.name);
                return (
                  <button
                    key={cat._id || cat.name}
                    type="button"
                    onClick={() => toggleBusinessCategory(cat.name)}
                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                      selected
                        ? 'border-purple-300 bg-purple-50 text-[var(--purple-primary)]'
                        : 'border-purple-100 bg-white text-[var(--text-primary)] hover:bg-purple-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className={`${cardClass} space-y-4`}>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Discount Configuration</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Discount Percentage" required>
              <input
                type="number"
                min="0"
                max="100"
                className={inputBase}
                value={form.discountPercentage}
                onChange={(e) => setForm((p) => ({ ...p, discountPercentage: e.target.value }))}
              />
            </Field>
            <Field label="Discount Start Date" required>
              <input
                type="date"
                className={inputBase}
                value={form.discountStartDate}
                onChange={(e) => setForm((p) => ({ ...p, discountStartDate: e.target.value }))}
              />
            </Field>
            <Field label="Discount End Date" required>
              <input
                type="date"
                className={inputBase}
                value={form.discountEndDate}
                onChange={(e) => setForm((p) => ({ ...p, discountEndDate: e.target.value }))}
              />
            </Field>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">
              Discount Applicable On (services / products)
            </p>
            {!availableServices.length ? (
              <p className="text-sm text-[var(--text-secondary)]">
                Select a business category to configure discounted services.
              </p>
            ) : (
              <div className="space-y-2">
                {availableServices.map((service) => {
                  const isDiscounted = form.discountedCategories.includes(service);
                  const isNone = form.nonDiscountedCategories.includes(service);
                  return (
                    <div
                      key={service}
                      className="flex flex-col gap-2 rounded-xl border border-purple-100/70 bg-white/70 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="text-sm font-medium text-[var(--text-primary)]">{service}</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setServiceDiscount(service, 'discounted')}
                          className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                            isDiscounted
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-purple-100 bg-white text-[var(--text-secondary)]'
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                          {form.discountPercentage || 0}% Off
                        </button>
                        <button
                          type="button"
                          onClick={() => setServiceDiscount(service, 'none')}
                          className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                            isNone
                              ? 'border-red-200 bg-red-50 text-red-700'
                              : 'border-purple-100 bg-white text-[var(--text-secondary)]'
                          }`}
                        >
                          <X className="h-3.5 w-3.5" />
                          No Discount
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {formError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button type="submit" className={btnPrimary} disabled={localBusinessSaving}>
            {localBusinessSaving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Business'}
          </button>
          <Link to="/secretary/local-businesses" className={btnGhost}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SecretaryLocalBusinessForm;
