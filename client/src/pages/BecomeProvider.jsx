import React, { useEffect, useMemo, useState } from 'react';
import { X, Plus, Upload, Trash2, FileText, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from '../features/authSlice';
import { getActiveCategories } from '../features/adminSlice';
import { getApiBase } from '../utils/apiBase';
import { formatCommunDisplayName } from '../utils/communName';

const DRAFT_KEY = 'becomeProviderDraft:v1';
const BECOME_PROVIDER_VIDEO_ID = 'x0fy5a018V4';

const inputBase =
  'w-full rounded-xl border bg-white px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 transition-all focus:outline-none focus:ring-2';
const inputOk = `${inputBase} border-purple-100 focus:border-[var(--purple-primary)] focus:ring-[var(--purple-primary)]/25`;
const inputErr = `${inputBase} border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-400/25`;
const labelClass = 'mb-2 block text-xs font-medium text-[var(--text-secondary)]';
const cardClass =
  'rounded-2xl border border-purple-100/50 bg-white/80 p-6 shadow-sm shadow-purple-500/5 backdrop-blur-sm sm:p-8';
const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-purple-500/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const btnDashed =
  'flex w-full items-center justify-center gap-3 rounded-xl border border-dashed border-purple-200 py-4 text-base font-semibold text-[var(--purple-primary)] transition-all hover:border-purple-300 hover:bg-purple-50/50';

const fieldClass = (hasError) => (hasError ? inputErr : inputOk);

const chipClass = (selected, pill = true) =>
  `${pill ? 'rounded-full px-4 py-2' : 'rounded-lg px-5 py-2.5 font-semibold'} border text-sm font-medium transition-all ${
    selected
      ? 'border-transparent bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-white shadow-sm shadow-purple-500/20'
      : 'border-purple-100 bg-white text-[var(--text-secondary)] hover:bg-purple-50 hover:text-[var(--purple-primary)]'
  }`;

const uploadZoneClass = (hasError) =>
  `rounded-xl border-2 border-dashed p-8 text-center transition-colors sm:p-10 ${
    hasError
      ? 'border-red-300 bg-red-50'
      : 'border-purple-100 bg-purple-50/20 hover:border-purple-200'
  }`;

const BecomeProvider = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isPanelRoute = location.pathname.startsWith('/community/');
  const dispatch = useDispatch();
  const { activeCategories } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);
  const PROVIDER_BIO_MAX_CHARS = 500;
  const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50MB per file
  // Many hosts/proxies reject very large multipart bodies even if per-file is ok.
  // Keep this slightly under common 100MB limits.
  const MAX_TOTAL_UPLOAD_BYTES = 95 * 1024 * 1024; // 95MB total per submit
  const EXPERIENCE_MAX_YEARS = 80;
  const formatBytes = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(mb >= 10 ? 1 : 2)}MB`;
  };
  const [services, setServices] = useState([{
    id: Date.now(),
    servicename: '',
    category: '',
    subCategories: [],
    keywords: [],
    images: [], // Will store File objects for upload
    imagePreviews: [], // Will store blob URLs for preview
    pdfs: [], // Will store PDF File objects for upload
    pdfPreviews: [], // Will store PDF preview info
    bio: '',
    experience: '',
    // price: ''
  }]);

  useEffect(() => {
    if (!activeCategories || activeCategories.length === 0) {
      dispatch(getActiveCategories());
    }
  }, [dispatch, activeCategories]);

  // State for provider bio
  const [providerBio, setProviderBio] = useState('');

  // Restore draft from localStorage on first mount
  useEffect(() => {
    try { 
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;

      if (typeof parsed.providerBio === 'string') {
        setProviderBio(parsed.providerBio);
      }
      if (Array.isArray(parsed.services) && parsed.services.length > 0) {
        // Files/preview blob URLs can't be restored; only keep text/selection fields.
        const restored = parsed.services.map((s) => ({
          id: s?.id || Date.now() + Math.random(),
          servicename: s?.servicename || '',
          category: s?.category || '',
          subCategories: Array.isArray(s?.subCategories) ? s.subCategories : [],
          keywords: Array.isArray(s?.keywords) ? s.keywords : [],
          images: [],
          imagePreviews: [],
          pdfs: [],
          pdfPreviews: [],
          bio: s?.bio || '',
          experience: s?.experience ?? '',
        }));
        setServices(restored);
      }
    } catch {
      // ignore corrupted draft
    }
  }, []);

  // Auto-save draft (excluding file objects) to survive accidental refresh
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const safeServices = (services || []).map((s) => ({
          id: s?.id,
          servicename: s?.servicename || '',
          category: s?.category || '',
          subCategories: Array.isArray(s?.subCategories) ? s.subCategories : [],
          keywords: Array.isArray(s?.keywords) ? s.keywords : [],
          bio: s?.bio || '',
          experience: s?.experience ?? '',
        }));
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            providerBio: providerBio || '',
            services: safeServices,
            savedAt: Date.now(),
          })
        );
      } catch {
        // ignore quota/blocked storage
      }
    }, 400);
    return () => clearTimeout(t);
  }, [providerBio, services]);

  // New state to hold validation errors
  const [errors, setErrors] = useState({});

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const RULES = useMemo(() => {
    const rules = {};
    (activeCategories || []).forEach((c) => {
      rules[c.name] = { subCategories: c.subCategories || [], keywords: c.keywords || [] };
    });
    return rules;
  }, [activeCategories]);

  const handleCategoryChange = (serviceId, category) => {
    setServices(services.map(service =>
      service.id === serviceId
        ? { ...service, category, subCategories: [], keywords: [] }
        : service
    ));
    // Clear related error when changing
    if (errors[`service-${serviceId}-category`]) {
      setErrors(prev => ({ ...prev, [`service-${serviceId}-category`]: null }));
    }
  };

  const handleSubCategoryToggle = (serviceId, subCategory) => {
    setServices(services.map(service => {
      if (service.id === serviceId) {
        const isSelected = service.subCategories.includes(subCategory);
        return {
          ...service,
          subCategories: isSelected
            ? service.subCategories.filter(sc => sc !== subCategory)
            : [...service.subCategories, subCategory]
        };
      }
      return service;
    }));
    // Clear related error when toggling
    if (errors[`service-${serviceId}-subCategories`]) {
      setErrors(prev => ({ ...prev, [`service-${serviceId}-subCategories`]: null }));
    }
  };

  const handleKeywordToggle = (serviceId, keyword) => {
    setServices(services.map(service => {
      if (service.id === serviceId) {
        const isSelected = service.keywords.includes(keyword);
        return {
          ...service,
          keywords: isSelected
            ? service.keywords.filter(k => k !== keyword)
            : [...service.keywords, keyword]
        };
      }
      return service;
    }));
    // Clear related error when toggling
    if (errors[`service-${serviceId}-keywords`]) {
      setErrors(prev => ({ ...prev, [`service-${serviceId}-keywords`]: null }));
    }
  };

  const handleImageUpload = (serviceId, e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = [];
    const validUrls = [];

    files.forEach((file) => {
      if (!file?.type?.startsWith('image/')) {
        toast.error(`${file?.name || 'File'} is not a valid image. Only images are allowed.`);
        return;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        toast.error(`${file.name} is ${formatBytes(file.size)} (max 50MB).`);
        return;
      }
      validFiles.push(file);
      validUrls.push(URL.createObjectURL(file));
    });

    if (!validFiles.length) return;

    setServices(services.map(service =>
      service.id === serviceId
        ? { 
            ...service, 
            images: [...service.images, ...validFiles], // Store File objects
            imagePreviews: [...service.imagePreviews, ...validUrls] // Store preview URLs
          }
        : service
    ));
    // Clear related error when uploading
    if (errors[`service-${serviceId}-images`]) {
      setErrors(prev => ({ ...prev, [`service-${serviceId}-images`]: null }));
    }
  };

  const handlePDFUpload = (serviceId, e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = [];
    const previews = [];

    files.forEach((file) => {
      if (file?.type !== 'application/pdf') {
        toast.error(`${file?.name || 'File'} is not a PDF. Only PDF files are allowed.`);
        return;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        toast.error(`${file.name} is ${formatBytes(file.size)} (max 50MB).`);
        return;
      }
      validFiles.push(file);
      previews.push({ name: file.name, url: URL.createObjectURL(file) });
    });

    if (!validFiles.length) return;

    setServices(services.map(service =>
      service.id === serviceId
        ? { 
            ...service, 
            pdfs: [...service.pdfs, ...validFiles], // Store File objects
            pdfPreviews: [...service.pdfPreviews, ...previews] // Store preview info
          }
        : service
    ));
    // Clear related error when uploading
    if (errors[`service-${serviceId}-pdfs`]) {
      setErrors(prev => ({ ...prev, [`service-${serviceId}-pdfs`]: null }));
    }
  };

  const handleRemoveImage = (serviceId, imageIndex) => {
    setServices(services.map(service =>
      service.id === serviceId
        ? { 
            ...service, 
            images: service.images.filter((_, i) => i !== imageIndex),
            imagePreviews: service.imagePreviews.filter((_, i) => i !== imageIndex)
          }
        : service
    ));
  };

  const handleRemovePDF = (serviceId, pdfIndex) => {
    setServices(services.map(service =>
      service.id === serviceId
        ? { 
            ...service, 
            pdfs: service.pdfs.filter((_, i) => i !== pdfIndex),
            pdfPreviews: service.pdfPreviews.filter((_, i) => i !== pdfIndex)
          }
        : service
    ));
  };

  const handleInputChange = (serviceId, field, value) => {
    if (field === 'experience') {
      const raw = String(value ?? '').trim();
      if (raw === '') {
        setServices(services.map(service =>
          service.id === serviceId ? { ...service, [field]: '' } : service
        ));
        if (errors[`service-${serviceId}-${field}`]) {
          setErrors(prev => ({ ...prev, [`service-${serviceId}-${field}`]: null }));
        }
        return;
      }

      const parsed = Number(raw);
      if (!Number.isFinite(parsed) || parsed < 0) {
        setErrors(prev => ({
          ...prev,
          [`service-${serviceId}-${field}`]: 'Experience must be a number (0 or more).',
        }));
        return;
      }
      if (parsed > EXPERIENCE_MAX_YEARS) {
        setErrors(prev => ({
          ...prev,
          [`service-${serviceId}-${field}`]: `Experience cannot exceed ${EXPERIENCE_MAX_YEARS} years.`,
        }));
        return;
      }

      const normalized = String(Math.floor(parsed));
      setServices(services.map(service =>
        service.id === serviceId ? { ...service, [field]: normalized } : service
      ));
      if (errors[`service-${serviceId}-${field}`]) {
        setErrors(prev => ({ ...prev, [`service-${serviceId}-${field}`]: null }));
      }
      return;
    }

    setServices(services.map(service =>
      service.id === serviceId
        ? { ...service, [field]: value }
        : service
    ));
    // Clear related error when typing
    if (errors[`service-${serviceId}-${field}`]) {
      setErrors(prev => ({ ...prev, [`service-${serviceId}-${field}`]: null }));
    }
  };

  const addNewService = () => {
    setServices([...services, {
      id: Date.now(),
      servicename: '',
      category: '',
      subCategories: [],
      keywords: [],
      images: [],
      imagePreviews: [],
      pdfs: [],
      pdfPreviews: [],
      bio: '',
      experience: '',
      // price: ''
    }]);
  };

  const removeService = (serviceId) => {
    if (services.length > 1) {
      setServices(services.filter(service => service.id !== serviceId));
      // Also remove errors associated with this service
      setErrors(prev => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach(key => {
          if (key.startsWith(`service-${serviceId}`)) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;

    // Validate provider bio
    if (!providerBio.trim()) {
      newErrors['providerBio'] = "Provider bio is required.";
      hasErrors = true;
    }
    if (providerBio && providerBio.length > PROVIDER_BIO_MAX_CHARS) {
      newErrors['providerBio'] = `Provider bio cannot exceed ${PROVIDER_BIO_MAX_CHARS} characters.`;
      hasErrors = true;
    }

    services.forEach((service) => {
      const serviceId = service.id;

      // 1. Service Name
      if (!service.servicename || !service.servicename.trim()) {
        newErrors[`service-${serviceId}-servicename`] = "Service name is required.";
        hasErrors = true;
      }

      // 2. Category
      if (!service.category) {
        newErrors[`service-${serviceId}-category`] = "Please select a category.";
        hasErrors = true;
      }

      // 3. Sub-Categories (only if category is selected and subcategories exist)
      if (service.category && (RULES[service.category]?.subCategories?.length || 0) > 0 && service.subCategories.length === 0) {
        newErrors[`service-${serviceId}-subCategories`] = "Please select at least one sub-category.";
        hasErrors = true;
      }

      // 4. Keywords (only if category is selected AND keywords exist for it)
      if (service.category && (RULES[service.category]?.keywords?.length || 0) > 0 && service.keywords.length === 0) {
        newErrors[`service-${serviceId}-keywords`] = "Please select at least one keyword.";
        hasErrors = true;
      }

      // 5. Bio
      if (!service.bio.trim()) {
        newErrors[`service-${serviceId}-bio`] = "Bio/Description is required.";
        hasErrors = true;
      }

      // 6. Experience (optional - no validation needed)
      // 6. Experience (optional)
      if (service.experience !== '' && service.experience !== undefined && service.experience !== null) {
        const exp = Number(service.experience);
        if (!Number.isFinite(exp) || exp < 0) {
          newErrors[`service-${serviceId}-experience`] = "Experience must be a number (0 or more).";
          hasErrors = true;
        } else if (exp > EXPERIENCE_MAX_YEARS) {
          newErrors[`service-${serviceId}-experience`] = `Experience cannot exceed ${EXPERIENCE_MAX_YEARS} years.`;
          hasErrors = true;
        }
      }

      // 7. Price
      /* if (service.price === '' || service.price === null || service.price === undefined) {
        newErrors[`service-${serviceId}-price`] = "Price is required.";
        hasErrors = true;
      } else if (parseFloat(service.price) < 0) {
        newErrors[`service-${serviceId}-price`] = "Price cannot be negative.";
        hasErrors = true;
      } */

      // 8. Work images/PDFs are optional
    });

    setErrors(newErrors);
    return !hasErrors; // Return true if valid, false if errors exist
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Total upload size pre-check (prevents confusing "Failed to fetch" on host limits)
      const totalBytes = (services || []).reduce((sum, s) => {
        const imgBytes = (s?.images || []).reduce((a, f) => a + (f?.size || 0), 0);
        const pdfBytes = (s?.pdfs || []).reduce((a, f) => a + (f?.size || 0), 0);
        return sum + imgBytes + pdfBytes;
      }, 0);
      if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
        // Soft warning only (many users still succeed depending on hosting limits)
        toast(
          `Warning: total upload is ${formatBytes(totalBytes)}. If submit fails, try fewer/smaller files.`,
          { icon: '⚠️' }
        );
      }

      // Prepare FormData
      const formData = new FormData();
      
      // Add provider bio
      formData.append('providerBio', providerBio);

      // Add services as JSON (IMPORTANT: do NOT include previews/files in JSON, it bloats payload)
      const servicesPayload = (services || []).map((s) => ({
        servicename: s?.servicename || '',
        category: s?.category || '',
        subCategories: Array.isArray(s?.subCategories) ? s.subCategories : [],
        keywords: Array.isArray(s?.keywords) ? s.keywords : [],
        bio: s?.bio || '',
        experience: s?.experience ?? '',
      }));
      formData.append('services', JSON.stringify(servicesPayload));
      
      // Add images with proper fieldnames - images array contains File objects
      services.forEach((service, index) => {
        if (service.images && service.images.length > 0) {
          service.images.forEach((file) => {
            if (file instanceof File) {
              formData.append(`service_${index}_images`, file);
            }
          });
        }
        // Add PDFs with proper fieldnames
        if (service.pdfs && service.pdfs.length > 0) {
          service.pdfs.forEach((file) => {
            if (file instanceof File) {
              formData.append(`service_${index}_pdfs`, file);
            }
          });
        }
      });

      // Use normalized API base. If empty, use relative `/api/*` (Vercel rewrite friendly).
      const base = getApiBase();
      const url = `${base || ''}/api/provider-profile/become-provider-multi`;

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include' // Include cookies for JWT authentication
      });

      const rawText = await response.text();
      const data = rawText ? (() => { try { return JSON.parse(rawText); } catch { return null; } })() : null;

      if (!response.ok) {
        const message =
          data?.message ||
          (response.status === 401
            ? 'Session expired. Please login again and retry.'
            : response.status === 413
              ? 'Upload too large. Please keep each file under 50MB.'
              : `Failed to submit (${response.status}). Please try again.`);
        toast.error(message);
        setIsSubmitting(false);
        return;
      }

      if (data?.success) {
        toast.success(data?.message || 'Provider registration submitted successfully!');

        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          // ignore
        }
        
        // Reset form
        setServices([{
          id: Date.now(),
          servicename: '',
          category: '',
          subCategories: [],
          keywords: [],
          images: [],
          imagePreviews: [],
          pdfs: [],
          pdfPreviews: [],
          bio: '',
          experience: '',
          // price: ''
        }]);
        setProviderBio('');
        setErrors({});
        setIsSubmitting(false);
        
        // Refresh auth state after role change
        await dispatch(checkAuth());
        
        if (data?.pendingApproval) {
          navigate('/pending-approval');
        } else {
          navigate('/provider/dashboard');
        }
      } else {
        toast.error(data?.message || 'Failed to submit provider registration.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Network/CORS errors often appear as "Failed to fetch"
      const msg = String(error?.message || '');
      toast.error(
        msg.includes('Failed to fetch')
          ? 'Failed to submit. This is usually a network/CORS or upload-size limit issue. Try fewer/smaller files and retry.'
          : (error?.message || 'An error occurred while submitting the form. Please try again.')
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--background-subtle)] pb-16">
      <div
        className={`mx-auto max-w-6xl px-4 sm:px-6 ${isPanelRoute ? 'pt-6' : 'pt-6 sm:pt-8'}`}
      >
      <motion.div
        className="mb-10 grid items-start gap-8 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--purple-primary)]">
            Provider onboarding
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Become a{' '}
            <span className="bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] bg-clip-text text-transparent">
              Provider
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--text-secondary)]">
            Share your skills with neighbours. Watch the guide, then fill in the form below.
          </p>
          <ol className="mt-5 space-y-2 text-sm text-[var(--text-secondary)]">
            {['Watch the walkthrough', 'Add your bio', 'List your service(s)'].map((step, i) => (
              <li key={step} className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-xs font-bold text-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <aside className="mx-auto w-full max-w-[320px] sm:max-w-[360px] lg:sticky lg:top-24 lg:max-w-none lg:justify-self-end">
          <div className="overflow-hidden rounded-2xl border border-purple-100/50 bg-white/80 shadow-md shadow-purple-500/5">
            <div className="flex items-center gap-2 border-b border-purple-100/60 bg-gradient-to-r from-purple-50/80 to-fuchsia-50/40 px-3 py-2.5">
              <PlayCircle className="h-4 w-4 shrink-0 text-[var(--purple-primary)]" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Registration guide</p>
                <p className="text-xs text-[var(--text-secondary)]">2 min · before you start</p>
              </div>
            </div>
            <div className="relative aspect-video w-full bg-gray-900">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube.com/embed/${BECOME_PROVIDER_VIDEO_ID}`}
                title="Become a provider — registration guide"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </aside>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div className={cardClass}>
          <h2 className="mb-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">About you</h2>
          <p className="mb-6 text-sm text-[var(--text-secondary)]">Introduce yourself to potential customers.</p>

          {user?.communityCommunName && (
            <div className="mb-6 rounded-xl border border-purple-100 bg-purple-50/40 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--purple-primary)]">Your Commun</p>
              <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                {formatCommunDisplayName(user.communityCommunName)}
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                You joined this community at signup.
              </p>
            </div>
          )}

          <div>
            <label className={labelClass}>
              Provider Bio *
            </label>
            <textarea
              value={providerBio}
              onChange={(e) => {
                const next = e.target.value;
                if (next.length <= PROVIDER_BIO_MAX_CHARS) {
                  setProviderBio(next);
                } else {
                  setProviderBio(next.slice(0, PROVIDER_BIO_MAX_CHARS));
                  setErrors(prev => ({
                    ...prev,
                    providerBio: `Provider bio cannot exceed ${PROVIDER_BIO_MAX_CHARS} characters.`,
                  }));
                }
                if (errors['providerBio']) {
                  setErrors(prev => ({ ...prev, ['providerBio']: null }));
                }
              }}
              placeholder="Tell us about yourself and your background..."
              maxLength={PROVIDER_BIO_MAX_CHARS}
              rows="4"
              className={`${fieldClass(errors['providerBio'])} resize-none`}
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-[var(--text-secondary)]">Max {PROVIDER_BIO_MAX_CHARS} characters</p>
              <p className={`text-xs ${providerBio.length >= PROVIDER_BIO_MAX_CHARS ? 'text-red-600' : 'text-[var(--text-secondary)]'}`}>
                {providerBio.length}/{PROVIDER_BIO_MAX_CHARS}
              </p>
            </div>
            {errors['providerBio'] && (
              <p className="text-red-600 text-sm mt-2 font-medium">{errors['providerBio']}</p>
            )}
          </div>
        </div>

        {/* Services Section */}
        {services.map((service, index) => (
          <div key={service.id} className={`relative ${cardClass}`}>
            {services.length > 1 && (
              <button
                type="button"
                onClick={() => removeService(service.id)}
                className="absolute right-4 top-4 rounded-full border border-red-200 bg-red-50 p-2 text-red-600 transition-all hover:bg-red-100"
              >
                <X size={20} />
              </button>
            )}

            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[var(--purple-primary)] to-[var(--magenta)] text-lg font-bold text-white">
                {index + 1}
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                Service
              </h2>
            </div>

            {/* Service Name */}
            <div className="mb-6">
              <label className={labelClass}>
                Service Name *
              </label>
              <input
                type="text"
                value={service.servicename}
                onChange={(e) => handleInputChange(service.id, 'servicename', e.target.value)}
                placeholder="Enter a name for your service"
                className={fieldClass(errors[`service-${service.id}-servicename`])}
              />
              {errors[`service-${service.id}-servicename`] && (
                <p className="text-red-600 text-sm mt-2 font-medium">{errors[`service-${service.id}-servicename`]}</p>
              )}
            </div>

            {/* Category Selection */}
            <div className="mb-6">
              <label className={labelClass}>
                Select Category *
              </label>
              <select
                value={service.category}
                onChange={(e) => handleCategoryChange(service.id, e.target.value)}
                className={fieldClass(errors[`service-${service.id}-category`])}
              >
                <option value="">Choose a category</option>
                {Object.keys(RULES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors[`service-${service.id}-category`] && (
                <p className="text-red-600 text-sm mt-2 font-medium">{errors[`service-${service.id}-category`]}</p>
              )}
            </div>

            {/* Sub-categories */}
            {service.category && (
              <div className="mb-6">
                <label className={labelClass}>
                  Select Sub-Categories *
                </label>
                <div className="flex flex-wrap gap-3">
                  {(RULES[service.category]?.subCategories || []).map(subCat => (
                    <button
                      key={subCat}
                      type="button"
                      onClick={() => handleSubCategoryToggle(service.id, subCat)}
                      className={chipClass(service.subCategories.includes(subCat), false)}
                    >
                      {subCat}
                    </button>
                  ))}
                </div>
                {errors[`service-${service.id}-subCategories`] && (
                  <p className="text-red-600 text-sm mt-2 font-medium">{errors[`service-${service.id}-subCategories`]}</p>
                )}
              </div>
            )}

            {/* Keywords */}
            {service.category && (RULES[service.category]?.keywords?.length || 0) > 0 && (
              <div className="mb-6">
                <label className={labelClass}>
                  Select Keywords/Specializations *
                </label>
                <div className="flex flex-wrap gap-2">
                  {(RULES[service.category]?.keywords || []).map(keyword => (
                    <button
                      key={keyword}
                      type="button"
                      onClick={() => handleKeywordToggle(service.id, keyword)}
                      className={chipClass(service.keywords.includes(keyword))}
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
                {errors[`service-${service.id}-keywords`] && (
                  <p className="text-red-600 text-sm mt-2 font-medium">{errors[`service-${service.id}-keywords`]}</p>
                )}
              </div>
            )}

            {/* Bio */}
            <div className="mb-6">
              <label className={labelClass}>
                Service Description *
              </label>
              <textarea
                value={service.bio}
                onChange={(e) => handleInputChange(service.id, 'bio', e.target.value)}
                placeholder="Tell us about your service..."
                rows="4"
                className={`${fieldClass(errors[`service-${service.id}-bio`])} resize-none`}
              />
              {errors[`service-${service.id}-bio`] && (
                <p className="text-red-600 text-sm mt-2 font-medium">{errors[`service-${service.id}-bio`]}</p>
              )}
            </div>

            {/* Experience */}
            <div className="mb-6">
              <label className={labelClass}>
                Experience (in years){' '}
                <span className="text-[var(--text-secondary)]/70">(optional)</span>
              </label>
              <input
                type="number"
                value={service.experience}
                onChange={(e) => handleInputChange(service.id, 'experience', e.target.value)}
                placeholder="e.g., 5"
                min="0"
                className={fieldClass(errors[`service-${service.id}-experience`])}
              />
              {errors[`service-${service.id}-experience`] && (
                <p className="text-red-600 text-sm mt-2 font-medium">{errors[`service-${service.id}-experience`]}</p>
              )}
            </div>

            {/* Price */}
            {/* <div className="mb-6">
              <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
                Price (in ₹) *
              </label>
              <input
                type="number"
                value={service.price}
                onChange={(e) => handleInputChange(service.id, 'price', e.target.value)}
                placeholder="e.g., 500"
                min="0"
                step="0.01"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all font-medium ${
                  errors[`service-${service.id}-price`] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-400'
                }`}
              />
              {errors[`service-${service.id}-price`] && (
                <p className="text-red-600 text-sm mt-2 font-medium">{errors[`service-${service.id}-price`]}</p>
              )}
            </div> */}

            {/* Image Upload */}
            <div className="mb-6">
              <label className={labelClass}>
                Upload Work Images{' '}
                <span className="text-[var(--text-secondary)]/70">(optional)</span>
              </label>
              <p className="mb-3 text-sm text-[var(--text-secondary)]">
                Max size: <span className="font-semibold">5 images upto 10 MB each</span> (Images: PNG/JPG/JPEG)
              </p>
              <div className={uploadZoneClass(errors[`service-${service.id}-images`])}>
                <input
                  type="file"
                  id={`images-${service.id}`}
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(service.id, e)}
                  className="hidden"
                />
                <label
                  htmlFor={`images-${service.id}`}
                  className="flex cursor-pointer flex-col items-center"
                >
                  <Upload className="mb-3 text-[var(--purple-primary)]" size={40} />
                  <span className="mb-1 text-base font-semibold text-[var(--text-primary)]">Click to upload images</span>
                  <span className="text-sm text-[var(--text-secondary)]">PNG, JPG up to 10MB</span>
                </label>
              </div>
              {errors[`service-${service.id}-images`] && (
                <p className="text-red-600 text-sm mt-2 font-medium">{errors[`service-${service.id}-images`]}</p>
              )}

              {/* Image Preview */}
              {service.imagePreviews.length > 0 && (
                <div className="mt-6 columns-2 md:columns-4 gap-4 [column-fill:_balance]">
                  {service.imagePreviews.map((img, imgIndex) => (
                    <div
                      key={imgIndex}
                      className="group relative mb-4 break-inside-avoid overflow-hidden rounded-xl border border-purple-100/50"
                    >
                      <img
                        src={img}
                        alt={`Upload ${imgIndex + 1}`}
                        className="block h-auto w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(service.id, imgIndex)}
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white opacity-0 shadow-md transition-all group-hover:opacity-100 hover:bg-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PDF Upload */}
            <div className="mb-6">
              <label className={labelClass}>
                Upload PDF <span className="text-[var(--text-secondary)]/70">(optional)</span>
              </label>
              <p className="mb-3 text-sm text-[var(--text-secondary)]">
                Max size: <span className="font-semibold">upload only 1 file upto 20MB</span> (Documents: PDF)
              </p>
              <div className={uploadZoneClass(errors[`service-${service.id}-pdfs`])}>
                <input
                  type="file"
                  id={`pdfs-${service.id}`}
                  multiple
                  accept="application/pdf"
                  onChange={(e) => handlePDFUpload(service.id, e)}
                  className="hidden"
                />
                <label
                  htmlFor={`pdfs-${service.id}`}
                  className="flex cursor-pointer flex-col items-center"
                >
                  <FileText className="mb-3 text-[var(--purple-primary)]" size={40} />
                  <span className="mb-1 text-base font-semibold text-[var(--text-primary)]">Click to upload PDF</span>
                  <span className="text-sm text-[var(--text-secondary)]">PDF files up to 20MB</span>
                </label>
              </div>
              {/* {errors[`service-${service.id}-pdfs`] && (
                <p className="text-red-600 text-sm mt-2 font-medium">{errors[`service-${service.id}-pdfs`]}</p>
              )} */}

              {/* PDF Preview */}
              {service.pdfPreviews && service.pdfPreviews.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-6">
                  {service.pdfPreviews.map((pdf, pdfIndex) => (
                    <div key={pdfIndex} className="group relative flex min-w-[200px] items-center gap-3 rounded-xl border border-purple-100/60 bg-purple-50/30 p-4">
                      <FileText className="text-[var(--purple-primary)]" size={24} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">{pdf.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePDF(service.id, pdfIndex)}
                        className="rounded-full bg-red-500 p-1.5 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))} 
        {/* Add Another Service Button */}
        <button type="button" onClick={addNewService} className={`${btnDashed} group`}>
          <Plus size={24} className="transition-transform group-hover:rotate-90" />
          Add Another Service
        </button>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button type="submit" disabled={isSubmitting} className={btnPrimary}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Submitting...
              </span>
            ) : (
              'Submit Registration'
            )}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default BecomeProvider;