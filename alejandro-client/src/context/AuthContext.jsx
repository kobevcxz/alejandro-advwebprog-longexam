import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData, token) => {
    const normalizedUser = {
      ...userData,
      id: userData.id || userData._id,
      role: userData.role || userData.type || 'buyer',
    };

    setUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    if (token) {
      localStorage.setItem('token', token);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('firstName');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);