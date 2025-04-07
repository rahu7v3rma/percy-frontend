import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { AppDispatch, RootState } from "@/store";
import { toast } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { googleLogin, login } from "@/store/auth/authThunk";
import {  } from "@/store/workspace/workspaceThunk";

const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Watch for user state changes and navigate accordingly
  useEffect(() => {

    console.log('user ---- ',user)
    if (user) {
      if (user.role === "super-admin" || user.role === "client-admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await dispatch(login(formData)).unwrap();
      // Navigation is handled by useEffect, no need to navigate here
    } catch (error) {
      // Error is already handled in the auth slice
    }
  };

  const REACT_APP_GOOGLE_CLIENT_ID = `423004632171-r6ej0tdn1vpda83ftr4qb6672u45b8vs.apps.googleusercontent.com`;

  const handleGoogleUserData = async (response) => {
    try {
      setGoogleLoading(true);
      const userData: any = jwtDecode(response.credential);

      const googleUserData: any = {
        firstName: userData.given_name,
        lastName: userData.family_name,
        email: userData.email,
        image: userData.picture,
        googleId: userData.sub,
        credential: response.credential,
      };

      await dispatch(googleLogin(googleUserData)).unwrap();

      // Dispatch action to handle Google login
      // await dispatch(googleLogin(googleUserData)).unwrap();
      // Navigation is handled by useEffect
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error("Failed to sign in with Google. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google sign in was unsuccessful. Please try again.");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-gradient">
          Welcome back
        </h1>
        <p className="text-gray-400">
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
              <Mail size={18} />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              className={cn(
                "pl-10 bg-black/30 border-gray-800 h-12 focus:ring-opal-500/40",
                "transition-all duration-300 focus:border-opal-500",
                "placeholder:text-gray-600"
              )}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          {/* <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Link
              to="/forgot-password"
              className="text-xs text-opal-400 hover:text-opal-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div> */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
              <KeyRound size={18} />
            </div>
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className={cn(
                "pl-10 pr-10 bg-black/30 border-gray-800 h-12 focus:ring-opal-500/40",
                "transition-all duration-300 focus:border-opal-500",
                "placeholder:text-gray-600"
              )}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            className="border-gray-600 data-[state=checked]:bg-opal-500 data-[state=checked]:border-opal-500"
          />
          <label
            htmlFor="remember-me"
            className="text-sm text-gray-400 cursor-pointer select-none"
          >
            Remember me
          </label>
        </div>

        <Button
          type="submit"
          className={cn(
            "w-full h-12 bg-opal-500 hover:bg-opal-600 text-white font-medium",
            "transition-all duration-300 shadow-lg hover:shadow-opal-500/25",
            "button-glow"
          )}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="h-5 w-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            <span>Sign in</span>
          )}
        </Button>

        <div className="relative my-6">
          <Separator className="bg-gray-800" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-background px-3 text-xs text-gray-500">
              OR CONTINUE WITH
            </span>
          </div>
        </div>

        {/* <div className="flex flex-1 justify-center">
          <GoogleOAuthProvider clientId={REACT_APP_GOOGLE_CLIENT_ID}>
            <motion.div
              className=" rounded-full shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
             
              {googleLoading ? (
                <div className="flex items-center justify-center bg-black text-white py-3 rounded-full">
                  <div className="h-5 w-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleUserData}
                  onError={handleGoogleError}
                  shape="pill"
                  size="large"
                  theme="filled_black"
                  text="sign_in_with"
                  useOneTap
                />
              )}
            </motion.div>
          </GoogleOAuthProvider> */}
          {/* <Button 
            type="button" 
            variant="outline" 
            className="border-gray-800 bg-black/30 hover:bg-black/50 text-white"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="border-gray-800 bg-black/30 hover:bg-black/50 text-white"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
            </svg>
            Facebook
          </Button> */}
        {/* </div> */}

        {/* <div className="text-center text-sm text-gray-500 mt-6">
          <span>Don't have an account?</span>{" "}
          <Link
            to="/signup"
            className="text-opal-400 hover:text-opal-300 font-medium transition-colors"
          >
            Sign up now
          </Link>
        </div> */}

        <div className="flex items-center justify-center mt-8 text-xs text-gray-600">
          <ShieldCheck size={14} className="mr-1" />
          <span>Your data is securely encrypted</span>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
