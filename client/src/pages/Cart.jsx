import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllProviders } from '../features/providerSlice'
import TopServiceCard from '../components/service/TopServiceCard'
import { fetchWishlist } from '../features/wishlistSlice'

const Cart = () => {
  const dispatch = useDispatch();
  const { allProviders, isFetchingAll } = useSelector((s) => s.provider);
  const wishlistIds = useSelector((s) => s.wishlist.ids);
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    if (allProviders.length === 0) dispatch(getAllProviders());
  }, [dispatch, allProviders.length]);

  useEffect(() => {
    if (user) dispatch(fetchWishlist());
  }, [dispatch, user]);

  const wishlistServices = useMemo(() => {
    const out = [];
    for (const provider of allProviders || []) {
      for (const offering of provider?.serviceOfferings || []) {
        if (wishlistIds.includes(offering._id)) {
          out.push({ ...offering, provider });
        }
      }
    }
    return out;
  }, [allProviders, wishlistIds]);

  if (!user) {
    return (
      <div className='mt-20 mx-auto max-w-[1350px] px-4'>
        <h1 className='text-3xl font-bold mb-2'>Wishlist</h1>
        <p className='text-gray-700'>Please login to view your wishlist.</p>
      </div>
    );
  }

  return (
    <div className='mt-24 mx-auto max-w-[1350px] px-4'>
      <h1 className='text-3xl font-bold mb-6'>Your Wishlist</h1>
      {isFetchingAll ? (
        <p className='text-gray-700'>Loading...</p>
      ) : wishlistServices.length === 0 ? (
        <p className='text-gray-700'>No services in your wishlist yet.</p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {wishlistServices.map((s) => (
            <TopServiceCard key={s._id} service={s} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Cart