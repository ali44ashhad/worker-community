import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProviders } from '../../features/providerSlice';
import TopServiceCard from '../service/TopServiceCard';

const TopServices = () => {
  const dispatch = useDispatch();
  const { allProviders, isFetchingAll } = useSelector((state) => state.provider);

  useEffect(() => {
    if (!allProviders || allProviders.length === 0) {
      dispatch(getAllProviders());
    }
  }, [dispatch, allProviders]);

  const topSixServices = useMemo(() => {
    const services = [];
    for (const provider of allProviders || []) {
      const offerings = provider?.serviceOfferings || [];
      for (const offering of offerings) {
        services.push({ ...offering, provider });
      }
    }
    return services.slice(0, 6);
  }, [allProviders]);

  if (isFetchingAll && (!allProviders || allProviders.length === 0)) {
    return (
      <section className="w-full max-w-[1350px] mx-auto px-4 py-16">
        <div className="text-center">
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4'></div>
          <p className='text-xl font-semibold'>Loading services...</p>
        </div>
      </section>
    );
  }

  if (topSixServices.length === 0) return null;

  return (
    <section className="w-full max-w-[1350px] mx-auto px-4 py-16">
      <div className="mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-black text-center mb-3">Top Services</h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto">
          Explore a curated selection of services from our community, handpicked to get you started.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {topSixServices.map((service) => (
          <TopServiceCard key={service._id} service={service} />
        ))}
      </div>
    </section>
  );
}

export default TopServices