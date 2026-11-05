
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  getCurrentUser,
  logoutUser,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check whether the user is already authenticated
  const checkAuth = useCallback(async () => {
    try {
      const response = await getCurrentUser();

      const storedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      const currentUser = {
        ...storedUser,
        ...response.user,
      };

      setUser(currentUser);
      localStorage.setItem("user", JSON.stringify(currentUser));

      return currentUser;
    } catch (error) {
      localStorage.removeItem("user");
      setUser(null);

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Update user after login or registration
  const refreshUser = async () => {
    return await checkAuth();
  };

  // Logout the authenticated user
  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
