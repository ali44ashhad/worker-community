import React from 'react'
import Navbar from './components/Navbar'
import { Routes,Route, useLocation, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Testimonial from './pages/Testimonial'
import FAQ from './pages/FAQ'
import Providers from './pages/Providers'
import Login from './pages/Login'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { checkAuth } from './features/authSlice'
import { Toaster } from 'react-hot-toast'
import HomePageLoader from './components/loaders/HomePageLoader'
import { useSelector } from 'react-redux'
import BecomeProvider from './pages/BecomeProvider'
import Contact from './pages/Contact'
import UpdateProfile from './pages/UpdateProfile'
import UpdateServices from './pages/UpdateServices'
import Services from './pages/Services'
import SpecificProvider from './pages/SpecificProvider'
import SpecificService from './pages/SpecificService'
import Footer from './components/Footer'
import AllCategory from './pages/AllCategory'
import SpecificCategory from './pages/SpecificCategory'
import Cart from './pages/Cart'
import { fetchWishlist } from './features/wishlistSlice'
import AdminLayout from './layouts/AdminLayout'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import UserProtectedRoute from './components/UserProtectedRoute'
import ProviderProtectedRoute from './components/ProviderProtectedRoute'
import Dashboard from './pages/admin/Dashboard'
import UpdateProviders from './pages/admin/UpdateProviders'
import AdminServices from './pages/admin/AdminServices'
import ProviderDashboard from './pages/provider/Dashboard'
import ManageServices from './pages/provider/ManageServices'
import EditService from './pages/provider/EditService'
import CreateService from './pages/provider/CreateService'
import ProviderLayout from './layouts/ProviderLayout'

const App = () => {

  const dispatch=useDispatch();
  const location = useLocation();

  const isCheckingAuth = useSelector((state) => state.auth.isCheckingAuth);
  const user = useSelector((state) => state.auth.user);

  // const isCheckingAuth = true; 

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  // Fetch wishlist when user is authenticated
  useEffect(() => {
    if (!isCheckingAuth && user) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, user, isCheckingAuth])

  if(isCheckingAuth){
    return < HomePageLoader></HomePageLoader>;
  }

  
  const isAdminRoute = location.pathname.startsWith('/admin');
  const providerLayoutRoutes = [
    '/provider/dashboard',
    '/provider/manage-services',
    '/update-services',
    '/provider/update-profile'
  ];
  const isProviderLayoutRoute = providerLayoutRoutes.some((path) =>
    location.pathname.startsWith(path)
  );
  const hideGlobalChrome = isAdminRoute || isProviderLayoutRoute;

  return (
    <div className=''>

      <Toaster></Toaster>

      {!hideGlobalChrome && <Navbar></Navbar>}
      <Routes>
        <Route path='/' element={<Home></Home>}></Route>
        <Route path='/about' element={<About></About>}></Route>
        <Route path='/testimonials' element={<Testimonial></Testimonial>}></Route>
        <Route path='/faq' element={<FAQ></FAQ>}></Route>
        <Route path='/provider' element={<Providers></Providers>}></Route>
        <Route path='/login' element={<Login></Login>}></Route>
        <Route 
          path='/become-provider' 
          element={
            <UserProtectedRoute>
              <BecomeProvider></BecomeProvider>
            </UserProtectedRoute>
          }
        ></Route>
        <Route path='/contact' element={<Contact></Contact>}></Route>
        <Route path='/update-profile' element={<UpdateProfile></UpdateProfile>}></Route>
        <Route path='/update-profile/:id' element={<UpdateProfile></UpdateProfile>}></Route>
        <Route 
          path='/update-services' 
          element={
            <ProviderProtectedRoute>
              <ProviderLayout>
                <UpdateServices></UpdateServices>
              </ProviderLayout>
            </ProviderProtectedRoute>
          }
        ></Route>
        <Route
          path='/provider/manage-services'
          element={
            <ProviderProtectedRoute>
              <ProviderLayout>
                <ManageServices />
              </ProviderLayout>
            </ProviderProtectedRoute>
          }
        ></Route>
        <Route
          path='/provider/manage-services/new'
          element={
            <ProviderProtectedRoute>
              <ProviderLayout>
                <CreateService />
              </ProviderLayout>
            </ProviderProtectedRoute>
          }
        ></Route>
        <Route
          path='/provider/manage-services/:serviceId/edit'
          element={
            <ProviderProtectedRoute>
              <ProviderLayout>
                <EditService />
              </ProviderLayout>
            </ProviderProtectedRoute>
          }
        ></Route>
        <Route
          path='/provider/update-profile'
          element={
            <ProviderProtectedRoute>
              <ProviderLayout>
                <UpdateProfile></UpdateProfile>
              </ProviderLayout>
            </ProviderProtectedRoute>
          }
        ></Route>
        <Route
          path='/provider/dashboard'
          element={
            <ProviderProtectedRoute>
              <ProviderLayout>
                <ProviderDashboard />
              </ProviderLayout>
            </ProviderProtectedRoute>
          }
        ></Route>
        <Route path='/service' element={ <Services></Services> } ></Route>
        <Route path='/service/:id' element={ <SpecificService></SpecificService> } ></Route>
        <Route path='/provider/:id' element={<SpecificProvider></SpecificProvider>}></Route>
        <Route path='/category' element={<AllCategory></AllCategory>}></Route>
        <Route path='/category/:id' element={<SpecificCategory></SpecificCategory>}></Route>
        <Route path='/cart/:id' element={<Cart></Cart>}></Route>
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="providers" element={<UpdateProviders />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="update-profile" element={<UpdateProfile />} />
        </Route>
      </Routes>

      {!hideGlobalChrome && <Footer></Footer>}

    </div>
  )
}

export default App