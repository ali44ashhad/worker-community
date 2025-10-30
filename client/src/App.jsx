import React from 'react'
import Navbar from './components/Navbar'
import { Routes,Route } from 'react-router-dom'
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

const App = () => {

  const dispatch=useDispatch();

  const isCheckingAuth = useSelector((state) => state.auth.isCheckingAuth);

  // const isCheckingAuth = true; 

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  if(isCheckingAuth){
    return < HomePageLoader></HomePageLoader>;
  }

  return (
    <div className=''>

      <Toaster></Toaster>

      <Navbar></Navbar>
      <Routes>
        <Route path='/' element={<Home></Home>}></Route>
        <Route path='/about' element={<About></About>}></Route>
        <Route path='/testimonials' element={<Testimonial></Testimonial>}></Route>
        <Route path='/faq' element={<FAQ></FAQ>}></Route>
        <Route path='/provider' element={<Providers></Providers>}></Route>
        <Route path='/login' element={<Login></Login>}></Route>
        <Route path='/become-provider' element={<BecomeProvider></BecomeProvider>}></Route>
        <Route path='/contact' element={<Contact></Contact>}></Route>
        <Route path='/update-profile' element={<UpdateProfile></UpdateProfile>}></Route>
        <Route path='/update-profile/:id' element={<UpdateProfile></UpdateProfile>}></Route>
        <Route path='/update-services' element={<UpdateServices></UpdateServices>}></Route>
        <Route path='/service' element={ <Services></Services> } ></Route>
        <Route path='/service/:id' element={ <SpecificService></SpecificService> } ></Route>
        <Route path='/provider/:id' element={<SpecificProvider></SpecificProvider>}></Route>
        <Route path='/category' element={<AllCategory></AllCategory>}></Route>
        <Route path='/category/:id' element={<SpecificCategory></SpecificCategory>}></Route>
        <Route path='/cart/:id' element={<Cart></Cart>}></Route>
      </Routes>

      <Footer></Footer>

    </div>
  )
}

export default App