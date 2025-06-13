"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Verificar se está no cliente (hidratação)
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Carregar token dos cookies apenas no cliente
  useEffect(() => {
    if (!isHydrated) return;

    const loadAuthData = async () => {
      try {
        const savedToken = Cookies.get('authToken');
        const savedUser = Cookies.get('userData');
        const savedIsAdmin = Cookies.get('isAdmin');
        
        console.log('Carregando dados salvos:', { 
          hasToken: !!savedToken, 
          hasUser: !!savedUser,
          savedIsAdmin: savedIsAdmin
        });

        if (savedToken) {
          // Verificar se o token não expirou (validação simples do JWT)
          try {
            const tokenData = JSON.parse(atob(savedToken.split('.')[1]));
            const now = Date.now() / 1000;
            
            if (tokenData.exp && tokenData.exp > now) {
              setToken(savedToken);
              setIsAuthenticated(true);
              
              if (savedUser) {
                const userData = JSON.parse(savedUser);
                setUser(userData);
                
                // Verificar se é admin baseado nos dados do usuário
                const userIsAdmin = userData?.tipo === 'admin' || savedIsAdmin === 'true';
                setIsAdmin(userIsAdmin);
                
                console.log('Dados do usuário:', userData);
                console.log('É admin?', userIsAdmin);
              }
              
              console.log('Token válido carregado');
            } else {
              console.log('Token expirado, removendo...');
              clearAuthData();
            }
          } catch (err) {
            console.error('Erro ao verificar token:', err);
            clearAuthData();
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados de autenticação:', error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    loadAuthData();
  }, [isHydrated]);

  // Função para limpar dados de autenticação
  const clearAuthData = () => {
    if (isHydrated) {
      Cookies.remove('authToken');
      Cookies.remove('userData');
      Cookies.remove('isAdmin');
    }
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  // Função para verificar privilégios de admin através do perfil do usuário
  const checkAdminPrivileges = async (authToken = token, userData = user) => {
    if (!authToken) return false;

    try {
      console.log('Verificando privilégios de admin...');
      
      // Primeiro, verificar se já temos os dados do usuário
      if (userData && userData.tipo === 'admin') {
        console.log('Usuário já identificado como admin pelos dados locais');
        setIsAdmin(true);
        if (isHydrated) {
          Cookies.set('isAdmin', 'true', { expires: 7 });
        }
        return true;
      }

      // Se não temos os dados ou não é admin, fazer uma verificação via API
      // Vamos tentar fazer uma requisição simples para verificar se o usuário tem acesso admin
      const response = await fetch('http://localhost:3001/api/admin/pedidos/ativos', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
      });

      const hasAdminPrivileges = response.ok;
      
      console.log('Privilégios de admin verificados via API:', hasAdminPrivileges);
      
      setIsAdmin(hasAdminPrivileges);
      
      if (isHydrated) {
        Cookies.set('isAdmin', hasAdminPrivileges.toString(), { expires: 7 });
      }
      
      return hasAdminPrivileges;
    } catch (error) {
      console.error('Erro ao verificar privilégios de admin:', error);
      setIsAdmin(false);
      if (isHydrated) {
        Cookies.remove('isAdmin');
      }
      return false;
    }
  };

  const login = async (tokenData, userData, skipAdminCheck = false) => {
    try {
      console.log('Fazendo login:', { hasToken: !!tokenData, hasUser: !!userData });
      
      setToken(tokenData);
      setUser(userData);
      setIsAuthenticated(true);
      
      if (isHydrated) {
        // Salvar nos cookies com expiração de 7 dias
        Cookies.set('authToken', tokenData, { expires: 7 });
        if (userData) {
          Cookies.set('userData', JSON.stringify(userData), { expires: 7 });
        }
      }

<<<<<<< Updated upstream
      // Verificar privilégios de admin após login
      if (!skipAdminCheck) {
        const userIsAdmin = userData?.tipo === 'admin';
        if (userIsAdmin) {
          setIsAdmin(true);
          if (isHydrated) {
            Cookies.set('isAdmin', 'true', { expires: 7 });
          }
        } else {
          await checkAdminPrivileges(tokenData, userData);
        }
=======
      // Verificar se é admin baseado no tipo do usuário
      const userIsAdmin = userData?.tipo === 'admin';
      setIsAdmin(userIsAdmin);
      if (isHydrated) {
        localStorage.setItem('isAdmin', userIsAdmin.toString());
>>>>>>> Stashed changes
      }
      
      console.log('Login realizado com sucesso');
      console.log('É admin?', userIsAdmin);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { success: false, error: error.message };
    }
  };

  const loginAsAdmin = async (tokenData, userData) => {
    try {
      console.log('Fazendo login como admin:', { hasToken: !!tokenData, hasUser: !!userData });
      
      setToken(tokenData);
      setUser(userData);
      setIsAuthenticated(true);
      
      if (isHydrated) {
        // Salvar nos cookies com expiração de 7 dias
        Cookies.set('authToken', tokenData, { expires: 7 });
        if (userData) {
          Cookies.set('userData', JSON.stringify(userData), { expires: 7 });
        }
      }

      // Verificar privilégios de admin
      let hasAdminPrivileges = false;
      
      // Primeiro verificar pelos dados do usuário
      if (userData && userData.tipo === 'admin') {
        hasAdminPrivileges = true;
        console.log('Usuário identificado como admin pelos dados do perfil');
      } else {
        // Se não, verificar via API
        hasAdminPrivileges = await checkAdminPrivileges(tokenData, userData);
      }
      
      if (!hasAdminPrivileges) {
        // Se não tem privilégios de admin, fazer logout
        logout();
        return { 
          success: false, 
          error: 'Usuário não possui privilégios de administrador' 
        };
      }
      
      setIsAdmin(true);
      if (isHydrated) {
        Cookies.set('isAdmin', 'true', { expires: 7 });
      }
      
      console.log('Login de admin realizado com sucesso');
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer login como admin:', error);
      logout();
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    try {
      console.log('Fazendo logout...');
      
      clearAuthData();
      
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

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Se receber 401, token pode estar expirado
    if (response.status === 401) {
      console.log('Token expirado ou inválido, fazendo logout...');
      logout();
      throw new Error('Token expirado');
    }

    // Se receber 403 em uma rota admin, atualizar status de admin
    if (response.status === 403 && url.includes('/admin/')) {
      console.log('Acesso negado para rota admin, atualizando status...');
      setIsAdmin(false);
      if (isHydrated) {
        Cookies.remove('isAdmin');
      }
    }

    return response;
  };

  // Função para fazer requisições de admin
  const adminFetch = async (url, options = {}) => {
    if (!isAdmin) {
      throw new Error('Usuário não possui privilégios de administrador');
    }
    
    return authenticatedFetch(url, options);
  };

  // Função para forçar rechecagem de privilégios de admin
  const recheckAdminStatus = async () => {
    if (!token) return false;
    return await checkAdminPrivileges();
  };

  const value = {
    token,
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    loginAsAdmin,
    logout,
    checkTokenValidity,
    authenticatedFetch,
    adminFetch,
    checkAdminPrivileges,
    recheckAdminStatus,
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