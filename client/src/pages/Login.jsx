import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Shield,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LoginUser } from "../apicalls/users";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      console.log(formData);
      const response = await LoginUser(formData);
      if (response.success) {
        toast.success(response.message || "Login successful! Welcome back.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        localStorage.setItem("token", response.token);
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else if (response.code === "USER_NOT_VERIFIED") {
        toast.warning("Please verify your email address to continue.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        navigate("/user-not-verified");
      } else {
        toast.error(
          response.message || "Login failed. Please check your credentials.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
        console.log(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Login failed. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-dvh w-full bg-gradient-to-bl from-black via-[#1e0b06] to-black text-white overflow-hidden">
      <div className="flex flex-col lg:flex-row min-h-dvh">
        <div className="lg:w-2/5 bg-black p-8 md:p-16 flex flex-col relative overflow-hidden border-r border-gray-800">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent"></div>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>

          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <h1
                className="text-4xl md:text-5xl font-bold cursor-pointer hover:text-blue-400 transition-colors"
                onClick={() => navigate("/")}
              >
                Electoral
              </h1>
            </div>

            <h2 className="text-2xl md:text-4xl font-semibold mb-6 leading-tight bg-gradient-to-r from-gray-300 via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Welcome Back to Your Blockchain Based Voting System
            </h2>

            <p className="text-gray-400 md:mb-12 mb-6 md:text-lg text-sm">
              Sign in to access your secure voting system and vote digitally
              with confidence under security of blockchain.
            </p>

            <div className="hidden md:block space-y-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mr-4 border border-blue-500/20">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-white">
                    Advanced Security
                  </h3>
                  <p className="text-gray-400 text-sm">
                    End-to-end encryption for all votes
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-teal-600/20 rounded-xl flex items-center justify-center mr-4 border border-green-500/20">
                  <Lock className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-white">
                    Secure Access
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Multi-layer authentication protection
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-xl flex items-center justify-center mr-4 border border-purple-500/20">
                  <CheckCircle className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-white">
                    Trusted Platform
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Used by millions worldwide
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-3/5 flex items-center justify-center px-12 py-16 bg-gray-900/30">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-white mb-2">Sign In</h3>
              <p className="text-gray-400">
                Enter your credentials to access your wallet
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-gray-400 backdrop-blur-sm ${
                    errors.email ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pr-12 bg-gray-800/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-gray-400 backdrop-blur-sm ${
                      errors.password ? "border-red-500" : "border-gray-600"
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>


              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Sign In
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                )}
              </button>

              <p className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="text-blue-400 hover:text-blue-300 hover:underline font-medium transition-colors"
                  onClick={() => navigate("/register")}
                >
                  Create one now
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
