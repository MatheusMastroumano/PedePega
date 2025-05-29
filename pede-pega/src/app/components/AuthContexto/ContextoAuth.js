// components/AuthContexto/ContextoAuth.js
"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Verificar se está no cliente (hidratação)
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Carregar token do localStorage apenas no cliente
  useEffect(() => {
    if (!isHydrated) return;

    try {
      const savedToken = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('userData');
      
      console.log('Carregando dados salvos:', { 
        hasToken: !!savedToken, 
        hasUser: !!savedUser 
      });

      if (savedToken) {
        // Verificar se o token não expirou
        try {
          const tokenData = JSON.parse(atob(savedToken.split('.')[1]));
          const now = Date.now() / 1000;
          
          if (tokenData.exp && tokenData.exp > now) {
            setToken(savedToken);
            setIsAuthenticated(true);
            
            if (savedUser) {
              setUser(JSON.parse(savedUser));
            }
            console.log('Token válido carregado');
          } else {
            console.log('Token expirado, removendo...');
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
          }
        } catch (err) {
          console.error('Erro ao verificar token:', err);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados de autenticação:', error);
    } finally {
      setLoading(false);
    }
  }, [isHydrated]);

  const login = (tokenData, userData) => {
    try {
      console.log('Fazendo login:', { hasToken: !!tokenData, hasUser: !!userData });
      
      setToken(tokenData);
      setUser(userData);
      setIsAuthenticated(true);
      
      if (isHydrated) {
        localStorage.setItem('authToken', tokenData);
        if (userData) {
          localStorage.setItem('userData', JSON.stringify(userData));
        }
      }
      
      console.log('Login realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };

  const logout = () => {
    try {
      console.log('Fazendo logout...');
      
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      if (isHydrated) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
      
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Função para verificar se o token ainda é válido
  const checkTokenValidity = () => {
    if (!token) return false;
    
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      
      if (tokenData.exp && tokenData.exp <= now) {
        console.log('Token expirado detectado');
        logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao verificar validade do token:', error);
      logout();
      return false;
    }
  };

  // Verificar se o usuário é administrador
  const isAdmin = () => {
    if (!user || !token) return false;
    
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      return tokenData.role === 'admin' || user.role === 'admin' || user.isAdmin === true;
    } catch (error) {
      console.error('Erro ao verificar role de admin:', error);
      return false;
    }
  };

  // Função para fazer requisições autenticadas
  const authenticatedFetch = async (url, options = {}) => {
    if (!checkTokenValidity()) {
      throw new Error('Token inválido ou expirado');
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log('Fazendo requisição autenticada para:', url);

    return fetch(url, {
      ...options,
      headers,
    });
  };

  const value = {
    token,
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    checkTokenValidity,
    authenticatedFetch,
    isHydrated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};