import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllProviders } from '../features/providerSlice';
import { useEffect } from 'react';

const makeTestimonial = (service, providerName) => {
  return `"I had a wonderful experience with the ${service.serviceCategory || 'service'} by ${providerName}. Highly professional and exceeded my expectations!"`;
};

const TestimonialCard = ({ card }) => (
  <div className="p-3 sm:p-4 rounded-lg mx-2 sm:mx-4 shadow hover:shadow-lg transition-all duration-200 w-72 sm:w-80 shrink-0 bg-white border-2 border-black">
    <div className="flex gap-2 items-center">
      <img className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-black bg-gray-100 object-cover" src={card.image} alt={card.providerName} />
      <div className="flex flex-col">
        <div className="font-medium text-base text-black leading-5">{card.providerName}</div>
        <div className="text-xs text-gray-500">{card.serviceCategory}</div>
      </div>
    </div>
    <p className="text-xs sm:text-sm py-3 sm:py-4 text-black leading-relaxed line-clamp-4">
      {card.testimonial}
    </p>
  </div>
);

const Testimonial = () => {
  const dispatch = useDispatch();
  const { allProviders } = useSelector(s => s.provider);

  useEffect(() => {
    if (!allProviders || allProviders.length === 0) {
      dispatch(getAllProviders());
    }
  }, [dispatch, allProviders]);

  const testimonialCards = useMemo(() => {
    const services = [];
    for (const provider of allProviders || []) {
      const offerings = provider?.serviceOfferings || [];
      for (const offering of offerings) {
        services.push({ ...offering, provider });
      }
    }
    // Only first 6
    return services.slice(0, 6).map(service => {
      const providerName = service?.provider?.user?.name || 'Service Provider';
      const testimonial = makeTestimonial(service, providerName);
      let image = service?.portfolioImages?.[0]?.url;
      // fallback to provider profile image
      if (!image) image = service?.provider?.user?.profileImage;
      // fallback to placeholder
      if (!image) image = 'https://dummyimage.com/200x200/000/fff&text=Service';
      return {
        providerName,
        serviceCategory: service?.serviceCategory,
        testimonial,
        image,
      };
    });
  }, [allProviders]);

  return (
    <>
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .marquee-inner {
          animation: marqueeScroll 25s linear infinite;
        }
        .marquee-reverse {
          animation-direction: reverse;
        }
      `}</style>
      <div className="w-full max-w-[1350px] mx-auto bg-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 min-h-[40vh] mt-16">
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-10 text-black">What Our Customers Say</h2>
        {/* First Row */}
        <div className="marquee-row w-full mx-auto max-w-full overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full w-10 sm:w-20 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent"></div>
          <div className="marquee-inner flex transform-gpu min-w-[200%] py-3 sm:py-5">
            {[...testimonialCards, ...testimonialCards].map((card, index) => (
              <TestimonialCard key={`first-${index}`} card={card} />
            ))}
          </div>
          <div className="absolute right-0 top-0 h-full w-10 sm:w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent"></div>
        </div>
        {/* Second Row (Reverse) */}
        <div className="marquee-row w-full mx-auto max-w-[1200px] overflow-hidden relative mt-4">
          <div className="absolute left-0 top-0 h-full w-10 sm:w-20 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent"></div>
          <div className="marquee-inner marquee-reverse flex transform-gpu min-w-[200%] py-3 sm:py-5">
            {[...testimonialCards, ...testimonialCards].map((card, index) => (
              <TestimonialCard key={`second-${index}`} card={card} />
            ))}
          </div>
          <div className="absolute right-0 top-0 h-full w-10 sm:w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent"></div>
        </div>
      </div>
    </>
  );
};

export default Testimonial;