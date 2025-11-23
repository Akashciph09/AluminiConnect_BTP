import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          const parsedUserData = JSON.parse(userData);
          // Attempt to fetch fresh profile from backend to include profileImage/profilePicture
          try {
            const resp = await axios.get('http://localhost:3002/api/users/profile', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const fullUser = {
              ...parsedUserData,
              profile: resp.data.profile || {},
              name: resp.data.name || parsedUserData.name,
              email: resp.data.email || parsedUserData.email,
              role: resp.data.role || parsedUserData.role,
            };
            setUser(fullUser);
            localStorage.setItem('userData', JSON.stringify(fullUser));
            setIsAuthenticated(true);
          } catch (err) {
            // If profile fetch fails, fall back to stored data
            console.warn('Could not fetch full profile during auth check, using stored userData', err.message);
            setUser(parsedUserData);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (userData) => {
    try {
      setError(null);
      console.log('Attempting registration with:', userData);
      
      if (!userData.name || !userData.email || !userData.password || !userData.role) {
        throw new Error('All fields are required');
      }

      const response = await axios.post('http://localhost:3002/api/auth/register', userData);
      console.log('Register response:', response.data);
      
      if (response.data.token && response.data.user) {
        const { token, user: newUser } = response.data;
        localStorage.setItem('token', token);
        // Try to fetch full profile
        try {
          const resp = await axios.get('http://localhost:3002/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const fullUser = { ...newUser, profile: resp.data.profile || {} };
          localStorage.setItem('userData', JSON.stringify(fullUser));
          setUser(fullUser);
          setIsAuthenticated(true);
          return { success: true, user: fullUser };
        } catch (err) {
          localStorage.setItem('userData', JSON.stringify(newUser));
          setUser(newUser);
          setIsAuthenticated(true);
          return { success: true, user: newUser };
        }
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Registration failed. Please try again.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post('http://localhost:3002/api/auth/login', {
        email,
        password
      });

      if (response.data.token && response.data.user) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        try {
          const resp = await axios.get('http://localhost:3002/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const fullUser = { ...user, profile: resp.data.profile || {} };
          localStorage.setItem('userData', JSON.stringify(fullUser));
          setUser(fullUser);
          setIsAuthenticated(true);
          return { success: true, user: fullUser };
        } catch (err) {
          localStorage.setItem('userData', JSON.stringify(user));
          setUser(user);
          setIsAuthenticated(true);
          return { success: true, user };
        }
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Login failed. Please try again.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Update user in context and localStorage (used after profile updates)
  const updateUser = (updatedUser) => {
    try {
      if (!updatedUser) return;
      const merged = { ...(user || {}), ...updatedUser };
      setUser(merged);
      localStorage.setItem('userData', JSON.stringify(merged));
    } catch (err) {
      console.warn('Failed to update user in context', err.message);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    updateUser,
    logout,
    isStudent: user?.role === 'student',
    isAlumni: user?.role === 'alumni'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 