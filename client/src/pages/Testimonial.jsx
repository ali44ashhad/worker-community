// import React, { useMemo } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { getAllProviders } from '../features/providerSlice';
// import { useEffect } from 'react';

// const makeTestimonial = (service, providerName) => {
//   return `"I had a wonderful experience with the ${service.serviceCategory || 'service'} by ${providerName}. Highly professional and exceeded my expectations!"`;
// };

// const TestimonialCard = ({ card }) => (
//   <div className="p-3 sm:p-4 rounded-lg mx-2 sm:mx-4 shadow hover:shadow-lg transition-all duration-200 w-72 sm:w-80 shrink-0 bg-white border border-gray-300">
//     <div className="flex gap-2 items-center">
//       <img className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-300 bg-gray-50 object-cover" src={card.image} alt={card.providerName} />
//       <div className="flex flex-col">
//         <div className="font-medium text-base text-black leading-5">{card.providerName}</div>
//         <div className="text-xs text-gray-500">{card.serviceCategory}</div>
//       </div>
//     </div>
//     <p className="text-xs sm:text-sm py-3 sm:py-4 text-black leading-relaxed line-clamp-4">
//       {card.testimonial}
//     </p>
//   </div>
// );

// const Testimonial = () => {
//   const dispatch = useDispatch();
//   const { allProviders } = useSelector(s => s.provider);

//   useEffect(() => {
//     if (!allProviders || allProviders.length === 0) {
//       dispatch(getAllProviders());
//     }
//   }, [dispatch, allProviders.length]);

//   const testimonialCards = useMemo(() => {
//     const services = [];
//     for (const provider of allProviders || []) {
//       const offerings = provider?.serviceOfferings || [];
//       for (const offering of offerings) {
//         services.push({ ...offering, provider });
//       }
//     }
//     // Only first 6
//     return services.slice(0, 6).map(service => {
//       const providerName = service?.provider?.user?.name || 'Service Provider';
//       const testimonial = makeTestimonial(service, providerName);
//       let image = service?.portfolioImages?.[0]?.url;
//       // fallback to provider profile image
//       if (!image) image = service?.provider?.user?.profileImage;
//       // fallback to placeholder
//       if (!image) image = 'https://dummyimage.com/200x200/000/fff&text=Service';
//       return {
//         providerName,
//         serviceCategory: service?.serviceCategory,
//         testimonial,
//         image,
//       };
//     });
//   }, [allProviders]);

//   return (
//     <>
//       <style>{`
//         @keyframes marqueeScroll {
//           0% { transform: translateX(0%); }
//           100% { transform: translateX(-50%); }
//         }
//         .marquee-inner {
//           animation: marqueeScroll 25s linear infinite;
//         }
//         .marquee-reverse {
//           animation-direction: reverse;
//         }
//       `}</style>
//       <div className="w-full max-w-[1350px] mx-auto bg-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 min-h-[40vh] mt-16">
//         <h2 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-10 text-black">What Our Customers Say</h2>
//         {/* First Row */}
//         <div className="marquee-row w-full mx-auto max-w-full overflow-hidden relative">
//           <div className="absolute left-0 top-0 h-full w-10 sm:w-20 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent"></div>
//           <div className="marquee-inner flex transform-gpu min-w-[200%] py-3 sm:py-5">
//             {[...testimonialCards, ...testimonialCards].map((card, index) => (
//               <TestimonialCard key={`first-${index}`} card={card} />
//             ))}
//           </div>
//           <div className="absolute right-0 top-0 h-full w-10 sm:w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent"></div>
//         </div>
//         {/* Second Row (Reverse) */}
//         <div className="marquee-row w-full mx-auto max-w-[1200px] overflow-hidden relative mt-4">
//           <div className="absolute left-0 top-0 h-full w-10 sm:w-20 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent"></div>
//           <div className="marquee-inner marquee-reverse flex transform-gpu min-w-[200%] py-3 sm:py-5">
//             {[...testimonialCards, ...testimonialCards].map((card, index) => (
//               <TestimonialCard key={`second-${index}`} card={card} />
//             ))}
//           </div>
//           <div className="absolute right-0 top-0 h-full w-10 sm:w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent"></div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Testimonial;

import React, { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllProviders } from '../features/providerSlice';
import { motion } from 'framer-motion';

const makeTestimonial = (service, providerName) =>
  `"I had a wonderful experience with the ${service?.serviceCategory || 'service'} by ${providerName}. Highly professional and exceeded my expectations!"`;

const TestimonialCard = ({ card }) => (
  <motion.div
    className="p-3 sm:p-4 rounded-2xl mx-2 sm:mx-4 shadow-sm hover:shadow-lg transition-all duration-200 w-72 sm:w-80 shrink-0 bg-white/70 border border-gray-200"
    whileHover={{ y: -6 }}
  >
    <div className="flex gap-3 items-center">
      <img
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white bg-gray-50 object-cover shadow-sm"
        src={card.image}
        alt={card.providerName}
      />
      <div className="flex flex-col">
        <div className="font-semibold text-sm text-gray-900">{card.providerName}</div>
        <div className="text-xs text-gray-500">{card.serviceCategory}</div>
      </div>
    </div>
    <p className="text-xs sm:text-sm py-3 sm:py-4 text-gray-800 leading-relaxed line-clamp-4">{card.testimonial}</p>
  </motion.div>
);

const Testimonial = () => {
  const dispatch = useDispatch();
  const { allProviders } = useSelector((s) => s.provider || {});

  useEffect(() => {
    if (!allProviders || allProviders.length === 0) dispatch(getAllProviders());
  }, [dispatch, allProviders?.length]);

  const testimonialCards = useMemo(() => {
    const services = [];
    for (const provider of allProviders || []) {
      const offerings = provider?.serviceOfferings || [];
      for (const offering of offerings) services.push({ ...offering, provider });
    }

    return services.slice(0, 6).map((service) => {
      const providerName = service?.provider?.user?.name || 'Service Provider';
      const testimonial = makeTestimonial(service, providerName);
      let image = service?.portfolioImages?.[0]?.url;
      if (!image) image = service?.provider?.user?.profileImage;
      if (!image) image = 'https://dummyimage.com/200x200/000/fff&text=Service';
      return {
        providerName,
        serviceCategory: service?.serviceCategory,
        testimonial,
        image,
      };
    });
  }, [allProviders]);

  if (!testimonialCards || testimonialCards.length === 0) return null;

  return (
    <section className="w-full relative mt-16">
      {/* subtle glass blobs to tie into theme */}
      <div className="pointer-events-none absolute -top-12 left-6 w-64 h-64 rounded-full blur-3xl bg-gradient-to-br from-indigo-50 via-pink-50 to-purple-50 opacity-30 transform -rotate-12" />
      <div className="pointer-events-none absolute -bottom-12 right-6 w-56 h-56 rounded-full blur-2xl bg-gradient-to-br from-pink-50 via-indigo-50 to-yellow-50 opacity-20 transform rotate-6" />

      <div className="max-w-[1370px] mx-auto px-6 md:px-8 py-8 sm:py-12 bg-transparent">
        <motion.h2
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 text-gray-900"
        >
          What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">Customers Say</span>
        </motion.h2>

        <style>{`
          @keyframes marqueeScroll { 0% { transform: translateX(0%);} 100% { transform: translateX(-50%);} }
          .marquee-inner { animation: marqueeScroll 24s linear infinite; }
          .marquee-reverse { animation-direction: reverse; }
        `}</style>

        {/* Row 1 */}
        <div className="marquee-row w-full mx-auto max-w-full overflow-hidden relative mb-6">
          <div className="absolute left-0 top-0 h-full w-16 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
          <div className="marquee-inner flex min-w-[200%] py-3 sm:py-5">
            {[...testimonialCards, ...testimonialCards].map((card, idx) => (
              <TestimonialCard key={`t1-${idx}`} card={card} />
            ))}
          </div>
          <div className="absolute right-0 top-0 h-full w-16 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
        </div>

        {/* Row 2 - reverse */}
        <div className="marquee-row w-full mx-auto max-w-full overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full w-16 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
          <div className="marquee-inner marquee-reverse flex min-w-[200%] py-3 sm:py-5">
            {[...testimonialCards, ...testimonialCards].map((card, idx) => (
              <TestimonialCard key={`t2-${idx}`} card={card} />
            ))}
          </div>
          <div className="absolute right-0 top-0 h-full w-16 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
