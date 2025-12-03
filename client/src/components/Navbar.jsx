// import { useState, useEffect } from 'react';
// import {
//   HiOutlineMenu,
//   HiOutlineX,
//   HiOutlineSearch,
// } from 'react-icons/hi';
// import { Link, useLocation } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { logoutUser } from '../features/authSlice';
// import { toast } from 'react-hot-toast';
// import { FaCartShopping } from "react-icons/fa6";
// import { motion, AnimatePresence } from 'framer-motion';
// import SearchDropdown from './SearchDropdown';

// const Navbar = () => {
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isSearchOpen, setIsSearchOpen] = useState(false);
//   const user = useSelector((state) => state.auth.user);
//   const wishlistIds = useSelector((s) => s.wishlist.ids);

//   // Scroll to top on route change
//   useEffect(() => {
//     window.scrollTo(0, 0);
//     setIsSearchOpen(false); // Close search dropdown on route change
//   }, [location.pathname]);

//   // Prevent body scroll when mobile menu is open
//   useEffect(() => {
//     document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [isMobileMenuOpen]);

//   const closeMenu = () => setIsMobileMenuOpen(false);

//   const handleLogout = async () => {
//     try {
//       await dispatch(logoutUser()).unwrap();
//       toast.success('Logged out successfully');
//       closeMenu();
//     } catch (error) {
//       toast.error(error || 'Logout failed');
//     }
//   };

//   const navLinks = [
//     { to: '/', text: 'Home' },
//     { to: '/about', text: 'About' },
//     { to: '/testimonials', text: 'Testimonials' },
//     { to: '/faq', text: 'FAQ' },
//     { to: '/contact', text: 'Contact' },
//     { to: '/service', text: 'Service' },
//     { to: '/category', text: 'Categories' },
//   ];

//   return (
//     // FIX 1: Wrap entire component in a React Fragment
//     <>
//       <motion.header
//         className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-xl z-50 h-20 shadow-sm border-b border-gray-100"
//         initial={{ y: -100 }}
//         animate={{ y: 0 }}
//         transition={{ duration: 0.5, ease: "easeOut" }}
//       >
//         <nav className="max-w-[1370px] mx-auto px-6 sm:px-8 lg:px-10 h-full flex items-center justify-between relative">
//           {/* Left Side: Logo */}
//           <motion.div
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             <Link
//               to="/"
//               // **FIX 1: Changed `min-w-[300px]` to `xl:min-w-[300px]` to fix mobile overflow**
//               className={`text-2xl font-bold ${user ? "xl:min-w-[300px]" : ""} text-gray-900 flex items-center gap-1 tracking-tight`}
//             >
//               {user ? `Hi ${user.name},` : "Commun"}
//             </Link>
//           </motion.div>

//           {/* Centered Nav Links */}
//           {!user && (
//             <div className="hidden xl:flex flex-1 justify-center ml-24 items-center space-x-1">
//               {navLinks.map((link, index) => (
//                 <motion.div
//                   key={link.to}
//                   initial={{ opacity: 0, y: -20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.3, delay: index * 0.05 }}
//                 >
//                   <Link
//                     to={link.to}
//                     className="relative px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-300 tracking-wide text-sm font-medium rounded-xl hover:bg-gray-50"
//                   >
//                     {link.text}
//                     {location.pathname === link.to && (
//                       <motion.div
//                         className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full"
//                         layoutId="navbar-indicator"
//                         transition={{ duration: 0.3 }}
//                       />
//                     )}
//                   </Link>
//                 </motion.div>
//               ))}
//             </div>
//           )}

//           {/* Right Side */}
//           <div className="hidden xl:flex items-center gap-4">
//             {/* Search Input */}
//             <motion.div
//               className="relative"
//               whileHover={{ scale: 1.02 }}
//             >
//               <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//               <input
//                 type="text"
//                 placeholder="Search services..."
//                 onClick={() => setIsSearchOpen(true)}
//                 className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-10 pr-4 py-2.5 w-64 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300 cursor-pointer hover:bg-gray-100"
//                 readOnly
//               />
//               <AnimatePresence>
//                 {isSearchOpen && (
//                   <SearchDropdown
//                     isOpen={isSearchOpen}
//                     onClose={() => setIsSearchOpen(false)}
//                   />
//                 )}
//               </AnimatePresence>
//             </motion.div>

//             {!user ? (
//               <motion.div
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <Link
//                   to="/login"
//                   className="px-6 py-2.5 bg-gray-900 text-white rounded-xl transition-all duration-300 shadow-lg font-semibold text-sm hover:bg-gray-800 hover:shadow-xl"
//                 >
//                   Login
//                 </Link>
//               </motion.div>
//             ) : (
//               <div className="flex items-center gap-3">
//                 {user && user.role === 'customer' && (
//                   <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                     <Link
//                       to="/become-provider"
//                       className="px-5 py-2.5 bg-gray-100 text-gray-900 rounded-xl transition-all duration-300 font-semibold text-sm hover:bg-gray-200"
//                     >
//                       Become Provider
//                     </Link>
//                   </motion.div>
//                 )}
//                 {user && user.role === 'provider' && (
//                   <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                     <Link
//                       to="/update-services"
//                       className="px-5 py-2.5 bg-gray-100 text-gray-900 rounded-xl transition-all duration-300 font-semibold text-sm hover:bg-gray-200"
//                     >
//                       Update Services
//                     </Link>
//                   </motion.div>
//                 )}
//                 {user && user.role === 'admin' && (
//                   <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                     <Link
//                       to="/admin"
//                       className="px-5 py-2.5 bg-gray-100 text-gray-900 rounded-xl transition-all duration-300 font-semibold text-sm hover:bg-gray-200"
//                     >
//                       Admin Dashboard
//                     </Link>
//                   </motion.div>
//                 )}

//                 {user && (
//                   <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                     <Link
//                       to={`/update-profile/${user._id}`}
//                       className="px-5 py-2.5 bg-gray-100 text-gray-900 rounded-xl transition-all duration-300 font-semibold text-sm hover:bg-gray-200"
//                     >
//                       Update Profile
//                     </Link>
//                   </motion.div>
//                 )}

//                 <motion.button
//                   onClick={handleLogout}
//                   className="px-5 py-2.5 bg-gray-100 text-gray-900 rounded-xl transition-all duration-300 font-semibold text-sm hover:bg-gray-200"
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   Logout
//                 </motion.button>

//                 {/* Cart Icon */}
//                 {user && (
//                   <motion.div
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                   >
//                     <Link to={`/cart/${user._id}`} className="relative">
//                       <FaCartShopping size={24} className="text-gray-700" />
//                       {wishlistIds?.length > 0 && (
//                         <motion.span
//                           className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
//                           initial={{ scale: 0 }}
//                           animate={{ scale: 1 }}
//                           transition={{ type: "spring", stiffness: 500 }}
//                         >
//                           {wishlistIds?.length || 0}
//                         </motion.span>
//                       )}
//                     </Link>
//                   </motion.div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Mobile Menu Button */}
//           <div className="flex items-center gap-4 xl:hidden">
//             {/* Cart icon for mobile */}
//             {user && (
//               <motion.div
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.9 }}
//               >
//                 <Link to={`/cart/${user._id}`} className="relative ">
//                   <FaCartShopping size={24} className="text-gray-700" />
//                   {wishlistIds?.length > 0 && (
//                     <motion.span
//                       className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                     >
//                       {wishlistIds?.length || 0}
//                     </motion.span>
//                   )}
//                 </Link>
//               </motion.div>
//             )}

//             <motion.button
//               className="text-gray-700 relative  focus:outline-none"
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//               whileTap={{ scale: 0.9 }}
//             >
//               {isMobileMenuOpen ? <HiOutlineX size={28} /> : <HiOutlineMenu size={28} />}
//             </motion.button>
//           </div>
//         </nav>
//       </motion.header>

//       {/* FIX 2: The Backdrop and Menu <AnimatePresence> blocks have been
//         MOVED OUTSIDE of the <motion.header> to prevent the
//         stacking context issue.
//       */}

//       {/* Mobile Menu Backdrop */}
//       <AnimatePresence>
//         {isMobileMenuOpen && (
//           <motion.div
//             // FIX 3: Increased z-index from z-40 to z-[51] to be ON TOP of the header
//             className="xl:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[51]"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={closeMenu}
//           />
//         )}
//       </AnimatePresence>

//       {/* Slide-in Mobile Menu */}
//       <AnimatePresence>
//         {isMobileMenuOpen && (
//           <motion.div
//             // FIX 4: Increased z-index from z-50 to z-[52] to be ON TOP of the backdrop
//             className="xl:hidden fixed top-0 right-0 bottom-0 w-[85%] bg-white max-w-sm z-[52] shadow-2xl"
//             initial={{ x: "100%" }}
//             animate={{ x: 0 }}
//             exit={{ x: "100%" }}
//             transition={{ type: "spring", damping: 25, stiffness: 200 }}
//           >
//             <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
//               <Link to="/" onClick={closeMenu} className="text-2xl font-bold tracking-tight text-gray-900">
//                 Commun
//               </Link>
//               <motion.button
//                 onClick={closeMenu}
//                 className="text-gray-600"
//                 whileTap={{ scale: 0.9 }}
//               >
//                 <HiOutlineX size={24} />
//               </motion.button>
//             </div>

//             <div className="flex flex-col h-[calc(100%-73px)] overflow-y-auto">
//               <div className="flex-1 py-6 px-6 space-y-2">
//                 {navLinks.map((link, index) => (
//                   <motion.div
//                     key={link.to}
//                     initial={{ opacity: 0, x: 20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: index * 0.05 }}
//                   >
//                     <Link
//                       to={link.to}
//                       onClick={closeMenu}
//                       className={`block px-4 py-3 rounded-xl transition-all duration-300 font-medium ${location.pathname === link.to
//                           ? 'bg-gray-100 text-gray-900'
//                           : 'text-gray-600 hover:bg-gray-50'
//                         }`}
//                     >
//                       {link.text}
//                     </Link>
//                   </motion.div>
//                 ))}

//                 {/* **FIX 2: Corrected mobile links for logged-in users** */}
//                 {user && (
//                   <motion.div
//                     initial={{ opacity: 0, x: 20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: navLinks.length * 0.05 }}
//                   >
//                     <Link
//                       // Fixed: Added user._id to the path
//                       to={`/update-profile/${user._id}`}
//                       onClick={closeMenu}
//                       className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-300 font-medium"
//                     >
//                       Update Profile
//                     </Link>
//                   </motion.div>
//                 )}

//                 {/* Fixed: Added all role-specific links, matching desktop logic */}
//                 {user && user.role === 'customer' && (
//                   <motion.div
//                     initial={{ opacity: 0, x: 20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: (navLinks.length + 1) * 0.05 }}
//                   >
//                     <Link
//                       to="/become-provider"
//                       onClick={closeMenu}
//                       className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-300 font-medium"
//                     >
//                       Become Provider
//                     </Link>
//                   </motion.div>
//                 )}
//                 {user && user.role === 'provider' && (
//                   <motion.div
//                     initial={{ opacity: 0, x: 20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: (navLinks.length + 1) * 0.05 }}
//                   >
//                     <Link
//                       to="/update-services"
//                       onClick={closeMenu}
//                       className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-300 font-medium"
//                     >
//                       Update Services
//                     </Link>
//                   </motion.div>
//                 )}
//                 {user && user.role === 'admin' && (
//                   <motion.div
//                     initial={{ opacity: 0, x: 20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: (navLinks.length + 1) * 0.05 }}
//                   >
//                     <Link
//                       to="/admin"
//                       onClick={closeMenu}
//                       className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-300 font-medium"
//                     >
//                       Admin Dashboard
//                     </Link>
//                   </motion.div>
//                 )}

//               </div>

//               <div className="px-6 py-6 border-t border-gray-100 space-y-3">
//                 {!user ? (
//                   <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//                     <Link
//                       to="/login"
//                       onClick={closeMenu}
//                       className="block text-center text-white rounded-xl px-4 py-3 bg-gray-900 transition-all duration-300 shadow-lg font-semibold"
//                     >
//                       Login
//                     </Link>
//                   </motion.div>
//                 ) : (
//                   <motion.button
//                     onClick={handleLogout}
//                     className="block w-full text-center text-white rounded-xl px-4 py-3 bg-gray-900 transition-all duration-300 shadow-lg font-semibold"
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     Logout
//                   </motion.button>
//                 )}
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// export default Navbar;
 

import { useState, useEffect, useRef } from 'react';
import {
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineSearch,
  HiChevronDown,
  HiOutlineUserAdd,
  HiOutlineViewGrid,
  HiOutlineCog,
  HiOutlineUserCircle,
  HiOutlineLogout,
  HiOutlineHeart,
} from 'react-icons/hi';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/authSlice';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import SearchDropdown from './SearchDropdown';
import { getFullName, getFirstName, getInitials } from '../utils/userHelpers';

const Navbar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const wishlistIds = useSelector((s) => s.wishlist.ids);
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const desktopContains = desktopDropdownRef.current?.contains(event.target);
      const mobileContains = mobileDropdownRef.current?.contains(event.target);
      
      if (!desktopContains && !mobileContains) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
      closeMenu();
      setIsUserDropdownOpen(false);
    } catch (error) {
      toast.error(error || 'Logout failed');
    }
  };

  // Get user's first name and initial

  const navLinks = [
    { to: '/', text: 'Home' },
    { to: '/about', text: 'About' },
    { to: '/testimonials', text: 'Testimonials' },
    { to: '/faq', text: 'FAQ' },
    { to: '/contact', text: 'Contact' },
    { to: '/service', text: 'Service' },
    { to: '/category', text: 'Categories' },
  ];

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-xl z-[60] h-16 shadow-sm border-b border-gray-100"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {/* nav container uses min-w-0 so flex children can shrink without creating overflow */}
        <nav className="max-w-[1370px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          {/* Left: Logo */}
          <motion.div className="flex items-center min-w-0" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/"
              className="flex items-center gap-3 min-w-0"
            >
              {/* {user ? (
                <span className="truncate max-w-[220px] text-2xl font-bold text-gray-900">
                  Hi {getFirstName(user)},
                </span>
              ) : (
                <>
                  <img 
                    src="/logo2.png" 
                    alt="Commun" 
                    className="h-10 w-auto object-contain max-h-[50px]" 
                  />
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">CommuN</span>
                    <span className="text-xs text-gray-600 leading-tight">Connect. Discover. Thrive Local.</span>
                    <span>
                    <img 
                    src="/logo-text.png" 
                    alt="Commun" 
                    className="h-10 w-auto object-contain max-h-[50px]" 
                  />
                    </span>
                  </div>
                </>
              )} */}
                <>
                  <img 
                    src="/logo2.png" 
                    alt="Commun" 
                    className="h-10 w-auto object-contain max-h-[50px]" 
                  />
                  <div className="flex flex-col">
                    <span>
                    <img 
                    src="/logo-text.png" 
                    alt="Commun" 
                    className="h-10 w-auto object-contain max-h-[50px]" 
                  />
                    </span>
                  </div>
                </>
            </Link>
          </motion.div>

          {/* Center nav (only show on xl to avoid crowding smaller screens) */}
          {!user && (
            <div className="hidden xl:flex flex-1 justify-center items-center space-x-1 min-w-0">
              <div className="flex items-center space-x-1 overflow-hidden">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }}
                  >
                    <Link
                      to={link.to}
                      className={`relative px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-300 tracking-wide text-sm font-medium rounded-xl hover:bg-gray-50`}
                    >
                      {link.text}
                      {location.pathname === link.to && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full"
                          layoutId="navbar-indicator"
                          transition={{ duration: 0.25 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Right side - actions */}
          <div className="hidden xl:flex items-center gap-4 min-w-0">
            {/* Search */}
            <motion.div className="relative min-w-0" whileHover={{ scale: 1.02 }}>
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search services..."
                onClick={() => setIsSearchOpen(true)}
                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-10 pr-4 py-2.5 w-40 md:w-56 lg:w-64 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300"
                readOnly
              />
              <AnimatePresence>
                {isSearchOpen && (
                  <SearchDropdown
                    isOpen={isSearchOpen}
                    onClose={() => setIsSearchOpen(false)}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Auth / role buttons */}
            {!user ? (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/login"
                  className="px-5 py-2.5 bg-gray-900 text-white rounded-xl transition-all duration-300 shadow font-semibold text-sm hover:bg-gray-800"
                >
                  Login
                </Link>
              </motion.div>
            ) : (
              <div className="relative" ref={desktopDropdownRef}>
                <motion.button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Avatar */}
                  <div className="relative">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={getFullName(user)}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm border-2 border-gray-200">
                        {getInitials(user)}
                      </div>
                    )}
                  </div>
                  <HiChevronDown 
                    className={`text-gray-600 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                    size={18}
                  />
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                    >
                      {/* User Info Section */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt={getFullName(user)}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-base border-2 border-gray-200">
                                {getInitials(user)}
                              </div>
                            )}
                          </div>
                          {/* Name and Email */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {getFullName(user)}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1.5">
                      {user.role === 'customer' && (
                        <Link
                          to="/become-provider"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <HiOutlineUserAdd size={18} className="text-gray-500 flex-shrink-0" />
                          <span>Become Provider</span>
                        </Link>
                      )}
                      {user.role === 'provider' && (
                        <Link
                          to="/provider/dashboard"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <HiOutlineViewGrid size={18} className="text-gray-500 flex-shrink-0" />
                          <span>Provider Dashboard</span>
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <HiOutlineCog size={18} className="text-gray-500 flex-shrink-0" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      <Link
                        to={`/cart/${user._id}`}
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <HiOutlineHeart size={18} className="text-gray-500 flex-shrink-0" />
                        <span>Wishlist</span>
                        {/* {wishlistIds?.length > 0 && (
                          <span className="ml-auto bg-gray-900 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                            {wishlistIds.length}
                          </span>
                        )} */}
                      </Link>
                      <Link
                        to={`/update-profile/${user._id}`}
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <HiOutlineUserCircle size={18} className="text-gray-500 flex-shrink-0" />
                        <span>Update Profile</span>
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <HiOutlineLogout size={18} className="text-red-500 flex-shrink-0" />
                        <span>Logout</span>
                      </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile actions (shown on smaller than xl) */}
          <div className="flex items-center gap-4 xl:hidden">
            {user && (
              <div className="relative" ref={mobileDropdownRef}>
                <motion.button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Avatar */}
                  <div className="relative">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={getFullName(user)}
                        className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm border-2 border-gray-200">
                        {getInitials(user)}
                      </div>
                    )}
                  </div>
                  <HiChevronDown 
                    className={`text-gray-600 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                    size={18}
                  />
                </motion.button>

                {/* Dropdown Menu for Mobile */}
                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-[90]"
                    >
                      {/* User Info Section */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt={getFullName(user)}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-base border-2 border-gray-200">
                                {getInitials(user)}
                              </div>
                            )}
                          </div>
                          {/* Name and Email */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {getFullName(user)}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1.5">
                      {user.role === 'customer' && (
                        <Link
                          to="/become-provider"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            closeMenu();
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <HiOutlineUserAdd size={18} className="text-gray-500 flex-shrink-0" />
                          <span>Become Provider</span>
                        </Link>
                      )}
                      {user.role === 'provider' && (
                        <Link
                          to="/provider/dashboard"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            closeMenu();
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <HiOutlineViewGrid size={18} className="text-gray-500 flex-shrink-0" />
                          <span>Provider Dashboard</span>
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            closeMenu();
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <HiOutlineCog size={18} className="text-gray-500 flex-shrink-0" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      <Link
                        to={`/cart/${user._id}`}
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          closeMenu();
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <HiOutlineHeart size={18} className="text-gray-500 flex-shrink-0" />
                        <span>Wishlist</span>
                        {wishlistIds?.length > 0 && (
                          <span className="ml-auto bg-gray-900 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                            {wishlistIds.length}
                          </span>
                        )}
                      </Link>
                      <Link
                        to={`/update-profile/${user._id}`}
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          closeMenu();
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <HiOutlineUserCircle size={18} className="text-gray-500 flex-shrink-0" />
                        <span>Update Profile</span>
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <HiOutlineLogout size={18} className="text-red-500 flex-shrink-0" />
                        <span>Logout</span>
                      </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <motion.button
              className="text-gray-700 relative focus:outline-none"
              onClick={() => setIsMobileMenuOpen((s) => !s)}
              aria-label="Toggle menu"
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? <HiOutlineX size={26} /> : <HiOutlineMenu size={26} />}
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {/* Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="xl:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>

      {/* Slide-in menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            className="xl:hidden fixed top-0 right-0 bottom-0 w-full sm:w-[85%] max-w-sm bg-white z-[80] shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="flex items-center justify-between px-6 py-6 border-b">
              {/* <Link to="/" onClick={closeMenu} className="flex items-center gap-2">
                <img 
                  src="/logo2.png" 
                  alt="Commun" 
                  className="h-8 w-auto object-contain"
                />
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900 tracking-tight">CommuN</span>
                  <span className="text-xs text-gray-600 leading-tight">Connect. Discover. Thrive Local.</span>
                </div>
              </Link> */}
               <Link
              to="/"
              className="flex items-center gap-3 min-w-0"
            >
          
                <>
                  <img 
                    src="/logo2.png" 
                    alt="Commun" 
                    className="h-10 w-auto object-contain max-h-[50px]" 
                  />
                  <div className="flex flex-col">
                    {/* <span className="text-2xl font-bold text-gray-900 tracking-tight">CommuN</span>
                    <span className="text-xs text-gray-600 leading-tight">Connect. Discover. Thrive Local.</span> */}
                    <span>
                    <img 
                    src="/logo-text.png" 
                    alt="Commun" 
                    className="h-10 w-auto object-contain max-h-[50px]" 
                  />
                    </span>
                  </div>
                </>
          
            </Link>
              <motion.button onClick={closeMenu} className="text-gray-600" aria-label="Close menu">
                <HiOutlineX size={22} />
              </motion.button>
            </div>

            <div className="flex flex-col h-[calc(100%-73px)] overflow-y-auto">
              <div className="py-6 px-6 space-y-2">
              {user.role === 'admin' && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (navLinks.length + 2) * 0.04 }}>
                        <Link to="/admin" onClick={closeMenu} className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl">Admin Dashboard</Link>
                      </motion.div>
                    )}
                  {user.role === 'provider' && (
                      <>
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (navLinks.length + 2) * 0.04 }}>
                          <Link to="/provider/dashboard" onClick={closeMenu} className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl">Provider Dashboard</Link>
                        </motion.div>
                        {/* <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (navLinks.length + 3) * 0.04 }}>
                          <Link to="/update-services" onClick={closeMenu} className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl">Update Services</Link>
                        </motion.div> */}
                      </>
                    )}

                {navLinks.map((link, i) => (
                  <motion.div key={link.to} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <Link to={link.to} onClick={closeMenu} className={`block px-4 py-3 rounded-xl transition-all duration-200 font-medium ${location.pathname === link.to ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>
                      {link.text}
                    </Link>
                  </motion.div>
                ))}

                {user && (
                  <>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (navLinks.length + 1) * 0.04 }}>
                      <Link to={`/update-profile/${user._id}`} onClick={closeMenu} className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl">Update Profile</Link>
                    </motion.div>

                    {user.role === 'customer' && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (navLinks.length + 2) * 0.04 }}>
                        <Link to="/become-provider" onClick={closeMenu} className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl">Become Provider</Link>
                      </motion.div>
                    )}

                    {/* {user.role === 'provider' && (
                      <>
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (navLinks.length + 2) * 0.04 }}>
                          <Link to="/provider/dashboard" onClick={closeMenu} className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl">Provider Dashboard</Link>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (navLinks.length + 3) * 0.04 }}>
                          <Link to="/update-services" onClick={closeMenu} className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl">Update Services</Link>
                        </motion.div>
                      </>
                    )} */}

                    {/* {user.role === 'admin' && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (navLinks.length + 2) * 0.04 }}>
                        <Link to="/admin" onClick={closeMenu} className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl">Admin Dashboard</Link>
                      </motion.div>
                    )} */}
                  </>
                )}
              </div>

              <div className="px-6 py-6 border-t space-y-3">
                {!user ? (
                  <Link to="/login" onClick={closeMenu} className="block text-center text-white rounded-xl px-4 py-3 bg-gray-900 font-semibold">Login</Link>
                ) : (
                  <button onClick={handleLogout} className="block w-full text-center text-white rounded-xl px-4 py-3 bg-gray-900 font-semibold">Logout</button>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
