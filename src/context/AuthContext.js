import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    console.log('Tentative de connexion avec:', email, password); // DEBUG
    
    if (email === 'admin@imani.com' && password === 'Lothus@1111') {
        console.log('Connexion réussie!'); // DEBUG
        setIsAuthenticated(true);
        setUser({ email, name: 'Admin Imani' });
        return true;
    }
    
    console.log('Échec de connexion'); // DEBUG
    return false;
    };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};