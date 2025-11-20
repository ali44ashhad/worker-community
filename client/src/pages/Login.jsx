import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser, signupUser } from "../features/authSlice";
import { toast} from "react-hot-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const passwordRef = useRef(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let data;

      if (mode === "login") {
        data = await dispatch(
          loginUser({ email: formData.email, password: formData.password })
        ).unwrap();
      } else {
        data = await dispatch(signupUser(formData)).unwrap();
        console.log("SIGNUP USER DATA", data);
        
      }

      const success = Boolean(data?.success || data?.user);
      const message =
        data?.message ||
        (success
          ? mode === "login"
            ? "Login Successful!"
            : "Signup Successful!"
          : "Something went wrong!");

      if (success) {
        toast.success(message);

        const userRole = data?.user?.role;
        if (mode === "login") {
          if (userRole === "admin") {
            navigate('/admin/dashboard');
          } else if (userRole === "provider") {
            navigate('/provider/dashboard');
          } else {
            navigate('/');
          }
        } else {
          navigate('/');
        }
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error(error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex mt-20 items-center justify-center p-6 bg-gray-50">
      <motion.div 
        className="bg-white flex items-stretch w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left Image */}
    
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden self-stretch">
  <motion.img
    className="h-full w-full object-cover object-center"
    src="login.png"
    alt="leftSideImage"
    initial={{ scale: 1.05 }}
    animate={{ scale: 1 }}
    transition={{ duration: 0.6 }}
  />
</div>



        {/* Form Section */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12">
          <motion.form
            className="w-full max-w-md flex flex-col items-center justify-center"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 self-start mb-2 tracking-tight">
              {mode === "login" ? "Sign in" : "Sign up"}
            </h2>
            <p className="text-base text-gray-600 mb-8 self-start">
              {mode === "login"
                ? "Welcome back! Please sign in to continue"
                : "Create your account to get started"}
            </p>

            {/* Signup-only fields */}
            {mode === "signup" && (
              <>
                <div className="w-full mb-4">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition-all duration-300 text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="w-full mb-4">
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition-all duration-300 text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>

              </>
            )}

            {/* Email Input */}
            <div className="w-full mb-4">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition-all duration-300 text-gray-900 placeholder:text-gray-400"
                required
              />
            </div>

            {/* Password Input */}
            <div className="w-full mb-6 relative">
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition-all duration-300 text-gray-900 placeholder:text-gray-400"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <Eye size={20} />
                ) : (
                  <EyeOff size={20} />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="w-full py-3.5 rounded-xl text-white font-semibold bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-all duration-300 shadow-lg"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign In"
                : "Sign Up"}
            </motion.button>

            {/* Switch mode link */}
            <p className="text-gray-600 text-sm mt-6">
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <motion.span
                className="text-gray-900 font-semibold hover:underline cursor-pointer"
                onClick={() =>
                  setMode(mode === "login" ? "signup" : "login")
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </motion.span>
            </p>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
