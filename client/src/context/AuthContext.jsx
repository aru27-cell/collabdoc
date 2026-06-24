import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

// Step 1 — create the context
const AuthContext = createContext();

// Step 2 — Provider wraps the whole app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start — restore user from saved token
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
const res = await API.get('/auth/me');
          setUser(res.data);
        } catch {
          localStorage.clear();
        }
      }
      setLoading(false);
    };
    restore();
  }, []);

  // Called after successful login or register
const login = (userData, token) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userData)); // ← ADD THIS LINE
  setUser(userData);
};

  // Called when user clicks logout
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Step 3 — custom hook so any component can use auth
export const useAuth = () => useContext(AuthContext);
