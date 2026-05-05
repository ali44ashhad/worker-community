import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import TopCategoryCard from "./TopCategoryCard";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { getActiveCategories } from "../../features/adminSlice";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
axios.defaults.withCredentials = true;

const TopCategory = () => {
    const dispatch = useDispatch();
    const { activeCategories } = useSelector((state) => state.admin);
    const [topCategories, setTopCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const scrollContainerRef = useRef(null);

    // DB-driven metadata lives in Category documents; we derive it from `activeCategories`.

    useEffect(() => {
        if (!activeCategories || activeCategories.length === 0) {
            dispatch(getActiveCategories());
        }
    }, [dispatch, activeCategories?.length]);

    const META = useMemo(() => {
        const meta = {};
        (activeCategories || []).forEach((c) => {
            meta[c.name] = {
                description: c.description || "",
                subCategories: c.subCategories || [],
                keywords: c.keywords || [],
                image: c.image || { url: "", public_id: "" },
            };
        });
        return meta;
    }, [activeCategories]);

    useEffect(() => {
        const buildFallbackFromDb = () =>
            (activeCategories || []).slice(0, 6).map((c) => ({
                category: c.name,
                description: c.description || "",
                subCategories: c.subCategories || [],
                keywords: c.keywords || [],
                image: c.image?.url || "",
                averageRating: 0,
                reviewCount: 0,
                serviceCount: 0,
            }));

        const fetchTopCategories = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get(`${API_URL}/api/comments/top-categories?limit=6`);

                if (res.data?.success && Array.isArray(res.data.categories) && res.data.categories.length > 0) {
                    const categoriesWithMetadata = res.data.categories.map((cat) => {
                        const metadata = META[cat.category] || {};
                        return {
                            ...cat,
                            description: metadata.description || "",
                            subCategories: metadata.subCategories || [],
                            keywords: metadata.keywords || [],
                            image: metadata.image?.url || "",
                        };
                    });
                    setTopCategories(categoriesWithMetadata);
                    return;
                }

                // If API has no data, fallback to DB categories (not hardcoded).
                setTopCategories(buildFallbackFromDb());
            } catch (error) {
                console.error("Failed to fetch top categories:", error);
                setTopCategories(buildFallbackFromDb());
            } finally {
                setIsLoading(false);
            }
        };

        // Fetch once DB categories are available, so fallback isn't empty.
        if (!activeCategories || activeCategories.length === 0) return;
        fetchTopCategories();
    }, [activeCategories, META]);

    // Preload category images to prevent scroll interruptions
    useEffect(() => {
        if (topCategories.length > 0) {
            topCategories.forEach((categoryData, idx) => {
                if (categoryData.image && categoryData.image !== 'DefaultCategoryImage') {
                    const img = new Image();
                    img.src = categoryData.image;
                    // Prioritize first few images
                    if (idx < 3) {
                        img.fetchPriority = 'high';
                    }
                }
            });
        }
    }, [topCategories]);

    if (isLoading) {
        return (
            <section className="w-full max-w-[1350px] mx-auto px-4 pb-4 pt-6 md:py-16">
                <div className="text-center">
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4'></div>
                    <p className='text-xl font-semibold'>Loading categories...</p>
                </div>
            </section>
        );
    }

    if (topCategories.length === 0) return null;

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
        }
    };

    return (
        <section className="w-full max-w-[1350px] mx-auto px-4 pb-6 pt-6 md:pt-16 md:pb-8">
            {/* Header */}
            <div className="mb-3">
                {/* <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500 mb-3">
                    Top Categories
                </h1> */}
                 <h2 className="text-4xl md:text-5xl font-bold text-black mb-3">Top Categories</h2>
                <div className="flex items-start justify-between gap-4">
                    <p className="text-gray-600 max-w-2xl flex-1">
                        Discover the diverse talents within our community! Explore some of the most popular services offered by your skilled neighbors, ready to lend a hand.
                    </p>
                    
                    {/* Carousel Navigation Buttons - Top Right */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={scrollLeft}
                            className="w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                            aria-label="Scroll left"
                        >
                            <HiChevronLeft className="w-6 h-6 text-gray-700" />
                        </button>
                        <button
                            onClick={scrollRight}
                            className="w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                            aria-label="Scroll right"
                        >
                            <HiChevronRight className="w-6 h-6 text-gray-700" />
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Scrollable Categories Container */}
            <div 
                ref={scrollContainerRef}
                className="flex gap-8 overflow-x-auto scrollbar-hide pb-4"
                style={{ 
                    scrollbarWidth: 'none', 
                    msOverflowStyle: 'none', 
                    overflowY: 'visible',
                    WebkitOverflowScrolling: 'touch',
                    transform: 'translateZ(0)',
                    WebkitTransform: 'translateZ(0)',
                    willChange: 'scroll-position'
                }}
            >
                {topCategories.map((categoryData) => (
                    <div key={categoryData.category} className="flex-shrink-0 w-full sm:w-80 lg:w-96 pt-3">
                        <TopCategoryCard
                            category={categoryData.category}
                            data={categoryData}
                            image={categoryData.image}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TopCategory;
