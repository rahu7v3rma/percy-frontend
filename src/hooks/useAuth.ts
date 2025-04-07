import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, this would verify the JWT token and fetch user data
        const token = localStorage.getItem('token');
        if (!token) {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        // Mock user data for development
        const mockUser: User = {
          id: '1',
          name: 'Jenish Vaghasiya',
          email: 'jenish@example.com',
          role: 'admin',
        };

        setAuthState({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Mock successful login
      const mockUser: User = {
        id: '1',
        name: 'Jenish Vaghasiya',
        email,
        role: 'admin',
      };

      // Store token in localStorage (in a real app, this would be a JWT token)
      localStorage.setItem('token', 'mock-token');

      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return {
    ...authState,
    login,
    logout,
  };
}
