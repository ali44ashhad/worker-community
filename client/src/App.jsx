import React from 'react'
import Navbar from './components/Navbar'
import { Routes,Route, useLocation, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About' 
import FAQ from './pages/FAQ'
import Testimonials from './pages/Testimonials'
import Providers from './pages/Providers'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { checkAuth } from './features/authSlice'
import { Toaster } from 'react-hot-toast'
import HomePageLoader from './components/loaders/HomePageLoader'
import { useSelector } from 'react-redux'
import BecomeProvider from './pages/BecomeProvider'
import Contact from './pages/Contact'
import UpdateProfile from './pages/UpdateProfile'
import Services from './pages/Services'
import SpecificProvider from './pages/SpecificProvider'
import SpecificService from './pages/SpecificService'
import Footer from './components/Footer'
import AllCategory from './pages/AllCategory'
import SpecificCategory from './pages/SpecificCategory'
import Cart from './pages/Cart'
import KnowMoreProviders from './pages/KnowMoreProviders'
import KnowMoreSeekers from './pages/KnowMoreSeekers'
import TopServices from './pages/TopServices'
import TopCategories from './pages/TopCategories'
import { fetchWishlist } from './features/wishlistSlice'
import AdminLayout from './layouts/AdminLayout'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import UserProtectedRoute from './components/UserProtectedRoute'
import ProviderProtectedRoute from './components/ProviderProtectedRoute'
import Dashboard from './pages/admin/Dashboard'
import UpdateProviders from './pages/admin/UpdateProviders'
import AdminServices from './pages/admin/AdminServices'
import CategoryClicks from './pages/admin/CategoryClicks'
import ProviderClicks from './pages/admin/ProviderClicks'
import UserManagement from './pages/admin/UserManagement'
import CategoryManagement from './pages/admin/CategoryManagement'
import ProviderDashboard from './pages/provider/Dashboard'
import ManageServices from './pages/provider/ManageServices'
import EditService from './pages/provider/EditService'
import CreateService from './pages/provider/CreateService'
import ProviderLayout from './layouts/ProviderLayout'
import SecretaryProtectedRoute from './components/SecretaryProtectedRoute'
import SecretaryLayout from './layouts/SecretaryLayout'
import SecretaryDashboard from './pages/secretary/SecretaryDashboard'
import SecretaryApprovals from './pages/secretary/SecretaryApprovals'
import SecretaryMembers from './pages/secretary/SecretaryMembers'
import SecretaryBroadcast from './pages/secretary/SecretaryBroadcast'
import SecretaryEvents from './pages/secretary/SecretaryEvents'
import SecretaryServices from './pages/secretary/SecretaryServices'
import CommunityMgmt from './pages/admin/CommunityMgmt'
import InterestCommunities from './pages/interest/InterestCommunities'
import InterestCommunityChat from './pages/interest/InterestCommunityChat'
import SecretaryManagement from './pages/admin/SecretaryManagement'
import PendingApproval from './pages/PendingApproval'
import CommunityBroadcast from './pages/community/CommunityBroadcast'
import CommunityEvents from './pages/community/CommunityEvents'
import MemberProtectedRoute from './components/MemberProtectedRoute'
import ProviderAwareLayout from './components/ProviderAwareLayout'
import { fetchCommunityFeatures, clearCommunityFeatures } from './features/communitySlice'
import Terms from './pages/Terms'
import PrivacyPolicy from './pages/PrivacyPolicy'

const App = () => {

  const dispatch=useDispatch();
  const location = useLocation();

  const isCheckingAuth = useSelector((state) => state.auth.isCheckingAuth);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  // Fetch wishlist when user is authenticated
  useEffect(() => {
    const approved = !user || (user.accountStatus || 'approved') === 'approved';
    if (!isCheckingAuth && user && approved) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, user, isCheckingAuth])

  useEffect(() => {
    const approved = !user || (user.accountStatus || 'approved') === 'approved';
    const isMember = user && ['customer', 'provider'].includes(user.role);
    if (!isCheckingAuth && isMember && approved) {
      dispatch(fetchCommunityFeatures());
    } else if (!isCheckingAuth && !isMember) {
      dispatch(clearCommunityFeatures());
    }
  }, [dispatch, user, isCheckingAuth])

  if(isCheckingAuth){
    return <HomePageLoader fullScreen label="Loading CommuN…" sublabel="Checking your session." />;
  }

  
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isSecretaryRoute = location.pathname.startsWith('/secretary');
  const providerLayoutRoutes = [
    '/provider/dashboard',
    '/provider/manage-services',
    '/provider/update-profile',
  ];
  const customerPanelPaths = [
    '/community/update-profile',
    '/community/wishlist',
    '/community/become-provider',
    '/community/services',
    '/community/communities',
  ];
  const isMemberCommunityRoute =
    ['customer', 'provider'].includes(user?.role) &&
    (location.pathname.startsWith('/community/broadcast') ||
      location.pathname.startsWith('/community/events'));
  const isProviderLayoutRoute =
    providerLayoutRoutes.some((path) => location.pathname.startsWith(path)) ||
    (user?.role === 'provider' &&
      (isMemberCommunityRoute ||
        customerPanelPaths.some((path) => location.pathname.startsWith(path))));
  const isCustomerLayoutRoute =
    user?.role === 'customer' &&
    (isMemberCommunityRoute ||
      customerPanelPaths.some((path) => location.pathname.startsWith(path)));
  const hideGlobalChrome =
    isAdminRoute || isProviderLayoutRoute || isCustomerLayoutRoute || isSecretaryRoute;

  return (
    <div className=''>

      <Toaster></Toaster>

      {!hideGlobalChrome && <Navbar></Navbar>}
      <Routes>
        <Route path='/' element={<Home></Home>}></Route>
        <Route path='/about' element={<About></About>}></Route> 
        <Route path='/faq' element={<FAQ></FAQ>}></Route>
        <Route path='/testimonials' element={<Testimonials />} />
        <Route path='/terms' element={<Terms />} />
        <Route path='/privacy-policy' element={<PrivacyPolicy />} />
        <Route path='/provider' element={<Providers></Providers>}></Route>
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route path='/login' element={<Login></Login>}></Route>
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />
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
        <Route path='/cart' element={<Cart></Cart>}></Route>
        <Route path="/top-services" element={<TopServices />} />
        <Route path="/top-categories" element={<TopCategories />} />
        <Route path="/know-more/providers" element={<KnowMoreProviders />} />
        <Route path="/know-more/seekers" element={<KnowMoreSeekers />} />
        <Route
          path='/community/broadcast'
          element={
            <MemberProtectedRoute>
              <ProviderAwareLayout>
                <CommunityBroadcast />
              </ProviderAwareLayout>
            </MemberProtectedRoute>
          }
        />
        <Route
          path='/community/events'
          element={
            <MemberProtectedRoute>
              <ProviderAwareLayout>
                <CommunityEvents />
              </ProviderAwareLayout>
            </MemberProtectedRoute>
          }
        />
        <Route
          path='/community/update-profile'
          element={
            <MemberProtectedRoute>
              <ProviderAwareLayout>
                <UpdateProfile />
              </ProviderAwareLayout>
            </MemberProtectedRoute>
          }
        />
        <Route
          path='/community/wishlist'
          element={
            <MemberProtectedRoute>
              <ProviderAwareLayout>
                <Cart />
              </ProviderAwareLayout>
            </MemberProtectedRoute>
          }
        />
        <Route
          path='/community/services'
          element={
            <MemberProtectedRoute>
              <ProviderAwareLayout>
                <Services communityScope compact />
              </ProviderAwareLayout>
            </MemberProtectedRoute>
          }
        />
        <Route
          path='/community/become-provider'
          element={
            <MemberProtectedRoute>
              <ProviderAwareLayout>
                <BecomeProvider />
              </ProviderAwareLayout>
            </MemberProtectedRoute>
          }
        />
        <Route
          path='/community/communities'
          element={
            <MemberProtectedRoute>
              <ProviderAwareLayout>
                <InterestCommunities chatBasePath="/community/communities" />
              </ProviderAwareLayout>
            </MemberProtectedRoute>
          }
        />
        <Route
          path='/community/communities/:id/chat'
          element={
            <MemberProtectedRoute>
              <ProviderAwareLayout>
                <InterestCommunityChat listPath="/community/communities" />
              </ProviderAwareLayout>
            </MemberProtectedRoute>
          }
        />
        
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
          <Route path="category-clicks" element={<CategoryClicks />} />
          <Route path="provider-clicks" element={<ProviderClicks />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="secretaries" element={<SecretaryManagement />} />
          <Route path="communities" element={<CommunityMgmt />} />
          <Route path="update-profile" element={<UpdateProfile />} />
        </Route>

        <Route path="/secretary" element={<SecretaryProtectedRoute />}>
          <Route element={<SecretaryLayout />}>
            <Route index element={<Navigate to="/secretary/dashboard" replace />} />
            <Route path="dashboard" element={<SecretaryDashboard />} />
            <Route path="approvals" element={<SecretaryApprovals />} />
            <Route path="members" element={<SecretaryMembers />} />
            <Route path="broadcast" element={<SecretaryBroadcast />} />
            <Route path="events" element={<SecretaryEvents />} />
            <Route path="services" element={<SecretaryServices />} />
            <Route
              path="communities"
              element={<InterestCommunities chatBasePath="/secretary/communities" />}
            />
            <Route
              path="communities/:id/chat"
              element={<InterestCommunityChat listPath="/secretary/communities" />}
            />
            <Route path="update-profile" element={<UpdateProfile />} />
          </Route>
        </Route>
      </Routes>

      {!hideGlobalChrome && <Footer></Footer>}

    </div>
  )
}

export default App