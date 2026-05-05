import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';
import { getActiveCategories } from '../features/adminSlice';
import { slugifyCategoryName } from '../utils/slug';

const AllCategory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeCategories } = useSelector((state) => state.admin);

  useEffect(() => {
    if (!activeCategories || activeCategories.length === 0) {
      dispatch(getActiveCategories());
    }
  }, [dispatch, activeCategories?.length]);

  const RULES = useMemo(() => {
    const rules = {};
    (activeCategories || []).forEach((c) => {
      rules[c.name] = {
        description: c.description || '',
        subCategories: c.subCategories || [],
        keywords: c.keywords || [],
        image: c.image || { url: '', public_id: '' },
      };
    });
    return rules;
  }, [activeCategories]);

  const categories = Object.entries(RULES);

  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${slugifyCategoryName(categoryName)}`);
  };

  return (
    <div className='min-h-screen bg-gray-50 pb-16'>
      <div className='max-w-[1350px] mx-auto px-4 pt-24'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl md:text-5xl font-bold text-black mb-4'>
            All Categories
          </h1>
          <p className='text-gray-600 text-center max-w-3xl mx-auto text-base md:text-lg'>
            Explore all available service categories. Each category offers a variety of specialized services from talented community providers.
          </p>
        </div>

        {/* Categories Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {categories.map(([categoryName, categoryData]) => {
            const imagePath = categoryData?.image?.url || '';
            const displayedKeywords = categoryData.keywords.slice(0, 5);

            return (
              <div
                key={categoryName}
                onClick={() => handleCategoryClick(categoryName)}
                className='bg-white border border-gray-300 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer'
              >
                {/* Image */}
                <div className='mb-4 flex justify-center'>
                  <div className='w-full h-48 border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center'>
                    {imagePath ? (
                      <img
                        src={imagePath}
                        alt={categoryName}
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className='w-full h-full flex items-center justify-center text-black font-bold text-lg'
                      style={{ display: imagePath ? 'none' : 'flex' }}
                    >
                      {categoryName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Category Name */}
                <h3 className='text-2xl font-bold text-black text-center mb-3 group-hover:text-gray-700 transition-colors'>
                  {categoryName}
                </h3>

                {/* Description */}
                <div className='text-gray-600 text-center text-sm mb-4 min-h-[2.5rem] flex items-center justify-center'>
                  <p className='line-clamp-2'>
                    {categoryData.description}
                  </p>
                </div>

                {/* Keywords */}
                <div className='flex flex-wrap gap-2 justify-center mb-4'>
                  {displayedKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className='px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full border border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition-all'
                    >
                      {keyword}
                    </span>
                  ))}
                  {categoryData.keywords.length > 5 && (
                    <span className='px-3 py-1 bg-white text-gray-700 text-xs font-semibold rounded-full border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all'>
                      +{categoryData.keywords.length - 5} more
                    </span>
                  )}
                </div>

                {/* View Services Button */}
                <div className='mt-4 flex items-center justify-center gap-2 text-black group-hover:text-gray-700 transition-colors'>
                  <span className='font-semibold text-sm'>View Services</span>
                  <HiArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className='mt-12 text-center'>
          <div className='bg-white border border-gray-300 rounded-xl p-6 max-w-2xl mx-auto'>
            <p className='text-gray-600 text-sm'>
              Can't find what you're looking for? Try browsing by{' '}
              <button
                onClick={() => navigate('/service')}
                className='text-black font-semibold underline hover:text-gray-700 transition-colors'
              >
                all services
              </button>
              {' '}or{' '}
              <button
                onClick={() => navigate('/provider')}
                className='text-black font-semibold underline hover:text-gray-700 transition-colors'
              >
                providers
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllCategory;
