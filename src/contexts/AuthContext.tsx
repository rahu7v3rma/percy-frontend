// AuthContext.tsx
import { createContext, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { login, register } from "@/store/auth/authThunk";
import { logout } from "@/store/auth/authSlice";

interface AuthContextType {
  user: {
    _id: string;
    username: string;
    email: string;
    role: "super-admin" | "client-admin" | "user";
    clientGroup?: {
      _id: string;
      name: string;
    } | string;
  } | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isClientAdmin: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const handleLogin = async (email: string, password: string) => {
    await dispatch(login({ email, password })).unwrap();
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleRegister = async (
    username: string,
    email: string,
    password: string
  ) => {
    await dispatch(register({ username, email, password })).unwrap();
  };

  const value = {
    user,
    isLoading: loading,
    isSuperAdmin: user?.role === "super-admin",
    isClientAdmin: user?.role === "client-admin",
    isAdmin: user?.role === "super-admin" || user?.role === "client-admin",
    isAuthenticated: user !== null,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
